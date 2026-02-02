import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, MessageSquare, Gavel, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Disputes() {
  const { toast } = useToast();
  const [disputes, setDisputes] = useState([
    { id: 101, order: '#ORD-772', client: 'Ion Popescu', seller: 'ElectroZone', reason: 'Produs defect la livrare', status: 'open' },
    { id: 102, order: '#ORD-885', client: 'Maria Enache', seller: 'FashionHub', reason: 'Mărime greșită, refuz retur', status: 'open' }
  ]);

  const resolveDispute = (id: number) => {
    setDisputes(disputes.filter(d => d.id !== id));
    toast({
      title: "Dispută Închisă",
      description: `Problema pentru comanda #${id} a fost soluționată.`,
    });
  };

  return (
    <Layout>
      <div className="p-6 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
          <AlertTriangle className="h-8 w-8 text-orange-500" /> Centru Dispute
        </h1>

        <div className="grid gap-6">
          {disputes.length > 0 ? disputes.map((d) => (
            <Card key={d.id} className="border-l-4 border-l-orange-500">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">Disputa {d.order}</CardTitle>
                  <Badge variant="outline" className="bg-orange-50 text-orange-700">Conflict Deschis</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div><strong>Client:</strong> {d.client}</div>
                  <div><strong>Vânzător:</strong> {d.seller}</div>
                </div>
                <div className="bg-slate-50 p-3 rounded-md italic text-slate-700">
                  "{d.reason}"
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1">
                    <MessageSquare className="mr-2 h-4 w-4" /> Contactează Părțile
                  </Button>
                  <Button onClick={() => resolveDispute(d.id)} className="flex-1 bg-green-600 hover:bg-green-700">
                    <Gavel className="mr-2 h-4 w-4" /> Soluționează (Arbitraj)
                  </Button>
                </div>
              </CardContent>
            </Card>
          )) : (
            <div className="text-center py-20 bg-green-50 rounded-xl border-2 border-dashed border-green-200">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-800">Nicio dispută activă!</h3>
              <p className="text-green-600">Toți clienții și vânzătorii tăi sunt fericiți.</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
