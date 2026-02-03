import React, { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Star, ThumbsUp, ThumbsDown, Send, CheckCircle } from 'lucide-react';

const Feedback = () => {
  const { user, profile } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [formData, setFormData] = useState({
    type: 'general',
    rating: '',
    subject: '',
    message: '',
    email: '',
  });

  const feedbackTypes = [
    { value: 'general', label: 'Feedback General', icon: MessageSquare },
    { value: 'bug', label: 'Raportare Problemă', icon: ThumbsDown },
    { value: 'suggestion', label: 'Sugestie de Îmbunătățire', icon: ThumbsUp },
    { value: 'complaint', label: 'Reclamație', icon: ThumbsDown },
    { value: 'praise', label: 'Laudă / Mulțumire', icon: Star },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.message.trim()) {
      toast({
        title: 'Eroare',
        description: 'Te rugăm să completezi mesajul.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Insert feedback into notifications table for admin to review
      const { error } = await supabase.from('notifications').insert({
        user_id: user?.id || '00000000-0000-0000-0000-000000000000',
        type: 'feedback',
        title: `[${formData.type.toUpperCase()}] ${formData.subject || 'Feedback'}`,
        message: `
Rating: ${formData.rating || 'N/A'}
Email: ${formData.email || user?.email || 'Anonim'}
---
${formData.message}
        `.trim(),
        data: {
          feedback_type: formData.type,
          rating: formData.rating,
          user_email: formData.email || user?.email,
          user_name: profile?.display_name || profile?.username,
        },
      });

      if (error) throw error;

      setIsSubmitted(true);
      toast({
        title: 'Feedback Trimis!',
        description: 'Mulțumim pentru feedback-ul tău. Echipa noastră îl va analiza în curând.',
      });
    } catch (error: any) {
      console.error('Feedback error:', error);
      toast({
        title: 'Eroare',
        description: 'Nu am putut trimite feedback-ul. Te rugăm să încerci din nou.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-16 max-w-2xl">
          <Card className="text-center">
            <CardContent className="py-16">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Mulțumim pentru Feedback!</h2>
              <p className="text-muted-foreground mb-8">
                Am primit mesajul tău și echipa noastră îl va analiza în cel mai scurt timp.
                Dacă ai furnizat un email, te vom contacta pentru detalii suplimentare dacă este necesar.
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" onClick={() => setIsSubmitted(false)}>
                  Trimite alt Feedback
                </Button>
                <Button onClick={() => window.location.href = '/'}>
                  Înapoi la Pagina Principală
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Feedback & Sugestii</h1>
          <p className="text-muted-foreground">
            Părerea ta contează! Ajută-ne să îmbunătățim Marketplace România.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-primary" />
              Trimite-ne Feedback
            </CardTitle>
            <CardDescription>
              Completează formularul de mai jos pentru a ne transmite sugestiile, problemele sau aprecierile tale.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Feedback Type */}
              <div className="space-y-3">
                <Label>Tipul Feedback-ului</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selectează tipul" />
                  </SelectTrigger>
                  <SelectContent>
                    {feedbackTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <span className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Rating */}
              <div className="space-y-3">
                <Label>Cum evaluezi experiența ta pe platformă?</Label>
                <RadioGroup 
                  value={formData.rating}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, rating: value }))}
                  className="flex gap-4"
                >
                  {['1', '2', '3', '4', '5'].map((rating) => (
                    <div key={rating} className="flex items-center space-x-2">
                      <RadioGroupItem value={rating} id={`rating-${rating}`} />
                      <Label htmlFor={`rating-${rating}`} className="flex items-center gap-1 cursor-pointer">
                        {rating}
                        <Star className={`h-4 w-4 ${parseInt(rating) >= 4 ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Subject */}
              <div className="space-y-2">
                <Label htmlFor="subject">Subiect (opțional)</Label>
                <Input
                  id="subject"
                  placeholder="Subiectul feedback-ului"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>

              {/* Email */}
              {!user && (
                <div className="space-y-2">
                  <Label htmlFor="email">Adresa ta de Email (opțional)</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemplu.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">
                    Dacă dorești un răspuns, te rugăm să ne furnizezi email-ul.
                  </p>
                </div>
              )}

              {/* Message */}
              <div className="space-y-2">
                <Label htmlFor="message">Mesajul tău *</Label>
                <Textarea
                  id="message"
                  placeholder="Descrie în detaliu feedback-ul, sugestia sau problema ta..."
                  rows={6}
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  'Se trimite...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Trimite Feedback
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => window.location.href = '/help'}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <MessageSquare className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Centru de Ajutor</h3>
                <p className="text-sm text-muted-foreground">Găsește răspunsuri rapid</p>
              </div>
            </CardContent>
          </Card>
          <Card className="hover:border-primary transition-colors cursor-pointer" onClick={() => window.location.href = '/contact'}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="p-3 rounded-lg bg-primary/10">
                <Send className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-medium">Contact Direct</h3>
                <p className="text-sm text-muted-foreground">Trimite un mesaj echipei</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Feedback;
