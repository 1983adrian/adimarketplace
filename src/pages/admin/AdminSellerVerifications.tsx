import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle, XCircle, Clock, Search, Loader2, AlertTriangle,
  Shield, User
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface SellerInfo {
  id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  store_name: string | null;
  paypal_email: string | null;
  is_seller: boolean | null;
  is_verified: boolean | null;
  seller_type: string | null;
  created_at: string;
}

const AdminSellerVerifications = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: sellers, isLoading } = useQuery({
    queryKey: ['admin-seller-verification'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, user_id, display_name, username, avatar_url, store_name, paypal_email, is_seller, is_verified, seller_type, created_at')
        .eq('is_seller', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SellerInfo[];
    },
  });

  const getStatusBadge = (seller: SellerInfo) => {
    if (seller.is_verified) {
      return (
        <Badge className="bg-green-500 gap-1">
          <CheckCircle className="h-3 w-3" />
          Verificat
        </Badge>
      );
    }
    if (seller.paypal_email) {
      return (
        <Badge variant="secondary" className="gap-1">
          <Clock className="h-3 w-3" />
          PayPal Configurat
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Fără PayPal
      </Badge>
    );
  };

  const withPayPal = sellers?.filter(s => !!s.paypal_email) || [];
  const withoutPayPal = sellers?.filter(s => !s.paypal_email) || [];

  const filterSellers = (list: SellerInfo[]) => list.filter(s =>
    s.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.store_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTable = (list: SellerInfo[]) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      );
    }
    if (list.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            Nu există vânzători în această categorie.
          </CardContent>
        </Card>
      );
    }
    return (
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Vânzător</TableHead>
              <TableHead>Magazin</TableHead>
              <TableHead>Tip</TableHead>
              <TableHead>PayPal</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Înregistrat</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {list.map((seller) => (
              <TableRow key={seller.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarImage src={seller.avatar_url || undefined} />
                      <AvatarFallback>{seller.display_name?.[0] || 'V'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{seller.display_name || 'Fără nume'}</p>
                      <p className="text-sm text-muted-foreground">@{seller.username || 'user'}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{seller.store_name || '-'}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {seller.seller_type === 'business' ? 'Business' : 'Personal'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {seller.paypal_email ? (
                    <Badge variant="secondary" className="gap-1">
                      <CheckCircle className="h-3 w-3 text-green-500" />
                      Configurat
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>{getStatusBadge(seller)}</TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {format(new Date(seller.created_at), 'dd.MM.yyyy')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    );
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Verificare Vânzători</h1>
          <p className="text-muted-foreground">
            Monitorizează statusul vânzătorilor și configurarea PayPal
          </p>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Verificare prin PayPal</AlertTitle>
          <AlertDescription>
            Toate verificările sunt gestionate direct de PayPal. Vânzătorii își configurează 
            contul PayPal în setări pentru a putea primi plăți.
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Vânzători</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <User className="h-8 w-8 text-primary" />
                <span className="text-3xl font-bold">{sellers?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cu PayPal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <span className="text-3xl font-bold">{withPayPal.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Fără PayPal</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-8 w-8 text-amber-500" />
                <span className="text-3xl font-bold">{withoutPayPal.length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută după nume, username sau magazin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">Toți ({sellers?.length || 0})</TabsTrigger>
            <TabsTrigger value="paypal">Cu PayPal ({withPayPal.length})</TabsTrigger>
            <TabsTrigger value="no-paypal">Fără PayPal ({withoutPayPal.length})</TabsTrigger>
          </TabsList>
          <TabsContent value="all">{renderTable(filterSellers(sellers || []))}</TabsContent>
          <TabsContent value="paypal">{renderTable(filterSellers(withPayPal))}</TabsContent>
          <TabsContent value="no-paypal">{renderTable(filterSellers(withoutPayPal))}</TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSellerVerifications;
