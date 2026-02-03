import { useCallback, useRef, useEffect } from 'react';

// Base64 encoded coin drop sound (short, satisfying coin drop sfx)
const COIN_SOUND_BASE64 = 'data:audio/mp3;base64,//uQxAAAAAANIAAAAAExBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV//uQxBcAAADSAAAAADEFgNIAAAAFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVU=';

// Alternative: Use Web Audio API to generate coin sound
const createCoinSoundBuffer = async (audioContext: AudioContext): Promise<AudioBuffer> => {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.4; // 400ms
  const buffer = audioContext.createBuffer(1, sampleRate * duration, sampleRate);
  const data = buffer.getChannelData(0);
  
  // Create a coin-like metallic sound with multiple harmonics
  const frequencies = [2000, 3000, 4500, 6000]; // Metallic harmonics
  const decays = [0.15, 0.12, 0.08, 0.05];
  
  for (let i = 0; i < data.length; i++) {
    const t = i / sampleRate;
    let sample = 0;
    
    frequencies.forEach((freq, idx) => {
      const decay = Math.exp(-t / decays[idx]);
      sample += Math.sin(2 * Math.PI * freq * t) * decay * (0.3 - idx * 0.05);
    });
    
    // Add some "bounce" effect
    const bounceTime = [0, 0.1, 0.18, 0.24, 0.28];
    bounceTime.forEach((bt, idx) => {
      if (t >= bt && t < bt + 0.08) {
        const localT = t - bt;
        const bounceDecay = Math.exp(-localT / 0.03) * (1 - idx * 0.2);
        sample += Math.sin(2 * Math.PI * 1200 * localT) * bounceDecay * 0.3;
      }
    });
    
    // Add impact
    if (t < 0.02) {
      sample += (Math.random() * 2 - 1) * (1 - t / 0.02) * 0.5;
    }
    
    data[i] = Math.max(-1, Math.min(1, sample));
  }
  
  return buffer;
};

export const useCoinSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const coinBufferRef = useRef<AudioBuffer | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize audio context on first interaction
  const initializeAudio = useCallback(async () => {
    if (isInitializedRef.current) return;
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      coinBufferRef.current = await createCoinSoundBuffer(audioContextRef.current);
      isInitializedRef.current = true;
      console.log('✅ Coin sound initialized');
    } catch (error) {
      console.error('Failed to initialize coin sound:', error);
    }
  }, []);

  // Play coin sound
  const playCoinSound = useCallback(async () => {
    try {
      // Initialize if needed
      if (!isInitializedRef.current) {
        await initializeAudio();
      }

      const audioContext = audioContextRef.current;
      const coinBuffer = coinBufferRef.current;

      if (!audioContext || !coinBuffer) {
        console.warn('Audio not ready, using fallback');
        // Fallback to HTML5 Audio
        const audio = new Audio();
        audio.src = COIN_SOUND_BASE64;
        await audio.play().catch(() => {
          // Generate a simple beep as ultimate fallback
          const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.frequency.setValueAtTime(1500, ctx.currentTime);
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
          osc.start(ctx.currentTime);
          osc.stop(ctx.currentTime + 0.3);
        });
        return;
      }

      // Resume audio context if suspended (browser autoplay policy)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }

      // Create and play the sound
      const source = audioContext.createBufferSource();
      const gainNode = audioContext.createGain();
      
      source.buffer = coinBuffer;
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      // Set volume
      gainNode.gain.setValueAtTime(0.6, audioContext.currentTime);
      
      source.start(0);
      
      console.log('🪙 Coin sound played!');
    } catch (error) {
      console.error('Error playing coin sound:', error);
    }
  }, [initializeAudio]);

  // Pre-initialize on user interaction
  useEffect(() => {
    const handleInteraction = () => {
      if (!isInitializedRef.current) {
        initializeAudio();
      }
    };

    // Initialize on first user interaction (click, touch, keypress)
    document.addEventListener('click', handleInteraction, { once: true });
    document.addEventListener('touchstart', handleInteraction, { once: true });
    document.addEventListener('keydown', handleInteraction, { once: true });

    return () => {
      document.removeEventListener('click', handleInteraction);
      document.removeEventListener('touchstart', handleInteraction);
      document.removeEventListener('keydown', handleInteraction);
    };
  }, [initializeAudio]);

  return { playCoinSound, initializeAudio };
};

export default useCoinSound;
