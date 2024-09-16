// Header.tsx
"use client";

import React from 'react';
import NextLink from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { AppBar, Toolbar, Button, Box, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { LogIn, LogOut } from 'lucide-react';

interface Auth0User {
  name?: string;
  picture?: string;
  [key: string]: any;
}

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: 'white',
  color: theme.palette.text.primary,
}));

const StyledLink = styled('a')(({ theme }) => ({
  color: theme.palette.text.primary,
  textDecoration: 'none',
  fontSize: '13px',
  padding: theme.spacing(0.5),
  margin: '0 5px',
  display: 'inline-flex',
  alignItems: 'center',
  '&:hover': {
    textDecoration: 'underline',
  },
}));

const UserSection = styled(Box)({
  display: 'flex',
  alignItems: 'center',
});

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 32,
  height: 32,
  marginRight: theme.spacing(1),
}));

const StyledButton = styled(Button)({
  color: '#00674A',
  '&:hover': {
    backgroundColor: 'rgba(0, 103, 74, 0.04)',
  },
}) as typeof Button;  // This allows StyledButton to accept all props that Button accepts

const Header: React.FC = () => {
  const { user, error, isLoading } = useUser();

  const auth0User = user as Auth0User | undefined;

  return (
    <StyledAppBar position="static" elevation={0}>
      <Toolbar>
        <Box display="flex" flexGrow={1}>
          <NextLink href="/" passHref legacyBehavior>
            <StyledLink>Home</StyledLink>
          </NextLink>
          <NextLink href="https://www.myexampleapp.com/public-documents/next-js-config-based-mongodb-atlas-search-example" passHref legacyBehavior>
            <StyledLink>Documentation</StyledLink>
          </NextLink>
        </Box>
        <UserSection>
          {!isLoading && (
            <>
              {!auth0User && (
                <StyledButton
                  component="a"
                  href="/api/auth/login"
                  startIcon={<LogIn size={20} />}
                  size="small"
                >
                  Login
                </StyledButton>
              )}
              {auth0User && (
                <>
                  {auth0User.picture && (
                    <StyledAvatar
                      src={auth0User.picture}
                      alt={auth0User.name || 'User profile'}
                    />
                  )}
                  <StyledButton
                    component="a"
                    href="/api/auth/logout"
                    startIcon={<LogOut size={20} />}
                    size="small"
                  >
                    Logout
                  </StyledButton>
                </>
              )}
            </>
          )}
        </UserSection>
      </Toolbar>
    </StyledAppBar>
  );
};

export default Header;