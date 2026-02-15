// websocket/interviewHandler.js

const { 
  GoogleGenAI, 
  Modality, 
  Behavior,
  FunctionResponseScheduling 
} = require('@google/genai');

const jwt = require('jsonwebtoken');
const VeteranProfile = require('../models/VeteranProfile');
const { getSystemInstruction } = require('../config/interviewInstructions');
const { STAGES, PHASE_ORDER } = require('../config/interviewStages');

// --- CONFIG ---
const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-12-2025';
const JWT_SECRET = process.env.JWT_SECRET;

// --- TOOL DEFINITION ---
const logFactDeclaration = {
  name: "log_fact",
  description: "Log any military detail or fact.",
  behavior: Behavior.NON_BLOCKING,
  parameters: {
    type: "object",
    properties: {
      fact: {
        type: "string",
        description: "Log any military detail, personal fact, or language preference mentioned by the user."
      }
    },
    required: ["fact"]
  }
};

const NOTE_TAKER_TOOL = [{ functionDeclarations: [logFactDeclaration] }];

// --- SIMPLE PHASE STATE ---
class PhaseController {
  constructor(initialPhase = 'FOUNDATION', initialCount = 0) {
    // ✅ FIX 1: Initialize with saved data from DB (prevents memory loss on refresh)
    this.currentPhase = PHASE_ORDER.includes(initialPhase) ? initialPhase : 'FOUNDATION';
    this.appointmentCount = initialCount || 0;
    console.log(`📊 PhaseController initialized: Phase=${this.currentPhase}, Appointments=${this.appointmentCount}`);
  }

  getCurrentPhaseInfo() {
    const phaseIndex = PHASE_ORDER.indexOf(this.currentPhase);
    const stageInfo = STAGES[this.currentPhase];
    
    return {
      currentPhase: this.currentPhase,
      phaseName: stageInfo.name,
      phaseDescription: stageInfo.description || '',
      phaseNumber: phaseIndex + 1,
      totalPhases: PHASE_ORDER.length,
      canGoBack: phaseIndex > 0,
      canGoNext: phaseIndex < PHASE_ORDER.length - 1,
      appointmentCount: this.appointmentCount
    };
  }

  goToNextPhase() {
    const currentIndex = PHASE_ORDER.indexOf(this.currentPhase);
    
    if (currentIndex < PHASE_ORDER.length - 1) {
      // Increment appointment count when leaving APPOINTMENT_WRAP
      if (this.currentPhase === 'APPOINTMENT_WRAP') {
        this.appointmentCount++;
        console.log(`✅ Completed Appointment #${this.appointmentCount}`);
      }
      
      this.currentPhase = PHASE_ORDER[currentIndex + 1];
      console.log(`➡️ Moved to: ${this.currentPhase} (Total Appointments: ${this.appointmentCount})`);
      return true;
    }
    
    return false;
  }

  goToPreviousPhase() {
    const currentIndex = PHASE_ORDER.indexOf(this.currentPhase);
    
    if (currentIndex > 0) {
      this.currentPhase = PHASE_ORDER[currentIndex - 1];
      console.log(`⬅️ Moved back to: ${this.currentPhase}`);
      return true;
    }
    
    return false;
  }

  goToPhase(phaseName) {
    if (PHASE_ORDER.includes(phaseName)) {
      // Special handling: If jumping from WRAP back to DEEP_DIVE, increment appointment count
      if (this.currentPhase === 'APPOINTMENT_WRAP' && phaseName === 'APPOINTMENT_DEEP_DIVE') {
        this.appointmentCount++;
        console.log(`🔄 Starting Appointment #${this.appointmentCount + 1} (jumped back from WRAP)`);
      }
      
      this.currentPhase = phaseName;
      console.log(`🎯 Jumped to: ${this.currentPhase}`);
      return true;
    }
    return false;
  }

