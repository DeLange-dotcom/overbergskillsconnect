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
            foreignKeyName: "apprentice_applications_apprentice_id_fkey"
            columns: ["apprentice_id"]
            isOneToOne: false
            referencedRelation: "apprentices_public"
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
      apprentice_skills: {
        Row: {
          apprentice_id: string
          created_at: string
          id: string
          level: string | null
          skill: string
          updated_at: string
        }
        Insert: {
          apprentice_id: string
          created_at?: string
          id?: string
          level?: string | null
          skill: string
          updated_at?: string
        }
        Update: {
          apprentice_id?: string
          created_at?: string
          id?: string
          level?: string | null
          skill?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "apprentice_skills_apprentice_id_fkey"
            columns: ["apprentice_id"]
            isOneToOne: false
            referencedRelation: "apprentices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "apprentice_skills_apprentice_id_fkey"
            columns: ["apprentice_id"]
            isOneToOne: false
            referencedRelation: "apprentices_public"
            referencedColumns: ["id"]
          },
        ]
      }
      apprentices: {
        Row: {
          availability: string[]
          career_interests: string[]
          category: string | null
          certificates: string | null
          contact_number: string | null
          created_at: string
          cv_path: string | null
          cv_url: string | null
          disclaimer_accepted_at: string | null
          dob: string
          drivers_licence: boolean | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          emergency_contact_relationship: string | null
          full_name: string
          further_education: string | null
          highest_grade: string | null
          id: string
          identity_verified: boolean
          interview_completed: boolean
          is_archived: boolean
          is_published: boolean
          is_suspended: boolean
          languages: string[]
          location_pref: string | null
          nationality: string | null
          opportunity_types: string[]
          organisation_id: string | null
          parent_consent_uploaded_path: string | null
          parent_email: string | null
          parent_full_name: string | null
          parent_phone: string | null
          parent_relationship: string | null
          pcc_admin_notes: string | null
          pcc_certificate_path: string | null
          pcc_expiry_review_date: string | null
          pcc_issue_date: string | null
          pcc_number: string | null
          pcc_status: Database["public"]["Enums"]["pcc_status"] | null
          pcc_verified: boolean
          pcc_verified_at: string | null
          pcc_verified_by: string | null
          pcc_wants_assistance: boolean
          physical_address: string | null
          profile_photo_url: string | null
          qualifications: string | null
          reference_code: string
          references_checked: boolean
          safeguarding_acknowledged_at: string | null
          safeguarding_policy_version: string | null
          short_bio: string | null
          skills_to_learn: string | null
          status: Database["public"]["Enums"]["apprentice_status"]
          terms_accepted_at: string | null
          terms_version: string | null
          town: string
          transport_available: boolean | null
          updated_at: string
          user_id: string | null
          verification_level: Database["public"]["Enums"]["verification_level"]
          whatsapp_number: string | null
          why_interested: string | null
          willing_to_relocate: boolean | null
          work_permit_required: boolean
          work_permit_status: string | null
          work_permit_verified: boolean
        }
        Insert: {
          availability?: string[]
          career_interests?: string[]
          category?: string | null
          certificates?: string | null
          contact_number?: string | null
          created_at?: string
          cv_path?: string | null
          cv_url?: string | null
          disclaimer_accepted_at?: string | null
          dob: string
          drivers_licence?: boolean | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          full_name: string
          further_education?: string | null
          highest_grade?: string | null
          id?: string
          identity_verified?: boolean
          interview_completed?: boolean
          is_archived?: boolean
          is_published?: boolean
          is_suspended?: boolean
          languages?: string[]
          location_pref?: string | null
          nationality?: string | null
          opportunity_types?: string[]
          organisation_id?: string | null
          parent_consent_uploaded_path?: string | null
          parent_email?: string | null
          parent_full_name?: string | null
          parent_phone?: string | null
          parent_relationship?: string | null
          pcc_admin_notes?: string | null
          pcc_certificate_path?: string | null
          pcc_expiry_review_date?: string | null
          pcc_issue_date?: string | null
          pcc_number?: string | null
          pcc_status?: Database["public"]["Enums"]["pcc_status"] | null
          pcc_verified?: boolean
          pcc_verified_at?: string | null
          pcc_verified_by?: string | null
          pcc_wants_assistance?: boolean
          physical_address?: string | null
          profile_photo_url?: string | null
          qualifications?: string | null
          reference_code?: string
          references_checked?: boolean
          safeguarding_acknowledged_at?: string | null
          safeguarding_policy_version?: string | null
          short_bio?: string | null
          skills_to_learn?: string | null
          status?: Database["public"]["Enums"]["apprentice_status"]
          terms_accepted_at?: string | null
          terms_version?: string | null
          town: string
          transport_available?: boolean | null
          updated_at?: string
          user_id?: string | null
          verification_level?: Database["public"]["Enums"]["verification_level"]
          whatsapp_number?: string | null
          why_interested?: string | null
          willing_to_relocate?: boolean | null
          work_permit_required?: boolean
          work_permit_status?: string | null
          work_permit_verified?: boolean
        }
        Update: {
          availability?: string[]
          career_interests?: string[]
          category?: string | null
          certificates?: string | null
          contact_number?: string | null
          created_at?: string
          cv_path?: string | null
          cv_url?: string | null
          disclaimer_accepted_at?: string | null
          dob?: string
          drivers_licence?: boolean | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          emergency_contact_relationship?: string | null
          full_name?: string
          further_education?: string | null
          highest_grade?: string | null
          id?: string
          identity_verified?: boolean
          interview_completed?: boolean
          is_archived?: boolean
          is_published?: boolean
          is_suspended?: boolean
          languages?: string[]
          location_pref?: string | null
          nationality?: string | null
          opportunity_types?: string[]
          organisation_id?: string | null
          parent_consent_uploaded_path?: string | null
          parent_email?: string | null
          parent_full_name?: string | null
          parent_phone?: string | null
          parent_relationship?: string | null
          pcc_admin_notes?: string | null
          pcc_certificate_path?: string | null
          pcc_expiry_review_date?: string | null
          pcc_issue_date?: string | null
          pcc_number?: string | null
          pcc_status?: Database["public"]["Enums"]["pcc_status"] | null
          pcc_verified?: boolean
          pcc_verified_at?: string | null
          pcc_verified_by?: string | null
          pcc_wants_assistance?: boolean
          physical_address?: string | null
          profile_photo_url?: string | null
          qualifications?: string | null
          reference_code?: string
          references_checked?: boolean
          safeguarding_acknowledged_at?: string | null
          safeguarding_policy_version?: string | null
          short_bio?: string | null
          skills_to_learn?: string | null
          status?: Database["public"]["Enums"]["apprentice_status"]
          terms_accepted_at?: string | null
          terms_version?: string | null
          town?: string
          transport_available?: boolean | null
          updated_at?: string
          user_id?: string | null
          verification_level?: Database["public"]["Enums"]["verification_level"]
          whatsapp_number?: string | null
          why_interested?: string | null
          willing_to_relocate?: boolean | null
          work_permit_required?: boolean
          work_permit_status?: string | null
          work_permit_verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "apprentices_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      apprenticeship_opportunities: {
        Row: {
          age_max: number | null
          age_min: number | null
          approved: boolean
          compensation_amount: number | null
          compensation_type: string | null
          created_at: string
          description: string | null
          duration: string | null
          hours_per_week: number | null
          id: string
          industry: string
          is_published: boolean | null
          min_age: number | null
          organisation_id: string | null
          paid: boolean
          placements_available: number
          preferred_qualifications: string | null
          provider_id: string
          remote_available: boolean | null
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
          age_max?: number | null
          age_min?: number | null
          approved?: boolean
          compensation_amount?: number | null
          compensation_type?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          hours_per_week?: number | null
          id?: string
          industry: string
          is_published?: boolean | null
          min_age?: number | null
          organisation_id?: string | null
          paid?: boolean
          placements_available?: number
          preferred_qualifications?: string | null
          provider_id: string
          remote_available?: boolean | null
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
          age_max?: number | null
          age_min?: number | null
          approved?: boolean
          compensation_amount?: number | null
          compensation_type?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          hours_per_week?: number | null
          id?: string
          industry?: string
          is_published?: boolean | null
          min_age?: number | null
          organisation_id?: string | null
          paid?: boolean
          placements_available?: number
          preferred_qualifications?: string | null
          provider_id?: string
          remote_available?: boolean | null
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
            foreignKeyName: "apprenticeship_opportunities_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
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
          disclaimer_accepted_at: string | null
          email: string
          id: string
          organisation_id: string | null
          organisation_name: string
          physical_address: string | null
          provider_type: string
          safeguarding_acknowledged_at: string | null
          safeguarding_policy_version: string | null
          status: Database["public"]["Enums"]["provider_app_status"]
          terms_accepted_at: string | null
          terms_version: string | null
          town: string
          updated_at: string
          user_id: string | null
          verification_doc_path: string | null
          website: string | null
        }
        Insert: {
          contact_number: string
          contact_person: string
          created_at?: string
          disclaimer_accepted_at?: string | null
          email: string
          id?: string
          organisation_id?: string | null
          organisation_name: string
          physical_address?: string | null
          provider_type: string
          safeguarding_acknowledged_at?: string | null
          safeguarding_policy_version?: string | null
          status?: Database["public"]["Enums"]["provider_app_status"]
          terms_accepted_at?: string | null
          terms_version?: string | null
          town: string
          updated_at?: string
          user_id?: string | null
          verification_doc_path?: string | null
          website?: string | null
        }
        Update: {
          contact_number?: string
          contact_person?: string
          created_at?: string
          disclaimer_accepted_at?: string | null
          email?: string
          id?: string
          organisation_id?: string | null
          organisation_name?: string
          physical_address?: string | null
          provider_type?: string
          safeguarding_acknowledged_at?: string | null
          safeguarding_policy_version?: string | null
          status?: Database["public"]["Enums"]["provider_app_status"]
          terms_accepted_at?: string | null
          terms_version?: string | null
          town?: string
          updated_at?: string
          user_id?: string | null
          verification_doc_path?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "apprenticeship_providers_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
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
          applicant_id: string | null
          applicant_type: string
          category: string | null
          created_at: string
          disclaimer_accepted_at: string | null
          id: string
          message: string | null
          organisation_id: string | null
          reason: string | null
          requester_contact: string
          requester_email: string | null
          requester_name: string
          service_provider_id: string
          status: string
          terms_accepted_at: string | null
          terms_version_accepted: string | null
          visitor_phone: string | null
        }
        Insert: {
          admin_notes?: string | null
          applicant_id?: string | null
          applicant_type?: string
          category?: string | null
          created_at?: string
          disclaimer_accepted_at?: string | null
          id?: string
          message?: string | null
          organisation_id?: string | null
          reason?: string | null
          requester_contact: string
          requester_email?: string | null
          requester_name: string
          service_provider_id: string
          status?: string
          terms_accepted_at?: string | null
          terms_version_accepted?: string | null
          visitor_phone?: string | null
        }
        Update: {
          admin_notes?: string | null
          applicant_id?: string | null
          applicant_type?: string
          category?: string | null
          created_at?: string
          disclaimer_accepted_at?: string | null
          id?: string
          message?: string | null
          organisation_id?: string | null
          reason?: string | null
          requester_contact?: string
          requester_email?: string | null
          requester_name?: string
          service_provider_id?: string
          status?: string
          terms_accepted_at?: string | null
          terms_version_accepted?: string | null
          visitor_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_requests_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
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
          {
            foreignKeyName: "contact_requests_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers_public"
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
          organisation_id: string | null
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
          organisation_id?: string | null
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
          organisation_id?: string | null
          payment_provider?: string | null
          payment_reference?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"]
          phone?: string | null
          purpose?: Database["public"]["Enums"]["donation_purpose"]
        }
        Relationships: [
          {
            foreignKeyName: "donations_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      feedback_requests: {
        Row: {
          applicant_id: string
          applicant_type: string
          completed_at: string | null
          contact_request_id: string
          created_at: string
          id: string
          scheduled_for: string
          sent_at: string | null
          token: string
          visitor_email: string
        }
        Insert: {
          applicant_id: string
          applicant_type: string
          completed_at?: string | null
          contact_request_id: string
          created_at?: string
          id?: string
          scheduled_for: string
          sent_at?: string | null
          token?: string
          visitor_email: string
        }
        Update: {
          applicant_id?: string
          applicant_type?: string
          completed_at?: string | null
          contact_request_id?: string
          created_at?: string
          id?: string
          scheduled_for?: string
          sent_at?: string | null
          token?: string
          visitor_email?: string
        }
        Relationships: [
          {
            foreignKeyName: "feedback_requests_contact_request_id_fkey"
            columns: ["contact_request_id"]
            isOneToOne: false
            referencedRelation: "contact_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_responses: {
        Row: {
          applicant_id: string
          applicant_type: string
          comment: string | null
          communication: number | null
          created_at: string
          engaged: string
          feedback_request_id: string
          id: string
          punctuality: number | null
          reliability: number | null
          would_recommend: boolean | null
        }
        Insert: {
          applicant_id: string
          applicant_type: string
          comment?: string | null
          communication?: number | null
          created_at?: string
          engaged: string
          feedback_request_id: string
          id?: string
          punctuality?: number | null
          reliability?: number | null
          would_recommend?: boolean | null
        }
        Update: {
          applicant_id?: string
          applicant_type?: string
          comment?: string | null
          communication?: number | null
          created_at?: string
          engaged?: string
          feedback_request_id?: string
          id?: string
          punctuality?: number | null
          reliability?: number | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "feedback_responses_feedback_request_id_fkey"
            columns: ["feedback_request_id"]
            isOneToOne: true
            referencedRelation: "feedback_requests"
            referencedColumns: ["id"]
          },
        ]
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
            foreignKeyName: "mentor_matches_apprentice_id_fkey"
            columns: ["apprentice_id"]
            isOneToOne: false
            referencedRelation: "apprentices_public"
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
          disclaimer_accepted_at: string | null
          email: string
          formats: string[]
          full_name: string
          id: string
          is_knowledge_keeper: boolean
          knowledge_keeper_categories: string[]
          linkedin_url: string | null
          organisation_id: string | null
          pcc_path: string | null
          professional_background: string | null
          qualifications: string | null
          reference1_email: string | null
          reference1_name: string | null
          reference1_phone: string | null
          reference1_relationship: string | null
          reference2_email: string | null
          reference2_name: string | null
          reference2_phone: string | null
          reference2_relationship: string | null
          safeguarding_acknowledged_at: string | null
          safeguarding_policy_version: string | null
          status: Database["public"]["Enums"]["mentor_status"]
          terms_accepted_at: string | null
          terms_version: string | null
          town: string | null
          updated_at: string
          user_id: string | null
          website_url: string | null
          years_experience: number | null
        }
        Insert: {
          approved?: boolean
          availability?: string | null
          biography?: string | null
          categories?: string[]
          contact_number: string
          created_at?: string
          disclaimer_accepted_at?: string | null
          email: string
          formats?: string[]
          full_name: string
          id?: string
          is_knowledge_keeper?: boolean
          knowledge_keeper_categories?: string[]
          linkedin_url?: string | null
          organisation_id?: string | null
          pcc_path?: string | null
          professional_background?: string | null
          qualifications?: string | null
          reference1_email?: string | null
          reference1_name?: string | null
          reference1_phone?: string | null
          reference1_relationship?: string | null
          reference2_email?: string | null
          reference2_name?: string | null
          reference2_phone?: string | null
          reference2_relationship?: string | null
          safeguarding_acknowledged_at?: string | null
          safeguarding_policy_version?: string | null
          status?: Database["public"]["Enums"]["mentor_status"]
          terms_accepted_at?: string | null
          terms_version?: string | null
          town?: string | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Update: {
          approved?: boolean
          availability?: string | null
          biography?: string | null
          categories?: string[]
          contact_number?: string
          created_at?: string
          disclaimer_accepted_at?: string | null
          email?: string
          formats?: string[]
          full_name?: string
          id?: string
          is_knowledge_keeper?: boolean
          knowledge_keeper_categories?: string[]
          linkedin_url?: string | null
          organisation_id?: string | null
          pcc_path?: string | null
          professional_background?: string | null
          qualifications?: string | null
          reference1_email?: string | null
          reference1_name?: string | null
          reference1_phone?: string | null
          reference1_relationship?: string | null
          reference2_email?: string | null
          reference2_name?: string | null
          reference2_phone?: string | null
          reference2_relationship?: string | null
          safeguarding_acknowledged_at?: string | null
          safeguarding_policy_version?: string | null
          status?: Database["public"]["Enums"]["mentor_status"]
          terms_accepted_at?: string | null
          terms_version?: string | null
          town?: string | null
          updated_at?: string
          user_id?: string | null
          website_url?: string | null
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "mentors_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      mentors_interest: {
        Row: {
          admin_notes: string | null
          availability: string[] | null
          created_at: string
          email: string
          full_name: string
          id: string
          industry_experience: string | null
          mobile: string | null
          mode: string | null
          motivation: string | null
          skills: string[] | null
          status: string
          town: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          availability?: string[] | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          industry_experience?: string | null
          mobile?: string | null
          mode?: string | null
          motivation?: string | null
          skills?: string[] | null
          status?: string
          town?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          availability?: string[] | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          industry_experience?: string | null
          mobile?: string | null
          mode?: string | null
          motivation?: string | null
          skills?: string[] | null
          status?: string
          town?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      mentorship_requests: {
        Row: {
          admin_notes: string | null
          assigned_mentor_id: string | null
          career_interests: string[]
          created_at: string
          disclaimer_accepted_at: string | null
          email: string
          full_name: string
          goals: string | null
          id: string
          mobile: string | null
          organisation_id: string | null
          preferred_frequency: string | null
          preferred_mentor_id: string | null
          preferred_method: string | null
          safeguarding_acknowledged_at: string | null
          safeguarding_policy_version: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          assigned_mentor_id?: string | null
          career_interests?: string[]
          created_at?: string
          disclaimer_accepted_at?: string | null
          email: string
          full_name: string
          goals?: string | null
          id?: string
          mobile?: string | null
          organisation_id?: string | null
          preferred_frequency?: string | null
          preferred_mentor_id?: string | null
          preferred_method?: string | null
          safeguarding_acknowledged_at?: string | null
          safeguarding_policy_version?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          assigned_mentor_id?: string | null
          career_interests?: string[]
          created_at?: string
          disclaimer_accepted_at?: string | null
          email?: string
          full_name?: string
          goals?: string | null
          id?: string
          mobile?: string | null
          organisation_id?: string | null
          preferred_frequency?: string | null
          preferred_mentor_id?: string | null
          preferred_method?: string | null
          safeguarding_acknowledged_at?: string | null
          safeguarding_policy_version?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mentorship_requests_assigned_mentor_id_fkey"
            columns: ["assigned_mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_requests_assigned_mentor_id_fkey"
            columns: ["assigned_mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_requests_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_requests_preferred_mentor_id_fkey"
            columns: ["preferred_mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mentorship_requests_preferred_mentor_id_fkey"
            columns: ["preferred_mentor_id"]
            isOneToOne: false
            referencedRelation: "mentors_public"
            referencedColumns: ["id"]
          },
        ]
      }
      noticeboard_contact_requests: {
        Row: {
          consent_given_at: string | null
          created_at: string
          decided_at: string | null
          id: string
          message: string | null
          profile_id: string
          requester_contact: string
          requester_name: string
          requester_token: string
          requester_user_id: string | null
          revoked_at: string | null
          status: string
        }
        Insert: {
          consent_given_at?: string | null
          created_at?: string
          decided_at?: string | null
          id?: string
          message?: string | null
          profile_id: string
          requester_contact: string
          requester_name: string
          requester_token?: string
          requester_user_id?: string | null
          revoked_at?: string | null
          status?: string
        }
        Update: {
          consent_given_at?: string | null
          created_at?: string
          decided_at?: string | null
          id?: string
          message?: string | null
          profile_id?: string
          requester_contact?: string
          requester_name?: string
          requester_token?: string
          requester_user_id?: string | null
          revoked_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "noticeboard_contact_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "noticeboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noticeboard_contact_requests_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "noticeboard_public"
            referencedColumns: ["id"]
          },
        ]
      }
      noticeboard_lifecycle_events: {
        Row: {
          created_at: string
          details: Json
          event_type: string
          id: string
          profile_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          details?: Json
          event_type: string
          id?: string
          profile_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          details?: Json
          event_type?: string
          id?: string
          profile_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "noticeboard_lifecycle_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "noticeboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noticeboard_lifecycle_events_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "noticeboard_public"
            referencedColumns: ["id"]
          },
        ]
      }
      noticeboard_profiles: {
        Row: {
          accepted_terms: boolean
          archive_notice_sent_at: string | null
          archived_at: string | null
          availability: string | null
          category: string | null
          created_at: string
          deletion_notice_sent_at: string | null
          description: string
          id: string
          is_archived: boolean
          is_hidden: boolean
          is_suspended: boolean
          last_activity_at: string
          last_contact_request_at: string | null
          last_login_at: string | null
          manage_token: string
          name: string
          phone: string
          photo_url: string | null
          public_listing_reference: string | null
          renewal_reminder_sent_at: string | null
          skills: string[]
          town: string
          updated_at: string
          user_id: string | null
          years_experience: number | null
        }
        Insert: {
          accepted_terms?: boolean
          archive_notice_sent_at?: string | null
          archived_at?: string | null
          availability?: string | null
          category?: string | null
          created_at?: string
          deletion_notice_sent_at?: string | null
          description: string
          id?: string
          is_archived?: boolean
          is_hidden?: boolean
          is_suspended?: boolean
          last_activity_at?: string
          last_contact_request_at?: string | null
          last_login_at?: string | null
          manage_token?: string
          name: string
          phone: string
          photo_url?: string | null
          public_listing_reference?: string | null
          renewal_reminder_sent_at?: string | null
          skills?: string[]
          town: string
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Update: {
          accepted_terms?: boolean
          archive_notice_sent_at?: string | null
          archived_at?: string | null
          availability?: string | null
          category?: string | null
          created_at?: string
          deletion_notice_sent_at?: string | null
          description?: string
          id?: string
          is_archived?: boolean
          is_hidden?: boolean
          is_suspended?: boolean
          last_activity_at?: string
          last_contact_request_at?: string | null
          last_login_at?: string | null
          manage_token?: string
          name?: string
          phone?: string
          photo_url?: string | null
          public_listing_reference?: string | null
          renewal_reminder_sent_at?: string | null
          skills?: string[]
          town?: string
          updated_at?: string
          user_id?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      noticeboard_reports: {
        Row: {
          created_at: string
          details: string | null
          id: string
          profile_id: string
          reason: string
          reporter_contact: string | null
          status: string
        }
        Insert: {
          created_at?: string
          details?: string | null
          id?: string
          profile_id: string
          reason: string
          reporter_contact?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          details?: string | null
          id?: string
          profile_id?: string
          reason?: string
          reporter_contact?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "noticeboard_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "noticeboard_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noticeboard_reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "noticeboard_public"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read_at: string | null
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read_at?: string | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      opportunity_skills: {
        Row: {
          created_at: string
          id: string
          opportunity_id: string
          required: boolean
          skill: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          opportunity_id: string
          required?: boolean
          skill: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          opportunity_id?: string
          required?: boolean
          skill?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "opportunity_skills_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "apprenticeship_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "opportunity_skills_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "apprenticeship_opportunities_public"
            referencedColumns: ["id"]
          },
        ]
      }
      organisations: {
        Row: {
          contact_email: string | null
          created_at: string
          id: string
          is_active: boolean
          kind: Database["public"]["Enums"]["organisation_kind"]
          name: string
          region: string | null
          short_description: string | null
          slug: string
          updated_at: string
          website_url: string | null
        }
        Insert: {
          contact_email?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["organisation_kind"]
          name: string
          region?: string | null
          short_description?: string | null
          slug: string
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          contact_email?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          kind?: Database["public"]["Enums"]["organisation_kind"]
          name?: string
          region?: string | null
          short_description?: string | null
          slug?: string
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      placements: {
        Row: {
          apprentice_id: string
          created_at: string
          ended_at: string | null
          id: string
          notes: string | null
          opportunity_id: string
          organisation_id: string | null
          outcome: string | null
          provider_id: string | null
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          apprentice_id: string
          created_at?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          opportunity_id: string
          organisation_id?: string | null
          outcome?: string | null
          provider_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          apprentice_id?: string
          created_at?: string
          ended_at?: string | null
          id?: string
          notes?: string | null
          opportunity_id?: string
          organisation_id?: string | null
          outcome?: string | null
          provider_id?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "placements_apprentice_id_fkey"
            columns: ["apprentice_id"]
            isOneToOne: false
            referencedRelation: "apprentices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_apprentice_id_fkey"
            columns: ["apprentice_id"]
            isOneToOne: false
            referencedRelation: "apprentices_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "apprenticeship_opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "apprenticeship_opportunities_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "placements_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "apprenticeship_providers"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "provider_documents_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers_public"
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
          {
            foreignKeyName: "provider_references_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers_public"
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
          {
            foreignKeyName: "provider_vetting_checks_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers_public"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_reports: {
        Row: {
          admin_notes: string | null
          applicant_id: string
          applicant_type: string
          complaint_type: string
          created_at: string
          description: string
          id: string
          reporter_email: string | null
          reporter_name: string | null
          reporter_phone: string | null
          resolution_status: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          applicant_id: string
          applicant_type: string
          complaint_type: string
          created_at?: string
          description: string
          id?: string
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          resolution_status?: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          applicant_id?: string
          applicant_type?: string
          complaint_type?: string
          created_at?: string
          description?: string
          id?: string
          reporter_email?: string | null
          reporter_name?: string | null
          reporter_phone?: string | null
          resolution_status?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          admin_notes: string | null
          application_code: string
          available_immediately: boolean
          category: string | null
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
          identity_verified: boolean
          interview_completed: boolean
          is_archived: boolean
          is_published: boolean
          is_suspended: boolean
          languages: string[]
          looking_for: Database["public"]["Enums"]["availability_type"][]
          max_travel: Database["public"]["Enums"]["travel_distance"]
          mobile_number: string
          nationality: string
          organisation_id: string | null
          own_transport: boolean
          pcc_admin_notes: string | null
          pcc_certificate_path: string | null
          pcc_expiry_review_date: string | null
          pcc_issue_date: string | null
          pcc_number: string | null
          pcc_status: Database["public"]["Enums"]["pcc_status"] | null
          pcc_verified: boolean
          pcc_verified_at: string | null
          pcc_verified_by: string | null
          pcc_wants_assistance: boolean
          physical_address: string
          previous_employer: string | null
          profile_photo_url: string | null
          references_checked: boolean
          rejection_reason: string | null
          services: Database["public"]["Enums"]["service_category"][]
          short_bio: string | null
          skills_summary: string
          status: Database["public"]["Enums"]["provider_status"]
          terms_accepted_at: string | null
          terms_version_accepted: string | null
          town: string
          typical_hours: string[]
          updated_at: string
          user_id: string | null
          verification_level: Database["public"]["Enums"]["verification_level"]
          whatsapp_number: string | null
          work_permit_required: boolean
          work_permit_verified: boolean
          years_experience: number | null
        }
        Insert: {
          admin_notes?: string | null
          application_code?: string
          available_immediately?: boolean
          category?: string | null
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
          identity_verified?: boolean
          interview_completed?: boolean
          is_archived?: boolean
          is_published?: boolean
          is_suspended?: boolean
          languages?: string[]
          looking_for?: Database["public"]["Enums"]["availability_type"][]
          max_travel?: Database["public"]["Enums"]["travel_distance"]
          mobile_number: string
          nationality: string
          organisation_id?: string | null
          own_transport?: boolean
          pcc_admin_notes?: string | null
          pcc_certificate_path?: string | null
          pcc_expiry_review_date?: string | null
          pcc_issue_date?: string | null
          pcc_number?: string | null
          pcc_status?: Database["public"]["Enums"]["pcc_status"] | null
          pcc_verified?: boolean
          pcc_verified_at?: string | null
          pcc_verified_by?: string | null
          pcc_wants_assistance?: boolean
          physical_address: string
          previous_employer?: string | null
          profile_photo_url?: string | null
          references_checked?: boolean
          rejection_reason?: string | null
          services?: Database["public"]["Enums"]["service_category"][]
          short_bio?: string | null
          skills_summary: string
          status?: Database["public"]["Enums"]["provider_status"]
          terms_accepted_at?: string | null
          terms_version_accepted?: string | null
          town: string
          typical_hours?: string[]
          updated_at?: string
          user_id?: string | null
          verification_level?: Database["public"]["Enums"]["verification_level"]
          whatsapp_number?: string | null
          work_permit_required?: boolean
          work_permit_verified?: boolean
          years_experience?: number | null
        }
        Update: {
          admin_notes?: string | null
          application_code?: string
          available_immediately?: boolean
          category?: string | null
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
          identity_verified?: boolean
          interview_completed?: boolean
          is_archived?: boolean
          is_published?: boolean
          is_suspended?: boolean
          languages?: string[]
          looking_for?: Database["public"]["Enums"]["availability_type"][]
          max_travel?: Database["public"]["Enums"]["travel_distance"]
          mobile_number?: string
          nationality?: string
          organisation_id?: string | null
          own_transport?: boolean
          pcc_admin_notes?: string | null
          pcc_certificate_path?: string | null
          pcc_expiry_review_date?: string | null
          pcc_issue_date?: string | null
          pcc_number?: string | null
          pcc_status?: Database["public"]["Enums"]["pcc_status"] | null
          pcc_verified?: boolean
          pcc_verified_at?: string | null
          pcc_verified_by?: string | null
          pcc_wants_assistance?: boolean
          physical_address?: string
          previous_employer?: string | null
          profile_photo_url?: string | null
          references_checked?: boolean
          rejection_reason?: string | null
          services?: Database["public"]["Enums"]["service_category"][]
          short_bio?: string | null
          skills_summary?: string
          status?: Database["public"]["Enums"]["provider_status"]
          terms_accepted_at?: string | null
          terms_version_accepted?: string | null
          town?: string
          typical_hours?: string[]
          updated_at?: string
          user_id?: string | null
          verification_level?: Database["public"]["Enums"]["verification_level"]
          whatsapp_number?: string | null
          work_permit_required?: boolean
          work_permit_verified?: boolean
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "service_providers_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
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
          organisation_id: string | null
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
          organisation_id?: string | null
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
          organisation_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "service_requests_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
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
      user_profiles: {
        Row: {
          created_at: string
          full_name: string | null
          phone: string | null
          town: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          phone?: string | null
          town?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          phone?: string | null
          town?: string | null
          updated_at?: string
          user_id?: string
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
          {
            foreignKeyName: "vetting_pdf_exports_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers_public"
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
          organisation_id: string | null
          outcome: string | null
          outcome_notes: string | null
          outcome_updated_at: string | null
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
          organisation_id?: string | null
          outcome?: string | null
          outcome_notes?: string | null
          outcome_updated_at?: string | null
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
          organisation_id?: string | null
          outcome?: string | null
          outcome_notes?: string | null
          outcome_updated_at?: string | null
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
            foreignKeyName: "youth_applications_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youth_applications_youth_profile_id_fkey"
            columns: ["youth_profile_id"]
            isOneToOne: false
            referencedRelation: "youth_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "youth_applications_youth_profile_id_fkey"
            columns: ["youth_profile_id"]
            isOneToOne: false
            referencedRelation: "youth_profiles_public"
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
          {
            foreignKeyName: "youth_badges_youth_profile_id_fkey"
            columns: ["youth_profile_id"]
            isOneToOne: false
            referencedRelation: "youth_profiles_public"
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
          compensation_amount: number | null
          compensation_type: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_position: string | null
          created_at: string
          description: string
          end_date: string | null
          experience_required: string | null
          hazardous_flag: boolean
          id: string
          involves_chemicals: boolean | null
          involves_children: boolean | null
          involves_heights: boolean | null
          involves_home_visits: boolean | null
          involves_machinery: boolean | null
          involves_overnight: boolean | null
          involves_transport: boolean | null
          involves_vulnerable_adults: boolean | null
          linked_programme: string | null
          max_age: number
          min_age: number
          opportunity_type: string
          organisation_id: string | null
          organisation_name: string
          positions_available: number | null
          posted_by_user_id: string | null
          private_individual_address: string | null
          private_individual_id_url: string | null
          private_individual_phone_verified: boolean | null
          prohibited_for_minors: boolean
          provider_type: string | null
          requires_manual_review: boolean | null
          skills_required: string[] | null
          start_date: string | null
          status: Database["public"]["Enums"]["youth_opportunity_status"]
          title: string
          town: string
          updated_at: string
          verification_doc_type: string | null
          verification_doc_url: string | null
          website: string | null
        }
        Insert: {
          approval_notes?: string | null
          category: Database["public"]["Enums"]["youth_opportunity_category"]
          child_safe_reviewed?: boolean
          closing_date?: string | null
          compensation_amount?: number | null
          compensation_type?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_position?: string | null
          created_at?: string
          description: string
          end_date?: string | null
          experience_required?: string | null
          hazardous_flag?: boolean
          id?: string
          involves_chemicals?: boolean | null
          involves_children?: boolean | null
          involves_heights?: boolean | null
          involves_home_visits?: boolean | null
          involves_machinery?: boolean | null
          involves_overnight?: boolean | null
          involves_transport?: boolean | null
          involves_vulnerable_adults?: boolean | null
          linked_programme?: string | null
          max_age?: number
          min_age?: number
          opportunity_type: string
          organisation_id?: string | null
          organisation_name: string
          positions_available?: number | null
          posted_by_user_id?: string | null
          private_individual_address?: string | null
          private_individual_id_url?: string | null
          private_individual_phone_verified?: boolean | null
          prohibited_for_minors?: boolean
          provider_type?: string | null
          requires_manual_review?: boolean | null
          skills_required?: string[] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["youth_opportunity_status"]
          title: string
          town: string
          updated_at?: string
          verification_doc_type?: string | null
          verification_doc_url?: string | null
          website?: string | null
        }
        Update: {
          approval_notes?: string | null
          category?: Database["public"]["Enums"]["youth_opportunity_category"]
          child_safe_reviewed?: boolean
          closing_date?: string | null
          compensation_amount?: number | null
          compensation_type?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_position?: string | null
          created_at?: string
          description?: string
          end_date?: string | null
          experience_required?: string | null
          hazardous_flag?: boolean
          id?: string
          involves_chemicals?: boolean | null
          involves_children?: boolean | null
          involves_heights?: boolean | null
          involves_home_visits?: boolean | null
          involves_machinery?: boolean | null
          involves_overnight?: boolean | null
          involves_transport?: boolean | null
          involves_vulnerable_adults?: boolean | null
          linked_programme?: string | null
          max_age?: number
          min_age?: number
          opportunity_type?: string
          organisation_id?: string | null
          organisation_name?: string
          positions_available?: number | null
          posted_by_user_id?: string | null
          private_individual_address?: string | null
          private_individual_id_url?: string | null
          private_individual_phone_verified?: boolean | null
          prohibited_for_minors?: boolean
          provider_type?: string | null
          requires_manual_review?: boolean | null
          skills_required?: string[] | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["youth_opportunity_status"]
          title?: string
          town?: string
          updated_at?: string
          verification_doc_type?: string | null
          verification_doc_url?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "youth_opportunities_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
      }
      youth_profiles: {
        Row: {
          age_group: string | null
          applicant_declaration: boolean
          application_code: string
          availability: string[]
          category: string | null
          created_at: string
          currently_attending_school: boolean | null
          cv_url: string | null
          dob: string
          education_level: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string | null
          full_name: string
          further_education: string | null
          gender: string | null
          guardian_consent_at: string | null
          guardian_consent_given: boolean
          guardian_email: string | null
          guardian_name: string | null
          guardian_phone: string | null
          guardian_relationship: string | null
          highest_grade: string | null
          id: string
          id_document_url: string | null
          id_number: string | null
          identity_verified: boolean
          interests: string[]
          interview_completed: boolean
          is_archived: boolean
          is_published: boolean
          is_suspended: boolean
          languages: string[]
          last_name: string | null
          learning_city_interest: boolean
          liability_accepted: boolean
          matric_completed: boolean | null
          mentor_match_opt_in: boolean
          mobile_number: string | null
          notes_admin: string | null
          opportunity_types: string[]
          organisation_id: string | null
          parent_consent_form_url: string | null
          parent_consent_method: string | null
          parent_consent_signature: string | null
          parent_consent_signed_at: string | null
          parent_consent_status: string
          parent_consent_token: string | null
          parent_declaration: boolean
          parent_email: string | null
          parent_full_name: string | null
          parent_mobile: string | null
          parent_relationship: string | null
          pcc_admin_notes: string | null
          pcc_certificate_path: string | null
          pcc_document_url: string | null
          pcc_expiry_review_date: string | null
          pcc_issue_date: string | null
          pcc_number: string | null
          pcc_status: Database["public"]["Enums"]["pcc_status"] | null
          pcc_verified: boolean
          pcc_verified_at: string | null
          pcc_verified_by: string | null
          pcc_wants_assistance: boolean
          physical_address: string | null
          profile_photo_url: string | null
          references_checked: boolean
          school: string | null
          school_name: string | null
          short_bio: string | null
          skills: string[]
          status: Database["public"]["Enums"]["youth_status"]
          terms_accepted_at: string | null
          terms_version_accepted: string | null
          town: string
          updated_at: string
          user_id: string | null
          verification_level: Database["public"]["Enums"]["verification_level"]
          work_permit_required: boolean
          work_permit_verified: boolean
        }
        Insert: {
          age_group?: string | null
          applicant_declaration?: boolean
          application_code?: string
          availability?: string[]
          category?: string | null
          created_at?: string
          currently_attending_school?: boolean | null
          cv_url?: string | null
          dob: string
          education_level?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string | null
          full_name: string
          further_education?: string | null
          gender?: string | null
          guardian_consent_at?: string | null
          guardian_consent_given?: boolean
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relationship?: string | null
          highest_grade?: string | null
          id?: string
          id_document_url?: string | null
          id_number?: string | null
          identity_verified?: boolean
          interests?: string[]
          interview_completed?: boolean
          is_archived?: boolean
          is_published?: boolean
          is_suspended?: boolean
          languages?: string[]
          last_name?: string | null
          learning_city_interest?: boolean
          liability_accepted?: boolean
          matric_completed?: boolean | null
          mentor_match_opt_in?: boolean
          mobile_number?: string | null
          notes_admin?: string | null
          opportunity_types?: string[]
          organisation_id?: string | null
          parent_consent_form_url?: string | null
          parent_consent_method?: string | null
          parent_consent_signature?: string | null
          parent_consent_signed_at?: string | null
          parent_consent_status?: string
          parent_consent_token?: string | null
          parent_declaration?: boolean
          parent_email?: string | null
          parent_full_name?: string | null
          parent_mobile?: string | null
          parent_relationship?: string | null
          pcc_admin_notes?: string | null
          pcc_certificate_path?: string | null
          pcc_document_url?: string | null
          pcc_expiry_review_date?: string | null
          pcc_issue_date?: string | null
          pcc_number?: string | null
          pcc_status?: Database["public"]["Enums"]["pcc_status"] | null
          pcc_verified?: boolean
          pcc_verified_at?: string | null
          pcc_verified_by?: string | null
          pcc_wants_assistance?: boolean
          physical_address?: string | null
          profile_photo_url?: string | null
          references_checked?: boolean
          school?: string | null
          school_name?: string | null
          short_bio?: string | null
          skills?: string[]
          status?: Database["public"]["Enums"]["youth_status"]
          terms_accepted_at?: string | null
          terms_version_accepted?: string | null
          town: string
          updated_at?: string
          user_id?: string | null
          verification_level?: Database["public"]["Enums"]["verification_level"]
          work_permit_required?: boolean
          work_permit_verified?: boolean
        }
        Update: {
          age_group?: string | null
          applicant_declaration?: boolean
          application_code?: string
          availability?: string[]
          category?: string | null
          created_at?: string
          currently_attending_school?: boolean | null
          cv_url?: string | null
          dob?: string
          education_level?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string | null
          full_name?: string
          further_education?: string | null
          gender?: string | null
          guardian_consent_at?: string | null
          guardian_consent_given?: boolean
          guardian_email?: string | null
          guardian_name?: string | null
          guardian_phone?: string | null
          guardian_relationship?: string | null
          highest_grade?: string | null
          id?: string
          id_document_url?: string | null
          id_number?: string | null
          identity_verified?: boolean
          interests?: string[]
          interview_completed?: boolean
          is_archived?: boolean
          is_published?: boolean
          is_suspended?: boolean
          languages?: string[]
          last_name?: string | null
          learning_city_interest?: boolean
          liability_accepted?: boolean
          matric_completed?: boolean | null
          mentor_match_opt_in?: boolean
          mobile_number?: string | null
          notes_admin?: string | null
          opportunity_types?: string[]
          organisation_id?: string | null
          parent_consent_form_url?: string | null
          parent_consent_method?: string | null
          parent_consent_signature?: string | null
          parent_consent_signed_at?: string | null
          parent_consent_status?: string
          parent_consent_token?: string | null
          parent_declaration?: boolean
          parent_email?: string | null
          parent_full_name?: string | null
          parent_mobile?: string | null
          parent_relationship?: string | null
          pcc_admin_notes?: string | null
          pcc_certificate_path?: string | null
          pcc_document_url?: string | null
          pcc_expiry_review_date?: string | null
          pcc_issue_date?: string | null
          pcc_number?: string | null
          pcc_status?: Database["public"]["Enums"]["pcc_status"] | null
          pcc_verified?: boolean
          pcc_verified_at?: string | null
          pcc_verified_by?: string | null
          pcc_wants_assistance?: boolean
          physical_address?: string | null
          profile_photo_url?: string | null
          references_checked?: boolean
          school?: string | null
          school_name?: string | null
          short_bio?: string | null
          skills?: string[]
          status?: Database["public"]["Enums"]["youth_status"]
          terms_accepted_at?: string | null
          terms_version_accepted?: string | null
          town?: string
          updated_at?: string
          user_id?: string | null
          verification_level?: Database["public"]["Enums"]["verification_level"]
          work_permit_required?: boolean
          work_permit_verified?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "youth_profiles_organisation_id_fkey"
            columns: ["organisation_id"]
            isOneToOne: false
            referencedRelation: "organisations"
            referencedColumns: ["id"]
          },
        ]
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
          {
            foreignKeyName: "youth_references_youth_profile_id_fkey"
            columns: ["youth_profile_id"]
            isOneToOne: false
            referencedRelation: "youth_profiles_public"
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
          {
            foreignKeyName: "youth_training_youth_profile_id_fkey"
            columns: ["youth_profile_id"]
            isOneToOne: false
            referencedRelation: "youth_profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      applicant_reputation: {
        Row: {
          applicant_id: string | null
          applicant_type: string | null
          avg_rating: number | null
          recommend_pct: number | null
          review_count: number | null
        }
        Relationships: []
      }
      apprentices_public: {
        Row: {
          availability: string[] | null
          career_interests: string[] | null
          category: string | null
          created_at: string | null
          full_name: string | null
          id: string | null
          languages: string[] | null
          profile_photo_url: string | null
          short_bio: string | null
          town: string | null
          verification_level:
            | Database["public"]["Enums"]["verification_level"]
            | null
        }
        Insert: {
          availability?: string[] | null
          career_interests?: string[] | null
          category?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          languages?: string[] | null
          profile_photo_url?: string | null
          short_bio?: string | null
          town?: string | null
          verification_level?:
            | Database["public"]["Enums"]["verification_level"]
            | null
        }
        Update: {
          availability?: string[] | null
          career_interests?: string[] | null
          category?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string | null
          languages?: string[] | null
          profile_photo_url?: string | null
          short_bio?: string | null
          town?: string | null
          verification_level?:
            | Database["public"]["Enums"]["verification_level"]
            | null
        }
        Relationships: []
      }
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
      directory_profiles: {
        Row: {
          applicant_type: string | null
          area: string | null
          availability: string[] | null
          available_now: boolean | null
          category: string | null
          created_at: string | null
          first_name: string | null
          id: string | null
          languages: string[] | null
          profile_photo_url: string | null
          short_bio: string | null
          skills: string[] | null
          verification_level: string | null
        }
        Relationships: []
      }
      feedback_responses_public: {
        Row: {
          applicant_id: string | null
          applicant_type: string | null
          comment: string | null
          communication: number | null
          created_at: string | null
          engaged: string | null
          id: string | null
          punctuality: number | null
          reliability: number | null
          would_recommend: boolean | null
        }
        Insert: {
          applicant_id?: string | null
          applicant_type?: string | null
          comment?: string | null
          communication?: number | null
          created_at?: string | null
          engaged?: string | null
          id?: string | null
          punctuality?: number | null
          reliability?: number | null
          would_recommend?: boolean | null
        }
        Update: {
          applicant_id?: string | null
          applicant_type?: string | null
          comment?: string | null
          communication?: number | null
          created_at?: string | null
          engaged?: string | null
          id?: string | null
          punctuality?: number | null
          reliability?: number | null
          would_recommend?: boolean | null
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
      noticeboard_public: {
        Row: {
          availability: string | null
          category: string | null
          created_at: string | null
          description: string | null
          id: string | null
          name: string | null
          photo_url: string | null
          public_listing_reference: string | null
          skills: string[] | null
          town: string | null
          years_experience: number | null
        }
        Insert: {
          availability?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          photo_url?: string | null
          public_listing_reference?: string | null
          skills?: string[] | null
          town?: string | null
          years_experience?: number | null
        }
        Update: {
          availability?: string | null
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: string | null
          name?: string | null
          photo_url?: string | null
          public_listing_reference?: string | null
          skills?: string[] | null
          town?: string | null
          years_experience?: number | null
        }
        Relationships: []
      }
      service_providers_public: {
        Row: {
          available_immediately: boolean | null
          category: string | null
          created_at: string | null
          days_available: string[] | null
          display_name: string | null
          full_name: string | null
          id: string | null
          languages: string[] | null
          profile_photo_url: string | null
          services: Database["public"]["Enums"]["service_category"][] | null
          short_bio: string | null
          town: string | null
          verification_level:
            | Database["public"]["Enums"]["verification_level"]
            | null
          years_experience: number | null
        }
        Insert: {
          available_immediately?: boolean | null
          category?: string | null
          created_at?: string | null
          days_available?: string[] | null
          display_name?: string | null
          full_name?: string | null
          id?: string | null
          languages?: string[] | null
          profile_photo_url?: string | null
          services?: Database["public"]["Enums"]["service_category"][] | null
          short_bio?: string | null
          town?: string | null
          verification_level?:
            | Database["public"]["Enums"]["verification_level"]
            | null
          years_experience?: number | null
        }
        Update: {
          available_immediately?: boolean | null
          category?: string | null
          created_at?: string | null
          days_available?: string[] | null
          display_name?: string | null
          full_name?: string | null
          id?: string | null
          languages?: string[] | null
          profile_photo_url?: string | null
          services?: Database["public"]["Enums"]["service_category"][] | null
          short_bio?: string | null
          town?: string | null
          verification_level?:
            | Database["public"]["Enums"]["verification_level"]
            | null
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
      youth_profiles_public: {
        Row: {
          age_group: string | null
          created_at: string | null
          first_name: string | null
          full_name: string | null
          id: string | null
          interests: string[] | null
          languages: string[] | null
          profile_photo_url: string | null
          skills: string[] | null
          town: string | null
          verification_level:
            | Database["public"]["Enums"]["verification_level"]
            | null
        }
        Insert: {
          age_group?: string | null
          created_at?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string | null
          interests?: string[] | null
          languages?: string[] | null
          profile_photo_url?: string | null
          skills?: string[] | null
          town?: string | null
          verification_level?:
            | Database["public"]["Enums"]["verification_level"]
            | null
        }
        Update: {
          age_group?: string | null
          created_at?: string | null
          first_name?: string | null
          full_name?: string | null
          id?: string | null
          interests?: string[] | null
          languages?: string[] | null
          profile_photo_url?: string | null
          skills?: string[] | null
          town?: string | null
          verification_level?:
            | Database["public"]["Enums"]["verification_level"]
            | null
        }
        Relationships: []
      }
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      email_queue_dispatch: { Args: never; Returns: undefined }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_my_profile: {
        Args: never
        Returns: {
          email: string
          full_name: string
          phone: string
          town: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      lookup_feedback_request: {
        Args: { _token: string }
        Returns: {
          applicant_id: string
          applicant_name: string
          applicant_type: string
          completed_at: string
          id: string
        }[]
      }
      lookup_parent_consent: {
        Args: { _token: string }
        Returns: {
          applicant_first_name: string
          applicant_full_name: string
          parent_consent_signed_at: string
          parent_consent_status: string
          parent_full_name: string
        }[]
      }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      noticeboard_admin_stats: { Args: never; Returns: Json }
      noticeboard_claim_listing: {
        Args: { _manage_token: string }
        Returns: string
      }
      noticeboard_create_contact_request: {
        Args: {
          _consent?: boolean
          _message: string
          _profile_id: string
          _requester_contact: string
          _requester_name: string
        }
        Returns: string
      }
      noticeboard_create_listing: {
        Args: { _payload: Json }
        Returns: {
          manage_token: string
          public_listing_reference: string
        }[]
      }
      noticeboard_my_archive: { Args: never; Returns: boolean }
      noticeboard_my_create: { Args: { _payload: Json }; Returns: string }
      noticeboard_my_decide: {
        Args: { _decision: string; _request_id: string }
        Returns: string
      }
      noticeboard_my_delete: { Args: never; Returns: boolean }
      noticeboard_my_incoming_requests: {
        Args: never
        Returns: {
          created_at: string
          decided_at: string
          expires_at: string
          id: string
          message: string
          requester_contact: string
          requester_name: string
          revoked_at: string
          status: string
        }[]
      }
      noticeboard_my_listing: {
        Args: never
        Returns: {
          archived_at: string
          availability: string
          category: string
          created_at: string
          description: string
          id: string
          is_archived: boolean
          is_hidden: boolean
          last_activity_at: string
          last_contact_request_at: string
          last_login_at: string
          name: string
          phone: string
          photo_url: string
          public_listing_reference: string
          skills: string[]
          town: string
          updated_at: string
          years_experience: number
        }[]
      }
      noticeboard_my_reactivate: { Args: never; Returns: boolean }
      noticeboard_my_requests: {
        Args: never
        Returns: {
          created_at: string
          decided_at: string
          expires_at: string
          id: string
          phone: string
          profile_id: string
          status: string
          worker_name: string
          worker_skills: string[]
        }[]
      }
      noticeboard_my_revoke: { Args: { _request_id: string }; Returns: string }
      noticeboard_my_update: { Args: { _payload: Json }; Returns: string }
      noticeboard_owner_decide: {
        Args: { _decision: string; _manage_token: string; _request_id: string }
        Returns: string
      }
      noticeboard_owner_get_listing: {
        Args: { _manage_token: string }
        Returns: {
          id: string
          is_hidden: boolean
          name: string
          public_listing_reference: string
        }[]
      }
      noticeboard_owner_set_hidden: {
        Args: { _hidden: boolean; _manage_token: string }
        Returns: boolean
      }
      noticeboard_owner_view: {
        Args: { _manage_token: string }
        Returns: {
          created_at: string
          is_hidden: boolean
          message: string
          name: string
          profile_id: string
          request_id: string
          requester_contact: string
          requester_name: string
          status: string
        }[]
      }
      noticeboard_run_lifecycle_maintenance: { Args: never; Returns: Json }
      noticeboard_touch_login: { Args: never; Returns: undefined }
      noticeboard_view_request: {
        Args: { _requester_token: string }
        Returns: {
          created_at: string
          decided_at: string
          phone: string
          profile_name: string
          profile_town: string
          status: string
        }[]
      }
      notifications_mark_all_read: { Args: never; Returns: undefined }
      notifications_unread_count: { Args: never; Returns: number }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
      submit_feedback: {
        Args: {
          _comment: string
          _communication: number
          _engaged: string
          _punctuality: number
          _reliability: number
          _token: string
          _would_recommend: boolean
        }
        Returns: string
      }
      submit_parent_consent: {
        Args: {
          _email: string
          _parent_name: string
          _phone: string
          _relationship: string
          _signature: string
          _token: string
        }
        Returns: string
      }
      upsert_my_profile: {
        Args: { _full_name: string; _phone: string; _town: string }
        Returns: undefined
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
      organisation_kind:
        | "programme"
        | "municipality"
        | "school"
        | "npo"
        | "community"
        | "government"
        | "other"
      payment_status: "pending" | "succeeded" | "failed" | "refunded"
      pcc_status: "have" | "applied" | "none" | "need_help"
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
      verification_level: "unverified" | "bronze" | "silver" | "gold"
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
      youth_opportunity_status:
        | "pending"
        | "approved"
        | "rejected"
        | "closed"
        | "draft"
        | "pending_verification"
        | "pending_safeguarding_review"
        | "archived"
      youth_status:
        | "pending"
        | "approved"
        | "on_hold"
        | "rejected"
        | "awaiting_parent_consent"
        | "suspended"
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
      organisation_kind: [
        "programme",
        "municipality",
        "school",
        "npo",
        "community",
        "government",
        "other",
      ],
      payment_status: ["pending", "succeeded", "failed", "refunded"],
      pcc_status: ["have", "applied", "none", "need_help"],
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
      verification_level: ["unverified", "bronze", "silver", "gold"],
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
      youth_opportunity_status: [
        "pending",
        "approved",
        "rejected",
        "closed",
        "draft",
        "pending_verification",
        "pending_safeguarding_review",
        "archived",
      ],
      youth_status: [
        "pending",
        "approved",
        "on_hold",
        "rejected",
        "awaiting_parent_consent",
        "suspended",
      ],
    },
  },
} as const
