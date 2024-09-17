// src/types/search.ts

import { ObjectId } from 'mongodb';

export interface SearchConfig {
  // Database and Collection
  database: string;
  collection: string;

  // Search Fields
  searchFields: string[];
  idField: string;
  searchResultsSummaryFields: string[];
  findOneDetailFields: string[];
  searchResultsSuggestionsField: string;

  // Index
  index: string;

  // Index Definition
  indexDefinition: {
    mappings: {
      dynamic: boolean;
      fields: {
        [key: string]: any;
      };
    };
  };

  // Client-side Configuration
  minSearchLength: number;
  maxSuggestions: number;
  debounceTime: number;
  defaultPageSize: number;
  maxPageSize: number;
  searchResultsPaginatedPage: string;
  searchResultDetailPath: string;
  searchQueryParam: string;
  locale: string;
  dateFormat: string;
}

export interface SearchResult {
  [key: string]: any;
}

export interface PaginatedResponse {
  results: SearchResult[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}

export interface MongoResult {
  acknowledged: boolean;
  [key: string]: any;
}

export interface InsertOneResult extends MongoResult {
  insertedId: string;
}

export interface UpdateResult extends MongoResult {
  matchedCount: number;
  modifiedCount: number;
  upsertedId: string | null;
}

export interface DeleteResult extends MongoResult {
  deletedCount: number;
}

export type ConfigType = 'persons' | 'mongodb' | 'documents';

export interface CodeField {
  type: 'html' | 'yaml' | 'json' | 'dockerfile' | 'makefile' | 'conf' | 'javascript';
  value: string;
}

export interface Step {
  instruction: string;
  code?: CodeField;
  image?: string;
  url?: string;
}

export interface Document {
  _id?: string | ObjectId;
  title: string;
  description: string;
  steps: Step[];
  code?: CodeField;
  [key: string]: any;
}