"use client";

import React, { Suspense, Component, ErrorInfo, ReactNode } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import SearchResultPage from '@/components/SearchContent/SearchResultPage';
import searchConfigs, { ConfigType } from '@/config/searchConfigs';
import { Typography, Box } from '@mui/material';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

function ErrorFallback() {
  return (
    <Box sx={{ p: 3, color: 'error.main' }}>
      <Typography variant="h6">Error</Typography>
      <Typography>An unexpected error occurred. Please try again later.</Typography>
    </Box>
  );
}

function DetailResultPageContent() {
  const searchParams = useSearchParams();
  const params = useParams();
  const configType = searchParams.get('configType') as ConfigType | null;
  const id = params.id;

  if (!configType) {
    return <Typography color="error">Error: No configuration type specified</Typography>;
  }

  const config = searchConfigs[configType];

  if (!config) {
    return <Typography color="error">Error: Invalid configuration type</Typography>;
  }

  // Ensure the config has searchFields
  const updatedConfig = {
    ...config,
    searchFields: config.searchFields || []
  };

  return <SearchResultPage config={updatedConfig} configType={configType} />;
}

export default function DetailResultPage() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <Suspense fallback={<div>Loading...</div>}>
        <DetailResultPageContent />
      </Suspense>
    </ErrorBoundary>
  );
}