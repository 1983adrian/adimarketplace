import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Bell, Send, Megaphone, AlertTriangle, Info, CreditCard, FileCheck, Loader2, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';

const notificationTypes = [
  { value: 'announcement', label: 'Anunț General', icon: Megaphone, color: 'text-blue-500' },
  { value: 'important', label: 'Important', icon: AlertTriangle, color: 'text-amber-500' },
  { value: 'info', label: 'Informare', icon: Info, color: 'text-green-500' },
  { value: 'payment_pending', label: 'Plată / Facturare', icon: CreditCard, color: 'text-purple-500' },
  { value: 'kyc_update', label: 'Actualizare KYC', icon: FileCheck, color: 'text-cyan-500' },
];

const AdminBroadcast = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState('announcement');
  const [isSending, setIsSending] = useState(false);
  const [lastSent, setLastSent] = useState<{ title: string; recipients: number; time: Date } | null>(null);

  // Get total user count
  const { data: userCount = 0 } = useQuery({
    queryKey: ['admin-user-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) throw error;
      return count || 0;
    },
  });

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) {
      toast.error('Completează titlul și mesajul');
      return;
    }

    setIsSending(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error('Trebuie să fii autentificat');
        return;
      }

      const response = await supabase.functions.invoke('broadcast-notification', {
        body: { title, message, type },
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to send broadcast');
      }

      const result = response.data;
      
      toast.success(`Notificare trimisă la ${result.recipients} utilizatori!`);
      setLastSent({ title, recipients: result.recipients, time: new Date() });
      
      // Reset form
      setTitle('');
      setMessage('');
      setType('announcement');
      
    } catch (error: any) {
      console.error('Broadcast error:', error);
      toast.error(error.message || 'Eroare la trimiterea notificării');
    } finally {
      setIsSending(false);
    }
  };

  const selectedType = notificationTypes.find(t => t.value === type);
  const TypeIcon = selectedType?.icon || Bell;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Megaphone className="h-6 w-6 text-primary" />
            Broadcast Notificări
          </h1>
          <p className="text-muted-foreground">
            Trimite anunțuri și notificări către toți utilizatorii platformei
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Send className="h-5 w-5" />
                  Compune Notificare
                </CardTitle>
                <CardDescription>
                  Mesajul va apărea pe clopoțelul de notificări al fiecărui utilizator
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Tip Notificare</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {notificationTypes.map((t) => {
                        const Icon = t.icon;
                        return (
                          <SelectItem key={t.value} value={t.value}>
                            <div className="flex items-center gap-2">
                              <Icon className={`h-4 w-4 ${t.color}`} />
                              {t.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Titlu</Label>
                  <Input
                    id="title"
                    placeholder="Ex: Actualizare importantă platformă"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {title.length}/100
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Mesaj</Label>
                  <Textarea
                    id="message"
                    placeholder="Scrie mesajul notificării aici..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground text-right">
                    {message.length}/500
                  </p>
                </div>

                <Button 
                  onClick={handleSend} 
                  disabled={isSending || !title.trim() || !message.trim()}
                  className="w-full gap-2"
                  size="lg"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Se trimite...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Trimite la {userCount} utilizatori
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Preview & Stats */}
          <div className="space-y-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Previzualizare</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <div className="flex items-start gap-3">
                    <div className={`p-1.5 rounded-full bg-muted ${selectedType?.color}`}>
                      <TypeIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">
                        {title || 'Titlu notificare'}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-3">
                        {message || 'Mesajul notificării va apărea aici...'}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        acum câteva secunde
                      </p>
                    </div>
                    <div className="h-2.5 w-2.5 rounded-full bg-primary animate-pulse" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Statistici</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Utilizatori totali</span>
                  <span className="font-semibold">{userCount}</span>
                </div>
                {lastSent && (
                  <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <CheckCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Ultima trimitere</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      "{lastSent.title}" - {lastSent.recipients} destinatari
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      {lastSent.time.toLocaleTimeString('ro-RO')}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Șabloane Rapide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => {
                    setTitle('Mentenanță Programată');
                    setMessage('Platforma va fi indisponibilă pentru mentenanță între orele 02:00-04:00. Ne cerem scuze pentru inconveniențe.');
                    setType('important');
                  }}
                >
                  <AlertTriangle className="h-4 w-4 mr-2 text-amber-500" />
                  <span className="truncate">Mentenanță Programată</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => {
                    setTitle('Funcționalitate Nouă!');
                    setMessage('Am adăugat o funcționalitate nouă pe platformă. Verifică secțiunea de setări pentru mai multe detalii.');
                    setType('announcement');
                  }}
                >
                  <Megaphone className="h-4 w-4 mr-2 text-blue-500" />
                  <span className="truncate">Funcționalitate Nouă</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start text-left h-auto py-2"
                  onClick={() => {
                    setTitle('Reminder: Actualizați documentele');
                    setMessage('Vă rugăm să verificați și actualizați documentele KYC din secțiunea Setări > Verificare pentru a continua să vindeți pe platformă.');
                    setType('kyc_update');
                  }}
                >
                  <FileCheck className="h-4 w-4 mr-2 text-cyan-500" />
                  <span className="truncate">Reminder KYC</span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminBroadcast;
