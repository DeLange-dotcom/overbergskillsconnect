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
      apprentice_applications: {
        Row: {
          apprentice_id: string
          created_at: string
          id: string
          notes: string | null
          opportunity_id: string
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
        }
        Insert: {
          apprentice_id: string
          created_at?: string
          id?: string
          notes?: string | null
          opportunity_id: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Update: {
          apprentice_id?: string
          created_at?: string
          id?: string
          notes?: string | null
          opportunity_id?: string
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "apprentice_applications_apprentice_id_fkey"
            columns: ["apprentice_id"]
            isOneToOne: false
            referencedRelation: "apprentices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apprentice_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "apprenticeship_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apprentice_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "apprenticeship_opportunities_public"
            referencedColumns: ["id"]
          },
        ]
      }
      apprentices: {
        Row: {
          availability: string[]
          career_interests: string[]
          certificates: string | null
          contact_number: string | null
          created_at: string
          cv_url: string | null
          dob: string
          drivers_licence: boolean | null
          email: string | null
          full_name: string
          further_education: string | null
          highest_grade: string | null
          id: string
          opportunity_types: string[]
          physical_address: string | null
          qualifications: string | null
          reference_code: string
          skills_to_learn: string | null
          status: Database["public"]["Enums"]["apprentice_status"]
          terms_accepted_at: string | null
          terms_version: string | null
          town: string
          transport_available: boolean | null
          updated_at: string
          user_id: string | null
          whatsapp_number: string | null
          why_interested: string | null
        }
        Insert: {
          availability?: string[]
          career_interests?: string[]
          certificates?: string | null
          contact_number?: string | null
          created_at?: string
          cv_url?: string | null
          dob: string
          drivers_licence?: boolean | null
          email?: string | null
          full_name: string
          further_education?: string | null
          highest_grade?: string | null
          id?: string
          opportunity_types?: string[]
          physical_address?: string | null
          qualifications?: string | null
          reference_code?: string
          skills_to_learn?: string | null
          status?: Database["public"]["Enums"]["apprentice_status"]
          terms_accepted_at?: string | null
          terms_version?: string | null
          town: string
          transport_available?: boolean | null
          updated_at?: string
          user_id?: string | null
          whatsapp_number?: string | null
          why_interested?: string | null
        }
        Update: {
          availability?: string[]
          career_interests?: string[]
          certificates?: string | null
          contact_number?: string | null
          created_at?: string
          cv_url?: string | null
          dob?: string
          drivers_licence?: boolean | null
          email?: string | null
          full_name?: string
          further_education?: string | null
          highest_grade?: string | null
          id?: string
          opportunity_types?: string[]
          physical_address?: string | null
          qualifications?: string | null
          reference_code?: string
          skills_to_learn?: string | null
          status?: Database["public"]["Enums"]["apprentice_status"]
          terms_accepted_at?: string | null
          terms_version?: string | null
          town?: string
          transport_available?: boolean | null
          updated_at?: string
          user_id?: string | null
          whatsapp_number?: string | null
          why_interested?: string | null
        }
        Relationships: []
      }
      apprenticeship_opportunities: {
        Row: {
          approved: boolean
          created_at: string
          description: string | null
          duration: string | null
          id: string
          industry: string
          min_age: number | null
          paid: boolean
          placements_available: number
          preferred_qualifications: string | null
          provider_id: string
          safety_requirements: string | null
          skills_offered: string[]
          start_date: string | null
          status: Database["public"]["Enums"]["opportunity_status"]
          stipend_amount: number | null
          title: string
          town: string | null
          transport_requirements: string | null
          updated_at: string
        }
        Insert: {
          approved?: boolean
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          industry: string
          min_age?: number | null
          paid?: boolean
          placements_available?: number
          preferred_qualifications?: string | null
          provider_id: string
          safety_requirements?: string | null
          skills_offered?: string[]
          start_date?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          stipend_amount?: number | null
          title: string
          town?: string | null
          transport_requirements?: string | null
          updated_at?: string
        }
        Update: {
          approved?: boolean
          created_at?: string
          description?: string | null
          duration?: string | null
          id?: string
          industry?: string
          min_age?: number | null
          paid?: boolean
          placements_available?: number
          preferred_qualifications?: string | null
          provider_id?: string
          safety_requirements?: string | null
          skills_offered?: string[]
          start_date?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          stipend_amount?: number | null
          title?: string
          town?: string | null
          transport_requirements?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "apprenticeship_opportunities_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "apprenticeship_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      apprenticeship_providers: {
        Row: {
          contact_number: string
          contact_person: string
          created_at: string
          email: string
          id: string
          organisation_name: string
          physical_address: string | null
          provider_type: string
          status: Database["public"]["Enums"]["provider_app_status"]
          terms_accepted_at: string | null
          terms_version: string | null
          town: string
          updated_at: string
          user_id: string | null
          website: string | null
        }
        Insert: {
          contact_number: string
          contact_person: string
          created_at?: string
          email: string
          id?: string
          organisation_name: string
          physical_address?: string | null
          provider_type: string
          status?: Database["public"]["Enums"]["provider_app_status"]
          terms_accepted_at?: string | null
          terms_version?: string | null
          town: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Update: {
          contact_number?: string
          contact_person?: string
          created_at?: string
          email?: string
          id?: string
          organisation_name?: string
          physical_address?: string | null
          provider_type?: string
          status?: Database["public"]["Enums"]["provider_app_status"]
          terms_accepted_at?: string | null
          terms_version?: string | null
          town?: string
          updated_at?: string
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
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
      mentor_matches: {
        Row: {
          apprentice_id: string | null
          created_at: string
          id: string
          mentor_id: string
          notes: string | null
          status: Database["public"]["Enums"]["mentor_match_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          apprentice_id?: string | null
          created_at?: string
          id?: string
          mentor_id: string
          notes?: string | null
          status?: Database["public"]["Enums"]["mentor_match_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          apprentice_id?: string | null
          created_at?: string
          id?: string
          mentor_id?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["mentor_match_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentor_matches_apprentice_id_fkey"
            columns: ["apprentice_id"]
            isOneToOne: false
            referencedRelation: "apprentices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_matches_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentor_matches_mentor_id_fkey"
            columns: ["mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors_public"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors: {
        Row: {
          approved: boolean
          availability: string | null
          biography: string | null
          categories: string[]
          contact_number: string
          created_at: string
          email: string
          formats: string[]
          full_name: string
          id: string
          is_knowledge_keeper: boolean
          knowledge_keeper_categories: string[]
          professional_background: string | null
          status: Database["public"]["Enums"]["mentor_status"]
          terms_accepted_at: string | null
          terms_version: string | null
          town: string | null
          updated_at: string
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          approved?: boolean
          availability?: string | null
          biography?: string | null
          categories?: string[]
          contact_number: string
          created_at?: string
          email: string
          formats?: string[]
          full_name: string
          id?: string
          is_knowledge_keeper?: boolean
          knowledge_keeper_categories?: string[]
          professional_background?: string | null
          status?: Database["public"]["Enums"]["mentor_status"]
          terms_accepted_at?: string | null
          terms_version?: string | null
          town?: string | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          approved?: boolean
          availability?: string | null
          biography?: string | null
          categories?: string[]
          contact_number?: string
          created_at?: string
          email?: string
          formats?: string[]
          full_name?: string
          id?: string
          is_knowledge_keeper?: boolean
          knowledge_keeper_categories?: string[]
          professional_background?: string | null
          status?: Database["public"]["Enums"]["mentor_status"]
          terms_accepted_at?: string | null
          terms_version?: string | null
          town?: string | null
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
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
      youth_applications: {
        Row: {
          completed_at: string | null
          created_at: string
          hours_logged: number
          id: string
          notes: string | null
          opportunity_id: string | null
          status: Database["public"]["Enums"]["youth_application_status"]
          updated_at: string
          youth_profile_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          hours_logged?: number
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          status?: Database["public"]["Enums"]["youth_application_status"]
          updated_at?: string
          youth_profile_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          hours_logged?: number
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          status?: Database["public"]["Enums"]["youth_application_status"]
          updated_at?: string
          youth_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youth_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "youth_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youth_applications_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "youth_opportunities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youth_applications_youth_profile_id_fkey"
            columns: ["youth_profile_id"]
            isOneToOne: false
            referencedRelation: "youth_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      youth_badges: {
        Row: {
          awarded_at: string
          awarded_by: string | null
          badge_key: Database["public"]["Enums"]["youth_badge_key"]
          id: string
          notes: string | null
          youth_profile_id: string
        }
        Insert: {
          awarded_at?: string
          awarded_by?: string | null
          badge_key: Database["public"]["Enums"]["youth_badge_key"]
          id?: string
          notes?: string | null
          youth_profile_id: string
        }
        Update: {
          awarded_at?: string
          awarded_by?: string | null
          badge_key?: Database["public"]["Enums"]["youth_badge_key"]
          id?: string
          notes?: string | null
          youth_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youth_badges_youth_profile_id_fkey"
            columns: ["youth_profile_id"]
            isOneToOne: false
            referencedRelation: "youth_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      youth_opportunities: {
        Row: {
          approval_notes: string | null
          category: Database["public"]["Enums"]["youth_opportunity_category"]
          child_safe_reviewed: boolean
          closing_date: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          created_at: string
          description: string
          end_date: string | null
          hazardous_flag: boolean
          id: string
          linked_programme: string | null
          max_age: number
          min_age: number
          opportunity_type: string
          organisation_name: string
          posted_by_user_id: string | null
          prohibited_for_minors: boolean
          start_date: string | null
          status: Database["public"]["Enums"]["youth_opportunity_status"]
          title: string
          town: string
          updated_at: string
        }
        Insert: {
          approval_notes?: string | null
          category: Database["public"]["Enums"]["youth_opportunity_category"]
          child_safe_reviewed?: boolean
          closing_date?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description: string
          end_date?: string | null
          hazardous_flag?: boolean
          id?: string
          linked_programme?: string | null
          max_age?: number
          min_age?: number
          opportunity_type: string
          organisation_name: string
          posted_by_user_id?: string | null
          prohibited_for_minors?: boolean
          start_date?: string | null
          status?: Database["public"]["Enums"]["youth_opportunity_status"]
          title: string
          town: string
          updated_at?: string
        }
        Update: {
          approval_notes?: string | null
          category?: Database["public"]["Enums"]["youth_opportunity_category"]
          child_safe_reviewed?: boolean
          closing_date?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string
          description?: string
          end_date?: string | null
          hazardous_flag?: boolean
          id?: string
          linked_programme?: string | null
          max_age?: number
          min_age?: number
          opportunity_type?: string
          organisation_name?: string
          posted_by_user_id?: string | null
          prohibited_for_minors?: boolean
          start_date?: string | null
          status?: Database["public"]["Enums"]["youth_opportunity_status"]
          title?: string
          town?: string
          updated_at?: string
        }
        Relationships: []
      }
      youth_profiles: {
        Row: {
          age_group: string | null
          application_code: string
          availability: string[]
          created_at: string
          dob: string
          education_level: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          full_name: string
          guardian_consent_at: string | null
          guardian_consent_given: boolean
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          guardian_relationship: string | null
          id: string
          interests: string[]
          languages: string[]
          learning_city_interest: boolean
          mentor_match_opt_in: boolean
          mobile_number: string | null
          notes_admin: string | null
          opportunity_types: string[]
          school: string | null
          skills: string[]
          status: Database["public"]["Enums"]["youth_status"]
          terms_accepted_at: string | null
          terms_version_accepted: string | null
          town: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          age_group?: string | null
          application_code?: string
          availability?: string[]
          created_at?: string
          dob: string
          education_level?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name: string
          guardian_consent_at?: string | null
          guardian_consent_given?: boolean
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relationship?: string | null
          id?: string
          interests?: string[]
          languages?: string[]
          learning_city_interest?: boolean
          mentor_match_opt_in?: boolean
          mobile_number?: string | null
          notes_admin?: string | null
          opportunity_types?: string[]
          school?: string | null
          skills?: string[]
          status?: Database["public"]["Enums"]["youth_status"]
          terms_accepted_at?: string | null
          terms_version_accepted?: string | null
          town: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          age_group?: string | null
          application_code?: string
          availability?: string[]
          created_at?: string
          dob?: string
          education_level?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          full_name?: string
          guardian_consent_at?: string | null
          guardian_consent_given?: boolean
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relationship?: string | null
          id?: string
          interests?: string[]
          languages?: string[]
          learning_city_interest?: boolean
          mentor_match_opt_in?: boolean
          mobile_number?: string | null
          notes_admin?: string | null
          opportunity_types?: string[]
          school?: string | null
          skills?: string[]
          status?: Database["public"]["Enums"]["youth_status"]
          terms_accepted_at?: string | null
          terms_version_accepted?: string | null
          town?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      youth_references: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          opportunity_id: string | null
          reference_contact: string
          reference_name: string
          relationship: string | null
          updated_at: string
          youth_profile_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          reference_contact: string
          reference_name: string
          relationship?: string | null
          updated_at?: string
          youth_profile_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          opportunity_id?: string | null
          reference_contact?: string
          reference_name?: string
          relationship?: string | null
          updated_at?: string
          youth_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youth_references_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "youth_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youth_references_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "youth_opportunities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youth_references_youth_profile_id_fkey"
            columns: ["youth_profile_id"]
            isOneToOne: false
            referencedRelation: "youth_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      youth_training: {
        Row: {
          certificate_url: string | null
          completed_at: string | null
          course_name: string
          created_at: string
          id: string
          provider: string | null
          updated_at: string
          verified_by_admin: boolean
          youth_profile_id: string
        }
        Insert: {
          certificate_url?: string | null
          completed_at?: string | null
          course_name: string
          created_at?: string
          id?: string
          provider?: string | null
          updated_at?: string
          verified_by_admin?: boolean
          youth_profile_id: string
        }
        Update: {
          certificate_url?: string | null
          completed_at?: string | null
          course_name?: string
          created_at?: string
          id?: string
          provider?: string | null
          updated_at?: string
          verified_by_admin?: boolean
          youth_profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "youth_training_youth_profile_id_fkey"
            columns: ["youth_profile_id"]
            isOneToOne: false
            referencedRelation: "youth_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      apprenticeship_opportunities_public: {
        Row: {
          created_at: string | null
          description: string | null
          duration: string | null
          id: string | null
          industry: string | null
          min_age: number | null
          paid: boolean | null
          placements_available: number | null
          preferred_qualifications: string | null
          safety_requirements: string | null
          skills_offered: string[] | null
          start_date: string | null
          status: Database["public"]["Enums"]["opportunity_status"] | null
          stipend_amount: number | null
          title: string | null
          town: string | null
          transport_requirements: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string | null
          industry?: string | null
          min_age?: number | null
          paid?: boolean | null
          placements_available?: number | null
          preferred_qualifications?: string | null
          safety_requirements?: string | null
          skills_offered?: string[] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          stipend_amount?: number | null
          title?: string | null
          town?: string | null
          transport_requirements?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: string | null
          id?: string | null
          industry?: string | null
          min_age?: number | null
          paid?: boolean | null
          placements_available?: number | null
          preferred_qualifications?: string | null
          safety_requirements?: string | null
          skills_offered?: string[] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          stipend_amount?: number | null
          title?: string | null
          town?: string | null
          transport_requirements?: string | null
        }
        Relationships: []
      }
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
      mentors_public: {
        Row: {
          availability: string | null
          biography: string | null
          categories: string[] | null
          created_at: string | null
          formats: string[] | null
          full_name: string | null
          id: string | null
          is_knowledge_keeper: boolean | null
          knowledge_keeper_categories: string[] | null
          professional_background: string | null
          town: string | null
          years_experience: number | null
        }
        Insert: {
          availability?: string | null
          biography?: string | null
          categories?: string[] | null
          created_at?: string | null
          formats?: string[] | null
          full_name?: string | null
          id?: string | null
          is_knowledge_keeper?: boolean | null
          knowledge_keeper_categories?: string[] | null
          professional_background?: string | null
          town?: string | null
          years_experience?: number | null
        }
        Update: {
          availability?: string | null
          biography?: string | null
          categories?: string[] | null
          created_at?: string | null
          formats?: string[] | null
          full_name?: string | null
          id?: string | null
          is_knowledge_keeper?: boolean | null
          knowledge_keeper_categories?: string[] | null
          professional_background?: string | null
          town?: string | null
          years_experience?: number | null
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
      youth_opportunities_public: {
        Row: {
          category:
            | Database["public"]["Enums"]["youth_opportunity_category"]
            | null
          closing_date: string | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string | null
          linked_programme: string | null
          max_age: number | null
          min_age: number | null
          opportunity_type: string | null
          organisation_name: string | null
          prohibited_for_minors: boolean | null
          start_date: string | null
          title: string | null
          town: string | null
        }
        Insert: {
          category?:
            | Database["public"]["Enums"]["youth_opportunity_category"]
            | null
          closing_date?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string | null
          linked_programme?: string | null
          max_age?: number | null
          min_age?: number | null
          opportunity_type?: string | null
          organisation_name?: string | null
          prohibited_for_minors?: boolean | null
          start_date?: string | null
          title?: string | null
          town?: string | null
        }
        Update: {
          category?:
            | Database["public"]["Enums"]["youth_opportunity_category"]
            | null
          closing_date?: string | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string | null
          linked_programme?: string | null
          max_age?: number | null
          min_age?: number | null
          opportunity_type?: string | null
          organisation_name?: string | null
          prohibited_for_minors?: boolean | null
          start_date?: string | null
          title?: string | null
          town?: string | null
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
      youth_age_group: { Args: { _dob: string }; Returns: string }
    }
    Enums: {
      app_role: "admin" | "user"
      application_status:
        | "submitted"
        | "interview"
        | "placed"
        | "completed"
        | "declined"
      apprentice_status:
        | "registered"
        | "reviewed"
        | "interview"
        | "matched"
        | "active"
        | "completed"
      availability_type: "full_time" | "part_time" | "casual" | "temporary"
      donation_frequency: "once_off" | "monthly"
      donation_purpose: "general" | "sponsor_vetting"
      mentor_match_status:
        | "requested"
        | "approved"
        | "active"
        | "completed"
        | "declined"
      mentor_status: "pending" | "approved" | "active" | "inactive"
      opportunity_status: "open" | "reviewing" | "filled" | "closed"
      payment_status: "pending" | "succeeded" | "failed" | "refunded"
      provider_app_status: "pending" | "approved" | "rejected"
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
      youth_application_status:
        | "interested"
        | "applied"
        | "shortlisted"
        | "placed"
        | "completed"
        | "withdrawn"
      youth_badge_key:
        | "community_volunteer"
        | "first_job_completed"
        | "reliable_worker"
        | "environmental_champion"
        | "hospitality_helper"
        | "digital_skills_learner"
        | "community_leader"
      youth_opportunity_category:
        | "paid"
        | "volunteer"
        | "training"
        | "internship"
        | "community_service"
      youth_opportunity_status: "pending" | "approved" | "rejected" | "closed"
      youth_status: "pending" | "approved" | "on_hold" | "rejected"
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
      application_status: [
        "submitted",
        "interview",
        "placed",
        "completed",
        "declined",
      ],
      apprentice_status: [
        "registered",
        "reviewed",
        "interview",
        "matched",
        "active",
        "completed",
      ],
      availability_type: ["full_time", "part_time", "casual", "temporary"],
      donation_frequency: ["once_off", "monthly"],
      donation_purpose: ["general", "sponsor_vetting"],
      mentor_match_status: [
        "requested",
        "approved",
        "active",
        "completed",
        "declined",
      ],
      mentor_status: ["pending", "approved", "active", "inactive"],
      opportunity_status: ["open", "reviewing", "filled", "closed"],
      payment_status: ["pending", "succeeded", "failed", "refunded"],
      provider_app_status: ["pending", "approved", "rejected"],
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
      youth_application_status: [
        "interested",
        "applied",
        "shortlisted",
        "placed",
        "completed",
        "withdrawn",
      ],
      youth_badge_key: [
        "community_volunteer",
        "first_job_completed",
        "reliable_worker",
        "environmental_champion",
        "hospitality_helper",
        "digital_skills_learner",
        "community_leader",
      ],
      youth_opportunity_category: [
        "paid",
        "volunteer",
        "training",
        "internship",
        "community_service",
      ],
      youth_opportunity_status: ["pending", "approved", "rejected", "closed"],
      youth_status: ["pending", "approved", "on_hold", "rejected"],
    },
  },
} as const
