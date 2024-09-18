// src/app/(view)/result/page.tsx
"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { searchDocuments, deleteDocument, duplicateDocument } from '@/lib/services';
import { SearchResult, PaginatedResponse } from '@/types/search';
import searchConfigs, { ConfigType } from '@/config/searchConfigs';
import {
  Container,
  Typography,
  Box,
  List,
  ListItem,
  Paper,
  Button,
  CircularProgress,
  Pagination,
  PaginationItem,
  IconButton,
  Tooltip,
  Alert,
  Chip,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  Delete as DeleteIcon,
  FileCopy as CopyIcon,
  Email as EmailIcon,
  Public as PublicIcon,
} from '@mui/icons-material';

const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
  width: '100%',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(1),
  padding: 0,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
  overflow: 'hidden',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
}));

const StyledTypography = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'component',
})<{ component?: React.ElementType }>(({ theme }) => ({
  color: theme.palette.text.primary,
  fontSize: '1rem',
  fontWeight: 600,
}));

const StyledBodyTypography = styled(Typography)(({ theme }) => ({
  fontSize: '0.875rem',
  color: theme.palette.text.secondary,
}));

const StyledTitleTypography = styled(Typography)(({ theme }) => ({
  fontSize: '1.125rem',
  marginBottom: theme.spacing(1),
  color: theme.palette.primary.main,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

function SearchResultsContent() {
  const { user, isLoading: userLoading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const theme = useTheme();
  const configType = searchParams.get('configType') as ConfigType;
  const config = searchConfigs[configType];
  const query = searchParams?.get(config.searchQueryParam);
  const page = parseInt(searchParams?.get('page') || '1', 10);
  const [results, setResults] = useState<PaginatedResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (query) {
        try {
          setLoading(true);
          setError(null);
          const searchResults = await searchDocuments(config, query, page, config.defaultPageSize, configType);
          setResults(searchResults);
        } catch (error) {
          setError('An error occurred while fetching search results');
        } finally {
          setLoading(false);
        }
      } else {
        setResults(null);
        setLoading(false);
      }
    };

    fetchResults();
  }, [query, page, config, configType]);

  const handleDelete = async (id: string) => {
    if (!user) {
      setError('You must be logged in to delete documents');
      return;
    }
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(config, id);
        if (results) {
          const updatedResults = {
            ...results,
            results: results.results.filter(item => item[config.idField] !== id),
            totalCount: results.totalCount - 1
          };
          setResults(updatedResults);
        }
      } catch (error) {
        console.error('Error deleting document:', error);
        setError('An error occurred while deleting the document');
      }
    }
  };

  const handleCopy = async (result: SearchResult) => {
    if (!user) {
      setError('You must be logged in to copy documents');
      return;
    }
    try {
      const newDocument = await duplicateDocument(config, result[config.idField]);
      if (newDocument && newDocument[config.idField]) {
        if (results) {
          const updatedResults = {
            ...results,
            results: [newDocument, ...results.results],
            totalCount: results.totalCount + 1
          };
          setResults(updatedResults);
        }
        console.log('Document copied successfully');
      } else {
        setError('Failed to create a copy of the document');
      }
    } catch (error) {
      console.error('Error copying document:', error);
      setError('An error occurred while copying the document');
    }
  };

  const handlePageChange = (event: React.ChangeEvent<unknown>, newPage: number) => {
    const newUrl = `${config.searchResultsPaginatedPage}?${config.searchQueryParam}=${encodeURIComponent(query || '')}&page=${newPage}&configType=${configType}`;
    router.push(newUrl);
  };

  const renderFieldValue = (result: SearchResult, field: string) => {
    const value = result[field];
    if (value === undefined || value === null) return 'N/A';
    if (field === 'yaml') {
      return value.substring(0, 50) + (value.length > 50 ? '...' : '');
    }
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    return String(value);
  };

  if (loading || userLoading) return <CircularProgress sx={{ color: theme.palette.primary.main }} />;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!query) return <Typography>No search query provided</Typography>;
  if (!results || !results.results || results.results.length === 0) return <Typography>No results found for &quot;{query}&quot;</Typography>;

  return (
    <Container maxWidth="md">
      <Box my={4} pb={10}>
        <StyledTypography variant="h6" component="h1" gutterBottom>
          Search Results for &quot;{query}&quot;
        </StyledTypography>
        <StyledBodyTypography variant="subtitle2" gutterBottom>
          {results.totalCount} result(s) found
        </StyledBodyTypography>
        <List>
          {results.results.map((result) => (
            <StyledListItem key={result[config.idField]}>
              <StyledLink href={`${config.searchResultDetailPath.replace(':id', result[config.idField])}?configType=${configType}`}>
                <StyledPaper elevation={0}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                    <StyledTitleTypography variant="h5">
                      {renderFieldValue(result, config.searchResultsSummaryFields[0])}
                    </StyledTitleTypography>
                    <Box display="flex" alignItems="center">
                      {result.isPublic && (
                        <Tooltip title="This document is public">
                          <Chip
                            icon={<PublicIcon fontSize="small" sx={{ color: 'white' }} />}
                            label="Public"
                            size="small"
                            sx={{
                              mr: 1,
                              backgroundColor: theme.palette.primary.main,
                              color: theme.palette.primary.contrastText,
                              '& .MuiChip-icon': {
                                color: 'white',
                              },
                            }}
                          />
                        </Tooltip>
                      )}

                      {result.userEmail && (
                        <Tooltip title={`Contact Author: ${result.userEmail}`}>
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              window.location.href = `mailto:${result.userEmail}`;
                            }}
                          >
                            <EmailIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                          </IconButton>
                        </Tooltip>
                      )}

                      {user && (
                        <>
                          <Tooltip title="Copy document">
                            <IconButton onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleCopy(result); }} size="small">
                              <CopyIcon fontSize="small" sx={{ color: theme.palette.primary.main }} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete document">
                            <IconButton onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDelete(result[config.idField]); }} size="small">
                              <DeleteIcon fontSize="small" sx={{ color: theme.palette.error.main }} />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}

                    </Box>
                  </Box>
                  {config.searchResultsSummaryFields.slice(1).map((field) => (
                    <Box key={field} mb={0.5}>
                      <StyledBodyTypography variant="body2" sx={{ fontWeight: 600 }}>
                        {field}:
                      </StyledBodyTypography>
                      <StyledBodyTypography variant="body2">
                        {renderFieldValue(result, field)}
                      </StyledBodyTypography>
                    </Box>
                  ))}
                </StyledPaper>
              </StyledLink>
            </StyledListItem>
          ))}
        </List>
        <Box display="flex" justifyContent="center" mt={4}>
          <Pagination
            count={results.totalPages}
            page={results.currentPage}
            onChange={handlePageChange}
            renderItem={(item) => (
              <PaginationItem
                component={StyledButton}
                {...item}
              />
            )}
          />
        </Box>
      </Box>
    </Container>
  );
}

export default function SearchResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}