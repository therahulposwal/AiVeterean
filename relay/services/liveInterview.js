const { 
  GoogleGenAI, 
  Modality, 
  Behavior,
  StartSensitivity,
  EndSensitivity,
  FunctionResponseScheduling 
} = require('@google/genai');
const jwt = require('jsonwebtoken');
const VeteranProfile = require('../models/VeteranProfile');

const { getSystemInstruction } = require('../config/interviewInstructions');

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
      fact: { type: "string", description: "Log any military detail, personal fact, or language preference mentioned by the user." }
    },
    required: ["fact"]
  }
};

const NOTE_TAKER_TOOL = [{ functionDeclarations: [logFactDeclaration] }];

async function handleInterviewConnection(ws, req) {
  console.log('🔌 New Client Connection...');

  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  const userName = url.searchParams.get('name') || "Soldier";
  const userRank = url.searchParams.get('rank') || "Veteran";
  const userArm = url.searchParams.get('arm') || "Trade";
  const userBranch = url.searchParams.get('branch') || "Army";
  const userUnit = url.searchParams.get('unit') || "Unit";

  if (!token) { ws.close(1008, "Token Required"); return; }

  let dbUserId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    dbUserId = decoded.userId;
    console.log(`✅ Verified: ${userName} (${dbUserId})`);
  } catch (err) { 
    ws.close(1008, "Invalid Token"); return; 
  }

  // --- CONTEXT FETCHING & EXPIRY CHECK ---
  let existingNotes = [];
  let previousSessionHandle = null; 

  try {
    const profile = await VeteranProfile.findById(dbUserId);
    existingNotes = profile ? profile.interviewNotes : [];
    
    // ✅ FIX: CHECK SESSION AGE
    if (profile && profile.lastSessionHandle && profile.lastSessionTs) {
        const sessionAgeMs = Date.now() - new Date(profile.lastSessionTs).getTime();
        const MAX_SESSION_AGE = 15 * 60 * 1000; // 15 Minutes

        if (sessionAgeMs < MAX_SESSION_AGE) {
            previousSessionHandle = profile.lastSessionHandle;
            console.log(`🔄 RESUMING ACTIVE SESSION (Age: ${Math.floor(sessionAgeMs/1000)}s)`);
        } else {
            console.log("⚠️ PREVIOUS SESSION EXPIRED. Starting Fresh.");
            // We intentionally leave previousSessionHandle as null
        }
    }
  } catch (err) { console.error("Error fetching profile:", err); }

  // --- SYSTEM PROMPT ---
  let contextInstruction = existingNotes.length > 0 
    ? `IMPORTANT: RESUMED SESSION. User details: ${existingNotes.join(", ")}.` 
    : `NEW SESSION.`;

  const baseInstruction = getSystemInstruction(userBranch, userArm, userRank, userName, userUnit, contextInstruction);

  const systemInstruction = `
    ${baseInstruction}
    ### CRITICAL BEHAVIORAL OVERRIDES:
    1. **STRICT SILENCE POLICY**: If the user is silent, **YOU MUST REMAIN SILENT**.
    2. **FORBIDDEN PHRASES**: NEVER say "I am awaiting your response", "Are you there?", or "Please continue".
    3. **WAITING IS GOOD**: It is perfectly fine to wait 10+ seconds for an answer. The user is thinking.
    4. **NO ECHOES**: If you hear a short noise or your own voice, IGNORE IT.
  `;

  console.log(`📝 Persona: ${userBranch} (${userArm})`);

  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let session = null;

  try {
    session = await ai.live.connect({
      model: MODEL_NAME,
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: systemInstruction,
        tools: NOTE_TAKER_TOOL,
        toolConfig: { functionCallingConfig: { mode: "AUTO" } }, 
        
        contextWindowCompression: { slidingWindow: {} },
        
        // Pass handle ONLY if it's valid
        sessionResumption: { handle: previousSessionHandle },

        speechConfig: { 
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
        },
        
        
        // realtimeInputConfig: {
        //     // automaticActivityDetection: {
        //     //     disabled: false, 
        //     //     prefixPaddingMs: 500, 
        //     //     silenceDurationMs: 2000,
        //     // }
        // },
      },
      callbacks: {
        onopen: () => console.log('🤖 VEER AI Connected & Listening...'),

        onmessage: async (msg) => {
          if (msg.serverContent?.modelTurn?.parts) {
            const parts = msg.serverContent.modelTurn.parts;
            for (const part of parts) {
              if (part.inlineData && part.inlineData.mimeType.startsWith('audio/pcm')) {
                if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(msg));
              }
              if (part.toolCall) {
                await handleToolCall(session, part.toolCall, dbUserId);
              }
            }
          }
          if (msg.toolCall) {
            await handleToolCall(session, msg.toolCall, dbUserId);
          }

          // ✅ SAVE NEW HANDLE + TIMESTAMP
          if (msg.sessionResumptionUpdate) {
             const update = msg.sessionResumptionUpdate;
             if (update.resumable && update.newHandle) {
                // Fire-and-forget save
                VeteranProfile.findByIdAndUpdate(dbUserId, {
                    lastSessionHandle: update.newHandle,
                    lastSessionTs: new Date() // <--- Saving Time
                }).catch(e => console.error("DB Error:", e));
             }
          }
        },

        onclose: () => {
            console.log('❌ Gemini Session Closed');
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({ type: "SYSTEM_DISCONNECT", message: "Connection lost." }));
            }
        },

        onerror: (e) => {
            console.error('🔥 Gemini Error:', e.message);
            if (ws.readyState === ws.OPEN) {
                ws.send(JSON.stringify({ type: "SYSTEM_ERROR", message: "Veer Error", details: e.message }));
            }
        },
      },
    });

    console.log("⚡ Sending Auto-Start Signal...");
    
    // Resume Logic
    if (!previousSessionHandle) {
        const startMessage = existingNotes.length > 0 
          ? `I am back. Let's continue.` 
          : `Hello, I am ready.`;
        await session.sendRealtimeInput({ text: startMessage });
    } else {
        console.log("🔄 Waking up resumed session...");
        await session.sendRealtimeInput({ 
            text: "SYSTEM: Connection restored. Briefly welcome the user back." 
        });
    }

  } catch (err) {
    console.error("Connection Failed:", err);
    ws.close();
    return;
  }

  ws.on('message', (data) => {
    if (!session) return;
    try {
      const msg = JSON.parse(data.toString());
      if (msg.realtime_input) {
        if (msg.realtime_input.media_chunks) {
          session.sendRealtimeInput({
            audio: {
              data: msg.realtime_input.media_chunks[0].data,
              mimeType: "audio/pcm;rate=16000"
            }
          });
        }
        if (msg.realtime_input.text) {
          session.sendRealtimeInput({ text: msg.realtime_input.text });
        }
      }
    } catch (e) { console.error("Parse Error", e); }
  });

  ws.on('close', () => {
    console.log('🔌 Client Disconnected');
    if (session) session.close();
  });
}

async function handleToolCall(session, toolCall, dbUserId) {
  // ... (Your tool call logic remains the same)
  console.log("⚙️ TOOL CALL RECEIVED");
  const functionCalls = toolCall.functionCalls;
  const functionResponses = [];

  for (const call of functionCalls) {
    if (call.name === "log_fact") {
      try {
        const args = call.args; 
        const fact = args.fact; 
        console.log(`📝 LOGGING FACT: "${fact}"`);

        functionResponses.push({
          id: call.id,
          name: call.name,
          response: {
            result: "ok", 
            scheduling: FunctionResponseScheduling.SILENT
          }
        });

        if (dbUserId) {
          VeteranProfile.findByIdAndUpdate(dbUserId, {
            $push: { interviewNotes: fact }
          }).then(() => console.log("✅ Saved to DB")).catch(e => console.error("DB Error:", e));
        }
      } catch (e) {
        functionResponses.push({
          id: call.id,
          name: call.name,
          response: { result: { error: e.message } }
        });
      }
    }
  }

  if (functionResponses.length > 0 && session) {
    await session.sendToolResponse({ functionResponses });
  }
}

module.exports = { handleInterviewConnection };