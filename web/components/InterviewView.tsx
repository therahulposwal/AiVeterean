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
    RefreshCw 
} from 'lucide-react';
import { useRouter } from 'next/navigation';

interface InterviewViewProps {
  token: string | null;
  onFinish: () => void;
  userRank: string;
  userName: string;
}

export default function InterviewView({ token, onFinish, userRank, userName }: InterviewViewProps) {
  const router = useRouter();

  // --- LOCAL STATE ---
  const [isConnected, setIsConnected] = useState(false);
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
  
  // ✅ THE CRITICAL FLAG: Tracks if AI is currently outputting sound
  const isAiSpeakingRef = useRef(false);

  // --- CLEANUP ---
  useEffect(() => {
    return () => {
      stopRecording();
      socketRef.current?.close();
      audioContextRef.current?.close();
    };
  }, []);

  // --- WEBSOCKET & AUDIO LOGIC ---
  const connectToRelay = async () => {
    if (socketRef.current) return;
    if (!token) return; 

    setErrorMessage(null);

    // 1. Initialize Audio Engine IMMEDIATELY (Bypasses Autoplay Block)
    if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
    }

    const arm = localStorage.getItem('veteran_arm') || 'Infantry';
    const branch = localStorage.getItem('veteran_branch') || 'Army';
    const unit = localStorage.getItem('veteran_unitName') || 'Unit';

    const wsUrl = `ws://localhost:8080?token=${token}`
      + `&rank=${encodeURIComponent(userRank)}`
      + `&name=${encodeURIComponent(userName)}`
      + `&arm=${encodeURIComponent(arm)}`
      + `&branch=${encodeURIComponent(branch)}`
      + `&unit=${encodeURIComponent(unit)}`;

    const ws = new WebSocket(wsUrl);
    
    ws.onopen = () => {
      setIsConnected(true);
      // We set this initially to prevent recording until the "Hello" is finished
      setAiSpeaking(true); 
      isAiSpeakingRef.current = true; 
      startRecording(); 
    };
    
    ws.onclose = (event) => {
      setIsConnected(false);
      setIsRecording(false);
      if (event.code === 1008) {
         alert("Session Expired");
         router.push('/login');
      }
      stopRecording();
      socketRef.current = null;
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "SYSTEM_DISCONNECT" || data.type === "SYSTEM_ERROR") {
           setErrorMessage(data.message);
           stopRecording();
           setIsConnected(false);
           if (socketRef.current) socketRef.current.close();
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
      
      // ✅ SIGNAL START: AI IS SPEAKING
      isAiSpeakingRef.current = true;
      setAiSpeaking(true);
      
      source.onended = () => {
         // ✅ SIGNAL END: AI FINISHED SPEAKING
         // We add a tiny buffer (100ms) to ensure echo is gone
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

        // ✅✅✅ THE FIX: THE GATE ✅✅✅
        // If the AI is currently speaking, DO NOT send mic data.
        // This prevents the AI from hearing itself (Echo) and interrupting itself.
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
    stopRecording();
    if (socketRef.current) { socketRef.current.close(); socketRef.current = null; }
    setIsConnected(false);
    setIsProcessing(true);
    await onFinish();
    setIsProcessing(false);
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
      {errorMessage && !isConnected && (
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
          
          {/* 1. START BUTTON */}
          {!isConnected && !isProcessing && (
              <button 
                  onClick={connectToRelay}
                  className="group relative w-full h-full bg-white rounded-[2.5rem] shadow-xl shadow-stone-200 border border-stone-100 flex flex-col items-center justify-center gap-4 hover:-translate-y-1 transition-all duration-300"
              >
                  <div className={`w-20 h-20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ${errorMessage ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      {errorMessage ? <RefreshCw size={36} /> : <ShieldCheck size={36} />}
                  </div>
                  <div>
                      <span className="block text-xl font-black text-stone-800">{errorMessage ? "Retry Connection" : "Start Interview"}</span>
                      <span className="text-sm font-semibold text-stone-400">{errorMessage ? "Tap to reconnect" : "Click to connect"}</span>
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