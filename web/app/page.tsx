"use client";
import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Activity, LogOut, ShieldCheck, FileText, Volume2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const router = useRouter();
  const { isAuthenticated, token } = useAuth(); 

  // --- State ---
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- Refs ---
  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  
  // ✅ FIX: INSTANT SOFT-MUTE REF
  // We use a Ref because State is too slow for audio loops
  const isAiSpeakingRef = useRef(false);

  useEffect(() => {
    return () => {
      stopRecording();
      socketRef.current?.close();
      audioContextRef.current?.close();
    };
  }, []);

  // --- 1. CONNECT & START ---
  const connectToRelay = () => {
    if (socketRef.current) return;
    if (!token) return; 

    const rank = localStorage.getItem('veteran_rank') || 'Sepoy';
    const arm = localStorage.getItem('veteran_arm') || 'Infantry';
    const name = localStorage.getItem('veteran_fullName') || 'Soldier';

    const ws = new WebSocket(`ws://localhost:8080?token=${token}&rank=${encodeURIComponent(rank)}&arm=${encodeURIComponent(arm)}&name=${encodeURIComponent(name)}`);
    
    ws.onopen = () => {
      setIsConnected(true);
      // ✅ Server sends Auto-Start message
      // ✅ Client starts Mic immediately (but Soft Mute will handle flow)
      startRecording(); 
    };
    
    ws.onclose = (event) => {
      setIsConnected(false);
      if (event.code === 1008) {
        alert("Session Expired. Please Login Again.");
        router.push('/login');
      }
      stopRecording();
      socketRef.current = null;
    };

    ws.onmessage = async (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.serverContent?.modelTurn?.parts) {
          const parts = data.serverContent.modelTurn.parts;
          for (const part of parts) {
            if (part.inlineData && part.inlineData.mimeType.startsWith('audio/pcm')) {
              playPcmAudio(part.inlineData.data);
            }
          }
        }
      } catch (e) { /* Ignore parse errors */ }
    };

    socketRef.current = ws;
  };

  // --- 2. AUDIO PLAYBACK (Soft Mute Enforced) ---
  const playPcmAudio = (base64String: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
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
      
      // ✅ ACTIVATE SOFT MUTE
      // We tell the Ref "AI is talking", which blocks the Mic stream instantly.
      isAiSpeakingRef.current = true;
      setAiSpeaking(true);
      
      source.onended = () => {
         if (ctx.currentTime >= nextStartTimeRef.current - 0.1) {
            // ✅ DEACTIVATE SOFT MUTE
            // AI finished. Open the floodgates for user input.
            isAiSpeakingRef.current = false;
            setAiSpeaking(false);
         }
      };
    } catch (err) { console.error("Audio Error"); }
  };

  // --- 3. MIC INPUT (Gated) ---
  const startRecording = async () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true } });
      streamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: 16000 });
      audioContextRef.current = audioContext;
      await audioContext.audioWorklet.addModule('/audio-processor.js');

      const source = audioContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(audioContext, 'pcm-processor');
      workletNodeRef.current = workletNode;

      workletNode.port.onmessage = (event) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        
        // ✅ THE GATEKEEPER
        // If AI is speaking, we DROP the user's audio packet here.
        // It never reaches the server, so the AI never gets interrupted.
        if (isAiSpeakingRef.current) return;

        const base64Audio = btoa(new Uint8Array(event.data).reduce((data, byte) => data + String.fromCharCode(byte), ''));
        
        socketRef.current.send(JSON.stringify({
            realtime_input: { 
                media_chunks: [{ mime_type: "audio/pcm", data: base64Audio }]
            }
        }));
      };

      source.connect(workletNode);
      workletNode.connect(audioContext.destination); 
      setIsRecording(true);
    } catch (err) { console.error("Mic Access Denied"); }
  };

  const stopRecording = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    if (workletNodeRef.current) workletNodeRef.current.disconnect();
    setIsRecording(false);
  };

  const handleLogout = () => {
      localStorage.clear();
      router.push('/login');
  };

  const handleFinish = async () => {
    stopRecording();
    if (socketRef.current) {
        socketRef.current.close();
        socketRef.current = null;
    }
    setIsConnected(false);
    setIsProcessing(true);
    const userId = localStorage.getItem('veteran_userId');

    try {
        const res = await fetch('/api/build-profile', { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId })
        });
        const data = await res.json();
        
        if (data.success) {
            alert("✅ Interview Complete. Profile Architected & Saved.");
        } else {
            alert("⚠️ Analysis Failed: " + data.message);
        }
    } catch (e) {
        alert("Server Error during analysis.");
    } finally {
        setIsProcessing(false);
    }
  };

  if (!isAuthenticated) return <div className="min-h-screen bg-gray-900 flex items-center justify-center text-cyan-500 font-mono">VERIFYING CREDENTIALS...</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      {/* Top Status Bar */}
      <div className="absolute top-8 left-8 flex items-center gap-3 bg-gray-800 px-4 py-2 rounded-full border border-gray-700 shadow-lg">
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
        <span className="text-sm font-medium tracking-wide">{isConnected ? 'LIVE UPLINK ACTIVE' : 'OFFLINE'}</span>
      </div>

      <button onClick={handleLogout} className="absolute top-8 right-8 text-gray-500 hover:text-red-400 transition flex items-center gap-2">
        <span className="text-sm font-semibold">LOGOUT</span> <LogOut size={20} />
      </button>

      {/* Main UI */}
      <div className="flex flex-col items-center gap-10">
        
        {/* 1. START BUTTON */}
        {!isConnected && !isProcessing && (
            <button 
                onClick={connectToRelay}
                className="group relative px-8 py-5 bg-cyan-600 hover:bg-cyan-500 rounded-2xl font-bold transition-all shadow-[0_0_30px_rgba(8,145,178,0.4)] flex items-center gap-4 text-lg"
            >
                <ShieldCheck size={28} className="group-hover:scale-110 transition" />
                <span>START INTERVIEW</span>
            </button>
        )}

        {/* 2. PROCESSING STATE */}
        {isProcessing && (
            <div className="flex flex-col items-center animate-pulse gap-4">
                <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-emerald-400 font-mono tracking-widest text-lg">ARCHITECTING PROFILE...</span>
            </div>
        )}

        {/* 3. LIVE INTERFACE */}
        {isConnected && (
            <div className="relative group">
                {aiSpeaking && <div className="absolute inset-0 rounded-full border-4 border-cyan-400 animate-ping opacity-20"></div>}
                
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    className={`w-48 h-48 rounded-full flex flex-col items-center justify-center transition-all duration-300 shadow-2xl border-4 ${
                        aiSpeaking
                        ? 'bg-gray-800 border-cyan-500 shadow-[0_0_30px_rgba(34,211,238,0.3)]'
                        : isRecording 
                            ? 'bg-red-600 border-red-400 scale-105 shadow-[0_0_50px_rgba(220,38,38,0.6)]' 
                            : 'bg-gray-800 border-gray-600'
                    }`}
                >
                    {aiSpeaking ? (
                        <>
                            <Volume2 size={56} className="text-cyan-400 animate-pulse" />
                            <span className="text-sm font-mono mt-3 text-cyan-400 tracking-wider font-bold">VEER SPEAKING</span>
                        </>
                    ) : isRecording ? (
                        <>
                            <Mic size={56} className="text-white animate-bounce" />
                            <span className="text-sm font-mono mt-3 text-red-200 tracking-wider">LISTENING</span>
                        </>
                    ) : (
                        <>
                            <MicOff size={56} className="text-gray-400" />
                            <span className="text-sm font-mono mt-3 text-gray-500">MIC PAUSED</span>
                        </>
                    )}
                </button>
            </div>
        )}

        {/* 4. SUBTEXT */}
        <div className="h-8 text-center font-mono text-cyan-400 text-sm tracking-wide">
            {aiSpeaking && <div className="flex items-center gap-2"><Activity size={18} className="animate-spin" /> INCOMING TRANSMISSION...</div>}
        </div>

        {/* 5. FINISH BUTTON */}
        {isConnected && (
            <button 
                onClick={handleFinish}
                disabled={isProcessing}
                className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-3 rounded-xl font-bold shadow-lg transition flex items-center gap-2 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1"
            >
                <FileText size={20} />
                <span>FINISH & BUILD PROFILE</span>
            </button>
        )}
      </div>
    </div>
  );
}