"use client";

import React from 'react';
import NextLink from 'next/link';
import { useUser } from '@auth0/nextjs-auth0/client';
import { AppBar, Toolbar, Button, Box, Avatar, Typography } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { LogIn, LogOut } from 'lucide-react';

interface Auth0User {
  name?: string;
  picture?: string;
  [key: string]: any;
}

const StyledAppBar = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
}));

const StyledLink = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'component',
})<{ component?: React.ElementType }>(({ theme }) => ({
  color: theme.palette.text.primary,
  textDecoration: 'none',
  fontSize: '13px',
  padding: theme.spacing(0.5),
  margin: '0 5px',
  display: 'inline-flex',
  alignItems: 'center',
  '&:hover': {
    textDecoration: 'underline',
    color: theme.palette.primary.main,
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

const StyledButton = styled(Button, {
  shouldForwardProp: (prop) => prop !== 'component',
})<{ component?: React.ElementType }>(({ theme }) => ({
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const Header: React.FC = () => {
  const { user, error, isLoading } = useUser();
  const theme = useTheme();

  const auth0User = user as Auth0User | undefined;

  return (
    <StyledAppBar position="static" elevation={0}>
      <Toolbar>
        <Box display="flex" flexGrow={1}>
          <NextLink href="/" passHref legacyBehavior>
            <StyledLink variant="body2" component="a">Home</StyledLink>
          </NextLink>
          <NextLink href="https://www.myexampleapp.com/public-documents/next-js-config-based-mongodb-atlas-search-example" passHref legacyBehavior>
            <StyledLink variant="body2" component="a">Documentation</StyledLink>
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