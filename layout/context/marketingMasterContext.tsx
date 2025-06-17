'use client';
import { GetCall } from '@/app/api-config/ApiKit';
import { useAppContext } from '@/layout/AppWrapper';
import { buildQueryParams } from '@/utils/utils';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const MarketingMasterContext = createContext(null);

export const useMarketingMaster: any = () => useContext(MarketingMasterContext);

export const MarketingMasterProvider = ({ children }: any) => {
    const [reviewTypesList, setReviewTypesList] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasFetched, setHasFetched] = useState(false);
    const { setAlert } = useAppContext(); 



    const value: any = useMemo(() => ({
        reviewTypesList,
        totalRecords,
        loading,
    }), [reviewTypesList, totalRecords, loading]);

    return (
        <MarketingMasterContext.Provider value={value}>
            {children}
        </MarketingMasterContext.Provider>
    );
};
