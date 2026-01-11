import { useState, useEffect } from 'react';
import { Save, FileText, Eye, Edit2, Plus, Trash2, ExternalLink, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { usePoliciesContent, useUpdatePolicy } from '@/hooks/useAdminSettings';
import { supabase } from '@/integrations/supabase/client';

export default function AdminPolicies() {
  const { toast } = useToast();
  const { data: policies, isLoading, refetch } = usePoliciesContent();
  const updatePolicy = useUpdatePolicy();
  
  const [selectedPolicy, setSelectedPolicy] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [isPreview, setIsPreview] = useState(false);

  const handleEdit = (policy: any) => {
    setSelectedPolicy(policy);
    setEditContent(policy.content);
    setEditTitle(policy.title);
    setIsEditing(true);
    setIsPreview(false);
  };

  const handleSave = async () => {
    if (!selectedPolicy) return;

    try {
      await updatePolicy.mutateAsync({
        policy_key: selectedPolicy.policy_key,
        title: editTitle,
        content: editContent,
        version: incrementVersion(selectedPolicy.version),
        is_published: selectedPolicy.is_published,
      });
      
      toast({ title: 'Policy saved', description: `${editTitle} has been updated.` });
      setIsEditing(false);
      setSelectedPolicy(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const incrementVersion = (version: string) => {
    const parts = version.split('.');
    const minor = parseInt(parts[1] || '0') + 1;
    return `${parts[0]}.${minor}`;
  };

  const handleTogglePublished = async (policy: any) => {
    try {
      await updatePolicy.mutateAsync({
        policy_key: policy.policy_key,
        title: policy.title,
        content: policy.content,
        version: policy.version,
        is_published: !policy.is_published,
      });
      toast({ title: 'Status updated' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleAddPolicy = async () => {
    const newPolicyKey = `new-policy-${Date.now()}`;
    try {
      await updatePolicy.mutateAsync({
        policy_key: newPolicyKey,
        title: 'New Policy',
        content: '# New Policy\n\nAdd your policy content here...',
        version: '1.0',
        is_published: false,
      });
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (policyKey: string) => {
    try {
      const { error } = await supabase
        .from('policies_content')
        .delete()
        .eq('policy_key', policyKey);
      
      if (error) throw error;
      toast({ title: 'Policy deleted' });
      refetch();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const renderMarkdown = (content: string) => {
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
                  <Button onClick={handleSave} disabled={updatePolicy.isPending} className="gap-2">
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
            {policies?.map((policy) => (
              <Card key={policy.id} className={!policy.is_published ? 'opacity-60' : ''}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        {policy.title}
                      </CardTitle>
                      <CardDescription>/{policy.policy_key}</CardDescription>
                    </div>
                    <Badge variant={policy.is_published ? 'default' : 'secondary'}>
                      {policy.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>Version: {policy.version}</p>
                    <p>Last updated: {format(new Date(policy.updated_at), 'MMM dd, yyyy')}</p>
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
                      onClick={() => handleTogglePublished(policy)}
                    >
                      {policy.is_published ? 'Unpublish' : 'Publish'}
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
                          <AlertDialogAction onClick={() => handleDelete(policy.policy_key)}>
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
            <CardDescription>Links to published policies visible to users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-3">
              {policies?.filter(p => p.is_published).map((policy) => (
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