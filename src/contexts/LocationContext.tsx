import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface LocationInfo {
  countryCode: string;
  countryName: string;
  city?: string;
  region?: string;
  timezone?: string;
}

// Country to language mapping
const COUNTRY_LANGUAGE: Record<string, string> = {
  RO: 'ro',
  MD: 'ro', // Moldova
  GB: 'en',
  US: 'en',
  AU: 'en',
  CA: 'en',
  IE: 'en',
  NZ: 'en',
};

// Country to shipping carriers mapping
export const COUNTRY_CARRIERS: Record<string, string[]> = {
  // Romania
  RO: ['Fan Courier', 'Cargus', 'DPD Romania', 'GLS Romania', 'Sameday', 'Urgent Cargus', 'FedEx Romania'],
  // UK
  GB: ['Royal Mail', 'DPD UK', 'Hermes', 'Evri', 'Parcelforce', 'DHL UK', 'UPS UK', 'FedEx UK', 'Yodel'],
  // USA
  US: ['USPS', 'UPS', 'FedEx', 'DHL Express', 'Amazon Logistics', 'OnTrac'],
  // Germany
  DE: ['DHL', 'DPD', 'Hermes', 'GLS', 'UPS', 'FedEx', 'Deutsche Post'],
  // France
  FR: ['La Poste', 'Colissimo', 'Chronopost', 'DPD France', 'GLS France', 'UPS France', 'FedEx France'],
  // Italy
  IT: ['Poste Italiane', 'BRT', 'GLS Italy', 'DHL Italy', 'UPS Italy', 'FedEx Italy', 'SDA'],
  // Spain
  ES: ['Correos', 'MRW', 'SEUR', 'DHL Spain', 'UPS Spain', 'GLS Spain', 'FedEx Spain'],
  // Netherlands
  NL: ['PostNL', 'DHL Netherlands', 'DPD', 'UPS', 'GLS Netherlands', 'FedEx'],
  // Belgium
  BE: ['bpost', 'PostNL Belgium', 'DPD Belgium', 'GLS Belgium', 'DHL', 'UPS Belgium'],
  // Poland
  PL: ['Poczta Polska', 'InPost', 'DPD Poland', 'DHL Poland', 'GLS Poland', 'UPS Poland'],
  // Czech Republic
  CZ: ['Česká pošta', 'PPL', 'DPD CZ', 'GLS CZ', 'DHL CZ', 'UPS CZ'],
  // Hungary
  HU: ['Magyar Posta', 'GLS Hungary', 'DPD Hungary', 'DHL Hungary', 'UPS Hungary', 'FedEx Hungary'],
  // Bulgaria
  BG: ['Български пощи', 'Speedy', 'Econt', 'DHL Bulgaria', 'UPS Bulgaria'],
  // Sweden
  SE: ['PostNord', 'DHL Sweden', 'UPS Sweden', 'Bring', 'Schenker'],
  // Denmark
  DK: ['PostNord', 'GLS Denmark', 'DHL Denmark', 'UPS Denmark', 'Bring'],
  // Norway
  NO: ['Posten Norge', 'Bring', 'PostNord', 'DHL Norway', 'UPS Norway'],
  // Austria
  AT: ['Österreichische Post', 'DPD Austria', 'GLS Austria', 'DHL Austria', 'UPS Austria'],
  // Switzerland
  CH: ['Swiss Post', 'DHL Switzerland', 'DPD Switzerland', 'UPS Switzerland', 'FedEx'],
  // Ireland
  IE: ['An Post', 'DPD Ireland', 'GLS Ireland', 'Fastway', 'UPS Ireland'],
  // Portugal
  PT: ['CTT', 'DPD Portugal', 'GLS Portugal', 'DHL Portugal', 'UPS Portugal', 'FedEx Portugal'],
  // Greece
  GR: ['ELTA', 'ACS Courier', 'Speedex', 'DHL Greece', 'UPS Greece'],
};

// Default carriers for unknown countries
const DEFAULT_CARRIERS = ['DHL Express', 'UPS', 'FedEx', 'EMS'];

