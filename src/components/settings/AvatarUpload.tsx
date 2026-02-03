import React, { useState, useRef } from 'react';
import { Camera, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AvatarUploadProps {
  currentAvatarUrl: string | null;
  displayName: string;
  userId: string;
  onAvatarChange: (url: string) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  currentAvatarUrl,
  displayName,
  userId,
  onAvatarChange,
}) => {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validare tip fișier
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Tip fișier invalid',
        description: 'Te rugăm să selectezi o imagine (JPG, PNG, GIF)',
        variant: 'destructive',
      });
      return;
    }

    // Validare dimensiune (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Fișier prea mare',
        description: 'Dimensiunea maximă permisă este 5MB',
        variant: 'destructive',
      });
      return;
    }

    // Preview local
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);

    setUploading(true);

    try {
      // Generează nume unic pentru fișier
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      // Șterge avatar-ul vechi dacă există
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').slice(-2).join('/');
        await supabase.storage.from('listings').remove([`avatars/${oldPath}`]);
      }

      // Upload fișier nou
      const { error: uploadError } = await supabase.storage
        .from('listings')
        .upload(`avatars/${fileName}`, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Obține URL-ul public
      const { data: publicUrlData } = supabase.storage
        .from('listings')
        .getPublicUrl(`avatars/${fileName}`);

      const newAvatarUrl = publicUrlData.publicUrl;

      // Actualizează profilul în baza de date
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('user_id', userId);

      if (updateError) throw updateError;

      onAvatarChange(newAvatarUrl);
      setPreviewUrl(null);

      toast({
        title: 'Avatar actualizat',
        description: 'Poza de profil a fost schimbată cu succes',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      setPreviewUrl(null);
      toast({
        title: 'Eroare la încărcare',
        description: error.message || 'Nu s-a putut încărca imaginea',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl) return;

    setUploading(true);
    try {
      // Actualizează profilul pentru a elimina avatar-ul
      const { error } = await supabase
        .from('profiles')
        .update({ avatar_url: null })
        .eq('user_id', userId);

      if (error) throw error;

      onAvatarChange('');
      toast({
        title: 'Avatar șters',
        description: 'Poza de profil a fost eliminată',
      });
    } catch (error: any) {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  const displayedUrl = previewUrl || currentAvatarUrl;

  return (
    <div className="flex items-center gap-6">
      <div className="relative">
        <Avatar className="h-24 w-24">
          <AvatarImage src={displayedUrl || undefined} />
          <AvatarFallback className="text-2xl bg-primary/10">
            {displayName?.[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          <Camera className="h-4 w-4" />
          {currentAvatarUrl ? 'Schimbă Avatar' : 'Adaugă Avatar'}
        </Button>
        {currentAvatarUrl && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveAvatar}
            disabled={uploading}
            className="gap-2 text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
            Șterge Avatar
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          JPG, PNG sau GIF. Max 5MB.
        </p>
      </div>
    </div>
  );
};
