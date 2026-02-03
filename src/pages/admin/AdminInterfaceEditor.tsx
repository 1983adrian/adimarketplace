import React, { useState, useEffect } from 'react';
import { Save, Plus, Trash2, Palette, Type, Link as LinkIcon, Move, Eye, EyeOff, Loader2, GripVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Dashboard menu button interface
interface DashboardButton {
  id: string;
  title: string;
  url: string;
  icon: string;
  color: string;
  isActive: boolean;
  order: number;
  showBadge?: string;
}

// Available icons for buttons
const AVAILABLE_ICONS = [
  'Plus', 'Package', 'ShoppingBag', 'MessageCircle', 'Wallet', 'BarChart3',
  'Heart', 'Settings', 'Bell', 'Store', 'User', 'Undo2', 'MailOpen', 'Receipt',
  'Home', 'Search', 'Star', 'Tag', 'Truck', 'CreditCard', 'Camera', 'Image',
  'FileText', 'Calendar', 'Clock', 'MapPin', 'Phone', 'Mail', 'Share2', 'Download'
];

// Available gradient colors
const COLOR_PRESETS = [
  { id: 'blue', label: 'Albastru', value: 'bg-gradient-to-br from-blue-500 to-indigo-600' },
  { id: 'green', label: 'Verde', value: 'bg-gradient-to-br from-emerald-500 to-green-600' },
  { id: 'purple', label: 'Mov', value: 'bg-gradient-to-br from-violet-500 to-purple-600' },
  { id: 'orange', label: 'Portocaliu', value: 'bg-gradient-to-br from-amber-500 to-orange-600' },
  { id: 'red', label: 'Roșu', value: 'bg-gradient-to-br from-rose-500 to-red-600' },
  { id: 'teal', label: 'Turcoaz', value: 'bg-gradient-to-br from-teal-500 to-cyan-600' },
  { id: 'pink', label: 'Roz', value: 'bg-gradient-to-br from-pink-500 to-fuchsia-600' },
  { id: 'lime', label: 'Lime', value: 'bg-gradient-to-br from-lime-500 to-green-500' },
  { id: 'sky', label: 'Cer', value: 'bg-gradient-to-br from-sky-400 to-blue-500' },
  { id: 'indigo', label: 'Indigo', value: 'bg-gradient-to-br from-indigo-500 to-violet-600' },
  { id: 'cyan', label: 'Cyan', value: 'bg-gradient-to-br from-cyan-500 to-teal-600' },
  { id: 'fuchsia', label: 'Fuchsia', value: 'bg-gradient-to-br from-fuchsia-500 to-pink-600' },
];

// Default dashboard buttons
const DEFAULT_BUTTONS: DashboardButton[] = [
  { id: 'profile', title: 'Setări Profil', url: '/profile-settings', icon: 'User', color: 'bg-gradient-to-br from-sky-400 to-blue-500', isActive: true, order: 0 },
  { id: 'seller-mode', title: 'Mod Vânzător', url: '/seller-mode', icon: 'Store', color: 'bg-gradient-to-br from-amber-500 to-orange-600', isActive: true, order: 1 },
  { id: 'sell', title: 'Vinde Un Produs', url: '/sell', icon: 'Plus', color: 'bg-gradient-to-br from-blue-500 to-indigo-600', isActive: true, order: 2 },
  { id: 'wallet', title: 'Portofel', url: '/wallet', icon: 'Wallet', color: 'bg-gradient-to-br from-emerald-500 to-green-600', isActive: true, order: 3 },
  { id: 'messages', title: 'Mesaje', url: '/messages', icon: 'MessageCircle', color: 'bg-gradient-to-br from-cyan-500 to-teal-600', isActive: true, order: 4, showBadge: 'messages' },
  { id: 'purchases', title: 'Cumpărăturile Mele', url: '/orders?section=buying', icon: 'ShoppingBag', color: 'bg-gradient-to-br from-violet-500 to-purple-600', isActive: true, order: 5, showBadge: 'purchases' },
  { id: 'sales', title: 'Vânzările Mele', url: '/orders?section=selling', icon: 'Receipt', color: 'bg-gradient-to-br from-lime-500 to-green-500', isActive: true, order: 6, showBadge: 'sales' },
  { id: 'my-returns', title: 'Returnările Mele', url: '/orders?section=my-returns', icon: 'Undo2', color: 'bg-gradient-to-br from-orange-500 to-amber-600', isActive: true, order: 7, showBadge: 'my-returns' },
  { id: 'received-returns', title: 'Returnări Primite', url: '/orders?section=received-returns', icon: 'MailOpen', color: 'bg-gradient-to-br from-fuchsia-500 to-pink-600', isActive: true, order: 8, showBadge: 'received-returns' },
  { id: 'products', title: 'Produsele Mele', url: '/my-products', icon: 'Package', color: 'bg-gradient-to-br from-teal-500 to-cyan-600', isActive: true, order: 9 },
  { id: 'analytics', title: 'Statistici', url: '/seller-analytics', icon: 'BarChart3', color: 'bg-gradient-to-br from-indigo-500 to-violet-600', isActive: true, order: 10 },
  { id: 'favorites', title: 'Favorite', url: '/favorites', icon: 'Heart', color: 'bg-gradient-to-br from-rose-500 to-red-600', isActive: true, order: 11 },
  { id: 'tutorial', title: 'Tutorial', url: '/seller-tutorial', icon: 'GraduationCap', color: 'bg-gradient-to-br from-pink-500 to-fuchsia-600', isActive: true, order: 12 },
];

export default function AdminInterfaceEditor() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [buttons, setButtons] = useState<DashboardButton[]>(DEFAULT_BUTTONS);
  const [editingButton, setEditingButton] = useState<DashboardButton | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch interface settings from database
  const { data: interfaceSettings, isLoading } = useQuery({
    queryKey: ['interface-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*')
        .eq('category', 'interface')
        .eq('key', 'dashboard_buttons')
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  // Load settings when data arrives
  useEffect(() => {
    if (interfaceSettings?.value) {
      try {
        const valueStr = typeof interfaceSettings.value === 'string' 
          ? interfaceSettings.value 
          : JSON.stringify(interfaceSettings.value);
        const parsed = JSON.parse(valueStr);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setButtons(parsed);
        }
      } catch (e) {
        console.error('Failed to parse interface settings:', e);
      }
    }
  }, [interfaceSettings]);

  // Save mutation
  const saveMutation = useMutation({
    mutationFn: async (newButtons: DashboardButton[]) => {
      const { error } = await supabase
        .from('platform_settings')
        .upsert({
          key: 'dashboard_buttons',
          value: JSON.stringify(newButtons),
          category: 'interface',
          updated_at: new Date().toISOString(),
        }, { onConflict: 'key' });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['interface-settings'] });
      setHasChanges(false);
      toast({
        title: 'Salvat cu Succes',
        description: 'Setările interfeței au fost actualizate.',
      });
    },
    onError: (error) => {
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut salva setările.',
        variant: 'destructive',
      });
      console.error('Save error:', error);
    }
  });

  const handleSave = () => {
    saveMutation.mutate(buttons);
  };

  const updateButton = (id: string, updates: Partial<DashboardButton>) => {
    setButtons(prev => prev.map(btn => 
      btn.id === id ? { ...btn, ...updates } : btn
    ));
    setHasChanges(true);
  };

  const addButton = () => {
    const newId = `custom-${Date.now()}`;
    const newButton: DashboardButton = {
      id: newId,
      title: 'Buton Nou',
      url: '/',
      icon: 'Star',
      color: COLOR_PRESETS[0].value,
      isActive: true,
      order: buttons.length,
    };
    setButtons(prev => [...prev, newButton]);
    setEditingButton(newButton);
    setHasChanges(true);
  };

  const removeButton = (id: string) => {
    setButtons(prev => prev.filter(btn => btn.id !== id));
    setHasChanges(true);
    if (editingButton?.id === id) {
      setEditingButton(null);
    }
  };

  const moveButton = (id: string, direction: 'up' | 'down') => {
    setButtons(prev => {
      const index = prev.findIndex(btn => btn.id === id);
      if (index === -1) return prev;
      
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      if (newIndex < 0 || newIndex >= prev.length) return prev;

      const newButtons = [...prev];
      [newButtons[index], newButtons[newIndex]] = [newButtons[newIndex], newButtons[index]];
      return newButtons.map((btn, i) => ({ ...btn, order: i }));
    });
    setHasChanges(true);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Editor Interfață</h1>
            <p className="text-muted-foreground">
              Personalizează butoanele din meniul Dashboard, culorile și funcționalitățile
            </p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                Modificări nesalvate
              </Badge>
            )}
            <Button onClick={handleSave} disabled={saveMutation.isPending || !hasChanges}>
              {saveMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Salvează
            </Button>
          </div>
        </div>

        <Tabs defaultValue="buttons" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="buttons">Butoane Meniu</TabsTrigger>
            <TabsTrigger value="preview">Previzualizare</TabsTrigger>
          </TabsList>

          <TabsContent value="buttons" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Buttons List */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Butoane Dashboard</CardTitle>
                    <CardDescription>Drag & drop pentru reordonare</CardDescription>
                  </div>
                  <Button onClick={addButton} size="sm">
                    <Plus className="h-4 w-4 mr-1" />
                    Adaugă
                  </Button>
                </CardHeader>
                <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                  {buttons.sort((a, b) => a.order - b.order).map((btn, index) => (
                    <div
                      key={btn.id}
                      className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                        editingButton?.id === btn.id ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/50'
                      } ${!btn.isActive ? 'opacity-50' : ''}`}
                      onClick={() => setEditingButton(btn)}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      <div className={`w-8 h-8 rounded-lg ${btn.color} flex items-center justify-center`}>
                        <span className="text-white text-xs font-bold">{btn.icon[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{btn.title}</p>
                        <p className="text-xs text-muted-foreground truncate">{btn.url}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); moveButton(btn.id, 'up'); }}
                          disabled={index === 0}
                        >
                          <Move className="h-3 w-3 rotate-180" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => { e.stopPropagation(); moveButton(btn.id, 'down'); }}
                          disabled={index === buttons.length - 1}
                        >
                          <Move className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => { e.stopPropagation(); removeButton(btn.id); }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Button Editor */}
              <Card>
                <CardHeader>
                  <CardTitle>
                    {editingButton ? `Editare: ${editingButton.title}` : 'Selectează un Buton'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {editingButton ? (
                    <>
                      <div className="space-y-2">
                        <Label>Nume Buton</Label>
                        <div className="flex items-center gap-2">
                          <Type className="h-4 w-4 text-muted-foreground" />
                          <Input
                            value={editingButton.title}
                            onChange={(e) => {
                              const newTitle = e.target.value;
                              setEditingButton(prev => prev ? { ...prev, title: newTitle } : null);
                              updateButton(editingButton.id, { title: newTitle });
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>URL / Link</Label>
                        <div className="flex items-center gap-2">
                          <LinkIcon className="h-4 w-4 text-muted-foreground" />
                          <Input
                            value={editingButton.url}
                            onChange={(e) => {
                              const newUrl = e.target.value;
                              setEditingButton(prev => prev ? { ...prev, url: newUrl } : null);
                              updateButton(editingButton.id, { url: newUrl });
                            }}
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Icon</Label>
                        <Select
                          value={editingButton.icon}
                          onValueChange={(value) => {
                            setEditingButton(prev => prev ? { ...prev, icon: value } : null);
                            updateButton(editingButton.id, { icon: value });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {AVAILABLE_ICONS.map(icon => (
                              <SelectItem key={icon} value={icon}>{icon}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label>Culoare Gradient</Label>
                        <div className="grid grid-cols-4 gap-2">
                          {COLOR_PRESETS.map(color => (
                            <button
                              key={color.id}
                              className={`w-full h-10 rounded-lg ${color.value} transition-transform hover:scale-105 ${
                                editingButton.color === color.value ? 'ring-2 ring-primary ring-offset-2' : ''
                              }`}
                              onClick={() => {
                                setEditingButton(prev => prev ? { ...prev, color: color.value } : null);
                                updateButton(editingButton.id, { color: color.value });
                              }}
                              title={color.label}
                            />
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Afișare Badge Notificări</Label>
                        <Select
                          value={editingButton.showBadge || 'none'}
                          onValueChange={(value) => {
                            const badge = value === 'none' ? undefined : value;
                            setEditingButton(prev => prev ? { ...prev, showBadge: badge } : null);
                            updateButton(editingButton.id, { showBadge: badge });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Fără badge" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Fără Badge</SelectItem>
                            <SelectItem value="messages">Mesaje</SelectItem>
                            <SelectItem value="purchases">Cumpărături</SelectItem>
                            <SelectItem value="sales">Vânzări</SelectItem>
                            <SelectItem value="my-returns">Returnări Mele</SelectItem>
                            <SelectItem value="received-returns">Returnări Primite</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-2">
                          {editingButton.isActive ? (
                            <Eye className="h-4 w-4 text-green-600" />
                          ) : (
                            <EyeOff className="h-4 w-4 text-muted-foreground" />
                          )}
                          <Label>Buton Activ</Label>
                        </div>
                        <Switch
                          checked={editingButton.isActive}
                          onCheckedChange={(checked) => {
                            setEditingButton(prev => prev ? { ...prev, isActive: checked } : null);
                            updateButton(editingButton.id, { isActive: checked });
                          }}
                        />
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Palette className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Selectează un buton din listă pentru a-l edita</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <Card>
              <CardHeader>
                <CardTitle>Previzualizare Meniu Dashboard</CardTitle>
                <CardDescription>Așa va arăta meniul pentru utilizatori</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-card border-2 border-border rounded-3xl p-4 shadow-lg max-w-md mx-auto">
                  <h2 className="text-lg font-bold mb-3">Meniu</h2>
                  <div className="grid grid-cols-3 gap-2">
                    {buttons
                      .filter(btn => btn.isActive)
                      .sort((a, b) => a.order - b.order)
                      .map((item) => (
                        <div 
                          key={item.id}
                          className="relative flex flex-col items-center p-2 rounded-lg bg-muted/50 hover:bg-muted hover:shadow-md transition-all duration-200 min-h-[88px]"
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-1 shadow-sm ${item.color}`}>
                            <span className="text-white text-sm font-bold">{item.icon[0]}</span>
                          </div>
                          
                          <span className="text-[10px] font-medium text-foreground text-center leading-tight line-clamp-2">
                            {item.title}
                          </span>
                          
                          {item.showBadge && (
                            <span className="mt-1 px-2 py-0.5 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold">
                              1 notificare
                            </span>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Info Alert */}
        <Alert>
          <AlertDescription>
            <strong>Notă:</strong> Modificările vor fi aplicate pentru toți utilizatorii după salvare. 
            Asigurați-vă că URL-urile sunt valide și butonele funcționează corect.
          </AlertDescription>
        </Alert>
      </div>
    </AdminLayout>
  );
}
