import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VerificationResult {
  isReal: boolean;
  confidence: number;
  issues: string[];
  action: 'keep' | 'flag' | 'delete';
  reason: string;
}

export function useImageUpload() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const verifyImage = async (imageUrl: string, listingId: string): Promise<VerificationResult | null> => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-image', {
        body: { imageUrl, listingId, action: 'verify_single' }
      });

      if (error) {
        console.error('Image verification error:', error);
        return null;
      }

      return data?.verification || null;
    } catch (error) {
      console.error('Image verification failed:', error);
      return null;
    }
  };

  const uploadImage = async (file: File, listingId: string, autoVerify = true): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${listingId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('listings')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('listings')
        .getPublicUrl(fileName);

      // Auto-verify the uploaded image
      if (autoVerify) {
        const verification = await verifyImage(publicUrl, listingId);
        
        if (verification) {
          if (verification.action === 'delete') {
            // Image was auto-deleted as fake
            toast({
              title: '⚠️ Imagine respinsă',
              description: `Imaginea a fost identificată ca falsă: ${verification.reason}`,
              variant: 'destructive'
            });
            return null;
          } else if (verification.action === 'flag') {
            toast({
              title: 'ℹ️ Imagine marcată pentru verificare',
              description: verification.reason,
            });
          }
        }
      }

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: 'Eroare la încărcare',
        description: error.message || 'Nu s-a putut încărca imaginea',
        variant: 'destructive'
      });
      return null;
    }
  };

  const uploadMultipleImages = async (files: File[], listingId: string, autoVerify = true): Promise<string[]> => {
    setUploading(true);
    const urls: string[] = [];

    try {
      for (const file of files) {
        const url = await uploadImage(file, listingId, autoVerify);
        if (url) {
          urls.push(url);
        }
      }
    } finally {
      setUploading(false);
    }

    return urls;
  };

  const deleteImage = async (imageUrl: string): Promise<boolean> => {
    try {
      // Extract path from URL
      const url = new URL(imageUrl);
      const pathParts = url.pathname.split('/storage/v1/object/public/listings/');
      if (pathParts.length < 2) return false;
      
      const filePath = pathParts[1];
      
      const { error } = await supabase.storage
        .from('listings')
        .remove([filePath]);

      if (error) throw error;
      return true;
    } catch (error: any) {
      console.error('Error deleting image:', error);
      return false;
    }
  };

  return {
    uploadImage,
    uploadMultipleImages,
    deleteImage,
    verifyImage,
    uploading
  };
}
