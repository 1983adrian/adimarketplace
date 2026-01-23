import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { ConversationList } from '@/components/messages/ConversationList';
import { ChatWindow } from '@/components/messages/ChatWindow';
import { NewConversationDialog } from '@/components/messages/NewConversationDialog';
import { useConversations, useCreateConversation } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Card } from '@/components/ui/card';
import { MessageCircle, ArrowLeft } from 'lucide-react';
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
      
      // Refetch to get the full conversation with details
      await refetch();
      
      // Wait a bit for the refetch to complete, then find and select the conversation
      setTimeout(() => {
        const conv = conversations?.find((c: any) => c.id === result.id);
        if (conv) {
          setSelectedConversation(conv);
          setShowChat(true);
        } else {
          // If not found in list, use the result directly
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

  // Full screen mobile chat experience
  if (isMobile && showChat && selectedConversation) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        <ChatWindow
          conversation={selectedConversation}
          currentUserId={user.id}
          onBack={handleBack}
          isMobile={true}
        />
      </div>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="flex items-center justify-between mb-4 md:mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-sky-400 to-blue-500 rounded-xl flex items-center justify-center shadow-md">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">Mesaje</h1>
              <p className="text-sm text-muted-foreground hidden md:block">Conversațiile tale cu vânzătorii și cumpărătorii</p>
            </div>
          </div>
          <NewConversationDialog
            currentUserId={user.id}
            onSelectSeller={handleNewConversation}
          />
        </div>

        {/* Main Chat Container - Responsive height */}
        <Card className="overflow-hidden flex flex-col border-2" style={{ 
          height: isMobile ? 'calc(100vh - 200px)' : 'calc(100vh - 220px)', 
          minHeight: '400px',
          maxHeight: isMobile ? 'calc(100vh - 160px)' : '800px'
        }}>
          <div className="flex h-full overflow-hidden">
            {/* Conversation List */}
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
              />
            </div>

            {/* Chat Window - Desktop only, mobile uses fullscreen overlay */}
            {!isMobile && (
              <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <ChatWindow
                  conversation={selectedConversation}
                  currentUserId={user.id}
                  onBack={handleBack}
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