'use client';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useContext, useEffect, useState } from 'react';
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
import { reviewTypeSchema } from '@/utils/validationSchemas';

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const AddUserGroup = () => {
    const [templateTypesList, setTemplateTypesList] = useState<any>([]);
    const [userGroup, setUserGroup] = useState<any>('');
    const [reviewTypeId, setReviewTypeId] = useState<any>('');
    const [templateTypeId, setTemplateTypeId] = useState<any>('');
    const [userGroupList, setUserGroupList] = useState<any>([]);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<any>();
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState<any>(false);
    const [selectedUserGroupId, setSelectedUserGroupId] = useState<any>();
    const [selectedReviewTypeIdForDelete, setSelectedReviewTypeIdForDelete] = useState<any>();
    const [selectedTemplateTypeIdForDelete, setSelectedTemplateTypeIdForDelete] = useState<any>();
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const { layoutState } = useContext(LayoutContext);
    const { setAlert, setLoading, isLoading } = useAppContext();
    const { reviewTypesList, loading } = useMarketingMaster();
    const { error: reviewTypeError, validate: validateTemplateType, resetError } = useZodValidation(reviewTypeSchema);


    console.log(templateTypeId, 'templateTypeId');
    
    useEffect(() => {
        // if (reviewTypeId) {
            fetchUserGroups();
        // } else {
        //     setUserGroupList([]);
        //     setTotalRecords(0);
        // }
    }, [reviewTypeId, templateTypeId]);

    // Fetch template types when review type is selected
    const fetchTemplateTypes = async (reviewTypeId: any) => {
        if (!reviewTypeId) {
            setTemplateTypesList([]);
            return;
        }

        setLoading(true);

        const params = { filters: { reviewTypeId }, pagination: false};
        const queryString = buildQueryParams(params);
        try {
            const response = await GetCall(`/mrkt/api/mrkt/templateType?${queryString}`);
            setTemplateTypesList(response.data || []);
        } catch (err) {
            setAlert('error', 'Failed to fetch template types!');
            setTemplateTypesList([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch user groups for selected template type
    const fetchUserGroups = async (params?: any) => {
        // if (!reviewTypeId) return;

        setLoading(true);
        if (!params) {
         params = {limit: limit, page: page, filters: { reviewTypeId, templateTypeId }, sortOrder: "desc", sortBy: "userGroupId" };
        }else{
            params.filters = { reviewTypeId, templateTypeId };
            params.sortOrder = "desc";
            params.sortBy = "userGroupId";
        }
        setPage(params.page);
        const queryString = buildQueryParams(params);

        try {
            const response = await GetCall(`/mrkt/api/mrkt/user-group?${queryString}`);
            setUserGroupList(response.data || []);
            setTotalRecords(response.total || 0);
        } catch (err) {
            setAlert('error', 'Failed to fetch user groups!');
            setUserGroupList([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!validateTemplateType(userGroup)) return;

        if (!reviewTypeId) {
            setAlert('error', 'Please select a Review Type!');
            return;
        }

        if (!templateTypeId) {
            setAlert('error', 'Please select a Template Type!');
            return;
        }

        if (!userGroup.trim()) {
            setAlert('error', 'Please enter a User Group!');
            return;
        }

        setLoading(true);

        if (isEditMode) {
            try {
                const payload = {
                    userGroupName: userGroup,
                };
                const response = await PutCall(`/mrkt/api/mrkt/user-group/${selectedUserGroupId}/review-type/${reviewTypeId}/template-type/${templateTypeId}`, payload);

                if (response.code.toLowerCase() === 'success') {
                    setAlert('success', 'User Group successfully updated!');
                    resetInput();
                    fetchUserGroups();
                }else{
                     setAlert('error', response.error || 'Something went wrong!');
                }
            } catch (err) {
                setAlert('error', 'Something went wrong!');
            } finally {
                setLoading(false);
            }
        } else {
            try {
                const payload = { userGroupName: userGroup };
                const response = await PostCall(`/mrkt/api/mrkt/user-group/review-type/${reviewTypeId}/template-type/${templateTypeId}`, payload);

                if (response.code.toLowerCase() === 'success') {
                    setAlert('success', 'User Group successfully added!');
                    resetInput();
                    fetchUserGroups();
                }else{
                    setAlert('error', response.error || 'Something went wrong!');
                }
            } catch (err) {
                setAlert('error', 'Something went wrong!');
            } finally {
                setLoading(false);
            }
        }
    };

    const onDelete = async () => {
        setLoading(true);

        try {
            const response = await DeleteCall(`/mrkt/api/mrkt/user-group/${selectedUserGroupId}`);

            if (response.code.toLowerCase() === 'success') {
                fetchUserGroups();
                closeDeleteDialog();
                setAlert('success', 'User Group successfully deleted!');
            } else {
                 setAlert('error', response.error || 'Something went wrong!');
                closeDeleteDialog();
            }
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const resetInput = () => {
        setUserGroup('');
        setIsEditMode(false);
        resetError();
    };

    const openDeleteDialog = (items: any) => {
        setIsDeleteDialogVisible(true);
    };

    const closeDeleteDialog = () => {
        setIsDeleteDialogVisible(false);
    };

    const onRowSelect = async (item: any, action: any) => {
        if (action === ACTIONS.DELETE) {
            openDeleteDialog(item);
            setSelectedUserGroupId(item.userGroupId);
            setSelectedReviewTypeIdForDelete(item.reviewTypeId);
            setSelectedTemplateTypeIdForDelete(item.templateTypeId);
        }

        if (action === ACTIONS.EDIT) {
            setUserGroup(item.userGroupName);
            setReviewTypeId(item.reviewTypeId);
            setTemplateTypeId(item.templateTypeId);
            setSelectedUserGroupId(item.userGroupId);

            // Fetch template types for the selected review type
            await fetchTemplateTypes(item.reviewTypeId);
            setIsEditMode(true);
        }
    };

    const handleReviewTypeChange = async (value: any) => {
        setReviewTypeId(value);
        setTemplateTypeId('');
        setUserGroupList([]);
        setTotalRecords(0);

        if (value) {
            // await fetchUserGroups();
            await fetchTemplateTypes(value);
        } else {
            setTemplateTypesList([]);
            setUserGroupList([]);
            setTotalRecords(0);
        }
    };

    const reviewTypeOptions = reviewTypesList?.map((reviewType: any) => ({
        label: reviewType.reviewTypeName || '',
        value: reviewType.reviewTypeId || ''
    })) || [];

    const templateTypeOptions = templateTypesList?.map((templateType: any) => ({
        label: templateType.templateTypeName || '',
        value: templateType.templateTypeId || ''
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
                        onChange={(e) => handleReviewTypeChange(e.value)}
                        placeholder="Select Review Type"
                        className="w-full sm:w-30rem"
                        filter
                        showClear
                        disabled={loading}
                    />
                    <small>
                        <i>Select a Review Type for the user group.</i>
                    </small>
                </div>

                {reviewTypeId && (
                    <div className="flex flex-column gap-2">
                        <label htmlFor="templateType">Template Type <span style={{ color: 'red' }}>*</span></label>
                        <Dropdown
                            id="templateType"
                            value={templateTypeId}
                            options={templateTypeOptions}
                            onChange={(e) => setTemplateTypeId(e.value)}
                            placeholder="Select Template Type"
                            className="w-full sm:w-30rem"
                            filter
                            showClear
                            disabled={loading || !reviewTypeId}
                        />
                        <small>
                            <i>Select a Template Type for the user group.</i>
                        </small>
                    </div>
                )}

                {templateTypeId && (
                    <div className="flex flex-column gap-2">
                        <label htmlFor="userGroup">User Group <span style={{ color: 'red' }}>*</span></label>
                        <InputText
                            id="userGroup"
                            aria-label="Add User Group"
                            value={userGroup}
                            onChange={(e) => setUserGroup(e.target.value)}
                            className="w-full sm:w-30rem"
                            placeholder="Enter User Group"
                        />
                        {reviewTypeError ? (
                            <small className="p-error">{reviewTypeError}</small>
                        ) : <small>
                            <i>Enter a User Group you want to add.</i>
                        </small>}
                    </div>
                )}
            </div>

            {templateTypeId && (
                <SubmitResetButtons
                    onSubmit={handleSubmit}
                    label={isEditMode ? 'Update User Group' : 'Add User Group'}
                    loading={isLoading}
                />
            )}

            {/* {reviewTypeId && ( */}
                <div className="mt-4">
                    {isLoading ? (
                        <TableSkeletonSimple columns={4} rows={5} />
                    ) : (
                        <CustomDataTable
                            ref={userGroupList}
                            page={page}
                            limit={limit}
                            totalRecords={totalRecords}
                            isView={false}
                            isEdit={true}
                            isDelete={true}
                            data={userGroupList?.map((item: any) => ({
                                userGroupId: item?.userGroupId,
                                userGroupName: item?.userGroupName,
                                reviewTypeId: item?.reviewTypeId,
                                templateTypeId: item?.templateTypeId,
                                // reviewTypeName: reviewTypesList?.find((rt: any) => rt.reviewTypeId === item?.reviewTypeId)?.reviewTypeName || 'N/A',
                                reviewTypeName: item?.reviewType?.reviewTypeName || 'N/A',
                                // templateTypeName: templateTypesList?.find((tt: any) => tt.templateTypeId === item?.templateTypeId)?.templateTypeName || 'N/A'
                                templateTypeName: item?.templateType?.templateTypeName|| 'N/A'
                            }))}
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
                                    filterPlaceholder: 'Review Type'
                                },
                                {
                                    header: 'Template Type',
                                    field: 'templateTypeName',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 200 },
                                    filterPlaceholder: 'Template Type'
                                },
                                {
                                    header: 'User Group',
                                    field: 'userGroupName',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 200 },
                                    filterPlaceholder: 'User Group'
                                }
                            ]}
                            onLoad={(params: any) => fetchUserGroups(params)}
                            onDelete={(item: any) => onRowSelect(item, 'delete')}
                            onEdit={(item: any) => onRowSelect(item, 'edit')}
                        />
                    )}
                </div>
            {/* )} */}

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
                        <span>Are you sure you want to delete this User Group? </span>
                        <span>This action cannot be undone. </span>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default AddUserGroup;