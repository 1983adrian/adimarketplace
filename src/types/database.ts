export type ItemCondition = 'new' | 'like_new' | 'good' | 'fair' | 'poor';
export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
export type AppRole = 'admin' | 'moderator' | 'user';

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  store_name: string | null;
  is_seller: boolean;
  max_listings: number;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  parent_id: string | null;
  created_at: string;
}

export type ListingType = 'buy_now' | 'auction' | 'both' | string;
export interface Listing {
  id: string;
  seller_id: string;
  title: string;
  description: string | null;
  price: number;
  shipping_cost: number | null;
  condition: ItemCondition;
  category_id: string | null;
  location: string | null;
  is_sold: boolean;
  is_active: boolean;
  views_count: number;
  quantity: number | null;
  listing_type: ListingType | null;
  auction_end_date: string | null;
  starting_bid: number | null;
  reserve_price: number | null;
  buy_now_price: number | null;
  bid_increment: number | null;
  price_currency: string | null;
  created_at: string;
  updated_at: string;
}

export interface ListingImage {
  id: string;
  listing_id: string;
  image_url: string;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface ListingWithImages extends Listing {
  listing_images: ListingImage[];
  profiles?: Profile;
  categories?: Category;
}

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

export interface Order {
  id: string;
  listing_id: string | null;
  buyer_id: string;
  seller_id: string;
  amount: number;
  status: OrderStatus;
  shipping_address: string | null;
  payment_processor: string | null;
  processor_transaction_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Review {
  id: string;
  order_id: string;
  reviewer_id: string;
  reviewed_user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ConversationWithDetails extends Conversation {
  listings?: Listing;
  buyer_profile?: Profile;
  seller_profile?: Profile;
  last_message?: Message;
}
