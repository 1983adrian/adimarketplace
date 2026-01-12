import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usePlatformSettings } from '@/hooks/useAdminSettings';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

export default function Contact() {
  const { toast } = useToast();
  const { data: settings } = usePlatformSettings();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const getSetting = (key: string) => {
    const setting = settings?.find((s: any) => s.key === key);
    return setting?.value as string || '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Mesaj trimis!',
      description: 'Îți mulțumim pentru mesaj. Te vom contacta în curând.',
    });
    
    setForm({ name: '', email: '', subject: '', message: '' });
    setIsSubmitting(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-4">Contactează-ne</h1>
          <p className="text-xl text-muted-foreground text-center mb-12">
            Suntem aici să te ajutăm. Trimite-ne un mesaj și îți vom răspunde cât mai curând.
          </p>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="space-y-6">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Mail className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Email</h3>
                      <p className="text-sm text-muted-foreground">
                        {getSetting('supportEmail') || 'support@marketplace.com'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Phone className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Telefon</h3>
                      <p className="text-sm text-muted-foreground">
                        {getSetting('supportPhone') || '+40 XXX XXX XXX'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <MapPin className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Adresă</h3>
                      <p className="text-sm text-muted-foreground">
                        {getSetting('address') || 'România'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <Clock className="h-6 w-6 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold">Program</h3>
                      <p className="text-sm text-muted-foreground">
                        Luni - Vineri: 9:00 - 18:00
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Trimite un mesaj</CardTitle>
                <CardDescription>
                  Completează formularul și îți vom răspunde în cel mai scurt timp.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Nume complet</Label>
                      <Input
                        id="name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Ion Popescu"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="ion@exemplu.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Subiect</Label>
                    <Select
                      value={form.subject}
                      onValueChange={(value) => setForm({ ...form, subject: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selectează un subiect" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Întrebare generală</SelectItem>
                        <SelectItem value="support">Suport tehnic</SelectItem>
                        <SelectItem value="billing">Plăți și facturare</SelectItem>
                        <SelectItem value="partnership">Parteneriat</SelectItem>
                        <SelectItem value="feedback">Feedback</SelectItem>
                        <SelectItem value="other">Altele</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Mesaj</Label>
                    <Textarea
                      id="message"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Descrie problema sau întrebarea ta..."
                      rows={6}
                      required
                    />
                  </div>

                  <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
                    <Send className="h-4 w-4" />
                    {isSubmitting ? 'Se trimite...' : 'Trimite mesajul'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}
