const db3Config = {
  // Database and Collection
  database: 'sample_search',
  collection: 'declarativeDocuments',

  // Search Fields
  searchFields: ['title', 'userEmail'],  // Updated to include both fields
  idField: '_id',
  searchResultsSummaryFields: ['title', 'userEmail'],  // Updated to include userEmail
  searchResultsSuggestionsField: 'title',
  findOneDetailFields: ['title','Content','userId','createdAt','updatedAt','publicSlug','isPublic','userEmail'],

  // Index
  index: 'TitleAndEmailSearchIndex',  // Updated index name

  // Index Definition
  indexDefinition: {
    "mappings": {
      "dynamic": false,
      "fields": {
        "userEmail": [
          {
            "type": "string",
            "analyzer": "lucene.standard"
          },
          {
            "type": "autocomplete",
            "tokenization": "edgeGram",
            "minGrams": 3,
            "maxGrams": 20
          }
        ],
        "title": {
          "type": "autocomplete",
          "maxGrams": 20,
          "minGrams": 3,
          "tokenization": "edgeGram"
        }
      }
    }
  },

  // Client-side Configuration
  minSearchLength: 3,
  maxSuggestions: 10,
  debounceTime: 300,
  defaultPageSize: 10,
  maxPageSize: 50,
  searchEndpoint: '/api/search',
  findOneEndpoint: '/api/findOne',
  searchResultsPaginatedPage: '/result',
  searchResultDetailPath: '/result/:id',
  searchQueryParam: 'q',
  locale: 'en-US',
  dateFormat: 'yyyy-MM-dd'
};

export default db3Config;