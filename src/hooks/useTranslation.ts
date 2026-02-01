import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLanguage } from '@/contexts/LanguageContext';

interface TranslationCache {
  [key: string]: {
    [targetLang: string]: string;
  };
}

const translationCache: TranslationCache = {};

export const useMessageTranslation = () => {
  const { language } = useLanguage();
  const [isTranslating, setIsTranslating] = useState(false);

  const translateMessage = useCallback(async (
    text: string,
    messageId: string,
    targetLanguage?: string
  ): Promise<string> => {
    const targetLang = targetLanguage || language;
    
    // Check cache first
    const cacheKey = `${messageId}_${text.substring(0, 50)}`;
    if (translationCache[cacheKey]?.[targetLang]) {
      return translationCache[cacheKey][targetLang];
    }

    // Skip translation for very short messages or if it looks like the target language
    if (text.length < 5) {
      return text;
    }

    try {
      setIsTranslating(true);
      
      const { data, error } = await supabase.functions.invoke('translate-message', {
        body: { 
          text, 
          targetLanguage: targetLang 
        }
      });

      if (error) {
        console.error('Translation error:', error);
        return text;
      }

      const translatedText = data?.translatedText || text;
      
      // Cache the result
      if (!translationCache[cacheKey]) {
        translationCache[cacheKey] = {};
      }
      translationCache[cacheKey][targetLang] = translatedText;

      return translatedText;
    } catch (err) {
      console.error('Translation failed:', err);
      return text;
    } finally {
      setIsTranslating(false);
    }
  }, [language]);

  const translateBatch = useCallback(async (
    messages: Array<{ id: string; content: string }>,
    targetLanguage?: string
  ): Promise<Map<string, string>> => {
    const targetLang = targetLanguage || language;
    const results = new Map<string, string>();
    
    // Process in parallel with rate limiting
    const batchSize = 5;
    for (let i = 0; i < messages.length; i += batchSize) {
      const batch = messages.slice(i, i + batchSize);
      const translations = await Promise.all(
        batch.map(msg => translateMessage(msg.content, msg.id, targetLang))
      );
      batch.forEach((msg, idx) => {
        results.set(msg.id, translations[idx]);
      });
    }
    
    return results;
  }, [language, translateMessage]);

  return {
    translateMessage,
    translateBatch,
    isTranslating,
    userLanguage: language
  };
};

// Hook to get user's preferred language from profile
export const useUserLanguage = (userId?: string) => {
  const [preferredLanguage, setPreferredLanguage] = useState<string>('ro');
  
  useEffect(() => {
    if (!userId) return;
    
    const fetchLanguage = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('preferred_language')
        .eq('user_id', userId)
        .single();
      
      if (data?.preferred_language) {
        setPreferredLanguage(data.preferred_language);
      }
    };
    
    fetchLanguage();
  }, [userId]);
  
  return preferredLanguage;
};
