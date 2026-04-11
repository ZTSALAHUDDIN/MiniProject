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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      awards: {
        Row: {
          description: string
          earned_at: string
          icon: string
          id: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          description?: string
          earned_at?: string
          icon?: string
          id?: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          description?: string
          earned_at?: string
          icon?: string
          id?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      daily_stats: {
        Row: {
          created_at: string
          date: string
          id: string
          study_minutes: number
          tasks_completed: number
          tasks_missed: number
          tasks_total: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          study_minutes?: number
          tasks_completed?: number
          tasks_missed?: number
          tasks_total?: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          study_minutes?: number
          tasks_completed?: number
          tasks_missed?: number
          tasks_total?: number
          user_id?: string
        }
        Relationships: []
      }
      exam_dates: {
        Row: {
          created_at: string
          exam_date: string
          id: string
          subject_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          exam_date: string
          id?: string
          subject_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          exam_date?: string
          id?: string
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_dates_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      routine_blocks: {
        Row: {
          created_at: string
          days: number[]
          end_time: string
          id: string
          label: string
          start_time: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          days?: number[]
          end_time: string
          id?: string
          label: string
          start_time: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          days?: number[]
          end_time?: string
          id?: string
          label?: string
          start_time?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      scheduled_tasks: {
        Row: {
          created_at: string
          date: string
          end_time: string
          id: string
          is_revision: boolean
          revision_count: number
          start_time: string
          status: string
          subject_id: string
          topic_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          end_time: string
          id?: string
          is_revision?: boolean
          revision_count?: number
          start_time: string
          status?: string
          subject_id: string
          topic_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          end_time?: string
          id?: string
          is_revision?: boolean
          revision_count?: number
          start_time?: string
          status?: string
          subject_id?: string
          topic_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_tasks_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_tasks_topic_id_fkey"
            columns: ["topic_id"]
            isOneToOne: false
            referencedRelation: "topics"
            referencedColumns: ["id"]
          },
        ]
      }
      streaks: {
        Row: {
          created_at: string
          current_streak: number
          id: string
          last_active_date: string | null
          longest_streak: number
          total_study_days: number
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          total_study_days?: number
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number
          id?: string
          last_active_date?: string | null
          longest_streak?: number
          total_study_days?: number
          user_id?: string
        }
        Relationships: []
      }
      subjects: {
        Row: {
          color: string
          created_at: string
          id: string
          name: string
          user_id: string
        }
        Insert: {
          color?: string
          created_at?: string
          id?: string
          name: string
          user_id: string
        }
        Update: {
          color?: string
          created_at?: string
          id?: string
          name?: string
          user_id?: string
        }
        Relationships: []
      }
      topics: {
        Row: {
          confidence: number
          created_at: string
          deadline: string | null
          difficulty: number
          estimated_hours: number
          id: string
          importance: number
          name: string
          priority_score: number
          status: string
          subject_id: string
          user_id: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          deadline?: string | null
          difficulty?: number
          estimated_hours?: number
          id?: string
          importance?: number
          name: string
          priority_score?: number
          status?: string
          subject_id: string
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          deadline?: string | null
          difficulty?: number
          estimated_hours?: number
          id?: string
          importance?: number
          name?: string
          priority_score?: number
          status?: string
          subject_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "topics_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
