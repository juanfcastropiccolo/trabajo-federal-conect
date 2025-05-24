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
      app_settings: {
        Row: {
          description: string | null
          id: string
          is_active: boolean | null
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          is_active?: boolean | null
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          is_active?: boolean | null
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      company_profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          business_name: string | null
          city: string | null
          company_name: string
          company_size: Database["public"]["Enums"]["company_size_type"] | null
          contact_person: string | null
          contact_phone: string | null
          created_at: string
          cuit: string | null
          description: string | null
          id: string
          industry: string | null
          is_verified: boolean | null
          logo_url: string | null
          postal_code: string | null
          province: string | null
          rating_average: number | null
          total_jobs_posted: number | null
          updated_at: string
          user_id: string
          verification_date: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          business_name?: string | null
          city?: string | null
          company_name: string
          company_size?: Database["public"]["Enums"]["company_size_type"] | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          cuit?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_verified?: boolean | null
          logo_url?: string | null
          postal_code?: string | null
          province?: string | null
          rating_average?: number | null
          total_jobs_posted?: number | null
          updated_at?: string
          user_id: string
          verification_date?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          business_name?: string | null
          city?: string | null
          company_name?: string
          company_size?: Database["public"]["Enums"]["company_size_type"] | null
          contact_person?: string | null
          contact_phone?: string | null
          created_at?: string
          cuit?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          is_verified?: boolean | null
          logo_url?: string | null
          postal_code?: string | null
          province?: string | null
          rating_average?: number | null
          total_jobs_posted?: number | null
          updated_at?: string
          user_id?: string
          verification_date?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "company_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          target_id: string
          target_type: Database["public"]["Enums"]["favorite_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_id: string
          target_type: Database["public"]["Enums"]["favorite_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["favorite_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          application_notes: string | null
          applied_at: string
          available_start_date: string | null
          company_notes: string | null
          cover_letter: string | null
          expected_salary: number | null
          id: string
          job_post_id: string
          reviewed_at: string | null
          status: Database["public"]["Enums"]["application_status_type"]
          updated_at: string
          worker_id: string
        }
        Insert: {
          application_notes?: string | null
          applied_at?: string
          available_start_date?: string | null
          company_notes?: string | null
          cover_letter?: string | null
          expected_salary?: number | null
          id?: string
          job_post_id: string
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["application_status_type"]
          updated_at?: string
          worker_id: string
        }
        Update: {
          application_notes?: string | null
          applied_at?: string
          available_start_date?: string | null
          company_notes?: string | null
          cover_letter?: string | null
          expected_salary?: number | null
          id?: string
          job_post_id?: string
          reviewed_at?: string | null
          status?: Database["public"]["Enums"]["application_status_type"]
          updated_at?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_job_post_id_fkey"
            columns: ["job_post_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_posts: {
        Row: {
          address: string | null
          application_deadline: string | null
          applications_count: number | null
          benefits: string[] | null
          category: string | null
          city: string | null
          company_id: string
          created_at: string
          description: string
          end_date: string | null
          id: string
          location_type: Database["public"]["Enums"]["location_type"]
          positions_available: number | null
          province: string | null
          requirements: string[] | null
          responsibilities: string[] | null
          salary_max: number | null
          salary_min: number | null
          salary_type: Database["public"]["Enums"]["salary_type"] | null
          start_date: string | null
          status: Database["public"]["Enums"]["job_status_type"]
          title: string
          updated_at: string
          urgency: Database["public"]["Enums"]["urgency_type"] | null
          views_count: number | null
          work_type: Database["public"]["Enums"]["work_type"]
        }
        Insert: {
          address?: string | null
          application_deadline?: string | null
          applications_count?: number | null
          benefits?: string[] | null
          category?: string | null
          city?: string | null
          company_id: string
          created_at?: string
          description: string
          end_date?: string | null
          id?: string
          location_type: Database["public"]["Enums"]["location_type"]
          positions_available?: number | null
          province?: string | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          salary_type?: Database["public"]["Enums"]["salary_type"] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["job_status_type"]
          title: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_type"] | null
          views_count?: number | null
          work_type: Database["public"]["Enums"]["work_type"]
        }
        Update: {
          address?: string | null
          application_deadline?: string | null
          applications_count?: number | null
          benefits?: string[] | null
          category?: string | null
          city?: string | null
          company_id?: string
          created_at?: string
          description?: string
          end_date?: string | null
          id?: string
          location_type?: Database["public"]["Enums"]["location_type"]
          positions_available?: number | null
          province?: string | null
          requirements?: string[] | null
          responsibilities?: string[] | null
          salary_max?: number | null
          salary_min?: number | null
          salary_type?: Database["public"]["Enums"]["salary_type"] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["job_status_type"]
          title?: string
          updated_at?: string
          urgency?: Database["public"]["Enums"]["urgency_type"] | null
          views_count?: number | null
          work_type?: Database["public"]["Enums"]["work_type"]
        }
        Relationships: [
          {
            foreignKeyName: "job_posts_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      job_skills: {
        Row: {
          created_at: string
          id: string
          is_required: boolean | null
          job_post_id: string
          minimum_level:
            | Database["public"]["Enums"]["experience_level_type"]
            | null
          skill_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_required?: boolean | null
          job_post_id: string
          minimum_level?:
            | Database["public"]["Enums"]["experience_level_type"]
            | null
          skill_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_required?: boolean | null
          job_post_id?: string
          minimum_level?:
            | Database["public"]["Enums"]["experience_level_type"]
            | null
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_skills_job_post_id_fkey"
            columns: ["job_post_id"]
            isOneToOne: false
            referencedRelation: "job_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          attachment_url: string | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_read: boolean | null
          job_application_id: string | null
          message_type: Database["public"]["Enums"]["message_type"]
          read_at: string | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          attachment_url?: string | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          job_application_id?: string | null
          message_type?: Database["public"]["Enums"]["message_type"]
          read_at?: string | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          attachment_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          job_application_id?: string | null
          message_type?: Database["public"]["Enums"]["message_type"]
          read_at?: string | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_job_application_id_fkey"
            columns: ["job_application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          related_type: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          related_type?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          related_type?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_public: boolean | null
          job_application_id: string
          rating: number
          review_type: Database["public"]["Enums"]["review_type"]
          reviewee_id: string
          reviewer_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          job_application_id: string
          rating: number
          review_type: Database["public"]["Enums"]["review_type"]
          reviewee_id: string
          reviewer_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          job_application_id?: string
          rating?: number
          review_type?: Database["public"]["Enums"]["review_type"]
          reviewee_id?: string
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_job_application_id_fkey"
            columns: ["job_application_id"]
            isOneToOne: false
            referencedRelation: "job_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          is_verified: boolean
          last_login: string | null
          phone: string | null
          updated_at: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          is_active?: boolean
          is_verified?: boolean
          last_login?: string | null
          phone?: string | null
          updated_at?: string
          user_type: Database["public"]["Enums"]["user_type"]
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          last_login?: string | null
          phone?: string | null
          updated_at?: string
          user_type?: Database["public"]["Enums"]["user_type"]
        }
        Relationships: []
      }
      work_history: {
        Row: {
          company_name: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          is_current: boolean | null
          job_title: string
          reference_name: string | null
          reference_phone: string | null
          start_date: string
          worker_id: string
        }
        Insert: {
          company_name: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          job_title: string
          reference_name?: string | null
          reference_phone?: string | null
          start_date: string
          worker_id: string
        }
        Update: {
          company_name?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          is_current?: boolean | null
          job_title?: string
          reference_name?: string | null
          reference_phone?: string | null
          start_date?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "work_history_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_profiles: {
        Row: {
          address: string | null
          availability: Database["public"]["Enums"]["availability_type"] | null
          avatar_url: string | null
          bio: string | null
          birth_date: string | null
          city: string | null
          created_at: string
          document_number: string | null
          experience_years: number | null
          first_name: string
          gender: Database["public"]["Enums"]["gender_type"] | null
          has_tools: boolean | null
          has_transport: boolean | null
          id: string
          is_available: boolean | null
          last_name: string
          postal_code: string | null
          profile_picture_url: string | null
          province: string | null
          rating_average: number | null
          salary_expectation_max: number | null
          salary_expectation_min: number | null
          total_jobs_completed: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          availability?: Database["public"]["Enums"]["availability_type"] | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          document_number?: string | null
          experience_years?: number | null
          first_name: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          has_tools?: boolean | null
          has_transport?: boolean | null
          id?: string
          is_available?: boolean | null
          last_name: string
          postal_code?: string | null
          profile_picture_url?: string | null
          province?: string | null
          rating_average?: number | null
          salary_expectation_max?: number | null
          salary_expectation_min?: number | null
          total_jobs_completed?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          availability?: Database["public"]["Enums"]["availability_type"] | null
          avatar_url?: string | null
          bio?: string | null
          birth_date?: string | null
          city?: string | null
          created_at?: string
          document_number?: string | null
          experience_years?: number | null
          first_name?: string
          gender?: Database["public"]["Enums"]["gender_type"] | null
          has_tools?: boolean | null
          has_transport?: boolean | null
          id?: string
          is_available?: boolean | null
          last_name?: string
          postal_code?: string | null
          profile_picture_url?: string | null
          province?: string | null
          rating_average?: number | null
          salary_expectation_max?: number | null
          salary_expectation_min?: number | null
          total_jobs_completed?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_skills: {
        Row: {
          created_at: string
          experience_level: Database["public"]["Enums"]["experience_level_type"]
          id: string
          is_certified: boolean | null
          skill_id: string
          worker_id: string
          years_experience: number | null
        }
        Insert: {
          created_at?: string
          experience_level: Database["public"]["Enums"]["experience_level_type"]
          id?: string
          is_certified?: boolean | null
          skill_id: string
          worker_id: string
          years_experience?: number | null
        }
        Update: {
          created_at?: string
          experience_level?: Database["public"]["Enums"]["experience_level_type"]
          id?: string
          is_certified?: boolean | null
          skill_id?: string
          worker_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "worker_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_skills_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "worker_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_type: {
        Args: { user_id: string }
        Returns: string
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_company: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_worker: {
        Args: { user_id: string }
        Returns: boolean
      }
      sync_orphaned_users: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      application_status_type:
        | "pending"
        | "reviewed"
        | "shortlisted"
        | "interview_scheduled"
        | "hired"
        | "rejected"
        | "withdrawn"
      availability_type: "full_time" | "part_time" | "flexible" | "weekends"
      company_size_type: "startup" | "small" | "medium" | "large" | "enterprise"
      experience_level_type: "beginner" | "intermediate" | "advanced" | "expert"
      favorite_type: "worker" | "company" | "job_post"
      gender_type: "male" | "female" | "other" | "prefer_not_to_say"
      job_status_type:
        | "draft"
        | "published"
        | "paused"
        | "closed"
        | "filled"
        | "open"
      location_type: "on_site" | "remote" | "hybrid"
      message_type: "text" | "image" | "document" | "system"
      notification_type:
        | "new_job_match"
        | "application_status"
        | "new_message"
        | "profile_view"
        | "system"
      review_type: "worker_to_company" | "company_to_worker"
      salary_type: "hourly" | "daily" | "weekly" | "monthly" | "project"
      urgency_type: "low" | "medium" | "high" | "urgent"
      user_type: "worker" | "company" | "admin"
      work_type:
        | "full_time"
        | "part_time"
        | "temporary"
        | "contract"
        | "internship"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      application_status_type: [
        "pending",
        "reviewed",
        "shortlisted",
        "interview_scheduled",
        "hired",
        "rejected",
        "withdrawn",
      ],
      availability_type: ["full_time", "part_time", "flexible", "weekends"],
      company_size_type: ["startup", "small", "medium", "large", "enterprise"],
      experience_level_type: ["beginner", "intermediate", "advanced", "expert"],
      favorite_type: ["worker", "company", "job_post"],
      gender_type: ["male", "female", "other", "prefer_not_to_say"],
      job_status_type: [
        "draft",
        "published",
        "paused",
        "closed",
        "filled",
        "open",
      ],
      location_type: ["on_site", "remote", "hybrid"],
      message_type: ["text", "image", "document", "system"],
      notification_type: [
        "new_job_match",
        "application_status",
        "new_message",
        "profile_view",
        "system",
      ],
      review_type: ["worker_to_company", "company_to_worker"],
      salary_type: ["hourly", "daily", "weekly", "monthly", "project"],
      urgency_type: ["low", "medium", "high", "urgent"],
      user_type: ["worker", "company", "admin"],
      work_type: [
        "full_time",
        "part_time",
        "temporary",
        "contract",
        "internship",
      ],
    },
  },
} as const
