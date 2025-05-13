import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Box minH="100vh" bg={useColorModeValue('gray.50', 'gray.900')}>
      <Box
        as="nav"
        position="fixed"
        w="100%"
        bg={bgColor}
        borderBottom="1px"
        borderColor={borderColor}
        zIndex={1}
      >
        <Flex
          h={16}
          alignItems="center"
          justifyContent="space-between"
          px={4}
          maxW="container.xl"
          mx="auto"
        >
          <HStack spacing={8} alignItems="center">
            <Text
              fontSize="xl"
              fontWeight="bold"
              cursor="pointer"
              onClick={() => navigate('/dashboard')}
            >
              Whatsping
            </Text>
          </HStack>

          <HStack spacing={4}>
            <Menu>
              <MenuButton
                as={Button}
                variant="ghost"
                size="sm"
              >
                {user?.email || 'Menu'}
              </MenuButton>
              <MenuList>
                <MenuItem onClick={() => navigate('/settings')}>
                  Settings
                </MenuItem>
                <MenuItem onClick={handleSignOut}>
                  Sign Out
                </MenuItem>
              </MenuList>
            </Menu>
          </HStack>
        </Flex>
      </Box>

      <Box pt={16}>
        {children}
      </Box>
    </Box>
  );
};

export default Layout; 