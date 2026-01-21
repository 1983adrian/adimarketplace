import { useState, useEffect } from 'react';

interface SafeAreaInsets {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

// Minimum safe padding for different scenarios - INCREASED for all devices
const MIN_HEADER_PADDING = 48;
const PWA_STANDALONE_PADDING = 64;
const NOTCH_DEVICE_PADDING = 64; // Increased to ensure visibility on all notch devices

export const useSafeArea = () => {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: PWA_STANDALONE_PADDING, // Start with larger default
    right: 0,
    bottom: 0,
    left: 0,
  });
  const [isStandalone, setIsStandalone] = useState(false);
  const [hasNotch, setHasNotch] = useState(true); // Assume notch by default for safety

  useEffect(() => {
    // Check if running as PWA standalone
    const checkStandalone = () => {
      const standalone = 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://');
      setIsStandalone(standalone);
    };

    // Detect notch devices based on screen dimensions and pixel ratio
    const detectNotch = () => {
      const { screen } = window;
      const screenHeight = Math.max(screen.height, screen.width);
      const screenWidth = Math.min(screen.height, screen.width);
      const pixelRatio = window.devicePixelRatio || 1;

      // Common notch device screen dimensions (logical pixels)
      const notchDevices = [
        // iPhone X, XS, 11 Pro
        { w: 375, h: 812 },
        // iPhone XR, 11
        { w: 414, h: 896 },
        // iPhone XS Max, 11 Pro Max
        { w: 414, h: 896 },
        // iPhone 12 mini
        { w: 360, h: 780 },
        // iPhone 12, 12 Pro, 13, 13 Pro, 14
        { w: 390, h: 844 },
        // iPhone 12 Pro Max, 13 Pro Max, 14 Plus
        { w: 428, h: 926 },
        // iPhone 14 Pro
        { w: 393, h: 852 },
        // iPhone 14 Pro Max
        { w: 430, h: 932 },
        // iPhone 15, 15 Pro
        { w: 393, h: 852 },
        // iPhone 15 Plus, 15 Pro Max
        { w: 430, h: 932 },
      ];

      const isNotchDevice = notchDevices.some(
        device => 
          (screenWidth === device.w && screenHeight === device.h) ||
          (Math.abs(screenWidth - device.w) <= 5 && Math.abs(screenHeight - device.h) <= 10)
      );

      // Also check for Android devices with notch (generally have aspect ratio > 2:1)
      const aspectRatio = screenHeight / screenWidth;
      const isLikelyAndroidNotch = aspectRatio > 2 && pixelRatio >= 2;

      setHasNotch(isNotchDevice || isLikelyAndroidNotch);
    };

    // Calculate safe area from CSS env() values
    const calculateInsets = () => {
      const testDiv = document.createElement('div');
      testDiv.style.cssText = `
        position: fixed;
        top: env(safe-area-inset-top, 0px);
        right: env(safe-area-inset-right, 0px);
        bottom: env(safe-area-inset-bottom, 0px);
        left: env(safe-area-inset-left, 0px);
        pointer-events: none;
        visibility: hidden;
      `;
      document.body.appendChild(testDiv);
      
      const computed = getComputedStyle(testDiv);
      const top = parseInt(computed.top) || 0;
      const right = parseInt(computed.right) || 0;
      const bottom = parseInt(computed.bottom) || 0;
      const left = parseInt(computed.left) || 0;
      
      document.body.removeChild(testDiv);

      // Determine final top padding based on all factors
      let finalTop = Math.max(top, MIN_HEADER_PADDING);
      
      if (isStandalone) {
        finalTop = Math.max(finalTop, PWA_STANDALONE_PADDING);
      }
      
      if (hasNotch && top < NOTCH_DEVICE_PADDING) {
        finalTop = Math.max(finalTop, NOTCH_DEVICE_PADDING);
      }

      setInsets({
        top: finalTop,
        right,
        bottom,
        left,
      });
    };

    checkStandalone();
    detectNotch();
    
    // Small delay to ensure CSS env() values are available
    const timer = setTimeout(calculateInsets, 100);

    // Listen for orientation changes
    const handleResize = () => {
      detectNotch();
      calculateInsets();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [isStandalone, hasNotch]);

  return {
    insets,
    isStandalone,
    hasNotch,
    headerPadding: insets.top,
  };
};
