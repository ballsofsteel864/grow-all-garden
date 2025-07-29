export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      crops: {
        Row: {
          growth_stage: number | null
          id: string
          max_growth_stage: number | null
          mutations: string[] | null
          planted_at: string | null
          player_id: string | null
          ready_to_harvest: boolean | null
          seed_id: string | null
          watered: boolean | null
          x_position: number
          y_position: number
        }
        Insert: {
          growth_stage?: number | null
          id?: string
          max_growth_stage?: number | null
          mutations?: string[] | null
          planted_at?: string | null
          player_id?: string | null
          ready_to_harvest?: boolean | null
          seed_id?: string | null
          watered?: boolean | null
          x_position: number
          y_position: number
        }
        Update: {
          growth_stage?: number | null
          id?: string
          max_growth_stage?: number | null
          mutations?: string[] | null
          planted_at?: string | null
          player_id?: string | null
          ready_to_harvest?: boolean | null
          seed_id?: string | null
          watered?: boolean | null
          x_position?: number
          y_position?: number
        }
        Relationships: [
          {
            foreignKeyName: "crops_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crops_seed_id_fkey"
            columns: ["seed_id"]
            isOneToOne: false
            referencedRelation: "seeds"
            referencedColumns: ["id"]
          },
        ]
      }
      game_rooms: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          player_count: number | null
          room_code: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          player_count?: number | null
          room_code: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          player_count?: number | null
          room_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_rooms_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      player_inventories: {
        Row: {
          id: string
          player_id: string | null
          quantity: number | null
          seed_id: string | null
        }
        Insert: {
          id?: string
          player_id?: string | null
          quantity?: number | null
          seed_id?: string | null
        }
        Update: {
          id?: string
          player_id?: string | null
          quantity?: number | null
          seed_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "player_inventories_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_inventories_seed_id_fkey"
            columns: ["seed_id"]
            isOneToOne: false
            referencedRelation: "seeds"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          created_at: string | null
          id: string
          is_admin: boolean | null
          level: number | null
          money: number | null
          room_id: string | null
          updated_at: string | null
          username: string
          xp: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          level?: number | null
          money?: number | null
          room_id?: string | null
          updated_at?: string | null
          username: string
          xp?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          is_admin?: boolean | null
          level?: number | null
          money?: number | null
          room_id?: string | null
          updated_at?: string | null
          username?: string
          xp?: number | null
        }
        Relationships: []
      }
      seeds: {
        Row: {
          cost_robux: number | null
          cost_sheckles: number
          description: string | null
          growth_time: number
          id: string
          max_stock: number | null
          min_stock: number | null
          multi_harvest: boolean | null
          name: string
          obtainable: boolean | null
          rarity: string
          sell_price: number
          stock: number | null
        }
        Insert: {
          cost_robux?: number | null
          cost_sheckles: number
          description?: string | null
          growth_time?: number
          id?: string
          max_stock?: number | null
          min_stock?: number | null
          multi_harvest?: boolean | null
          name: string
          obtainable?: boolean | null
          rarity: string
          sell_price: number
          stock?: number | null
        }
        Update: {
          cost_robux?: number | null
          cost_sheckles?: number
          description?: string | null
          growth_time?: number
          id?: string
          max_stock?: number | null
          min_stock?: number | null
          multi_harvest?: boolean | null
          name?: string
          obtainable?: boolean | null
          rarity?: string
          sell_price?: number
          stock?: number | null
        }
        Relationships: []
      }
      shop_stock: {
        Row: {
          current_stock: number | null
          id: string
          last_restock: string | null
          next_restock: string | null
          seed_id: string | null
        }
        Insert: {
          current_stock?: number | null
          id?: string
          last_restock?: string | null
          next_restock?: string | null
          seed_id?: string | null
        }
        Update: {
          current_stock?: number | null
          id?: string
          last_restock?: string | null
          next_restock?: string | null
          seed_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shop_stock_seed_id_fkey"
            columns: ["seed_id"]
            isOneToOne: false
            referencedRelation: "seeds"
            referencedColumns: ["id"]
          },
        ]
      }
      weather_events: {
        Row: {
          duration: number | null
          id: string
          is_active: boolean | null
          scope: string | null
          started_at: string | null
          triggered_by_admin: boolean | null
          weather_type: string
        }
        Insert: {
          duration?: number | null
          id?: string
          is_active?: boolean | null
          scope?: string | null
          started_at?: string | null
          triggered_by_admin?: boolean | null
          weather_type: string
        }
        Update: {
          duration?: number | null
          id?: string
          is_active?: boolean | null
          scope?: string | null
          started_at?: string | null
          triggered_by_admin?: boolean | null
          weather_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      decrement_stock: {
        Args: { seed_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
