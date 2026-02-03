import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  CheckCircle, XCircle, Clock, Search, Loader2, AlertTriangle,
  ExternalLink, Shield, Building2, User, CreditCard
} from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface SellerKYC {
  id: string;
  user_id: string;
  display_name: string | null;
  username: string | null;
  avatar_url: string | null;
  store_name: string | null;
  kyc_status: string | null;
  kyc_country: string | null;
  business_type: string | null;
  company_name: string | null;
  mangopay_user_id: string | null;
  mangopay_wallet_id: string | null;
  adyen_account_id: string | null;
  iban: string | null;
  is_seller: boolean | null;
  created_at: string;
}

const AdminSellerVerifications = () => {
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch all sellers with KYC data
  const { data: sellers, isLoading, refetch } = useQuery({
    queryKey: ['admin-seller-kyc'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_seller', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as SellerKYC[];
    },
  });

  const getKYCStatusBadge = (status: string | null) => {
    switch (status) {
      case 'approved':
      case 'verified':
        return (
          <Badge className="bg-green-500 gap-1">
            <CheckCircle className="h-3 w-3" />
            Verificat MangoPay
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="gap-1">
            <Clock className="h-3 w-3" />
            În Verificare
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Respins
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="gap-1">
            <AlertTriangle className="h-3 w-3" />
            Neverificat
          </Badge>
        );
    }
  };

  const verifiedSellers = sellers?.filter(s => s.kyc_status === 'approved' || s.kyc_status === 'verified') || [];
  const pendingSellers = sellers?.filter(s => s.kyc_status === 'pending') || [];
  const unverifiedSellers = sellers?.filter(s => !s.kyc_status || s.kyc_status === 'rejected' || s.kyc_status === 'pending') || [];

  const filteredSellers = (list: SellerKYC[]) => list.filter(s =>
    s.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.store_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Status KYC Vânzători</h1>
          <p className="text-muted-foreground">
            Monitorizează statusul verificării KYC prin MangoPay
          </p>
        </div>

        {/* Info Alert */}
        <Alert>
          <Shield className="h-4 w-4" />
          <AlertTitle>Verificări procesate de MangoPay</AlertTitle>
          <AlertDescription>
            Toate verificările KYC (Know Your Customer) sunt procesate automat de MangoPay. 
            Vânzătorii își încarcă documentele în secțiunea lor de setări, iar MangoPay le verifică în 24-48 ore.
            Nu este necesară intervenție manuală din partea administratorului.
          </AlertDescription>
        </Alert>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
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
              <CardTitle className="text-sm font-medium">KYC Verificat</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-8 w-8 text-green-500" />
                <span className="text-3xl font-bold">{verifiedSellers.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">În Verificare</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-8 w-8 text-amber-500" />
                <span className="text-3xl font-bold">{pendingSellers.length}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cu MangoPay Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CreditCard className="h-8 w-8 text-blue-500" />
                <span className="text-3xl font-bold">{sellers?.filter(s => s.mangopay_wallet_id).length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Caută după nume, username sau magazin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              Toți ({sellers?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="verified" className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Verificați ({verifiedSellers.length})
            </TabsTrigger>
            <TabsTrigger value="pending" className="gap-2">
              <Clock className="h-4 w-4" />
              În Așteptare ({unverifiedSellers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {renderSellerTable(filteredSellers(sellers || []), isLoading, getKYCStatusBadge)}
          </TabsContent>

          <TabsContent value="verified">
            {renderSellerTable(filteredSellers(verifiedSellers), isLoading, getKYCStatusBadge)}
          </TabsContent>

          <TabsContent value="pending">
            {renderSellerTable(filteredSellers(unverifiedSellers), isLoading, getKYCStatusBadge)}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

function renderSellerTable(
  sellers: SellerKYC[], 
  isLoading: boolean,
  getKYCStatusBadge: (status: string | null) => JSX.Element
) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (sellers.length === 0) {
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
            <TableHead>Tip Afacere</TableHead>
            <TableHead>Țară KYC</TableHead>
            <TableHead>MangoPay ID</TableHead>
            <TableHead>Status KYC</TableHead>
            <TableHead>Payout</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sellers.map((seller) => (
            <TableRow key={seller.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={seller.avatar_url || undefined} />
                    <AvatarFallback>
                      {seller.display_name?.[0] || 'V'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{seller.display_name || 'Fără nume'}</p>
                    <p className="text-sm text-muted-foreground">@{seller.username || 'user'}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>{seller.store_name || '-'}</TableCell>
              <TableCell>
                <div className="flex items-center gap-1">
                  {seller.business_type === 'business' ? (
                    <>
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <span>{seller.company_name || 'Firmă'}</span>
                    </>
                  ) : (
                    <>
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>Persoană Fizică</span>
                    </>
                  )}
                </div>
              </TableCell>
              <TableCell>{seller.kyc_country || '-'}</TableCell>
              <TableCell>
                {seller.mangopay_user_id ? (
                  <code className="text-xs bg-muted px-2 py-1 rounded">
                    {seller.mangopay_user_id.slice(0, 12)}...
                  </code>
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </TableCell>
              <TableCell>
                {getKYCStatusBadge(seller.kyc_status)}
              </TableCell>
              <TableCell>
                {seller.iban ? (
                  <Badge variant="outline" className="gap-1">
                    <CreditCard className="h-3 w-3" />
                    IBAN configurat
                  </Badge>
                ) : seller.mangopay_wallet_id ? (
                  <Badge variant="secondary" className="gap-1">
                    Wallet activ
                  </Badge>
                ) : (
                  <span className="text-muted-foreground text-sm">Neconfigurat</span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
}

export default AdminSellerVerifications;
