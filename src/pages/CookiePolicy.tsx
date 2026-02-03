import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Cookie } from 'lucide-react';

export default function CookiePolicy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Cookie className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Politica de Cookie-uri</h1>
            <p className="text-muted-foreground">Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}</p>
          </div>

          <Card>
            <CardContent className="py-8 prose prose-gray dark:prose-invert max-w-none">
              <h2 className="text-2xl font-semibold mt-5 mb-3">Ce sunt cookie-urile?</h2>
              <p className="my-2 text-muted-foreground">
                Cookie-urile sunt fișiere mici de text stocate pe dispozitivul tău când vizitezi un site web.
              </p>

              <h2 className="text-2xl font-semibold mt-5 mb-3">Cookie-uri utilizate</h2>
              <ul className="space-y-2 text-muted-foreground">
                <li className="ml-4">• <strong>Cookie-uri esențiale:</strong> Necesare pentru funcționarea platformei</li>
                <li className="ml-4">• <strong>Cookie-uri de autentificare:</strong> Pentru a menține sesiunea ta activă</li>
                <li className="ml-4">• <strong>Cookie-uri de preferințe:</strong> Pentru a reține setările tale</li>
              </ul>

              <h2 className="text-2xl font-semibold mt-5 mb-3">Gestionarea cookie-urilor</h2>
              <p className="my-2 text-muted-foreground">
                Poți gestiona preferințele cookie-urilor din setările browserului tău.
                Dezactivarea cookie-urilor esențiale poate afecta funcționalitatea platformei.
              </p>

              <h2 className="text-2xl font-semibold mt-5 mb-3">Contact</h2>
              <p className="my-2 text-muted-foreground">
                Pentru întrebări despre cookie-uri, contactează-ne la <a href="/contact" className="text-primary hover:underline">pagina de contact</a>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
