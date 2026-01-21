import { usePlatformSettings } from '@/hooks/useAdminSettings';

interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: 'weak' | 'medium' | 'strong' | 'very-strong';
}

interface SecurityAuthSettings {
  leakedPasswordProtection: boolean;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
}

// Check if password has been leaked using HaveIBeenPwned API (k-anonymity model)
async function checkLeakedPassword(password: string): Promise<boolean> {
  try {
    // Create SHA-1 hash of the password
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-1', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase();
    
    // Use k-anonymity: only send first 5 chars of hash
    const prefix = hashHex.substring(0, 5);
    const suffix = hashHex.substring(5);
    
    const response = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { 'Add-Padding': 'true' }
    });
    
    if (!response.ok) {
      console.warn('HaveIBeenPwned API error:', response.status);
      return false; // Don't block user on API failure
    }
    
    const text = await response.text();
    const lines = text.split('\n');
    
    // Check if our suffix is in the list of leaked passwords
    for (const line of lines) {
      const [hashSuffix, count] = line.split(':');
      if (hashSuffix.trim() === suffix) {
        const leakCount = parseInt(count.trim(), 10);
        if (leakCount > 0) {
          console.log(`Password found in ${leakCount} data breaches`);
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error checking leaked password:', error);
    return false; // Don't block user on error
  }
}

// Calculate password strength
function calculateStrength(password: string): 'weak' | 'medium' | 'strong' | 'very-strong' {
  let score = 0;
  
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (password.length >= 16) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated chars
  
  if (score <= 2) return 'weak';
  if (score <= 4) return 'medium';
  if (score <= 6) return 'strong';
  return 'very-strong';
}

export function validatePasswordSync(
  password: string,
  settings?: SecurityAuthSettings
): Omit<PasswordValidationResult, 'isValid'> & { syncErrors: string[] } {
  const errors: string[] = [];
  
  // Default settings if not provided
  const minLength = settings?.passwordMinLength || 6;
  const requireUppercase = settings?.passwordRequireUppercase ?? false;
  const requireNumbers = settings?.passwordRequireNumbers ?? false;
  const requireSymbols = settings?.passwordRequireSymbols ?? false;
  
  // Check minimum length
  if (password.length < minLength) {
    errors.push(`Parola trebuie să aibă minimum ${minLength} caractere`);
  }
  
  // Check uppercase
  if (requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Parola trebuie să conțină cel puțin o literă mare');
  }
  
  // Check numbers
  if (requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Parola trebuie să conțină cel puțin o cifră');
  }
  
  // Check symbols
  if (requireSymbols && !/[^a-zA-Z0-9]/.test(password)) {
    errors.push('Parola trebuie să conțină cel puțin un simbol (!@#$%^&*)');
  }
  
  // Common password patterns to reject
  const commonPatterns = [
    /^123456/,
    /^password/i,
    /^qwerty/i,
    /^abc123/i,
    /^111111/,
    /^12345678/,
    /^iloveyou/i,
  ];
  
  for (const pattern of commonPatterns) {
    if (pattern.test(password)) {
      errors.push('Această parolă este prea comună și ușor de ghicit');
      break;
    }
  }
  
  return {
    syncErrors: errors,
    errors,
    strength: calculateStrength(password),
  };
}

export async function validatePassword(
  password: string,
  settings?: SecurityAuthSettings
): Promise<PasswordValidationResult> {
  const { syncErrors, strength } = validatePasswordSync(password, settings);
  const errors = [...syncErrors];
  
  // Check leaked passwords if enabled
  const checkLeaked = settings?.leakedPasswordProtection ?? false;
  if (checkLeaked && password.length >= 4) {
    const isLeaked = await checkLeakedPassword(password);
    if (isLeaked) {
      errors.push('Această parolă a fost expusă într-o breșă de securitate. Te rugăm să alegi alta.');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength,
  };
}

export function usePasswordValidation() {
  const { data: platformSettings } = usePlatformSettings();
  
  const getSecuritySettings = (): SecurityAuthSettings | undefined => {
    if (!platformSettings?.security_advanced) return undefined;
    
    const securityAdvanced = platformSettings.security_advanced as any;
    return securityAdvanced?.authentication as SecurityAuthSettings;
  };
  
  const validate = async (password: string): Promise<PasswordValidationResult> => {
    const settings = getSecuritySettings();
    return validatePassword(password, settings);
  };
  
  const validateSync = (password: string) => {
    const settings = getSecuritySettings();
    return validatePasswordSync(password, settings);
  };
  
  return {
    validate,
    validateSync,
    getSecuritySettings,
  };
}
