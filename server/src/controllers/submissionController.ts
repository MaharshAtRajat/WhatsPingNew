import { Response } from 'express';
import { supabase } from '../index';
import { AuthRequest } from '../middleware/auth';
import { FormSubmission } from '../types';

export const submitForm = async (req: AuthRequest, res: Response) => {
  try {
    const { form_id } = req.params;
    const submissionData = req.body;

    // Get form details
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('*')
      .eq('id', form_id)
      .single();

    if (formError) throw formError;

    if (form.status !== 'published') {
      return res.status(400).json({ error: 'Form is not published' });
    }

    // Create submission
    const { data: submission, error: submissionError } = await supabase
      .from('form_submissions')
      .insert({
        form_id,
        data: submissionData,
      })
      .select()
      .single();

    if (submissionError) throw submissionError;

    // Format submission data for WhatsApp
    const formattedData = Object.entries(submissionData)
      .map(([key, value]) => `${key}: ${value}`)
      .join('\n');

    // Create WhatsApp message
    const whatsappMessage = `New Form Submission:\n\n${formattedData}`;
    const encodedMessage = encodeURIComponent(whatsappMessage);
    const whatsappUrl = `https://wa.me/${form.country_code}${form.whatsapp_number}?text=${encodedMessage}`;

    res.status(201).json({
      submission,
      whatsapp_url: whatsappUrl,
    });
  } catch (error) {
    console.error('Error submitting form:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const { form_id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Verify form ownership
    const { data: form, error: formError } = await supabase
      .from('forms')
      .select('id')
      .eq('id', form_id)
      .eq('user_id', user_id)
      .single();

    if (formError) {
      return res.status(404).json({ error: 'Form not found' });
    }

    // Get submissions
    const { data: submissions, error: submissionsError } = await supabase
      .from('form_submissions')
      .select('*')
      .eq('form_id', form_id)
      .order('created_at', { ascending: false });

    if (submissionsError) throw submissionsError;

    res.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}; 