"use client";

import React, { Suspense, Component, ErrorInfo, ReactNode, useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams, useParams, useRouter } from 'next/navigation';
import { useUser } from '@auth0/nextjs-auth0/client';
import { findOne, _updateOne, _insertOne, _deleteOne } from '@/lib/services';
import searchConfigs, { ConfigType } from '@/config/searchConfigs';
import { SearchConfig, Document } from '@/types/search';
import { DynamicDocumentWithId, DynamicDocumentWithRequiredId } from '@/types/document';
import {
  Typography,
  Box,
  TextField,
  Button,
  Paper,
  IconButton,
  Grid,
  Divider,
  Container,
  Alert,
  Tooltip
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import {
  Save as SaveIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Cancel as CancelIcon,
  FileCopy as CopyIcon,
} from '@mui/icons-material';

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
  const theme = useTheme();
  return (
    <Box sx={{ p: 3, color: theme.palette.error.main }}>
      <Typography variant="h6">Error</Typography>
      <Typography>An unexpected error occurred. Please try again later.</Typography>
    </Box>
  );
}

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const StyledIconButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.primary.main,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const RenderField: React.FC<{ field: string; value: any; isEditing: boolean; onEdit: (field: string, value: any) => void }> = ({ field, value, isEditing, onEdit }) => {
  const theme = useTheme();

  if (value === null || value === undefined) {
    return <Typography variant="body2">N/A</Typography>;
  }

  if (Array.isArray(value)) {
    return (
      <Box component="ul" sx={{ paddingLeft: 3, margin: 0 }}>
        {value.map((item, index) => (
          <li key={index}>
            <RenderField
              field={`${field}[${index}]`}
              value={item}
              isEditing={isEditing}
              onEdit={(subField, newValue) => {
                const newArray = [...value];
                newArray[index] = newValue;
                onEdit(field, newArray);
              }}
            />
          </li>
        ))}
      </Box>
    );
  }

  if (typeof value === 'object') {
    return (
      <Box>
        {Object.entries(value).map(([key, val]) => (
          <Box key={key} sx={{ mb: 1 }}>
            <Typography variant="subtitle2" component="span" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>{key}:</Typography>
            <RenderField
              field={`${field}.${key}`}
              value={val}
              isEditing={isEditing}
              onEdit={(subField, newValue) => {
                onEdit(field, { ...value, [key]: newValue });
              }}
            />
          </Box>
        ))}
      </Box>
    );
  }

  if (isEditing) {
    return (
      <TextField
        fullWidth
        value={value}
        onChange={(e) => onEdit(field, e.target.value)}
        variant="outlined"
        size="small"
      />
    );
  }

  return <Typography variant="body2">{String(value)}</Typography>;
};

