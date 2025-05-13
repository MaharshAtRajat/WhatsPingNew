export interface Form {
  id: string;
  title: string;
  description?: string;
  fields: any[]; // or your FormField[]
  user_id: string;
  created_at: string;
  updated_at: string;
  status: 'draft' | 'published';
  short_url?: string | null;
  submission_count?: number | null;
  responses?: number;
  whatsapp_number?: string;
  country_code?: string;
  submission_message?: string;
}

export interface FormField {
  id: string;
  type: 'text' | 'number' | 'email' | 'tel' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'time';
  label: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
  };
}

export interface FormSubmission {
  id: string;
  form_id: string;
  data: Record<string, any>;
  created_at: string;
}

export interface DashboardStats {
  totalForms: number;
  totalSubmissions: number;
  conversionRate: number;
} 