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
import { useZodValidation } from '@/hooks/useZodValidation';
import { emailSchema, reviewTypeSchema } from '@/utils/validationSchemas';

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const AddAssessorUser = () => {
    const [assessorGroupsList, setAssessorGroupsList] = useState<any>([]);
    const [assessorRolesList, setAssessorRolesList] = useState<any>([]);
    const [assessorGroupId, setAssessorGroupId] = useState<any>('');
    const [assessorRoleId, setAssessorRoleId] = useState<any>('');
    const [username, setUsername] = useState<any>('');
    const [email, setEmail] = useState<any>('');
    const [assessorUsersList, setAssessorUsersList] = useState<any>([]);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<any>();
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState<any>(false);
    const [selectedAssessorUserId, setSelectedAssessorUserId] = useState<any>();
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const { layoutState } = useContext(LayoutContext);
    const { setAlert, setLoading, isLoading } = useAppContext();
    const { error: usernameError, validate: validateUsername, resetError: resetUsernameError } = useZodValidation(reviewTypeSchema);
    const { error: emailError, validate: validateEmail, resetError: resetEmailError } = useZodValidation(emailSchema);

    console.log(assessorRoleId, 'assessorRoleId');
    console.log('rendered');
    
    useEffect(() => {
        fetchAssessorGroups();
        fetchAssessorRoles();
    }, []);

    useEffect(() => {
        // if (assessorGroupId) {
            fetchAssessorUsers();
        // } else {
        //     setAssessorUsersList([]);
        //     setTotalRecords(0);
        // }
    }, [assessorGroupId, assessorRoleId]);

    // Fetch assessor groups
    const fetchAssessorGroups = async () => {
        setLoading(true);

        const params = { pagination: false };
        const queryString = buildQueryParams(params);
        try {
            const response = await GetCall(`/mrkt/api/mrkt/marketingAssessorGroup?${queryString}`);
            setAssessorGroupsList(response.data || []);
        } catch (err) {
            setAlert('error', 'Failed to fetch assessor groups!');
            setAssessorGroupsList([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch assessor roles
    const fetchAssessorRoles = async () => {
        setLoading(true);

        try {
            const response = await GetCall(`/mrkt/api/mrkt/role`);
            setAssessorRolesList(response.data || []);
        } catch (err) {
            setAlert('error', 'Failed to fetch assessor roles!');
            setAssessorRolesList([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch assessor users for selected filters
    const fetchAssessorUsers = async (params?: any) => {
        // if (!assessorGroupId) return;

        setLoading(true);
        if (!params) {
            params = { limit: limit, page: page, filters: { assessorGroupId, assesorRoleId:assessorRoleId }, sortOrder: "desc", sortBy: "userId" };
        } else {
            params.filters = { assessorGroupId, assessorRoleId };
            params.sortOrder = "desc";
            params.sortBy = "userId";
        }
        setPage(params.page);
        const queryString = buildQueryParams(params);

        try {
            const response = await GetCall(`/mrkt/api/mrkt/users?${queryString}`);
            setAssessorUsersList(response.data || []);
            setTotalRecords(response.total || 0);
        } catch (err) {
            setAlert('error', 'Failed to fetch assessor users!');
            setAssessorUsersList([]);
            setTotalRecords(0);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        let isValid = true;

        if (!validateUsername(username)) {
            isValid = false;
        }

        if (!validateEmail(email)) {
            isValid = false;
        }

        if (!isValid) return;

        if (!assessorGroupId) {
            setAlert('error', 'Please select an Assessor Group!');
            return;
        }

        if (!assessorRoleId) {
            setAlert('error', 'Please select an Assessor Role!');
            return;
        }

        if (!username.trim()) {
            setAlert('error', 'Please enter a Username!');
            return;
        }

        if (!email.trim()) {
            setAlert('error', 'Please enter an Email!');
            return;
        }

        // Basic email validation
        // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        // if (!emailRegex.test(email)) {
        //     setAlert('error', 'Please enter a valid email address!');
        //     return;
        // }

        setLoading(true);

        if (isEditMode) {
            try {
                const payload = {
                    userName: username,
                    email: email
                };
                const response = await PutCall(`/mrkt/api/mrkt/users/${selectedAssessorUserId}/assessorGroup/${assessorGroupId}/role/${assessorRoleId}`, payload);

                if (response.code.toLowerCase() === 'success') {
                    setAlert('success', 'User successfully updated!');
                    resetInput();
                    fetchAssessorUsers();
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
                const payload = { userName: username, email: email };
                const response = await PostCall(`/mrkt/api/mrkt/users/assessorGroup/${assessorGroupId}/role/${assessorRoleId}`, payload);

                if (response.code.toLowerCase() === 'success') {
                    setAlert('success', 'User successfully added!');
                    resetInput();
                    fetchAssessorUsers();
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
            const response = await DeleteCall(`/mrkt/api/mrkt/users/${selectedAssessorUserId}`);

            if (response.code.toLowerCase() === 'success') {
                fetchAssessorUsers();
                closeDeleteDialog();
                setAlert('success', 'User successfully deleted!');
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
        setUsername('');
        setEmail('');
        setIsEditMode(false);
        resetUsernameError();
        resetEmailError();
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
            setSelectedAssessorUserId(item.assessorUserId);
        }

        if (action === ACTIONS.EDIT) {
            setUsername(item.username);
            setEmail(item.email);
            setAssessorGroupId(item.assessorGroupId);
            setAssessorRoleId(item.assessorRoleId);
            setSelectedAssessorUserId(item.assessorUserId);
            setIsEditMode(true);
        }
    };

    const handleAssessorGroupChange = (value: any) => {
        setAssessorGroupId(value);
        setAssessorUsersList([]);
        setTotalRecords(0);
    };

    const handleAssessorRoleChange = (value: any) => {
        setAssessorRoleId(value);
        setAssessorUsersList([]);
        setTotalRecords(0);
    };

    const assessorGroupOptions = assessorGroupsList?.map((assessorGroup: any) => ({
        label: assessorGroup.assessorGroupName || '',
        value: assessorGroup.assessorGroupId || ''
    })) || [];

    const assessorRoleOptions = assessorRolesList?.map((assessorRole: any) => ({
        label: assessorRole.RoleName || '',
        value: assessorRole.roleId || ''
    })) || [];

    return (
        <>
            <div className="flex flex-wrap justify-center items-center gap-2">
                <div className="flex flex-column gap-2">
                    <label htmlFor="assessorGroup">Assessor Group <span style={{ color: 'red' }}>*</span></label>
                    <Dropdown
                        id="assessorGroup"
                        value={assessorGroupId}
                        options={assessorGroupOptions}
                        onChange={(e) => handleAssessorGroupChange(e.value)}
                        placeholder="Select Assessor Group"
                        className="w-full sm:w-30rem"
                        filter
                        showClear
                        disabled={isLoading}
                    />
                    <small>
                        <i>Select an Assessor Group for the user.</i>
                    </small>
                </div>
                {
                    assessorGroupId && (
                        <div className="flex flex-column gap-2">
                            <label htmlFor="assessorRole">Assessor Role <span style={{ color: 'red' }}>*</span></label>
                            <Dropdown
                                id="assessorRole"
                                value={assessorRoleId}
                                options={assessorRoleOptions}
                                onChange={(e) => handleAssessorRoleChange(e.value)}
                                placeholder="Select Assessor Role"
                                className="w-full sm:w-30rem"
                                filter
                                showClear
                                disabled={isLoading}
                            />
                            <small>
                                <i>Select an Assessor Role for the user.</i>
                            </small>
                        </div>
                    )}


                {assessorRoleId && (
                    <>
                        <div className="flex flex-column gap-2">
                            <label htmlFor="username">Username <span style={{ color: 'red' }}>*</span></label>
                            <InputText
                                id="username"
                                aria-label="Add Username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full sm:w-30rem"
                                placeholder="Enter Username"
                            />
                            {usernameError ? (
                                <small className="p-error">{usernameError}</small>
                            ) : <small>
                                <i>Enter a Username for the user.</i>
                            </small>}
                        </div>

                        <div className="flex flex-column gap-2">
                            <label htmlFor="email">Email <span style={{ color: 'red' }}>*</span></label>
                            <InputText
                                id="email"
                                aria-label="Add Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full sm:w-30rem"
                                placeholder="Enter Email"
                                type="email"
                            />
                            {emailError ? (
                                <small className="p-error">{emailError}</small>
                            ) : <small>
                                <i>Enter an Email address for the user.</i>
                            </small>}
                        </div>
                    </>
                )}
            </div>


            <SubmitResetButtons
                onSubmit={handleSubmit}
                label={isEditMode ? 'Update Assessor User' : 'Add Assessor User'}
                loading={isLoading}
            />

            {/* {assessorGroupId && ( */}
                <div className="mt-4">
                    {isLoading ? (
                        <TableSkeletonSimple columns={6} rows={5} />
                    ) : (
                        <CustomDataTable
                            ref={assessorUsersList}
                            page={page}
                            limit={limit}
                            totalRecords={totalRecords}
                            isView={false}
                            isEdit={true}
                            isDelete={true}
                            data={assessorUsersList?.map((item: any) => ({
                                assessorUserId: item?.userId,
                                username: item?.userName,
                                email: item?.email,
                                assessorGroupId: item?.assessorGroupId,
                                assessorRoleId: item?.roleId,
                                assessorGroupName: item?.assessorGroup?.assessorGroupName || 'N/A',
                                assessorRoleName: item?.role?.RoleName || 'N/A'
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
                                    header: 'Assessor Group',
                                    field: 'assessorGroupName',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 200 },
                                    filterPlaceholder: 'Assessor Group'
                                },
                                {
                                    header: 'Assessor Role',
                                    field: 'assessorRoleName',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 200 },
                                    filterPlaceholder: 'Assessor Role'
                                },
                                {
                                    header: 'Username',
                                    field: 'username',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 200 },
                                    filterPlaceholder: 'Username'
                                },
                                {
                                    header: 'Email',
                                    field: 'email',
                                    filter: true,
                                    bodyStyle: { minWidth: 200, maxWidth: 250 },
                                    filterPlaceholder: 'Email'
                                }
                            ]}
                            onLoad={(params: any) => fetchAssessorUsers(params)}
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
                        <span>Are you sure you want to delete this Assessor User? </span>
                        <span>This action cannot be undone. </span>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default AddAssessorUser;