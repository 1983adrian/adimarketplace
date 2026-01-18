import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  ImageOff, 
  ScanSearch, 
  Trash2, 
  AlertTriangle, 
  CheckCircle, 
  Flag,
  RefreshCw,
  Loader2,
  Eye,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface VerificationResult {
  isReal: boolean;
  confidence: number;
  issues: string[];
  action: 'keep' | 'flag' | 'delete';
  reason: string;
}

interface ImageScanResult {
  imageId: string;
  imageUrl: string;
  listingId: string;
  listingTitle: string;
  sellerId: string;
  verification: VerificationResult;
}

interface ScanResponse {
  success: boolean;
  scannedCount: number;
  deleteCount: number;
  flagCount: number;
  toDelete: ImageScanResult[];
  toFlag: ImageScanResult[];
  allResults: ImageScanResult[];
}

export function AIImageVerification() {
  const [scanResults, setScanResults] = useState<ScanResponse | null>(null);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const scanMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('verify-image', {
        body: { action: 'scan_all' }
      });
      if (error) throw error;
      return data as ScanResponse;
    },
    onSuccess: (data) => {
      setScanResults(data);
      toast.success(`Scanare completă: ${data.scannedCount} imagini verificate`);
    },
    onError: (error) => {
      toast.error('Eroare la scanare: ' + error.message);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (imageIds: string[]) => {
      const { data, error } = await supabase.functions.invoke('verify-image', {
        body: { action: 'delete_fake', imageIds }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message || 'Imaginile au fost șterse');
      setSelectedImages([]);
      setShowDeleteDialog(false);
      // Refresh results
      if (scanResults) {
        setScanResults({
          ...scanResults,
          toDelete: scanResults.toDelete.filter(img => !selectedImages.includes(img.imageId)),
          allResults: scanResults.allResults.filter(img => !selectedImages.includes(img.imageId))
        });
      }
    },
    onError: (error) => {
      toast.error('Eroare la ștergere: ' + error.message);
    }
  });

  const toggleImageSelection = (imageId: string) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const selectAllFake = () => {
    if (scanResults) {
      setSelectedImages(scanResults.toDelete.map(img => img.imageId));
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'keep':
        return <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"><CheckCircle className="h-3 w-3 mr-1" />Real</Badge>;
      case 'flag':
        return <Badge className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"><Flag className="h-3 w-3 mr-1" />Verifică</Badge>;
      case 'delete':
        return <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"><XCircle className="h-3 w-3 mr-1" />Fake</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ScanSearch className="h-6 w-6 text-primary" />
            Verificare AI Imagini Produse
          </CardTitle>
          <CardDescription>
            Detectează automat imaginile false, generate de AI, sau cu watermark-uri stock
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button 
              onClick={() => scanMutation.mutate()} 
              disabled={scanMutation.isPending}
              className="gap-2"
            >
              {scanMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ScanSearch className="h-4 w-4" />
              )}
              {scanMutation.isPending ? 'Se scanează...' : 'Scanează Toate Imaginile'}
            </Button>
            
            {scanResults && scanResults.toDelete.length > 0 && (
              <>
                <Button 
                  variant="outline" 
                  onClick={selectAllFake}
                  className="gap-2"
                >
                  <ImageOff className="h-4 w-4" />
                  Selectează Toate Fake ({scanResults.toDelete.length})
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => setShowDeleteDialog(true)}
                  disabled={selectedImages.length === 0}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Șterge Selectate ({selectedImages.length})
                </Button>
              </>
            )}
          </div>

          {/* Scan Summary */}
          {scanResults && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold">{scanResults.scannedCount}</div>
                <div className="text-sm text-muted-foreground">Total Scanate</div>
              </div>
              <div className="p-4 rounded-lg bg-green-500/10 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {scanResults.scannedCount - scanResults.deleteCount - scanResults.flagCount}
                </div>
                <div className="text-sm text-muted-foreground">Imagini Reale</div>
              </div>
              <div className="p-4 rounded-lg bg-yellow-500/10 text-center">
                <div className="text-2xl font-bold text-yellow-600">{scanResults.flagCount}</div>
                <div className="text-sm text-muted-foreground">De Verificat</div>
              </div>
              <div className="p-4 rounded-lg bg-red-500/10 text-center">
                <div className="text-2xl font-bold text-red-600">{scanResults.deleteCount}</div>
                <div className="text-sm text-muted-foreground">Imagini Fake</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Fake Images */}
      {scanResults && scanResults.toDelete.length > 0 && (
        <Card className="border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Imagini Fake Detectate ({scanResults.toDelete.length})
            </CardTitle>
            <CardDescription>
              Aceste imagini au fost identificate ca false și trebuie șterse
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[400px]">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {scanResults.toDelete.map((item) => (
                  <div 
                    key={item.imageId}
                    className={`relative group rounded-lg border-2 overflow-hidden cursor-pointer transition-all ${
                      selectedImages.includes(item.imageId) 
                        ? 'border-red-500 ring-2 ring-red-500/50' 
                        : 'border-transparent hover:border-red-300'
                    }`}
                    onClick={() => toggleImageSelection(item.imageId)}
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={item.listingTitle}
                      className="w-full h-32 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white text-xs font-medium truncate">{item.listingTitle}</p>
                        <p className="text-white/70 text-xs">{item.verification.reason}</p>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2">
                      {getActionBadge(item.verification.action)}
                    </div>
                    <div className="absolute top-2 right-2">
                      <Button 
                        size="icon" 
                        variant="ghost"
                        className="h-6 w-6 bg-black/50 hover:bg-black/70"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewImage(item.imageUrl);
                        }}
                      >
                        <Eye className="h-3 w-3 text-white" />
                      </Button>
                    </div>
                    {selectedImages.includes(item.imageId) && (
                      <div className="absolute top-2 right-10 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-3 w-3 text-white" />
                      </div>
                    )}
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="secondary" className="text-xs">
                        {item.verification.confidence}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Flagged Images */}
      {scanResults && scanResults.toFlag.length > 0 && (
        <Card className="border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <Flag className="h-5 w-5" />
              Imagini Pentru Verificare ({scanResults.toFlag.length})
            </CardTitle>
            <CardDescription>
              Aceste imagini necesită verificare manuală
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {scanResults.toFlag.map((item) => (
                  <div 
                    key={item.imageId}
                    className="relative group rounded-lg border overflow-hidden"
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={item.listingTitle}
                      className="w-full h-24 object-cover"
                    />
                    <div className="absolute top-1 left-1">
                      {getActionBadge(item.verification.action)}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Confirmare Ștergere Imagini Fake
            </AlertDialogTitle>
            <AlertDialogDescription>
              Ești sigur că vrei să ștergi {selectedImages.length} imagini? 
              Această acțiune nu poate fi anulată și va elimina imaginile din produse.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteMutation.mutate(selectedImages)}
              className="bg-red-500 hover:bg-red-600"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Șterge {selectedImages.length} Imagini
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Image Preview Dialog */}
      <AlertDialog open={!!previewImage} onOpenChange={() => setPreviewImage(null)}>
        <AlertDialogContent className="max-w-3xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Previzualizare Imagine</AlertDialogTitle>
          </AlertDialogHeader>
          {previewImage && (
            <img 
              src={previewImage} 
              alt="Preview" 
              className="w-full h-auto max-h-[60vh] object-contain rounded-lg"
            />
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Închide</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
