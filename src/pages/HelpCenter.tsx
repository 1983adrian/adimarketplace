import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import { 
  HelpCircle, 
  BookOpen, 
  ShoppingBag, 
  CreditCard, 
  Truck, 
  Shield, 
  MessageCircle,
  AlertTriangle
} from 'lucide-react';

const helpCategories = [
  {
    title: 'Ghid de Început',
    description: 'Primii pași pe platformă',
    icon: BookOpen,
    links: [
      { label: 'Creează un cont', href: '/signup' },
      { label: 'Configurează profilul', href: '/settings' },
      { label: 'Explorează produsele', href: '/browse' },
    ],
  },
  {
    title: 'Cumpărare',
    description: 'Cum să cumperi în siguranță',
    icon: ShoppingBag,
    links: [
      { label: 'Cum cumpăr un produs', href: '/faq' },
      { label: 'Urmărește comanda', href: '/orders' },
      { label: 'Sfaturi de siguranță', href: '/safety' },
    ],
  },
  {
    title: 'Vânzare',
    description: 'Ghid complet pentru vânzători',
    icon: CreditCard,
    links: [
      { label: 'Cum listez un produs', href: '/sell' },
      { label: 'Gestionează produsele', href: '/dashboard' },
      { label: 'Statistici vânzări', href: '/seller-analytics' },
    ],
  },
  {
    title: 'Livrare',
    description: 'Informații despre expediere',
    icon: Truck,
    links: [
      { label: 'Metode de livrare', href: '/faq' },
      { label: 'Costuri expediere', href: '/faq' },
      { label: 'Urmărire colet', href: '/orders' },
    ],
  },
  {
    title: 'Plăți și Abonamente',
    description: '0% comision, abonamente fixe',
    icon: CreditCard,
    links: [
      { label: 'Metode de plată acceptate', href: '/faq' },
      { label: 'Securitate plăți', href: '/safety' },
      { label: 'Taxe și abonamente', href: '/taxe-si-comisioane' },
    ],
  },
  {
    title: 'Securitate și Legal',
    description: 'Protecție și documente legale',
    icon: Shield,
    links: [
      { label: 'Sfaturi de siguranță', href: '/safety' },
      { label: 'Termeni și Condiții', href: '/terms' },
      { label: 'Politica de Confidențialitate', href: '/privacy' },
      { label: 'Regulament Vânzători', href: '/seller-rules' },
      { label: 'Politica Cookie', href: '/cookies' },
    ],
  },
];

export default function HelpCenter() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <HelpCircle className="h-16 w-16 mx-auto mb-4 text-primary" />
            <h1 className="text-4xl font-bold mb-4">Centru de Ajutor</h1>
            <p className="text-xl text-muted-foreground">
              Găsește informații și asistență pentru toate nevoile tale pe Market Place România
            </p>
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-3 gap-4 mb-12">
            <Link to="/faq">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardContent className="pt-6 text-center">
                  <MessageCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold">Întrebări Frecvente</h3>
                  <p className="text-sm text-muted-foreground">Răspunsuri rapide</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/contact">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardContent className="pt-6 text-center">
                  <MessageCircle className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold">Contactează-ne</h3>
                  <p className="text-sm text-muted-foreground">Suport personalizat</p>
                </CardContent>
              </Card>
            </Link>
            <Link to="/safety">
              <Card className="hover:border-primary transition-colors cursor-pointer h-full">
                <CardContent className="pt-6 text-center">
                  <AlertTriangle className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold">Raportează o problemă</h3>
                  <p className="text-sm text-muted-foreground">Semnalează activitate suspectă</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Help Categories */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {helpCategories.map((category, index) => (
              <Card key={index} className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <category.icon className="h-5 w-5 text-primary" />
                    {category.title}
                  </CardTitle>
                  <CardDescription>{category.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {category.links.map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <Link 
                          to={link.href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
                        >
                          → {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer CTA */}
          <Card className="mt-12">
            <CardContent className="py-8 text-center">
              <h3 className="text-xl font-semibold mb-2">Încă ai nevoie de ajutor?</h3>
              <p className="text-muted-foreground mb-4">
                Echipa noastră de suport este disponibilă să te ajute cu orice întrebare.
              </p>
              <Link 
                to="/contact" 
                className="inline-flex items-center gap-2 text-primary hover:underline font-medium"
              >
                <MessageCircle className="h-4 w-4" />
                Contactează suportul
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
