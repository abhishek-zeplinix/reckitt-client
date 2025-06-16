'use client';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useContext, useEffect, useRef, useState } from 'react';
import SubmitResetButtons from '../control-tower/submit-reset-buttons';
import { DeleteCall, GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { useAppContext } from '@/layout/AppWrapper';
import CustomDataTable from '../CustomDataTable';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { LayoutContext } from '@/layout/context/layoutcontext';
import TableSkeletonSimple from '../skeleton/TableSkeletonSimple';
import { useMarketingMaster } from '@/layout/context/marketingMasterContext';
import { useZodValidation } from '@/hooks/useZodValidation';
import { textAndNumbersOnlySchema } from '@/utils/validationSchemas';
import { useDebounce } from 'primereact/hooks';

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const AddTemplateType = () => {
    const [rolesList, setRolesList] = useState<any>([]);
    const [selectedTemplateType, setSelectedTemplateType] = useState<any>(null);
    const [reviewTypeId, setReviewTypeId] = useState<any>(null);
    const [templateTypeList, setTemplateTypeList] = useState<any>([]);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<any>();
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState<any>(false);
    const [selectedMappingId, setSelectedMappingId] = useState<any>(); // To store the ID of the mapping for delete
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const { layoutState } = useContext(LayoutContext);
    const { setAlert, setLoading, isLoading } = useAppContext();
    const { reviewTypesList, loading: marketingMasterLoading } = useMarketingMaster();
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [searchText, debouncedSearchText, setSearchText] = useDebounce('', 1500);
    const [isAddTemplateTypeDialogVisible, setIsAddTemplateTypeDialogVisible] = useState(false);
    const [newTemplateTypeName, setNewTemplateTypeName] = useState('');
    const [templateTypesDropdown, setTemplateTypesDropdown] = useState<any>([]); // To store template types for the dropdown
    const { error: templateError, validate: validateTemplateType, resetError } = useZodValidation(textAndNumbersOnlySchema);


    useEffect(() => {
        fetchData();
        fetchTemplateTypes();
    }, [reviewTypeId]);

    useEffect(() => {
        if (!searchText) return
        fetchData({ page: 1, limit: limit, search: debouncedSearchText });
    }, [debouncedSearchText]);

    const fetchData = async (params?: any) => {
        if (!params) {
            params = { page: page, limit: limit, filters: { reviewTypeId } };
        } else {
            params.filters = { reviewTypeId };
        }
        setPage(params.page);
        const queryString = buildQueryParams(params);

        setLoading(true);
        try {
            // Fetch template type mappings based on selected review type
            const response = await GetCall(`/mrkt/api/mrkt/templateType-map-review?${queryString}`);
            setTemplateTypeList(response.data);
            setTotalRecords(response.total);
        } catch (err) {
            setAlert('error', 'Something went wrong while fetching mappings!');
        } finally {
            setLoading(false);
        }
    };

    const fetchTemplateTypes = async () => {
        setLoading(true);
        try {
            const response = await GetCall('/mrkt/api/mrkt/templateType');
            setTemplateTypesDropdown(response.data.map((type: any) => ({
                label: type.templateTypeName,
                value: type.templateTypeId
            })));
        } catch (err) {
            setAlert('error', 'Something went wrong while fetching template types!');
        } finally {
            setLoading(false);
        }
    }


    const handleAssignTemplateType = async () => {
        if (!reviewTypeId) {
            setAlert('error', 'Please select a Review Type!');
            return;
        }

        if (!selectedTemplateType) {
            setAlert('error', 'Please select a Template Type to assign!');
            return;
        }

        setLoading(true);
        console.log(selectedTemplateType);

        try {
            const payload = {
                templateTypeId: selectedTemplateType,
                reviewTypeId: reviewTypeId,
            };

            console.log(payload);

            const response = await PostCall(`/mrkt/api/mrkt/templateType-map-review`, payload);

            if (response.code.toLowerCase() === 'success') {
                setAlert('success', 'Template Type successfully assigned!');
                resetInput();
                fetchData();
            } else {
                setAlert('error', response.message || 'Failed to assign Template Type!');
            }
        } catch (err: any) {
            setAlert('error', err.message || 'Something went wrong while assigning Template Type!');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteMapping = async () => {
        if (!selectedMappingId) return;

        setLoading(true);

        try {
            const response = await DeleteCall(`/mrkt/api/mrkt/templateType-map-review/${selectedMappingId}`);

            if (response.code.toLowerCase() === 'success') {
                fetchData();
                closeDeleteDialog();
                setAlert('success', 'Template Type mapping successfully deleted!');
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

    const handleAddNewTemplateType = async () => {

        if (!validateTemplateType(newTemplateTypeName)) return;
        if (!newTemplateTypeName.trim()) {
            setAlert('error', 'Please enter a Template Type Name!');
            return;
        }

        setLoading(true);

        try {
            const payload = { templateTypeName: newTemplateTypeName };
            const response = await PostCall(`/mrkt/api/mrkt/templateType-create`, payload);

            if (response.code.toLowerCase() === 'success') {
                setAlert('success', 'New Template Type successfully added!');
                fetchTemplateTypes();
                setNewTemplateTypeName('');
                setIsAddTemplateTypeDialogVisible(false);
            } else {
                setAlert('error', response.message || 'Failed to add new Template Type!');
            }
        } catch (err: any) {
            setAlert('error', err.message || 'Something went wrong while adding new Template Type!');
        } finally {
            setLoading(false);
        }
    }


    const resetInput = () => {
        setSelectedTemplateType(null);
        setReviewTypeId(null);
        setIsEditMode(false);
        setSelectedMappingId(null);
        resetError();

    };

    const openDeleteDialog = (mapping: any) => {
        setIsDeleteDialogVisible(true);
        setSelectedMappingId(mapping.templateTypeMapReviewId);
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogVisible(false);
        setSelectedMappingId(null);
    };

    const onRowSelect = async (mapping: any, action: any) => {
        if (action === ACTIONS.DELETE) {
            openDeleteDialog(mapping);
        }
        // Edit action is not directly applicable here as we are mapping existing types
    };

    const reviewTypeOptions = reviewTypesList?.map((reviewType: any) => ({
        label: reviewType.reviewTypeName || '',
        value: reviewType.reviewTypeId || ''
    })) || [];

    return (
        <>
            <div className="flex flex-wrap justify-center items-center gap-2">
                <div className="flex flex-column gap-2">
                    <label htmlFor="reviewType">Review Type <span style={{ color: 'red' }}>*</span></label>
                    <Dropdown
                        id="reviewType"
                        value={reviewTypeId}
                        options={reviewTypeOptions}
                        onChange={(e) => setReviewTypeId(e.value)}
                        placeholder="Select Review Type"
                        className="w-full sm:w-30rem"
                        filter
                        showClear
                        disabled={marketingMasterLoading}
                    />
                    <small>
                        <i>Select a Review Type for the template assignment.</i>
                    </small>
                </div>

                <div className="flex flex-column gap-2">
                    <label htmlFor="templateTypeDropdown">Template Type <span style={{ color: 'red' }}>*</span></label>
                    <Dropdown
                        id="templateTypeDropdown"
                        value={selectedTemplateType}
                        options={templateTypesDropdown}
                        onChange={(e) => setSelectedTemplateType(e.value)}
                        placeholder="Select Template Type"
                        className="w-full sm:w-30rem"
                        filter
                        showClear
                        emptyMessage="No template types found."
                        itemTemplate={(option) => (
                            <div className="flex justify-content-between align-items-center">
                                <span>{option.label}</span>
                            </div>
                        )}
                        panelFooterTemplate={
                            <div className="py-2 px-3">
                                <Button
                                    label="Add New Template Type"
                                    icon="pi pi-plus"
                                    className="p-button-text w-full"
                                    onClick={() => setIsAddTemplateTypeDialogVisible(true)}
                                />
                            </div>
                        }
                    />
                    <small>
                        <i>Select a Template Type to assign to the Review Type.</i>
                    </small>
                </div>
            </div>

            <SubmitResetButtons
                onSubmit={handleAssignTemplateType}
                label="Assign Template Type"
                loading={isLoading}
            />

            <div className="mt-4">
                {isLoading ? (
                    <TableSkeletonSimple columns={3} rows={5} />
                ) : (
                    <>
                        <div className="mb-3">
                            <span className="p-input-icon-left">
                                <i className="pi pi-search" />
                                <InputText
                                    ref={searchInputRef}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    placeholder="Search template type mappings..."
                                    className="w-full"
                                />
                            </span>
                        </div>
                        <CustomDataTable
                            ref={templateTypeList} // This ref is not typically used for data tables, consider removing
                            page={page}
                            limit={limit} // no of items per page
                            totalRecords={totalRecords} // total records from api response
                            isView={false}
                            isEdit={false} // No direct edit for mapping
                            isDelete={false} // show delete button for mapping
                            data={templateTypeList?.map((item: any) => ({
                                templateTypeMapReviewId: item?.templateTypeMapReviewId,
                                templateTypeId: item?.templateTypeId,
                                reviewTypeId: item?.reviewTypeId,
                                templateTypeName: templateTypesDropdown?.find((type: any) => type.value === item?.templateTypeId)?.label || 'N/A',
                                reviewTypeName: reviewTypesList?.find((rt: any) => rt.reviewTypeId === item?.reviewTypeId)?.reviewTypeName || 'N/A'
                            }))}

                            showGridlines
                            columns={[
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
                                    header: 'Review Type',
                                    field: 'reviewTypeName',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 200 },
                                    filterPlaceholder: 'Review Type',
                                    
                                },
                                {
                                    header: 'Template Type Name',
                                    field: 'templateTypeName',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 200 },
                                    filterPlaceholder: 'Template Type'
                                }
                            ]}
                            onLoad={(params: any) => fetchData(params)}
                            onDelete={(item: any) => onRowSelect(item, 'delete')}
                        // onEdit is not needed for this mapping
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
                        <Button label="Delete" style={{ backgroundColor: '#DF1740', border: 'none' }} className="px-7 hover:text-white" onClick={handleDeleteMapping} />
                    </div>
                }
                onHide={closeDeleteDialog}
            >
                <div className="flex flex-column w-full surface-border p-2 text-center gap-4">
                    <i className="pi pi-info-circle text-6xl" style={{ marginRight: 10, color: '#DF1740' }}></i>
                    <div className="flex flex-column align-items-center gap-1">
                        <span>Are you sure you want to delete this Template Type mapping? </span>
                        <span>This action cannot be undone. </span>
                    </div>
                </div>
            </Dialog>

            <Dialog
                header="Add New Template Type"
                visible={isAddTemplateTypeDialogVisible}
                style={{ width: layoutState.isMobile ? '90vw' : '40vw' }}
                footer={
                    <div className="flex justify-content-end p-2">
                        <Button label="Cancel" className="p-button-text" onClick={() => setIsAddTemplateTypeDialogVisible(false)} />
                        <Button label="Add" onClick={handleAddNewTemplateType} loading={isLoading} />
                    </div>
                }
                onHide={() => setIsAddTemplateTypeDialogVisible(false)}
            >
                <div className="flex flex-column gap-2">
                    <label htmlFor="newTemplateTypeName">Template Type Name <span style={{ color: 'red' }}>*</span></label>
                    <InputText
                        id="newTemplateTypeName"
                        value={newTemplateTypeName}
                        onChange={(e) => setNewTemplateTypeName(e.target.value)}
                        placeholder="Enter new Template Type Name"
                    />
                    {templateError ? (
                        <small className="p-error">{templateError}</small>
                    ) : <small>
                        <i>Enter a Template Type you want to add.</i>
                    </small>}
                </div>
            </Dialog>
        </>
    );
};

export default AddTemplateType;
