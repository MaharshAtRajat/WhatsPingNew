export interface User {
  id: string;
  email: string;
  created_at: string;
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
}

export interface FormField {
  id: string;
  form_id: string;
  type: 'text' | 'email' | 'phone' | 'radio' | 'checkbox' | 'dropdown' | 'paragraph';
  label: string;
  required: boolean;
  options?: string[]; // For radio, checkbox, and dropdown
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