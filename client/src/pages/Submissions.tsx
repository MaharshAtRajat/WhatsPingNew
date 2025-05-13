import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  useToast,
  HStack,
  Badge,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
} from '@chakra-ui/react';
import { ChevronDownIcon, DownloadIcon } from '@chakra-ui/icons';
import { supabase } from '../utils/supabase';
import * as XLSX from 'xlsx-js-style';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Submission {
  id: string;
  form_id: string;
  data: Record<string, any>;
  submitted_at: string;
  whatsapp_number: string;
  status: 'pending' | 'sent' | 'failed';
}

interface Form {
  id: string;
  title: string;
  fields: Array<{
    id: string;
    label: string;
  }>;
}

const Submissions: React.FC = () => {
  const { formId } = useParams<{ formId: string }>();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [form, setForm] = useState<Form | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchFormAndSubmissions();
  }, [formId]);

  const fetchFormAndSubmissions = async () => {
    try {
      // Fetch form details
      const { data: formData, error: formError } = await supabase
        .from('forms')
        .select('*')
        .eq('id', formId)
        .single();

      if (formError) throw formError;
      setForm(formData);

      // Fetch submissions
      const { data: submissionsData, error: submissionsError } = await supabase
        .from('submissions')
        .select('*')
        .eq('form_id', formId)
        .order('submitted_at', { ascending: false });

      if (submissionsError) throw submissionsError;
      setSubmissions(submissionsData || []);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to fetch submissions',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return 'green';
      case 'failed':
        return 'red';
      default:
        return 'yellow';
    }
  };

  const downloadExcel = () => {
    if (!form || submissions.length === 0) return;

    // Prepare data for Excel
    const excelData = submissions.map(submission => {
      const row: Record<string, any> = {
        'Submission ID': submission.id,
        'Submitted At': new Date(submission.submitted_at).toLocaleString(),
        'Status': submission.status,
      };

      // Add form fields data
      Object.entries(submission.data).forEach(([key, value]) => {
        const field = form.fields.find(f => f.id === key);
        row[field?.label || key] = value;
      });

      return row;
    });

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Add styles
    const headerStyle = {
      font: { bold: true },
      fill: { fgColor: { rgb: "CCCCCC" } },
      alignment: { horizontal: "center" }
    };

    // Apply styles to header row
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_cell({ r: 0, c: C });
      if (!ws[address]) continue;
      ws[address].s = headerStyle;
    }

    // Create workbook and append sheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Submissions');

    // Generate Excel file
    XLSX.writeFile(wb, `${form.title}_submissions.xlsx`);
  };

  const downloadPDF = () => {
    if (!form || submissions.length === 0) return;

    // Create new PDF document
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(16);
    doc.text(`Submissions for ${form.title}`, 14, 15);

    // Add description
    doc.setFontSize(10);
    doc.text(`Generated on ${new Date().toLocaleString()}`, 14, 22);

    // Prepare table data
    const tableData = submissions.map(submission => {
      const row: Record<string, any> = {
        'Submitted At': new Date(submission.submitted_at).toLocaleString(),
        'Status': submission.status,
      };

      // Add form fields data
      Object.entries(submission.data).forEach(([key, value]) => {
        const field = form.fields.find(f => f.id === key);
        row[field?.label || key] = value;
      });

      return row;
    });

    // Get all unique column headers
    const headers = ['Submitted At', 'Status', ...form.fields.map(f => f.label)];

    // Add table
    autoTable(doc, {
      head: [headers],
      body: tableData.map(row => headers.map(header => row[header] || '-')),
      startY: 30,
      styles: {
        fontSize: 8,
        cellPadding: 2,
      },
      headStyles: {
        fillColor: [66, 139, 202],
        textColor: 255,
        fontStyle: 'bold',
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Submitted At
        1: { cellWidth: 20 }, // Status
      },
      margin: { top: 30 },
    });

    // Save the PDF
    doc.save(`${form.title}_submissions.pdf`);
  };

  if (isLoading) {
    return (
      <Container maxW="container.xl" py={8}>
        <Text>Loading submissions...</Text>
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
      <HStack justify="space-between" mb={8}>
        <Heading size="lg">Submissions for {form.title}</Heading>
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            leftIcon={<DownloadIcon />}
          >
            Download
          </MenuButton>
          <MenuList>
            <MenuItem onClick={downloadExcel}>Download as Excel</MenuItem>
            <MenuItem onClick={downloadPDF}>Download as PDF</MenuItem>
          </MenuList>
        </Menu>
      </HStack>

      {submissions.length === 0 ? (
        <Text>No submissions yet</Text>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Submitted At</Th>
                <Th>Status</Th>
                {form.fields.map(field => (
                  <Th key={field.id}>{field.label}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {submissions.map(submission => (
                <Tr key={submission.id}>
                  <Td>{new Date(submission.submitted_at).toLocaleString()}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(submission.status)}>
                      {submission.status}
                    </Badge>
                  </Td>
                  {form.fields.map(field => (
                    <Td key={field.id}>{submission.data[field.id] || '-'}</Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Container>
  );
};

export default Submissions; 