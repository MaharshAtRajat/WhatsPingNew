export interface User {
  id: string;
  email: string;
  whatsapp_number?: string;
  country_code?: string;
}

export interface Form {
  id: string;
  title: string;
  description?: string;
  user_id: string;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
  whatsapp_number: string;
  country_code: string;
  fields?: FormField[];
}

export interface FormField {
  id: string;
  form_id: string;
  type: 'text' | 'email' | 'phone' | 'radio' | 'checkbox' | 'dropdown' | 'paragraph';
  label: string;
  required: boolean;
  options?: string[];
  order: number;
}

export interface FormSubmission {
  id: string;
  form_id: string;
  data: Record<string, any>;
  created_at: string;
}

export interface FormTemplate {
  id: string;
  title: string;
  description: string;
  fields: Omit<FormField, 'id' | 'form_id'>[];
  category: string;
}

export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
}

export interface FormBuilderField {
  type: FormField['type'];
  label: string;
  required: boolean;
  options?: string[];
}

export interface DashboardStats {
  totalForms: number;
  totalSubmissions: number;
  conversionRate: number;
} 