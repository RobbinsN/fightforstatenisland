export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      comments: {
        Row: {
          address: string
          comment: string
          created_at: string
          first_name: string
          id: string
          last_name: string
          phone: string
          response: string | null
          reviewed_at: string | null
          rsvp_id: string | null
          status: string | null
        }
        Insert: {
          address: string
          comment: string
          created_at?: string
          first_name: string
          id?: string
          last_name: string
          phone: string
          response?: string | null
          reviewed_at?: string | null
          rsvp_id?: string | null
          status?: string | null
        }
        Update: {
          address?: string
          comment?: string
          created_at?: string
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          response?: string | null
          reviewed_at?: string | null
          rsvp_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_rsvp_id_fkey"
            columns: ["rsvp_id"]
            isOneToOne: false
            referencedRelation: "rsvps"
            referencedColumns: ["id"]
          },
        ]
      }
      event_comments: {
        Row: {
          address: string
          comment: string
          created_at: string
          event_id: string | null
          first_name: string
          id: string
          last_name: string
          phone: string
          response: string | null
          reviewed_at: string | null
          rsvp_id: string | null
          status: string | null
        }
        Insert: {
          address: string
          comment: string
          created_at?: string
          event_id?: string | null
          first_name: string
          id?: string
          last_name: string
          phone: string
          response?: string | null
          reviewed_at?: string | null
          rsvp_id?: string | null
          status?: string | null
        }
        Update: {
          address?: string
          comment?: string
          created_at?: string
          event_id?: string | null
          first_name?: string
          id?: string
          last_name?: string
          phone?: string
          response?: string | null
          reviewed_at?: string | null
          rsvp_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_comments_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_comments_rsvp_id_fkey"
            columns: ["rsvp_id"]
            isOneToOne: false
            referencedRelation: "event_rsvps"
            referencedColumns: ["id"]
          },
        ]
      }
      event_hosts: {
        Row: {
          created_at: string
          event_id: string | null
          host_id: string | null
          id: string
          order_index: number
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          host_id?: string | null
          id?: string
          order_index?: number
        }
        Update: {
          created_at?: string
          event_id?: string | null
          host_id?: string | null
          id?: string
          order_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "event_hosts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_hosts_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
        ]
      }
      event_rsvps: {
        Row: {
          address: string
          checked_in: boolean | null
          checked_in_at: string | null
          created_at: string
          email: string | null
          event_id: string | null
          first_name: string
          full_name: string
          id: string
          last_name: string
          phone: string
        }
        Insert: {
          address: string
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string
          email?: string | null
          event_id?: string | null
          first_name: string
          full_name: string
          id?: string
          last_name: string
          phone: string
        }
        Update: {
          address?: string
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string
          email?: string | null
          event_id?: string | null
          first_name?: string
          full_name?: string
          id?: string
          last_name?: string
          phone?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_rsvps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          address: string
          city: string
          created_at: string
          event_date: string
          id: string
          location_name: string
          published: boolean
          slug: string
          state: string
          subtitle: string
          title: string
          updated_at: string
          zip: string
        }
        Insert: {
          address: string
          city: string
          created_at?: string
          event_date: string
          id?: string
          location_name: string
          published?: boolean
          slug: string
          state: string
          subtitle: string
          title: string
          updated_at?: string
          zip: string
        }
        Update: {
          address?: string
          city?: string
          created_at?: string
          event_date?: string
          id?: string
          location_name?: string
          published?: boolean
          slug?: string
          state?: string
          subtitle?: string
          title?: string
          updated_at?: string
          zip?: string
        }
        Relationships: []
      }
      hosts: {
        Row: {
          created_at: string
          id: string
          image_url: string
          name: string
          order_index: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          name: string
          order_index?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          name?: string
          order_index?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          address: string
          checked_in: boolean | null
          checked_in_at: string | null
          created_at: string
          email: string | null
          first_name: string
          full_name: string
          id: string
          last_name: string
          phone: string
        }
        Insert: {
          address: string
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string
          email?: string | null
          first_name: string
          full_name: string
          id?: string
          last_name: string
          phone: string
        }
        Update: {
          address?: string
          checked_in?: boolean | null
          checked_in_at?: string | null
          created_at?: string
          email?: string | null
          first_name?: string
          full_name?: string
          id?: string
          last_name?: string
          phone?: string
        }
        Relationships: []
      }
      secrets: {
        Row: {
          created_at: string
          id: string
          name: string
          value: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          value: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          value?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
