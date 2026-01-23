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
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-xl md:text-2xl font-bold">Categorii</h1>
            <p className="text-xs text-muted-foreground">Gestionează categoriile</p>
          </div>
          <Button onClick={handleAdd} size="sm" className="gap-1 h-8 text-xs">
            <Plus className="h-3 w-3" />
            Adaugă
          </Button>
        </div>

        {/* Add/Edit Form */}
        {(isAdding || isEditing) && (
          <Card>
            <CardHeader className="p-3">
              <CardTitle className="text-sm">{isAdding ? 'Adaugă Categorie' : 'Editează'}</CardTitle>
            </CardHeader>
            <CardContent className="p-3 space-y-3">
              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Nume</Label>
                  <Input
                    value={form.name}
                    onChange={(e) => {
                      setForm(prev => ({ 
                        ...prev, 
                        name: e.target.value,
                        slug: generateSlug(e.target.value)
                      }));
                    }}
                    placeholder="Electronice"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Slug</Label>
                  <Input
                    value={form.slug}
                    onChange={(e) => setForm(prev => ({ ...prev, slug: e.target.value }))}
                    placeholder="electronice"
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              <div className="grid gap-3 grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Iconiță</Label>
                  <Input
                    value={form.icon}
                    onChange={(e) => setForm(prev => ({ ...prev, icon: e.target.value }))}
                    placeholder="📦"
                    className="h-8 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Categorie Părinte</Label>
                  <Select
                    value={form.parent_id || 'none'}
                    onValueChange={(value) => setForm(prev => ({ 
                      ...prev, 
                      parent_id: value === 'none' ? null : value 
                    }))}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue placeholder="Niciuna" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Niciuna (Top)</SelectItem>
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
                <Button onClick={handleSave} disabled={isSaving} size="sm" className="gap-1 h-7 text-xs">
                  <Save className="h-3 w-3" />
                  {isAdding ? 'Creează' : 'Salvează'}
                </Button>
                <Button variant="outline" onClick={handleCancel} size="sm" className="gap-1 h-7 text-xs">
                  <X className="h-3 w-3" />
                  Anulează
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Categories List */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-3">
          {parentCategories.map((category) => {
            const children = getChildCategories(category.id);
            
            return (
              <Card key={category.id} className="overflow-hidden">
                <CardHeader className="p-2 pb-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="text-lg">{category.icon}</span>
                      <div className="min-w-0">
                        <CardTitle className="text-xs font-medium truncate">{category.name}</CardTitle>
                        <CardDescription className="text-[10px]">/{category.slug}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-0.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleEdit(category)}
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
                            <AlertDialogTitle>Șterge Categoria?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Aceasta va șterge "{category.name}" permanent.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Anulează</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(category.id)}>
                              Șterge
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>
                </CardHeader>
                {children.length > 0 && (
                  <CardContent className="p-2 pt-0">
                    <div className="space-y-1">
                      <p className="text-[10px] text-muted-foreground">Subcategorii:</p>
                      {children.map((child) => (
                        <div 
                          key={child.id} 
                          className="flex items-center justify-between p-1.5 rounded bg-muted/50 text-xs"
                        >
                          <span className="truncate">{child.icon} {child.name}</span>
                          <div className="flex gap-0.5">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-5 w-5"
                              onClick={() => handleEdit(child)}
                            >
                              <Edit2 className="h-2.5 w-2.5" />
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive">
                                  <Trash2 className="h-2.5 w-2.5" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Șterge Subcategoria?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Aceasta va șterge "{child.name}" permanent.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Anulează</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(child.id)}>
                                    Șterge
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
          <CardHeader className="p-3">
            <CardTitle className="flex items-center gap-1.5 text-sm">
              <FolderTree className="h-4 w-4" />
              Statistici Categorii
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className="grid gap-2 grid-cols-3">
              <div className="p-2 rounded-lg bg-muted/50 text-center">
                <div className="text-lg font-bold">{parentCategories.length}</div>
                <p className="text-[10px] text-muted-foreground">Principale</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50 text-center">
                <div className="text-lg font-bold">
                  {categories?.filter(c => c.parent_id).length || 0}
                </div>
                <p className="text-[10px] text-muted-foreground">Sub</p>
              </div>
              <div className="p-2 rounded-lg bg-muted/50 text-center">
                <div className="text-lg font-bold">{categories?.length || 0}</div>
                <p className="text-[10px] text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
