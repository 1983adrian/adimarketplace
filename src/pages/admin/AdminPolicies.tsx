import { useState, useEffect } from 'react';
import { Save, FileText, Eye, Edit2, Plus, Trash2, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';

interface Policy {
  id: string;
  title: string;
  slug: string;
  content: string;
  version: string;
  isActive: boolean;
  lastUpdated: string;
}

const defaultPolicies: Policy[] = [
  {
    id: '1',
    title: 'Terms of Service',
    slug: 'terms-of-service',
    content: `# Terms of Service

## 1. Introduction
Welcome to our marketplace. By using our services, you agree to these terms.

## 2. User Accounts
- You must be at least 18 years old to use this service.
- You are responsible for maintaining the security of your account.
- You must provide accurate and complete information.

## 3. Buying and Selling
- All sales are final unless otherwise stated.
- Sellers must accurately describe their items.
- Buyers must pay within the specified timeframe.

## 4. Prohibited Items
The following items are not allowed:
- Illegal goods
- Counterfeit products
- Hazardous materials

## 5. Fees
- Buyers pay a service fee on each purchase.
- Sellers pay a commission on each sale.
- All fees are non-refundable.

## 6. Disputes
- Contact our support team for any disputes.
- We will mediate between buyers and sellers.
- Our decision is final.

## 7. Changes to Terms
We may update these terms at any time. Continued use of the service constitutes acceptance of new terms.`,
    version: '1.0',
    isActive: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Privacy Policy',
    slug: 'privacy-policy',
    content: `# Privacy Policy

## 1. Information We Collect
We collect information you provide directly:
- Account information (name, email, password)
- Profile information
- Transaction history
- Communications with us

## 2. How We Use Information
We use your information to:
- Provide our services
- Process transactions
- Send notifications
- Improve our platform

## 3. Information Sharing
We may share information with:
- Other users (as necessary for transactions)
- Service providers
- Legal authorities (when required)

## 4. Data Security
We implement security measures to protect your data:
- Encryption in transit and at rest
- Regular security audits
- Access controls

## 5. Your Rights
You have the right to:
- Access your data
- Correct inaccurate data
- Delete your account
- Export your data

## 6. Cookies
We use cookies to:
- Keep you logged in
- Remember preferences
- Analyze usage

## 7. Contact Us
For privacy concerns, contact: privacy@marketplace.com`,
    version: '1.0',
    isActive: true,
    lastUpdated: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Refund Policy',
    slug: 'refund-policy',
    content: `# Refund Policy

## 1. General Policy
Refunds are available under specific circumstances as outlined below.

## 2. Eligible Refunds
- Item not received
- Item significantly different from description
- Item damaged during shipping

## 3. Refund Process
1. Contact seller within 48 hours of delivery
2. Provide photos/evidence if applicable
3. Wait for seller response (24-48 hours)
4. If unresolved, open a dispute

## 4. Timeframes
- Request refund: Within 7 days of delivery
- Processing time: 5-10 business days
- Bank processing: Additional 3-5 days

## 5. Non-Refundable
- Change of mind
- Minor variations in color/size
- Items marked as "final sale"

## 6. Partial Refunds
May be offered when:
- Item is returned in different condition
- Only part of order is affected`,
    version: '1.0',
    isActive: true,
    lastUpdated: new Date().toISOString()
  }
];

export default function AdminPolicies() {
  const { toast } = useToast();
  const [policies, setPolicies] = useState<Policy[]>(defaultPolicies);
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [isPreview, setIsPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('admin_policies');
    if (saved) {
      setPolicies(JSON.parse(saved));
    }
  }, []);

  const handleEdit = (policy: Policy) => {
    setSelectedPolicy(policy);
    setEditContent(policy.content);
    setEditTitle(policy.title);
    setIsEditing(true);
    setIsPreview(false);
  };

  const handleSave = async () => {
    if (!selectedPolicy) return;

    setIsSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedPolicies = policies.map(p => 
        p.id === selectedPolicy.id 
          ? { 
              ...p, 
              title: editTitle, 
              content: editContent, 
              lastUpdated: new Date().toISOString(),
              version: incrementVersion(p.version)
            } 
          : p
      );

      setPolicies(updatedPolicies);
      localStorage.setItem('admin_policies', JSON.stringify(updatedPolicies));
      
      toast({ title: 'Policy saved', description: `${editTitle} has been updated.` });
      setIsEditing(false);
      setSelectedPolicy(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const incrementVersion = (version: string) => {
    const parts = version.split('.');
    const minor = parseInt(parts[1] || '0') + 1;
    return `${parts[0]}.${minor}`;
  };

  const handleToggleActive = (policyId: string) => {
    const updatedPolicies = policies.map(p =>
      p.id === policyId ? { ...p, isActive: !p.isActive } : p
    );
    setPolicies(updatedPolicies);
    localStorage.setItem('admin_policies', JSON.stringify(updatedPolicies));
    toast({ title: 'Status updated' });
  };

  const handleAddPolicy = () => {
    const newPolicy: Policy = {
      id: Date.now().toString(),
      title: 'New Policy',
      slug: 'new-policy',
      content: '# New Policy\n\nAdd your policy content here...',
      version: '1.0',
      isActive: false,
      lastUpdated: new Date().toISOString()
    };
    setPolicies([...policies, newPolicy]);
    handleEdit(newPolicy);
  };

  const handleDelete = (policyId: string) => {
    const updatedPolicies = policies.filter(p => p.id !== policyId);
    setPolicies(updatedPolicies);
    localStorage.setItem('admin_policies', JSON.stringify(updatedPolicies));
    toast({ title: 'Policy deleted' });
  };

  const renderMarkdown = (content: string) => {
    // Simple markdown rendering
    return content
      .split('\n')
      .map((line, index) => {
        if (line.startsWith('# ')) {
          return <h1 key={index} className="text-2xl font-bold mt-4 mb-2">{line.slice(2)}</h1>;
        }
        if (line.startsWith('## ')) {
          return <h2 key={index} className="text-xl font-semibold mt-4 mb-2">{line.slice(3)}</h2>;
        }
        if (line.startsWith('### ')) {
          return <h3 key={index} className="text-lg font-medium mt-3 mb-1">{line.slice(4)}</h3>;
        }
        if (line.startsWith('- ')) {
          return <li key={index} className="ml-4">{line.slice(2)}</li>;
        }
        if (line.match(/^\d+\. /)) {
          return <li key={index} className="ml-4 list-decimal">{line.replace(/^\d+\. /, '')}</li>;
        }
        if (line.trim() === '') {
          return <br key={index} />;
        }
        return <p key={index} className="my-1">{line}</p>;
      });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Policies</h1>
            <p className="text-muted-foreground">Manage legal documents and policies</p>
          </div>
          <Button onClick={handleAddPolicy} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Policy
          </Button>
        </div>

        {isEditing && selectedPolicy ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle>Edit Policy</CardTitle>
                  <CardDescription>Make changes to the policy content</CardDescription>
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
                    Save Changes
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Policy title..."
                />
              </div>

              {isPreview ? (
                <div className="border rounded-lg p-6 bg-muted/30 min-h-[400px]">
                  <ScrollArea className="h-[500px]">
                    {renderMarkdown(editContent)}
                  </ScrollArea>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Content (Markdown supported)</Label>
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    placeholder="Policy content..."
                    rows={20}
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {policies.map((policy) => (
              <Card key={policy.id} className={!policy.isActive ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {policy.title}
                      </CardTitle>
                      <CardDescription>/{policy.slug}</CardDescription>
                    </div>
                    <Badge variant={policy.isActive ? 'default' : 'secondary'}>
                      {policy.isActive ? 'Active' : 'Draft'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Version: {policy.version}</p>
                    <p>Last updated: {format(new Date(policy.lastUpdated), 'MMM dd, yyyy')}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-1"
                      onClick={() => handleEdit(policy)}
                    >
                      <Edit2 className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleActive(policy.id)}
                    >
                      {policy.isActive ? 'Deactivate' : 'Activate'}
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="text-destructive">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Policy?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete "{policy.title}". This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(policy.id)}>
                            Delete
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

        {/* Policy Links Section */}
        <Card>
          <CardHeader>
            <CardTitle>Public Policy Links</CardTitle>
            <CardDescription>Links to active policies visible to users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              {policies.filter(p => p.isActive).map((policy) => (
                <div key={policy.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <span className="font-medium">{policy.title}</span>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <ExternalLink className="h-3 w-3" />
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
