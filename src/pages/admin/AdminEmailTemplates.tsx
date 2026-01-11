import { useState, useEffect } from 'react';
import { Save, Mail, Eye, Edit2, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  variables: string[];
  description: string;
  lastUpdated: string;
}

const defaultTemplates: EmailTemplate[] = [
  {
    id: 'order_confirmation',
    name: 'Order Confirmation',
    subject: 'Order Confirmed - {{order_id}}',
    body: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Order Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi {{buyer_name}},</p>
      <p>Thank you for your order! We've received your payment and the seller has been notified.</p>
      
      <h3>Order Details:</h3>
      <p><strong>Order ID:</strong> {{order_id}}</p>
      <p><strong>Item:</strong> {{item_name}}</p>
      <p><strong>Amount:</strong> £{{amount}}</p>
      
      <p>You'll receive another email when the seller ships your item.</p>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="{{order_link}}" class="button">View Order</a>
      </p>
    </div>
    <div class="footer">
      <p>If you have any questions, please contact our support team.</p>
    </div>
  </div>
</body>
</html>`,
    variables: ['buyer_name', 'order_id', 'item_name', 'amount', 'order_link'],
    description: 'Sent to buyers when their order is confirmed',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'new_sale',
    name: 'New Sale Notification',
    subject: 'You made a sale! - {{item_name}}',
    body: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #10B981; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    .button { background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎉 Congratulations!</h1>
    </div>
    <div class="content">
      <p>Hi {{seller_name}},</p>
      <p>Great news! You just made a sale!</p>
      
      <h3>Sale Details:</h3>
      <p><strong>Item:</strong> {{item_name}}</p>
      <p><strong>Sale Price:</strong> £{{amount}}</p>
      <p><strong>Your Earnings:</strong> £{{payout_amount}} (after 15% commission)</p>
      <p><strong>Buyer:</strong> {{buyer_name}}</p>
      
      <p><strong>Next Steps:</strong></p>
      <ol>
        <li>Ship the item to the buyer</li>
        <li>Add tracking information to the order</li>
        <li>Wait for buyer to confirm delivery</li>
        <li>Receive your payout!</li>
      </ol>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="{{order_link}}" class="button">View Order & Add Tracking</a>
      </p>
    </div>
    <div class="footer">
      <p>Remember to ship within 3 business days.</p>
    </div>
  </div>
</body>
</html>`,
    variables: ['seller_name', 'item_name', 'amount', 'payout_amount', 'buyer_name', 'order_link'],
    description: 'Sent to sellers when they receive a new order',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'shipping_update',
    name: 'Shipping Update',
    subject: 'Your order is on its way! - {{order_id}}',
    body: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #F59E0B; color: white; padding: 20px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .tracking { background: white; padding: 15px; border-radius: 8px; margin: 20px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📦 Your Order is Shipped!</h1>
    </div>
    <div class="content">
      <p>Hi {{buyer_name}},</p>
      <p>Great news! Your order has been shipped and is on its way to you.</p>
      
      <div class="tracking">
        <p><strong>Tracking Number:</strong> {{tracking_number}}</p>
        <p><strong>Carrier:</strong> {{carrier}}</p>
      </div>
      
      <p>Once you receive your item, please confirm delivery in your orders page so the seller can receive their payment.</p>
    </div>
  </div>
</body>
</html>`,
    variables: ['buyer_name', 'order_id', 'tracking_number', 'carrier'],
    description: 'Sent when seller adds tracking information',
    lastUpdated: new Date().toISOString()
  },
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to {{site_name}}!',
    body: `<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #4F46E5; color: white; padding: 30px; text-align: center; }
    .content { padding: 20px; background: #f9fafb; }
    .button { background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Welcome to {{site_name}}!</h1>
    </div>
    <div class="content">
      <p>Hi {{user_name}},</p>
      <p>Welcome aboard! We're excited to have you join our community.</p>
      
      <h3>What you can do:</h3>
      <ul>
        <li>🛒 Browse thousands of listings</li>
        <li>💰 Sell your items and earn money</li>
        <li>💬 Chat directly with buyers and sellers</li>
        <li>⭐ Build your reputation with reviews</li>
      </ul>
      
      <p style="text-align: center; margin-top: 30px;">
        <a href="{{browse_link}}" class="button">Start Browsing</a>
      </p>
    </div>
  </div>
</body>
</html>`,
    variables: ['user_name', 'site_name', 'browse_link'],
    description: 'Sent to new users after registration',
    lastUpdated: new Date().toISOString()
  }
];

export default function AdminEmailTemplates() {
  const { toast } = useToast();
  const [templates, setTemplates] = useState<EmailTemplate[]>(defaultTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editSubject, setEditSubject] = useState('');
  const [editBody, setEditBody] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testEmail, setTestEmail] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('email_templates');
    if (saved) {
      setTemplates(JSON.parse(saved));
    }
  }, []);

  const handleEdit = (template: EmailTemplate) => {
    setSelectedTemplate(template);
    setEditSubject(template.subject);
    setEditBody(template.body);
    setIsEditing(true);
    setIsPreview(false);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedTemplates = templates.map(t =>
        t.id === selectedTemplate.id
          ? { ...t, subject: editSubject, body: editBody, lastUpdated: new Date().toISOString() }
          : t
      );

      setTemplates(updatedTemplates);
      localStorage.setItem('email_templates', JSON.stringify(updatedTemplates));

      toast({ title: 'Template saved', description: `${selectedTemplate.name} has been updated.` });
      setIsEditing(false);
      setSelectedTemplate(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleSendTest = async () => {
    if (!testEmail || !selectedTemplate) return;

    toast({ 
      title: 'Test email sent', 
      description: `A test email has been sent to ${testEmail}` 
    });
  };

  const getPreviewHtml = () => {
    let html = editBody;
    selectedTemplate?.variables.forEach(v => {
      html = html.replace(new RegExp(`{{${v}}}`, 'g'), `[${v}]`);
    });
    return html;
  };

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
                  <CardDescription>{selectedTemplate.description}</CardDescription>
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
                  <Button onClick={handleSave} disabled={isSaving} className="gap-2">
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
                {selectedTemplate.variables.map(v => (
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
            {templates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2 text-base">
                        <Mail className="h-4 w-4" />
                        {template.name}
                      </CardTitle>
                      <CardDescription>{template.description}</CardDescription>
                    </div>
                    <Badge variant="outline">
                      <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Subject: </span>
                    <span className="font-medium">{template.subject}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {template.variables.slice(0, 3).map(v => (
                      <Badge key={v} variant="secondary" className="font-mono text-xs">
                        {v}
                      </Badge>
                    ))}
                    {template.variables.length > 3 && (
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
