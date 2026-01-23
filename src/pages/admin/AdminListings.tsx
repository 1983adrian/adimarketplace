import { useState } from 'react';
import { Search, MoreHorizontal, Eye, EyeOff, Trash2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAllListings, useUpdateListingStatus, useDeleteListing } from '@/hooks/useAdmin';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminListings() {
  const [search, setSearch] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const { data: listings, isLoading } = useAllListings();
  const updateStatus = useUpdateListingStatus();
  const deleteListing = useDeleteListing();
  const { toast } = useToast();

  const filteredListings = listings?.filter(listing => 
    listing.title?.toLowerCase().includes(search.toLowerCase()) ||
    listing.profiles?.display_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleToggleActive = async (id: string, currentStatus: boolean) => {
    try {
      await updateStatus.mutateAsync({ id, is_active: !currentStatus });
      toast({ title: currentStatus ? 'Listing hidden' : 'Listing activated' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteListing.mutateAsync(deleteId);
      toast({ title: 'Listing deleted' });
      setDeleteId(null);
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const getPrimaryImage = (images: any[]) => {
    const primary = images?.find(img => img.is_primary);
    return primary?.image_url || images?.[0]?.image_url;
  };

  return (
    <AdminLayout>
      <div className="space-y-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Listări Produse</h1>
          <p className="text-xs text-muted-foreground">Moderează listările marketplace</p>
        </div>

        <Card>
          <CardHeader className="p-3 md:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <CardTitle className="text-sm md:text-base">Toate Listările</CardTitle>
                <CardDescription className="text-xs">{listings?.length || 0} total</CardDescription>
              </div>
              <div className="relative w-full sm:w-48">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                <Input 
                  placeholder="Caută..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-7 h-8 text-xs"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-2 md:p-6">
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Produs</TableHead>
                      <TableHead className="text-xs hidden sm:table-cell">Vânzător</TableHead>
                      <TableHead className="text-xs hidden md:table-cell">Categorie</TableHead>
                      <TableHead className="text-xs">Preț</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs hidden lg:table-cell">Data</TableHead>
                      <TableHead className="text-right text-xs">Acțiuni</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredListings?.map((listing) => (
                      <TableRow key={listing.id}>
                        <TableCell className="p-2">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded bg-muted overflow-hidden flex-shrink-0">
                              {getPrimaryImage(listing.listing_images) ? (
                                <img 
                                  src={getPrimaryImage(listing.listing_images)} 
                                  alt={listing.title}
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground text-[8px]">
                                  N/A
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-xs line-clamp-1">{listing.title}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {listing.views_count} vizualizări
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-xs">
                          {listing.profiles?.display_name || 'Necunoscut'}
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-xs">
                          {listing.categories?.name || '-'}
                        </TableCell>
                        <TableCell className="font-medium text-xs">
                          £{Number(listing.price).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          {listing.is_sold ? (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Vândut</Badge>
                          ) : listing.is_active ? (
                            <Badge className="bg-green-500 text-[10px] px-1.5 py-0">Activ</Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Ascuns</Badge>
                          )}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-xs">
                          {new Date(listing.created_at).toLocaleDateString('ro-RO')}
                        </TableCell>
                        <TableCell className="text-right p-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-7 w-7">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel className="text-xs">Acțiuni</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem asChild className="text-xs">
                                <Link to={`/listing/${listing.id}`} target="_blank">
                                  <ExternalLink className="h-3 w-3 mr-2" />
                                  Vezi
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleToggleActive(listing.id, listing.is_active)} className="text-xs">
                                {listing.is_active ? (
                                  <>
                                    <EyeOff className="h-3 w-3 mr-2" />
                                    Ascunde
                                  </>
                                ) : (
                                  <>
                                    <Eye className="h-3 w-3 mr-2" />
                                    Afișează
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="text-destructive text-xs"
                                onClick={() => setDeleteId(listing.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-2" />
                                Șterge
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Șterge Listarea?</AlertDialogTitle>
            <AlertDialogDescription>
              Această acțiune este permanentă și va șterge listarea din marketplace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Șterge
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
