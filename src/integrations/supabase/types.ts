export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      admin_emails: {
        Row: {
          added_at: string
          added_by: string | null
          email: string
          id: string
          is_active: boolean
        }
        Insert: {
          added_at?: string
          added_by?: string | null
          email: string
          id?: string
          is_active?: boolean
        }
        Update: {
          added_at?: string
          added_by?: string | null
          email?: string
          id?: string
          is_active?: boolean
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      bids: {
        Row: {
          amount: number
          bidder_id: string
          created_at: string
          id: string
          is_winning: boolean | null
          listing_id: string
        }
        Insert: {
          amount: number
          bidder_id: string
          created_at?: string
          id?: string
          is_winning?: boolean | null
          listing_id: string
        }
        Update: {
          amount?: number
          bidder_id?: string
          created_at?: string
          id?: string
          is_winning?: boolean | null
          listing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_sends: {
        Row: {
          campaign_id: string | null
          clicked_at: string | null
          email: string
          id: string
          opened_at: string | null
          sent_at: string
          status: string | null
        }
        Insert: {
          campaign_id?: string | null
          clicked_at?: string | null
          email: string
          id?: string
          opened_at?: string | null
          sent_at?: string
          status?: string | null
        }
        Update: {
          campaign_id?: string | null
          clicked_at?: string | null
          email?: string
          id?: string
          opened_at?: string | null
          sent_at?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "campaign_sends_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          name: string
          parent_id: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          name: string
          parent_id?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          name?: string
          parent_id?: string | null
          slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          buyer_id: string
          created_at: string
          id: string
          listing_id: string
          seller_id: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          id?: string
          listing_id: string
          seller_id: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          id?: string
          listing_id?: string
          seller_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string | null
          id: string
          order_id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          resolution: string | null
          status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_id: string
          reason: string
          reported_user_id: string
          reporter_id: string
          resolution?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string
          reason?: string
          reported_user_id?: string
          reporter_id?: string
          resolution?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      email_templates: {
        Row: {
          body_html: string
          body_text: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          subject: string
          template_key: string
          updated_at: string
          variables: string[] | null
        }
        Insert: {
          body_html: string
          body_text?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          subject: string
          template_key: string
          updated_at?: string
          variables?: string[] | null
        }
        Update: {
          body_html?: string
          body_text?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          subject?: string
          template_key?: string
          updated_at?: string
          variables?: string[] | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      friendships: {
        Row: {
          addressee_id: string
          created_at: string
          id: string
          requester_id: string
          status: string
          updated_at: string
        }
        Insert: {
          addressee_id: string
          created_at?: string
          id?: string
          requester_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          addressee_id?: string
          created_at?: string
          id?: string
          requester_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      homepage_content: {
        Row: {
          button_text: string | null
          button_url: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean
          section_key: string
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          button_text?: string | null
          button_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          section_key: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          button_text?: string | null
          button_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          section_key?: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          buyer_fee: number | null
          buyer_id: string
          created_at: string
          id: string
          invoice_number: string
          issued_at: string
          order_id: string
          paid_at: string | null
          seller_commission: number | null
          seller_id: string
          status: string
          subtotal: number
          total: number
        }
        Insert: {
          buyer_fee?: number | null
          buyer_id: string
          created_at?: string
          id?: string
          invoice_number: string
          issued_at?: string
          order_id: string
          paid_at?: string | null
          seller_commission?: number | null
          seller_id: string
          status?: string
          subtotal: number
          total: number
        }
        Update: {
          buyer_fee?: number | null
          buyer_id?: string
          created_at?: string
          id?: string
          invoice_number?: string
          issued_at?: string
          order_id?: string
          paid_at?: string | null
          seller_commission?: number | null
          seller_id?: string
          status?: string
          subtotal?: number
          total?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_primary: boolean
          listing_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean
          listing_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean
          listing_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          auction_end_date: string | null
          available_variants: Json | null
          bid_increment: number | null
          buy_now_price: number | null
          category_id: string | null
          cod_enabled: boolean | null
          cod_fee_percentage: number | null
          cod_fixed_fee: number | null
          cod_transport_fee: number | null
          colors: string[] | null
          condition: Database["public"]["Enums"]["item_condition"]
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          is_sold: boolean
          listing_type: string | null
          location: string | null
          price: number
          quantity: number | null
          reserve_price: number | null
          seller_country: string | null
          seller_id: string
          shipping_carrier: string | null
          shipping_cost: number | null
          sizes: string[] | null
          starting_bid: number | null
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          auction_end_date?: string | null
          available_variants?: Json | null
          bid_increment?: number | null
          buy_now_price?: number | null
          category_id?: string | null
          cod_enabled?: boolean | null
          cod_fee_percentage?: number | null
          cod_fixed_fee?: number | null
          cod_transport_fee?: number | null
          colors?: string[] | null
          condition?: Database["public"]["Enums"]["item_condition"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_sold?: boolean
          listing_type?: string | null
          location?: string | null
          price: number
          quantity?: number | null
          reserve_price?: number | null
          seller_country?: string | null
          seller_id: string
          shipping_carrier?: string | null
          shipping_cost?: number | null
          sizes?: string[] | null
          starting_bid?: number | null
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          auction_end_date?: string | null
          available_variants?: Json | null
          bid_increment?: number | null
          buy_now_price?: number | null
          category_id?: string | null
          cod_enabled?: boolean | null
          cod_fee_percentage?: number | null
          cod_fixed_fee?: number | null
          cod_transport_fee?: number | null
          colors?: string[] | null
          condition?: Database["public"]["Enums"]["item_condition"]
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_sold?: boolean
          listing_type?: string | null
          location?: string | null
          price?: number
          quantity?: number | null
          reserve_price?: number | null
          seller_country?: string | null
          seller_id?: string
          shipping_carrier?: string | null
          shipping_cost?: number | null
          sizes?: string[] | null
          starting_bid?: number | null
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "listings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          content: string
          created_at: string
          created_by: string | null
          emails_clicked: number | null
          emails_opened: number | null
          emails_sent: number | null
          id: string
          name: string
          scheduled_at: string | null
          sent_at: string | null
          social_content: string | null
          status: string | null
          subject: string
          target_audience: string | null
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          created_by?: string | null
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          id?: string
          name: string
          scheduled_at?: string | null
          sent_at?: string | null
          social_content?: string | null
          status?: string | null
          subject: string
          target_audience?: string | null
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          created_by?: string | null
          emails_clicked?: number | null
          emails_opened?: number | null
          emails_sent?: number | null
          id?: string
          name?: string
          scheduled_at?: string | null
          sent_at?: string | null
          social_content?: string | null
          status?: string | null
          subject?: string
          target_audience?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          name: string | null
          source: string | null
          subscribed_at: string
          unsubscribed_at: string | null
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          name?: string | null
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          name?: string | null
          source?: string | null
          subscribed_at?: string
          unsubscribed_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          buyer_fee: number | null
          buyer_id: string
          cancelled_at: string | null
          carrier: string | null
          created_at: string
          delivery_confirmed_at: string | null
          dispute_opened_at: string | null
          dispute_reason: string | null
          dispute_resolved_at: string | null
          id: string
          listing_id: string | null
          payment_processor: string | null
          payout_amount: number | null
          payout_at: string | null
          payout_status: string | null
          processor_error: string | null
          processor_status: string | null
          processor_transaction_id: string | null
          refund_amount: number | null
          refund_reason: string | null
          refund_requested_at: string | null
          refund_status: string | null
          refund_transaction_id: string | null
          refunded_at: string | null
          refunded_by: string | null
          saved_address_id: string | null
          seller_commission: number | null
          seller_id: string
          shipping_address: string | null
          status: Database["public"]["Enums"]["order_status"]
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          buyer_fee?: number | null
          buyer_id: string
          cancelled_at?: string | null
          carrier?: string | null
          created_at?: string
          delivery_confirmed_at?: string | null
          dispute_opened_at?: string | null
          dispute_reason?: string | null
          dispute_resolved_at?: string | null
          id?: string
          listing_id?: string | null
          payment_processor?: string | null
          payout_amount?: number | null
          payout_at?: string | null
          payout_status?: string | null
          processor_error?: string | null
          processor_status?: string | null
          processor_transaction_id?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refund_requested_at?: string | null
          refund_status?: string | null
          refund_transaction_id?: string | null
          refunded_at?: string | null
          refunded_by?: string | null
          saved_address_id?: string | null
          seller_commission?: number | null
          seller_id: string
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_fee?: number | null
          buyer_id?: string
          cancelled_at?: string | null
          carrier?: string | null
          created_at?: string
          delivery_confirmed_at?: string | null
          dispute_opened_at?: string | null
          dispute_reason?: string | null
          dispute_resolved_at?: string | null
          id?: string
          listing_id?: string | null
          payment_processor?: string | null
          payout_amount?: number | null
          payout_at?: string | null
          payout_status?: string | null
          processor_error?: string | null
          processor_status?: string | null
          processor_transaction_id?: string | null
          refund_amount?: number | null
          refund_reason?: string | null
          refund_requested_at?: string | null
          refund_status?: string | null
          refund_transaction_id?: string | null
          refunded_at?: string | null
          refunded_by?: string | null
          saved_address_id?: string | null
          seller_commission?: number | null
          seller_id?: string
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"]
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_saved_address_id_fkey"
            columns: ["saved_address_id"]
            isOneToOne: false
            referencedRelation: "saved_addresses"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_processor_settings: {
        Row: {
          api_key_encrypted: string | null
          api_secret_encrypted: string | null
          created_at: string | null
          environment: string | null
          id: string
          is_active: boolean | null
          merchant_id: string | null
          processor_name: string
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          created_at?: string | null
          environment?: string | null
          id?: string
          is_active?: boolean | null
          merchant_id?: string | null
          processor_name: string
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_key_encrypted?: string | null
          api_secret_encrypted?: string | null
          created_at?: string | null
          environment?: string | null
          id?: string
          is_active?: boolean | null
          merchant_id?: string | null
          processor_name?: string
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      payouts: {
        Row: {
          buyer_fee: number
          created_at: string
          gross_amount: number
          id: string
          net_amount: number
          order_id: string
          paypal_payout_id: string | null
          processed_at: string | null
          seller_commission: number
          seller_id: string
          status: string
          stripe_transfer_id: string | null
          updated_at: string
        }
        Insert: {
          buyer_fee?: number
          created_at?: string
          gross_amount: number
          id?: string
          net_amount: number
          order_id: string
          paypal_payout_id?: string | null
          processed_at?: string | null
          seller_commission?: number
          seller_id: string
          status?: string
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Update: {
          buyer_fee?: number
          created_at?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          order_id?: string
          paypal_payout_id?: string | null
          processed_at?: string | null
          seller_commission?: number
          seller_id?: string
          status?: string
          stripe_transfer_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payouts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_fees: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          fee_type: string
          id: string
          is_active: boolean
          is_percentage: boolean
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          fee_type: string
          id?: string
          is_active?: boolean
          is_percentage?: boolean
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          fee_type?: string
          id?: string
          is_active?: boolean
          is_percentage?: boolean
          updated_at?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          category: string
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      policies_content: {
        Row: {
          content: string
          created_at: string
          id: string
          is_published: boolean
          policy_key: string
          published_at: string | null
          title: string
          updated_at: string
          version: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_published?: boolean
          policy_key: string
          published_at?: string | null
          title: string
          updated_at?: string
          version?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean
          policy_key?: string
          published_at?: string | null
          title?: string
          updated_at?: string
          version?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_number: string | null
          address_line1: string | null
          address_line2: string | null
          adyen_account_holder_id: string | null
          adyen_account_id: string | null
          adyen_balance_account_id: string | null
          avatar_url: string | null
          bic: string | null
          bio: string | null
          birthday: string | null
          business_type: string | null
          card_holder_name: string | null
          card_number_last4: string | null
          city: string | null
          company_name: string | null
          company_registration: string | null
          country: string | null
          country_of_residence: string | null
          created_at: string
          display_name: string | null
          first_name: string | null
          iban: string | null
          id: string
          is_seller: boolean | null
          is_verified: boolean | null
          kyc_country: string | null
          kyc_documents_submitted: boolean | null
          kyc_status: string | null
          kyc_submitted_at: string | null
          kyc_verified_at: string | null
          last_name: string | null
          location: string | null
          mangopay_user_id: string | null
          mangopay_wallet_id: string | null
          max_listings: number | null
          nationality: string | null
          payout_balance: number | null
          payout_method: string | null
          paypal_email: string | null
          pending_balance: number | null
          phone: string | null
          postal_code: string | null
          region: string | null
          seller_terms_accepted_at: string | null
          sort_code: string | null
          store_name: string | null
          updated_at: string
          user_id: string
          username: string | null
          verification_documents: Json | null
          verified_at: string | null
        }
        Insert: {
          account_number?: string | null
          address_line1?: string | null
          address_line2?: string | null
          adyen_account_holder_id?: string | null
          adyen_account_id?: string | null
          adyen_balance_account_id?: string | null
          avatar_url?: string | null
          bic?: string | null
          bio?: string | null
          birthday?: string | null
          business_type?: string | null
          card_holder_name?: string | null
          card_number_last4?: string | null
          city?: string | null
          company_name?: string | null
          company_registration?: string | null
          country?: string | null
          country_of_residence?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          iban?: string | null
          id?: string
          is_seller?: boolean | null
          is_verified?: boolean | null
          kyc_country?: string | null
          kyc_documents_submitted?: boolean | null
          kyc_status?: string | null
          kyc_submitted_at?: string | null
          kyc_verified_at?: string | null
          last_name?: string | null
          location?: string | null
          mangopay_user_id?: string | null
          mangopay_wallet_id?: string | null
          max_listings?: number | null
          nationality?: string | null
          payout_balance?: number | null
          payout_method?: string | null
          paypal_email?: string | null
          pending_balance?: number | null
          phone?: string | null
          postal_code?: string | null
          region?: string | null
          seller_terms_accepted_at?: string | null
          sort_code?: string | null
          store_name?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
          verification_documents?: Json | null
          verified_at?: string | null
        }
        Update: {
          account_number?: string | null
          address_line1?: string | null
          address_line2?: string | null
          adyen_account_holder_id?: string | null
          adyen_account_id?: string | null
          adyen_balance_account_id?: string | null
          avatar_url?: string | null
          bic?: string | null
          bio?: string | null
          birthday?: string | null
          business_type?: string | null
          card_holder_name?: string | null
          card_number_last4?: string | null
          city?: string | null
          company_name?: string | null
          company_registration?: string | null
          country?: string | null
          country_of_residence?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          iban?: string | null
          id?: string
          is_seller?: boolean | null
          is_verified?: boolean | null
          kyc_country?: string | null
          kyc_documents_submitted?: boolean | null
          kyc_status?: string | null
          kyc_submitted_at?: string | null
          kyc_verified_at?: string | null
          last_name?: string | null
          location?: string | null
          mangopay_user_id?: string | null
          mangopay_wallet_id?: string | null
          max_listings?: number | null
          nationality?: string | null
          payout_balance?: number | null
          payout_method?: string | null
          paypal_email?: string | null
          pending_balance?: number | null
          phone?: string | null
          postal_code?: string | null
          region?: string | null
          seller_terms_accepted_at?: string | null
          sort_code?: string | null
          store_name?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
          verification_documents?: Json | null
          verified_at?: string | null
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number
          buyer_id: string
          completed_at: string | null
          created_at: string
          id: string
          order_id: string | null
          processor: string | null
          processor_refund_id: string | null
          reason: string
          requested_by: string
          seller_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          buyer_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          processor?: string | null
          processor_refund_id?: string | null
          reason: string
          requested_by: string
          seller_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          buyer_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          processor?: string | null
          processor_refund_id?: string | null
          reason?: string
          requested_by?: string
          seller_id?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      returns: {
        Row: {
          admin_notes: string | null
          buyer_id: string
          created_at: string
          description: string | null
          id: string
          order_id: string
          reason: string
          refund_amount: number | null
          resolved_at: string | null
          seller_id: string
          status: string
          tracking_number: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          buyer_id: string
          created_at?: string
          description?: string | null
          id?: string
          order_id: string
          reason: string
          refund_amount?: number | null
          resolved_at?: string | null
          seller_id: string
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          buyer_id?: string
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string
          reason?: string
          refund_amount?: number | null
          resolved_at?: string | null
          seller_id?: string
          status?: string
          tracking_number?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          order_id: string
          rating: number
          reviewed_user_id: string
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id: string
          rating: number
          reviewed_user_id: string
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          order_id?: string
          rating?: number
          reviewed_user_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_addresses: {
        Row: {
          address: string
          apartment: string | null
          city: string
          country: string
          created_at: string
          first_name: string
          id: string
          is_default: boolean | null
          label: string
          last_name: string
          phone: string | null
          postal_code: string
          state: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address: string
          apartment?: string | null
          city: string
          country?: string
          created_at?: string
          first_name: string
          id?: string
          is_default?: boolean | null
          label?: string
          last_name: string
          phone?: string | null
          postal_code: string
          state?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string
          apartment?: string | null
          city?: string
          country?: string
          created_at?: string
          first_name?: string
          id?: string
          is_default?: boolean | null
          label?: string
          last_name?: string
          phone?: string | null
          postal_code?: string
          state?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      seller_payouts: {
        Row: {
          cancelled_reason: string | null
          completed_at: string | null
          created_at: string | null
          gross_amount: number
          id: string
          net_amount: number
          notes: string | null
          order_id: string | null
          payout_method: string | null
          payout_reference: string | null
          platform_commission: number
          processed_at: string | null
          processor: string | null
          processor_payout_id: string | null
          processor_transaction_id: string | null
          seller_id: string
          status: string | null
        }
        Insert: {
          cancelled_reason?: string | null
          completed_at?: string | null
          created_at?: string | null
          gross_amount: number
          id?: string
          net_amount: number
          notes?: string | null
          order_id?: string | null
          payout_method?: string | null
          payout_reference?: string | null
          platform_commission: number
          processed_at?: string | null
          processor?: string | null
          processor_payout_id?: string | null
          processor_transaction_id?: string | null
          seller_id: string
          status?: string | null
        }
        Update: {
          cancelled_reason?: string | null
          completed_at?: string | null
          created_at?: string | null
          gross_amount?: number
          id?: string
          net_amount?: number
          notes?: string | null
          order_id?: string | null
          payout_method?: string | null
          payout_reference?: string | null
          platform_commission?: number
          processed_at?: string | null
          processor?: string | null
          processor_payout_id?: string | null
          processor_transaction_id?: string | null
          seller_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "seller_payouts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          id: string
          payment_processor: string | null
          status: string
          subscription_amount: number | null
          trial_end_date: string | null
          trial_start_date: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          payment_processor?: string | null
          status?: string
          subscription_amount?: number | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          id?: string
          payment_processor?: string | null
          status?: string
          subscription_amount?: number | null
          trial_end_date?: string | null
          trial_start_date?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          created_at: string
          id: string
          keywords: string[] | null
          meta_description: string | null
          meta_title: string | null
          og_description: string | null
          og_image: string | null
          og_title: string | null
          page_key: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_key: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          keywords?: string[] | null
          meta_description?: string | null
          meta_title?: string | null
          og_description?: string | null
          og_image?: string | null
          og_title?: string | null
          page_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      webhook_logs: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          payload: Json | null
          processed: boolean | null
          processed_at: string | null
          processor: string
          resource_id: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          processor: string
          resource_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json | null
          processed?: boolean | null
          processed_at?: string | null
          processor?: string
          resource_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_special_status: {
        Args: { check_user_id: string }
        Returns: Json
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_pending_balance: {
        Args: { p_amount: number; p_user_id: string }
        Returns: undefined
      }
      is_admin_email: { Args: { check_email: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      item_condition: "new" | "like_new" | "good" | "fair" | "poor"
      order_status:
        | "pending"
        | "paid"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      item_condition: ["new", "like_new", "good", "fair", "poor"],
      order_status: [
        "pending",
        "paid",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
    },
  },
} as const
