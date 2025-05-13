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
  HStack,
  IconButton,
  Text,
  Divider,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  Grid,
  GridItem,
  Heading,
  Switch,
  FormHelperText,
  Badge,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Flex,
  Spacer,
  Tooltip,
  useColorModeValue,
  Icon,
  UnorderedList,
  ListItem,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, ChevronUpIcon, ChevronDownIcon, ViewIcon, EditIcon, CopyIcon } from '@chakra-ui/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { Form, FormField } from '../types';
import { FaHeading, FaRegKeyboard, FaHashtag, FaCalendarAlt, FaChevronDown, FaDotCircle, FaCheckSquare, FaWhatsapp, FaPlus } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import BreadcrumbNav from '../components/BreadcrumbNav';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

const FormBuilder: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const { user } = useAuth();
  const [form, setForm] = useState<Partial<Form>>({
    title: '',
    description: '',
    fields: [],
    status: 'draft',
    whatsapp_number: '',
    country_code: '+1', // Default to US
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [draftTitle, setDraftTitle] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(0);
  const toast = useToast();
  const navigate = useNavigate();

  // Color scheme from UI screenshot
  const green = '#22C55E';
  const blue = '#38BDF8';
  const bgMain = '#F8FAFC';
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const mutedText = '#64748B';
  const headingText = '#0F172A';

  // Elements panel state
  const [elementsTab, setElementsTab] = useState<'basic' | 'advanced' | 'layout'>('basic');
  const [search, setSearch] = useState('');

  // List of available elements with appropriate icon components
  const availableElements = [
    { type: 'text', label: 'Short Text', icon: FaRegKeyboard },
    { type: 'textarea', label: 'Long Text', icon: FaHeading },
    { type: 'number', label: 'Number', icon: FaHashtag },
    { type: 'tel', label: 'Phone', icon: FaRegKeyboard },
    { type: 'email', label: 'Email', icon: FaRegKeyboard },
    { type: 'date', label: 'Date', icon: FaCalendarAlt },
    { type: 'time', label: 'Time', icon: FaRegKeyboard },
    { type: 'select', label: 'Drop Down', icon: FaChevronDown },
    { type: 'radio', label: 'Radio Button', icon: FaDotCircle },
    { type: 'checkbox', label: 'Check Boxes', icon: FaCheckSquare },
  ];

  // Filtered elements for search
  const filteredElements = availableElements.filter(e =>
    e.label.toLowerCase().includes(search.toLowerCase())
  );

  const { isOpen: isMsgOpen, onOpen: onMsgOpen, onClose: onMsgClose } = useDisclosure();
  const [submissionMessage, setSubmissionMessage] = useState(form.submission_message || '<strong>Thank You!</strong>');
  const [isSavingMessage, setIsSavingMessage] = useState(false);

  useEffect(() => {
    if (formId) {
      fetchForm();
    }
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
    }
  };

  const handleSave = async (isDraft: boolean = true) => {
    try {
      // Validate WhatsApp details if publishing
      if (!isDraft) {
        if (!form.whatsapp_number || !form.country_code) {
          toast({
            title: 'Missing WhatsApp Details',
            description: 'Please add your WhatsApp number and country code before publishing the form',
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
          return;
        }
      }

      setIsLoading(true);
      // Only include fields that exist in the forms table schema
      const formData = {
        title: form.title,
        description: form.description,
        fields: form.fields,
        status: isDraft ? 'draft' : 'published',
        user_id: user?.id,
        whatsapp_number: form.whatsapp_number,
        country_code: form.country_code,
      };

      if (formId) {
        const { error } = await supabase
          .from('forms')
          .update(formData)
          .eq('id', formId);

        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from('forms')
          .insert([formData])
          .select()
          .single();

        if (error) throw error;
        navigate(`/forms/${data.id}/edit`);
      }

      toast({
        title: 'Success',
        description: `Form ${isDraft ? 'saved as draft' : 'published'} successfully`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      if (!isDraft) {
        navigate('/dashboard');
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save form',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addField = (type: FormField['type']) => {
    const newField: FormField = {
      id: Date.now().toString(),
      type,
      label: `New ${type} field`,
      required: false,
    };
    setForm(prev => ({
      ...prev,
      fields: [...(prev.fields || []), newField],
    }));
  };

  const updateField = (index: number, field: Partial<FormField>) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields?.map((f, i) => 
        i === index ? { ...f, ...field } : f
      ),
    }));
  };

  const removeField = (index: number) => {
    setForm(prev => ({
      ...prev,
      fields: prev.fields?.filter((_, i) => i !== index),
    }));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (!form.fields) return;
    const newFields = [...form.fields];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (newIndex < 0 || newIndex >= newFields.length) return;
    
    [newFields[index], newFields[newIndex]] = [newFields[newIndex], newFields[index]];
    setForm(prev => ({ ...prev, fields: newFields }));
  };

  const renderFieldEditor = (field: FormField, index: number) => (
    <Box>
      <Card 
        key={field.id} 
        mb={4} 
        variant="outline" 
        bg={cardBg}
        borderColor={borderColor}
        boxShadow="sm"
        _hover={{ boxShadow: 'md' }}
        transition="all 0.2s"
      >
        <CardHeader pb={0}>
          <Flex align="center">
            <HStack spacing={2}>
              <Tooltip label="Move up">
                <IconButton
                  aria-label="Move field up"
                  icon={<ChevronUpIcon boxSize={5} />}
                  size="md"
                  variant="ghost"
                  isDisabled={index === 0}
                  onClick={() => moveField(index, 'up')}
                />
              </Tooltip>
              <Tooltip label="Move down">
                <IconButton
                  aria-label="Move field down"
                  icon={<ChevronDownIcon boxSize={5} />}
                  size="md"
                  variant="ghost"
                  isDisabled={index === (form.fields?.length || 0) - 1}
                  onClick={() => moveField(index, 'down')}
                />
              </Tooltip>
            </HStack>
            <Heading size="sm" color={headingText} ml={2}>Field {index + 1}</Heading>
            <Spacer />
            <Tooltip label="Delete field">
              <IconButton
                aria-label="Delete field"
                icon={<DeleteIcon />}
                size="sm"
                colorScheme="red"
                variant="ghost"
                onClick={() => removeField(index)}
              />
            </Tooltip>
          </Flex>
        </CardHeader>
        <CardBody>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel fontWeight="medium" color={headingText}>Label {field.required && <span style={{ color: 'red' }}>*</span>}</FormLabel>
              <Input
                value={field.label}
                onChange={(e) => updateField(index, { label: e.target.value })}
                placeholder="Enter field label"
                size="md"
                borderRadius="md"
                bg="white"
                borderColor={borderColor}
              />
            </FormControl>

            {/* Validation controls by type */}
            {['text', 'textarea'].includes(field.type) && (
              <HStack w="100%">
                <FormControl>
                  <FormLabel fontWeight="medium" color={headingText}>Min Length</FormLabel>
                  <Input
                    type="number"
                    value={field.validation?.min || ''}
                    onChange={e => updateField(index, { validation: { ...field.validation, min: e.target.value ? Number(e.target.value) : undefined } })}
                    placeholder="Min"
                    size="sm"
                    borderRadius="md"
                    bg="white"
                    borderColor={borderColor}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="medium" color={headingText}>Max Length</FormLabel>
                  <Input
                    type="number"
                    value={field.validation?.max || ''}
                    onChange={e => updateField(index, { validation: { ...field.validation, max: e.target.value ? Number(e.target.value) : undefined } })}
                    placeholder="Max"
                    size="sm"
                    borderRadius="md"
                    bg="white"
                    borderColor={borderColor}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="medium" color={headingText}>Pattern</FormLabel>
                  <Input
                    value={field.validation?.pattern || ''}
                    onChange={e => updateField(index, { validation: { ...field.validation, pattern: e.target.value } })}
                    placeholder="Regex pattern"
                    size="sm"
                    borderRadius="md"
                    bg="white"
                    borderColor={borderColor}
                  />
                </FormControl>
              </HStack>
            )}
            {field.type === 'number' && (
              <HStack w="100%">
                <FormControl>
                  <FormLabel fontWeight="medium" color={headingText}>Min</FormLabel>
                  <Input
                    type="number"
                    value={field.validation?.min || ''}
                    onChange={e => updateField(index, { validation: { ...field.validation, min: e.target.value ? Number(e.target.value) : undefined } })}
                    placeholder="Min"
                    size="sm"
                    borderRadius="md"
                    bg="white"
                    borderColor={borderColor}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel fontWeight="medium" color={headingText}>Max</FormLabel>
                  <Input
                    type="number"
                    value={field.validation?.max || ''}
                    onChange={e => updateField(index, { validation: { ...field.validation, max: e.target.value ? Number(e.target.value) : undefined } })}
                    placeholder="Max"
                    size="sm"
                    borderRadius="md"
                    bg="white"
                    borderColor={borderColor}
                  />
                </FormControl>
              </HStack>
            )}
            {['email', 'tel'].includes(field.type) && (
              <HStack w="100%">
                <FormControl>
                  <FormLabel fontWeight="medium" color={headingText}>Max Length</FormLabel>
                  <Input
                    type="number"
                    value={field.validation?.max || ''}
                    onChange={e => updateField(index, { validation: { ...field.validation, max: e.target.value ? Number(e.target.value) : undefined } })}
                    placeholder="Max"
                    size="sm"
                    borderRadius="md"
                    bg="white"
                    borderColor={borderColor}
                  />
                </FormControl>
              </HStack>
            )}

            {(field.type === 'select' || field.type === 'radio' || field.type === 'checkbox') && (
              <FormControl>
                <FormLabel fontWeight="medium" color={headingText}>Options</FormLabel>
                <VStack align="stretch" spacing={2}>
                  {(field.options || []).map((option, optIdx) => (
                    <HStack key={optIdx}>
                      <Input
                        value={option}
                        onChange={e => {
                          const newOptions = [...(field.options || [])];
                          newOptions[optIdx] = e.target.value;
                          updateField(index, { options: newOptions });
                        }}
                        placeholder={`Option ${optIdx + 1}`}
                        size="sm"
                        borderRadius="md"
                        bg="white"
                        borderColor={borderColor}
                      />
                      <IconButton
                        aria-label="Remove option"
                        icon={<DeleteIcon />}
                        size="xs"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => {
                          const newOptions = (field.options || []).filter((_, i) => i !== optIdx);
                          updateField(index, { options: newOptions });
                        }}
                      />
                    </HStack>
                  ))}
                  <Button
                    size="xs"
                    leftIcon={<AddIcon />}
                    onClick={() => updateField(index, { options: [...(field.options || []), ''] })}
                  >
                    Add Option
                  </Button>
                </VStack>
              </FormControl>
            )}

            <FormControl>
              <FormLabel fontWeight="medium" color={headingText}>Placeholder</FormLabel>
              <Input
                value={field.placeholder || ''}
                onChange={(e) => updateField(index, { placeholder: e.target.value })}
                placeholder="Enter placeholder text"
                size="md"
                borderRadius="md"
                bg="white"
                borderColor={borderColor}
              />
            </FormControl>

            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0" fontWeight="medium" color={headingText}>Required</FormLabel>
              <Switch
                isChecked={field.required}
                onChange={(e) => updateField(index, { required: e.target.checked })}
                colorScheme="blue"
              />
            </FormControl>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );

  const renderFieldPreview = (field: FormField) => (
    <Card 
      key={field.id} 
      mb={4} 
      variant="outline" 
      bg={cardBg}
      borderColor={borderColor}
      boxShadow="sm"
    >
      <CardBody>
        <VStack spacing={4} align="stretch">
          <HStack justify="space-between">
            <FormLabel fontWeight="medium" mb={0} color={headingText}>
              {field.label} {field.required && <span style={{ color: 'red' }}>*</span>}
            </FormLabel>
          </HStack>
          {renderFieldInput(field, true)}
        </VStack>
      </CardBody>
    </Card>
  );

  const renderFieldInput = (field: FormField, previewMode = false) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'tel':
      case 'number':
        return (
          <Input
            type={field.type}
            placeholder={field.placeholder}
            size="md"
            borderRadius="md"
            bg="white"
            borderColor={borderColor}
          />
        );
      case 'textarea':
        return (
          <Input
            as="textarea"
            placeholder={field.placeholder}
            size="md"
            rows={3}
            borderRadius="md"
            bg="white"
            borderColor={borderColor}
          />
        );
      case 'select':
        return (
          <Select placeholder={field.placeholder} size="md" borderRadius="md" bg="white" borderColor={borderColor}>
            {field.options?.map((option, i) => (
              <option key={i} value={option}>{option}</option>
            ))}
          </Select>
        );
      case 'radio':
        return (
          <VStack align="start" spacing={2}>
            {field.options?.map((option, i) => (
              <HStack key={i}>
                <input type="radio" name={field.id} value={option} />
                <Text>{option}</Text>
              </HStack>
            ))}
          </VStack>
        );
      case 'checkbox':
        return (
          <VStack align="start" spacing={2}>
            {field.options?.map((option, i) => (
              <HStack key={i}>
                <input type="checkbox" value={option} />
                <Text>{option}</Text>
              </HStack>
            ))}
          </VStack>
        );
      case 'date':
        return (
          <Input type="date" size="md" borderRadius="md" bg="white" borderColor={borderColor} />
        );
      case 'time':
        return (
          <Input type="time" size="md" borderRadius="md" bg="white" borderColor={borderColor} />
        );
      default:
        return null;
    }
  };

  const checkSubmissions = async (formId: string) => {
    try {
      const { count, error } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('form_id', formId);

      if (error) throw error;
      setSubmissionCount(count || 0);
      return count || 0;
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to check submissions',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      return 0;
    }
  };

  const handleDelete = async () => {
    if (!formId) return;
    
    try {
      const count = await checkSubmissions(formId);
      if (count > 0) {
        setDeleteModalOpen(true);
        return;
      }

      await deleteForm();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete form',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const deleteForm = async () => {
    if (!formId) return;

    try {
      const { error } = await supabase
        .from('forms')
        .delete()
        .eq('id', formId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Form and its submissions have been deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      navigate('/dashboard');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete form',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleCopyLink = () => {
    const formUrl = `${window.location.origin}/forms/${formId}/view`;
    navigator.clipboard.writeText(formUrl);
    toast({
      title: 'Link Copied',
      description: 'Form link has been copied to clipboard',
      status: 'success',
      duration: 2000,
      isClosable: true,
    });
  };

  return (
    <>
      <BreadcrumbNav />
      <Box bg="background.tertiary" minH="100vh" py={{ base: 4, md: 8 }}>
        <Container maxW={{ base: '100%', md: 'container.xl' }} px={{ base: 2, md: 8 }}>
          <Grid
            templateColumns={{ base: '1fr', lg: '1.1fr 2fr 1.2fr' }}
            gap={{ base: 4, md: 8 }}
            alignItems="flex-start"
            overflowX={{ base: 'visible', md: 'visible' }}
            maxW="100vw"
          >
            {/* Elements Panel */}
            <GridItem colSpan={{ base: 1, lg: 1 }}>
              <Box
                bg="white"
                borderRadius="card"
                boxShadow="card"
                border="1px solid"
                borderColor="gray.100"
                minH="400px"
                p={0}
                mb={{ base: 4, lg: 0 }}
                maxW="100vw"
                overflowX="auto"
              >
                <Box borderBottom="1px solid" borderColor="gray.100" pb={3} pt={4} px={3} borderTopRadius="card">
                  <Text fontSize={{ base: 'md', md: 'lg' }} fontWeight="bold" color="gray.900" fontFamily="Inter, sans-serif">
                    Elements
                  </Text>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Click to add elements
                  </Text>
                  <Input
                    mt={4}
                    size="sm"
                    placeholder="Search elements..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    borderRadius="md"
                    bg="background.tertiary"
                    borderColor="gray.200"
                    fontFamily="Inter, sans-serif"
                  />
                </Box>
                <Box px={2} py={3}>
                  <VStack align="stretch" spacing={2}>
                    {filteredElements.map((el, idx) => (
                      <Button
                        key={el.type + idx}
                        leftIcon={<Icon as={el.icon as React.ElementType} boxSize={5} />}
                        variant="ghost"
                        justifyContent="flex-start"
                        size="md"
                        fontWeight="medium"
                        color="gray.900"
                        fontFamily="Inter, sans-serif"
                        borderRadius="md"
                        px={3}
                        _hover={{ 
                          bg: "#F9FAFB", 
                          textColor: "#24D366",
                          "& svg": {
                            color: "500"
                          }
                        }}
                        transition="all 0.15s"
                        onClick={() => {
                          const newField = {
                            id: Date.now().toString(),
                            type: el.type as FormField['type'],
                            label: `New ${el.label}`,
                            required: false,
                          };
                          setForm(prev => ({
                            ...prev,
                            fields: [...(prev.fields || []), newField],
                          }));
                        }}
                        w={{ base: '100%', md: 'auto' }}
                      >
                        {el.label}
                      </Button>
                    ))}
                  </VStack>
                </Box>
              </Box>
            </GridItem>

            {/* Form Designer */}
            <GridItem colSpan={{ base: 1, lg: 1 }}>
              <Box
                bg="white"
                borderRadius="card"
                boxShadow="card"
                border="1px solid"
                borderColor="gray.100"
                minH="400px"
                p={0}
                mb={{ base: 4, lg: 0 }}
                maxW="100vw"
                overflowX="auto"
              >
                <Box borderBottom="1px solid" borderColor="gray.100" pb={3} pt={4} px={3} borderTopRadius="card">
                  <Flex justify="space-between" align="center" direction={{ base: 'column', md: 'row' }}>
                    <Box w="100%">
                      {/* Removed duplicate header and subtitle */}
                    </Box>
                    <HStack spacing={2} mt={{ base: 2, md: 0 }} w={{ base: '100%', md: 'auto' }} justifyContent={{ base: 'center', md: 'flex-end' }}>
                      <Button
                        //leftIcon={<Icon as={FaWhatsapp as React.ElementType} />}
                        colorScheme="green"
                        variant="outline"
                        onClick={() => handleSave(true)}
                        isLoading={isLoading}
                        w={{ base: '100%', md: 'auto' }}
                      >
                        Save Draft
                      </Button>
                      <Button
                        //leftIcon={<Icon as={FaWhatsapp as React.ElementType} />}
                        colorScheme="green"
                        onClick={() => handleSave(false)}
                        isLoading={isLoading}
                        w={{ base: '100%', md: 'auto' }}
                      >
                        Publish Form
                      </Button>
                    </HStack>
                  </Flex>
                </Box>
                <Box px={{ base: 2, md: 5 }} py={{ base: 3, md: 6 }}>
                  {/* WhatsApp Settings */}
                  <Box mb={6} p={4} bg="gray.50" borderRadius="lg">
                    <Text fontWeight="medium" mb={3}>WhatsApp Settings</Text>
                    <HStack spacing={4} flexDirection={{ base: 'column', md: 'row' }} alignItems={{ base: 'stretch', md: 'center' }}>
                      <FormControl>
                        <FormLabel fontSize="sm">Country Code</FormLabel>
                        <Select
                          value={form.country_code}
                          onChange={(e) => setForm(prev => ({ ...prev, country_code: e.target.value }))}
                          size="md"
                        >
                          <option value="+1">+1 (US/Canada)</option>
                          <option value="+44">+44 (UK)</option>
                          <option value="+91">+91 (India)</option>
                          <option value="+61">+61 (Australia)</option>
                          {/* Add more country codes as needed */}
                        </Select>
                      </FormControl>
                      <FormControl>
                        <FormLabel fontSize="sm">WhatsApp Number</FormLabel>
                        <Input
                          value={form.whatsapp_number}
                          onChange={(e) => setForm(prev => ({ ...prev, whatsapp_number: e.target.value }))}
                          placeholder="Enter WhatsApp number"
                          size="md"
                        />
                      </FormControl>
                    </HStack>
                  </Box>

                  {/* Title input */}
                  <Input
                    value={form.title}
                    onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Untitled Form"
                    size="lg"
                    fontWeight="bold"
                    fontSize={{ base: 'xl', md: '2xl' }}
                    border="none"
                    _focus={{ border: "1px solid", borderColor: "brand.500", boxShadow: "none" }}
                    fontFamily="Inter, sans-serif"
                    color="gray.900"
                    mb={2}
                  />
                  {/* Description input */}
                  <Input
                    value={form.description}
                    onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Form description (optional)"
                    size="md"
                    border="none"
                    _focus={{ border: "1px solid", borderColor: "brand.500", boxShadow: "none" }}
                    fontFamily="Inter, sans-serif"
                    color="gray.600"
                    mb={6}
                  />
                  {/* Fields list */}
                  <Box
                    minH="200px"
                    p={2}
                    bg="background.tertiary"
                    textAlign={form.fields?.length ? 'left' : 'center'}
                    display="flex"
                    flexDirection="column"
                    alignItems="center"
                    justifyContent={form.fields?.length ? 'flex-start' : 'center'}
                  >
                    {form.fields?.length === 0 ? (
                      <Box
                        w="100%"
                        py={8}
                        display="flex"
                        flexDirection="column"
                        alignItems="center"
                        border="2px dashed"
                        borderColor="brand.500"
                        borderRadius="xl"
                        bg="background.tertiary"
                      >
                        <VStack color="brand.500" spacing={2}>
                          <Icon as={FaPlus as React.ElementType} boxSize={7} />
                          <Text color="gray.500" fontWeight="medium">Add elements to build your form</Text>
                        </VStack>
                      </Box>
                    ) : (
                      (form.fields || []).map((field, index) => (
                        <Box key={String(field.id)} w="100%" mb={2}>
                          <Box bg={cardBg} borderRadius="xl" borderWidth={1} borderColor={borderColor} boxShadow="sm" p={4}>
                            {renderFieldEditor(field, index)}
                          </Box>
                        </Box>
                      ))
                    )}
                  </Box>
                </Box>
              </Box>
            </GridItem>

            {/* Form Preview */}
            <GridItem colSpan={{ base: 1, lg: 1 }}>
              <Box
                bg="white"
                borderRadius="card"
                boxShadow="card"
                border="1px solid"
                borderColor="gray.100"
                minH="400px"
                p={0}
                maxW="100vw"
                overflowX="auto"
              >
                <Box px={{ base: 2, md: 5 }} py={{ base: 3, md: 6 }}>
                  <VStack spacing={6} align="stretch">
                    <Divider />
                    {form.fields?.map((field) => renderFieldPreview(field))}
                    <Button 
                      leftIcon={<Icon as={FaWhatsapp as React.ElementType} boxSize={6} />} 
                      bg="green.500" 
                      color="white" 
                      size="lg" 
                      fontWeight="bold" 
                      borderRadius="lg" 
                      px={8} 
                      py={6} 
                      fontSize="lg" 
                      _hover={{ bg: '#22C55E' }}
                      w={{ base: '100%', md: 'auto' }}
                    >
                      Submit via WhatsApp
                    </Button>
                  </VStack>
                </Box>
              </Box>
            </GridItem>
          </Grid>
        </Container>
      </Box>

      {/* Delete Warning Modal */}
      <Modal isOpen={deleteModalOpen} onClose={() => setDeleteModalOpen(false)}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Form</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack align="start" spacing={3}>
              <Text fontWeight="medium">
                Warning: This action cannot be undone.
              </Text>
              <Text>
                This form has {submissionCount} submission{submissionCount !== 1 ? 's' : ''}. Deleting this form will permanently delete:
              </Text>
              <Box pl={4}>
                <UnorderedList>
                  <ListItem>The form and all its settings</ListItem>
                  <ListItem>All {submissionCount} submission{submissionCount !== 1 ? 's' : ''} and their data</ListItem>
                </UnorderedList>
              </Box>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              colorScheme="red" 
              onClick={() => {
                setDeleteModalOpen(false);
                deleteForm();
              }}
            >
              Delete Form and All Submissions
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Submission Message Modal */}
      <Modal isOpen={isMsgOpen} onClose={onMsgClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Edit Submission Message</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <ReactQuill
              value={submissionMessage}
              onChange={setSubmissionMessage}
              theme="snow"
              modules={{
                toolbar: [
                  [{ 'header': [1, 2, false] }],
                  ['bold', 'italic', 'underline', 'strike'],
                  [{ 'color': [] }, { 'background': [] }],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['link'],
                  ['clean']
                ]
              }}
            />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="green" mr={3} onClick={async () => {
              setIsSavingMessage(true);
              const { error } = await supabase
                .from('forms')
                .update({ submission_message: submissionMessage })
                .eq('id', form.id);
              setIsSavingMessage(false);
              if (!error) {
                setForm(prev => ({ ...prev, submission_message: submissionMessage }));
                onMsgClose();
              } else {
                // Optionally show a toast for error
              }
            }} isLoading={isSavingMessage}>
              Save
            </Button>
            <Button variant="ghost" onClick={onMsgClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FormBuilder; 