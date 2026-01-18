import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useExportData = () => {
  const { toast } = useToast();

  const exportToJSON = (data: any, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportToCSV = (data: any[], filename: string) => {
    if (!data.length) return;
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(h => JSON.stringify(row[h] ?? '')).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      exportToCSV(data || [], 'users_export');
      toast({ title: 'Export reușit', description: 'Datele utilizatorilor au fost exportate.' });
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-au putut exporta datele.', variant: 'destructive' });
    }
  };

  const exportOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, listings(title)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const flatData = data?.map(o => ({
        ...o,
        listing_title: o.listings?.title,
        listings: undefined
      }));
      exportToCSV(flatData || [], 'orders_export');
      toast({ title: 'Export reușit', description: 'Comenzile au fost exportate.' });
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-au putut exporta datele.', variant: 'destructive' });
    }
  };

  const exportListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*, categories(name)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      const flatData = data?.map(l => ({
        ...l,
        category_name: l.categories?.name,
        categories: undefined
      }));
      exportToCSV(flatData || [], 'listings_export');
      toast({ title: 'Export reușit', description: 'Produsele au fost exportate.' });
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-au putut exporta datele.', variant: 'destructive' });
    }
  };

  const exportFullReport = async () => {
    try {
      const [users, orders, listings, disputes, returns] = await Promise.all([
        supabase.from('profiles').select('*'),
        supabase.from('orders').select('*'),
        supabase.from('listings').select('*'),
        supabase.from('disputes').select('*'),
        supabase.from('returns').select('*'),
      ]);

      const report = {
        exportDate: new Date().toISOString(),
        summary: {
          totalUsers: users.data?.length || 0,
          totalOrders: orders.data?.length || 0,
          totalListings: listings.data?.length || 0,
          totalDisputes: disputes.data?.length || 0,
          totalReturns: returns.data?.length || 0,
        },
        users: users.data,
        orders: orders.data,
        listings: listings.data,
        disputes: disputes.data,
        returns: returns.data,
      };

      exportToJSON(report, 'full_platform_report');
      toast({ title: 'Raport complet exportat', description: 'Toate datele platformei au fost exportate.' });
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-a putut genera raportul.', variant: 'destructive' });
    }
  };

  const sendReportToAdmin = async (adminEmail: string) => {
    try {
      const [orders, disputes] = await Promise.all([
        supabase.from('orders').select('*').order('created_at', { ascending: false }).limit(10),
        supabase.from('disputes').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      // Send email via edge function
      await supabase.functions.invoke('send-notification', {
        body: {
          type: 'email',
          to: adminEmail,
          subject: `Raport Platformă AdiMarket - ${new Date().toLocaleDateString('ro-RO')}`,
          message: `
            <h2>Raport Platformă AdiMarket</h2>
            <p>Data: ${new Date().toLocaleString('ro-RO')}</p>
            <h3>Statistici</h3>
            <ul>
              <li>Comenzi recente: ${orders.data?.length || 0}</li>
              <li>Dispute în așteptare: ${disputes.count || 0}</li>
            </ul>
            <p>Acest raport a fost generat automat.</p>
          `,
        },
      });

      toast({ title: 'Raport trimis', description: `Raportul a fost trimis către ${adminEmail}` });
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-a putut trimite raportul.', variant: 'destructive' });
    }
  };

  return {
    exportUsers,
    exportOrders,
    exportListings,
    exportFullReport,
    sendReportToAdmin,
    exportToCSV,
    exportToJSON,
  };
};
