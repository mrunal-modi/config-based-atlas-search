import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { search } from '../../lib/services';
import { SearchConfig, SearchResult, PaginatedResponse } from '../../types/search';
import { ConfigType } from '@/config/searchConfigs';
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
  TypographyProps,
} from '@mui/material';
import { styled } from '@mui/material/styles';

interface SearchResultsProps {
  config: SearchConfig;
  configType: ConfigType;
}

const StyledLink = styled(Link)(({ theme }) => ({
  textDecoration: 'none',
  color: 'inherit',
  display: 'block',
  width: '100%',
  '&:hover': {
    backgroundColor: 'rgba(var(--theme-background-color-rgb), 0.04)',
  },
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  padding: 0,
  borderRadius: theme.shape.borderRadius,
  border: '1px solid var(--theme-border-color)',
  overflow: 'hidden',
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  width: '100%',
  height: '100%',
  boxSizing: 'border-box',
}));

const StyledTypography = styled(Typography)<TypographyProps>({
  color: 'var(--theme-background-color)',
});

const StyledButton = styled(Button)({
  backgroundColor: 'var(--theme-background-color)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'var(--theme-border-color)',
  },
});

const SearchResultsInner: React.FC<SearchResultsProps> = ({ config, configType }) => {
  const searchParams = useSearchParams();
  const router = useRouter();
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
          const searchResults = await search(config, query, page, config.defaultPageSize, configType);
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

  if (loading) return <CircularProgress sx={{ color: 'var(--theme-background-color)' }} />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!query) return <Typography>No search query provided</Typography>;
  if (!results || !results.results || results.results.length === 0) return <Typography>No results found for &quot;{query}&quot;</Typography>;

  return (
    <Container maxWidth="md">
      <Box my={4} pb={10}>
      <StyledTypography variant="h5" component="h1" gutterBottom>
  Search Results for &quot;{query}&quot;
</StyledTypography>
        <Typography variant="subtitle1" gutterBottom>
          {results.totalCount} result(s) found
        </Typography>
        <List>
          {results.results.map((result) => (
            <StyledListItem key={result[config.idField]}>
              <StyledLink href={`${config.searchResultDetailPath.replace(':id', result[config.idField])}?configType=${configType}`}>
                <StyledPaper elevation={0}>
                  {config.searchResultsSummaryFields.map((field) => (
                    <Box key={field} mb={1}>
                      <Typography variant="body2" sx={{ color: 'var(--theme-background-color)', fontWeight: 600 }}>
                        {field}:
                      </Typography>
                      <Typography variant="body1">
                        {renderFieldValue(result, field)}
                      </Typography>
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
};

const SearchResults: React.FC<SearchResultsProps> = ({ config, configType }) => {
  return (
    <Suspense fallback={<CircularProgress sx={{ color: 'var(--theme-background-color)' }} />}>
      <SearchResultsInner config={config} configType={configType} />
    </Suspense>
  );
};

export default SearchResults;