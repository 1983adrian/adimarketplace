import { useState } from 'react';
import { Save, Mail, Eye, Edit2, Send, CheckCircle, Loader2, Plus, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { useEmailTemplates, useUpdateEmailTemplate } from '@/hooks/useAdminSettings';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function AdminEmailTemplates() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: templates, isLoading } = useEmailTemplates();
  const updateTemplate = useUpdateEmailTemplate();
  
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [editVariables, setEditVariables] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);
  const [isPreview, setIsPreview] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setEditName(template.name);
    setEditSubject(template.subject);
    setEditBody(template.body_html);
    setEditVariables(template.variables?.join(', ') || '');
    setEditIsActive(template.is_active);
    setIsEditing(true);
    setIsAdding(false);
    setIsPreview(false);
  };

  const handleAddNew = () => {
    setSelectedTemplate(null);
    setEditName('');
    setEditSubject('');
    setEditBody('<h1>Hello {{name}}</h1>\n<p>Your content here...</p>');
    setEditVariables('name');
    setEditIsActive(true);
    setIsEditing(true);
    setIsAdding(true);
    setIsPreview(false);
  };

  const handleSave = async () => {
    if (!editName.trim() || !editSubject.trim()) {
      toast({ title: 'Eroare', description: 'Numele și subiectul sunt obligatorii', variant: 'destructive' });
      return;
    }

    const templateKey = isAdding 
      ? editName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '')
      : selectedTemplate.template_key;

    try {
      await updateTemplate.mutateAsync({
        template_key: templateKey,
        name: editName,
        subject: editSubject,
        body_html: sanitizeHtml(editBody),
        variables: editVariables.split(',').map(v => v.trim()).filter(Boolean),
        is_active: editIsActive,
      });

      toast({ title: isAdding ? 'Template creat' : 'Template salvat' });
      setIsEditing(false);
      setSelectedTemplate(null);
      setIsAdding(false);
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (templateKey: string) => {
    try {
      const { error } = await supabase
        .from('email_templates')
        .delete()
        .eq('template_key', templateKey);
      if (error) throw error;
      toast({ title: 'Template șters' });
      queryClient.invalidateQueries({ queryKey: ['email-templates'] });
    } catch (error: any) {
      toast({ title: 'Eroare', description: error.message, variant: 'destructive' });
    }
  };

  const sanitizeHtml = (html: string): string => {
    let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    clean = clean.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '');
    clean = clean.replace(/javascript\s*:/gi, '');
    return clean;
  };

  const getPreviewHtml = () => {
    let html = sanitizeHtml(editBody);
    const vars = editVariables.split(',').map(v => v.trim()).filter(Boolean);
    vars.forEach((v) => {
      const escapedVar = v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      html = html.replace(new RegExp(`{{${escapedVar}}}`, 'g'), `[${v}]`);
    });
    return html;
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Email Templates</h1>
            <p className="text-muted-foreground text-sm">Gestionează șabloanele de email tranzacționale</p>
          </div>
          <Button onClick={handleAddNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Adaugă Template
          </Button>
        </div>

        {isEditing ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>{isAdding ? 'Template Nou' : `Editare: ${selectedTemplate?.name}`}</CardTitle>
                  <CardDescription>
                    {isAdding ? 'Creează un nou șablon de email' : 'Modifică șablonul de email'}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setIsPreview(!isPreview)} className="gap-2">
                    {isPreview ? <Edit2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {isPreview ? 'Editare' : 'Previzualizare'}
                  </Button>
                  <Button variant="outline" onClick={() => { setIsEditing(false); setIsAdding(false); }}>
                    Anulează
                  </Button>
                  <Button onClick={handleSave} disabled={updateTemplate.isPending} className="gap-2">
                    <Save className="h-4 w-4" />
                    Salvează
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nume Template</Label>
                  <Input value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Ex: Welcome Email" />
                </div>
                <div className="space-y-2">
                  <Label>Subiect Email</Label>
                  <Input value={editSubject} onChange={(e) => setEditSubject(e.target.value)} placeholder="Ex: Bun venit pe platformă!" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Variabile (separate prin virgulă)</Label>
                  <Input value={editVariables} onChange={(e) => setEditVariables(e.target.value)} placeholder="name, email, order_id" />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <Switch checked={editIsActive} onCheckedChange={setEditIsActive} />
                  <Label>Activ</Label>
                </div>
              </div>

              {isPreview ? (
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-2 bg-muted text-sm font-medium">Previzualizare</div>
                  <iframe srcDoc={getPreviewHtml()} className="w-full h-[400px] bg-white" title="Email Preview" />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Conținut HTML</Label>
                  <Textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} className="font-mono text-sm h-[400px]" />
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {templates?.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Mail className="h-4 w-4" />
                        {template.name}
                      </CardTitle>
                      <CardDescription>{template.template_key}</CardDescription>
                    </div>
                    <Badge variant={template.is_active ? 'default' : 'secondary'}>
                      {template.is_active ? 'Activ' : 'Inactiv'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Subiect: </span>
                    <span className="font-medium">{template.subject}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.variables?.slice(0, 3).map((v: string) => (
                      <Badge key={v} variant="secondary" className="font-mono text-xs">{v}</Badge>
                    ))}
                    {template.variables && template.variables.length > 3 && (
                      <Badge variant="secondary" className="text-xs">+{template.variables.length - 3}</Badge>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1 gap-2" onClick={() => handleEdit(template)}>
                      <Edit2 className="h-4 w-4" />
                      Editează
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="icon" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Șterge Template?</AlertDialogTitle>
                          <AlertDialogDescription>
                            "{template.name}" va fi șters permanent.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Anulează</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(template.template_key)} className="bg-destructive text-destructive-foreground">
                            Șterge
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}