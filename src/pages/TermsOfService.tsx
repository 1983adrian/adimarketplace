import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { usePoliciesContent } from '@/hooks/useAdminSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';

export default function TermsOfService() {
  const { data: policies, isLoading } = usePoliciesContent();
  const termsPolicy = policies?.find(p => p.policy_key === 'terms' && p.is_published);

  const renderMarkdown = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) return <h1 key={index} className="text-3xl font-bold mt-6 mb-4">{line.slice(2)}</h1>;
      if (line.startsWith('## ')) return <h2 key={index} className="text-2xl font-semibold mt-5 mb-3">{line.slice(3)}</h2>;
      if (line.startsWith('### ')) return <h3 key={index} className="text-xl font-medium mt-4 mb-2">{line.slice(4)}</h3>;
      if (line.startsWith('- ')) return <li key={index} className="ml-4 mb-1">{line.slice(2)}</li>;
      if (line.trim() === '') return <br key={index} />;
      return <p key={index} className="my-2 text-muted-foreground">{line}</p>;
    });
  };

  const defaultContent = `# Termeni și Condiții

## 1. Acceptarea Termenilor
Prin utilizarea platformei MarketPlace, acceptați acești termeni și condiții în totalitate.

## 2. Utilizarea Serviciului
- Trebuie să aveți cel puțin 18 ani pentru a utiliza serviciul
- Sunteți responsabil pentru activitatea din contul dumneavoastră
- Nu este permisă vânzarea de produse ilegale sau interzise

## 3. Tranzacții
- Platforma facilitează tranzacțiile între utilizatori
- Nu suntem parte în tranzacțiile dintre vânzători și cumpărători
- Comisioanele sunt afișate transparent înainte de finalizarea tranzacției

## 4. Răspundere
- Nu garantăm calitatea produselor listate de vânzători
- Utilizatorii sunt responsabili pentru acuratețea informațiilor furnizate

## 5. Modificări
Ne rezervăm dreptul de a modifica acești termeni în orice moment.`;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <FileText className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Termeni și Condiții</h1>
            <p className="text-muted-foreground">Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}</p>
          </div>

          <Card>
            <CardContent className="py-8">
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(10)].map((_, i) => <Skeleton key={i} className="h-4 w-full" />)}
                </div>
              ) : (
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  {renderMarkdown(termsPolicy?.content || defaultContent)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
