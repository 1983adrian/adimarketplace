import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export function useImageUpload() {
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);

  const uploadImage = async (file: File, listingId: string): Promise<string | null> => {
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

  const uploadMultipleImages = async (files: File[], listingId: string): Promise<string[]> => {
    setUploading(true);
    const urls: string[] = [];

    try {
      for (const file of files) {
        const url = await uploadImage(file, listingId);
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
    uploading
  };
}