function DetailResultPageContent() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const configType = searchParams.get('configType') as ConfigType | null;
  const id = params.id;

  const [document, setDocument] = useState<DynamicDocumentWithId | null>(null);
  const [editState, setEditState] = useState<Partial<DynamicDocumentWithId>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { user, error: userError, isLoading } = useUser();
  const namespace = process.env.NEXT_PUBLIC_AUTH0_NAMESPACE;
  const auth0User = user as any;
  const roles = useMemo(() => {
    if (auth0User && namespace && `${namespace}/roles` in auth0User) {
      return auth0User[`${namespace}/roles`] as string[];
    }
    return [];
  }, [auth0User, namespace]);
  const isAdmin = roles.includes("Admin");

  if (!configType) {
    return <Typography color="error">Error: No configuration type specified</Typography>;
  }

  const config = searchConfigs[configType];

  if (!config) {
    return <Typography color="error">Error: Invalid configuration type</Typography>;
  }

  const loadDocument = async (documentId: string) => {
    try {
      const result = await findOne(config, documentId);
      if (result) {
        setDocument(result as Document);
        setError(null);
      } else {
        setError('Document not found');
      }
    } catch (error) {
      console.error('Error fetching document:', error);
      setError('An error occurred while fetching the document');
    }
  };

  useEffect(() => {
    if (typeof id === 'string') {
      loadDocument(id);
    }
  }, [id, config]);

  const handleEdit = () => {
    setIsEditing(true);
    setEditState({ ...document });
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditState({});
  };

  const handleFieldChange = (field: string, value: any) => {
    setEditState((prev) => {
      const newState = JSON.parse(JSON.stringify(prev));
      const fieldParts = field.split('.');
      let current = newState;
      for (let i = 0; i < fieldParts.length - 1; i++) {
        if (!(fieldParts[i] in current)) {
          current[fieldParts[i]] = {};
        }
        current = current[fieldParts[i]];
      }
      current[fieldParts[fieldParts.length - 1]] = value;
      return newState;
    });
  };

  const handleSave = async () => {
    try {
      if (!document || !document._id) {
        setError('Cannot update document: Missing document ID');
        return;
      }

      const updatedDocument: DynamicDocumentWithRequiredId = { 
        ...document, 
        ...editState, 
        _id: document._id 
      };
      const { _id, ...updateData } = updatedDocument;

      await _updateOne(config, _id.toString(), updateData);

      setDocument(updatedDocument);
      setIsEditing(false);
      setEditState({});
      setSuccess('Document updated successfully');
      setError(null);
    } catch (error) {
      console.error('Error updating document:', error);
      setError('An error occurred while updating the document');
    }
  };

  const handleCopyDocument = async () => {
    try {
      if (!document) return;
      setIsCopying(true);
      const { _id, ...docData } = document;
      const titleField = config.searchResultsSuggestionsField;
      const originalTitle = docData[titleField] || 'Untitled';

      const copyRegex = /\(Copy (\d+)\)$/;
      const match = originalTitle.match(copyRegex);
      let copyNumber = 1;
      if (match) {
        copyNumber = parseInt(match[1]) + 1;
      }
      docData[titleField] = `${originalTitle}${match ? '' : ' '}(Copy ${copyNumber})`;

      if (user) {
        docData.userId = user.sub;
        docData.userEmail = user.email;
      }

      const result = await _insertOne(config, docData);
      if (result.insertedId) {
        const newDocument = await findOne(config, result.insertedId);
        if (newDocument) {
          setDocument(newDocument as Document);
          setEditState({});
          router.push(`/result/${result.insertedId}?configType=${configType}`);
          setSuccess('Document copied successfully');
        } else {
          setError('New document created but not immediately available. Please refresh the page.');
        }
      } else {
        setError('Failed to create a copy of the document');
      }
    } catch (error) {
      console.error('Error copying document:', error);
      setError('An error occurred while copying the document');
    } finally {
      setIsCopying(false);
    }
  };

  const handleDeleteDocument = useCallback(async () => {
    if (!document || !document._id) return;
    try {
      await _deleteOne(config, document._id.toString());
      router.push('/');
      setSuccess('Document deleted successfully');
    } catch (error: any) {
      console.error('Error deleting document:', error);
      setError(error.message || 'An error occurred while deleting the document');
    }
  }, [document, config, router]);

  if (error) return <Alert severity="error">{error}</Alert>;
  if (!document) return <Typography>Loading...</Typography>;

  return (
    <Container maxWidth="md">
      <Box my={4}>
        <Typography 
          variant="h4" 
          component="h1" 
          align="center" 
          gutterBottom
          sx={{ color: theme.palette.primary.main }}
        >
          Document Details
        </Typography>
        
        <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          {isAdmin && (
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
              <Tooltip title={isEditing ? "Cancel editing" : "Edit document"}>
                <StyledIconButton
                  onClick={isEditing ? handleCancel : handleEdit}
                  size="small"
                >
                  {isEditing ? <CancelIcon /> : <EditIcon />}
                </StyledIconButton>
              </Tooltip>
              {isEditing && (
                <Tooltip title="Save changes">
                  <StyledIconButton onClick={handleSave} size="small">
                    <SaveIcon />
                  </StyledIconButton>
                </Tooltip>
              )}
              <Tooltip title="Copy document">
                <StyledIconButton
                  onClick={handleCopyDocument}
                  disabled={isCopying}
                  size="small"
                >
                  <CopyIcon />
                </StyledIconButton>
              </Tooltip>
              <Tooltip title="Delete document">
                <StyledIconButton 
                  onClick={handleDeleteDocument} 
                  size="small"
                >
                  <DeleteIcon />
                </StyledIconButton>
              </Tooltip>
            </Box>
          )}

          <Grid container spacing={3}>
            {config.findOneDetailFields.map((field) => {
              const fieldValue = isEditing ? (editState[field] ?? document[field]) : document[field];
              if (fieldValue === undefined || fieldValue === null) return null;

              const isTitleField = field === config.searchResultsSuggestionsField;
    
              return (
                <Grid item xs={12} key={field}>
                  <Typography variant="subtitle1" sx={{ color: theme.palette.primary.main, fontWeight: 600 }}>{field}:</Typography>
                  {isTitleField ? (
                    isEditing ? (
                      <TextField
                        fullWidth
                        value={fieldValue}
                        onChange={(e) => handleFieldChange(field, e.target.value)}
                        variant="outlined"
                      />
                    ) : (
                      <Typography variant="h6">{fieldValue}</Typography>
                    )
                  ) : (
                    <RenderField
                      field={field}
                      value={fieldValue}
                      isEditing={isEditing}
                      onEdit={handleFieldChange}
                    />
                  )}
                  <Divider sx={{ my: 2 }} />
                </Grid>
              );
            })}
          </Grid>

          {isEditing && (
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <StyledButton 
                onClick={handleSave}
                variant="contained" 
                disabled={isCopying}
              >
                Save Changes
              </StyledButton>
            </Box>
          )}
        </Paper>
      </Box>
    </Container>
  );
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