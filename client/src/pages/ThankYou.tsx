import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Heading, Text, Spinner, Container } from '@chakra-ui/react';
import { supabase } from '../utils/supabase';

const ThankYou: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      const { data, error } = await supabase
        .from('forms')
        .select('submission_message, user_id')
        .eq('id', formId)
        .single();
      setForm(data);
      setLoading(false);
    };
    fetchForm();
  }, [formId]);

  if (loading) return <Spinner />;

  return (
    <Container maxW="container.md" py={16}>
      <Box textAlign="center">
        <Heading mb={4}>Thank You!</Heading>
        <Text fontSize="lg" mb={4}>
          {form?.user_id && <>From: <b>{form.user_id}</b></>}
        </Text>
        <Box
          mt={6}
          p={6}
          borderRadius="lg"
          bg="white"
          boxShadow="md"
          dangerouslySetInnerHTML={{ __html: form?.submission_message || "<strong>Thank You!</strong>" }}
        />
      </Box>
    </Container>
  );
};

export default ThankYou; 