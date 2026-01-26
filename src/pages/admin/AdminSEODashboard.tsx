import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Globe, TrendingUp, RefreshCw, CheckCircle, Clock, AlertCircle, Zap, Target, Activity } from 'lucide-react';
import { useSeoIndexingQueue, useSeoKeywords, usePlatformActivity, usePlatformStatistics } from '@/hooks/usePlatformActivity';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const AdminSEODashboard = () => {
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  const { data: indexingQueue, refetch: refetchQueue } = useSeoIndexingQueue();
  const { data: keywords } = useSeoKeywords();
  const { data: activity } = usePlatformActivity(20);
  const { data: stats } = usePlatformStatistics();

  const handleProcessQueue = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-indexing', {
        body: { action: 'process_queue' }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Succes!',
        description: data.message || 'Coada a fost procesată',
        className: 'bg-green-500 text-white',
      });
      
      refetchQueue();
    } catch (err: any) {
      toast({
        title: 'Eroare',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePingGoogle = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-indexing', {
        body: { action: 'ping_google' }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Sitemap Ping Trimis!',
        description: 'Google și Bing au fost notificate despre actualizarea sitemap-ului',
        className: 'bg-green-500 text-white',
      });
    } catch (err: any) {
      toast({
        title: 'Eroare',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleGenerateSitemap = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase.functions.invoke('google-indexing', {
        body: { action: 'generate_sitemap' }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Sitemap Generat!',
        description: data.message,
        className: 'bg-green-500 text-white',
      });
    } catch (err: any) {
      toast({
        title: 'Eroare',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />În Așteptare</Badge>;
      case 'submitted':
        return <Badge variant="outline" className="bg-blue-100 text-blue-800"><RefreshCw className="h-3 w-3 mr-1" />Trimis</Badge>;
      case 'indexed':
        return <Badge variant="outline" className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Indexat</Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-100 text-red-800"><AlertCircle className="h-3 w-3 mr-1" />Eșuat</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const pendingCount = indexingQueue?.filter(i => i.status === 'pending').length || 0;
  const submittedCount = indexingQueue?.filter(i => i.status === 'submitted').length || 0;
  const indexedCount = indexingQueue?.filter(i => i.status === 'indexed').length || 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Search className="h-6 w-6 text-primary" />
              SEO & Google Indexing Dashboard
            </h1>
            <p className="text-muted-foreground">Monitorizează și optimizează vizibilitatea în motoarele de căutare</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handlePingGoogle} disabled={isProcessing} variant="outline">
              <Globe className="h-4 w-4 mr-2" />
              Ping Google
            </Button>
            <Button onClick={handleGenerateSitemap} disabled={isProcessing} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerează Sitemap
            </Button>
            <Button onClick={handleProcessQueue} disabled={isProcessing}>
              <Zap className="h-4 w-4 mr-2" />
              Procesează Coada
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">În Așteptare</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
              <p className="text-xs text-muted-foreground">URL-uri de procesat</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Trimise</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{submittedCount}</div>
              <p className="text-xs text-muted-foreground">Trimise către Google</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Indexate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{indexedCount}</div>
              <p className="text-xs text-muted-foreground">Confirmate de Google</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Listări Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total_listings || 0}</div>
              <p className="text-xs text-muted-foreground">Produse indexabile</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="queue">
          <TabsList>
            <TabsTrigger value="queue">Coada de Indexare</TabsTrigger>
            <TabsTrigger value="keywords">Cuvinte Cheie SEO</TabsTrigger>
            <TabsTrigger value="activity">Activitate Platformă</TabsTrigger>
          </TabsList>

          <TabsContent value="queue" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Coada de Indexare Google</CardTitle>
                <CardDescription>URL-uri în așteptare pentru a fi trimise către Google Indexing API</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>URL</TableHead>
                      <TableHead>Acțiune</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Prioritate</TableHead>
                      <TableHead>Creat</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {indexingQueue?.map((item: any) => (
                      <TableRow key={item.id}>
                        <TableCell className="max-w-xs truncate font-mono text-xs">{item.url}</TableCell>
                        <TableCell>
                          <Badge variant={item.action === 'URL_UPDATED' ? 'default' : 'destructive'}>
                            {item.action === 'URL_UPDATED' ? 'Actualizat' : 'Șters'}
                          </Badge>
                        </TableCell>
                        <TableCell>{getStatusBadge(item.status)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{item.priority}</Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(item.created_at), 'dd MMM HH:mm', { locale: ro })}
                        </TableCell>
                      </TableRow>
                    ))}
                    {(!indexingQueue || indexingQueue.length === 0) && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          Nicio intrare în coadă
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="keywords" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Cuvinte Cheie SEO Țintă
                </CardTitle>
                <CardDescription>Monitorizează poziția în căutări pentru cuvintele cheie importante</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Cuvânt Cheie</TableHead>
                      <TableHead>Categorie</TableHead>
                      <TableHead>Rang Țintă</TableHead>
                      <TableHead>Rang Actual</TableHead>
                      <TableHead>Primar</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {keywords?.map((kw: any) => (
                      <TableRow key={kw.id}>
                        <TableCell className="font-medium">{kw.keyword}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{kw.category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">Top {kw.target_rank}</Badge>
                        </TableCell>
                        <TableCell>
                          {kw.current_rank ? (
                            <Badge variant={kw.current_rank <= kw.target_rank ? 'default' : 'destructive'}>
                              #{kw.current_rank}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {kw.is_primary && <CheckCircle className="h-4 w-4 text-green-500" />}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activitate Recentă
                </CardTitle>
                <CardDescription>Semnale de freshness pentru motoarele de căutare</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {activity?.map((act: any) => (
                    <div key={act.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          act.activity_type === 'listing_created' ? 'bg-green-100 text-green-600' :
                          act.activity_type === 'listing_updated' ? 'bg-blue-100 text-blue-600' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {act.activity_type === 'listing_created' ? <TrendingUp className="h-4 w-4" /> :
                           act.activity_type === 'listing_updated' ? <RefreshCw className="h-4 w-4" /> :
                           <Activity className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">
                            {act.activity_type === 'listing_created' ? 'Anunț Nou Creat' :
                             act.activity_type === 'listing_updated' ? 'Anunț Actualizat' :
                             act.activity_type}
                          </p>
                          {act.metadata?.title && (
                            <p className="text-xs text-muted-foreground">{act.metadata.title}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(act.created_at), 'dd MMM HH:mm', { locale: ro })}
                      </span>
                    </div>
                  ))}
                  {(!activity || activity.length === 0) && (
                    <p className="text-center text-muted-foreground py-8">
                      Nicio activitate recentă
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminSEODashboard;
