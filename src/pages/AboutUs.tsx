import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { usePoliciesContent } from '@/hooks/useAdminSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { Users, Shield, Heart, Zap } from 'lucide-react';

export default function AboutUs() {
  const { data: policies, isLoading } = usePoliciesContent();
  const aboutPolicy = policies?.find(p => p.policy_key === 'about-us' && p.is_published);

  const renderMarkdown = (content: string) => {
    return content.split('\n').map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-3xl font-bold mt-6 mb-4">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-2xl font-semibold mt-5 mb-3">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-xl font-medium mt-4 mb-2">{line.slice(4)}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-4 mb-1">{line.slice(2)}</li>;
      }
      if (line.trim() === '') {
        return <br key={index} />;
      }
      return <p key={index} className="my-2 text-muted-foreground">{line}</p>;
    });
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">Despre Noi</h1>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Descoperă povestea din spatele marketplace-ului tău de încredere
          </p>

          {/* Values Section */}
          <div className="grid md:grid-cols-4 gap-6 mb-12">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Users className="h-10 w-10 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Comunitate</h3>
                <p className="text-sm text-muted-foreground">Construim legături între vânzători și cumpărători</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Shield className="h-10 w-10 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Siguranță</h3>
                <p className="text-sm text-muted-foreground">Tranzacții sigure și protejate</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Heart className="h-10 w-10 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Încredere</h3>
                <p className="text-sm text-muted-foreground">Review-uri și verificări de încredere</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="pt-6">
                <Zap className="h-10 w-10 mx-auto mb-4 text-primary" />
                <h3 className="font-semibold mb-2">Rapiditate</h3>
                <p className="text-sm text-muted-foreground">Listări și tranzacții rapide</p>
              </CardContent>
            </Card>
          </div>

          {/* Content from Database */}
          <Card>
            <CardHeader>
              <CardTitle>Misiunea Noastră</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ) : aboutPolicy ? (
                <div className="prose prose-gray dark:prose-invert max-w-none">
                  {renderMarkdown(aboutPolicy.content)}
                </div>
              ) : (
                <div className="space-y-4 text-muted-foreground">
                  <p>
                    MarketPlace a fost creat cu o viziune simplă: să facilităm schimbul de bunuri
                    între oameni într-un mod sigur, rapid și transparent.
                  </p>
                  <p>
                    Echipa noastră lucrează zilnic pentru a îmbunătăți experiența utilizatorilor,
                    oferind o platformă modernă care pune accent pe siguranță și încredere.
                  </p>
                  <p>
                    Ne mândrim cu o comunitate în creștere de vânzători și cumpărători care
                    folosesc platforma noastră pentru a găsi ceea ce caută.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
