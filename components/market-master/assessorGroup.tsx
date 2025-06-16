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

const AddAssessorGroup = () => {
    const [templateTypesList, setTemplateTypesList] = useState<any>([]);
    const [userGroupsList, setUserGroupsList] = useState<any>([]);
    const [assessorGroup, setAssessorGroup] = useState<any>('');
    const [assessorGroupType, setAssessorGroupType] = useState<any>('');
    const [reviewTypeId, setReviewTypeId] = useState<any>('');
    const [templateTypeId, setTemplateTypeId] = useState<any>('');
    const [userGroupId, setUserGroupId] = useState<any>('');
    const [assessorGroupList, setAssessorGroupList] = useState<any>([]);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<any>();
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState<any>(false);
    const [selectedAssessorGroupId, setSelectedAssessorGroupId] = useState<any>();
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const { layoutState } = useContext(LayoutContext);
    const { setAlert, setLoading, isLoading } = useAppContext();
    const { reviewTypesList, loading } = useMarketingMaster();
    const { error: assessorGroupError, validate: validateAssessorGroup, resetError } = useZodValidation(reviewTypeSchema);

    const assessorTypeOptions = [
        { label: 'Client Assessor', value: 'clientAssessors' },
        { label: 'Reckitt Assessor', value: 'reckittAssessors' }
    ];

    useEffect(() => {
        fetchUserGroups();
        fetchAssessorGroups();
    }, [userGroupId]);

    const fetchUserGroups = async () => {
        
        setLoading(true);

        const params = { pagination: false };
        const queryString = buildQueryParams(params);
        try {
            const response = await GetCall(`/mrkt/api/mrkt/user-group?${queryString}`);
            setUserGroupsList(response.data || []);
        } catch (err) {
            setAlert('error', 'Failed to fetch user groups!');
            setUserGroupsList([]);
        } finally {
            setLoading(false);
        }
    };

    // fetch assessor groups for selected filters
    const fetchAssessorGroups = async (params?: any) => {

        setLoading(true);
        if (!params) {
            params = { limit: limit, page: page, filters: { userGroupId }, sortOrder: "desc", sortBy: "assessorGroupId" };
        } else {
            params.filters = { userGroupId };
            params.sortOrder = "desc";
            params.sortBy = "assessorGroupId";
        }
        setPage(params.page);
        const queryString = buildQueryParams(params);

        try {
            const response = await GetCall(`/mrkt/api/mrkt/marketingAssessorGroup?${queryString}`);
            setAssessorGroupList(response.data || []);
            setTotalRecords(response.total || 0);
        } catch (err) {
            setAlert('error', 'Failed to fetch assessor groups!');
            setAssessorGroupList([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!validateAssessorGroup(assessorGroup)) return;

        if (!userGroupId) {
            setAlert('error', 'Please select a User Group!');
            return;
        }

        if (!assessorGroup.trim()) {
            setAlert('error', 'Please enter an Assessor Group!');
            return;
        }

        if (!assessorGroupType) {
            setAlert('error', 'Please select an Assessor Type!');
            return;
        }

        setLoading(true);

        if (isEditMode) {
            try {
                const payload = {
                    assessorGroupName: assessorGroup,
                    assessorGroupType: assessorGroupType,
                };
                const response = await PutCall(`/mrkt/api/mrkt/marketingAssessorGroup/${selectedAssessorGroupId}/userGroup/${userGroupId}`, payload);

                if (response.code.toLowerCase() === 'success') {
                    setAlert('success', 'Assessor Group successfully updated!');
                    resetInput();
                    fetchAssessorGroups();
                } else {
                    setAlert('error', response.error || 'Something went wrong!');
                }
            } catch (err) {
                setAlert('error', 'Something went wrong!');
            } finally {
                setLoading(false);
            }
        } else {
            try {
                const payload = { 
                    assessorGroupName: assessorGroup,
                    assessorGroupType: assessorGroupType
                };
                const response = await PostCall(`/mrkt/api/mrkt/marketingAssessorGroup/userGroup/${userGroupId}`, payload);

                if (response.code.toLowerCase() === 'success') {
                    setAlert('success', 'Assessor Group successfully added!');
                    resetInput();
                    fetchAssessorGroups();
                } else {
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
            const response = await DeleteCall(`/mrkt/api/mrkt/marketingAssessorGroup/${selectedAssessorGroupId}`);

            if (response.code.toLowerCase() === 'success') {
                fetchAssessorGroups();
                closeDeleteDialog();
                setAlert('success', 'Assessor Group successfully deleted!');
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
        setAssessorGroup('');
        setAssessorGroupType('');
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
            setSelectedAssessorGroupId(item.assessorGroupId);
        }

        if (action === ACTIONS.EDIT) {
            setAssessorGroup(item.assessorGroupName);
            setAssessorGroupType(item.assessorGroupType);
            setReviewTypeId(item.reviewTypeId);
            setTemplateTypeId(item.templateTypeId);
            setUserGroupId(item.userGroupId);
            setSelectedAssessorGroupId(item.assessorGroupId);

            // Fetch dependent dropdowns for the selected review type
            // await fetchTemplateTypes(item.reviewTypeId);
            await fetchUserGroups();
            setIsEditMode(true);
        }
    };

    const handleUserGroupChange = (value: any) => {
        setUserGroupId(value);
        setAssessorGroupList([]);
        setTotalRecords(0);
    };

    const userGroupOptions = userGroupsList?.map((userGroup: any) => ({
        label: userGroup.userGroupName || '',
        value: userGroup.userGroupId || ''
    })) || [];

    return (
        <>
            <div className="flex flex-wrap justify-center items-center gap-2">
               
                    <div className="flex flex-column gap-2">
                        <label htmlFor="userGroup">User Group <span style={{ color: 'red' }}>*</span></label>
                        <Dropdown
                            id="userGroup"
                            value={userGroupId}
                            options={userGroupOptions}
                            onChange={(e) => handleUserGroupChange(e.value)}
                            placeholder="Select User Group"
                            className="w-full sm:w-30rem"
                            filter
                            showClear
                            disabled={loading}
                        />
                        <small>
                            <i>Select a User Group for the assessor group.</i>
                        </small>
                    </div>

                {userGroupId && (
                    <>
                        <div className="flex flex-column gap-2">
                            <label htmlFor="assessorType">Assessor Type <span style={{ color: 'red' }}>*</span></label>
                            <Dropdown
                                id="assessorType"
                                value={assessorGroupType}
                                options={assessorTypeOptions}
                                onChange={(e) => setAssessorGroupType(e.value)}
                                placeholder="Select Assessor Type"
                                className="w-full sm:w-30rem"
                                showClear
                                disabled={loading}
                            />
                            <small>
                                <i>Select the type of assessor group.</i>
                            </small>
                        </div>

                        <div className="flex flex-column gap-2">
                            <label htmlFor="assessorGroup">Assessor Group <span style={{ color: 'red' }}>*</span></label>
                            <InputText
                                id="assessorGroup"
                                aria-label="Add Assessor Group"
                                value={assessorGroup}
                                onChange={(e) => setAssessorGroup(e.target.value)}
                                className="w-full sm:w-30rem"
                                placeholder="Enter Assessor Group"
                            />
                            {assessorGroupError ? (
                                <small className="p-error">{assessorGroupError}</small>
                            ) : <small>
                                <i>Enter an Assessor Group you want to add.</i>
                            </small>}
                        </div>
                    </>
                )}
            </div>

            {userGroupId && (
                <SubmitResetButtons
                    onSubmit={handleSubmit}
                    label={isEditMode ? 'Update Assessor Group' : 'Add Assessor Group'}
                    loading={isLoading}
                />
            )}

            {/* {reviewTypeId && ( */}
                <div className="mt-4">
                    {isLoading ? (
                        <TableSkeletonSimple columns={5} rows={5} />
                    ) : (
                        <CustomDataTable
                            ref={assessorGroupList}
                            page={page}
                            limit={limit}
                            totalRecords={totalRecords}
                            isView={false}
                            isEdit={true}
                            isDelete={true}
                            data={assessorGroupList?.map((item: any) => ({
                                assessorGroupId: item?.assessorGroupId,
                                assessorGroupName: item?.assessorGroupName,
                                assessorGroupType: item?.assessorGroupType,
                                userGroupId: item?.userGroupId,
                                userGroupName: item?.userGroup?.userGroupName || 'N/A'
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
                                    header: 'User Group',
                                    field: 'userGroupName',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 200 },
                                    filterPlaceholder: 'User Group'
                                },
                                {
                                    header: 'Assessor Type',
                                    field: 'assessorGroupType',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 200 },
                                    filterPlaceholder: 'Assessor Type',
                                    body: (data: any) => {
                                        const typeLabel = data.assessorGroupType === 'clientAssessors' ? 'Client Assessor' : 
                                                         data.assessorGroupType === 'reckittAssessors' ? 'Reckitt Assessor' : 
                                                         data.assessorGroupType || 'N/A';
                                        return <span>{typeLabel}</span>;
                                    }
                                },
                                {
                                    header: 'Assessor Group',
                                    field: 'assessorGroupName',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 200 },
                                    filterPlaceholder: 'Assessor Group'
                                }
                            ]}
                            onLoad={(params: any) => fetchAssessorGroups(params)}
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
                        <span>Are you sure you want to delete this Assessor Group? </span>
                        <span>This action cannot be undone. </span>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default AddAssessorGroup;