"use client";
import { useState, useRef, useEffect } from 'react';
import { 
    Mic, 
    MicOff, 
    LogOut, 
    ShieldCheck, 
    FileText, 
    Volume2, 
    Sparkles, 
    AlertTriangle, 
    RefreshCw,
    Loader2
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InterviewViewProps {
  token: string | null;
  onFinish: () => void;
}

export default function InterviewView({ token, onFinish }: InterviewViewProps) {
  const router = useRouter();

  // --- LOCAL STATE ---
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // --- REFS ---
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const pingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // ✅ THE CRITICAL FLAG: Tracks if AI is currently outputting sound
  const isAiSpeakingRef = useRef(false);
  
  // ✅ NEW FLAG: Tracks if we are intentionally submitting so we ignore disconnect errors
  const isSubmittingRef = useRef(false);

  // --- CLEANUP ---
  useEffect(() => {
    return () => {
      stopRecording();
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      socketRef.current?.close();
      audioContextRef.current?.close();
    };
  }, []);

  // --- WEBSOCKET & AUDIO LOGIC ---
  const connectToRelay = async () => {
    if (socketRef.current || isConnecting) return;
    
    setIsConnecting(true);
    setErrorMessage(null);
    isSubmittingRef.current = false; // Reset submission flag on new connection

    // 1. Token Cleanup & Validation
    let cleanToken = token;
    if (!cleanToken) {
       cleanToken = localStorage.getItem('veteran_token');
    }

    if (!cleanToken) {
        setErrorMessage("Authentication missing. Please log in.");
        setIsConnecting(false);
        return;
    }

    cleanToken = cleanToken.replace('Bearer ', '').replace(/^"|"$/g, '');

    // 2. Initialize Audio Engine
    try {
        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        if (audioContextRef.current.state === 'suspended') {
            await audioContextRef.current.resume();
        }
    } catch (e) {
        console.error("Audio Context Error", e);
    }

    // 3. Construct Secure URL
    const RELAY_HOST = process.env.NEXT_PUBLIC_RELAY_HOST || 'localhost:8080';
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const wsUrl = `${protocol}://${RELAY_HOST}?token=${cleanToken}`;

    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      console.log("✅ Connected to Relay");
      setIsConnected(true);
      setIsConnecting(false);
      
      setAiSpeaking(true); 
      isAiSpeakingRef.current = true; 
      startRecording(); 

      // Keep-Alive Ping
      pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
              ws.send(JSON.stringify({ type: "ping" }));
          }
      }, 30000);
    };
    
    ws.onclose = (event) => {
      // ✅ FIX: If we are intentionally submitting, ignore the close event entirely
      if (isSubmittingRef.current) {
          console.log("✅ Intentional disconnect for submission");
          return;
      }

      console.log("❌ Connection Closed:", event.code, event.reason);
      setIsConnected(false);
      setIsConnecting(false);
      setIsRecording(false);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      
      if (event.code === 1008) {
         alert("Session Expired or Invalid. Please log in again.");
         router.push('/login');
      } else if (event.code !== 1000) {
         setErrorMessage("Connection lost. Please retry.");
      }
      stopRecording();
      socketRef.current = null;
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "SYSTEM_ERROR") {
           let msg = data.message;
           if (data.details && data.details.includes("429")) {
               msg = "Server is busy (Rate Limit). Please wait 1 minute.";
           }
           setErrorMessage(msg);
           stopRecording();
           setIsConnected(false);
           setIsConnecting(false);
           if (socketRef.current) socketRef.current.close();
           return;
        }

        if (data.type === "SYSTEM_DISCONNECT") {
           setErrorMessage("Disconnected by server.");
           stopRecording();
           return;
        }

        if (data.serverContent?.modelTurn?.parts) {
          const parts = data.serverContent.modelTurn.parts;
          for (const part of parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('audio/pcm')) {
              playPcmAudio(part.inlineData.data);
            }
          }
        }
      } catch (e) { /* ignore */ }
    };
    socketRef.current = ws;
  };

  const playPcmAudio = (base64String: string) => {
    try {
      if (!audioContextRef.current) return;

      const ctx = audioContextRef.current;
      const binaryString = atob(base64String);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) { bytes[i] = binaryString.charCodeAt(i); }

      const float32Data = new Float32Array(bytes.length / 2);
      const dataView = new DataView(bytes.buffer);
      for (let i = 0; i < bytes.length / 2; i++) {
        float32Data[i] = dataView.getInt16(i * 2, true) / 32768.0;
      }

      const buffer = ctx.createBuffer(1, float32Data.length, 24000);
      buffer.getChannelData(0).set(float32Data);

      const currentTime = ctx.currentTime;
      if (nextStartTimeRef.current < currentTime) nextStartTimeRef.current = currentTime + 0.05;

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;
      
      isAiSpeakingRef.current = true;
      setAiSpeaking(true);
      
      source.onended = () => {
         if (ctx.currentTime >= nextStartTimeRef.current - 0.1) {
            setTimeout(() => {
                isAiSpeakingRef.current = false;
                setAiSpeaking(false);
            }, 100);
         }
      };
    } catch (err) { console.error("Audio Error", err); }
  };

  const startRecording = async () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true } 
      });
      streamRef.current = stream;
      
      const recContext = new AudioContext({ sampleRate: 16000 });
      if (recContext.state === 'suspended') await recContext.resume();

      await recContext.audioWorklet.addModule('/audio-processor.js');
      
      const source = recContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(recContext, 'pcm-processor');
      workletNodeRef.current = workletNode;
      
      workletNode.port.onmessage = (event) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        if (isAiSpeakingRef.current) return; 

        const base64Audio = btoa(new Uint8Array(event.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        socketRef.current.send(JSON.stringify({ realtime_input: { media_chunks: [{ mime_type: "audio/pcm", data: base64Audio }] } }));
      };
      
      source.connect(workletNode);
      workletNode.connect(recContext.destination); 
      setIsRecording(true);
    } catch (err) { 
        console.error("Mic Error", err); 
        setErrorMessage("Microphone access failed.");
    }
  };

  const stopRecording = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (workletNodeRef.current) workletNodeRef.current.disconnect();
    setIsRecording(false);
  };

  const handleFinishWrapper = async () => {
    // ✅ FIX: Mark that we are intentionally closing the connection
    isSubmittingRef.current = true;
    setErrorMessage(null); // Clear any lingering errors

    stopRecording();
    
    if (socketRef.current) { 
        // Close with a Normal closure code just to be clean
        socketRef.current.close(1000, "User submitted interview"); 
        socketRef.current = null; 
    }
    
    setIsConnected(false);
    setIsProcessing(true);
    
    await onFinish();
    
    setIsProcessing(false);
    isSubmittingRef.current = false; // Reset for potential re-use
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg p-6 animate-in fade-in duration-700">
      
      {/* Top Bar */}
      <div className="w-full flex justify-between items-center mb-2">
          <div className={`px-4 py-2 rounded-full border ${isConnected ? 'bg-emerald-100 border-emerald-200 text-emerald-800' : 'bg-stone-100 border-stone-200 text-stone-500'} flex items-center gap-2 transition-all duration-300`}>
              <div className={`w-2.5 h-2.5 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-stone-400'}`} />
              <span className="text-xs font-bold tracking-wide">{isConnected ? 'ONLINE' : 'OFFLINE'}</span>
          </div>

          <button onClick={() => { localStorage.clear(); router.push('/login'); }} className="text-stone-400 hover:text-stone-600 transition">
              <LogOut size={20} />
          </button>
      </div>

      {/* Error Banner */}
      {errorMessage && !isConnected && !isConnecting && (
          <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3 animate-in slide-in-from-top-2">
              <AlertTriangle className="text-amber-500 shrink-0" size={24} />
              <div className="flex-1">
                  <h4 className="font-bold text-amber-800 text-sm">Connection Interrupted</h4>
                  <p className="text-amber-700 text-xs mt-1">{errorMessage}</p>
              </div>
              <button onClick={connectToRelay} className="bg-amber-100 hover:bg-amber-200 text-amber-800 p-2 rounded-full transition">
                  <RefreshCw size={18} />
              </button>
          </div>
      )}

      {/* Main Action Area */}
      <div className="relative w-full aspect-square max-w-[320px] flex items-center justify-center">
          
          {/* 1. START / LOADING BUTTON */}
          {!isConnected && !isProcessing && (
              <button 
                  onClick={connectToRelay}
                  disabled={isConnecting}
                  className={`group relative w-full h-full bg-white rounded-[2.5rem] shadow-xl shadow-stone-200 border border-stone-100 flex flex-col items-center justify-center gap-4 transition-all duration-300 ${!isConnecting && 'hover:-translate-y-1'}`}
              >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center transition-transform duration-300 ${!isConnecting && 'group-hover:scale-110'} ${errorMessage ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {isConnecting ? (
                        <Loader2 size={36} className="animate-spin text-emerald-600" />
                      ) : errorMessage ? (
                        <RefreshCw size={36} />
                      ) : (
                        <ShieldCheck size={36} />
                      )}
                  </div>
                  <div>
                      <span className="block text-xl font-black text-stone-800">
                        {isConnecting ? "Connecting..." : (errorMessage ? "Retry Connection" : "Start Interview")}
                      </span>
                      <span className="text-sm font-semibold text-stone-400">
                        {isConnecting ? "Establishing secure line..." : (errorMessage ? "Tap to reconnect" : "Click to connect")}
                      </span>
                  </div>
              </button>
          )}

          {/* 2. PROCESSING STATE */}
          {isProcessing && (
              <div className="w-full h-full bg-white rounded-[2.5rem] shadow-xl border border-stone-100 flex flex-col items-center justify-center gap-6 p-8 text-center">
                  <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                  <div>
                      <h3 className="text-lg font-bold text-stone-800">Architecting Profile</h3>
                      <p className="text-sm text-stone-500 mt-1">Analyzing your service record...</p>
                  </div>
              </div>
          )}

          {/* 3. LIVE INTERFACE */}
          {isConnected && (
              <button
                  onClick={isRecording ? stopRecording : startRecording}
                  className={`w-full h-full rounded-[2.5rem] flex flex-col items-center justify-center transition-all duration-500 relative overflow-hidden ${
                      aiSpeaking 
                          ? 'bg-emerald-50 border-2 border-emerald-500 shadow-2xl shadow-emerald-100'
                          : isRecording 
                              ? 'bg-stone-900 shadow-2xl shadow-stone-300' 
                              : 'bg-stone-100 border-2 border-dashed border-stone-300'
                  }`}
              >
                  {aiSpeaking && (
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-64 h-64 bg-emerald-200 rounded-full animate-ping opacity-20"></div>
                      </div>
                  )}

                  <div className="z-10 flex flex-col items-center">
                      {aiSpeaking ? (
                          <>
                              <Volume2 size={48} className="text-emerald-600 animate-pulse mb-4" />
                              <span className="text-sm font-extrabold text-emerald-800 tracking-widest uppercase">Veer Speaking</span>
                          </>
                      ) : isRecording ? (
                          <>
                              <div className="p-4 bg-white/10 rounded-full mb-4">
                                  <Mic size={40} className="text-white animate-bounce" />
                              </div>
                              <span className="text-sm font-bold text-stone-200 tracking-widest uppercase">Listening...</span>
                          </>
                      ) : (
                          <>
                              <MicOff size={40} className="text-stone-400 mb-4" />
                              <span className="text-sm font-bold text-stone-500">MIC PAUSED</span>
                          </>
                      )}
                  </div>
              </button>
          )}
      </div>

      <div className="text-center h-12">
          {aiSpeaking && <div className="text-emerald-600 font-bold text-sm flex items-center gap-2 animate-pulse"><Sparkles size={16}/> Analyzing input...</div>}
      </div>

      {isConnected && (
          <button 
              onClick={handleFinishWrapper}
              disabled={isProcessing}
              className="w-full max-w-xs bg-stone-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95"
          >
              <FileText size={20} className="text-emerald-400" />
              Submit & Generate Profile
          </button>
      )}
    </div>
  );
}