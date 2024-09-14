import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { search } from '@/lib/services';
import { SearchResult, PaginatedResponse, SearchConfig } from '@/types/search';
import { styled } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import SearchIcon from '@mui/icons-material/Search';
import Paper from '@mui/material/Paper';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import searchConfigs, { ConfigType } from '@/config/searchConfigs';

interface SearchBarProps {
  config: SearchConfig;
}

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: '30px',
  backgroundColor: '#fff',
  border: '2px solid #00674A',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  marginTop: '16px',
  marginBottom: '80px',
  width: '100%',
  maxWidth: 800,
  display: 'flex',
  alignItems: 'center',
  margin: '16px auto 80px',
  [theme.breakpoints.down('sm')]: {
    maxWidth: '90%', // Reduce width on mobile
    marginTop: '8px',
    marginBottom: '40px',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: '0 16px',
  height: '100%',
  position: 'absolute',
  right: 0,
  top: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  [theme.breakpoints.down('sm')]: {
    padding: '0 12px', // Slightly reduce padding on mobile
  },
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  width: '100%',
  '& .MuiInputBase-input': {
    padding: '12px 16px',
    paddingRight: '48px',
    width: '100%',
    fontSize: 16,
    fontFamily: 'arial, sans-serif',
    [theme.breakpoints.down('sm')]: {
      fontSize: 14, // Slightly reduce font size on mobile
      padding: '10px 14px',
      paddingRight: '40px',
    },
  },
}));

const SuggestionsList = styled(Paper)(({ theme }) => ({
  position: 'absolute',
  top: 'calc(100% + 8px)',
  left: 0,
  right: 0,
  zIndex: 1000,
  maxHeight: 400,
  overflow: 'auto',
  borderRadius: 8,
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  [theme.breakpoints.down('sm')]: {
    maxHeight: 300, // Reduce max height on mobile
  },
}));

const SearchBar: React.FC<SearchBarProps> = ({ config }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const configType = useMemo(() => {
    const type = (Object.keys(searchConfigs) as ConfigType[]).find(
      key => searchConfigs[key] === config
    );
    console.log('Derived configType:', type);
    return type;
  }, [config]);

  useEffect(() => {
    if (!config || !configType) {
      console.log('Config or configType is undefined', { config, configType });
      return;
    }

    const debounceSearch = setTimeout(() => {
      if (query.length >= config.minSearchLength) {
        console.log('Initiating search with:', { query, configType, config });
        search(config, query, 1, config.maxSuggestions, configType)
          .then((searchResults: PaginatedResponse) => {
            console.log('Search results:', searchResults);
            setResults(searchResults.results);
            setIsOpen(true);
            setSelectedIndex(-1);
          })
          .catch(error => {
            console.error('Search error:', error);
            setResults([]);
            setIsOpen(false);
          });
      } else {
        console.log('Query too short, clearing results');
        setResults([]);
        setIsOpen(false);
      }
    }, config.debounceTime);

    return () => clearTimeout(debounceSearch);
  }, [query, config, configType]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    console.log('Input changed:', newQuery);
    setQuery(newQuery);
    setIsOpen(true);
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!config || !configType) return;
    if (query) {
      if (selectedIndex >= 0 && selectedIndex < results.length) {
        handleSuggestionClick(results[selectedIndex]);
      } else {
        const searchPath = `${config.searchResultsPaginatedPage}?${config.searchQueryParam}=${encodeURIComponent(query)}&configType=${configType}`;
        router.push(searchPath);
      }
      setIsOpen(false);
    }
  };

  const handleSuggestionClick = (result: SearchResult) => {
    if (!config || !configType) return;
    const detailPath = config.searchResultDetailPath.replace(':id', result[config.idField]);
    router.push(`${detailPath}?configType=${configType}`);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const placeholderText = config 
    ? `Search ${config.database} ${config.collection}${isMobile ? '' : ` by ${config.searchFields.join(', ')}`}...`
    : 'Search...';

  if (!config || !configType) {
    return <Typography>Invalid configuration</Typography>;
  }

  return (
    <Search>
      <StyledInputBase
        placeholder={placeholderText}
        inputProps={{ 'aria-label': 'search' }}
        inputRef={inputRef}
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
      />
      <SearchIconWrapper onClick={() => handleSubmit()}>
        <SearchIcon style={{ color: '#00674A' }} />
      </SearchIconWrapper>
      {isOpen && (
        <SuggestionsList elevation={3}>
          <List>
            {results.length > 0 ? (
              results.map((result, index) => (
                <ListItem key={result[config.idField]} disablePadding>
                  <ListItemButton
                    onClick={() => handleSuggestionClick(result)}
                    selected={index === selectedIndex}
                    sx={{
                      '&:hover, &.Mui-selected': {
                        backgroundColor: '#f5f5f5',
                      },
                    }}
                  >
                    <ListItemText 
                      primary={result[config.searchResultsSuggestionsField]}
                      primaryTypographyProps={{
                        fontFamily: 'arial, sans-serif',
                        fontSize: isMobile ? 14 : 16,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText 
                  primary="No results found"
                  primaryTypographyProps={{
                    fontFamily: 'arial, sans-serif',
                    fontSize: isMobile ? 14 : 16,
                    color: '#666',
                  }}
                />
              </ListItem>
            )}
          </List>
        </SuggestionsList>
      )}
    </Search>
  );
};

export default SearchBar;