import { InputText } from 'primereact/inputtext';
import { useContext, useEffect, useState } from 'react';
import SubmitResetButtons from '../control-tower/submit-reset-buttons';
import { DeleteCall, GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { useAppContext } from '@/layout/AppWrapper';
import CustomDataTable from '../CustomDataTable';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { ProgressSpinner } from 'primereact/progressspinner';
import { LayoutContext } from '@/layout/context/layoutcontext';
import TableSkeletonSimple from '../skeleton/TableSkeletonSimple';
import { useZodValidation } from '@/hooks/useZodValidation';
import { reviewTypeSchema } from '@/utils/validationSchemas';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { any } from 'zod';

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const AddRegionControl = () => {
    const [region, setRegion] = useState<any>('');
    // const [regionList, setRegionList] = useState<any>([]);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState<any>(false);
    const [selectedRegionId, setSelectedRegionId] = useState<any>();
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const { layoutState } = useContext(LayoutContext);
    const { setAlert, setLoading, isLoading } = useAppContext();
    const { error: regionError, validate: validateRegion, resetError } = useZodValidation(reviewTypeSchema);
    const queryClient: any = useQueryClient();

    const [filters, setFilters] = useState({});
    const [searchText, setSearchText] = useState('');


    const { data: regionList, totalRecords, isLoading: isFetchingRegions } = usePaginatedQuery(
        ['regions', { page, limit, filters, searchText }],
        async () => {
            const params = { page, limit, filters };
            // if (searchText) params.search = searchText;
            const queryString = buildQueryParams(params);
            const response = await GetCall(`/mrkt/api/mrkt/region?${queryString}`);
            return {
                data: response.data || [],
                total: response.total || 0
            }
        },
        {
            placeholderData: (previousData: any) => previousData,
            staleTime: 5 * 60 * 1000,
            gcTime: 10 * 60 * 1000
        }
    );

    const addRegionMutation = useMutation({
        mutationFn: (payload: any) => PostCall('/mrkt/api/mrkt/region', payload),
        onMutate: () => {
            setLoading(true);
        },
        onSuccess: (response) => {
            if (response.code?.toLowerCase() === 'success') {
                setAlert('success', 'Region successfully added!');
                queryClient.invalidateQueries(['regions']);
                resetInput();
            } else {
                setAlert('error', response.message || 'Something went Wrong!');
            }
        },
        onError: () => {
            setAlert('error', 'Something went Wrong!');
        },
        onSettled: () => {
            setLoading(false);
        }
    })

    const updateRegionMutatation = useMutation({
        mutationFn: ({ id, payload }: any) => PutCall(`/mrkt/api/mrkt/region/${id}`, payload),
         onMutate: () => {
            setLoading(true);
        },
        onSuccess: (response) => {
            if (response.code.toLowerCase() === 'success') {
                setAlert('success', 'Region successfully updated!');
                queryClient.invalidateQueries(['regions']);
                resetInput();
            } else {
                setAlert('error', response.message || 'Something went Wrong!');
            }
        },
        onError: () => {
            setAlert('error', 'Something went wrong!');
        },
         onSettled: () => {
            setLoading(false);
        }

    });


    const deleteRegionMutation = useMutation({
        mutationFn: (id: any) => DeleteCall(`/mrkt/api/mrkt/region/${id}`),
         onMutate: () => {
            setLoading(true);
        },
        onSuccess: (response) => {
            if (response.code.toLowerCase() === 'success') {
                setAlert('success', 'Region successfully deleted!');
                queryClient.invalidateQueries(['regions']);
                closeDeleteDialog();
            } else {
                setAlert('error', response.message || 'Something went wrong!');
                closeDeleteDialog();
            }
        },
        onError: () => {
            setAlert('error', 'Something went wrong!');
            closeDeleteDialog();
        },
         onSettled: () => {
            setLoading(false);
        }
    })

    const handleSubmit = async () => {
        if (!validateRegion(region)) return;
        const payload = { regionName: region };

        if (isEditMode) {
            updateRegionMutatation.mutate({ id: selectedRegionId, payload })
        } else {
            addRegionMutation.mutate(payload)
        }
    };

    const onDelete = async () => {
        deleteRegionMutation.mutate(selectedRegionId)
    };

    const resetInput = () => {
        setRegion('');
        setIsEditMode(false);
        resetError();
    };

    const openDeleteDialog = (items: any) => {
        setIsDeleteDialogVisible(true);
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogVisible(false);
    };

    const onRowSelect = async (perm: any, action: any) => {
        // setAction(action);

        if (action === ACTIONS.DELETE) {
            openDeleteDialog(perm);
            setSelectedRegionId(perm.regionId);
        }
        if (action === ACTIONS.EDIT) {
            setRegion(perm.regionName);
            setSelectedRegionId(perm.regionId);
            setIsEditMode(true);
        }
    };

    const handleLoad = (params: any) => {
        const newPage = params.first / params.rows + 1;
        setPage(newPage);
        setLimit(params.rows);
    };

    return (
        <>
            <div className="flex flex-column justify-center items-center gap-2">
                <label htmlFor="region">Add Region <span style={{ color: 'red' }}>*</span></label>
                <InputText aria-label="Add Region" value={region} onChange={(e) => setRegion(e.target.value)} className='w-full sm:w-30rem' />
                {regionError ? (
                    <small className="p-error">{regionError}</small>
                ) : <small>
                    <i>Enter a Review Type you want to add.</i>
                </small>}
                <SubmitResetButtons onSubmit={handleSubmit} label={isEditMode ? 'Update Region' : 'Add Region'} loading={isLoading} />
            </div>

            <div className="mt-4">
                {isFetchingRegions ? (
                    <TableSkeletonSimple columns={2} rows={5} />
                ) : (
                    <CustomDataTable
                        ref={regionList}
                        page={page}
                        limit={limit} // no of items per page
                        totalRecords={totalRecords} // total records from api response
                        isView={false}
                        isEdit={true} // show edit button
                        isDelete={true} // show delete button
                        data={regionList?.map((item: any) => ({
                            regionId: item?.regionId,
                            regionName: item?.regionName
                        }))}
                        // onLoad={() => handlePageChange}
                        onLoad={handleLoad}
                        columns={[
                            // {
                            //     header: 'Role ID',
                            //     field: 'roleId',
                            //     filter: true,
                            //     sortable: true,
                            //     bodyStyle: { minWidth: 150, maxWidth: 150 },
                            //     filterPlaceholder: 'Role ID'
                            // },
                            {
                                header: 'Sr. No.',
                                body: (data: any, options: any) => {
                                    const normalizedRowIndex = options.rowIndex % limit;
                                    const srNo = (page - 1) * limit + normalizedRowIndex + 1;

                                    return <span>{srNo}</span>;
                                },
                                bodyStyle: { minWidth: 50, maxWidth: 50 }
                            },
                            {
                                header: 'Region Name',
                                field: 'regionName',
                                filter: true,
                                bodyStyle: { minWidth: 150, maxWidth: 150 },
                                filterPlaceholder: 'Role'
                            }
                        ]}
                        // onLoad={(params: any) => fetchData(params)}
                        onDelete={(item: any) => onRowSelect(item, 'delete')}
                        onEdit={(item: any) => onRowSelect(item, 'edit')}
                    />
                )}
            </div>

            <Dialog
                header="Delete confirmation"
                visible={isDeleteDialogVisible}
                style={{ width: layoutState.isMobile ? '90vw' : '50vw' }}
                className="delete-dialog"
                footer={
                    <div className="flex justify-content-center p-2">
                        <Button label="Cancel" style={{ color: '#DF1740' }} className="px-7" text onClick={closeDeleteDialog} />
                        <Button label="Delete" style={{ backgroundColor: '#DF1740', border: 'none' }} className="px-7 hover:text-white" onClick={onDelete} loading={isLoading} />
                    </div>
                }
                onHide={closeDeleteDialog}
            >

                <div className="flex flex-column w-full surface-border p-2 text-center gap-4">
                    <i className="pi pi-info-circle text-6xl" style={{ marginRight: 10, color: '#DF1740' }}></i>

                    <div className="flex flex-column align-items-center gap-1">
                        <span>Are you sure you want to delete this region? </span>
                        <span>This action cannot be undone. </span>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default AddRegionControl;
// export default AddRegionControl;