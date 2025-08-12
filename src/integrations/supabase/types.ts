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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      actions: {
        Row: {
          action_type: Database["public"]["Enums"]["action_type"]
          created_at: string
          created_by: string
          id: string
          player_id: string | null
          result: Database["public"]["Enums"]["action_result"]
          session_id: string
          set_id: string
          synced: boolean
          team_id: string
          ts: string
          zone: number | null
        }
        Insert: {
          action_type: Database["public"]["Enums"]["action_type"]
          created_at?: string
          created_by: string
          id?: string
          player_id?: string | null
          result: Database["public"]["Enums"]["action_result"]
          session_id: string
          set_id: string
          synced?: boolean
          team_id: string
          ts?: string
          zone?: number | null
        }
        Update: {
          action_type?: Database["public"]["Enums"]["action_type"]
          created_at?: string
          created_by?: string
          id?: string
          player_id?: string | null
          result?: Database["public"]["Enums"]["action_result"]
          session_id?: string
          set_id?: string
          synced?: boolean
          team_id?: string
          ts?: string
          zone?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "actions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "actions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_invitations: {
        Row: {
          accepted: boolean
          club_id: string
          code: string
          created_at: string
          email: string
          id: string
        }
        Insert: {
          accepted?: boolean
          club_id: string
          code: string
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          accepted?: boolean
          club_id?: string
          code?: string
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_assistant_invitations_club"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      assistant_requests: {
        Row: {
          club_id: string
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          club_id: string
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          club_id?: string
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      club_invitation_codes: {
        Row: {
          club_id: string
          code: string
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          club_id: string
          code: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          club_id?: string
          code?: string
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      clubs: {
        Row: {
          ciudad: string
          created_at: string
          fecha_creacion: string
          id: string
          logo_url: string | null
          nombre: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ciudad: string
          created_at?: string
          fecha_creacion?: string
          id?: string
          logo_url?: string | null
          nombre: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ciudad?: string
          created_at?: string
          fecha_creacion?: string
          id?: string
          logo_url?: string | null
          nombre?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      event_chat_messages: {
        Row: {
          created_at: string
          event_id: string
          id: string
          message: string
          message_type: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          message: string
          message_type?: string
          sender_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          message?: string
          message_type?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_chat_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_documents: {
        Row: {
          created_at: string
          event_id: string
          file_name: string
          file_path: string
          file_type: string
          id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          event_id: string
          file_name: string
          file_path: string
          file_type: string
          id?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          event_id?: string
          file_name?: string
          file_path?: string
          file_type?: string
          id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_documents_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          created_at: string
          event_id: string
          id: string
          organizer_notes: string | null
          questions: string | null
          registering_coach_id: string
          registration_date: string
          status: string
          team_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          organizer_notes?: string | null
          questions?: string | null
          registering_coach_id: string
          registration_date?: string
          status?: string
          team_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          organizer_notes?: string | null
          questions?: string | null
          registering_coach_id?: string
          registration_date?: string
          status?: string
          team_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_registrations_event"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_registrations_team"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          benefits: string[] | null
          city: string
          created_at: string
          date: string
          description: string | null
          event_type: string
          id: string
          location: string
          max_participants: number | null
          name: string
          organizer_club_id: string
          organizer_id: string
          registration_deadline: string | null
          status: string
          updated_at: string
        }
        Insert: {
          benefits?: string[] | null
          city: string
          created_at?: string
          date: string
          description?: string | null
          event_type: string
          id?: string
          location: string
          max_participants?: number | null
          name: string
          organizer_club_id: string
          organizer_id: string
          registration_deadline?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          benefits?: string[] | null
          city?: string
          created_at?: string
          date?: string
          description?: string | null
          event_type?: string
          id?: string
          location?: string
          max_participants?: number | null
          name?: string
          organizer_club_id?: string
          organizer_id?: string
          registration_deadline?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_organizer_club_id_fkey"
            columns: ["organizer_club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_events_organizer_club"
            columns: ["organizer_club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      injury_logs: {
        Row: {
          created_at: string
          description: string
          expected_recovery_date: string | null
          id: string
          injury_date: string
          notes: string | null
          player_id: string
          recovery_status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          expected_recovery_date?: string | null
          id?: string
          injury_date: string
          notes?: string | null
          player_id: string
          recovery_status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          expected_recovery_date?: string | null
          id?: string
          injury_date?: string
          notes?: string | null
          player_id?: string
          recovery_status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "injury_logs_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_stats"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "injury_logs_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          allergies: string | null
          approach_jump_cm: number | null
          birthdate: string
          block_jump_cm: number | null
          created_at: string
          document_id: string
          dominant_hand: Database["public"]["Enums"]["dominant_hand"] | null
          full_name: string
          height_cm: number | null
          id: string
          jersey_number: number | null
          jump_cm: number | null
          position: Database["public"]["Enums"]["player_position"]
          reach_cm: number | null
          team_id: string
          updated_at: string
          weight_kg: number | null
        }
        Insert: {
          allergies?: string | null
          approach_jump_cm?: number | null
          birthdate: string
          block_jump_cm?: number | null
          created_at?: string
          document_id: string
          dominant_hand?: Database["public"]["Enums"]["dominant_hand"] | null
          full_name: string
          height_cm?: number | null
          id?: string
          jersey_number?: number | null
          jump_cm?: number | null
          position: Database["public"]["Enums"]["player_position"]
          reach_cm?: number | null
          team_id: string
          updated_at?: string
          weight_kg?: number | null
        }
        Update: {
          allergies?: string | null
          approach_jump_cm?: number | null
          birthdate?: string
          block_jump_cm?: number | null
          created_at?: string
          document_id?: string
          dominant_hand?: Database["public"]["Enums"]["dominant_hand"] | null
          full_name?: string
          height_cm?: number | null
          id?: string
          jersey_number?: number | null
          jump_cm?: number | null
          position?: Database["public"]["Enums"]["player_position"]
          reach_cm?: number | null
          team_id?: string
          updated_at?: string
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          club_id: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          last_name: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          club_id?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          club_id?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          club_id: string
          created_at: string
          created_by: string
          date: string
          id: string
          location: string
          opponent: string | null
          title: string
          type: Database["public"]["Enums"]["session_type"]
          updated_at: string
        }
        Insert: {
          club_id: string
          created_at?: string
          created_by: string
          date: string
          id?: string
          location: string
          opponent?: string | null
          title: string
          type: Database["public"]["Enums"]["session_type"]
          updated_at?: string
        }
        Update: {
          club_id?: string
          created_at?: string
          created_by?: string
          date?: string
          id?: string
          location?: string
          opponent?: string | null
          title?: string
          type?: Database["public"]["Enums"]["session_type"]
          updated_at?: string
        }
        Relationships: []
      }
      sets: {
        Row: {
          created_at: string
          id: string
          opp_score: number
          session_id: string
          set_number: number
          team_score: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          opp_score?: number
          session_id: string
          set_number: number
          team_score?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          opp_score?: number
          session_id?: string
          set_number?: number
          team_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sets_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          año: number
          categoria: string
          club_id: string
          created_at: string
          id: string
          nombre: string
          updated_at: string
        }
        Insert: {
          año: number
          categoria: string
          club_id: string
          created_at?: string
          id?: string
          nombre: string
          updated_at?: string
        }
        Update: {
          año?: number
          categoria?: string
          club_id?: string
          created_at?: string
          id?: string
          nombre?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_club_id_fkey"
            columns: ["club_id"]
            isOneToOne: false
            referencedRelation: "clubs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      player_stats: {
        Row: {
          blocks: number | null
          digs: number | null
          full_name: string | null
          hitting_pct: number | null
          player_id: string | null
          serve_eff: number | null
          session_type: Database["public"]["Enums"]["session_type"] | null
          team_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "players_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_invitation: {
        Args: { invitation_code: string; user_id: string }
        Returns: boolean
      }
      approve_assistant_request: {
        Args: { request_id: string }
        Returns: boolean
      }
      approve_coach: {
        Args: { coach_id: string }
        Returns: boolean
      }
      create_assistant_request_by_code: {
        Args: { p_code: string }
        Returns: boolean
      }
      decrement_team_score: {
        Args: { p_set_id: string; p_team_id: string }
        Returns: undefined
      }
      generate_club_code: {
        Args: { club_name: string }
        Returns: string
      }
      increment_team_score: {
        Args: { p_set_id: string; p_team_id: string }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_club_owner: {
        Args: { target_club_id: string }
        Returns: boolean
      }
      is_team_club_owner: {
        Args: { target_team_id: string }
        Returns: boolean
      }
      validate_assistant_invitation: {
        Args: { p_code: string }
        Returns: boolean
      }
      validate_club_code: {
        Args: { p_code: string }
        Returns: {
          club_id: string
          club_name: string
        }[]
      }
    }
    Enums: {
      action_result: "point" | "error" | "continue"
      action_type:
        | "serve"
        | "pass"
        | "set"
        | "attack"
        | "block"
        | "dig"
        | "free"
        | "error"
      dominant_hand: "right" | "left" | "ambidextrous"
      player_position:
        | "Setter"
        | "Libero"
        | "Middle Blocker"
        | "Outside Hitter"
        | "Opposite"
      session_type: "match" | "training" | "scrimmage"
      user_role:
        | "entrenador_principal"
        | "entrenador_asistente"
        | "administrador"
        | "admin"
        | "entrenador_principal_pending"
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
      action_result: ["point", "error", "continue"],
      action_type: [
        "serve",
        "pass",
        "set",
        "attack",
        "block",
        "dig",
        "free",
        "error",
      ],
      dominant_hand: ["right", "left", "ambidextrous"],
      player_position: [
        "Setter",
        "Libero",
        "Middle Blocker",
        "Outside Hitter",
        "Opposite",
      ],
      session_type: ["match", "training", "scrimmage"],
      user_role: [
        "entrenador_principal",
        "entrenador_asistente",
        "administrador",
        "admin",
        "entrenador_principal_pending",
      ],
    },
  },
} as const
