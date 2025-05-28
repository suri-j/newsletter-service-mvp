export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      newsletters: {
        Row: {
          id: string
          user_id: string
          title: string
          content: string
          created_at: string
          updated_at: string
          published_at: string | null
          is_published: boolean
          is_public: boolean
          scheduled_at: string | null
          status: 'draft' | 'scheduled' | 'published'
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          content: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
          is_published?: boolean
          is_public?: boolean
          scheduled_at?: string | null
          status?: 'draft' | 'scheduled' | 'published'
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          content?: string
          created_at?: string
          updated_at?: string
          published_at?: string | null
          is_published?: boolean
          is_public?: boolean
          scheduled_at?: string | null
          status?: 'draft' | 'scheduled' | 'published'
        }
      }
      subscribers: {
        Row: {
          id: string
          user_id: string
          email: string
          name: string | null
          subscribed_at: string
          is_active: boolean
          unsubscribed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          email: string
          name?: string | null
          subscribed_at?: string
          is_active?: boolean
          unsubscribed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          email?: string
          name?: string | null
          subscribed_at?: string
          is_active?: boolean
          unsubscribed_at?: string | null
        }
      }
      newsletter_sends: {
        Row: {
          id: string
          newsletter_id: string
          subscriber_id: string
          sent_at: string | null
          status: 'pending' | 'sent' | 'failed' | 'bounced'
          error_message: string | null
          opened_at: string | null
          clicked_at: string | null
        }
        Insert: {
          id?: string
          newsletter_id: string
          subscriber_id: string
          sent_at?: string | null
          status?: 'pending' | 'sent' | 'failed' | 'bounced'
          error_message?: string | null
          opened_at?: string | null
          clicked_at?: string | null
        }
        Update: {
          id?: string
          newsletter_id?: string
          subscriber_id?: string
          sent_at?: string | null
          status?: 'pending' | 'sent' | 'failed' | 'bounced'
          error_message?: string | null
          opened_at?: string | null
          clicked_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      newsletter_status: 'draft' | 'scheduled' | 'published'
      send_status: 'pending' | 'sent' | 'failed' | 'bounced'
    }
  }
} 