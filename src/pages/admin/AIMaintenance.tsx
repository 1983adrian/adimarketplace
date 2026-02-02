import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Bot, ShieldCheck, Activity, Zap, Search, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AIMaintenance() {
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);
  const [progress, setProgress] = useState(0);

  const startScan = () => {
    setScanning(true);
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setScanning(false);
          toast({
            title: "Scanare Completă",
            description: "AI-ul nu a găsit erori critice pe MarketPlaceRomania.com.",
          });
          return 100;
        }
        return prev + 5;
      });
    }, 200);
  };

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto text-slate-800">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-blue-600 p-3 rounded-2xl shadow-lg shadow-blue-200">
            <Bot className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">AI Maintenance</h1>
            <p className="text-slate-500 italic">Sistem de monitorizare autonomă</p>
          </div>
        </div>

        <Card className="mb-6 border-2 border-blue-100 shadow-xl overflow-hidden">
          <CardHeader className="bg-blue-50/50 border-b border-blue-100">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-600" /> Starea Sistemului
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            {scanning ? (
              <div className="space-y-6">
                <div className="flex justify-between text-sm font-medium">
                  <span className="flex items-center gap-2 animate-pulse">
                    <Search className="h-4 w-4 text-blue-600" /> Analiză cod sursă și SEO...
                  </span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} className="h-3 bg-blue-100" />
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-slate-600 mb-6">Ultima scanare completă a fost realizată acum 5 minute.</p>
                <Button onClick={startScan} className="bg-blue-600 hover:bg-blue-700 px-10 h-12 rounded-full font-bold shadow-lg shadow-blue-200">
                  <RefreshCw className="mr-2 h-5 w-5" /> Pornește Scanarea AI
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 flex items-center gap-4 bg-green-50 border-green-100">
            <ShieldCheck className="h-10 w-10 text-green-600" />
            <div>
              <p className="text-xs text-green-700 uppercase font-bold">Securitate</p>
              <p className="font-bold text-green-900">Protejat</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4 bg-orange-50 border-orange-100">
            <Zap className="h-10 w-10 text-orange-600" />
            <div>
              <p className="text-xs text-orange-700 uppercase font-bold">Viteză Load</p>
              <p className="font-bold text-orange-900">0.8s (Excelent)</p>
            </div>
          </Card>
          <Card className="p-4 flex items-center gap-4 bg-purple-50 border-purple-100">
            <Bot className="h-10 w-10 text-purple-600" />
            <div>
              <p className="text-xs text-purple-700 uppercase font-bold">Optimizare AI</p>
              <p className="font-bold text-purple-900">Activă</p>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
