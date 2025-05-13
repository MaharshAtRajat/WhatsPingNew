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
    <Container maxW={{ base: '100%', md: 'container.md' }} py={{ base: 8, md: 16 }} px={{ base: 2, md: 8 }}>
      <Box textAlign="center">
        <Heading mb={{ base: 2, md: 4 }} size={{ base: 'md', md: 'lg' }}>Thank You!</Heading>
        <Text fontSize={{ base: 'md', md: 'lg' }} mb={{ base: 2, md: 4 }}>
          {form?.user_id && <>From: <b>{form.user_id}</b></>}
        </Text>
        <Box
          mt={{ base: 4, md: 6 }}
          p={{ base: 3, md: 6 }}
          borderRadius="lg"
          bg="white"
          boxShadow="md"
          fontSize={{ base: 'md', md: 'lg' }}
          wordBreak="break-word"
          dangerouslySetInnerHTML={{ __html: form?.submission_message || "<strong>Thank You!</strong>" }}
        />
      </Box>
    </Container>
  );
};

export default ThankYou; 