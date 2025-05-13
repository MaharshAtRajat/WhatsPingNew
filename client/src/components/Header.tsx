import React from 'react';
import { Box, Flex, Text, Button, Avatar, HStack, Spacer } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => (
  <Box
    bg="white"
    boxShadow="sm"
    px={{ base: 4, md: 10 }}
    py={0}
    height="64px"
    display="flex"
    alignItems="center"
    borderBottom="1px solid"
    borderColor="gray.100"
    zIndex={10}
    position="relative"
  >
    <Flex align="center" w="100%">
      {/* Logo and App Name */}
      <HStack spacing={2}>
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
          <img src="/whatspping-logo-full.png" alt="WhatsPing Logo" style={{ height: 40, marginRight: 12 }} />
        </Link>
        <Text
          fontSize="xl"
          fontWeight="bold"
          color="brand.500"
          fontFamily="Inter, sans-serif"
          letterSpacing="-0.5px"
        >
          WhatsApp Form Builder
        </Text>
      </HStack>
      <Spacer />
      {/* Right Side: Dashboard button and user avatar */}
      <HStack spacing={4}>
        <Button
          bg="brand.500"
          color="white"
          _hover={{ bg: "#1DA851" }}
          fontWeight="bold"
          borderRadius="md"
          px={6}
          size="md"
        >
          Dashboard
        </Button>
        <Avatar name="JD" size="sm" bg="brand.500" color="white" fontWeight="bold" />
      </HStack>
    </Flex>
  </Box>
);

export default Header; 