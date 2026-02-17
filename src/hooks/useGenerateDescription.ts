import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useGenerateDescription() {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const generateDescription = async (
    title: string,
    category?: string,
    condition?: string
  ): Promise<string | null> => {
    if (!title.trim()) {
      toast({
        title: 'Completează titlul',
        description: 'Adaugă un titlu pentru produs ca să generăm descrierea.',
        variant: 'destructive',
      });
      return null;
    }

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-description', {
        body: { title, category, condition },
      });

      if (error) {
        console.error('Generate description error:', error);
        toast({
          title: 'Eroare',
          description: 'Nu s-a putut genera descrierea. Încearcă din nou.',
          variant: 'destructive',
        });
        return null;
      }

      if (data?.success && data?.description) {
        toast({
          title: '✨ Descriere generată!',
          description: 'Poți edita descrierea după preferințele tale.',
        });
        return data.description;
      }

      toast({
        title: 'Eroare',
        description: data?.error || 'Nu s-a putut genera descrierea.',
        variant: 'destructive',
      });
      return null;
    } catch (err: any) {
      console.error('Generate description failed:', err);
      toast({
        title: 'Eroare',
        description: 'Serviciul nu este disponibil momentan.',
        variant: 'destructive',
      });
      return null;
    } finally {
      setGenerating(false);
    }
  };

  return { generateDescription, generating };
}
