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
      <Flex align="center" justify="space-between" px={{ base: 2, md: 8 }} py={{ base: 2, md: 4 }} direction="row" w="100%">
        {/* Logo left */}
        <Box cursor="pointer" onClick={() => navigate('/dashboard')}>
          <img src="/whatspping-logo-full.png" alt="WhatsPing Logo" style={{ height: 60, marginRight: 8, marginLeft: 2, maxWidth: '90vw' }} />
        </Box>
        {/* Avatar right */}
        <Box>
          <Menu>
            <MenuButton
              as={Avatar}
              size="md"
              bg='green.500'
              color="white"
              fontWeight="bold"
              cursor="pointer"
              marginLeft={0}
            >
              
            </MenuButton>
            <MenuList>
              <MenuItem onClick={signOut}>Sign Out</MenuItem>
            </MenuList>
          </Menu>
        </Box>
      </Flex>
    </Box>
  );
};

export default Navbar; 