// src/lib/services.ts
import customAxios from './customAxios';
import { parse } from 'yaml';
import { SearchResult, PaginatedResponse, SearchConfig, InsertOneResult, UpdateResult, DeleteResult } from '../types/search';
import { ConfigType } from '@/config/searchConfigs';

export const searchDocuments = async (config: SearchConfig, query: string, page: number, pageSize: number, configType: ConfigType): Promise<PaginatedResponse> => {
  const response = await customAxios.get('/api/documents/search', { params: { q: query, page, pageSize, configType } });
  return response.data;
};

export const createDocument = async (config: SearchConfig, document: any): Promise<InsertOneResult> => {
  const response = await customAxios.post('/api/documents/create', { config, document });
  return response.data;
};

export const duplicateDocument = async (config: SearchConfig, id: string): Promise<SearchResult> => {
  const response = await customAxios.post(`/api/documents/${id}`, {
    selectedDatabase: config.database,
    collection: config.collection,
    config: {
      searchResultsSuggestionsField: config.searchResultsSuggestionsField
    }
  });
  return response.data.result;
};

export const getDocument = async (config: SearchConfig, id: string): Promise<SearchResult> => {
  const response = await customAxios.get(`/api/documents/${id}`, {
    params: {
      selectedDatabase: config.database,
      collection: config.collection,
      idField: config.idField,
      projection: config.findOneDetailFields.join(',')
    }
  });
  return response.data.result;
};

export const updateDocument = async (config: SearchConfig, id: string, update: Record<string, any>): Promise<UpdateResult> => {
  const response = await customAxios.put(`/api/documents/${id}`, {
    selectedDatabase: config.database,
    collection: config.collection,
    update
  });
  return response.data.result;
};

export const deleteDocument = async (config: SearchConfig, id: string): Promise<DeleteResult> => {
  const response = await customAxios.delete(`/api/documents/${id}`, {
    params: {
      selectedDatabase: config.database,
      collection: config.collection
    }
  });
  return response.data;
};