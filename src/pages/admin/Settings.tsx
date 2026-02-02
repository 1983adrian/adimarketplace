import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Settings as SettingsIcon, Save, Globe, Image as ImageIcon } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
  const { toast } = useToast();
  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold flex items-center gap-2"><SettingsIcon /> Setări Platformă</h1>
        <Card>
          <CardHeader><CardTitle>Identitate Brand</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium">Nume Marketplace</label>
              <Input defaultValue="MarketPlaceRomania.com" />
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium">URL Logo</label>
              <Input placeholder="https://..." />
            </div>
            <Button onClick={() => toast({ title: "Salvat", description: "Configurația de brand a fost actualizată." })}>
              <Save className="mr-2 h-4 w-4" /> Salvează Tot
            </Button>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
