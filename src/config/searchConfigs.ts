// src/config/searchConfigs.ts
import searchConfig1 from './searchConfig1';
import searchConfig2 from './searchConfig2';
import searchConfig3 from './searchConfig3';

const searchConfigs = {
  princesofindia: searchConfig1,
  mongodbExamples: searchConfig2,
  declarativeDocuments: searchConfig3
};

export type ConfigType = keyof typeof searchConfigs;

export default searchConfigs;