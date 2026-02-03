import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent } from '@/components/ui/card';
import { Shield, Database, Target, Lock, UserCheck, Trash2 } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <Shield className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Politica de Confidențialitate</h1>
            <p className="text-muted-foreground">Conformă cu GDPR (Regulamentul UE 2016/679)</p>
          </div>

          <div className="space-y-8">
            {/* 2.1. Date colectate */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <Database className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">2.1. Date colectate</h2>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      Colectăm date precum:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                      <li>Nume și prenume</li>
                      <li>Adresă de email</li>
                      <li>Date de contact</li>
                      <li>Adresa IP</li>
                      <li>Informații de cont</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-3">
                      Aceste date sunt colectate exclusiv pentru funcționarea platformei.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2.2. Scopul colectării */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <Target className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">2.2. Scopul colectării</h2>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      Datele sunt utilizate pentru:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                      <li>Crearea și administrarea conturilor</li>
                      <li>Procesarea tranzacțiilor</li>
                      <li>Comunicarea cu utilizatorii</li>
                      <li>Respectarea obligațiilor legale</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2.3. Protecția datelor */}
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <Lock className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">2.3. Protecția datelor</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Datele sunt stocate în condiții de securitate și <strong className="text-foreground">nu sunt vândute sau transferate către terți</strong> fără temei legal.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2.4. Drepturile utilizatorilor */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <UserCheck className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">2.4. Drepturile utilizatorilor</h2>
                    <p className="text-muted-foreground leading-relaxed mb-3">
                      Utilizatorii au dreptul de:
                    </p>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                      <li><strong className="text-foreground">Acces</strong> - să afle ce date deținem despre ei</li>
                      <li><strong className="text-foreground">Rectificare</strong> - să corecteze datele incorecte</li>
                      <li><strong className="text-foreground">Ștergere</strong> - să solicite ștergerea datelor</li>
                      <li><strong className="text-foreground">Portabilitate</strong> - să primească datele într-un format structurat</li>
                    </ul>
                    <p className="text-muted-foreground leading-relaxed mt-3">
                      Conform Regulamentului (UE) 2016/679 (GDPR).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 2.5. Ștergerea contului */}
            <Card>
              <CardContent className="py-6">
                <div className="flex items-start gap-4">
                  <Trash2 className="h-6 w-6 text-primary mt-1 shrink-0" />
                  <div>
                    <h2 className="text-xl font-semibold mb-3">2.5. Ștergerea contului</h2>
                    <p className="text-muted-foreground leading-relaxed">
                      Utilizatorii pot solicita ștergerea contului și a datelor asociate prin contactarea platformei la adresa <a href="mailto:adrianchirita01@gmail.com" className="text-primary hover:underline">adrianchirita01@gmail.com</a>.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Last updated */}
          <p className="text-center text-sm text-muted-foreground mt-8">
            Ultima actualizare: {new Date().toLocaleDateString('ro-RO')}
          </p>
        </div>
      </div>
    </Layout>
  );
}
