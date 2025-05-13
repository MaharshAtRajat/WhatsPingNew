import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Select,
  Stack,
  Textarea,
  useToast,
  VStack,
  Text,
  Heading,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  HStack,
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';

const FormView: React.FC = () => {
  const { formId, shortUrl } = useParams<{ formId: string; shortUrl: string }>();
  const [form, setForm] = useState<any>(null);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchForm();
  }, [formId, shortUrl]);

  const fetchForm = async () => {
    try {
      let query = supabase.from('forms').select('*');
      
      if (shortUrl) {
        query = query.eq('short_url', shortUrl);
      } else {
        query = query.eq('id', formId);
      }

      const { data: form, error } = await query.single();

      if (error) throw error;

      // If form is a draft, only allow access to the creator
      if (form.status === 'draft') {
        if (!user || user.id !== form.user_id) {
          toast({
            title: 'Access Denied',
            description: 'This form is not published yet',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          navigate('/dashboard');
          return;
        }
      }

      setForm(form);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch form',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    form.fields.forEach((field: any) => {
      const value = formData[field.id];
      const v = field.validation || {};

      if (field.required && !value) {
        newErrors[field.id] = 'This field is required.';
      } else if (value) {
        if (field.type === 'text' || field.type === 'textarea') {
          if (v.min && value.length < v.min) newErrors[field.id] = `Minimum length is ${v.min} characters.`;
          if (v.max && value.length > v.max) newErrors[field.id] = `Maximum length is ${v.max} characters.`;
          if (v.pattern && !new RegExp(v.pattern).test(value)) newErrors[field.id] = 'Invalid format.';
        } else if (field.type === 'email') {
          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) newErrors[field.id] = 'Please enter a valid email address.';
          if (v.max && value.length > v.max) newErrors[field.id] = `Email must be at most ${v.max} characters.`;
        } else if (field.type === 'number') {
          if (value === undefined || value === '' || isNaN(Number(value))) newErrors[field.id] = 'Please enter a valid number.';
          if (v.min !== undefined && value !== undefined && value !== '' && Number(value) < v.min) newErrors[field.id] = `Minimum value is ${v.min}.`;
          if (v.max !== undefined && value !== undefined && value !== '' && Number(value) > v.max) newErrors[field.id] = `Maximum value is ${v.max}.`;
        } else if (field.type === 'tel') {
          if (!value || !/^\d{10}$/.test(value)) newErrors[field.id] = 'Please enter a valid 10-digit phone number.';
          if (v.max && value && value.length > v.max) newErrors[field.id] = `Phone number must be at most ${v.max} digits.`;
        } else if (field.type === 'date' || field.type === 'time') {
          if (!value) newErrors[field.id] = 'This field is required.';
        } else if (field.type === 'select' || field.type === 'radio') {
          if (!value) newErrors[field.id] = 'Please select an option.';
        } else if (field.type === 'checkbox') {
          if (!value || !Array.isArray(value) || value.length === 0) newErrors[field.id] = 'Please select at least one option.';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) return;
    setIsSubmitting(true);

    try {
      // Save submission to database
      const { error: submissionError } = await supabase
        .from('submissions')
        .insert([
          {
            form_id: form.id,
            data: formData,
            whatsapp_number: form.whatsapp_number,
          },
        ]);

      if (submissionError) throw submissionError;

      // Create WhatsApp message
      const message = Object.entries(formData)
        .map(([key, value]) => {
          const field = form.fields.find((f: any) => f.id === key);
          return `${field.label}: ${value}`;
        })
        .join('\n');

      // Construct WhatsApp URL
      const whatsappUrl = `https://wa.me/${form.country_code}${form.whatsapp_number}?text=${encodeURIComponent(message)}`;

      // Open WhatsApp in new tab
      window.open(whatsappUrl, '_self');

      toast({
        title: 'Success',
        description: 'Form submitted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Redirect to Thank You page
      navigate(`/forms/${form.id}/thankyou`);

      // Reset form
      setFormData({});
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to submit form',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Container maxW="container.md" py={8}>
        <Box textAlign="center">
          <Spinner size="xl" />
          <Text mt={4}>Loading form...</Text>
        </Box>
      </Container>
    );
  }

  if (!form) {
    return (
      <Container maxW="container.md" py={8}>
        <Alert status="error">
          <AlertIcon />
          <AlertTitle>Form not found!</AlertTitle>
          <AlertDescription>
            The form you're looking for doesn't exist or has been removed.
          </AlertDescription>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW={{ base: '100%', md: 'container.md' }} py={{ base: 4, md: 8 }} px={{ base: 2, md: 8 }}>
      <VStack spacing={8} align="stretch">
        <Box>
          <Heading size={{ base: 'md', md: 'lg' }} mb={2} textAlign={{ base: 'center', md: 'left' }}>
            {form.title}
          </Heading>
          {form.description && (
            <Text color="gray.600" mb={4} fontSize={{ base: 'sm', md: 'md' }} textAlign={{ base: 'center', md: 'left' }}>
              {form.description}
            </Text>
          )}
        </Box>

        <form onSubmit={handleSubmit}>
          <VStack spacing={6} align="stretch">
            {form.fields.map((field: any) => (
              <FormControl
                key={field.id}
                isRequired={field.required || field.type === 'email'}
                isInvalid={!!errors[field.id]}
                w="100%"
              >
                <FormLabel fontSize={{ base: 'sm', md: 'md' }}>{field.label} {(field.required || field.type === 'email') && <span style={{ color: 'red' }}>*</span>}</FormLabel>
                {field.type === 'text' && (
                  <Input
                    value={formData[field.id] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    size={{ base: 'sm', md: 'md' }}
                  />
                )}
                {field.type === 'textarea' && (
                  <Textarea
                    value={formData[field.id] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    size={{ base: 'sm', md: 'md' }}
                  />
                )}
                {field.type === 'number' && (
                  <Input
                    type="number"
                    value={formData[field.id] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
                    size={{ base: 'sm', md: 'md' }}
                  />
                )}
                {field.type === 'tel' && (
                  <Input
                    type="tel"
                    value={formData[field.id] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value.replace(/[^0-9]/g, '') })}
                    placeholder={field.placeholder || 'Enter 10-digit phone number'}
                    maxLength={10}
                    size={{ base: 'sm', md: 'md' }}
                  />
                )}
                {field.type === 'email' && (
                  <Input
                    type="email"
                    value={formData[field.id] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    placeholder={field.placeholder || 'Enter your email'}
                    size={{ base: 'sm', md: 'md' }}
                  />
                )}
                {field.type === 'date' && (
                  <Input
                    type="date"
                    value={formData[field.id] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    size={{ base: 'sm', md: 'md' }}
                  />
                )}
                {field.type === 'time' && (
                  <Input
                    type="time"
                    value={formData[field.id] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    size={{ base: 'sm', md: 'md' }}
                  />
                )}
                {field.type === 'select' && (
                  <Select
                    value={formData[field.id] || ''}
                    onChange={(e) => setFormData({ ...formData, [field.id]: e.target.value })}
                    placeholder="Select an option"
                    size={{ base: 'sm', md: 'md' }}
                  >
                    {field.options?.map((option: string) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </Select>
                )}
                {field.type === 'radio' && (
                  <Stack direction={{ base: 'column', md: 'row' }}>
                    {field.options?.map((option: string) => (
                      <label key={option} style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}>
                        <input
                          type="radio"
                          name={field.id}
                          value={option}
                          checked={formData[field.id] === option}
                          onChange={() => setFormData({ ...formData, [field.id]: option })}
                        />
                        <Text ml={2}>{option}</Text>
                      </label>
                    ))}
                  </Stack>
                )}
                {field.type === 'checkbox' && (
                  <Stack direction={{ base: 'column', md: 'row' }}>
                    {field.options?.map((option: string) => (
                      <label key={option} style={{ display: 'flex', alignItems: 'center', marginRight: 16 }}>
                        <input
                          type="checkbox"
                          value={option}
                          checked={Array.isArray(formData[field.id]) && formData[field.id].includes(option)}
                          onChange={(e) => {
                            const checked = e.target.checked;
                            let newArr = Array.isArray(formData[field.id]) ? [...formData[field.id]] : [];
                            if (checked) {
                              newArr.push(option);
                            } else {
                              newArr = newArr.filter((v) => v !== option);
                            }
                            setFormData({ ...formData, [field.id]: newArr });
                          }}
                        />
                        <Text ml={2}>{option}</Text>
                      </label>
                    ))}
                  </Stack>
                )}
                {errors[field.id] && (
                  <Text color="red.500" fontSize="sm" mt={1}>{errors[field.id]}</Text>
                )}
              </FormControl>
            ))}

            <Button
              type="submit"
              colorScheme="blue"
              size="lg"
              width={{ base: '100%', md: 'full' }}
              isLoading={isSubmitting}
              fontSize={{ base: 'md', md: 'lg' }}
            >
              Submit
            </Button>
          </VStack>
        </form>
      </VStack>
    </Container>
  );
};

export default FormView; 