import { useState } from 'react';
import { Plus, Edit2, Trash2, FolderTree, Save, X, GripVertical } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategories';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface CategoryForm {
  name: string;
  slug: string;
  icon: string;
  parent_id: string | null;
}

export default function AdminCategories() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: categories, isLoading } = useCategories();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<CategoryForm>({ name: '', slug: '', icon: '', parent_id: null });
  const [isSaving, setIsSaving] = useState(false);

  const generateSlug = (name: string) => {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  };

  const handleAdd = () => {
    setIsAdding(true);
    setForm({ name: '', slug: '', icon: '📦', parent_id: null });
  };

  const handleEdit = (category: any) => {
    setIsEditing(category.id);
    setForm({
      name: category.name,
      slug: category.slug,
      icon: category.icon || '📦',
      parent_id: category.parent_id,
    });
  };

  const handleCancel = () => {
    setIsEditing(null);
    setIsAdding(false);
    setForm({ name: '', slug: '', icon: '', parent_id: null });
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast({ title: 'Error', description: 'Category name is required', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    try {
      const slug = form.slug || generateSlug(form.name);

      if (isAdding) {
        const { error } = await supabase
          .from('categories')
          .insert({
            name: form.name,
            slug,
            icon: form.icon || '📦',
            parent_id: form.parent_id || null,
          });

        if (error) throw error;
        toast({ title: 'Category created', description: `${form.name} has been added.` });
      } else if (isEditing) {
        const { error } = await supabase
          .from('categories')
          .update({
            name: form.name,
            slug,
            icon: form.icon,
            parent_id: form.parent_id || null,
          })
          .eq('id', isEditing);

        if (error) throw error;
        toast({ title: 'Category updated', description: `${form.name} has been updated.` });
      }

      queryClient.invalidateQueries({ queryKey: ['categories'] });
      handleCancel();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast({ title: 'Category deleted' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const parentCategories = categories?.filter(c => !c.parent_id) || [];
  const getChildCategories = (parentId: string) => 
    categories?.filter(c => c.parent_id === parentId) || [];

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground">Manage product categories</p>
          </div>
          <Button onClick={handleAdd} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>

        {/* Add/Edit Form */}
        {(isAdding || isEditing) && (
          <Card>
            <CardHeader>
              <CardTitle>{isAdding ? 'Add New Category' : 'Edit Category'}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Category Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => {
                      setForm(prev => ({ 
                        ...prev, 
                        name: e.target.value,
                        slug: generateSlug(e.target.value)
                      }));
                    }}
                    placeholder="Electronics"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="electronics"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Icon (Emoji)</Label>
                  <Input
                    value={form.icon}
                    onChange={(e) => setForm(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="📦"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Parent Category</Label>
                  <Select
                    value={form.parent_id || 'none'}
                    onValueChange={(value) => setForm(prev => ({ 
                      ...prev, 
                      parent_id: value === 'none' ? null : value 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None (Top Level)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">None (Top Level)</SelectItem>
                      {parentCategories
                        .filter(c => c.id !== isEditing)
                        .map(cat => (
                          <SelectItem key={cat.id} value={cat.id}>
                            {cat.icon} {cat.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {isAdding ? 'Create Category' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={handleCancel} className="gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories List */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {parentCategories.map((category) => {
            const children = getChildCategories(category.id);
            
            return (
              <Card key={category.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <CardTitle className="text-base">{category.name}</CardTitle>
                        <CardDescription className="text-xs">/{category.slug}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(category)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete "{category.name}" and may affect listings in this category.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(category.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                {children.length > 0 && (
                  <CardContent className="pt-0">
                    <div className="space-y-1">
                      <p className="text-xs text-muted-foreground mb-2">Subcategories:</p>
                      {children.map((child) => (
                        <div 
                          key={child.id} 
                          className="flex items-center justify-between p-2 rounded bg-muted/50 text-sm"
                        >
                          <span>{child.icon} {child.name}</span>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleEdit(child)}
                            >
                              <Edit2 className="h-3 w-3" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive">
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Subcategory?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete "{child.name}".
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(child.id)}>
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FolderTree className="h-5 w-5" />
              Category Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold">{parentCategories.length}</div>
                <p className="text-sm text-muted-foreground">Parent Categories</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold">
                  {categories?.filter(c => c.parent_id).length || 0}
                </div>
                <p className="text-sm text-muted-foreground">Subcategories</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <div className="text-2xl font-bold">{categories?.length || 0}</div>
                <p className="text-sm text-muted-foreground">Total Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
