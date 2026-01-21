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
import { MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

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
          <Card className="p-12 text-center">
            <MessageCircle className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Autentificare necesară</h2>
            <p className="text-muted-foreground">Te rugăm să te autentifici pentru a vedea mesajele.</p>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Mesaje</h1>
            <p className="text-muted-foreground">Conversațiile tale cu vânzătorii și cumpărătorii</p>
          </div>
          <NewConversationDialog
            currentUserId={user.id}
            onSelectSeller={handleNewConversation}
          />
        </div>

        <Card className="overflow-hidden" style={{ height: 'calc(100vh - 250px)', minHeight: '500px' }}>
          <div className="flex h-full">
            {/* Conversation List - Hidden on mobile when chat is open */}
            <div 
              className={`${
                isMobile 
                  ? showChat ? 'hidden' : 'w-full' 
                  : 'w-80 border-r'
              } flex-shrink-0`}
            >
              <ConversationList
                conversations={conversations || []}
                isLoading={isLoading}
                selectedId={selectedConversation?.id}
                currentUserId={user.id}
                onSelect={handleSelectConversation}
              />
            </div>

            {/* Chat Window */}
            <div 
              className={`${
                isMobile 
                  ? showChat ? 'w-full' : 'hidden' 
                  : 'flex-1'
              }`}
            >
              <ChatWindow
                conversation={selectedConversation}
                currentUserId={user.id}
                onBack={handleBack}
                isMobile={isMobile}
              />
            </div>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
