"use client";

import { useCallback, useEffect, useRef, useState } from 'react';

type PhaseControlAction = 'next' | 'previous';

interface UseInterviewSessionOptions {
  onUnauthorized: () => void;
}

interface InterviewPhaseState {
  currentPhase: string;
  phaseName: string;
  phaseDescription: string;
  phaseNumber: number;
  totalPhases: number;
  canGoBack: boolean;
  canGoNext: boolean;
  appointmentCount: number;
}

const DEFAULT_PHASE_STATE: InterviewPhaseState = {
  currentPhase: 'FOUNDATION',
  phaseName: 'Foundation & Timeline',
  phaseDescription: 'Establish career perimeter and service foundation',
  phaseNumber: 1,
  totalPhases: 8,
  canGoBack: false,
  canGoNext: true,
  appointmentCount: 0,
};

async function getRelayToken(): Promise<string> {
  const response = await fetch('/api/relay-token', { method: 'GET' });
  if (!response.ok) {
    throw new Error('Unable to get relay token');
  }

  const payload = (await response.json()) as { success: boolean; relayToken?: string };
  if (!payload.success || !payload.relayToken) {
    throw new Error('Relay token missing');
  }

  return payload.relayToken;
}

export function useInterviewSession({ onUnauthorized }: UseInterviewSessionOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [aiSpeaking, setAiSpeaking] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [phaseState, setPhaseState] = useState<InterviewPhaseState>(DEFAULT_PHASE_STATE);

  const socketRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recordingContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const pingIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isAiSpeakingRef = useRef(false);
  const isSubmittingRef = useRef(false);
  const speakTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const playPcmAudio = useCallback((base64String: string) => {
    try {
      if (!audioContextRef.current) return;
      const context = audioContextRef.current;

      const binaryString = atob(base64String);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i += 1) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const float32Data = new Float32Array(bytes.length / 2);
      const dataView = new DataView(bytes.buffer);
      for (let i = 0; i < bytes.length / 2; i += 1) {
        float32Data[i] = dataView.getInt16(i * 2, true) / 32768.0;
      }

      const buffer = context.createBuffer(1, float32Data.length, 24000);
      buffer.getChannelData(0).set(float32Data);
      const currentTime = context.currentTime;
      if (nextStartTimeRef.current < currentTime) {
        nextStartTimeRef.current = currentTime + 0.05;
      }

      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(context.destination);
      source.start(nextStartTimeRef.current);
      nextStartTimeRef.current += buffer.duration;
      isAiSpeakingRef.current = true;
      setAiSpeaking(true);
      
      if (speakTimeoutRef.current) {
        clearTimeout(speakTimeoutRef.current);
      }
      
      const timeUntilEndMs = Math.max(0, (nextStartTimeRef.current - context.currentTime) * 1000);
      speakTimeoutRef.current = setTimeout(() => {
        isAiSpeakingRef.current = false;
        setAiSpeaking(false);
      }, timeUntilEndMs + 300);
    } catch (error) {
      console.error('Audio error', error);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (workletNodeRef.current) {
      workletNodeRef.current.disconnect();
      workletNodeRef.current = null;
    }
    if (recordingContextRef.current) {
      recordingContextRef.current.close();
      recordingContextRef.current = null;
    }
    setIsRecording(false);
  }, []);

  const startRecording = useCallback(async () => {
    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
    if (isRecording) return;

    try {
      if (typeof window === 'undefined' || typeof navigator === 'undefined') {
        throw new Error('Recording is only available in the browser.');
      }

      const hostname = window.location.hostname.toLowerCase();
      const isLoopbackHost =
        hostname === 'localhost' ||
        hostname === '127.0.0.1' ||
        hostname === '::1' ||
        hostname.endsWith('.localhost');
      const hasSecureOrigin =
        window.isSecureContext || window.location.protocol === 'https:' || isLoopbackHost;

      if (!hasSecureOrigin) {
        throw new Error('Microphone access requires HTTPS or localhost.');
      }

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('This browser does not support microphone access.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: 16000, channelCount: 1, echoCancellation: true },
      });
      streamRef.current = stream;

      const RecordingAudioContext =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

      if (!RecordingAudioContext) {
        throw new Error('AudioContext is not supported in this browser.');
      }

      const recordingContext = new RecordingAudioContext({ sampleRate: 16000 });
      recordingContextRef.current = recordingContext;
      if (recordingContext.state === 'suspended') {
        await recordingContext.resume();
      }

      await recordingContext.audioWorklet.addModule('/audio-processor.js');
      const source = recordingContext.createMediaStreamSource(stream);
      const workletNode = new AudioWorkletNode(recordingContext, 'pcm-processor');
      workletNodeRef.current = workletNode;

      workletNode.port.onmessage = (event) => {
        if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;
        if (isAiSpeakingRef.current) return;

        const base64Audio = btoa(
          new Uint8Array(event.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
        );

        socketRef.current.send(
          JSON.stringify({
            realtime_input: { media_chunks: [{ mime_type: 'audio/pcm', data: base64Audio }] },
          })
        );
      };

      source.connect(workletNode);
      workletNode.connect(recordingContext.destination);
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone error', error);
      const message = error instanceof Error ? error.message : 'Microphone access failed.';
      setErrorMessage(message);
      stopRecording();
    }
  }, [isRecording, stopRecording]);

  const connectToRelay = useCallback(async () => {
    if (socketRef.current || isConnecting) return;

    setIsConnecting(true);
    setErrorMessage(null);
    isSubmittingRef.current = false;

    let relayToken: string;
    try {
      relayToken = await getRelayToken();
    } catch {
      setErrorMessage('Authentication missing. Please log in again.');
      setIsConnecting(false);
      onUnauthorized();
      return;
    }

    try {
      if (!audioContextRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (!AudioCtx) {
          throw new Error('AudioContext is not supported in this browser');
        }
        audioContextRef.current = new AudioCtx({ sampleRate: 24000 });
      }
      if (audioContextRef.current.state === 'suspended') {
        await audioContextRef.current.resume();
      }
    } catch (error) {
      console.error('Audio context error', error);
    }

    const relayHost = process.env.NEXT_PUBLIC_RELAY_HOST || 'localhost:8080';
    const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
    const ws = new WebSocket(`${protocol}://${relayHost}?token=${relayToken}`);

    ws.onopen = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setAiSpeaking(true);
      isAiSpeakingRef.current = true;
      startRecording();

      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'ping' }));
        }
      }, 30000);
    };

    ws.onclose = (event) => {
      if (isSubmittingRef.current) return;
      setIsConnected(false);
      setIsConnecting(false);
      setIsRecording(false);
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);

      if (event.code === 1008) {
        onUnauthorized();
      } else if (event.code !== 1000) {
        setErrorMessage('Connection lost. Please retry.');
      }

      stopRecording();
      socketRef.current = null;
    };

    ws.onmessage = (event) => {
      try {
        const raw = JSON.parse(event.data) as unknown;
        if (!raw || typeof raw !== 'object') return;

        const data = raw as {
          type?: string;
          message?: string;
          currentPhase?: string;
          phaseName?: string;
          phaseDescription?: string;
          phaseNumber?: number;
          totalPhases?: number;
          canGoBack?: boolean;
          canGoNext?: boolean;
          appointmentCount?: number;
          serverContent?: {
            modelTurn?: {
              parts?: Array<{
                inlineData?: { mimeType?: string; data?: string };
              }>;
            };
          };
        };

        if (data.type === 'PHASE_UPDATE') {
          setPhaseState({
            currentPhase: data.currentPhase ?? DEFAULT_PHASE_STATE.currentPhase,
            phaseName: data.phaseName ?? DEFAULT_PHASE_STATE.phaseName,
            phaseDescription: data.phaseDescription ?? DEFAULT_PHASE_STATE.phaseDescription,
            phaseNumber: data.phaseNumber ?? DEFAULT_PHASE_STATE.phaseNumber,
            totalPhases: data.totalPhases ?? DEFAULT_PHASE_STATE.totalPhases,
            canGoBack: data.canGoBack ?? DEFAULT_PHASE_STATE.canGoBack,
            canGoNext: data.canGoNext ?? DEFAULT_PHASE_STATE.canGoNext,
            appointmentCount: data.appointmentCount ?? 0,
          });
          return;
        }

        if (data.type === 'SYSTEM_ERROR') {
          setErrorMessage(data.message ?? 'System error');
          stopRecording();
          setIsConnected(false);
          return;
        }

        if (data.type === 'SYSTEM_DISCONNECT') {
          setErrorMessage('Disconnected by server.');
          stopRecording();
          return;
        }

        const parts = data.serverContent?.modelTurn?.parts ?? [];
        for (const part of parts) {
          if (part.inlineData?.mimeType?.startsWith('audio/pcm') && part.inlineData.data) {
            playPcmAudio(part.inlineData.data);
          }
        }
      } catch {
        // ignore malformed messages
      }
    };

    socketRef.current = ws;
  }, [isConnecting, onUnauthorized, playPcmAudio, startRecording, stopRecording]);

  const sendPhaseControl = useCallback((action: PhaseControlAction) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'PHASE_CONTROL',
          action,
        })
      );
    }
  }, []);

  const goToNextPhase = useCallback(() => {
    if (phaseState.canGoNext) {
      sendPhaseControl('next');
    }
  }, [phaseState.canGoNext, sendPhaseControl]);

  const goToPreviousPhase = useCallback(() => {
    if (phaseState.canGoBack) {
      sendPhaseControl('previous');
    }
  }, [phaseState.canGoBack, sendPhaseControl]);

  const jumpToNextAppointment = useCallback(() => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(
        JSON.stringify({
          type: 'PHASE_CONTROL',
          action: 'jump',
          targetPhase: 'APPOINTMENT_DEEP_DIVE',
        })
      );
    }
  }, []);

  const finishInterview = useCallback(async (onFinish: () => Promise<void>) => {
    isSubmittingRef.current = true;
    setErrorMessage(null);

    stopRecording();
    if (socketRef.current) {
      socketRef.current.close(1000, 'User submitted interview');
      socketRef.current = null;
    }
    setIsConnected(false);

    await onFinish();
    isSubmittingRef.current = false;
  }, [stopRecording]);

  useEffect(() => {
    return () => {
      stopRecording();
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      socketRef.current?.close();
      audioContextRef.current?.close();
    };
  }, [stopRecording]);

  return {
    isConnected,
    isConnecting,
    isRecording,
    aiSpeaking,
    errorMessage,
    phaseState,
    connectToRelay,
    startRecording,
    stopRecording,
    goToNextPhase,
    goToPreviousPhase,
    jumpToNextAppointment,
    finishInterview,
    setErrorMessage,
  };
}
