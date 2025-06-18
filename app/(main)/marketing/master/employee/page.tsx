'use client'
import { DeleteCall, GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import Breadcrumbs from '@/components/breadcrumbs/breadcrumbs';
import ImportExportButton from '@/components/buttons/import-export';
import CustomDataTable from '@/components/CustomDataTable';
import ReusableFileUploadDialog from '@/components/dialog-box/file-upload-dialog';
import TableSkeletonSimple from '@/components/skeleton/TableSkeletonSimple';
import { usePaginatedQuery } from '@/hooks/usePaginatedQuery';
import { useZodValidation } from '@/hooks/useZodValidation';
import { useAppContext } from '@/layout/AppWrapper';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import { reviewTypeSchema } from '@/utils/validationSchemas';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from 'primereact/button'
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import React, { useContext, useState } from 'react'

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};


const EmployeeList = [
    {
        assessorGroup: "Reckitt",
        userGroup: "ProcurementIndirectGlobalmarketing",
        scorecardRole: "Reviewer",
        department: "Procurement",
        status: "Active",
        firstName: "Employee",
        lastName: "Employee jr.",
        email: "employee1@reckitt.com",
        regulatoryRegion: "Netherlands",
        location: "NL, Amsterdam, ENA HQ",
        typeOfLocation: "Office",
        positionTitle: "Sr. Buyer",
        directIndirect: "Indirect",
        globalLocal: "Global",
        division: "Marketing",
        seniority: "LT"
    },
    {
        assessorGroup: "Reckitt",
        userGroup: "Procurement/Indirect/Global/marketing",
        scorecardRole: "Admin",
        department: "Procurement",
        status: "Active",
        firstName: "Employee",
        lastName: "Employee jr.",
        email: "employee1@reckitt.com",
        regulatoryRegion: "Netherlands",
        location: "NL, Amsterdam, ENA HQ",
        typeOfLocation: "Office",
        positionTitle: "Sr. Buyer",
        directIndirect: "Indirect",
        globalLocal: "Global",
        division: "Marketing",
        seniority: "LT"
    },
    {
        assessorGroup: "Agency",
        userGroup: "Procurement/Indirect/Global/marketing",
        scorecardRole: "Evaluator",
        department: "Procurement",
        status: "Active",
        firstName: "Employee",
        lastName: "Employee jr.",
        email: "employee1@agency.com",
        regulatoryRegion: "Netherlands",
        location: "NL, Amsterdam, ENA HQ",
        typeOfLocation: "Office",
        positionTitle: "Sr. Buyer",
        directIndirect: "Indirect",
        globalLocal: "Global",
        division: "Marketing",
        seniority: "LT"
    },
    {
        assessorGroup: "Reckitt",
        userGroup: "Procurement/Indirect/Global/marketing",
        scorecardRole: "Creator",
        department: "Procurement",
        status: "Active",
        firstName: "Employee",
        lastName: "Employee jr.",
        email: "employee1@reckitt.com",
        regulatoryRegion: "Netherlands",
        location: "NL, Amsterdam, ENA HQ",
        typeOfLocation: "Office",
        positionTitle: "Sr. Buyer",
        directIndirect: "Indirect",
        globalLocal: "Global",
        division: "Marketing",
        seniority: "LT"
    },
    {
        assessorGroup: "Reckitt",
        userGroup: "Procurement/Indirect/Global/marketing",
        scorecardRole: "Admin",
        department: "Procurement",
        status: "Active",
        firstName: "Employee",
        lastName: "Employee jr.",
        email: "employee1@reckitt.com",
        regulatoryRegion: "Netherlands",
        location: "NL, Amsterdam, ENA HQ",
        typeOfLocation: "Office",
        positionTitle: "Sr. Buyer",
        directIndirect: "Indirect",
        globalLocal: "Global",
        division: "Marketing",
        seniority: "LT"
    },
    {
        assessorGroup: "Agency",
        userGroup: "Procurement/Indirect/Global/marketing",
        scorecardRole: "Evaluator",
        department: "Procurement",
        status: "Active",
        firstName: "Employee",
        lastName: "Employee jr.",
        email: "employee1@agency.com",
        regulatoryRegion: "Netherlands",
        location: "NL, Amsterdam, ENA HQ",
        typeOfLocation: "Office",
        positionTitle: "Sr. Buyer",
        directIndirect: "Indirect",
        globalLocal: "Global",
        division: "Marketing",
        seniority: "LT"
    },
    {
        assessorGroup: "Reckitt",
        userGroup: "ProcurementIndirectGlobalmarketing",
        scorecardRole: "Reviewer",
        department: "Procurement",
        status: "Active",
        firstName: "Employee",
        lastName: "Employee jr.",
        email: "employee1@reckitt.com",
        regulatoryRegion: "Netherlands",
        location: "NL, Amsterdam, ENA HQ",
        typeOfLocation: "Office",
        positionTitle: "Sr. Buyer",
        directIndirect: "Indirect",
        globalLocal: "Global",
        division: "Marketing",
        seniority: "LT"
    },
    {
        assessorGroup: "Reckitt",
        userGroup: "ProcurementIndirectGlobalmarketing",
        scorecardRole: "Reviewer",
        department: "Procurement",
        status: "Active",
        firstName: "Employee",
        lastName: "Employee jr.",
        email: "employee1@reckitt.com",
        regulatoryRegion: "Netherlands",
        location: "NL, Amsterdam, ENA HQ",
        typeOfLocation: "Office",
        positionTitle: "Sr. Buyer",
        directIndirect: "Indirect",
        globalLocal: "Global",
        division: "Marketing",
        seniority: "LT"
    },
];

