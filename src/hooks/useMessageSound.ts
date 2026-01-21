import { useRef, useEffect, useCallback } from 'react';

// WhatsApp-style message sound
const MESSAGE_SOUND_BASE64 = 'data:audio/mp3;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWGluZwAAAA8AAAACAAABhgC7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7u7//////////////////////////////////////////////////////////////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAAAAAAAAAAAAYYNvMVBAAAAAAD/+1DEAAAGAAGn9AAAIAAANP8AAAATNjQxNTI0AAALgBguF/1AL4f8EBgYGBoMECB8HwfBBnP/y4PlwfD4IAgGf//+XB8EMEAQBBn/9+D58H3///BAEPygIAheD7u//ggfWD5//BA+Xf/lAfJQf//ygGD7//+UBAEGP+CAJ//JAfg+f//BAEAx//ggCAY/0AQBA++CAYPv/lwfBA+X//+D7u7u7gQPu7u/lwfeXD/+XD8oD4fl3////BA+7/lgfD8P////wQBA++///wQOD7/8uD//B8EH3//////lAfd3/y7///5d3dwfD/lgQBH/5d3d////5cP/y4f/5cP/+Xf//y7v/y7u7/8u7/////5cPy4f///lw//y7u7//lw/y7v/y7///8u////5cP//y7v/////lwf////5YH//////+XB////lw/////5cH////+XD/////lg/////8uD////+XB/////8uH////+XD/////yw=';

// Generate WhatsApp-like notification sound
const createMessageSoundBuffer = async (audioContext: AudioContext): Promise<AudioBuffer> => {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.3;
  const samples = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, samples, sampleRate);
  const channelData = buffer.getChannelData(0);

  // Two-tone WhatsApp-like notification
  const freq1 = 880; // A5
  const freq2 = 1108.73; // C#6
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * 8); // Quick decay
    
    // First tone (short)
    const tone1 = t < 0.1 ? Math.sin(2 * Math.PI * freq1 * t) * envelope : 0;
    // Second tone (after short pause)
    const tone2 = t > 0.15 ? Math.sin(2 * Math.PI * freq2 * (t - 0.15)) * Math.exp(-(t - 0.15) * 10) : 0;
    
    channelData[i] = (tone1 + tone2) * 0.4;
  }

  return buffer;
};

export const useMessageSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);
  const initializedRef = useRef(false);

  const initializeAudio = useCallback(async () => {
    if (initializedRef.current) return;
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioBufferRef.current = await createMessageSoundBuffer(audioContextRef.current);
      initializedRef.current = true;
    } catch (error) {
      console.log('Audio initialization failed:', error);
    }
  }, []);

  const playMessageSound = useCallback(async () => {
    try {
      if (!initializedRef.current) {
        await initializeAudio();
      }

      if (audioContextRef.current && audioBufferRef.current) {
        if (audioContextRef.current.state === 'suspended') {
          await audioContextRef.current.resume();
        }

        const source = audioContextRef.current.createBufferSource();
        const gainNode = audioContextRef.current.createGain();
        
        source.buffer = audioBufferRef.current;
        gainNode.gain.value = 0.5;
        
        source.connect(gainNode);
        gainNode.connect(audioContextRef.current.destination);
        source.start(0);
        return;
      }

      // Fallback to HTML5 Audio
      const audio = new Audio(MESSAGE_SOUND_BASE64);
      audio.volume = 0.5;
      await audio.play();
    } catch (error) {
      console.log('Sound playback failed:', error);
    }
  }, [initializeAudio]);

  useEffect(() => {
    const handleInteraction = () => initializeAudio();
    
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [initializeAudio]);

  return { playMessageSound, initializeAudio };
};

export default useMessageSound;
