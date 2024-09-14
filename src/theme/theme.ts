'use client';
import { Roboto } from 'next/font/google';
import { createTheme } from '@mui/material/styles';

const roboto = Roboto({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  typography: {
    fontFamily: roboto.style.fontFamily,
  },
  palette: {
    primary: {
      main: '#00674A', // Dark green (theme-background-color)
      light: '#008060', // Slightly lighter green (theme-border-color)
      dark: '#004D38', // Darker shade of the main color
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#00674A', // Dark green (theme-background-color)
      light: '#008060', // Slightly lighter green (theme-border-color)
      dark: '#004D38', // Darker shade of the main color
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F5F5F5', // Light gray for the main background
      paper: '#FFFFFF', // White for paper elements
    },
    text: {
      primary: '#333333', // Dark gray for primary text
      secondary: '#757575', // Medium gray for secondary text
    },
    error: {
      main: '#F44336', // Red for error states
    },
    warning: {
      main: '#FFA726', // Orange for warning states
    },
    info: {
      main: '#29B6F6', // Light blue for info states
    },
    success: {
      main: '#66BB6A', // Green for success states
    },
  },
});

export default theme;