import * as React from "react";

// Responsive breakpoints matching Tailwind CSS defaults
const MOBILE_BREAKPOINT = 768;
const TABLET_BREAKPOINT = 1024;
const DESKTOP_BREAKPOINT = 1280;

// Check if user agent indicates mobile device
const checkUserAgent = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(ua);
};

// Check if touch is supported
const checkTouchSupport = (): boolean => {
  if (typeof window === 'undefined') return false;
  return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
};

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    // Initial check combines width and user agent
    return window.innerWidth < MOBILE_BREAKPOINT || checkUserAgent();
  });

  React.useEffect(() => {
    const checkMobile = () => {
      const widthCheck = window.innerWidth < MOBILE_BREAKPOINT;
      const userAgentCheck = checkUserAgent();
      // Device is mobile if either screen is small OR user agent indicates mobile
      setIsMobile(widthCheck || userAgentCheck);
    };

    // Initial check
    checkMobile();

    // Media query listener for responsiveness
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => checkMobile();
    
    mql.addEventListener("change", onChange);
    window.addEventListener("resize", checkMobile);
    window.addEventListener("orientationchange", checkMobile);
    
    return () => {
      mql.removeEventListener("change", onChange);
      window.removeEventListener("resize", checkMobile);
      window.removeEventListener("orientationchange", checkMobile);
    };
  }, []);

  return isMobile;
}

export function useIsTablet() {
  const [isTablet, setIsTablet] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    const width = window.innerWidth;
    return width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT;
  });

  React.useEffect(() => {
    const checkTablet = () => {
      const width = window.innerWidth;
      setIsTablet(width >= MOBILE_BREAKPOINT && width < TABLET_BREAKPOINT);
    };

    checkTablet();
    window.addEventListener("resize", checkTablet);
    window.addEventListener("orientationchange", checkTablet);
    
    return () => {
      window.removeEventListener("resize", checkTablet);
      window.removeEventListener("orientationchange", checkTablet);
    };
  }, []);

  return isTablet;
}

export function useIsDesktop() {
  const [isDesktop, setIsDesktop] = React.useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth >= TABLET_BREAKPOINT && !checkUserAgent();
  });

  React.useEffect(() => {
    const checkDesktop = () => {
      const widthCheck = window.innerWidth >= TABLET_BREAKPOINT;
      const notMobileAgent = !checkUserAgent();
      setIsDesktop(widthCheck && notMobileAgent);
    };

    checkDesktop();
    window.addEventListener("resize", checkDesktop);
    
    return () => {
      window.removeEventListener("resize", checkDesktop);
    };
  }, []);

  return isDesktop;
}

// Comprehensive device info hook
export function useDeviceInfo() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const hasTouch = React.useMemo(() => checkTouchSupport(), []);
  const isMobileAgent = React.useMemo(() => checkUserAgent(), []);

  return {
    isMobile,
    isTablet,
    isDesktop,
    hasTouch,
    isMobileAgent,
    // Convenience getters
    isPhone: isMobile && !isTablet,
    isLaptop: isDesktop && !hasTouch,
  };
}

// Hook for responsive value selection (like eBay approach)
export function useResponsiveValue<T>(mobileValue: T, tabletValue: T, desktopValue: T): T {
  const { isMobile, isTablet } = useDeviceInfo();
  
  if (isMobile) return mobileValue;
  if (isTablet) return tabletValue;
  return desktopValue;
}
