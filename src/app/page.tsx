"use client";

import React, { useEffect } from 'react';
import SearchBar from '@/components/SearchBar';
import BannerImage from '@/components/BannerImage';
import searchConfigs from '@/config/searchConfigs';

export default function SearchPage() {
  useEffect(() => {
    // console.log('searchConfigs:', JSON.stringify(searchConfigs, null, 2));
  }, []);

  return (
    <div className="container mx-auto p-4">
        <BannerImage
          src="/SearchQueryImage.png"
          alt="Atlas Search"
          width={200}
          height={200}
        />
        <SearchBar config={searchConfigs.princesofindia}/>
        <SearchBar config={searchConfigs.mongodbExamples}/>
        <SearchBar config={searchConfigs.declarativeDocuments}/>
    </div>
  );
}