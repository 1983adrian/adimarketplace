import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Clock, XCircle, Camera, User, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VerificationData {
  idDocument?: string;
  selfieWithId?: string;
  uploadedAt?: string;
  status: 'pending' | 'approved' | 'rejected';
}

export const SellerVerification = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState<'id' | 'selfie' | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [idDocument, setIdDocument] = useState<string | null>(null);
  const [selfieWithId, setSelfieWithId] = useState<string | null>(null);

  const isVerified = (profile as any)?.is_verified || false;
  const verifiedAt = (profile as any)?.verified_at;
  const existingDocs = (profile as any)?.verification_documents as VerificationData | null;

  // Check if already submitted
  const hasSubmitted = existingDocs?.idDocument && existingDocs?.selfieWithId;

  const getVerificationStatus = () => {
    if (isVerified) return 'verified';
    if (hasSubmitted) return 'pending';
    return 'not_started';
  };

  const status = getVerificationStatus();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'selfie') => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploading(type);
    setUploadProgress(0);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${type}-${Date.now()}.${fileExt}`;
      
      const { error } = await supabase.storage
        .from('listings')
        .upload(`verification/${fileName}`, file);

      if (error) throw error;

      setUploadProgress(100);

      const { data: publicUrl } = supabase.storage
        .from('listings')
        .getPublicUrl(`verification/${fileName}`);

      if (type === 'id') {
        setIdDocument(publicUrl.publicUrl);
      } else {
        setSelfieWithId(publicUrl.publicUrl);
      }

      toast({
        title: type === 'id' ? 'Document ID încărcat' : 'Selfie încărcat',
        description: 'Fișierul a fost încărcat cu succes.',
      });
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Eroare la încărcare',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(null);
      setUploadProgress(0);
    }
  };

  const handleSubmitVerification = async () => {
    if (!user || !idDocument || !selfieWithId) {
      toast({
        title: 'Documente incomplete',
        description: 'Te rugăm să încarci atât documentul de identitate cât și selfie-ul.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const verificationData: VerificationData = {
        idDocument,
        selfieWithId,
        uploadedAt: new Date().toISOString(),
        status: 'pending',
      };

      const { error } = await supabase
        .from('profiles')
        .update({
          verification_documents: verificationData as any,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Create notification for admin
      await supabase.from('notifications').insert({
        user_id: user.id,
        type: 'verification_submitted',
        title: 'Cerere Verificare Trimisă',
        message: 'Documentele tale au fost trimise pentru verificare. Vei primi o notificare când procesul este finalizat.',
      });

      toast({
        title: 'Cerere trimisă!',
        description: 'Documentele au fost trimise pentru verificare. Vei primi o notificare în 24-48 ore.',
      });

      window.location.reload();
    } catch (error: any) {
      toast({
        title: 'Eroare',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Verificare Identitate Vânzător
        </CardTitle>
        <CardDescription>
          Verificarea se face o singură dată pentru a crește încrederea cumpărătorilor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Status Badge */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">Status:</span>
          {status === 'verified' && (
            <Badge className="gap-1 bg-green-500 hover:bg-green-600">
              <CheckCircle className="h-3 w-3" />
              Verificat
            </Badge>
          )}
          {status === 'pending' && (
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              În Așteptare Aprobare
            </Badge>
          )}
          {status === 'not_started' && (
            <Badge variant="outline" className="gap-1">
              <XCircle className="h-3 w-3" />
              Neverificat
            </Badge>
          )}
        </div>

        {isVerified && verifiedAt && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-800">Cont Verificat</AlertTitle>
            <AlertDescription className="text-green-700">
              Contul tău a fost verificat la {new Date(verifiedAt).toLocaleDateString('ro-RO')}.
              Badge-ul de verificare este vizibil pe profilul și produsele tale.
            </AlertDescription>
          </Alert>
        )}

        {status === 'pending' && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Verificare în Curs</AlertTitle>
            <AlertDescription>
              Documentele tale sunt în curs de verificare de către admin. Vei primi o notificare când procesul este finalizat.
              Timpul estimat: 24-48 ore.
            </AlertDescription>
          </Alert>
        )}

        {/* Upload Section - Only show if not verified and not submitted */}
        {!isVerified && !hasSubmitted && (
          <div className="space-y-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-medium mb-2">Documente Necesare:</h4>
              <p className="text-sm text-muted-foreground">
                Pentru verificare, ai nevoie de:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                <li>1. Document de identitate (CI/Pașaport) - față</li>
                <li>2. Un selfie ținând documentul lângă față</li>
              </ul>
            </div>

            {/* ID Document Upload */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <FileText className="h-4 w-4" />
                1. Document de Identitate
              </Label>
              
              {idDocument ? (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50 border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-800">Document încărcat</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIdDocument(null)}
                    className="ml-auto text-destructive"
                  >
                    Șterge
                  </Button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                    {uploading === 'id' ? (
                      <div className="space-y-2">
                        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                        <Progress value={uploadProgress} className="h-2 max-w-xs mx-auto" />
                        <p className="text-sm text-muted-foreground">Se încarcă...</p>
                      </div>
                    ) : (
                      <>
                        <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">Click pentru a încărca CI/Pașaport</p>
                        <p className="text-xs text-muted-foreground mt-1">JPG, PNG (max 10MB)</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'id')}
                      disabled={uploading !== null}
                    />
                  </div>
                </label>
              )}
            </div>

            {/* Selfie Upload */}
            <div className="space-y-3">
              <Label className="text-base font-medium flex items-center gap-2">
                <Camera className="h-4 w-4" />
                2. Selfie cu Documentul
              </Label>
              
              {selfieWithId ? (
                <div className="flex items-center gap-3 p-3 border rounded-lg bg-green-50 border-green-200">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-800">Selfie încărcat</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelfieWithId(null)}
                    className="ml-auto text-destructive"
                  >
                    Șterge
                  </Button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
                    {uploading === 'selfie' ? (
                      <div className="space-y-2">
                        <Loader2 className="h-8 w-8 mx-auto animate-spin text-primary" />
                        <Progress value={uploadProgress} className="h-2 max-w-xs mx-auto" />
                        <p className="text-sm text-muted-foreground">Se încarcă...</p>
                      </div>
                    ) : (
                      <>
                        <Camera className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-sm font-medium">Click pentru a încărca selfie</p>
                        <p className="text-xs text-muted-foreground mt-1">Ține documentul lângă față</p>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'selfie')}
                      disabled={uploading !== null}
                    />
                  </div>
                </label>
              )}
            </div>

            {/* Submit Button */}
            <Button 
              className="w-full" 
              size="lg"
              onClick={handleSubmitVerification}
              disabled={!idDocument || !selfieWithId || uploading !== null}
            >
              Trimite pentru Verificare
            </Button>
          </div>
        )}

        {/* Benefits */}
        <div className="pt-4 border-t">
          <h4 className="font-medium mb-3">Beneficiile Verificării:</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Badge de verificare vizibil pe profil și produse
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Încredere crescută din partea cumpărătorilor
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Prioritate în rezultatele căutării
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
