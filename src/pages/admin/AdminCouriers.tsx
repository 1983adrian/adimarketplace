import React from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { CourierAPISettings } from '@/components/admin/CourierAPISettings';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Truck, Box, MapPin, Package } from 'lucide-react';

const AdminCouriers = () => {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Truck className="h-8 w-8" />
            Integrare Curieri România
          </h1>
          <p className="text-muted-foreground mt-1">
            Configurează API-urile pentru curieri pentru generare AWB automată și tracking
          </p>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Curieri Disponibili</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5</div>
              <p className="text-xs text-muted-foreground">FAN, Cargus, Sameday, DPD, GLS</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Box className="h-4 w-4" />
                Lockere Suportate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
              <p className="text-xs text-muted-foreground">Easybox, FANbox, Ship&Go, DPD Pickup</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Funcționalități</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-1">
                <Badge variant="outline" className="text-xs">AWB Auto</Badge>
                <Badge variant="outline" className="text-xs">Tracking</Badge>
                <Badge variant="outline" className="text-xs">Ramburs</Badge>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Badge className="bg-amber-500">Demo Mode</Badge>
              <p className="text-xs text-muted-foreground mt-1">Adaugă API keys pentru live</p>
            </CardContent>
          </Card>
        </div>

        {/* API Settings */}
        <CourierAPISettings />

        {/* Help Section */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cum funcționează?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Package className="h-5 w-5" />
                  </div>
                  <h4 className="font-medium">1. Obține Credențiale</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Contactează fiecare curier pentru a obține acces API. De obicei necesită contract de parteneriat.
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <h4 className="font-medium">2. Configurează & Testează</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  Introdu credențialele în formular și folosește butonul de testare pentru a verifica conexiunea.
                </p>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    <Truck className="h-5 w-5" />
                  </div>
                  <h4 className="font-medium">3. Activează</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  După testare cu succes, activează curierul. AWB-urile se vor genera automat la comenzi.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminCouriers;
