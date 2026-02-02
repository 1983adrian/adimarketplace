import { useState, useEffect, useCallback, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';

// Cache for translations to avoid repeated API calls
const translationCache = new Map<string, string>();

// Generate cache key
const getCacheKey = (text: string, targetLang: string): string => {
  return `${targetLang}:${text.slice(0, 100)}`;
};

interface TranslationResult {
  translatedText: string;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook to translate dynamic content (product titles, descriptions, etc.)
 * Uses AI-powered translation via edge function
 */
export const useContentTranslation = (
  originalText: string | null | undefined,
  options?: {
    skip?: boolean;
    sourceLang?: string;
  }
): TranslationResult => {
  const { language } = useLanguage();
  const [translatedText, setTranslatedText] = useState<string>(originalText || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    // If no text or skip flag, return original
    if (!originalText || options?.skip) {
      setTranslatedText(originalText || '');
      return;
    }

    // Romanian is the source language - no translation needed
    if (language === 'ro') {
      setTranslatedText(originalText);
      return;
    }

    // Check cache first
    const cacheKey = getCacheKey(originalText, language);
    const cached = translationCache.get(cacheKey);
    if (cached) {
      setTranslatedText(cached);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    const translateContent = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const { data, error: funcError } = await supabase.functions.invoke('translate-message', {
          body: {
            text: originalText,
            targetLanguage: language,
            sourceLanguage: options?.sourceLang || 'ro',
          },
        });

        if (funcError) throw funcError;

        const translated = data?.translatedText || originalText;
        
        // Cache the result
        translationCache.set(cacheKey, translated);
        setTranslatedText(translated);
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.error('Translation error:', err);
          setError(err.message || 'Translation failed');
          setTranslatedText(originalText);
        }
      } finally {
        setIsLoading(false);
      }
    };

    // Debounce translation
    const timeoutId = setTimeout(translateContent, 100);
    
    return () => {
      clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [originalText, language, options?.skip, options?.sourceLang]);

  return { translatedText, isLoading, error };
};

/**
 * Batch translation hook for multiple texts (e.g., list of products)
 */
export const useBatchTranslation = (
  texts: (string | null | undefined)[],
  options?: { skip?: boolean }
): { translations: string[]; isLoading: boolean } => {
  const { language } = useLanguage();
  const [translations, setTranslations] = useState<string[]>(texts.map(t => t || ''));
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (options?.skip || language === 'ro') {
      setTranslations(texts.map(t => t || ''));
      return;
    }

    const translateAll = async () => {
      setIsLoading(true);
      
      const results = await Promise.all(
        texts.map(async (text) => {
          if (!text) return '';
          
          const cacheKey = getCacheKey(text, language);
          const cached = translationCache.get(cacheKey);
          if (cached) return cached;

          try {
            const { data } = await supabase.functions.invoke('translate-message', {
              body: {
                text,
                targetLanguage: language,
                sourceLanguage: 'ro',
              },
            });
            
            const translated = data?.translatedText || text;
            translationCache.set(cacheKey, translated);
            return translated;
          } catch {
            return text;
          }
        })
      );

      setTranslations(results);
      setIsLoading(false);
    };

    translateAll();
  }, [texts.join('|'), language, options?.skip]);

  return { translations, isLoading };
};

/**
 * Clear translation cache (useful when language changes)
 */
export const clearTranslationCache = (): void => {
  translationCache.clear();
};
