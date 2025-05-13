import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  SimpleGrid,
  Stack,
  Stat,
  StatLabel,
  StatNumber,
  Text,
  useToast,
  Avatar,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tfoot,
  useColorModeValue,
  Divider,
  VStack,
} from '@chakra-ui/react';
import { AddIcon, ChevronDownIcon, CopyIcon, DeleteIcon, EditIcon, ExternalLinkIcon, RepeatIcon, ViewIcon } from '@chakra-ui/icons';
import { supabase } from '../utils/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Form, DashboardStats } from '../types';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const [stats] = useState({
    totalForms: 7,
    totalSubmissions: 0,
    conversionRate: 0,
    avgResponseTime: 'N/A',
  });
  const [forms, setForms] = useState<Form[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();
  const toast = useToast();

  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const accent = '#22C55E';

  useEffect(() => {
    fetchForms();
    // eslint-disable-next-line
  }, []);

  const fetchForms = async () => {
    setIsLoading(true);
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error('No user found');
      const { data: formsData, error } = await supabase
        .from('forms')
        .select('*, submissions(count)')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      const transformed = formsData.map((form: any) => ({
        ...form,
        responses: form.submissions?.[0]?.count || 0,
      })) as Form[];
      setForms(transformed);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch forms',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Compute analytics from live data
  const totalForms = forms.length;
  const totalSubmissions = forms.reduce((sum, form) => sum + (form.responses || 0), 0);
  const conversionRate = totalForms > 0 ? Math.round((totalSubmissions / totalForms) * 100) : 0;
  const avgResponseTime = 'N/A'; // Placeholder, unless you have this data

  // Actions
  const handleDuplicate = async (form: Form) => {
    try {
      const { data, error } = await supabase
        .from('forms')
        .insert({
          ...form,
          id: undefined,
          title: `${form.title} (Copy)`
        })
        .select()
        .single();
      if (error) throw error;
      toast({ title: 'Form duplicated', status: 'success' });
      fetchForms();
    } catch (error: any) {
      toast({ title: 'Error duplicating form', description: error.message, status: 'error' });
    }
  };

  const handleCopyLink = (form: Form) => {
    const baseUrl = window.location.origin;
    const url = form.short_url ? `${baseUrl}/s/${form.short_url}` : `${baseUrl}/forms/${form.id}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Link copied!', status: 'success' });
  };

  const handleShareWhatsApp = (form: Form) => {
    const baseUrl = window.location.origin;
    const url = form.short_url ? `${baseUrl}/s/${form.short_url}` : `${baseUrl}/forms/${form.id}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(url)}`;
    window.open(whatsappUrl, '_blank');
  };

  const handleDelete = async (form: Form) => {
    if (!window.confirm('Are you sure you want to delete this form? This action cannot be undone.')) return;
    try {
      const { error } = await supabase.from('forms').delete().eq('id', form.id);
      if (error) throw error;
      toast({ title: 'Form deleted', status: 'success' });
      fetchForms();
    } catch (error: any) {
      toast({ title: 'Error deleting form', description: error.message, status: 'error' });
    }
  };

  // Filtered forms
  const filteredForms = forms.filter(form =>
    form.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (form.description?.toLowerCase() || '').includes(searchQuery.toLowerCase())
  );

  return (
    <Box bg={useColorModeValue('gray.50', 'gray.900')} minH="100vh" px={{ base: 2, md: 0 }}>
      {/* Header */}
      {/* <Flex as="header" align="center" justify="space-between" px={8} py={4} bg="white" borderBottomWidth={1} borderColor={borderColor}>
        <HStack spacing={3}>
          <Box boxSize={7} bg={accent} borderRadius="md" />
          <Heading size="md" fontWeight="bold">WhatsApp Form Builder</Heading>
        </HStack>
        <HStack spacing={4}>
          <Button colorScheme="green" variant="solid" size="sm">Dashboard</Button>
          <Avatar name={user?.email || 'JD'} size="sm" bg={accent} color="white" fontWeight="bold" />
        </HStack>
      </Flex> */}

      <Container maxW={{ base: '100%', md: '6xl' }} py={{ base: 4, md: 10 }} px={{ base: 2, md: 8 }}>
        {/* Dashboard Title & Subtitle */}
        <Box mb={{ base: 4, md: 8 }}>
          <Heading size={{ base: 'lg', md: 'xl' }} fontWeight="bold">Dashboard</Heading>
          <Text color="gray.500" mt={2} fontSize={{ base: 'md', md: 'lg' }}>
            Manage your WhatsApp forms and view submission data
          </Text>
        </Box>

        {/* Analytics Cards */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={10}>
          <Stat bg={cardBg} borderRadius="xl" borderWidth={1} borderColor={borderColor} px={6} py={8} boxShadow="sm">
            <StatLabel color="gray.500" fontWeight="medium">Total Forms</StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold">{totalForms}</StatNumber>
          </Stat>
          <Stat bg={cardBg} borderRadius="xl" borderWidth={1} borderColor={borderColor} px={6} py={8} boxShadow="sm">
            <StatLabel color="gray.500" fontWeight="medium">Total Submissions</StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold">{totalSubmissions}</StatNumber>
          </Stat>
          <Stat bg={cardBg} borderRadius="xl" borderWidth={1} borderColor={borderColor} px={6} py={8} boxShadow="sm">
            <StatLabel color="gray.500" fontWeight="medium">Conversion Rate</StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold">{conversionRate}%</StatNumber>
          </Stat>
          <Stat bg={cardBg} borderRadius="xl" borderWidth={1} borderColor={borderColor} px={6} py={8} boxShadow="sm">
            <StatLabel color="gray.500" fontWeight="medium">Avg. Response Time</StatLabel>
            <StatNumber fontSize="2xl" fontWeight="bold">{avgResponseTime}</StatNumber>
          </Stat>
        </SimpleGrid>

        {/* Create New Form Section */}
        <Box mb={{ base: 8, md: 12 }}>
          <Heading size={{ base: 'md', md: 'md' }} mb={4}>Create New Form</Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {/* Blank Form Card */}
            <Box bg={cardBg} borderRadius="xl" borderWidth={1} borderColor={borderColor} p={8} textAlign="center" boxShadow="sm">
              <Box fontSize="4xl" mb={3} color={accent}>
                <AddIcon boxSize={8} />
              </Box>
              <Heading size="sm" mb={1}>Blank Form</Heading>
              <Text color="gray.500" mb={6}>Start from scratch</Text>
              <Button colorScheme="green" size="md" w="full" onClick={() => navigate('/forms/new')}>Create Blank Form</Button>
            </Box>
            {/* From Template Card */}
            <Box bg={cardBg} borderRadius="xl" borderWidth={1} borderColor={borderColor} p={8} textAlign="center" boxShadow="sm">
              <Box fontSize="4xl" mb={3} color={accent}>
                <RepeatIcon boxSize={8} />
              </Box>
              <Heading size="sm" mb={1}>From Template</Heading>
              <Text color="gray.500" mb={6}>Use a pre-designed template</Text>
              <Button colorScheme="green" size="md" w="full">Browse Templates</Button>
            </Box>
            {/* Import Google Form Card */}
            <Box bg={cardBg} borderRadius="xl" borderWidth={1} borderColor={borderColor} p={8} textAlign="center" boxShadow="sm">
              <Box fontSize="4xl" mb={3} color={accent}>
                <ExternalLinkIcon boxSize={8} />
              </Box>
              <Heading size="sm" mb={1}>Import Google Form</Heading>
              <Text color="gray.500" mb={6}>Convert an existing Google Form</Text>
              <Button colorScheme="green" size="md" w="full">Import Form</Button>
            </Box>
          </SimpleGrid>
        </Box>

        {/* Your Forms Section */}
        <Box>
          <Heading size={{ base: 'md', md: 'md' }} mb={4}>Your Forms</Heading>
          <Flex mb={4} justify="space-between" align="center" direction={{ base: 'column', md: 'row' }} gap={{ base: 2, md: 0 }}>
            <Input
              placeholder="Search forms..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              maxW={{ base: '100%', md: '320px' }}
              bg={cardBg}
              borderColor={borderColor}
              borderRadius="md"
              mb={{ base: 2, md: 0 }}
            />
            <Button colorScheme="green" onClick={() => navigate('/forms/new')} w={{ base: '100%', md: 'auto' }}>Create New Form</Button>
          </Flex>

          {/* Responsive Table: Cards on mobile, table on desktop */}
          <Box display={{ base: 'none', md: 'block' }} bg={cardBg} borderRadius="xl" borderWidth={1} borderColor={borderColor} p={0} boxShadow="sm" overflowX="auto">
            <Table variant="simple" size="md" minWidth="600px">
              <Thead>
                <Tr>
                  <Th fontWeight="bold">Form Title</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                  <Th>Responses</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {isLoading ? (
                  <Tr><Td colSpan={5}><Text>Loading...</Text></Td></Tr>
                ) : filteredForms.length === 0 ? (
                  <Tr><Td colSpan={5}><Text color="gray.500">No forms found.</Text></Td></Tr>
                ) : filteredForms.map((form) => (
                  <Tr key={form.id}>
                    <Td>
                      <Text fontWeight="semibold" color={form.status === 'published' ? accent : 'gray.700'}>{form.title}</Text>
                      {form.description && <Text color="gray.500" fontSize="sm">{form.description}</Text>}
                    </Td>
                    <Td>
                      <Badge colorScheme={form.status === 'published' ? 'green' : 'yellow'} variant="subtle" fontSize="sm" px={2} py={1} borderRadius="md">
                        {form.status === 'published' ? 'Published' : 'Draft'}
                      </Badge>
                    </Td>
                    <Td>{new Date(form.created_at).toLocaleDateString()}</Td>
                    <Td>
                      <Button
                        variant="link"
                        colorScheme="blue"
                        onClick={() => navigate(`/forms/${form.id}/submissions`)}
                        fontWeight="bold"
                      >
                        {form.responses}
                      </Button>
                    </Td>
                    <Td>
                      <Menu>
                        <MenuButton as={IconButton} icon={<ChevronDownIcon />} variant="ghost" />
                        <MenuList>
                          <MenuItem icon={<EditIcon />} onClick={() => navigate(`/forms/${form.id}/edit`)}>Edit</MenuItem>
                          <MenuItem icon={<CopyIcon />} onClick={() => handleDuplicate(form)}>Duplicate</MenuItem>
                          <MenuItem icon={<ExternalLinkIcon />} onClick={() => handleCopyLink(form)}>Copy Link</MenuItem>
                          <MenuItem icon={<ViewIcon />} onClick={() => handleShareWhatsApp(form)}>Share on WhatsApp</MenuItem>
                          <MenuItem icon={<ViewIcon />} onClick={() => navigate(`/forms/${form.id}/submissions`)}>View Submissions</MenuItem>
                          <MenuItem icon={<DeleteIcon />} color="red.500" onClick={() => handleDelete(form)}>Delete</MenuItem>
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* Mobile Cards */}
          <VStack display={{ base: 'flex', md: 'none' }} spacing={4} align="stretch">
            {isLoading ? (
              <Box bg={cardBg} borderRadius="xl" borderWidth={1} borderColor={borderColor} p={6} textAlign="center">
                <Text>Loading...</Text>
              </Box>
            ) : filteredForms.length === 0 ? (
              <Box bg={cardBg} borderRadius="xl" borderWidth={1} borderColor={borderColor} p={6} textAlign="center">
                <Text color="gray.500">No forms found.</Text>
              </Box>
            ) : filteredForms.map((form) => (
              <Box key={form.id} bg={cardBg} borderRadius="xl" borderWidth={1} borderColor={borderColor} p={4} boxShadow="sm">
                <Flex justify="space-between" align="center" mb={2}>
                  <Text fontWeight="semibold" color={form.status === 'published' ? accent : 'gray.700'} fontSize="lg">{form.title}</Text>
                  <Badge colorScheme={form.status === 'published' ? 'green' : 'yellow'} variant="subtle" fontSize="sm" px={2} py={1} borderRadius="md">
                    {form.status === 'published' ? 'Published' : 'Draft'}
                  </Badge>
                </Flex>
                {form.description && <Text color="gray.500" fontSize="sm" mb={2}>{form.description}</Text>}
                <Text fontSize="sm" color="gray.500" mb={1}>Created: {new Date(form.created_at).toLocaleDateString()}</Text>
                <Text fontSize="sm" color="gray.500" mb={2}>Responses: <Button variant="link" colorScheme="blue" size="sm" onClick={() => navigate(`/forms/${form.id}/submissions`)} fontWeight="bold">{form.responses}</Button></Text>
                <Divider my={2} />
                <Flex gap={2} wrap="wrap">
                  <IconButton aria-label="Edit" icon={<EditIcon />} size="sm" onClick={() => navigate(`/forms/${form.id}/edit`)} />
                  <IconButton aria-label="Duplicate" icon={<CopyIcon />} size="sm" onClick={() => handleDuplicate(form)} />
                  <IconButton aria-label="Copy Link" icon={<ExternalLinkIcon />} size="sm" onClick={() => handleCopyLink(form)} />
                  <IconButton aria-label="Share on WhatsApp" icon={<ViewIcon />} size="sm" onClick={() => handleShareWhatsApp(form)} />
                  <IconButton aria-label="View Submissions" icon={<ViewIcon />} size="sm" onClick={() => navigate(`/forms/${form.id}/submissions`)} />
                  <IconButton aria-label="Delete" icon={<DeleteIcon />} size="sm" colorScheme="red" onClick={() => handleDelete(form)} />
                </Flex>
              </Box>
            ))}
          </VStack>
        </Box>
      </Container>
    </Box>
  );
};

export default Dashboard; 