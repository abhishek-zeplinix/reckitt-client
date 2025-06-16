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

const AddTemplateTypeNew = () => {
    const [templateTypes, setTemplateTypes] = useState<any>('');
    const [templateTypesList, setTemplateTypesList] = useState<any>([]);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<any>();
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState<any>(false);
    const [selectedTemplateTypeId, setSelectedTemplateTypeId] = useState<any>();
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const { layoutState } = useContext(LayoutContext);
    const { setAlert, setLoading, isLoading } = useAppContext();
    const { refetchReviewTypes } = useMarketingMaster();
    // const [searchText, setSearchText] = useState<string>('');
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [searchText, debouncedSearchText, setSearchText] = useDebounce('', 1500);
    const { error: templateTypeError, validate: validateReviewType, resetError } = useZodValidation(reviewTypeSchema);

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
            const response = await GetCall(`/mrkt/api/mrkt/templateType?${queryString}`);
            console.log(response.data);
            setTemplateTypesList(response.data);
            setTotalRecords(response.total);
        } catch (err) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!validateReviewType(templateTypes)) return;
        setLoading(true);

        if (isEditMode) {
            try {
                const payload = { templateTypeName: templateTypes };
                const response = await PutCall(`/mrkt/api/mrkt/templateType/${selectedTemplateTypeId}`, payload);

                if (response.code?.toLowerCase() === 'success') {
                    setAlert('success', 'Template Types successfully updated!');
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
                const payload = { templateTypeName: templateTypes };
                const response = await PostCall('/mrkt/api/mrkt/templateType-create', payload);

                if (response.code.toLowerCase() === 'success') {
                    setAlert('success', 'Template Types successfully added!');
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
            const response = await DeleteCall(`/mrkt/api/mrkt/templateType/${selectedTemplateTypeId}`);

            if (response.code.toLowerCase() === 'success') {
                fetchData();
                refetchReviewTypes();
                closeDeleteDialog();
                setAlert('success', 'Template Types successfully deleted!');
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
        setTemplateTypes('');
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
            setSelectedTemplateTypeId(perm.templateTypeId);
        }

        if (action === ACTIONS.EDIT) {
            setTemplateTypes(perm.templateTypeName);
            setSelectedTemplateTypeId(perm.templateTypeId);
            setIsEditMode(true);
        }
    };

    return (
        <>
            <div className="flex flex-column justify-center items-center gap-2">
                <div className="flex flex-column gap-2">
                    <label htmlFor="templateTypes">Template Type <span style={{ color: 'red' }}>*</span></label>

                    <InputText aria-label="Add Template Type" value={templateTypes} onChange={(e) => setTemplateTypes(e.target.value)} className='w-full sm:w-30rem' />
                    {templateTypeError ? (
                        <small className="p-error">{templateTypeError}</small>
                    ) : <small>
                        <i>Enter a Template Type you want to add.</i>
                    </small>}

                </div>
                <SubmitResetButtons onSubmit={handleSubmit} label={isEditMode ? 'Update Template Type' : 'Add Template Type'} loading={isLoading} />
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
                                    placeholder="Search Template types..."
                                    className="w-full"
                                />
                            </span>
                        </div>
                        <CustomDataTable
                            ref={templateTypesList}
                            page={page}
                            limit={limit} // no of items per page
                            totalRecords={totalRecords} // total records from api response
                            isView={false}
                            isEdit={true} // show edit button
                            isDelete={true} // show delete button
                            data={templateTypesList?.map((item: any) => ({
                                templateTypeId: item?.templateTypeId,
                                templateTypeName: item?.templateTypeName
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
                                    header: 'Template Type Name',
                                    field: 'templateTypeName',
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
                        <span>Are you sure you want to delete this Template Type? </span>
                        <span>This action cannot be undone. </span>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default AddTemplateTypeNew;
