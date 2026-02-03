import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { MarketplaceInbox } from '@/components/messages/MarketplaceInbox';
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

export default function Messages() {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Card className="p-12 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/60 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MessageCircle className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Autentificare necesară</h2>
            <p className="text-muted-foreground mb-6">Te rugăm să te autentifici pentru a vedea mesajele.</p>
            <div className="flex gap-3 justify-center">
              <Link to="/login">
                <Button>Autentifică-te</Button>
              </Link>
              <Link to="/signup">
                <Button variant="outline">Creează cont</Button>
              </Link>
            </div>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout hideFooter>
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4">
        <Card 
          className="overflow-hidden border border-border shadow-xl"
          style={{ 
            height: isMobile ? 'calc(100vh - 140px)' : 'calc(100vh - 160px)',
            minHeight: '500px',
            maxHeight: isMobile ? 'calc(100vh - 120px)' : '900px'
          }}
        >
          <MarketplaceInbox userId={user.id} />
        </Card>
      </div>
    </Layout>
  );
}
