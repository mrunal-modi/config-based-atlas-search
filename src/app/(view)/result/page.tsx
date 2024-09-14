"use client";

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import SearchResults from '@/components/SearchContent/SearchResults';
import searchConfigs, { ConfigType } from '@/config/searchConfigs';

function ResultsPageContent() {
  const searchParams = useSearchParams();
  const configType = (searchParams.get('configType') as ConfigType);
  const query = searchParams.get('q');

  console.log('ResultsPage - configType:', configType);
  // console.log('ResultsPage - query:', query);

  const config = searchConfigs[configType];

  // The config object should now match the updated SearchConfig interface
  return <SearchResults config={config} configType={configType}/>;
}

export default function ResultsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultsPageContent />
    </Suspense>
  );
}