function EmployeeData() {
    const [region, setRegion] = useState<string>('');
    const [email, setEmail] = useState<string>('');
    const [firstName, setFirstName] = useState<string>('');
    const [lastName, setLastName] = useState<string>('');
    const [department, setDepartment] = useState<string>('');
    const [scorecardRole, setScorecardRole] = useState<string>('');
    const [buNew, setBUNew] = useState<string>('');
    const [vendorNameGiven, setVendorNameGiven] = useState<string>('');
    const [company, setCompany] = useState<string>('');
    const [bu, setBU] = useState<string>('');

    const [togglePanel, setTogglePanel] = useState(false)
    const [showFileUploadDialog, setShowFileUploadDialog] = useState(false)
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

    const handleTogglePanel = () => {
        setTogglePanel((prev) => !prev)
    }

    return (
        <div className='card'>
            <div className='inner p-4 border-1 surface-border border-round'>
                <div className="flex flex-wrap justify-content-between align-items-center mb-2">
                    {/* Title + Breadcrumb Block */}
                    <div className="flex flex-column">
                        <h2 className="m-0">Employee Data</h2>
                        <p className="text-sm text-gray-600 mt-1"><Breadcrumbs /></p>
                    </div>

                    {/* Buttons Block */}
                    <div className="flex flex-wrap gap-3">

                        <ImportExportButton
                            label='Import'
                            icon="pi pi-upload"
                            onClick={() => setShowFileUploadDialog(true)}
                        />
                        <ImportExportButton
                            label='Export'
                            icon="pi pi-download"
                            onClick={handleTogglePanel}
                        />

                        <Button
                            label="Add New"
                            icon="pi pi-plus"
                            onClick={handleTogglePanel}
                        />
                    </div>
                </div>

                {
                    togglePanel &&
                    <div className="relative  flex flex-column gap-4 w-full border-1 border-round surface-border p-3 input-fields-add-new">

                        {/* Input Fields */}
                        <div className="flex flex-wrap w-full justify-content-between gap-4 ">
                            <div className="flex flex-column gap-2" style={{ flex: '1 1 30%' }}>
                                <label htmlFor="Email ID">Email ID<span style={{ color: 'red' }}>*</span></label>
                                <InputText
                                    id="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full"
                                    placeholder="Enter Email ID"
                                />
                                {regionError && <small className="p-error">{regionError}</small>}
                            </div>


                            <div className="flex flex-column gap-2" style={{ flex: '1 1 30%' }}>
                                <label htmlFor="First Name">First Name <span style={{ color: 'red' }}>*</span></label>
                                <InputText
                                    id="firstName"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                    className="w-full"
                                    placeholder="Enter First Name"
                                />
                                {regionError && <small className="p-error">{regionError}</small>}
                            </div>


                            <div className="flex flex-column gap-2" style={{ flex: '1 1 30%' }}>
                                <label htmlFor="Last Name">Last Name <span style={{ color: 'red' }}>*</span></label>
                                <InputText
                                    id="lastName"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                    className="w-full"
                                    placeholder="Enter Last Name"
                                />
                                {regionError && <small className="p-error">{regionError}</small>}
                            </div>

                            <div className="flex flex-column gap-2" style={{ flex: '1 1 30%' }}>
                                <label htmlFor="Department">Department<span style={{ color: 'red' }}>*</span></label>
                                <InputText
                                    id="department"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    className="w-full"
                                    placeholder="Enter Department"
                                />
                                {regionError && <small className="p-error">{regionError}</small>}
                            </div>

                            <div className="flex flex-column gap-2" style={{ flex: '1 1 30%' }}>
                                <label htmlFor="Scorecard Role">Scorecard Role<span style={{ color: 'red' }}>*</span></label>
                                <InputText
                                    id="scorecard-role"
                                    value={scorecardRole}
                                    onChange={(e) => setScorecardRole(e.target.value)}
                                    className="w-full"
                                    placeholder="Enter Scorecard Role"
                                />
                                {regionError && <small className="p-error">{regionError}</small>}
                            </div>

                            <div className="flex flex-column gap-2" style={{ flex: '1 1 30%' }}>
                                <label htmlFor="Vendor Name Given">Vendor Name Given<span style={{ color: 'red' }}>*</span></label>
                                <InputText
                                    id="vendor-name-given"
                                    value={vendorNameGiven}
                                    onChange={(e) => setVendorNameGiven(e.target.value)}
                                    className="w-full"
                                    placeholder="Enter Vendor Name Given"
                                />
                                {regionError && <small className="p-error">{regionError}</small>}
                            </div>

                            <div className="flex flex-column gap-2" style={{ flex: '1 1 30%' }}>
                                <label htmlFor="country">Company</label>
                                <InputText
                                    id="company"
                                    value={company}
                                    onChange={(e) => setCompany(e.target.value)}
                                    className="w-full"
                                    placeholder="Enter Company"
                                />
                                {regionError && <small className="p-error">{regionError}</small>}
                            </div>

                            <div className="flex flex-column gap-2" style={{ flex: '1 1 30%' }}>
                                <label htmlFor="BU">BU</label>
                                <InputText
                                    id="bu"
                                    value={bu}
                                    onChange={(e) => setBU(e.target.value)}
                                    className="w-full"
                                    placeholder="Enter BU"
                                />
                                {regionError && <small className="p-error">{regionError}</small>}
                            </div>

                            <div className="flex flex-column gap-2" style={{ flex: '1 1 30%' }}>
                                <label htmlFor="BU New">BU New</label>
                                <InputText
                                    id="bu-new"
                                    value={buNew}
                                    onChange={(e) => setBUNew(e.target.value)}
                                    className="w-full"
                                    placeholder="Enter BU New"
                                />
                                {regionError && <small className="p-error">{regionError}</small>}
                            </div>

                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-content-end gap-3 mt-3">
                            <Button label="Cancel" className="cancle-btn-outline" onClick={handleTogglePanel} />
                            <Button label="Save" className='save-btn' />
                        </div>
                    </div>
                }

                <div className="flex gap-2 justify-content-between align-items-center mt-3">

                    <div className='flex gap-2'>
                        <Dropdown
                            placeholder="Filter"
                            className="w-10rem"
                            showClear
                        />
                        <Dropdown
                            placeholder="Filter"
                            className="w-10rem"
                            showClear
                        />

                        <Dropdown
                            placeholder="Filter"
                            className="w-10rem"
                            showClear
                        />
                    </div>

                    <div className='flex'>
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText
                                value={searchText}
                                onChange={(e) => setSearchText(e.target.value)}
                                placeholder="Search"
                                className="w-full"
                            />
                        </span>
                    </div>

                </div>

                <div className="mt-3">
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
                            data={EmployeeList}
                            // onLoad={() => handlePageChange}
                            onLoad={handleLoad}
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
                                    header: 'Assessor Group',
                                    field: 'assessorGroup',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 180 },
                                    filterPlaceholder: 'Assessor Group'
                                },
                                {
                                    header: 'User Group',
                                    field: 'userGroup',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 180, overflowWrap: 'break-word' },
                                    filterPlaceholder: 'User Group'
                                },
                                {
                                    header: 'Scorecard Role',
                                    field: 'scorecardRole',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 180 },
                                    filterPlaceholder: 'Scorecard Role'
                                },
                                {
                                    header: 'Department',
                                    field: 'department',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 180 },
                                    filterPlaceholder: 'Department'
                                },
                                {
                                    header: 'STATUS',
                                    field: 'status',
                                    filter: true,
                                    bodyStyle: { minWidth: 120, maxWidth: 120 },
                                    filterPlaceholder: 'STATUS'
                                },
                                {
                                    header: 'First Name',
                                    field: 'firstName',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 180 },
                                    filterPlaceholder: 'First Name'
                                },
                                {
                                    header: 'Last Name',
                                    field: 'lastName',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 180 },
                                    filterPlaceholder: 'Last Name'
                                },
                                {
                                    header: 'Email Address',
                                    field: 'email',
                                    filter: true,
                                    bodyStyle: { minWidth: 200, maxWidth: 250 },
                                    filterPlaceholder: 'Email Address'
                                },
                                {
                                    header: 'Regulatory Region',
                                    field: 'regulatoryRegion',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 180 },
                                    filterPlaceholder: 'Regulatory Region'
                                },
                                {
                                    header: 'Location',
                                    field: 'location',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 180 },
                                    filterPlaceholder: 'Location'
                                },
                                {
                                    header: 'Type of location',
                                    field: 'typeOfLocation',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 180 },
                                    filterPlaceholder: 'Type of location'
                                },
                                {
                                    header: 'Position Title',
                                    field: 'positionTitle',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 180 },
                                    filterPlaceholder: 'Position Title'
                                },
                                {
                                    header: 'Direct/indirect',
                                    field: 'directIndirect',
                                    filter: true,
                                    bodyStyle: { minWidth: 130, maxWidth: 150 },
                                    filterPlaceholder: 'Direct/indirect'
                                },
                                {
                                    header: 'Global/Local',
                                    field: 'globalLocal',
                                    filter: true,
                                    bodyStyle: { minWidth: 130, maxWidth: 150 },
                                    filterPlaceholder: 'Global/Local'
                                },
                                {
                                    header: 'Division',
                                    field: 'division',
                                    filter: true,
                                    bodyStyle: { minWidth: 130, maxWidth: 150 },
                                    filterPlaceholder: 'Division'
                                },
                                {
                                    header: 'Seniority',
                                    field: 'seniority',
                                    filter: true,
                                    bodyStyle: { minWidth: 130, maxWidth: 150 },
                                    filterPlaceholder: 'Seniority'
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
                    // visible={isDeleteDialogVisible}
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
            </div>


            {showFileUploadDialog && (
                <ReusableFileUploadDialog
                    visible={showFileUploadDialog}
                    header={'Upload Employee Data'}
                    uploadContextLabel="This is Context Label"
                    demoFileLink="https://google.com/"
                    demoFileLabel="Download Employee Data Sample Template"
                    apiEndpoint="/mrkt/api/mrkt/bulkuploadmaster"
                    maxFileSizeInBytes={1 * 1024 * 1024} // 1MB
                    acceptedFileExtensions={['xlsx', 'xls', 'xlsm']}

                    onHideDialog={() => setShowFileUploadDialog(false)}
                    // onUploadSuccess={handleDialogUploadSuccess}
                    onUploadSuccess={() => setShowFileUploadDialog(false)}
                />
            )}

        </div >
    )
}

export default EmployeeData