  reset() {
    this.currentPhase = 'FOUNDATION';
    this.appointmentCount = 0;
  }
}

async function handleInterviewConnection(ws, req) {
  console.log('🔌 New Client Connection...');

  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');

  if (!token) {
    ws.close(1008, "Token Required");
    return;
  }

  let dbUserId;
  let userProfile;

  // --- AUTH & PROFILE ---
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded || typeof decoded !== 'object') {
      ws.close(1008, "Invalid Token");
      return;
    }

    const tokenType = decoded.tokenType;
    if (tokenType && tokenType !== 'session' && tokenType !== 'relay') {
      ws.close(1008, "Invalid Token Type");
      return;
    }

    if (tokenType === 'relay' && decoded.aud !== 'relay') {
      ws.close(1008, "Invalid Relay Token");
      return;
    }

    dbUserId = decoded.userId || decoded.sub;
    if (!dbUserId) {
      ws.close(1008, "Invalid Token Claims");
      return;
    }

    userProfile = await VeteranProfile.findById(dbUserId);
    if (!userProfile) {
      ws.close(1008, "User Profile Not Found");
      return;
    }

    console.log(`✅ Verified: ${userProfile.fullName}`);
  } catch (err) {
    console.error("❌ Auth Error:", err.message);
    ws.close(1008, "Invalid Token");
    return;
  }

  // --- USER DATA ---
  const userName   = userProfile.fullName || "Soldier";
  const userRank   = userProfile.rank || "Veteran";
  const userArm    = userProfile.arm || "Trade";
  const userBranch = userProfile.branch || "Armed Forces";
  const userUnit   = userProfile.unitName || "Unit";

  // --- CONTEXT ---
  const existingNotes = userProfile.interviewNotes || [];

  const contextInstruction = existingNotes.length
    ? `IMPORTANT: RESUMED SESSION. Known facts: ${existingNotes.join(", ")}`
    : `NEW SESSION.`;

  const baseInstruction = getSystemInstruction(
    userBranch,
    userArm,
    userRank,
    userName,
    userUnit,
    contextInstruction
  );

  // --- INITIALIZE PHASE CONTROLLER (must be before system instruction) ---
  // ✅ FIX 2: Load saved phase from DB so refresh doesn't reset progress
  const savedPhase = userProfile.interviewPhase || 'FOUNDATION';
  const savedAppointmentCount = userProfile.appointmentCount || 0;
  const phaseController = new PhaseController(savedPhase, savedAppointmentCount);
  console.log(`🧭 Starting Phase: ${phaseController.currentPhase} (Loaded from DB)`);

  // Build system instruction with ONLY current phase context
  const currentPhaseInstruction = STAGES[phaseController.currentPhase].instruction;
  
  const systemInstruction = `
${baseInstruction}

### CRITICAL BEHAVIORAL RULES (ABSOLUTE - NEVER VIOLATE)

1. ONE QUESTION AT A TIME - Ask one question, WAIT for complete answer, THEN ask next
2. WAIT FOR USER TO FINISH SPEAKING - Never call log_fact while user is still talking
3. NEVER STACK QUESTIONS - Asking about unit AND role AND duration is FORBIDDEN
4. NEVER SELF-ANSWER - Do NOT provide examples or continue after asking a question
5. SILENCE IS GOOD - If user is silent, stay silent. Don't prompt them
6. FOLLOW CURRENT OBJECTIVE PRECISELY - Do exactly what the phase instruction says

### YOUR CURRENT OBJECTIVE
${currentPhaseInstruction}

### WHEN YOU COMPLETE YOUR OBJECTIVE
Say: "I have all the information I need for this section. Please click the 'Next Phase' button to continue."
Then STOP and wait silently. Do not ask any further questions.

### REMINDER: QUESTION FLOW
Ask question → STOP → Wait → User answers → Log facts → Ask next question
NEVER: Ask question and provide examples or continue talking
`;

  console.log(`🎯 AI Context: ONLY ${phaseController.currentPhase} phase (no future phase knowledge)`);

  // --- GEMINI INIT ---
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let session = null;
  
  // ✅ FIX 3: AUDIO BUFFER (Prevents "Deafness" - queues audio sent during connection)
  let messageQueue = [];
  let isSessionReady = false;

  try {
    session = await ai.live.connect({
      model: MODEL_NAME,
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction,
        tools: NOTE_TAKER_TOOL,
        toolConfig: { functionCallingConfig: { mode: "AUTO" } },
        contextWindowCompression: { slidingWindow: {} },
        speechConfig: {
          voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } }
        }
      },
      callbacks: {
        onopen: () => {
          console.log("🤖 VEER AI Connected");
          
          // Send initial phase info to client
          if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({
              type: "PHASE_UPDATE",
              ...phaseController.getCurrentPhaseInfo()
            }));
          }
        },

        onmessage: async (msg) => {
          if (msg.serverContent?.modelTurn?.parts) {
            for (const part of msg.serverContent.modelTurn.parts) {
              if (part.inlineData?.mimeType?.startsWith("audio/pcm")) {
                if (ws.readyState === ws.OPEN) {
                  ws.send(JSON.stringify(msg));
                }
              }
              if (part.toolCall) {
                await handleToolCall(part.toolCall);
              }
            }
          }

          if (msg.toolCall) {
            await handleToolCall(msg.toolCall);
          }
        },

        onclose: () => console.log("❌ Gemini Closed"),
        onerror: (e) => console.error("🔥 Gemini Error:", e.message)
      }
    });

    // ✅ FIX 4: FLUSH BUFFER (Send audio that user spoke while connecting)
    isSessionReady = true;
    if (messageQueue.length > 0) {
      console.log(`🚀 Flushing ${messageQueue.length} buffered audio chunks...`);
      for (const qMsg of messageQueue) {
        await session.sendRealtimeInput(qMsg);
      }
      messageQueue = [];
    }

    // Initial greeting trigger
    await session.sendRealtimeInput({ text: "Hello. I am ready to begin the interview." });

  } catch (err) {
    console.error("❌ Connection Failed:", err);
    ws.close();
    return;
  }

  // --- TOOL HANDLER ---
  async function handleToolCall(toolCall) {
    const functionResponses = [];

    for (const call of toolCall.functionCalls) {
      if (call.name === "log_fact") {
        const fact = call.args.fact;
        
        console.log(`📝 "${fact}" | Phase=${phaseController.currentPhase} | Apt#${phaseController.appointmentCount}`);

        // Save to database
        if (dbUserId) {
          VeteranProfile.findByIdAndUpdate(
            dbUserId,
            { $push: { interviewNotes: fact } }
          ).catch(e => console.error("DB Error:", e));
        }

        // Silent acknowledgment
        functionResponses.push({
          id: call.id,
          name: call.name,
          response: { result: "logged", scheduling: FunctionResponseScheduling.SILENT }
        });
      }
    }

    // Send function responses
    if (session && functionResponses.length > 0) {
      await session.sendToolResponse({ functionResponses });
    }
  }

  // --- PHASE TRANSITION HANDLER ---
  async function handlePhaseTransition(action, targetPhase = null) {
    let transitioned = false;
    const previousPhase = phaseController.currentPhase;
    
    if (action === 'next') {
      transitioned = phaseController.goToNextPhase();
    } else if (action === 'previous') {
      transitioned = phaseController.goToPreviousPhase();
    } else if (action === 'jump' && targetPhase) {
      transitioned = phaseController.goToPhase(targetPhase);
    }
    
    if (transitioned && session) {
      const phaseInfo = phaseController.getCurrentPhaseInfo();
      const newPhaseInstruction = STAGES[phaseController.currentPhase].instruction;
      
      console.log(`🔀 PHASE TRANSITION: ${previousPhase} → ${phaseController.currentPhase} (Appointment #${phaseController.appointmentCount})`);
      
      // ✅ FIX 5: SAVE STATE TO DB IMMEDIATELY (prevents memory loss on refresh)
      try {
        await VeteranProfile.findByIdAndUpdate(dbUserId, {
          interviewPhase: phaseController.currentPhase,
          appointmentCount: phaseController.appointmentCount
        });
        console.log(`💾 Saved to DB: Phase=${phaseController.currentPhase}, Appointments=${phaseController.appointmentCount}`);
      } catch (dbErr) {
        console.error('❌ DB Save Error:', dbErr.message);
      }
      
      // Send updated phase info to client
      if (ws.readyState === ws.OPEN) {
        ws.send(JSON.stringify({
          type: "PHASE_UPDATE",
          ...phaseInfo
        }));
      }
      
      // REPLACE AI's context with new phase (AI forgets previous phase instructions)
      const contextReplacementMessage = `[CONTEXT UPDATE]

Your previous task is complete. You now have a NEW objective:

${newPhaseInstruction}

CRITICAL REMINDERS:
1. Ask ONE question at a time - never stack multiple questions together
2. Wait for user to COMPLETELY FINISH speaking before calling log_fact
3. DO NOT self-answer - do not provide examples or continue after asking
4. After asking a question, STOP and WAIT in complete silence
5. After user answers, log the facts, THEN ask your next question

WHEN YOU COMPLETE THIS OBJECTIVE:
Say: "I have all the information I need for this section. Please click the 'Next Phase' button to continue."
Then STOP and wait silently.
${phaseController.currentPhase === 'APPOINTMENT_DEEP_DIVE' ? `\nNote: This is appointment ${phaseController.appointmentCount + 1}.` : ''}
${phaseController.currentPhase === 'APPOINTMENT_WRAP' ? `\nNote: When done, inform the user they can add another appointment or continue to career review.` : ''}
${phaseController.currentPhase === 'CLOSING' ? `\nNote: This is the final section. When done, say: "Please click the 'Complete Interview & Generate Profile' button to finish."` : ''}
`;

      await session.sendRealtimeInput({ text: contextReplacementMessage });
      
      console.log(`✅ AI Context REPLACED with: ${phaseController.currentPhase} (no knowledge of other phases)`);
    }
    
    return transitioned;
  }

  // --- WS INPUT ---
  ws.on('message', async (data) => {
    if (!session) return;
    try {
      const msg = JSON.parse(data.toString());
      
      // Handle phase control messages
      if (msg.type === "PHASE_CONTROL") {
        await handlePhaseTransition(msg.action, msg.targetPhase);
        return;
      }
      
      // Handle audio input
      if (msg.realtime_input?.media_chunks) {
        const audioInput = {
          audio: {
            data: msg.realtime_input.media_chunks[0].data,
            mimeType: "audio/pcm;rate=16000"
          }
        };
        
        // ✅ FIX 6: USE BUFFER LOGIC (prevents connection deafness)
        if (isSessionReady && session) {
          session.sendRealtimeInput(audioInput);
        } else {
          // Queue audio if AI isn't ready yet
          messageQueue.push(audioInput);
          console.log(`📦 Buffered audio chunk (Queue size: ${messageQueue.length})`);
        }
      }
      
      // Handle text input
      if (msg.realtime_input?.text) {
        const textInput = { text: msg.realtime_input.text };
        
        // Also buffer text messages
        if (isSessionReady && session) {
          session.sendRealtimeInput(textInput);
        } else {
          messageQueue.push(textInput);
          console.log(`📦 Buffered text input (Queue size: ${messageQueue.length})`);
        }
      }
    } catch (e) {
      console.error("Parse Error", e);
    }
  });

  ws.on('close', () => {
    console.log("🔌 Client Disconnected");
    if (session) session.close();
  });
}

module.exports = { handleInterviewConnection };
