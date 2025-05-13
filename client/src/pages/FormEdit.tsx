import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  HStack,
  IconButton,
  Text,
  Grid,
  GridItem,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { supabase } from '../utils/supabase';

interface FormField {
  id: string;
  type: string;
  label: string;
  required: boolean;
  options?: string[];
}

interface Form {
  id: string;
  title: string;
  description: string;
  fields: FormField[];
  whatsapp_number: string;
  country_code: string;
}

const FormEdit: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchForm();
  }, [formId]);

  const fetchForm = async () => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (error) throw error;
      setForm(data);
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

  const handleSave = async () => {
    if (!form) return;

    if (!form.title.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a form title',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!form.whatsapp_number.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter your WhatsApp number',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (form.fields.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one field to your form',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('forms')
        .update({
          title: form.title,
          description: form.description,
          fields: form.fields,
          whatsapp_number: form.whatsapp_number,
          country_code: form.country_code,
        })
        .eq('id', form.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Form updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update form',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const addField = (type: string) => {
    if (!form) return;
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: '',
      required: false,
      options: type === 'select' ? [''] : undefined,
    };
    setForm({ ...form, fields: [...form.fields, newField] });
  };

  const removeField = (id: string) => {
    if (!form) return;
    setForm({
      ...form,
      fields: form.fields.filter(field => field.id !== id),
    });
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    if (!form) return;
    setForm({
      ...form,
      fields: form.fields.map(field =>
        field.id === id ? { ...field, ...updates } : field
      ),
    });
  };

  const addOption = (fieldId: string) => {
    if (!form) return;
    setForm({
      ...form,
      fields: form.fields.map(field =>
        field.id === fieldId
          ? { ...field, options: [...(field.options || []), ''] }
          : field
      ),
    });
  };

  const removeOption = (fieldId: string, optionIndex: number) => {
    if (!form) return;
    setForm({
      ...form,
      fields: form.fields.map(field =>
        field.id === fieldId
          ? {
              ...field,
              options: field.options?.filter((_, index) => index !== optionIndex),
            }
          : field
      ),
    });
  };

  const updateOption = (fieldId: string, optionIndex: number, value: string) => {
    if (!form) return;
    setForm({
      ...form,
      fields: form.fields.map(field =>
        field.id === fieldId
          ? {
              ...field,
              options: field.options?.map((opt, idx) =>
                idx === optionIndex ? value : opt
              ),
            }
          : field
      ),
    });
  };

  const renderFieldEditor = (field: FormField) => (
    <Box key={field.id} p={4} borderWidth={1} borderRadius="md">
      <Stack spacing={4}>
        <FormControl>
          <FormLabel>Field Label</FormLabel>
          <Input
            value={field.label}
            onChange={(e) => updateField(field.id, { label: e.target.value })}
            placeholder="Enter field label"
          />
        </FormControl>

        <FormControl>
          <FormLabel>Field Type</FormLabel>
          <Select
            value={field.type}
            onChange={(e) => updateField(field.id, { type: e.target.value })}
          >
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="number">Number</option>
            <option value="tel">Phone</option>
            <option value="select">Select</option>
            <option value="textarea">Text Area</option>
          </Select>
        </FormControl>

        {field.type === 'select' && (
          <Box>
            <FormLabel>Options</FormLabel>
            <VStack spacing={2} align="stretch">
              {field.options?.map((option, index) => (
                <HStack key={index}>
                  <Input
                    value={option}
                    onChange={(e) => updateOption(field.id, index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                  />
                  <IconButton
                    aria-label="Remove option"
                    icon={<DeleteIcon />}
                    onClick={() => removeOption(field.id, index)}
                  />
                </HStack>
              ))}
              <Button
                leftIcon={<AddIcon />}
                onClick={() => addOption(field.id)}
                size="sm"
              >
                Add Option
              </Button>
            </VStack>
          </Box>
        )}

        <FormControl display="flex" alignItems="center">
          <FormLabel mb="0">Required</FormLabel>
          <Select
            value={field.required ? 'true' : 'false'}
            onChange={(e) => updateField(field.id, { required: e.target.value === 'true' })}
            width="100px"
          >
            <option value="true">Yes</option>
            <option value="false">No</option>
          </Select>
        </FormControl>

        <Button
          leftIcon={<DeleteIcon />}
          colorScheme="red"
          variant="outline"
          onClick={() => removeField(field.id)}
        >
          Remove Field
        </Button>
      </Stack>
    </Box>
  );

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Loading form...</Text>
      </Container>
    );
  }

  if (!form) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Form not found</Text>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <Stack spacing={8}>
        <Box>
          <FormControl mb={4}>
            <FormLabel>Form Title</FormLabel>
            <Input
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Enter form title"
            />
          </FormControl>
          <FormControl mb={4}>
            <FormLabel>Form Description</FormLabel>
            <Textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Enter form description"
            />
          </FormControl>
          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
            <GridItem>
              <FormControl>
                <FormLabel>Country Code</FormLabel>
                <Select
                  value={form.country_code}
                  onChange={(e) => setForm({ ...form, country_code: e.target.value })}
                >
                  <option value="+1">+1 (US/Canada)</option>
                  <option value="+44">+44 (UK)</option>
                  <option value="+91">+91 (India)</option>
                  <option value="+61">+61 (Australia)</option>
                </Select>
              </FormControl>
            </GridItem>
            <GridItem>
              <FormControl>
                <FormLabel>WhatsApp Number</FormLabel>
                <Input
                  value={form.whatsapp_number}
                  onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
                  placeholder="Enter WhatsApp number"
                  type="tel"
                />
              </FormControl>
            </GridItem>
          </Grid>
        </Box>

        <Box>
          <HStack spacing={4} mb={4}>
            <Button
              leftIcon={<AddIcon />}
              onClick={() => addField('text')}
              colorScheme="blue"
            >
              Add Text Field
            </Button>
            <Button
              leftIcon={<AddIcon />}
              onClick={() => addField('email')}
              colorScheme="blue"
            >
              Add Email Field
            </Button>
            <Button
              leftIcon={<AddIcon />}
              onClick={() => addField('select')}
              colorScheme="blue"
            >
              Add Select Field
            </Button>
          </HStack>

          <VStack spacing={4} align="stretch">
            {form.fields.map(renderFieldEditor)}
          </VStack>
        </Box>

        <Button
          onClick={handleSave}
          colorScheme="blue"
          isLoading={isSaving}
        >
          Save Changes
        </Button>
      </Stack>
    </Container>
  );
};

export default FormEdit; 