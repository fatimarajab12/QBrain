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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bug_reports: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          priority: Database["public"]["Enums"]["test_priority"]
          project_id: string
          severity: Database["public"]["Enums"]["bug_severity"]
          status: Database["public"]["Enums"]["bug_status"]
          test_case_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["test_priority"]
          project_id: string
          severity?: Database["public"]["Enums"]["bug_severity"]
          status?: Database["public"]["Enums"]["bug_status"]
          test_case_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["test_priority"]
          project_id?: string
          severity?: Database["public"]["Enums"]["bug_severity"]
          status?: Database["public"]["Enums"]["bug_status"]
          test_case_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bug_reports_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bug_reports_test_case_id_fkey"
            columns: ["test_case_id"]
            isOneToOne: false
            referencedRelation: "test_cases"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      projects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          status: Database["public"]["Enums"]["project_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          status?: Database["public"]["Enums"]["project_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      test_cases: {
        Row: {
          actual_result: string | null
          created_at: string
          description: string | null
          expected_result: string | null
          id: string
          priority: Database["public"]["Enums"]["test_priority"]
          project_id: string
          status: Database["public"]["Enums"]["test_status"]
          steps: string | null
          test_suite_id: string | null
          title: string
          type: Database["public"]["Enums"]["test_type"]
          updated_at: string
        }
        Insert: {
          actual_result?: string | null
          created_at?: string
          description?: string | null
          expected_result?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["test_priority"]
          project_id: string
          status?: Database["public"]["Enums"]["test_status"]
          steps?: string | null
          test_suite_id?: string | null
          title: string
          type?: Database["public"]["Enums"]["test_type"]
          updated_at?: string
        }
        Update: {
          actual_result?: string | null
          created_at?: string
          description?: string | null
          expected_result?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["test_priority"]
          project_id?: string
          status?: Database["public"]["Enums"]["test_status"]
          steps?: string | null
          test_suite_id?: string | null
          title?: string
          type?: Database["public"]["Enums"]["test_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_cases_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_cases_test_suite_id_fkey"
            columns: ["test_suite_id"]
            isOneToOne: false
            referencedRelation: "test_suites"
            referencedColumns: ["id"]
          },
        ]
      }
      test_runs: {
        Row: {
          blocked: number
          created_at: string
          duration_ms: number | null
          executed_by: string
          failed: number
          id: string
          name: string
          passed: number
          project_id: string
          skipped: number
          test_suite_id: string | null
          total_cases: number
        }
        Insert: {
          blocked?: number
          created_at?: string
          duration_ms?: number | null
          executed_by: string
          failed?: number
          id?: string
          name: string
          passed?: number
          project_id: string
          skipped?: number
          test_suite_id?: string | null
          total_cases?: number
        }
        Update: {
          blocked?: number
          created_at?: string
          duration_ms?: number | null
          executed_by?: string
          failed?: number
          id?: string
          name?: string
          passed?: number
          project_id?: string
          skipped?: number
          test_suite_id?: string | null
          total_cases?: number
        }
        Relationships: [
          {
            foreignKeyName: "test_runs_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "test_runs_test_suite_id_fkey"
            columns: ["test_suite_id"]
            isOneToOne: false
            referencedRelation: "test_suites"
            referencedColumns: ["id"]
          },
        ]
      }
      test_suites: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          project_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          project_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          project_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "test_suites_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      bug_severity: "minor" | "major" | "critical" | "blocker"
      bug_status: "open" | "in_progress" | "fixed" | "retest" | "closed"
      project_status: "active" | "completed" | "archived"
      test_priority: "low" | "medium" | "high"
      test_status: "not_run" | "passed" | "failed" | "blocked" | "skipped"
      test_type:
        | "manual"
        | "automation"
        | "smoke"
        | "regression"
        | "api"
        | "ui"
        | "security"
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
      app_role: ["admin", "user"],
      bug_severity: ["minor", "major", "critical", "blocker"],
      bug_status: ["open", "in_progress", "fixed", "retest", "closed"],
      project_status: ["active", "completed", "archived"],
      test_priority: ["low", "medium", "high"],
      test_status: ["not_run", "passed", "failed", "blocked", "skipped"],
      test_type: [
        "manual",
        "automation",
        "smoke",
        "regression",
        "api",
        "ui",
        "security",
      ],
    },
  },
} as const
