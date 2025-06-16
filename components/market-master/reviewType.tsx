import { InputText } from 'primereact/inputtext';
import { useContext, useEffect, useRef, useState } from 'react';
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
import { useMarketingMaster } from '@/layout/context/marketingMasterContext';
import { useZodValidation } from '@/hooks/useZodValidation';
import { reviewTypeSchema } from '@/utils/validationSchemas';
import { useDebounce } from 'primereact/hooks';

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const AddReviewType = () => {
    const [rolesList, setRolesList] = useState<any>([]);
    const [reviewTypes, setReviewTypes] = useState<any>('');
    const [reviewTypesList, setReviewTypesList] = useState<any>([]);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<any>();
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState<any>(false);
    const [selectedReviewTypesId, setSelectedreviewTypesId] = useState<any>();
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const { layoutState } = useContext(LayoutContext);
    const { setAlert, setLoading, isLoading } = useAppContext();
    const { refetchReviewTypes } = useMarketingMaster();
    // const [searchText, setSearchText] = useState<string>('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [searchText, debouncedSearchText, setSearchText] = useDebounce('', 1500);
    const { error: reviewTypeError, validate: validateReviewType, resetError } = useZodValidation(reviewTypeSchema);

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (!searchText) return
        fetchData({ page: 1, limit: limit, search: debouncedSearchText });
    }, [debouncedSearchText]);


    const fetchData = async (params?: any) => {
        if (!params) {
            params = { page: page, limit: limit };
        }

        if (searchText) {
            params.search = searchText;
        }

        setPage(params.page);
        const queryString = buildQueryParams(params);
        setLoading(true);
        try {
            const response = await GetCall(`/mrkt/api/mrkt/reviewTypes?${queryString}`);
            console.log(response.data);
            setReviewTypesList(response.data);
            setTotalRecords(response.total);
        } catch (err) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!validateReviewType(reviewTypes)) return;
        setLoading(true);

        if (isEditMode) {
            try {
                const payload = { reviewTypeName: reviewTypes };
                const response = await PutCall(`/mrkt/api/mrkt/reviewTypes/${selectedReviewTypesId}`, payload);

                if (response.code.toLowerCase() === 'success') {
                    setAlert('success', 'Review Types successfully updated!');
                    resetInput();
                    fetchData();
                    refetchReviewTypes();
                }
            } catch (err) {
                setAlert('error', 'Something went wrong!');
            } finally {
                setLoading(false);
            }
        } else {
            try {
                const payload = { reviewTypeName: reviewTypes };
                const response = await PostCall('/mrkt/api/mrkt/reviewTypes', payload);

                if (response.code.toLowerCase() === 'success') {
                    setAlert('success', 'Review Types successfully added!');
                    resetInput();
                    fetchData();
                    refetchReviewTypes();
                }
            } catch (err) {
                setAlert('error', 'Something went wrong!');
            } finally {
                setLoading(false);
            }
        }
        resetInput();
    };

    const onDelete = async () => {
        setLoading(true);

        try {
            const response = await DeleteCall(`/mrkt/api/mrkt/reviewTypes/${selectedReviewTypesId}`);

            if (response.code.toLowerCase() === 'success') {
                setRolesList((prevRoles: any) => prevRoles.filter((reviewTypes: any) => reviewTypes.reviewTypeId !== selectedReviewTypesId));
                fetchData();
                refetchReviewTypes();
                closeDeleteDialog();
                setAlert('success', 'Review Types successfully deleted!');
            } else {
                setAlert('error', 'Something went wrong!');
                closeDeleteDialog();
            }
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const resetInput = () => {
        setReviewTypes('');
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
            setSelectedreviewTypesId(perm.reviewTypeId);
        }

        if (action === ACTIONS.EDIT) {
            setReviewTypes(perm.reviewTypeName);
            setSelectedreviewTypesId(perm.reviewTypeId);
            setIsEditMode(true);
        }
    };

    return (
        <>
            <div className="flex flex-column justify-center items-center gap-2">
                <div className="flex flex-column gap-2">
                    <label htmlFor="reviewTypes">Review Type <span style={{ color: 'red' }}>*</span></label>

                    <InputText aria-label="Add Review Type" value={reviewTypes} onChange={(e) => setReviewTypes(e.target.value)} className='w-full sm:w-30rem' />
                    {reviewTypeError ? (
                        <small className="p-error">{reviewTypeError}</small>
                    ) : <small>
                        <i>Enter a Review Type you want to add.</i>
                    </small>}

                </div>
                <SubmitResetButtons onSubmit={handleSubmit} label={isEditMode ? 'Update Review Type' : 'Add Review Type'} loading={isLoading} />
            </div>

            <div className="mt-4">
                {isLoading ? (
                    <TableSkeletonSimple columns={2} rows={5} />
                ) : (
                    <>

                        <div className="mb-3">
                            <span className="p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText
                                    ref={searchInputRef}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    placeholder="Search review types..."
                                    className="w-full"
                                />
                            </span>
                        </div>
                        <CustomDataTable
                            ref={reviewTypesList}
                            page={page}
                            limit={limit} // no of items per page
                            totalRecords={totalRecords} // total records from api response
                            isView={false}
                            isEdit={true} // show edit button
                            isDelete={true} // show delete button
                            data={reviewTypesList?.map((item: any) => ({
                                reviewTypeId: item?.reviewTypeId,
                                reviewTypeName: item?.reviewTypeName
                            }))}
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
                                    header: 'Review Type Name',
                                    field: 'reviewTypeName',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 150 },
                                    filterPlaceholder: 'Role'
                                }
                            ]}
                            onLoad={(params: any) => fetchData(params)}
                            onDelete={(item: any) => onRowSelect(item, 'delete')}
                            onEdit={(item: any) => onRowSelect(item, 'edit')}
                        />
                    </>
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
                        <span>Are you sure you want to delete this Review Type? </span>
                        <span>This action cannot be undone. </span>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default AddReviewType;
