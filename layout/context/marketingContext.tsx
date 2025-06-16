'use client';
import { createContext, useContext, useState } from 'react';

const MarketingLayoutContext = createContext<any>(null);

export const MarketingLayoutProvider = ({ children }: any) => {
  const [showBulkUploadDialog, setShowBulkUploadDialog] = useState(false);

  return (
    <MarketingLayoutContext.Provider value={{ showBulkUploadDialog, setShowBulkUploadDialog }}>
      {children}
    </MarketingLayoutContext.Provider>
  );
};

export const useMarketing = () => {
  const context = useContext(MarketingLayoutContext);
  if (!context) {
    throw new Error('useMarketing must be used within a MarketingProvider');
  }
  return context;
};