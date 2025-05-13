import React from 'react';
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink } from '@chakra-ui/react';

const BreadcrumbNav: React.FC = () => (
  <Box bg="white" px={{ base: 4, md: 10 }} py={2} borderBottom="1px solid" borderColor="gray.100">
    <Breadcrumb fontSize="sm" color="gray.500" fontFamily="Inter, sans-serif">
      <BreadcrumbItem>
        <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbItem isCurrentPage>
        <BreadcrumbLink href="#">Form Builder</BreadcrumbLink>
      </BreadcrumbItem>
    </Breadcrumb>
  </Box>
);

export default BreadcrumbNav; 