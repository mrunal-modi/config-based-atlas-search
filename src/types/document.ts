// src/types/document.ts

// Define a type for the _id field that can be either string or { toString(): string }
export type DocumentId = string | { toString(): string };

// Define the base document interface
export interface IDynamicDocument {
  [key: string]: any;
  _id?: DocumentId;
}

// Export a type that includes the _id field as optional
export type DynamicDocumentWithId = IDynamicDocument;

// Export a type for documents where _id is required
export type DynamicDocumentWithRequiredId = Required<Pick<IDynamicDocument, '_id'>> & IDynamicDocument;