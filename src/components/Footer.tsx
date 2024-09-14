// Footer.tsx
"use client";

import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledFooter = styled('footer')({
  backgroundColor: 'var(--theme-background-color)',
  color: '#ffffff',
  fontSize: '14px',
  fontFamily: 'arial, sans-serif',
});

const Footer: React.FC = () => {
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