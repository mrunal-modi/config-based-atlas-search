interface FieldConfig {
    type: string;
    [key: string]: any;
  }
  
  interface IndexDefinition {
    mappings: {
      dynamic: boolean;
      fields: {
        [key: string]: FieldConfig | FieldConfig[];
      };
    };
  }
  
  export function generateSearchPipeline(indexDefinition: IndexDefinition, query: string): any[] {
    if (!query.trim()) {
      return []; // Return an empty array if the query is empty or just whitespace
    }
  
    function generateSearchStage(fieldName: string, fieldConfig: FieldConfig): any {
      switch (fieldConfig.type) {
        case 'autocomplete':
          return {
            autocomplete: {
              query: query,
              path: fieldName,
              fuzzy: {
                maxEdits: 1,
                prefixLength: 3
              },
              tokenOrder: "sequential"
            }
          };
        case 'string':
          return {
            text: {
              query: query,
              path: fieldName,
              fuzzy: {
                maxEdits: 1,
                prefixLength: 3
              }
            }
          };
        default:
          return null;
      }
    }
  
    const searchStages = [];
  
    for (const [fieldName, fieldConfigs] of Object.entries(indexDefinition.mappings.fields)) {
      if (Array.isArray(fieldConfigs)) {
        fieldConfigs.forEach(config => {
          const stage = generateSearchStage(fieldName, config);
          if (stage) searchStages.push(stage);
        });
      } else {
        const stage = generateSearchStage(fieldName, fieldConfigs as FieldConfig);
        if (stage) searchStages.push(stage);
      }
    }
  
    return searchStages;
  }