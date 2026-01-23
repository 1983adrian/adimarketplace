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

// Cancel/Error sound - descending tones
const createCancelSoundBuffer = async (audioContext: AudioContext): Promise<AudioBuffer> => {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.5;
  const samples = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, samples, sampleRate);
  const channelData = buffer.getChannelData(0);

  // Descending sad tones
  const frequencies = [523.25, 392, 329.63]; // C5, G4, E4
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    
    // First tone (0-0.15s)
    if (t < 0.15) {
      const envelope = Math.exp(-t * 12);
      sample += Math.sin(2 * Math.PI * frequencies[0] * t) * envelope;
    }
    // Second tone (0.15-0.30s)
    else if (t < 0.30) {
      const localT = t - 0.15;
      const envelope = Math.exp(-localT * 12);
      sample += Math.sin(2 * Math.PI * frequencies[1] * localT) * envelope;
    }
    // Third tone (0.30-0.5s)
    else {
      const localT = t - 0.30;
      const envelope = Math.exp(-localT * 8);
      sample += Math.sin(2 * Math.PI * frequencies[2] * localT) * envelope;
    }
    
    channelData[i] = sample * 0.35;
  }

  return buffer;
};

// Friend request sound - gentle chime
const createFriendSoundBuffer = async (audioContext: AudioContext): Promise<AudioBuffer> => {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.4;
  const samples = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, samples, sampleRate);
  const channelData = buffer.getChannelData(0);

  // Happy ascending chime
  const frequencies = [523.25, 659.25, 783.99]; // C5, E5, G5
  
  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    
    // All tones together with staggered starts
    frequencies.forEach((freq, idx) => {
      const startTime = idx * 0.08;
      if (t >= startTime) {
        const localT = t - startTime;
        const envelope = Math.exp(-localT * 6);
        sample += Math.sin(2 * Math.PI * freq * localT) * envelope * 0.3;
      }
    });
    
    channelData[i] = sample * 0.5;
  }

  return buffer;
};

// Favorite/Save sound - heart beat with magical sparkle
const createFavoriteSoundBuffer = async (audioContext: AudioContext): Promise<AudioBuffer> => {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.35;
  const samples = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, samples, sampleRate);
  const channelData = buffer.getChannelData(0);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    let sample = 0;
    
    // First "pop" - like a heart beat
    if (t < 0.08) {
      const envelope = Math.exp(-t * 40);
      sample += Math.sin(2 * Math.PI * 400 * t) * envelope * 0.6;
      sample += Math.sin(2 * Math.PI * 600 * t) * envelope * 0.3;
    }
    
    // Magical sparkle ascending
    if (t > 0.05 && t < 0.25) {
      const localT = t - 0.05;
      const envelope = Math.exp(-localT * 8);
      const freq = 800 + localT * 3000; // Sweep up
      sample += Math.sin(2 * Math.PI * freq * localT) * envelope * 0.25;
    }
    
    // Final soft chime
    if (t > 0.12) {
      const localT = t - 0.12;
      const envelope = Math.exp(-localT * 6);
      sample += Math.sin(2 * Math.PI * 1200 * localT) * envelope * 0.2;
      sample += Math.sin(2 * Math.PI * 1500 * localT) * envelope * 0.15;
    }
    
    channelData[i] = sample * 0.5;
  }

  return buffer;
};

// Bell/Notification sound - classic bell ding
const createBellSoundBuffer = async (audioContext: AudioContext): Promise<AudioBuffer> => {
  const sampleRate = audioContext.sampleRate;
  const duration = 0.6;
  const samples = sampleRate * duration;
  const buffer = audioContext.createBuffer(1, samples, sampleRate);
  const channelData = buffer.getChannelData(0);

  for (let i = 0; i < samples; i++) {
    const t = i / sampleRate;
    
    // Bell frequencies (fundamental + harmonics)
    const f1 = 880; // A5
    const f2 = 1760; // A6
    const f3 = 2640; // E7
    
    const envelope = Math.exp(-t * 5);
    const strike = t < 0.02 ? (1 - t / 0.02) * 0.3 : 0;
    
    let sample = 0;
    sample += Math.sin(2 * Math.PI * f1 * t) * envelope * 0.4;
    sample += Math.sin(2 * Math.PI * f2 * t) * envelope * 0.25;
    sample += Math.sin(2 * Math.PI * f3 * t) * envelope * 0.15;
    sample += strike * (Math.random() * 2 - 1);
    
    channelData[i] = sample * 0.5;
  }

  return buffer;
};

export type NotificationSoundType = 'message' | 'order' | 'payout' | 'shipping' | 'bid' | 'general' | 'cancel' | 'friend' | 'favorite' | 'bell';

export const useNotificationSound = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundBuffersRef = useRef<Map<NotificationSoundType, AudioBuffer>>(new Map());
  const initializedRef = useRef(false);

  const initializeAudio = useCallback(async () => {
    if (initializedRef.current) return;
    
    try {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // Pre-generate all sound buffers
      const [messageBuf, saleBuf, payoutBuf, shippingBuf, cancelBuf, friendBuf, favoriteBuf, bellBuf] = await Promise.all([
        createNotificationSoundBuffer(audioContextRef.current),
        createSaleSoundBuffer(audioContextRef.current),
        createPayoutSoundBuffer(audioContextRef.current),
        createShippingSoundBuffer(audioContextRef.current),
        createCancelSoundBuffer(audioContextRef.current),
        createFriendSoundBuffer(audioContextRef.current),
        createFavoriteSoundBuffer(audioContextRef.current),
        createBellSoundBuffer(audioContextRef.current),
      ]);
      
      soundBuffersRef.current.set('message', messageBuf);
      soundBuffersRef.current.set('order', saleBuf);
      soundBuffersRef.current.set('bid', saleBuf); // Same as order
      soundBuffersRef.current.set('payout', payoutBuf);
      soundBuffersRef.current.set('shipping', shippingBuf);
      soundBuffersRef.current.set('cancel', cancelBuf);
      soundBuffersRef.current.set('friend', friendBuf);
      soundBuffersRef.current.set('favorite', favoriteBuf);
      soundBuffersRef.current.set('bell', bellBuf);
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
    playCancelSound: () => playSound('cancel'),
    playFriendSound: () => playSound('friend'),
    playFavoriteSound: () => playSound('favorite'),
    playBellSound: () => playSound('bell'),
    initializeAudio 
  };
};

export default useNotificationSound;
