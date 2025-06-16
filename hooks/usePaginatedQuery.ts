import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';

export const usePaginatedQuery = (queryKey: any, queryFn: any, options = {}) => {

    const query: any = useQuery({
        ...options,
        queryKey,
        queryFn
    });

    const paginationData = useMemo(() => {
        if (!query.data) {
            return {
                data: [],
                totalRecords: 0
            };
        }

    
        if (Array.isArray(query.data)) {
            //if response is an array
            return {
                data: query.data,
                totalRecords: query.data.length
            };
        }

        // if response is an object with data and total properties
        return {
            data: query.data.data || [],
            totalRecords: query.data.total || 0
        };
    }, [query.data]);

    return {
        ...query,
        data: paginationData.data,
        totalRecords: paginationData.totalRecords
    };
};