import customAxios from './customAxios';
import { parse, stringify } from 'yaml';
import { SearchResult, PaginatedResponse, SearchConfig, InsertOneResult, UpdateResult, DeleteResult } from '../types/search';
import searchConfigs, { ConfigType } from '@/config/searchConfigs';

export const search = async (
  config: SearchConfig,
  query: string,
  page: number = 1,
  pageSize: number,
  configType: ConfigType
): Promise<PaginatedResponse> => {
  try {
    console.log('Search function called with:', { config, query, page, pageSize, configType });
    
    const params: any = {
      q: query,
      page,
      pageSize,
      configType,
    };

    console.log('Sending request to:', config.searchEndpoint);
    console.log('With params:', params);

    const response = await customAxios.get<PaginatedResponse>(config.searchEndpoint, { params });
    
    console.log('Received response:', response.data);

    return response.data;
  } catch (error: any) {
    console.error('Error in search:', error);
    console.error('Error details:', error.response?.data);
    throw new Error(error.response?.data?.error || 'An error occurred while performing the search');
  }
};

export const findOne = async (config: SearchConfig, id: string): Promise<SearchResult> => {
  try {
    const response = await customAxios.get<{ result: SearchResult }>(config.findOneEndpoint, {
      params: {
        id,
        selectedDatabase: config.database,
        collection: config.collection,
        idField: config.idField,
        projection: config.findOneDetailFields.join(',')
      }
    });
    return response.data.result;
  } catch (error: any) {
    console.error('Error in findOne:', error);
    throw new Error(error.response?.data?.error || 'An error occurred while fetching the item');
  }
};

export const _insertOne = async (config: SearchConfig, document: any): Promise<InsertOneResult> => {
  try {
    if (document.yaml && typeof document.yaml === 'string') {
      try {
        document.yaml = parse(document.yaml);
      } catch (error) {
        console.error('Error parsing YAML:', error);
        throw new Error('Invalid YAML content');
      }
    }

    const response = await customAxios.post<{ result: InsertOneResult }>('/api/insertOne', {
      selectedDatabase: config.database,
      collection: config.collection,
      document
    });
    return response.data.result;
  } catch (error: any) {
    console.error('Error in _insertOne:', error);
    throw new Error(error.response?.data?.error || 'An error occurred while inserting the document');
  }
};

export const _updateOne = async (
  config: SearchConfig,
  id: string,
  update: Record<string, any>
): Promise<UpdateResult> => {
  try {
    // Remove _id from the update object if present
    if (update._id) {
      delete update._id;
    }

    // Parse YAML if present
    if (update.yaml && typeof update.yaml === 'string') {
      try {
        update.yaml = parse(update.yaml);
      } catch (error) {
        console.error('Error parsing YAML:', error);
        throw new Error('Invalid YAML content');
      }
    }

    const response = await customAxios.put<{ result: UpdateResult }>('/api/updateOne', { 
      selectedDatabase: config.database, 
      collection: config.collection, 
      id, 
      update
    });

    return response.data.result;
  } catch (error: any) {
    console.error('Error in _updateOne:', error);
    throw new Error(error.response?.data?.error || 'An error occurred while updating the document');
  }
};

export const _deleteOne = async (
  config: SearchConfig,
  id: string
): Promise<DeleteResult> => {
  try {
    const response = await customAxios.delete<{ result: DeleteResult }>('/api/deleteOne', {
      data: {
        selectedDatabase: config.database,
        collection: config.collection,
        id
      }
    });
    return response.data.result;
  } catch (error: any) {
    console.error('Error in _deleteOne:', error);
    throw new Error(error.response?.data?.error || 'An error occurred while deleting the document');
  }
};