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

   const fetchReviewTypes = async (force = false) => {
    if (hasFetched && !force) return;

    const params = {pagination : false}
    const queryString = buildQueryParams(params);
    setLoading(true);
    try {
        const response = await GetCall(`/mrkt/api/mrkt/reviewTypes${queryString}`);
        console.log(response.data);
        setReviewTypesList(response.data || []);
        setTotalRecords(response.total || 0);
        setHasFetched(true); // mark as fetched after first success
    } catch (err) {
        setAlert('error', 'Something went wrong!');
    } finally {
        setLoading(false);
    }
};

    useEffect(() => {
        fetchReviewTypes();
    }, []); // only once on mount

    const value: any = useMemo(() => ({
        reviewTypesList,
        totalRecords,
        loading,
        refetchReviewTypes: () => fetchReviewTypes(true)
    }), [reviewTypesList, totalRecords, loading]);

    return (
        <MarketingMasterContext.Provider value={value}>
            {children}
        </MarketingMasterContext.Provider>
    );
};
