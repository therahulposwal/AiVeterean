const { GoogleGenAI, Modality, Type } = require('@google/genai');
const jwt = require('jsonwebtoken');
const { getTemplate } = require('../data/rankTemplates');
const VeteranProfile = require('../models/VeteranProfile');

// --- CONFIG ---
const MODEL_NAME = 'gemini-2.5-flash-native-audio-preview-12-2025';
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-this";

// --- TOOL DEFINITION ---
const logFactDeclaration = {
  name: "log_fact",
  description: "MANDATORY: Log any military detail, personal fact, or language preference mentioned by the user.",
  parameters: {
    type: Type.OBJECT,
    properties: {
      fact: {
        type: Type.STRING,
        description: "The extracted fact (e.g. 'Served in 15 RR', 'Prefers Hindi')"
      }
    },
    required: ["fact"]
  }
};

const NOTE_TAKER_TOOL = [{ functionDeclarations: [logFactDeclaration] }];

/**
 * Main WebSocket Handler
 */
async function handleInterviewConnection(ws, req) {
  console.log('🔌 New Client Connection...');

  // 1. EXTRACT PARAMS
  const url = new URL(req.url, `http://${req.headers.host}`);
  const token = url.searchParams.get('token');
  const userRank = url.searchParams.get('rank');
  const userArm = url.searchParams.get('arm');
  const userName = url.searchParams.get('name');

  if (!token) { ws.close(1008, "Token Required"); return; }

  // 2. VERIFY JWT
  let dbUserId;
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    dbUserId = decoded.userId;
    console.log(`✅ Verified: ${userName} (${dbUserId})`);
  } catch (err) { ws.close(1008, "Invalid Token"); return; }

  // 3. GET TEMPLATE
  let template;
  try {
    template = getTemplate(userRank, userArm, userName);
  } catch (err) {
    template = { systemInstruction: "You are a helpful AI." };
  }

  // 4. CONNECT TO GEMINI
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  let session;

  try {
    session = await ai.live.connect({
      model: MODEL_NAME,
      config: {
        responseModalities: [Modality.AUDIO],
        systemInstruction: template.systemInstruction,
        tools: NOTE_TAKER_TOOL,
        toolConfig: { functionCallingConfig: { mode: "AUTO" } },
        speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: "Kore" } } }
      },
      callbacks: {
        onopen: () => console.log('🤖 VEER AI Connected & Listening...'),

        onmessage: async (msg) => {
          if (msg.serverContent?.modelTurn?.parts) {
            const parts = msg.serverContent.modelTurn.parts;
            for (const part of parts) {

              // A. Forward Audio to Client
              if (part.inlineData && part.inlineData.mimeType.startsWith('audio/pcm')) {
                if (ws.readyState === ws.OPEN) {
                  ws.send(JSON.stringify(msg));
                }
              }

              // B. Handle Tool Calls
              if (part.toolCall) {
                console.log("⚙️ TOOL CALL RECEIVED");
                for (const call of part.toolCall.functionCalls) {
                  if (call.name === "log_fact") {
                    try {
                      const { fact } = call.args;
                      console.log(`📝 LOGGING: "${fact}"`);

                      // 1. Tell Gemini "OK" immediately
                      session.sendToolResponse({
                        functionResponses: [{
                          id: call.id,
                          name: call.name,
                          response: { result: { success: true } }
                        }]
                      });

                      // 2. Save to DB (Async)
                      if (dbUserId) {
                        VeteranProfile.findByIdAndUpdate(dbUserId, {
                          $push: { interviewNotes: fact }
                        }).catch(e => console.error("DB Write Error", e));
                      }
                    } catch (e) { console.error("Tool Logic Error:", e); }
                  }
                }
              }
            }
          }
        },
        onclose: () => console.log('❌ Gemini Session Closed'),
        onerror: (e) => console.error('🔥 Gemini Error:', e.message),
      },
    });

    // 5. AUTO-START (Kickoff)
    console.log("⚡ Sending Auto-Start Signal...");
    session.sendRealtimeInput({
      text: `Hello, I am ${userName || "Soldier"}. I am ready for the interview.`
    });

  } catch (err) {
    console.error("Connection Failed:", err);
    ws.close();
    return;
  }

  // 6. HANDLE CLIENT MESSAGES (Audio Input)
  ws.on('message', (data) => {
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
    } catch (e) { /* ignore */ }
  });

  ws.on('close', () => {
    console.log('🔌 Client Disconnected');
    // Important: Close Gemini session when user leaves to save tokens
    session.close();
  });
}

module.exports = { handleInterviewConnection };