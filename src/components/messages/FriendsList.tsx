import React from 'react';
import { useFriends, usePendingFriendRequests, useAcceptFriendRequest, useRejectFriendRequest, useRemoveFriend } from '@/hooks/useFriendships';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Check, X, UserMinus, MessageCircle, Users, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useVerifiedBadge } from '@/hooks/useVerifiedBadge';

interface FriendsListProps {
  onStartChat: (userId: string) => void;
}

// Small inline verified badge that doesn't need userId prop
const SmallVerifiedBadge: React.FC<{ isVerified?: boolean | null }> = ({ isVerified }) => {
  if (!isVerified) return null;
  return (
    <span className="inline-flex items-center justify-center w-4 h-4 bg-primary rounded-full">
      <Check className="h-2.5 w-2.5 text-primary-foreground" />
    </span>
  );
};

export const FriendsList: React.FC<FriendsListProps> = ({ onStartChat }) => {
  const { user } = useAuth();
  const { data: friends, isLoading: loadingFriends } = useFriends(user?.id);
  const { data: pendingRequests, isLoading: loadingRequests } = usePendingFriendRequests(user?.id);
  
  const acceptRequest = useAcceptFriendRequest();
  const rejectRequest = useRejectFriendRequest();
  const removeFriend = useRemoveFriend();

  const getInitials = (name?: string | null) => {
    if (!name) return '?';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getFriendData = (friendship: any) => {
    if (!user) return null;
    return friendship.requester_id === user.id ? friendship.addressee : friendship.requester;
  };

  const pendingCount = pendingRequests?.length || 0;

  if (!user) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Autentifică-te pentru a vedea prietenii
      </div>
    );
  }

  return (
    <Tabs defaultValue="friends" className="w-full h-full flex flex-col">
      <TabsList className="grid w-full grid-cols-2 mx-2 mt-2" style={{ width: 'calc(100% - 16px)' }}>
        <TabsTrigger value="friends" className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          Prieteni
        </TabsTrigger>
        <TabsTrigger value="requests" className="flex items-center gap-2 relative">
          <Bell className="h-4 w-4" />
          Cereri
          {pendingCount > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
              {pendingCount}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="friends" className="flex-1 m-0 overflow-hidden">
        <ScrollArea className="h-full">
          {loadingFriends ? (
            <div className="p-2 space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : friends && friends.length > 0 ? (
            <div className="p-2 space-y-1">
              {friends.map(friendship => {
                const friend = getFriendData(friendship);
                if (!friend) return null;
                
                return (
                  <div 
                    key={friendship.id}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={friend.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                        {getInitials(friend.display_name || friend.username)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-sm truncate">
                          {friend.display_name || friend.username || 'Utilizator'}
                        </span>
                        <SmallVerifiedBadge isVerified={friend.is_verified} />
                      </div>
                      {friend.store_name && (
                        <p className="text-xs text-muted-foreground truncate">{friend.store_name}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-primary hover:text-primary"
                        onClick={() => onStartChat(friend.user_id)}
                      >
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => removeFriend.mutate(friendship.id)}
                        disabled={removeFriend.isPending}
                      >
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
                <Users className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">Nu ai prieteni încă</p>
              <p className="text-xs text-muted-foreground mt-1">Adaugă prieteni din profilul vânzătorilor</p>
            </div>
          )}
        </ScrollArea>
      </TabsContent>

      <TabsContent value="requests" className="flex-1 m-0 overflow-hidden">
        <ScrollArea className="h-full">
          {loadingRequests ? (
            <div className="p-2 space-y-2">
              {[1, 2].map(i => (
                <div key={i} className="flex items-center gap-3 p-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : pendingRequests && pendingRequests.length > 0 ? (
            <div className="p-2 space-y-1">
              {pendingRequests.map(request => {
                const requester = request.requester;
                if (!requester) return null;
                
                return (
                  <div 
                    key={request.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-primary/10"
                  >
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={requester.avatar_url || ''} />
                      <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10">
                        {getInitials(requester.display_name || requester.username)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-medium text-sm truncate">
                          {requester.display_name || requester.username || 'Utilizator'}
                        </span>
                        <SmallVerifiedBadge isVerified={requester.is_verified} />
                      </div>
                      <p className="text-xs text-muted-foreground">Vrea să fie prieten</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="default"
                        className="h-8 w-8"
                        onClick={() => acceptRequest.mutate(request.id)}
                        disabled={acceptRequest.isPending}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-8 w-8"
                        onClick={() => rejectRequest.mutate(request.id)}
                        disabled={rejectRequest.isPending}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-48 text-center p-4">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-3">
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">Nicio cerere de prietenie</p>
            </div>
          )}
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
};
