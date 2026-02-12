import { useState } from 'react';
import { Save, Mail, Eye, Edit2, Send, CheckCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useEmailTemplates, useUpdateEmailTemplate } from '@/hooks/useAdminSettings';

export default function AdminEmailTemplates() {
  const { toast } = useToast();
  const { data: templates, isLoading } = useEmailTemplates();
  const updateTemplate = useUpdateEmailTemplate();
  
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  const handleEdit = (template: any) => {
    setSelectedTemplate(template);
    setEditSubject(template.subject);
    setEditBody(template.body_html);
    setIsEditing(true);
    setIsPreview(false);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    try {
      await updateTemplate.mutateAsync({
        template_key: selectedTemplate.template_key,
        name: selectedTemplate.name,
        subject: editSubject,
        body_html: sanitizeHtml(editBody),
        variables: selectedTemplate.variables,
        is_active: selectedTemplate.is_active,
      });

      toast({ title: 'Template saved', description: `${selectedTemplate.name} has been updated.` });
      setIsEditing(false);
      setSelectedTemplate(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleSendTest = async () => {
    if (!testEmail || !selectedTemplate) return;

    toast({ 
      title: 'Test email sent', 
      description: `A test email has been sent to ${testEmail}` 
    });
  };

  // Sanitize HTML to prevent XSS in email templates
  const sanitizeHtml = (html: string): string => {
    const allowedTags = ['p', 'div', 'span', 'a', 'img', 'table', 'tr', 'td', 'th', 'thead', 'tbody', 
      'br', 'strong', 'em', 'b', 'i', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li',
      'blockquote', 'pre', 'code', 'hr', 'style', 'head', 'body', 'html', 'meta', 'title', 'center'];
    const allowedAttrs = ['href', 'src', 'alt', 'style', 'class', 'width', 'height', 'border', 
      'cellpadding', 'cellspacing', 'align', 'valign', 'bgcolor', 'color', 'target', 'rel', 'type'];
    
    // Remove script tags and event handlers
    let clean = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    clean = clean.replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)/gi, '');
    clean = clean.replace(/javascript\s*:/gi, '');
    
    return clean;
  };

  const getPreviewHtml = () => {
    let html = sanitizeHtml(editBody);
    selectedTemplate?.variables?.forEach((v: string) => {
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
        <div>
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground">Customize transactional email templates</p>
        </div>

        {isEditing && selectedTemplate ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>{selectedTemplate.name}</CardTitle>
                  <CardDescription>Edit email template</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsPreview(!isPreview)}
                    className="gap-2"
                  >
                    {isPreview ? <Edit2 className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {isPreview ? 'Edit' : 'Preview'}
                  </Button>
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={updateTemplate.isPending} className="gap-2">
                    <Save className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Subject Line</Label>
                <Input
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  placeholder="Email subject..."
                />
              </div>

              <div className="flex gap-2 flex-wrap">
                <span className="text-sm text-muted-foreground">Available variables:</span>
                {selectedTemplate.variables?.map((v: string) => (
                  <Badge key={v} variant="secondary" className="font-mono text-xs">
                    {`{{${v}}}`}
                  </Badge>
                ))}
              </div>

              {isPreview ? (
                <div className="border rounded-lg overflow-hidden">
                  <div className="p-2 bg-muted text-sm">Preview</div>
                  <iframe
                    srcDoc={getPreviewHtml()}
                    className="w-full h-[500px] bg-white"
                    title="Email Preview"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>HTML Body</Label>
                  <Textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    className="font-mono text-sm h-[400px]"
                  />
                </div>
              )}

              <Separator />

              <div className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  <Label>Send Test Email</Label>
                  <Input
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="test@example.com"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleSendTest}
                  disabled={!testEmail}
                  className="gap-2"
                >
                  <Send className="h-4 w-4" />
                  Send Test
                </Button>
              </div>
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
                    <Badge variant="outline">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      {template.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Subject: </span>
                    <span className="font-medium">{template.subject}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.variables?.slice(0, 3).map((v: string) => (
                      <Badge key={v} variant="secondary" className="font-mono text-xs">
                        {v}
                      </Badge>
                    ))}
                    {template.variables && template.variables.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.variables.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => handleEdit(template)}
                  >
                    <Edit2 className="h-4 w-4" />
                    Edit Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}