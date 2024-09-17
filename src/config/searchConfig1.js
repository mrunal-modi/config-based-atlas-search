const db1Config = {
  // Database and Collection
  database: 'sample_search',
  collection: 'princesofindia',

  // Search Fields
  searchFields: ['name'],
  idField: '_id',
  searchResultsSummaryFields: ['name'],
  searchResultsSuggestionsField: 'name',
  findOneDetailFields: ['name', 'bio', 'isPublic', 'userId', 'userEmail'],

  // Index
  index: 'NameSearchIndex',

  // Index Definition
  indexDefinition: {
    "mappings": {
      "dynamic": false,
      "fields": {
        "name": [
          {
            "foldDiacritics": true,
            "maxGrams": 15,
            "minGrams": 3,
            "tokenization": "edgeGram",
            "type": "autocomplete"
          },
          {
            "type": "string",
            "analyzer": "lucene.standard"
          }
        ]
      }
    }
  },

  // Client-side Configuration
  minSearchLength: 3,
  maxSuggestions: 10,
  debounceTime: 300,
  defaultPageSize: 10,
  maxPageSize: 50,
  searchResultsPaginatedPage: '/result',
  searchResultDetailPath: '/result/:id',
  searchQueryParam: 'q',
  locale: 'en-US',
  dateFormat: 'yyyy-MM-dd'
};

export default db1Config;