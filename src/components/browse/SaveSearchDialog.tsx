import React, { useState } from 'react';
import { Search, Bell, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useAuth } from '@/contexts/AuthContext';
import { useCreateSavedSearch } from '@/hooks/useSavedSearches';
import { useNavigate } from 'react-router-dom';

interface SaveSearchDialogProps {
  query: string;
  filters: Record<string, any>;
  children?: React.ReactNode;
}

export const SaveSearchDialog = ({ query, filters, children }: SaveSearchDialogProps) => {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [notifyOnNew, setNotifyOnNew] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const createSearch = useCreateSavedSearch();

  const handleSave = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!name.trim()) return;

    createSearch.mutate(
      {
        name: name.trim(),
        query,
        filters,
        notifyOnNew,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setName('');
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="outline" size="sm" className="gap-2">
            <Save className="h-4 w-4" />
            Salvează Căutarea
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Salvează Căutarea
          </DialogTitle>
          <DialogDescription>
            Primește notificări când apar produse noi care se potrivesc căutării tale.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm font-medium">Căutare:</p>
            <p className="text-sm text-muted-foreground">"{query || 'Toate produsele'}"</p>
            {Object.keys(filters).length > 0 && (
              <p className="text-xs text-muted-foreground mt-1">
                + {Object.keys(filters).length} filtre aplicate
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="searchName">Nume căutare *</Label>
            <Input
              id="searchName"
              placeholder="ex: Telefoane iPhone sub 1000 RON"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
            <div className="space-y-0.5">
              <Label className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                Notificări produse noi
              </Label>
              <p className="text-xs text-muted-foreground">
                Primește alerte când apar produse noi
              </p>
            </div>
            <Switch checked={notifyOnNew} onCheckedChange={setNotifyOnNew} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Anulează
          </Button>
          <Button onClick={handleSave} disabled={!name.trim() || createSearch.isPending}>
            {createSearch.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Se salvează...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Salvează
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
