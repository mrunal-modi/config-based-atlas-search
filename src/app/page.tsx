'use client';
import React, { useState } from 'react';
import { Tabs, Tab, Box } from '@mui/material';
import SearchBar from '@/components/SearchBar';
import BannerImage from '@/components/BannerImage';
import searchConfigs from '@/config/searchConfigs';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function SearchPage() {
  const [value, setValue] = useState(0);
  const categories = [
    { name: 'Princes of India', config: searchConfigs.princesofindia },
    { name: 'MongoDB Examples', config: searchConfigs.mongodbExamples },
    { name: 'Declarative Documents', config: searchConfigs.declarativeDocuments },
  ];

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '1200px', margin: '0 auto', padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <BannerImage
        src="/SearchQueryImage.png"
        alt="Atlas Search"
        width={200}
        height={200}
      />
      <Box sx={{ width: '100%', maxWidth: '800px', mt: 4 }}>
        <Box>
          <Tabs 
            value={value} 
            onChange={handleChange} 
            aria-label="search categories"
            centered
            sx={{ 
              '& .MuiTabs-flexContainer': { justifyContent: 'center' },
              '& .MuiTabs-indicator': { backgroundColor: '#1976d2' } // Keeps the indicator line
            }}
          >
            {categories.map((category, index) => (
              <Tab key={category.name} label={category.name} {...a11yProps(index)} />
            ))}
          </Tabs>
        </Box>
        {categories.map((category, index) => (
          <TabPanel key={category.name} value={value} index={index}>
            <SearchBar config={category.config} />
          </TabPanel>
        ))}
      </Box>
    </Box>
  );
}