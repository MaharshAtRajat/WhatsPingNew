import { extendTheme, ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  colors: {
    brand: {
      green: '#23C45E', // Primary Green
      dark: '#202124', // Headings, main text
      grey: '#5F6368', // Subtext, placeholders
      lightGrey: '#F1F3F4', // Background blocks
      white: '#FFFFFF', // Cards, containers
      blue: '#3C91E6', // Accent/info
      yellow: '#F9C846', // Alert/draft
      success: '#B5E7A0', // Published
      danger: '#FF6B6B', // Danger
    },
    background: {
      primary: '#FFFFFF',
      tertiary: '#F9FAFB',
    },
  },
  radii: {
    card: '12px',
    button: '8px',
    input: '8px',
  },
  shadows: {
    card: '0 2px 8px rgba(60, 145, 230, 0.04)',
  },
  fontSizes: {
    h1: '32px',
    h2: '24px',
    h3: '20px',
    body: '16px',
    button: '14px',
    label: '14px',
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
  styles: {
    global: {
      body: {
        bg: '#F9FAFB',
        color: '#111',
        fontFamily: 'Inter, sans-serif',
      },
    },
  },
});

export default theme; 