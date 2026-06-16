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
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      contact_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          id: string
          message: string | null
          requester_contact: string
          requester_email: string | null
          requester_name: string
          service_provider_id: string
          status: string
          terms_accepted_at: string | null
          terms_version_accepted: string | null
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          message?: string | null
          requester_contact: string
          requester_email?: string | null
          requester_name: string
          service_provider_id: string
          status?: string
          terms_accepted_at?: string | null
          terms_version_accepted?: string | null
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          id?: string
          message?: string | null
          requester_contact?: string
          requester_email?: string | null
          requester_name?: string
          service_provider_id?: string
          status?: string
          terms_accepted_at?: string | null
          terms_version_accepted?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_requests_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "approved_providers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contact_requests_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount_cents: number
          anonymous: boolean
          created_at: string
          currency: string
          donor_name: string | null
          email: string | null
          frequency: Database["public"]["Enums"]["donation_frequency"]
          id: string
          message: string | null
          payment_provider: string | null
          payment_reference: string | null
          payment_status: Database["public"]["Enums"]["payment_status"]
          phone: string | null
          purpose: Database["public"]["Enums"]["donation_purpose"]
        }
        Insert: {
          amount_cents: number
          anonymous?: boolean
          created_at?: string
          currency?: string
          donor_name?: string | null
          email?: string | null
          frequency?: Database["public"]["Enums"]["donation_frequency"]
          id?: string
          message?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string | null
          purpose?: Database["public"]["Enums"]["donation_purpose"]
        }
        Update: {
          amount_cents?: number
          anonymous?: boolean
          created_at?: string
          currency?: string
          donor_name?: string | null
          email?: string | null
          frequency?: Database["public"]["Enums"]["donation_frequency"]
          id?: string
          message?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string | null
          purpose?: Database["public"]["Enums"]["donation_purpose"]
        }
        Relationships: []
      }
      provider_documents: {
        Row: {
          document_type: string
          file_name: string | null
          id: string
          service_provider_id: string
          storage_path: string
          uploaded_at: string
        }
        Insert: {
          document_type: string
          file_name?: string | null
          id?: string
          service_provider_id: string
          storage_path: string
          uploaded_at?: string
        }
        Update: {
          document_type?: string
          file_name?: string | null
          id?: string
          service_provider_id?: string
          storage_path?: string
          uploaded_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_documents_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "approved_providers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_documents_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_references: {
        Row: {
          check_notes: string | null
          checked: boolean
          checked_at: string | null
          created_at: string
          id: string
          reference_contact: string
          reference_name: string
          relationship: string | null
          service_provider_id: string
        }
        Insert: {
          check_notes?: string | null
          checked?: boolean
          checked_at?: string | null
          created_at?: string
          id?: string
          reference_contact: string
          reference_name: string
          relationship?: string | null
          service_provider_id: string
        }
        Update: {
          check_notes?: string | null
          checked?: boolean
          checked_at?: string | null
          created_at?: string
          id?: string
          reference_contact?: string
          reference_name?: string
          relationship?: string | null
          service_provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_references_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "approved_providers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_references_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      provider_vetting_checks: {
        Row: {
          check_type: string
          id: string
          notes: string | null
          performed_at: string
          performed_by: string | null
          service_provider_id: string
          status: string
        }
        Insert: {
          check_type: string
          id?: string
          notes?: string | null
          performed_at?: string
          performed_by?: string | null
          service_provider_id: string
          status: string
        }
        Update: {
          check_type?: string
          id?: string
          notes?: string | null
          performed_at?: string
          performed_by?: string | null
          service_provider_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_vetting_checks_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "approved_providers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_vetting_checks_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          admin_notes: string | null
          application_code: string
          available_immediately: boolean
          consent_background_checks: boolean
          consent_no_guarantee: boolean
          consent_reference_checks: boolean
          consent_share_authorities: boolean
          consent_store_info: boolean
          created_at: string
          criminal_conviction: boolean
          criminal_conviction_details: string | null
          date_of_birth: string
          days_available: string[]
          display_name: string | null
          drivers_licence: boolean
          email: string | null
          full_name: string
          id: string
          id_passport_number: string
          looking_for: Database["public"]["Enums"]["availability_type"][]
          max_travel: Database["public"]["Enums"]["travel_distance"]
          mobile_number: string
          nationality: string
          own_transport: boolean
          physical_address: string
          previous_employer: string | null
          rejection_reason: string | null
          services: Database["public"]["Enums"]["service_category"][]
          skills_summary: string
          status: Database["public"]["Enums"]["provider_status"]
          terms_accepted_at: string | null
          terms_version_accepted: string | null
          town: string
          typical_hours: string[]
          updated_at: string
          user_id: string | null
          whatsapp_number: string | null
          years_experience: number | null
        }
        Insert: {
          admin_notes?: string | null
          application_code?: string
          available_immediately?: boolean
          consent_background_checks?: boolean
          consent_no_guarantee?: boolean
          consent_reference_checks?: boolean
          consent_share_authorities?: boolean
          consent_store_info?: boolean
          created_at?: string
          criminal_conviction?: boolean
          criminal_conviction_details?: string | null
          date_of_birth: string
          days_available?: string[]
          display_name?: string | null
          drivers_licence?: boolean
          email?: string | null
          full_name: string
          id?: string
          id_passport_number: string
          looking_for?: Database["public"]["Enums"]["availability_type"][]
          max_travel?: Database["public"]["Enums"]["travel_distance"]
          mobile_number: string
          nationality: string
          own_transport?: boolean
          physical_address: string
          previous_employer?: string | null
          rejection_reason?: string | null
          services?: Database["public"]["Enums"]["service_category"][]
          skills_summary: string
          status?: Database["public"]["Enums"]["provider_status"]
          terms_accepted_at?: string | null
          terms_version_accepted?: string | null
          town: string
          typical_hours?: string[]
          updated_at?: string
          user_id?: string | null
          whatsapp_number?: string | null
          years_experience?: number | null
        }
        Update: {
          admin_notes?: string | null
          application_code?: string
          available_immediately?: boolean
          consent_background_checks?: boolean
          consent_no_guarantee?: boolean
          consent_reference_checks?: boolean
          consent_share_authorities?: boolean
          consent_store_info?: boolean
          created_at?: string
          criminal_conviction?: boolean
          criminal_conviction_details?: string | null
          date_of_birth?: string
          days_available?: string[]
          display_name?: string | null
          drivers_licence?: boolean
          email?: string | null
          full_name?: string
          id?: string
          id_passport_number?: string
          looking_for?: Database["public"]["Enums"]["availability_type"][]
          max_travel?: Database["public"]["Enums"]["travel_distance"]
          mobile_number?: string
          nationality?: string
          own_transport?: boolean
          physical_address?: string
          previous_employer?: string | null
          rejection_reason?: string | null
          services?: Database["public"]["Enums"]["service_category"][]
          skills_summary?: string
          status?: Database["public"]["Enums"]["provider_status"]
          terms_accepted_at?: string | null
          terms_version_accepted?: string | null
          town?: string
          typical_hours?: string[]
          updated_at?: string
          user_id?: string | null
          whatsapp_number?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      service_requests: {
        Row: {
          admin_notes: string | null
          arrangement: Database["public"]["Enums"]["availability_type"] | null
          consent_contact: boolean
          contact_number: string
          created_at: string
          email: string | null
          id: string
          location: string
          notes: string | null
          preferred_days: string[]
          preferred_times: string[]
          requester_name: string
          service_needed: Database["public"]["Enums"]["service_category"]
          status: Database["public"]["Enums"]["request_status"]
          terms_accepted_at: string | null
          terms_version_accepted: string | null
          updated_at: string
          urgency: string | null
        }
        Insert: {
          admin_notes?: string | null
          arrangement?: Database["public"]["Enums"]["availability_type"] | null
          consent_contact?: boolean
          contact_number: string
          created_at?: string
          email?: string | null
          id?: string
          location: string
          notes?: string | null
          preferred_days?: string[]
          preferred_times?: string[]
          requester_name: string
          service_needed: Database["public"]["Enums"]["service_category"]
          status?: Database["public"]["Enums"]["request_status"]
          terms_accepted_at?: string | null
          terms_version_accepted?: string | null
          updated_at?: string
          urgency?: string | null
        }
        Update: {
          admin_notes?: string | null
          arrangement?: Database["public"]["Enums"]["availability_type"] | null
          consent_contact?: boolean
          contact_number?: string
          created_at?: string
          email?: string | null
          id?: string
          location?: string
          notes?: string | null
          preferred_days?: string[]
          preferred_times?: string[]
          requester_name?: string
          service_needed?: Database["public"]["Enums"]["service_category"]
          status?: Database["public"]["Enums"]["request_status"]
          terms_accepted_at?: string | null
          terms_version_accepted?: string | null
          updated_at?: string
          urgency?: string | null
        }
        Relationships: []
      }
      terms_acceptances: {
        Row: {
          acceptance_text: string
          accepted_at: string
          context: string
          created_at: string
          id: string
          ip_address: string | null
          reference_id: string | null
          reference_table: string | null
          terms_version: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          acceptance_text: string
          accepted_at?: string
          context: string
          created_at?: string
          id?: string
          ip_address?: string | null
          reference_id?: string | null
          reference_table?: string | null
          terms_version: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          acceptance_text?: string
          accepted_at?: string
          context?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          reference_id?: string | null
          reference_table?: string | null
          terms_version?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
      vetting_pdf_exports: {
        Row: {
          generated_at: string
          generated_by: string | null
          id: string
          notes: string | null
          result_date: string | null
          service_provider_id: string
          shared_date: string | null
          shared_with: string | null
          vetting_result_received: boolean
        }
        Insert: {
          generated_at?: string
          generated_by?: string | null
          id?: string
          notes?: string | null
          result_date?: string | null
          service_provider_id: string
          shared_date?: string | null
          shared_with?: string | null
          vetting_result_received?: boolean
        }
        Update: {
          generated_at?: string
          generated_by?: string | null
          id?: string
          notes?: string | null
          result_date?: string | null
          service_provider_id?: string
          shared_date?: string | null
          shared_with?: string | null
          vetting_result_received?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "vetting_pdf_exports_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "approved_providers_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vetting_pdf_exports_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      approved_providers_public: {
        Row: {
          available_immediately: boolean | null
          days_available: string[] | null
          display_name: string | null
          drivers_licence: boolean | null
          id: string | null
          max_travel: Database["public"]["Enums"]["travel_distance"] | null
          own_transport: boolean | null
          services: Database["public"]["Enums"]["service_category"][] | null
          skills_summary: string | null
          town: string | null
          typical_hours: string[] | null
        }
        Insert: {
          available_immediately?: boolean | null
          days_available?: string[] | null
          display_name?: never
          drivers_licence?: boolean | null
          id?: string | null
          max_travel?: Database["public"]["Enums"]["travel_distance"] | null
          own_transport?: boolean | null
          services?: Database["public"]["Enums"]["service_category"][] | null
          skills_summary?: string | null
          town?: string | null
          typical_hours?: string[] | null
        }
        Update: {
          available_immediately?: boolean | null
          days_available?: string[] | null
          display_name?: never
          drivers_licence?: boolean | null
          id?: string | null
          max_travel?: Database["public"]["Enums"]["travel_distance"] | null
          own_transport?: boolean | null
          services?: Database["public"]["Enums"]["service_category"][] | null
          skills_summary?: string | null
          town?: string | null
          typical_hours?: string[] | null
        }
        Relationships: []
      }
      impact_stats: {
        Row: {
          approved: number | null
          matches: number | null
          registered: number | null
          requests: number | null
          sponsored_checks: number | null
        }
        Relationships: []
      }
      supporter_wall: {
        Row: {
          amount_cents: number | null
          created_at: string | null
          name: string | null
          purpose: Database["public"]["Enums"]["donation_purpose"] | null
        }
        Insert: {
          amount_cents?: number | null
          created_at?: string | null
          name?: never
          purpose?: Database["public"]["Enums"]["donation_purpose"] | null
        }
        Update: {
          amount_cents?: number | null
          created_at?: string | null
          name?: never
          purpose?: Database["public"]["Enums"]["donation_purpose"] | null
        }
        Relationships: []
      }
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
      availability_type: "full_time" | "part_time" | "casual" | "temporary"
      donation_frequency: "once_off" | "monthly"
      donation_purpose: "general" | "sponsor_vetting"
      payment_status: "pending" | "succeeded" | "failed" | "refunded"
      provider_status:
        | "pending_review"
        | "awaiting_documents"
        | "id_checked"
        | "references_checked"
        | "permit_checked"
        | "police_check_requested"
        | "vetting_result_received"
        | "approved"
        | "rejected"
        | "suspended"
      request_status:
        | "new"
        | "in_review"
        | "matched"
        | "contacted"
        | "completed"
        | "closed"
      service_category:
        | "elderly_care"
        | "childcare"
        | "domestic_work"
        | "gardening"
        | "farm_work"
        | "cleaning"
        | "cooking"
        | "handyman"
        | "painting"
        | "construction"
        | "security"
        | "admin"
        | "tutoring"
        | "computer_skills"
        | "hospitality"
        | "driving"
        | "other"
      travel_distance:
        | "own_town"
        | "within_20km"
        | "within_50km"
        | "overberg_wide"
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
      availability_type: ["full_time", "part_time", "casual", "temporary"],
      donation_frequency: ["once_off", "monthly"],
      donation_purpose: ["general", "sponsor_vetting"],
      payment_status: ["pending", "succeeded", "failed", "refunded"],
      provider_status: [
        "pending_review",
        "awaiting_documents",
        "id_checked",
        "references_checked",
        "permit_checked",
        "police_check_requested",
        "vetting_result_received",
        "approved",
        "rejected",
        "suspended",
      ],
      request_status: [
        "new",
        "in_review",
        "matched",
        "contacted",
        "completed",
        "closed",
      ],
      service_category: [
        "elderly_care",
        "childcare",
        "domestic_work",
        "gardening",
        "farm_work",
        "cleaning",
        "cooking",
        "handyman",
        "painting",
        "construction",
        "security",
        "admin",
        "tutoring",
        "computer_skills",
        "hospitality",
        "driving",
        "other",
      ],
      travel_distance: [
        "own_town",
        "within_20km",
        "within_50km",
        "overberg_wide",
      ],
    },
  },
} as const
