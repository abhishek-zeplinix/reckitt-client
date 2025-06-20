import { InputText } from 'primereact/inputtext';
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
import { reviewTypeSchema } from '@/utils/validationSchemas';
import build from 'next/dist/build';

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};

const AddAssessorRole = () => {
    const [rolesList, setRolesList] = useState<any>([]);
    const [assessorRole, setAssessorRole] = useState<any>('');
    const [assessorRoleList, setAssessorRoleList] = useState<any>([]);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [totalRecords, setTotalRecords] = useState<any>();
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState<any>(false);
    const [selectedAssessorRoleId, setSelectedAssessorRoleId] = useState<any>();
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const { layoutState } = useContext(LayoutContext);
    const { setAlert, setLoading, isLoading } = useAppContext();
    const { error: roleError, validate: validateRole, resetError } = useZodValidation(reviewTypeSchema);


    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async (params?: any) => {
        setLoading(true);

        if(!params) {
            params = {limit: limit, page: page, sortOrder: "desc", sortBy: "roleId" };
        }else{
            params.sortOrder = "desc";
            params.sortBy = "roleId";
        }
        
        setPage(params.page);
        const queryString = buildQueryParams(params);
        try {
            const response = await GetCall(`/mrkt/api/mrkt/role?${queryString}`);
            setAssessorRoleList(response.data);
            setTotalRecords(response.total);
        } catch (err) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async () => {
        if (!validateRole(assessorRole)) return;
        setLoading(true);

        if (isEditMode) {
            try {
                const payload = { RoleName: assessorRole };
                const response = await PutCall(`/mrkt/api/mrkt/role/${selectedAssessorRoleId}`, payload);

                if (response.code?.toLowerCase() === 'success') {
                    setAlert('success', 'Role successfully updated!');
                    resetInput();
                    fetchData();
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
                const payload = { RoleName: assessorRole };
                const response = await PostCall('/mrkt/api/mrkt/role', payload);

                if (response.code?.toLowerCase() === 'success') {
                    setAlert('success', 'Role successfully added!');
                    resetInput();
                    fetchData();
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
            const response = await DeleteCall(`/mrkt/api/mrkt/role/${selectedAssessorRoleId}`);

            if (response.code?.toLowerCase() === 'success') {
                fetchData();
                closeDeleteDialog();
                setAlert('success', 'Role successfully deleted!');
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
        setAssessorRole('');
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
            setSelectedAssessorRoleId(perm.roleId);
        }

        if (action === ACTIONS.EDIT) {
            setAssessorRole(perm.RoleName);
            setSelectedAssessorRoleId(perm.roleId);
            setIsEditMode(true);
        }
    };

    return (
        <>
            <div className="flex flex-column justify-center items-center gap-2">
                <label htmlFor="role">Add Role <span style={{ color: 'red' }}>*</span></label>
                <InputText aria-label="Add Role" value={assessorRole} onChange={(e) => setAssessorRole(e.target.value)} className='w-full sm:w-30rem' />
                {roleError ? (
                    <small className="p-error">{roleError}</small>
                ) : <small>
                    <i>Enter a role you want to add.</i>
                </small>}
                <SubmitResetButtons onSubmit={handleSubmit} label={isEditMode ? 'Update Role' : 'Add Role'} loading={isLoading}/>
            </div>

            <div className="mt-4">
                {isLoading ? (
                    <TableSkeletonSimple columns={2} rows={5} />
                ) : (
                    <CustomDataTable
                        ref={assessorRoleList}
                        page={page}
                        limit={limit} // no of items per page
                        totalRecords={totalRecords} // total records from api response
                        isView={false}
                        isEdit={true} // show edit button
                        isDelete={true} // show delete button
                        data={assessorRoleList?.map((item: any) => ({
                            roleId: item?.roleId,
                            RoleName: item?.RoleName
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
                                header: 'Role',
                                field: 'RoleName',
                                filter: true,
                                bodyStyle: { minWidth: 150, maxWidth: 150 },
                                filterPlaceholder: 'Role'
                            }
                        ]}
                        onLoad={(params: any) => fetchData(params)}
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
                        <Button label="Delete" style={{ backgroundColor: '#DF1740', border: 'none' }} className="px-7 hover:text-white" onClick={onDelete}  loading={isLoading}/>
                    </div>
                }
                onHide={closeDeleteDialog}
            >
            
                <div className="flex flex-column w-full surface-border p-2 text-center gap-4">
                    <i className="pi pi-info-circle text-6xl" style={{ marginRight: 10, color: '#DF1740' }}></i>

                    <div className="flex flex-column align-items-center gap-1">
                        <span>Are you sure you want to delete this assesor role? </span>
                        <span>This action cannot be undone. </span>
                    </div>
                </div>
            </Dialog>
        </>
    );
};

export default AddAssessorRole;
