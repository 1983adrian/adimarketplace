import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MessageSquare, Search, Filter, Package, ShoppingCart, 
  AlertTriangle, Archive, Star, MoreHorizontal 
} from 'lucide-react';
import { useConversations, useDeleteConversation } from '@/hooks/useConversations';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { ConversationListItem } from './ConversationListItem';
import { MessageThread } from './MessageThread';
import { ConversationDetails } from './ConversationDetails';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MarketplaceInboxProps {
  userId: string;
}

export const MarketplaceInbox: React.FC<MarketplaceInboxProps> = ({ userId }) => {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const conversationIdParam = searchParams.get('conversation');
  
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [showDetails, setShowDetails] = useState(!isMobile);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  
  const { data: conversations, isLoading, refetch } = useConversations(userId);
  const deleteConversation = useDeleteConversation();

  // Handle URL param
  useEffect(() => {
    if (conversationIdParam && conversations) {
      const conv = conversations.find((c: any) => c.id === conversationIdParam);
      if (conv) {
        setSelectedConversation(conv);
      }
    }
  }, [conversationIdParam, conversations]);

  // Filter conversations
  const filteredConversations = conversations?.filter((conv: any) => {
    const matchesSearch = !searchQuery || 
      conv.listings?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.seller?.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.buyer?.display_name?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || 
      (activeTab === 'buying' && conv.buyer_id === userId) ||
      (activeTab === 'selling' && conv.seller_id === userId) ||
      (activeTab === 'orders' && conv.order_id) ||
      (activeTab === 'archived' && conv.status === 'closed');
    
    return matchesSearch && matchesTab;
  }) || [];

  const handleSelectConversation = useCallback((conv: any) => {
    setSelectedConversation(conv);
  }, []);

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await deleteConversation.mutateAsync({ conversationId });
      toast.success('Conversație ștearsă');
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
      refetch();
    } catch (error) {
      toast.error('Nu s-a putut șterge conversația');
    }
  };

  const handleConversationDeleted = () => {
    setSelectedConversation(null);
    refetch();
  };

  // Mobile: show thread fullscreen
  if (isMobile && selectedConversation) {
    return (
      <div className="h-full flex flex-col">
        <MessageThread
          conversation={selectedConversation}
          currentUserId={userId}
          onBack={() => setSelectedConversation(null)}
          onConversationDeleted={handleConversationDeleted}
          isMobile={true}
        />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Inbox Header */}
      <div className="flex-shrink-0 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/60 rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
              <MessageSquare className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold">Mesaje</h1>
              <p className="text-xs text-muted-foreground">
                {filteredConversations.length} conversații
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Caută conversații..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-64 h-9"
              />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-9 w-9">
                  <Filter className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setActiveTab('all')}>
                  Toate conversațiile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('buying')}>
                  Ca și cumpărător
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('selling')}>
                  Ca și vânzător
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setActiveTab('orders')}>
                  Legate de comenzi
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
          <Button
            variant={activeTab === 'all' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('all')}
            className="flex-shrink-0"
          >
            <MessageSquare className="h-4 w-4 mr-1" />
            Toate
          </Button>
          <Button
            variant={activeTab === 'buying' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('buying')}
            className="flex-shrink-0"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Cumpărături
          </Button>
          <Button
            variant={activeTab === 'selling' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('selling')}
            className="flex-shrink-0"
          >
            <Package className="h-4 w-4 mr-1" />
            Vânzări
          </Button>
          <Button
            variant={activeTab === 'orders' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('orders')}
            className="flex-shrink-0"
          >
            <Star className="h-4 w-4 mr-1" />
            Comenzi
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden min-h-0">
        {/* Conversation List */}
        <div className={`${isMobile ? 'w-full' : 'w-80 lg:w-96'} border-r border-border flex-shrink-0 overflow-hidden flex flex-col bg-card/50`}>
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="space-y-0">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 border-b border-border">
                    <Skeleton className="h-12 w-12 rounded-lg" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 p-8 text-center">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="font-medium text-foreground">Nicio conversație</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Conversațiile vor apărea aici când contactezi un vânzător
                </p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {filteredConversations.map((conv: any) => (
                  <ConversationListItem
                    key={conv.id}
                    conversation={conv}
                    currentUserId={userId}
                    isSelected={selectedConversation?.id === conv.id}
                    onSelect={handleSelectConversation}
                    onDelete={handleDeleteConversation}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Message Thread */}
        {!isMobile && (
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">
            <MessageThread
              conversation={selectedConversation}
              currentUserId={userId}
              onConversationDeleted={handleConversationDeleted}
              isMobile={false}
              showDetailsPanel={showDetails}
              onToggleDetails={() => setShowDetails(!showDetails)}
            />
          </div>
        )}

        {/* Details Panel - Desktop only */}
        {!isMobile && showDetails && selectedConversation && (
          <div className="w-72 border-l border-border flex-shrink-0 overflow-y-auto bg-card/30">
            <ConversationDetails
              conversation={selectedConversation}
              currentUserId={userId}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketplaceInbox;
