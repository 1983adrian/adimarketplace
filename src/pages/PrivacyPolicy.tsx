import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { usePoliciesContent } from '@/hooks/useAdminSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield } from 'lucide-react';

export default function PrivacyPolicy() {
  const { data: policies, isLoading } = usePoliciesContent();
  const privacyPolicy = policies?.find(p => p.policy_key === 'privacy' && p.is_published);

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

  const defaultContent = `# Politica de Confidențialitate

## 1. Date Colectate
Colectăm următoarele tipuri de informații:
- Informații de cont (email, nume)
- Informații de profil (avatar, locație)
- Date despre tranzacții

## 2. Utilizarea Datelor
Datele sunt utilizate pentru:
- Furnizarea serviciilor platformei
- Comunicarea cu utilizatorii
- Îmbunătățirea experienței

## 3. Protecția Datelor
- Datele sunt stocate securizat
- Nu vindem datele personale terților
- Respectăm GDPR

## 4. Drepturile Tale
Ai dreptul să:
- Accesezi datele tale
- Rectifici informațiile incorecte
- Ștergi contul și datele asociate

## 5. Contact
Pentru întrebări despre confidențialitate, contactează-ne la privacy@marketplace.com`;

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Politica de Confidențialitate</h1>
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
                  {renderMarkdown(privacyPolicy?.content || defaultContent)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
