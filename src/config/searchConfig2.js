const db2Config = {
  // Database and Collection
  database: 'sample_search',
  collection: 'mongodbExamples',

  // Search Fields
  searchFields: ['title'],
  idField: '_id',
  searchResultsSummaryFields: ['title'],
  searchResultsSuggestionsField: 'title',
  findOneDetailFields: ['title', 'description', 'db', 'collection', 'method', 'query', 'index', 'searchIndex', 'url', 'isPublic','userId','userEmail'],

  // Index
  index: 'TitleSearchIndex',

  // Index Definition
  indexDefinition: {
    "mappings": {
      "dynamic": false,
      "fields": {
        "method": {
          "analyzer": "lucene.standard",
          "type": "string"
        },
        "title": {
          "maxGrams": 20,
          "minGrams": 3,
          "tokenization": "edgeGram",
          "type": "autocomplete"
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

export default db2Config;