import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, Clock, XCircle, AlertCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface VerificationDocument {
  name: string;
  url: string;
  uploadedAt: string;
  type: string;
}

export const SellerVerification = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const isVerified = (profile as any)?.is_verified || false;
  const verifiedAt = (profile as any)?.verified_at;
  const documents: VerificationDocument[] = (profile as any)?.verification_documents || [];

  const getVerificationStatus = () => {
    if (isVerified) return 'verified';
    if (documents.length > 0) return 'pending';
    return 'not_started';
  };

  const status = getVerificationStatus();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !user) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const uploadedDocs: VerificationDocument[] = [...documents];
      const totalFiles = files.length;
      let completed = 0;

      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { data, error } = await supabase.storage
          .from('listings')
          .upload(`verification/${fileName}`, file);

        if (error) throw error;

        const { data: publicUrl } = supabase.storage
          .from('listings')
          .getPublicUrl(`verification/${fileName}`);

        uploadedDocs.push({
          name: file.name,
          url: publicUrl.publicUrl,
          uploadedAt: new Date().toISOString(),
          type: file.type,
        });

        completed++;
        setUploadProgress((completed / totalFiles) * 100);
      }

      // Update profile with new documents
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          verification_documents: uploadedDocs as any,
        })
        .eq('user_id', user.id);

      if (updateError) throw updateError;

      toast({
        title: 'Documente încărcate',
        description: 'Documentele au fost trimise pentru verificare.',
      });

      // Refresh the page to show updated status
      window.location.reload();
    } catch (error: any) {
      console.error('Upload error:', error);
      toast({
        title: 'Eroare la încărcare',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const removeDocument = async (index: number) => {
    if (!user) return;

    try {
      const updatedDocs = documents.filter((_, i) => i !== index);

      const { error } = await supabase
        .from('profiles')
        .update({
          verification_documents: updatedDocs as any,
        })
        .eq('user_id', user.id);

      if (error) throw error;

      toast({ title: 'Document șters' });
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
          <FileText className="h-5 w-5" />
          Verificare Identitate Vânzător
        </CardTitle>
        <CardDescription>
          Verifică-ți identitatea pentru a crește încrederea cumpărătorilor
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
              Badge-ul de verificare este vizibil pe profilul tău.
            </AlertDescription>
          </Alert>
        )}

        {status === 'pending' && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertTitle>Verificare în Curs</AlertTitle>
            <AlertDescription>
              Documentele tale sunt în curs de verificare. Vei primi o notificare când procesul este finalizat.
              Timpul estimat: 24-48 ore.
            </AlertDescription>
          </Alert>
        )}

        {/* Required Documents Info */}
        {!isVerified && (
          <div className="space-y-4">
            <h4 className="font-medium">Documente Necesare:</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Act de identitate</strong> - Carte de identitate sau pașaport (față și verso)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Dovada adresei</strong> - Factură utilități sau extras bancar (max. 3 luni)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span><strong>Selfie cu actul</strong> - O fotografie cu tine ținând actul de identitate</span>
              </li>
            </ul>
          </div>
        )}

        {/* Uploaded Documents */}
        {documents.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Documente Încărcate:</h4>
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Încărcat la {new Date(doc.uploadedAt).toLocaleDateString('ro-RO')}
                    </p>
                  </div>
                </div>
                {!isVerified && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    Șterge
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Upload Section */}
        {!isVerified && (
          <div className="space-y-4">
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Se încarcă documentele...</span>
                </div>
                <Progress value={uploadProgress} className="h-2" />
              </div>
            )}

            <label className="block">
              <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <p className="font-medium mb-1">Încarcă Documente</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Trage fișierele aici sau click pentru a selecta
                </p>
                <p className="text-xs text-muted-foreground">
                  Acceptăm: PDF, JPG, PNG (max. 10MB per fișier)
                </p>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </div>
            </label>
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
            <li className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Limite mai mari pentru listări și retrageri
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};