interface LocationContextType {
  location: LocationInfo | null;
  isLoading: boolean;
  carriers: string[];
  preferredLanguage: string;
  detectLocation: () => Promise<void>;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [location, setLocation] = useState<LocationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const detectLocation = async () => {
    setIsLoading(true);
    
    // Try timezone detection first
    try {
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const countryFromTimezone = getCountryFromTimezone(timezone);
      
      if (countryFromTimezone) {
        setLocation({
          countryCode: countryFromTimezone.code,
          countryName: countryFromTimezone.name,
          timezone,
        });
        setIsLoading(false);
        localStorage.setItem('detectedCountry', countryFromTimezone.code);
        return;
      }
    } catch (e) {
      console.log('Could not detect from timezone');
    }

    // Try IP geolocation
    try {
      const response = await fetch('https://ipapi.co/json/', { 
        signal: AbortSignal.timeout(5000) 
      });
      if (response.ok) {
        const data = await response.json();
        if (data.country_code) {
          setLocation({
            countryCode: data.country_code,
            countryName: data.country_name || data.country_code,
            city: data.city,
            region: data.region,
            timezone: data.timezone,
          });
          localStorage.setItem('detectedCountry', data.country_code);
        }
      }
    } catch (e) {
      console.log('Could not detect from IP');
      // Default to UK if detection fails
      setLocation({
        countryCode: 'GB',
        countryName: 'United Kingdom',
      });
    }
    
    setIsLoading(false);
  };

  useEffect(() => {
    // Check for cached location first
    const cached = localStorage.getItem('detectedCountry');
    if (cached) {
      const countryInfo = COUNTRY_NAMES[cached];
      if (countryInfo) {
        setLocation({
          countryCode: cached,
          countryName: countryInfo,
        });
        setIsLoading(false);
        return;
      }
    }
    detectLocation();
  }, []);

  const carriers = location?.countryCode 
    ? COUNTRY_CARRIERS[location.countryCode] || DEFAULT_CARRIERS
    : DEFAULT_CARRIERS;

  const preferredLanguage = location?.countryCode
    ? COUNTRY_LANGUAGE[location.countryCode] || 'en'
    : 'en';

  return (
    <LocationContext.Provider value={{ 
      location, 
      isLoading, 
      carriers,
      preferredLanguage,
      detectLocation 
    }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

// Helper data
const COUNTRY_NAMES: Record<string, string> = {
  GB: 'United Kingdom',
  US: 'United States',
  RO: 'Romania',
  DE: 'Germany',
  FR: 'France',
  IT: 'Italy',
  ES: 'Spain',
  NL: 'Netherlands',
  BE: 'Belgium',
  PL: 'Poland',
  CZ: 'Czech Republic',
  HU: 'Hungary',
  BG: 'Bulgaria',
  SE: 'Sweden',
  DK: 'Denmark',
  NO: 'Norway',
  AT: 'Austria',
  CH: 'Switzerland',
  IE: 'Ireland',
  PT: 'Portugal',
  GR: 'Greece',
};

function getCountryFromTimezone(timezone: string): { code: string; name: string } | null {
  const timezoneCountryMap: Record<string, { code: string; name: string }> = {
    'Europe/London': { code: 'GB', name: 'United Kingdom' },
    'Europe/Bucharest': { code: 'RO', name: 'Romania' },
    'Europe/Berlin': { code: 'DE', name: 'Germany' },
    'Europe/Paris': { code: 'FR', name: 'France' },
    'Europe/Rome': { code: 'IT', name: 'Italy' },
    'Europe/Madrid': { code: 'ES', name: 'Spain' },
    'Europe/Amsterdam': { code: 'NL', name: 'Netherlands' },
    'Europe/Brussels': { code: 'BE', name: 'Belgium' },
    'Europe/Vienna': { code: 'AT', name: 'Austria' },
    'Europe/Dublin': { code: 'IE', name: 'Ireland' },
    'Europe/Lisbon': { code: 'PT', name: 'Portugal' },
    'Europe/Athens': { code: 'GR', name: 'Greece' },
    'Europe/Helsinki': { code: 'FI', name: 'Finland' },
    'Europe/Warsaw': { code: 'PL', name: 'Poland' },
    'Europe/Prague': { code: 'CZ', name: 'Czech Republic' },
    'Europe/Budapest': { code: 'HU', name: 'Hungary' },
    'Europe/Sofia': { code: 'BG', name: 'Bulgaria' },
    'Europe/Stockholm': { code: 'SE', name: 'Sweden' },
    'Europe/Copenhagen': { code: 'DK', name: 'Denmark' },
    'Europe/Oslo': { code: 'NO', name: 'Norway' },
    'Europe/Zurich': { code: 'CH', name: 'Switzerland' },
    'America/New_York': { code: 'US', name: 'United States' },
    'America/Los_Angeles': { code: 'US', name: 'United States' },
    'America/Chicago': { code: 'US', name: 'United States' },
    'America/Denver': { code: 'US', name: 'United States' },
  };
  return timezoneCountryMap[timezone] || null;
}
