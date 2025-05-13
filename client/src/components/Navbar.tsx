import React from 'react';
import {
  Box,
  Flex,
  Heading,
  HStack,
  Button,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Spacer,
  useColorModeValue,
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const accent = '#22C55E';

  return (
    <Box bg={useColorModeValue('white', 'gray.900')} borderBottomWidth={1} borderColor={useColorModeValue('gray.100', 'gray.700')}>
      <Flex align="center" justify="space-between" px={8} py={4}>
        <HStack spacing={3} cursor="pointer" onClick={() => navigate('/dashboard')}>
          <img src="/whatspping-logo-full.png" alt="WhatsPing Logo" style={{ height: 50, marginRight: 8, marginLeft: 30 }} />
        </HStack>
        <HStack spacing={6}>
          <Button colorScheme="green" variant="solid" fontWeight="bold" borderRadius="md" px={6} onClick={() => navigate('/dashboard')}>Dashboard</Button>
          <Menu>
            <MenuButton as={Avatar} name={user?.email || 'User'} size="sm" bg={accent} color="white" fontWeight="bold" cursor="pointer" />
            <MenuList>
              <MenuItem onClick={signOut}>Sign Out</MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Navbar; 