"use client";

import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';

const StyledFooter = styled('footer')(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  fontSize: '14px',
  fontFamily: theme.typography.fontFamily,
}));

const Footer: React.FC = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <StyledFooter>
      <Container maxWidth="lg">
        <Box py={2}>
          <Typography variant="body2" align="center">
            © {currentYear} MongoDBMethods.com
          </Typography>
        </Box>
      </Container>
    </StyledFooter>
  );
};

export default Footer;