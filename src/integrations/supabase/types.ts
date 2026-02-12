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
          device_fingerprint: string | null
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
          device_fingerprint?: string | null
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
          device_fingerprint?: string | null
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
      contact_submissions: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          responded_at: string | null
          status: string
          subject: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          responded_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          responded_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
      }
      content_freshness: {
        Row: {
          content_type: string
          id: string
          items_count: number | null
          last_updated_at: string
          metadata: Json | null
          update_frequency: string | null
        }
        Insert: {
          content_type: string
          id?: string
          items_count?: number | null
          last_updated_at?: string
          metadata?: Json | null
          update_frequency?: string | null
        }
        Update: {
          content_type?: string
          id?: string
          items_count?: number | null
          last_updated_at?: string
          metadata?: Json | null
          update_frequency?: string | null
        }
        Relationships: []
      }
      conversations: {
        Row: {
          admin_id: string | null
          admin_joined_at: string | null
          admin_notes: string | null
          blocked_at: string | null
          blocked_by: string | null
          buyer_id: string
          closed_at: string | null
          context_type: string | null
          created_at: string
          id: string
          is_blocked: boolean | null
          listing_id: string
          order_id: string | null
          seller_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          admin_id?: string | null
          admin_joined_at?: string | null
          admin_notes?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          buyer_id: string
          closed_at?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          is_blocked?: boolean | null
          listing_id: string
          order_id?: string | null
          seller_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          admin_id?: string | null
          admin_joined_at?: string | null
          admin_notes?: string | null
          blocked_at?: string | null
          blocked_by?: string | null
          buyer_id?: string
          closed_at?: string | null
          context_type?: string | null
          created_at?: string
          id?: string
          is_blocked?: boolean | null
          listing_id?: string
          order_id?: string | null
          seller_id?: string
          status?: string | null
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
          {
            foreignKeyName: "conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      dispute_evidence: {
        Row: {
          created_at: string
          description: string | null
          dispute_id: string
          file_type: string | null
          file_url: string
          id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          dispute_id: string
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          description?: string | null
          dispute_id?: string
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_evidence_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispute_evidence_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes_safe"
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
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_safe"
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
      fraud_alerts: {
        Row: {
          admin_notes: string | null
          alert_type: string
          auto_action_taken: string | null
          created_at: string
          description: string | null
          evidence: Json | null
          id: string
          listing_id: string | null
          related_user_ids: string[] | null
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          alert_type: string
          auto_action_taken?: string | null
          created_at?: string
          description?: string | null
          evidence?: Json | null
          id?: string
          listing_id?: string | null
          related_user_ids?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          alert_type?: string
          auto_action_taken?: string | null
          created_at?: string
          description?: string | null
          evidence?: Json | null
          id?: string
          listing_id?: string | null
          related_user_ids?: string[] | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fraud_alerts_listing_id_fkey"
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
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_safe"
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
      listing_promotions: {
        Row: {
          amount_paid: number
          created_at: string
          ends_at: string
          id: string
          is_active: boolean
          listing_id: string
          platform: string | null
          promotion_type: string
          seller_id: string
          share_url: string | null
          starts_at: string
        }
        Insert: {
          amount_paid?: number
          created_at?: string
          ends_at: string
          id?: string
          is_active?: boolean
          listing_id: string
          platform?: string | null
          promotion_type?: string
          seller_id: string
          share_url?: string | null
          starts_at?: string
        }
        Update: {
          amount_paid?: number
          created_at?: string
          ends_at?: string
          id?: string
          is_active?: boolean
          listing_id?: string
          platform?: string | null
          promotion_type?: string
          seller_id?: string
          share_url?: string | null
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_promotions_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          description: string | null
          id: string
          listing_id: string
          reason: string
          reporter_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          listing_id: string
          reason: string
          reporter_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          description?: string | null
          id?: string
          listing_id?: string
          reason?: string
          reporter_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_reports_listing_id_fkey"
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
          price_currency: string | null
          quantity: number | null
          reserve_price: number | null
          return_days: number | null
          return_policy: string | null
          seller_country: string | null
          seller_id: string
          shipping_carrier: string | null
          shipping_cost: number | null
          sizes: string[] | null
          sku: string | null
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
          price_currency?: string | null
          quantity?: number | null
          reserve_price?: number | null
          return_days?: number | null
          return_policy?: string | null
          seller_country?: string | null
          seller_id: string
          shipping_carrier?: string | null
          shipping_cost?: number | null
          sizes?: string[] | null
          sku?: string | null
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
          price_currency?: string | null
          quantity?: number | null
          reserve_price?: number | null
          return_days?: number | null
          return_policy?: string | null
          seller_country?: string | null
          seller_id?: string
          shipping_carrier?: string | null
          shipping_cost?: number | null
          sizes?: string[] | null
          sku?: string | null
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
          original_language: string | null
          sender_id: string
          translated_content: Json | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          original_language?: string | null
          sender_id: string
          translated_content?: Json | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          original_language?: string | null
          sender_id?: string
          translated_content?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations_safe"
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
      password_reset_attempts: {
        Row: {
          created_at: string | null
          email: string
          id: string
          ip_address: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          ip_address?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          ip_address?: string | null
        }
        Relationships: []
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
          {
            foreignKeyName: "payouts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payouts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_activity: {
        Row: {
          activity_type: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          is_public: boolean | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
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
      platform_health: {
        Row: {
          check_type: string
          created_at: string
          details: Json | null
          id: string
          last_check_at: string
          next_check_at: string | null
          status: string
        }
        Insert: {
          check_type: string
          created_at?: string
          details?: Json | null
          id?: string
          last_check_at?: string
          next_check_at?: string | null
          status?: string
        }
        Update: {
          check_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          last_check_at?: string
          next_check_at?: string | null
          status?: string
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
      platform_statistics: {
        Row: {
          calculated_at: string
          created_at: string
          expires_at: string | null
          id: string
          stat_key: string
          stat_value: Json
        }
        Insert: {
          calculated_at?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          stat_key: string
          stat_value?: Json
        }
        Update: {
          calculated_at?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          stat_key?: string
          stat_value?: Json
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
      price_history: {
        Row: {
          id: string
          listing_id: string
          price: number
          price_type: string
          recorded_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          price: number
          price_type?: string
          recorded_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          price?: number
          price_type?: string
          recorded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_history_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          average_rating: number | null
          bio: string | null
          blocked_at: string | null
          blocked_reason: string | null
          country: string | null
          created_at: string
          display_name: string | null
          fraud_flags: Json | null
          fraud_score: number | null
          id: string
          is_buying_blocked: boolean | null
          is_listing_blocked: boolean | null
          is_seller: boolean | null
          is_suspended: boolean | null
          is_verified: boolean | null
          last_activity_at: string | null
          location: string | null
          max_listings: number | null
          payout_balance: number | null
          paypal_email: string | null
          paypal_email_encrypted: string | null
          pending_balance: number | null
          preferred_language: string | null
          return_days: number | null
          return_policy: string | null
          seller_terms_accepted_at: string | null
          seller_trial_started_at: string | null
          seller_type: string | null
          short_id: string
          store_name: string | null
          suspended_at: string | null
          suspended_by: string | null
          suspension_reason: string | null
          total_sales_count: number | null
          updated_at: string
          user_id: string
          username: string | null
          verified_at: string | null
          withdrawal_blocked: boolean | null
          withdrawal_blocked_at: string | null
          withdrawal_blocked_reason: string | null
        }
        Insert: {
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          blocked_at?: string | null
          blocked_reason?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          fraud_flags?: Json | null
          fraud_score?: number | null
          id?: string
          is_buying_blocked?: boolean | null
          is_listing_blocked?: boolean | null
          is_seller?: boolean | null
          is_suspended?: boolean | null
          is_verified?: boolean | null
          last_activity_at?: string | null
          location?: string | null
          max_listings?: number | null
          payout_balance?: number | null
          paypal_email?: string | null
          paypal_email_encrypted?: string | null
          pending_balance?: number | null
          preferred_language?: string | null
          return_days?: number | null
          return_policy?: string | null
          seller_terms_accepted_at?: string | null
          seller_trial_started_at?: string | null
          seller_type?: string | null
          short_id?: string
          store_name?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          total_sales_count?: number | null
          updated_at?: string
          user_id: string
          username?: string | null
          verified_at?: string | null
          withdrawal_blocked?: boolean | null
          withdrawal_blocked_at?: string | null
          withdrawal_blocked_reason?: string | null
        }
        Update: {
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          blocked_at?: string | null
          blocked_reason?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          fraud_flags?: Json | null
          fraud_score?: number | null
          id?: string
          is_buying_blocked?: boolean | null
          is_listing_blocked?: boolean | null
          is_seller?: boolean | null
          is_suspended?: boolean | null
          is_verified?: boolean | null
          last_activity_at?: string | null
          location?: string | null
          max_listings?: number | null
          payout_balance?: number | null
          paypal_email?: string | null
          paypal_email_encrypted?: string | null
          pending_balance?: number | null
          preferred_language?: string | null
          return_days?: number | null
          return_policy?: string | null
          seller_terms_accepted_at?: string | null
          seller_trial_started_at?: string | null
          seller_type?: string | null
          short_id?: string
          store_name?: string | null
          suspended_at?: string | null
          suspended_by?: string | null
          suspension_reason?: string | null
          total_sales_count?: number | null
          updated_at?: string
          user_id?: string
          username?: string | null
          verified_at?: string | null
          withdrawal_blocked?: boolean | null
          withdrawal_blocked_at?: string | null
          withdrawal_blocked_reason?: string | null
        }
        Relationships: []
      }
      prohibited_items: {
        Row: {
          category: string | null
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean | null
          keyword: string
          reason: string | null
          severity: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          keyword: string
          reason?: string | null
          severity?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          keyword?: string
          reason?: string | null
          severity?: string
        }
        Relationships: []
      }
      push_notification_log: {
        Row: {
          id: string
          notification_type: string | null
          recipient_id: string
          sent_at: string | null
          success: boolean | null
          user_id: string
        }
        Insert: {
          id?: string
          notification_type?: string | null
          recipient_id: string
          sent_at?: string | null
          success?: boolean | null
          user_id: string
        }
        Update: {
          id?: string
          notification_type?: string | null
          recipient_id?: string
          sent_at?: string | null
          success?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      push_tokens: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_valid: boolean | null
          last_used_at: string | null
          platform: string
          token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_valid?: boolean | null
          last_used_at?: string | null
          platform: string
          token: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_valid?: boolean | null
          last_used_at?: string | null
          platform?: string
          token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          action_type: string
          attempts: number | null
          created_at: string | null
          id: string
          identifier: string
          window_start: string | null
        }
        Insert: {
          action_type: string
          attempts?: number | null
          created_at?: string | null
          id?: string
          identifier: string
          window_start?: string | null
        }
        Update: {
          action_type?: string
          attempts?: number | null
          created_at?: string | null
          id?: string
          identifier?: string
          window_start?: string | null
        }
        Relationships: []
      }
      refunds: {
        Row: {
          amount: number
          approved_at: string | null
          approved_by: string | null
          buyer_id: string
          completed_at: string | null
          created_at: string
          id: string
          order_id: string | null
          processor: string | null
          processor_refund_id: string | null
          reason: string
          requested_by: string
          requires_admin_approval: boolean | null
          seller_id: string
          status: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          approved_at?: string | null
          approved_by?: string | null
          buyer_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          processor?: string | null
          processor_refund_id?: string | null
          reason: string
          requested_by: string
          requires_admin_approval?: boolean | null
          seller_id: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          approved_at?: string | null
          approved_by?: string | null
          buyer_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          order_id?: string | null
          processor?: string | null
          processor_refund_id?: string | null
          reason?: string
          requested_by?: string
          requires_admin_approval?: boolean | null
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
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_safe"
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
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "returns_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_safe"
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
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_safe"
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
      saved_searches: {
        Row: {
          created_at: string
          filters: Json
          id: string
          last_notified_at: string | null
          name: string
          notify_on_new: boolean | null
          query: string
          user_id: string
        }
        Insert: {
          created_at?: string
          filters?: Json
          id?: string
          last_notified_at?: string | null
          name: string
          notify_on_new?: boolean | null
          query?: string
          user_id: string
        }
        Update: {
          created_at?: string
          filters?: Json
          id?: string
          last_notified_at?: string | null
          name?: string
          notify_on_new?: boolean | null
          query?: string
          user_id?: string
        }
        Relationships: []
      }
      security_events: {
        Row: {
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      seller_limits: {
        Row: {
          created_at: string
          current_monthly_sales: number | null
          id: string
          limit_tier: string | null
          max_active_listings: number | null
          max_monthly_sales: number | null
          tier_upgraded_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_monthly_sales?: number | null
          id?: string
          limit_tier?: string | null
          max_active_listings?: number | null
          max_monthly_sales?: number | null
          tier_upgraded_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_monthly_sales?: number | null
          id?: string
          limit_tier?: string | null
          max_active_listings?: number | null
          max_monthly_sales?: number | null
          tier_upgraded_at?: string | null
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
          {
            foreignKeyName: "seller_payouts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_payouts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_safe"
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
      sensitive_data_access_log: {
        Row: {
          access_type: string
          accessed_user_id: string
          created_at: string | null
          field_accessed: string
          id: string
          ip_address: string | null
          user_id: string
        }
        Insert: {
          access_type: string
          accessed_user_id: string
          created_at?: string | null
          field_accessed: string
          id?: string
          ip_address?: string | null
          user_id: string
        }
        Update: {
          access_type?: string
          accessed_user_id?: string
          created_at?: string | null
          field_accessed?: string
          id?: string
          ip_address?: string | null
          user_id?: string
        }
        Relationships: []
      }
      seo_indexing_queue: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          id: string
          indexed_at: string | null
          listing_id: string | null
          priority: number | null
          status: string
          submitted_at: string | null
          updated_at: string
          url: string
        }
        Insert: {
          action?: string
          created_at?: string
          error_message?: string | null
          id?: string
          indexed_at?: string | null
          listing_id?: string | null
          priority?: number | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          id?: string
          indexed_at?: string | null
          listing_id?: string | null
          priority?: number | null
          status?: string
          submitted_at?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "seo_indexing_queue_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      seo_keywords: {
        Row: {
          category: string | null
          created_at: string
          current_rank: number | null
          id: string
          is_primary: boolean | null
          keyword: string
          last_checked_at: string | null
          search_volume: number | null
          target_rank: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_rank?: number | null
          id?: string
          is_primary?: boolean | null
          keyword: string
          last_checked_at?: string | null
          search_volume?: number | null
          target_rank?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          current_rank?: number | null
          id?: string
          is_primary?: boolean | null
          keyword?: string
          last_checked_at?: string | null
          search_volume?: number | null
          target_rank?: number | null
          updated_at?: string
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
      sitemap_entries: {
        Row: {
          changefreq: string | null
          created_at: string
          entity_id: string | null
          entry_type: string
          id: string
          is_active: boolean | null
          lastmod: string | null
          priority: number | null
          url: string
        }
        Insert: {
          changefreq?: string | null
          created_at?: string
          entity_id?: string | null
          entry_type: string
          id?: string
          is_active?: boolean | null
          lastmod?: string | null
          priority?: number | null
          url: string
        }
        Update: {
          changefreq?: string | null
          created_at?: string
          entity_id?: string | null
          entry_type?: string
          id?: string
          is_active?: boolean | null
          lastmod?: string | null
          priority?: number | null
          url?: string
        }
        Relationships: []
      }
      subscription_payments: {
        Row: {
          admin_notes: string | null
          amount_ron: number
          confirmed_at: string | null
          confirmed_by: string | null
          created_at: string
          id: string
          max_listings: number | null
          payment_method: string | null
          plan_name: string
          plan_type: string
          rejected_at: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount_ron: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          max_listings?: number | null
          payment_method?: string | null
          plan_name: string
          plan_type: string
          rejected_at?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount_ron?: number
          confirmed_at?: string | null
          confirmed_by?: string | null
          created_at?: string
          id?: string
          max_listings?: number | null
          payment_method?: string | null
          plan_name?: string
          plan_type?: string
          rejected_at?: string | null
          status?: string
          updated_at?: string
          user_id?: string
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
      user_subscriptions: {
        Row: {
          created_at: string
          expires_at: string | null
          id: string
          is_auction_plan: boolean
          max_listings: number | null
          plan_name: string
          plan_type: string
          price_ron: number
          starts_at: string
          status: string
          trial_plan: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_auction_plan?: boolean
          max_listings?: number | null
          plan_name: string
          plan_type: string
          price_ron?: number
          starts_at?: string
          status?: string
          trial_plan?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          expires_at?: string | null
          id?: string
          is_auction_plan?: boolean
          max_listings?: number | null
          plan_name?: string
          plan_type?: string
          price_ron?: number
          starts_at?: string
          status?: string
          trial_plan?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      watchlist: {
        Row: {
          created_at: string
          id: string
          listing_id: string
          notify_auction_ending: boolean | null
          notify_price_drop: boolean | null
          price_threshold: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          listing_id: string
          notify_auction_ending?: boolean | null
          notify_price_drop?: boolean | null
          price_threshold?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          listing_id?: string
          notify_auction_ending?: boolean | null
          notify_price_drop?: boolean | null
          price_threshold?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watchlist_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      web_push_subscriptions: {
        Row: {
          auth: string
          created_at: string
          endpoint: string
          id: string
          p256dh: string
          updated_at: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          auth: string
          created_at?: string
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          auth?: string
          created_at?: string
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string
          user_agent?: string | null
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
      withdrawal_requests: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          id: string
          paypal_email: string
          processed_at: string | null
          processed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          id?: string
          paypal_email: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          id?: string
          paypal_email?: string
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      conversations_safe: {
        Row: {
          admin_id: string | null
          admin_joined_at: string | null
          admin_notes: string | null
          blocked_at: string | null
          blocked_by: string | null
          buyer_id: string | null
          closed_at: string | null
          context_type: string | null
          created_at: string | null
          id: string | null
          is_blocked: boolean | null
          listing_id: string | null
          order_id: string | null
          seller_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_id?: never
          admin_joined_at?: never
          admin_notes?: never
          blocked_at?: never
          blocked_by?: never
          buyer_id?: string | null
          closed_at?: never
          context_type?: string | null
          created_at?: string | null
          id?: string | null
          is_blocked?: never
          listing_id?: string | null
          order_id?: string | null
          seller_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_id?: never
          admin_joined_at?: never
          admin_notes?: never
          blocked_at?: never
          blocked_by?: never
          buyer_id?: string | null
          closed_at?: never
          context_type?: string | null
          created_at?: string | null
          id?: string | null
          is_blocked?: never
          listing_id?: string | null
          order_id?: string | null
          seller_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes_safe: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string | null
          id: string | null
          order_id: string | null
          reason: string | null
          reported_user_id: string | null
          reporter_id: string | null
          resolution: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_notes?: never
          created_at?: string | null
          description?: string | null
          id?: string | null
          order_id?: string | null
          reason?: string | null
          reported_user_id?: string | null
          reporter_id?: string | null
          resolution?: never
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_notes?: never
          created_at?: string | null
          description?: string | null
          id?: string | null
          order_id?: string | null
          reason?: string | null
          reported_user_id?: string | null
          reporter_id?: string | null
          resolution?: never
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      fraud_monitoring: {
        Row: {
          alert_type: string | null
          auto_action_taken: string | null
          created_at: string | null
          display_name: string | null
          fraud_score: number | null
          id: string | null
          is_suspended: boolean | null
          severity: string | null
          status: string | null
          title: string | null
          user_id: string | null
          username: string | null
          withdrawal_blocked: boolean | null
        }
        Relationships: []
      }
      orders_active: {
        Row: {
          amount: number | null
          buyer_id: string | null
          carrier: string | null
          created_at: string | null
          delivery_confirmed_at: string | null
          id: string | null
          listing_id: string | null
          payment_processor: string | null
          payout_status: string | null
          seller_id: string | null
          shipping_address: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          buyer_id?: string | null
          carrier?: string | null
          created_at?: string | null
          delivery_confirmed_at?: string | null
          id?: string | null
          listing_id?: string | null
          payment_processor?: string | null
          payout_status?: string | null
          seller_id?: string | null
          shipping_address?: never
          status?: Database["public"]["Enums"]["order_status"] | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          buyer_id?: string | null
          carrier?: string | null
          created_at?: string | null
          delivery_confirmed_at?: string | null
          id?: string | null
          listing_id?: string | null
          payment_processor?: string | null
          payout_status?: string | null
          seller_id?: string | null
          shipping_address?: never
          status?: Database["public"]["Enums"]["order_status"] | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      orders_safe: {
        Row: {
          amount: number | null
          buyer_fee: number | null
          buyer_id: string | null
          cancelled_at: string | null
          carrier: string | null
          created_at: string | null
          delivery_confirmed_at: string | null
          dispute_opened_at: string | null
          dispute_reason: string | null
          dispute_resolved_at: string | null
          id: string | null
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
          seller_id: string | null
          shipping_address: string | null
          status: Database["public"]["Enums"]["order_status"] | null
          tracking_number: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          buyer_fee?: number | null
          buyer_id?: string | null
          cancelled_at?: string | null
          carrier?: string | null
          created_at?: string | null
          delivery_confirmed_at?: string | null
          dispute_opened_at?: string | null
          dispute_reason?: string | null
          dispute_resolved_at?: string | null
          id?: string | null
          listing_id?: string | null
          payment_processor?: never
          payout_amount?: number | null
          payout_at?: string | null
          payout_status?: string | null
          processor_error?: never
          processor_status?: never
          processor_transaction_id?: never
          refund_amount?: number | null
          refund_reason?: string | null
          refund_requested_at?: string | null
          refund_status?: string | null
          refund_transaction_id?: never
          refunded_at?: string | null
          refunded_by?: never
          saved_address_id?: string | null
          seller_commission?: number | null
          seller_id?: string | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          tracking_number?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          buyer_fee?: number | null
          buyer_id?: string | null
          cancelled_at?: string | null
          carrier?: string | null
          created_at?: string | null
          delivery_confirmed_at?: string | null
          dispute_opened_at?: string | null
          dispute_reason?: string | null
          dispute_resolved_at?: string | null
          id?: string | null
          listing_id?: string | null
          payment_processor?: never
          payout_amount?: number | null
          payout_at?: string | null
          payout_status?: string | null
          processor_error?: never
          processor_status?: never
          processor_transaction_id?: never
          refund_amount?: number | null
          refund_reason?: string | null
          refund_requested_at?: string | null
          refund_status?: string | null
          refund_transaction_id?: never
          refunded_at?: string | null
          refunded_by?: never
          saved_address_id?: string | null
          seller_commission?: number | null
          seller_id?: string | null
          shipping_address?: string | null
          status?: Database["public"]["Enums"]["order_status"] | null
          tracking_number?: string | null
          updated_at?: string | null
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
      payment_processor_settings_safe: {
        Row: {
          api_key_masked: string | null
          api_secret_masked: string | null
          created_at: string | null
          environment: string | null
          id: string | null
          is_active: boolean | null
          merchant_id: string | null
          processor_name: string | null
          updated_at: string | null
          webhook_url: string | null
        }
        Insert: {
          api_key_masked?: never
          api_secret_masked?: never
          created_at?: string | null
          environment?: string | null
          id?: string | null
          is_active?: boolean | null
          merchant_id?: string | null
          processor_name?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Update: {
          api_key_masked?: never
          api_secret_masked?: never
          created_at?: string | null
          environment?: string | null
          id?: string | null
          is_active?: boolean | null
          merchant_id?: string | null
          processor_name?: string | null
          updated_at?: string | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      profiles_safe: {
        Row: {
          avatar_url: string | null
          average_rating: number | null
          bio: string | null
          country: string | null
          created_at: string | null
          display_name: string | null
          id: string | null
          is_seller: boolean | null
          is_verified: boolean | null
          last_activity_at: string | null
          location: string | null
          preferred_language: string | null
          seller_type: string | null
          store_name: string | null
          total_sales_count: number | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          is_seller?: boolean | null
          is_verified?: boolean | null
          last_activity_at?: string | null
          location?: string | null
          preferred_language?: string | null
          seller_type?: string | null
          store_name?: string | null
          total_sales_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string | null
          is_seller?: boolean | null
          is_verified?: boolean | null
          last_activity_at?: string | null
          location?: string | null
          preferred_language?: string | null
          seller_type?: string | null
          store_name?: string | null
          total_sales_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      public_profiles_view: {
        Row: {
          avatar_url: string | null
          average_rating: number | null
          bio: string | null
          country: string | null
          created_at: string | null
          display_name: string | null
          is_seller: boolean | null
          is_verified: boolean | null
          location: string | null
          store_name: string | null
          total_sales_count: number | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          is_seller?: boolean | null
          is_verified?: boolean | null
          location?: never
          store_name?: string | null
          total_sales_count?: number | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          is_seller?: boolean | null
          is_verified?: boolean | null
          location?: never
          store_name?: string | null
          total_sales_count?: number | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      public_seller_profiles: {
        Row: {
          avatar_url: string | null
          average_rating: number | null
          bio: string | null
          country: string | null
          created_at: string | null
          display_name: string | null
          is_seller: boolean | null
          is_verified: boolean | null
          location: string | null
          short_id: string | null
          store_name: string | null
          total_sales_count: number | null
          updated_at: string | null
          user_id: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          is_seller?: boolean | null
          is_verified?: boolean | null
          location?: never
          short_id?: string | null
          store_name?: string | null
          total_sales_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          average_rating?: number | null
          bio?: string | null
          country?: string | null
          created_at?: string | null
          display_name?: string | null
          is_seller?: boolean | null
          is_verified?: boolean | null
          location?: never
          short_id?: string | null
          store_name?: string | null
          total_sales_count?: number | null
          updated_at?: string | null
          user_id?: string | null
          username?: string | null
        }
        Relationships: []
      }
      refunds_safe: {
        Row: {
          amount: number | null
          buyer_id: string | null
          completed_at: string | null
          created_at: string | null
          id: string | null
          order_id: string | null
          processor: string | null
          processor_refund_id: string | null
          reason: string | null
          requested_by: string | null
          seller_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          amount?: number | null
          buyer_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string | null
          order_id?: string | null
          processor?: never
          processor_refund_id?: never
          reason?: string | null
          requested_by?: string | null
          seller_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number | null
          buyer_id?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string | null
          order_id?: string | null
          processor?: never
          processor_refund_id?: never
          reason?: string | null
          requested_by?: string | null
          seller_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "refunds_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_payouts_safe: {
        Row: {
          cancelled_reason: string | null
          completed_at: string | null
          created_at: string | null
          gross_amount: number | null
          id: string | null
          net_amount: number | null
          notes: string | null
          order_id: string | null
          payout_method: string | null
          payout_reference: string | null
          platform_commission: number | null
          processed_at: string | null
          processor: string | null
          processor_payout_id: string | null
          processor_transaction_id: string | null
          seller_id: string | null
          status: string | null
        }
        Insert: {
          cancelled_reason?: never
          completed_at?: string | null
          created_at?: string | null
          gross_amount?: number | null
          id?: string | null
          net_amount?: number | null
          notes?: never
          order_id?: string | null
          payout_method?: string | null
          payout_reference?: never
          platform_commission?: number | null
          processed_at?: string | null
          processor?: never
          processor_payout_id?: never
          processor_transaction_id?: never
          seller_id?: string | null
          status?: string | null
        }
        Update: {
          cancelled_reason?: never
          completed_at?: string | null
          created_at?: string | null
          gross_amount?: number | null
          id?: string | null
          net_amount?: number | null
          notes?: never
          order_id?: string | null
          payout_method?: string | null
          payout_reference?: never
          platform_commission?: number | null
          processed_at?: string | null
          processor?: never
          processor_payout_id?: never
          processor_transaction_id?: never
          seller_id?: string | null
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
          {
            foreignKeyName: "seller_payouts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_active"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "seller_payouts_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders_safe"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawal_requests_safe: {
        Row: {
          admin_notes: string | null
          amount: number | null
          created_at: string | null
          id: string | null
          paypal_email_masked: string | null
          processed_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount?: number | null
          created_at?: string | null
          id?: string | null
          paypal_email_masked?: never
          processed_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number | null
          created_at?: string | null
          id?: string | null
          paypal_email_masked?: never
          processed_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      admin_increment_pending_balance: {
        Args: { p_amount: number; p_user_id: string }
        Returns: undefined
      }
      audit_sensitive_access: {
        Args: {
          p_details?: Json
          p_operation: string
          p_table_name: string
          p_user_id: string
        }
        Returns: undefined
      }
      audit_sensitive_operation: {
        Args: {
          p_details?: Json
          p_operation: string
          p_record_id?: string
          p_table_name: string
        }
        Returns: undefined
      }
      cancel_pending_order: {
        Args: { p_order_id: string; p_reason?: string }
        Returns: Json
      }
      check_push_rate_limit: {
        Args: { p_max_per_hour?: number; p_user_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_identifier: string
          p_max_attempts?: number
          p_window_minutes?: number
        }
        Returns: boolean
      }
      cleanup_expired_push_tokens: { Args: never; Returns: number }
      cleanup_old_push_logs: { Args: never; Returns: number }
      cleanup_old_returns: { Args: never; Returns: undefined }
      confirm_order_payment: {
        Args: {
          p_order_id: string
          p_processor_status?: string
          p_transaction_id: string
        }
        Returns: Json
      }
      decrypt_profile_field: {
        Args: { p_encrypted: string; p_key: string }
        Returns: string
      }
      encrypt_profile_field: {
        Args: { p_key: string; p_value: string }
        Returns: string
      }
      extend_token_expiration: {
        Args: { p_token: string; p_user_id: string }
        Returns: boolean
      }
      generate_short_id: { Args: never; Returns: string }
      get_generalized_location: { Args: { loc: string }; Returns: string }
      get_public_seller_profile: {
        Args: { seller_user_id: string }
        Returns: {
          avatar_url: string
          average_rating: number
          bio: string
          country: string
          created_at: string
          display_name: string
          is_seller: boolean
          is_verified: boolean
          location: string
          store_name: string
          total_sales_count: number
          user_id: string
          username: string
        }[]
      }
      get_public_seller_profiles: {
        Args: never
        Returns: {
          avatar_url: string
          average_rating: number
          bio: string
          country: string
          created_at: string
          display_name: string
          is_seller: boolean
          is_verified: boolean
          location: string
          store_name: string
          total_sales_count: number
          updated_at: string
          user_id: string
          username: string
        }[]
      }
      get_top_sellers: {
        Args: { limit_count?: number }
        Returns: {
          avatar_url: string
          avg_rating: number
          display_name: string
          is_verified: boolean
          store_name: string
          total_sales: number
          user_id: string
          username: string
        }[]
      }
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
      increment_fraud_score: {
        Args: { p_score: number; p_user_id: string }
        Returns: undefined
      }
      increment_pending_balance: {
        Args: { p_amount: number; p_user_id: string }
        Returns: undefined
      }
      is_admin_email: { Args: { check_email: string }; Returns: boolean }
      is_top_seller: { Args: { check_user_id: string }; Returns: boolean }
      log_security_event: {
        Args: { p_details?: Json; p_event_type: string; p_user_id?: string }
        Returns: undefined
      }
      log_sensitive_access:
        | {
            Args: {
              p_access_type: string
              p_accessed_user_id: string
              p_field: string
              p_ip?: string
            }
            Returns: undefined
          }
        | {
            Args: {
              p_access_type: string
              p_accessed_user_id: string
              p_field: string
              p_ip?: string
              p_user_id: string
            }
            Returns: undefined
          }
      process_order_transaction:
        | {
            Args: {
              p_amount: number
              p_buyer_fee: number
              p_buyer_id: string
              p_listing_id: string
              p_payment_processor: string
              p_payout_amount: number
              p_seller_commission: number
              p_seller_id: string
              p_shipping_address: string
              p_transaction_id: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_amount: number
              p_buyer_fee: number
              p_buyer_id: string
              p_listing_id: string
              p_payment_processor: string
              p_payout_amount: number
              p_seller_commission: number
              p_seller_id: string
              p_shipping_address: string
              p_transaction_id: string
            }
            Returns: Json
          }
      purge_old_tokens: { Args: never; Returns: number }
      refresh_platform_statistics: { Args: never; Returns: undefined }
      rotate_push_token: {
        Args: {
          p_new_token: string
          p_old_token: string
          p_platform: string
          p_user_id: string
        }
        Returns: boolean
      }
      validate_push_token: {
        Args: { p_token: string; p_user_id: string }
        Returns: boolean
      }
      verify_admin_access: { Args: { p_user_id: string }; Returns: boolean }
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
        | "partially_refunded"
        | "refund_pending"
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
        "partially_refunded",
        "refund_pending",
      ],
    },
  },
} as const
