export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          company_name: string | null
          company_address: string | null
          tax_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          company_name?: string | null
          company_address?: string | null
          tax_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          company_name?: string | null
          company_address?: string | null
          tax_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          company_name: string | null
          address: string | null
          contact_person_first_name: string | null
          contact_person_last_name: string | null
          company_type: string | null
          tax_id: string | null
          website: string | null
          industry: string | null
          preferred_contact_method: string | null
          payment_currency: string
          payment_terms: string | null
          country: string | null
          state_province: string | null
          postal_code: string | null
          is_active: boolean
          tags: string[] | null
          metadata: Json | null
          last_contacted_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          company_name?: string | null
          address?: string | null
          contact_person_first_name?: string | null
          contact_person_last_name?: string | null
          company_type?: string | null
          tax_id?: string | null
          website?: string | null
          industry?: string | null
          preferred_contact_method?: string | null
          payment_currency?: string
          payment_terms?: string | null
          country?: string | null
          state_province?: string | null
          postal_code?: string | null
          is_active?: boolean
          tags?: string[] | null
          metadata?: Json | null
          last_contacted_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          company_name?: string | null
          address?: string | null
          contact_person_first_name?: string | null
          contact_person_last_name?: string | null
          company_type?: string | null
          tax_id?: string | null
          website?: string | null
          industry?: string | null
          preferred_contact_method?: string | null
          payment_currency?: string
          payment_terms?: string | null
          country?: string | null
          state_province?: string | null
          postal_code?: string | null
          is_active?: boolean
          tags?: string[] | null
          metadata?: Json | null
          last_contacted_at?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      contracts: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          contract_number: string
          project_description: string
          start_date: string | null
          end_date: string | null
          payment_terms: string | null
          deliverables: Json
          total_amount: number | null
          currency: string
          status: string
          pdf_url: string | null
          template_type: string | null
          project_name: string | null
          scope: string | null
          exclusions: string | null
          milestones: Json
          total_fee: number | null
          payment_structure: string | null
          payment_method: string | null
          clauses: Json
          share_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          contract_number: string
          project_description: string
          start_date?: string | null
          end_date?: string | null
          payment_terms?: string | null
          deliverables?: Json
          total_amount?: number | null
          currency?: string
          status?: string
          pdf_url?: string | null
          template_type?: string | null
          project_name?: string | null
          scope?: string | null
          exclusions?: string | null
          milestones?: Json
          total_fee?: number | null
          payment_structure?: string | null
          payment_method?: string | null
          clauses?: Json
          share_token?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          contract_number?: string
          project_description?: string
          start_date?: string | null
          end_date?: string | null
          payment_terms?: string | null
          deliverables?: Json
          total_amount?: number | null
          currency?: string
          status?: string
          pdf_url?: string | null
          template_type?: string | null
          project_name?: string | null
          scope?: string | null
          exclusions?: string | null
          milestones?: Json
          total_fee?: number | null
          payment_structure?: string | null
          payment_method?: string | null
          clauses?: Json
          share_token?: string
          created_at?: string
          updated_at?: string
        }
      }
      invoices: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          contract_id: string | null
          invoice_number: string
          issue_date: string
          due_date: string
          line_items: Json
          subtotal: number
          tax_rate: number
          tax_amount: number
          discount_type: string | null
          discount_value: number | null
          total: number
          currency: string
          payment_method: string | null
          payment_instructions: string | null
          notes_to_client: string | null
          internal_notes: string | null
          status: string
          paid_at: string | null
          pdf_url: string | null
          share_token: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          contract_id?: string | null
          invoice_number: string
          issue_date: string
          due_date: string
          line_items?: Json
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          discount_type?: string | null
          discount_value?: number | null
          total: number
          currency?: string
          payment_method?: string | null
          payment_instructions?: string | null
          notes_to_client?: string | null
          internal_notes?: string | null
          status?: string
          paid_at?: string | null
          pdf_url?: string | null
          share_token?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          contract_id?: string | null
          invoice_number?: string
          issue_date?: string
          due_date?: string
          line_items?: Json
          subtotal?: number
          tax_rate?: number
          tax_amount?: number
          discount_type?: string | null
          discount_value?: number | null
          total?: number
          currency?: string
          payment_method?: string | null
          payment_instructions?: string | null
          notes_to_client?: string | null
          internal_notes?: string | null
          status?: string
          paid_at?: string | null
          pdf_url?: string | null
          share_token?: string
          created_at?: string
          updated_at?: string
        }
      }
      cookie_consents: {
        Row: {
          id: string
          user_id: string
          consent_status: 'accepted' | 'declined'
          policy_version: string
          source: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          consent_status: 'accepted' | 'declined'
          policy_version?: string
          source?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          consent_status?: 'accepted' | 'declined'
          policy_version?: string
          source?: string
          created_at?: string
          updated_at?: string
        }
      }
      time_logs: {
        Row: {
          id: string
          user_id: string
          client_id: string | null
          task_name: string
          start_time: string
          end_time: string | null
          duration_seconds: number | null
          notes: string | null
          is_running: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          client_id?: string | null
          task_name: string
          start_time: string
          end_time?: string | null
          duration_seconds?: number | null
          notes?: string | null
          is_running?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          client_id?: string | null
          task_name?: string
          start_time?: string
          end_time?: string | null
          duration_seconds?: number | null
          notes?: string | null
          is_running?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}

// Helper types
export type Client = Database['public']['Tables']['clients']['Row']
export type ClientInsert = Database['public']['Tables']['clients']['Insert']
export type ClientUpdate = Database['public']['Tables']['clients']['Update']

export type Contract = Database['public']['Tables']['contracts']['Row']
export type ContractInsert = Database['public']['Tables']['contracts']['Insert']
export type ContractUpdate = Database['public']['Tables']['contracts']['Update']

export type Invoice = Database['public']['Tables']['invoices']['Row']
export type InvoiceInsert = Database['public']['Tables']['invoices']['Insert']
export type InvoiceUpdate = Database['public']['Tables']['invoices']['Update']

export type TimeLog = Database['public']['Tables']['time_logs']['Row']
export type TimeLogInsert = Database['public']['Tables']['time_logs']['Insert']
export type TimeLogUpdate = Database['public']['Tables']['time_logs']['Update']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']
