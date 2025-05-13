import { Response } from 'express';
import { supabase } from '../index';
import { AuthRequest } from '../middleware/auth';
import { Form, FormField } from '../types';

export const createForm = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, whatsapp_number, country_code, fields } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Create form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .insert({
        title,
        description,
        user_id,
        status: 'draft',
        whatsapp_number,
        country_code,
      })
      .select()
      .single();

    if (formError) throw formError;

    // Create form fields
    if (fields && fields.length > 0) {
      const formFields = fields.map((field: Omit<FormField, 'id' | 'form_id'>, index: number) => ({
        ...field,
        form_id: form.id,
        order: index,
      }));

      const { error: fieldsError } = await supabase
        .from('form_fields')
        .insert(formFields);

      if (fieldsError) throw fieldsError;
    }

    res.status(201).json(form);
  } catch (error) {
    console.error('Error creating form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getForms = async (req: AuthRequest, res: Response) => {
  try {
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { data: forms, error } = await supabase
      .from('forms')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getForm = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', id)
      .eq('user_id', user_id)
      .single();

    if (formError) throw formError;

    const { data: fields, error: fieldsError } = await supabase
      .from('form_fields')
      .select('*')
      .eq('form_id', id)
      .order('order', { ascending: true });

    if (fieldsError) throw fieldsError;

    res.json({ ...form, fields });
  } catch (error) {
    console.error('Error fetching form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateForm = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, description, status, fields } = req.body;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Update form
    const { data: form, error: formError } = await supabase
      .from('forms')
      .update({
        title,
        description,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .eq('user_id', user_id)
      .select()
      .single();

    if (formError) throw formError;

    // Update fields if provided
    if (fields) {
      // Delete existing fields
      await supabase
        .from('form_fields')
        .delete()
        .eq('form_id', id);

      // Insert new fields
      const formFields = fields.map((field: Omit<FormField, 'id' | 'form_id'>, index: number) => ({
        ...field,
        form_id: id,
        order: index,
      }));

      const { error: fieldsError } = await supabase
        .from('form_fields')
        .insert(formFields);

      if (fieldsError) throw fieldsError;
    }

    res.json(form);
  } catch (error) {
    console.error('Error updating form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteForm = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Delete form fields first
    await supabase
      .from('form_fields')
      .delete()
      .eq('form_id', id);

    // Delete form
    const { error } = await supabase
      .from('forms')
      .delete()
      .eq('id', id)
      .eq('user_id', user_id);

    if (error) throw error;

    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    console.error('Error deleting form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 