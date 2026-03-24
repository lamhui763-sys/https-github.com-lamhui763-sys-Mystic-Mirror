import { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { createPcmBlob, base64ToUint8Array, decodeAudioData } from '../services/audio-utils';

interface UseLiveApiReturn {
  isConnected: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  volume: number;
  error: string | null;
}

export function useLiveApi(): UseLiveApiReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(0);

  // Audio Contexts
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  
  // Nodes & Sources
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Session Management
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    // Stop all playing sources
    audioSourcesRef.current.forEach(source => {
      try { source.stop(); } catch (e) { /* ignore */ }
    });
    audioSourcesRef.current.clear();

    // Close contexts
    if (inputAudioContextRef.current) {
      inputAudioContextRef.current.close();
      inputAudioContextRef.current = null;
    }
    if (outputAudioContextRef.current) {
      outputAudioContextRef.current.close();
      outputAudioContextRef.current = null;
    }

    // Stop streaming
    if (inputSourceRef.current) {
      inputSourceRef.current.disconnect();
      inputSourceRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    // We can't explicitly "close" the session object from the API side in the same way, 
    // but dropping the reference and context stops the flow.
    sessionPromiseRef.current = null;
    
    setIsConnected(false);
    setIsConnecting(false);
    setVolume(0);
  }, []);

  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;
    setIsConnecting(true);
    setError(null);

    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) throw new Error("API Key not found");

      const ai = new GoogleGenAI({ apiKey });
      
      // Initialize Audio Contexts
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      // Analyzer for visualization
      analyzerRef.current = outputAudioContextRef.current.createAnalyser();
      analyzerRef.current.fftSize = 256;
      analyzerRef.current.connect(outputAudioContextRef.current.destination);
      
      // Connect to Gemini Live
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } },
          },
          systemInstruction: "你是一位神秘的智者。說話充滿智慧、冷靜，帶有一絲神秘感。你是玄學、風水和心靈指引的專家。回答要簡潔而深刻。請務必使用繁體中文進行語音對話。",
        },
        callbacks: {
          onopen: async () => {
            console.log("Gemini Live Session Opened");
            setIsConnected(true);
            setIsConnecting(false);

            // Start Microphone
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
              if (!inputAudioContextRef.current) return;

              const source = inputAudioContextRef.current.createMediaStreamSource(stream);
              inputSourceRef.current = source;
              
              const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
              processorRef.current = processor;

              processor.onaudioprocess = (e) => {
                const inputData = e.inputBuffer.getChannelData(0);
                const pcmBlob = createPcmBlob(inputData);
                
                sessionPromiseRef.current?.then(session => {
                  session.sendRealtimeInput({ media: pcmBlob });
                });
              };

              source.connect(processor);
              processor.connect(inputAudioContextRef.current.destination);
            } catch (err) {
              console.error("Mic error:", err);
              setError("無法存取麥克風");
              cleanup();
            }
          },
          onmessage: async (msg: LiveServerMessage) => {
            const serverContent = msg.serverContent;
            
            // Handle Audio Output
            const audioData = serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputAudioContextRef.current) {
              const ctx = outputAudioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);

              const audioBuffer = await decodeAudioData(
                base64ToUint8Array(audioData),
                ctx,
                24000,
                1
              );

              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              // Connect to analyzer for visualization, then destination
              if (analyzerRef.current) {
                source.connect(analyzerRef.current);
              } else {
                source.connect(ctx.destination);
              }
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;

              audioSourcesRef.current.add(source);
              source.onended = () => {
                audioSourcesRef.current.delete(source);
              };
            }

            // Handle Interruption
            if (serverContent?.interrupted) {
              console.log("Interrupted");
              audioSourcesRef.current.forEach(s => s.stop());
              audioSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => {
            console.log("Session closed");
            cleanup();
          },
          onerror: (err) => {
            console.error("Session error:", err);
            setError("發生連線錯誤");
            cleanup();
          }
        }
      });

      sessionPromiseRef.current = sessionPromise;

    } catch (e: any) {
      console.error("Connection failed", e);
      setError(e.message || "連線失敗");
      setIsConnecting(false);
    }
  }, [cleanup, isConnected, isConnecting]);

  // Visualizer Loop
  useEffect(() => {
    const updateVolume = () => {
      if (analyzerRef.current && isConnected) {
        const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
        analyzerRef.current.getByteFrequencyData(dataArray);
        // Calculate average volume
        const sum = dataArray.reduce((a, b) => a + b, 0);
        const avg = sum / dataArray.length;
        setVolume(avg); // 0 to 255
      } else {
        setVolume(0);
      }
      animationFrameRef.current = requestAnimationFrame(updateVolume);
    };
    updateVolume();
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isConnected]);

  return {
    isConnected,
    isConnecting,
    connect,
    disconnect: cleanup,
    volume,
    error
  };
}