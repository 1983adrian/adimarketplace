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
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Product Listings</h1>
          <p className="text-muted-foreground">Review and moderate all marketplace listings</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Listings</CardTitle>
                <CardDescription>{listings?.length || 0} total listings</CardDescription>
              </div>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search listings..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Seller</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredListings?.map((listing) => (
                    <TableRow key={listing.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-lg bg-muted overflow-hidden">
                            {getPrimaryImage(listing.listing_images) ? (
                              <img 
                                src={getPrimaryImage(listing.listing_images)} 
                                alt={listing.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs">
                                No img
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium line-clamp-1">{listing.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {listing.views_count} views
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {listing.profiles?.display_name || 'Unknown'}
                      </TableCell>
                      <TableCell>
                        {listing.categories?.name || '-'}
                      </TableCell>
                      <TableCell className="font-medium">
                        £{Number(listing.price).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {listing.is_sold ? (
                          <Badge variant="secondary">Sold</Badge>
                        ) : listing.is_active ? (
                          <Badge className="bg-green-500">Active</Badge>
                        ) : (
                          <Badge variant="destructive">Hidden</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(listing.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <Link to={`/listing/${listing.id}`} target="_blank">
                                <ExternalLink className="h-4 w-4 mr-2" />
                                View Listing
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleActive(listing.id, listing.is_active)}>
                              {listing.is_active ? (
                                <>
                                  <EyeOff className="h-4 w-4 mr-2" />
                                  Hide Listing
                                </>
                              ) : (
                                <>
                                  <Eye className="h-4 w-4 mr-2" />
                                  Show Listing
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => setDeleteId(listing.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Listing
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Listing?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the listing and remove it from the marketplace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
