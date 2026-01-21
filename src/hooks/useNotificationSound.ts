import { useRef, useEffect, useCallback } from 'react';

// Professional notification sound - similar to WhatsApp/Telegram
const createNotificationSoundBuffer = async (audioContext: AudioContext): Promise<AudioBuffer> => {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.4;
  const samples = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, samples, sampleRate);
  const channelData = buffer.getChannelData(0);

  // Three-tone notification (ascending)
  const frequencies = [659.25, 830.61, 987.77]; // E5, G#5, B5
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    
    // First tone (0-0.12s)
    if (t < 0.12) {
      const envelope = Math.exp(-t * 15);
      sample += Math.sin(2 * Math.PI * frequencies[0] * t) * envelope;
    }
    // Second tone (0.12-0.24s)
    else if (t < 0.24) {
      const localT = t - 0.12;
      const envelope = Math.exp(-localT * 15);
      sample += Math.sin(2 * Math.PI * frequencies[1] * localT) * envelope;
    }
    // Third tone (0.24-0.4s)
    else {
      const localT = t - 0.24;
      const envelope = Math.exp(-localT * 10);
      sample += Math.sin(2 * Math.PI * frequencies[2] * localT) * envelope;
    }
    
    channelData[i] = sample * 0.4;
  }

  return buffer;
};

// Sale/Order sound - exciting "cha-ching" 
const createSaleSoundBuffer = async (audioContext: AudioContext): Promise<AudioBuffer> => {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.5;
  const samples = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, samples, sampleRate);
  const channelData = buffer.getChannelData(0);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // Cash register "cha-ching" effect
    const baseFreq = 1200;
    const envelope1 = t < 0.1 ? Math.exp(-t * 30) : 0;
    const envelope2 = t > 0.15 && t < 0.35 ? Math.exp(-(t - 0.15) * 15) : 0;
    
    // First "cha" - metallic hit
    const hit1 = Math.sin(2 * Math.PI * baseFreq * t) * envelope1;
    const hit1b = Math.sin(2 * Math.PI * baseFreq * 1.5 * t) * envelope1 * 0.5;
    
    // Second "ching" - higher pitched
    const hit2 = Math.sin(2 * Math.PI * baseFreq * 2 * (t - 0.15)) * envelope2;
    const hit2b = Math.sin(2 * Math.PI * baseFreq * 3 * (t - 0.15)) * envelope2 * 0.3;
    
    // Add some shimmer
    const shimmer = t > 0.2 ? Math.sin(2 * Math.PI * 3000 * t) * Math.exp(-(t - 0.2) * 20) * 0.1 : 0;
    
    channelData[i] = (hit1 + hit1b + hit2 + hit2b + shimmer) * 0.35;
  }

  return buffer;
};

// Payout/Money received sound - coins dropping
const createPayoutSoundBuffer = async (audioContext: AudioContext): Promise<AudioBuffer> => {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.6;
  const samples = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, samples, sampleRate);
  const channelData = buffer.getChannelData(0);

  // Multiple coin drops with metallic resonance
  const coinDrops = [0, 0.08, 0.15, 0.22, 0.28];
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    
    coinDrops.forEach((dropTime, idx) => {
      if (t >= dropTime) {
        const localT = t - dropTime;
        const envelope = Math.exp(-localT * 12);
        const freq = 1800 + idx * 200; // Slightly different pitch for each coin
        
        // Metallic coin sound
        sample += Math.sin(2 * Math.PI * freq * localT) * envelope * 0.3;
        sample += Math.sin(2 * Math.PI * freq * 2.4 * localT) * envelope * 0.15;
        sample += Math.sin(2 * Math.PI * freq * 3.8 * localT) * envelope * 0.08;
      }
    });
    
    channelData[i] = sample * 0.5;
  }

  return buffer;
};

// Shipping/Delivery sound - whoosh
const createShippingSoundBuffer = async (audioContext: AudioContext): Promise<AudioBuffer> => {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.4;
  const samples = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, samples, sampleRate);
  const channelData = buffer.getChannelData(0);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // Whoosh sound using filtered noise + sweep
    const noise = (Math.random() * 2 - 1);
    const sweepFreq = 500 + t * 2000; // Frequency sweep up
    const envelope = Math.sin(Math.PI * t / duration) * 0.6; // Bell curve
    
    const sweep = Math.sin(2 * Math.PI * sweepFreq * t);
    
    channelData[i] = (noise * 0.1 + sweep * 0.4) * envelope;
  }

  return buffer;
};

export type NotificationSoundType = 'message' | 'order' | 'payout' | 'shipping' | 'bid' | 'general';

export const useNotificationSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundBuffersRef = useRef<Map<NotificationSoundType, AudioBuffer>>(new Map());
  const initializedRef = useRef(false);

  const initializeAudio = useCallback(async () => {
    if (initializedRef.current) return;
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Pre-generate all sound buffers
      const [messageBuf, saleBuf, payoutBuf, shippingBuf] = await Promise.all([
        createNotificationSoundBuffer(audioContextRef.current),
        createSaleSoundBuffer(audioContextRef.current),
        createPayoutSoundBuffer(audioContextRef.current),
        createShippingSoundBuffer(audioContextRef.current),
      ]);
      
      soundBuffersRef.current.set('message', messageBuf);
      soundBuffersRef.current.set('order', saleBuf);
      soundBuffersRef.current.set('bid', saleBuf); // Same as order
      soundBuffersRef.current.set('payout', payoutBuf);
      soundBuffersRef.current.set('shipping', shippingBuf);
      soundBuffersRef.current.set('general', messageBuf); // Default
      
      initializedRef.current = true;
    } catch (error) {
      console.log('Audio initialization failed:', error);
    }
  }, []);

  const playSound = useCallback(async (type: NotificationSoundType = 'general') => {
    try {
      if (!initializedRef.current) {
        await initializeAudio();
      }

      const audioContext = audioContextRef.current;
      const buffer = soundBuffersRef.current.get(type) || soundBuffersRef.current.get('general');

      if (audioContext && buffer) {
        if (audioContext.state === 'suspended') {
          await audioContext.resume();
        }

        const source = audioContext.createBufferSource();
        const gainNode = audioContext.createGain();
        
        source.buffer = buffer;
        gainNode.gain.value = 0.6;
        
        source.connect(gainNode);
        gainNode.connect(audioContext.destination);
        source.start(0);
      }
    } catch (error) {
      console.log('Sound playback failed:', error);
    }
  }, [initializeAudio]);

  useEffect(() => {
    const handleInteraction = () => initializeAudio();
    
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });
    window.addEventListener('keydown', handleInteraction, { once: true });
    
    return () => {
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
    };
  }, [initializeAudio]);

  return { 
    playSound, 
    playMessageSound: () => playSound('message'),
    playOrderSound: () => playSound('order'),
    playPayoutSound: () => playSound('payout'),
    playShippingSound: () => playSound('shipping'),
    playBidSound: () => playSound('bid'),
    initializeAudio 
  };
};

export default useNotificationSound;
