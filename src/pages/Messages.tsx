import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ConversationList } from '@/components/messages/ConversationList';
import { ChatWindow } from '@/components/messages/ChatWindow';
import { NewConversationDialog } from '@/components/messages/NewConversationDialog';
import { useConversations, useCreateConversation, useDeleteConversation } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

export default function Messages() {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const conversationIdParam = searchParams.get('conversation');
  
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [showChat, setShowChat] = useState(false);
  
  const { data: conversations, isLoading, refetch } = useConversations(user?.id);
  const createConversation = useCreateConversation();
  const deleteConversation = useDeleteConversation();

  useEffect(() => {
    if (conversationIdParam && conversations) {
      const conv = conversations.find((c: any) => c.id === conversationIdParam);
      if (conv) {
        setSelectedConversation(conv);
        setShowChat(true);
      }
    }
  }, [conversationIdParam, conversations]);

  const handleSelectConversation = (conversation: any) => {
    setSelectedConversation(conversation);
    if (isMobile) {
      setShowChat(true);
    }
  };

  const handleBack = () => {
    setShowChat(false);
    setSelectedConversation(null);
  };

  const handleConversationDeleted = () => {
    setShowChat(false);
    setSelectedConversation(null);
    refetch();
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation.mutateAsync({ conversationId });
      toast.success('Conversație ștearsă');
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
        setShowChat(false);
      }
      refetch();
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast.error('Nu s-a putut șterge conversația');
    }
  };

  const handleNewConversation = async (sellerId: string, listingId?: string) => {
    if (!user?.id || !listingId) {
      toast.error('Lipsesc informații necesare pentru a crea conversația');
      return;
    }
    
    try {
      const result = await createConversation.mutateAsync({
        listingId,
        buyerId: user.id,
        sellerId
      });
      
      await refetch();
      
      setTimeout(() => {
        const conv = conversations?.find((c: any) => c.id === result.id);
        if (conv) {
          setSelectedConversation(conv);
          setShowChat(true);
        } else {
          setSelectedConversation({
            id: result.id,
            listing_id: listingId,
            buyer_id: user.id,
            seller_id: sellerId
          });
          setShowChat(true);
        }
      }, 100);
      
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Nu s-a putut crea conversația');
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12">
          <Card className="p-12 text-center max-w-md mx-auto">
            <div className="w-20 h-20 bg-gradient-to-br from-sky-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <MessageCircle className="h-10 w-10 text-white" />
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

  // Mobile: Show chat fullscreen when conversation selected
  if (isMobile && showChat && selectedConversation) {
    return (
      <Layout hideFooter>
        <div className="container mx-auto px-2 py-2">
          <Card className="overflow-hidden flex flex-col border-2" style={{ 
            height: 'calc(100vh - 180px)', 
            minHeight: '400px'
          }}>
            <ChatWindow
              conversation={selectedConversation}
              currentUserId={user.id}
              onBack={handleBack}
              onConversationDeleted={handleConversationDeleted}
              isMobile={true}
            />
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 md:py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Mesaje</h1>
              <p className="text-sm text-muted-foreground hidden md:block">Conversațiile tale</p>
            </div>
          </div>
          <NewConversationDialog
            currentUserId={user.id}
            onSelectSeller={handleNewConversation}
          />
        </div>

        {/* Premium Chat Container */}
        <Card className="overflow-hidden flex flex-col border border-white/10 shadow-2xl" style={{ 
          height: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 220px)', 
          minHeight: '400px',
          maxHeight: isMobile ? 'calc(100vh - 160px)' : '800px',
          background: 'linear-gradient(145deg, hsl(215 30% 14%) 0%, hsl(215 30% 10%) 100%)'
        }}>
          <div className="flex h-full overflow-hidden">
            {/* Left Panel: Conversation List Only */}
            <div 
              className={`${
                isMobile 
                  ? 'w-full' 
                  : 'w-80 lg:w-96 border-r'
              } flex-shrink-0 overflow-hidden flex flex-col`}
            >
              <ConversationList
                conversations={conversations || []}
                isLoading={isLoading}
                selectedId={selectedConversation?.id}
                currentUserId={user.id}
                onSelect={handleSelectConversation}
                onDelete={handleDeleteConversation}
              />
            </div>

            {/* Right Panel: Chat Window (Desktop only) */}
            {!isMobile && (
              <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <ChatWindow
                  conversation={selectedConversation}
                  currentUserId={user.id}
                  onBack={handleBack}
                  onConversationDeleted={handleConversationDeleted}
                  isMobile={false}
                />
              </div>
            )}
          </div>
        </Card>
      </div>
    </Layout>
  );
}
