const { 
  GoogleGenAI, 
  Modality, 
  Behavior,
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

const NOTE_TAKER_TOOL = [{functionDeclarations: [logFactDeclaration] }];

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

  // 1. Verify Token & Fetch Profile (SECURITY & DB INTEGRATION)
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    dbUserId = decoded.userId;
    
    // ✅ FETCH FROM DB (Single Source of Truth)
    userProfile = await VeteranProfile.findById(dbUserId);
    
    if (!userProfile) {
      console.error("❌ User not found in DB");
      ws.close(1008, "User Profile Not Found");
      return;
    }
    
    console.log(`✅ Verified & Loaded: ${userProfile.fullName} (${dbUserId})`);
    
  } catch (err) { 
    console.error("❌ Auth Error:", err.message);
    ws.close(1008, "Invalid Token"); 
    return; 
  }

  // 2. Extract Variables from DB Object (with defaults)
  const userName = userProfile.fullName || "Soldier";
  const userRank = userProfile.rank || "Veteran";
  const userArm = userProfile.arm || "Trade";
  const userBranch = userProfile.branch || "Armed Forces";
  const userUnit = userProfile.unitName || "Unit";

  // 3. Context Fetching & Session Expiry Check
  let existingNotes = userProfile.interviewNotes || []; 
  let previousSessionHandle = null; 

  if (userProfile.lastSessionHandle && userProfile.lastSessionTs) {
    const sessionAgeMs = Date.now() - new Date(userProfile.lastSessionTs).getTime();
    const MAX_SESSION_AGE = 15 * 60 * 1000; // 15 Minutes

    if (sessionAgeMs < MAX_SESSION_AGE) {
      previousSessionHandle = userProfile.lastSessionHandle;
      console.log(`🔄 RESUMING ACTIVE SESSION (Age: ${Math.floor(sessionAgeMs/1000)}s)`);
    } else {
      console.log("⚠️ PREVIOUS SESSION EXPIRED. Starting Fresh.");
      // We explicitly leave previousSessionHandle as null
    }
  }

  // 4. Construct System Instructions
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

  console.log(`📝 Persona: ${userBranch} (${userArm}) - ${userName}`);

  // 5. Initialize Gemini
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
        
        // Sliding window to save tokens/memory
        contextWindowCompression: { slidingWindow: {} },
        
        // Pass handle ONLY if it's valid (based on DB check above)
        sessionResumption: { handle: previousSessionHandle },

        speechConfig: { 
            voiceConfig: { prebuiltVoiceConfig: { voiceName: "Puck" } },
        }
      },
      callbacks: {
        onopen: () => console.log('🤖 VEER AI Connected & Listening...'),

        onmessage: async (msg) => {
          // Handle Audio Output
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
          // Handle Root Level Tool Calls
          if (msg.toolCall) {
            await handleToolCall(session, msg.toolCall, dbUserId);
          }

          // ✅ SAVE NEW SESSION HANDLE + TIMESTAMP TO DB
          if (msg.sessionResumptionUpdate) {
             const update = msg.sessionResumptionUpdate;
             if (update.resumable && update.newHandle) {
                // Fire-and-forget save to MongoDB
                VeteranProfile.findByIdAndUpdate(dbUserId, {
                    lastSessionHandle: update.newHandle,
                    lastSessionTs: new Date() // Updates timestamp for timeout logic
                }).catch(e => console.error("DB Save Handle Error:", e));
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
    
    // 6. Initial Greeting Logic
    if (!previousSessionHandle) {
        // Fresh Session
        const startMessage = existingNotes.length > 0 
          ? `I am back. Let's continue.` 
          : `Hello, I am ready.`;
        await session.sendRealtimeInput({ text: startMessage });
    } else {
        // Resumed Session
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

  // 7. WebSocket Incoming Message Handling
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

// 8. Tool Execution Logic (Saves to DB)
async function handleToolCall(session, toolCall, dbUserId) {
  console.log("⚙️ TOOL CALL RECEIVED");
  const functionCalls = toolCall.functionCalls;
  const functionResponses = [];

  for (const call of functionCalls) {
    if (call.name === "log_fact") {
      try {
        const args = call.args; 
        const fact = args.fact; 
        console.log(`📝 LOGGING FACT: "${fact}"`);

        // Send 'ok' back to Gemini immediately so it keeps talking
        functionResponses.push({
          id: call.id,
          name: call.name,
          response: {
            result: "ok", 
            scheduling: FunctionResponseScheduling.SILENT
          }
        });

        // ✅ SAVE NOTE TO DB
        if (dbUserId) {
          VeteranProfile.findByIdAndUpdate(dbUserId, {
            $push: { interviewNotes: fact }
          }).then(() => console.log("✅ Fact Saved to DB"))
            .catch(e => console.error("DB Fact Save Error:", e));
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