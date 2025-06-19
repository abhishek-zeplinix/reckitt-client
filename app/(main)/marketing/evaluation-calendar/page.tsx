'use client';
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
import Link from 'next/link';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Checkbox } from 'primereact/checkbox';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import React, { useContext, useState } from 'react';

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};
const stats = [
    { label: 'BU', value: 167 },
    { label: 'Country', value: 512 },
    { label: 'Brand', value: 167 },
    { label: 'Total Vendors', value: 512 },
    { label: 'Total Vendors', value: 512 },
    { label: 'Evaluated Vendors', value: 200 },
    { label: 'Pending Evaluations', value: 312 }
];
// const EvaluationPeriodList = [
//     {
//         evaluationPeriod: 'H1 '
//     },
//     {
//         evaluationPeriod: 'H2'
//     },
//     {
//         evaluationPeriod: 'Q1'
//     },
//     {
//         evaluationPeriod: 'Q2'
//     },
//     {
//         evaluationPeriod: 'Q3'
//     },
//     {
//         evaluationPeriod: 'Q4'
//     },
//     {
//         evaluationPeriod: 'JAN'
//     },
//     {
//         evaluationPeriod: 'FEB'
//     },
//     {
//         evaluationPeriod: 'MAR'
//     },
//     {
//         evaluationPeriod: 'APR'
//     },
//     {
//         evaluationPeriod: 'MAY'
//     },
//     {
//         evaluationPeriod: 'JUN'
//     },
//     {
//         evaluationPeriod: 'JUL'
//     },
//     {
//         evaluationPeriod: 'AUG'
//     },
//     {
//         evaluationPeriod: 'SEP'
//     },
//     {
//         evaluationPeriod: 'OCT'
//     },
//     {
//         evaluationPeriod: 'NOV'
//     },
//     {
//         evaluationPeriod: 'DEC'
//     }
// ];
const EvaluationPeriodList = [
    {
        evaluationType: 'Media-TV',
        bu: 'Nutrition',
        country: 'AE-Utd.Arab Emir.',
        version: 'Original',
        brand: 'Allerfre, Attest, Buprex...+3',
        startDate: '2025-06-12',
        endDate: '2025-06-29',
        status: 'Active',
        completed: 0,
        total: 12
    },
    {
        evaluationType: 'Media-TV',
        bu: 'Nutrition',
        country: 'AE-Utd.Arab Emir.',
        version: 'Original',
        brand: 'Allerfre, Attest, Buprex...+3',
        startDate: '2025-06-12',
        endDate: '2025-06-29',
        status: 'Completed',
        completed: 12,
        total: 12
    },
    {
        evaluationType: 'Media-TV',
        bu: 'Nutrition',
        country: 'AE-Utd.Arab Emir.',
        version: 'Original',
        brand: 'Allerfre, Attest, Buprex...+3',
        startDate: '2025-06-12',
        endDate: '2025-06-29',
        status: 'In Progress',
        completed: 7,
        total: 12
    },
    {
        evaluationType: 'Media-TV',
        bu: 'Nutrition',
        country: 'AE-Utd.Arab Emir.',
        version: 'Original',
        brand: 'Allerfre, Attest, Buprex...+3',
        startDate: '2025-06-12',
        endDate: '2025-06-29',
        status: 'Active',
        completed: 0,
        total: 12
    },
    {
        evaluationType: 'Media-TV',
        bu: 'Nutrition',
        country: 'AE-Utd.Arab Emir.',
        version: 'Original',
        brand: 'Allerfre, Attest, Buprex...+3',
        startDate: '2025-06-12',
        endDate: '2025-06-29',
        status: 'Active',
        completed: 0,
        total: 12
    },
    {
        evaluationType: 'Media-TV',
        bu: 'Nutrition',
        country: 'AE-Utd.Arab Emir.',
        version: 'Original',
        brand: 'Allerfre, Attest, Buprex...+3',
        startDate: '2025-06-12',
        endDate: '2025-06-29',
        status: 'Active',
        completed: 0,
        total: 12
    }
];
const kpiCards = [
    { label: 'BU', value: 167 },
    { label: 'Country', value: 512 },
    { label: 'Brand', value: 167 },
    { label: 'Total Vendors', value: 512 },
    { label: 'Evaluated Vendors', value: 200 },
    { label: 'Pending Evaluations', value: 312 }
];

const EvaluationPopupList = [
    {
        evaluationType: 'Media-TV',
        bu: 'Nutrition',
        country: 'AE-Utd.Arab Emir.',
        version: 'Original',
        brand: 'Allerfre, Attest, Buprex...+3',
        vendor: 30,
        userGroups: ['ProcurementDirectLocalPPM (Evaluator)']
    },
    {
        evaluationType: 'Media-TV',
        bu: 'Nutrition',
        country: 'AE-Utd.Arab Emir.',
        version: 'Original',
        brand: 'Allerfre, Attest, Buprex...+3',
        vendor: 12,
        userGroups: ['ProcurementDirectLocalPPM (Reviewer)']
    },
    {
        evaluationType: 'Media-TV',
        bu: 'Nutrition',
        country: 'AE-Utd.Arab Emir.',
        version: 'Original',
        brand: 'Allerfre, Attest, Buprex...+3',
        vendor: 57,
        userGroups: ['ProcurementDirectGlobalEMO (Evaluator)', 'ProcurementIndirectLocalIMEX (Creator)', 'ProcurementDirectLocalPPM (Reviewer)', 'ProcurementDirectLocalPPM (Evaluator)']
    },
    {
        evaluationType: 'Media-TV',
        bu: 'Nutrition',
        country: 'AE-Utd.Arab Emir.',
        version: 'Original',
        brand: 'Allerfre, Attest, Buprex...+3',
        vendor: 26,
        userGroups: ['ProcurementDirectGlobalEMO (Evaluator)']
    },
    {
        evaluationType: 'Media-TV',
        bu: 'Nutrition',
        country: 'AE-Utd.Arab Emir.',
        version: 'Original',
        brand: 'Allerfre, Attest, Buprex...+3',
        startDate: '2025-06-12',
        endDate: '2025-06-29',
        status: 'Active',
        completed: 0,
        vendor: 26,
        userGroups: ['ProcurementDirectGlobalEMO (Evaluator)', 'ProcurementIndirectLocalIMEX (Creator)', 'ProcurementDirectLocalPPM (Reviewer)', 'ProcurementDirectLocalPPM (Evaluator)']
    },
    {
        evaluationType: 'Media-TV',
        bu: 'Nutrition',
        country: 'AE-Utd.Arab Emir.',
        version: 'Original',
        brand: 'Allerfre, Attest, Buprex...+3',
        startDate: '2025-06-12',
        endDate: '2025-06-29',
        status: 'Active',
        completed: 0,
        vendor: 26,
        userGroups: ['ProcurementDirectGlobalEMO (Evaluator)', 'ProcurementIndirectLocalIMEX (Creator)', 'ProcurementDirectLocalPPM (Reviewer)', 'ProcurementDirectLocalPPM (Evaluator)']
    }
];
function EvaluationCalendar() {
    const [region, setRegion] = useState<any>('');
    const [evaluationPeriod, setEvaluationPeriod] = useState<any>('');
    const [area, setArea] = useState<any>('');
    const [togglePanel, setTogglePanel] = useState(false);
    const [showFileUploadDialog, setShowFileUploadDialog] = useState(false);
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
    const [showOverviewDialog, setShowOverviewDialog] = useState(false);
    const [selectedRow, setSelectedRow] = useState<any>(null);

    const {
        data: regionList,
        totalRecords,
        isLoading: isFetchingRegions
    } = usePaginatedQuery(
        ['regions', { page, limit, filters, searchText }],
        async () => {
            const params = { page, limit, filters };
            // if (searchText) params.search = searchText;
            const queryString = buildQueryParams(params);
            const response = await GetCall(`/mrkt/api/mrkt/region?${queryString}`);
            return {
                data: response.data || [],
                total: response.total || 0
            };
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
    });

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
    });

    const handleSubmit = async () => {
        if (!validateRegion(region)) return;
        const payload = { regionName: region };

        if (isEditMode) {
            updateRegionMutatation.mutate({ id: selectedRegionId, payload });
        } else {
            addRegionMutation.mutate(payload);
        }
    };

    const onDelete = async () => {
        deleteRegionMutation.mutate(selectedRegionId);
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
        setTogglePanel((prev) => !prev);
    };

    return (
        <div className="card">
            <div className="p-4 border-round-md">
                <div className="grid">
                    {stats.map((stat, index) => (
                        <div key={index} className="col-12 md:col-4 lg:col-3">
                            <div className="text-left shadow-none border-1 border-round-lg  border-black-200 bg-white p-3">
                                <div className="text-600 text-sm mb-2">{stat.label}</div>
                                <div className="text-xl font-bold">{stat.value}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div className="inner p-4 border-1 surface-border border-round">
                <div className="flex flex-wrap justify-content-between align-items-center mb-2">
                    {/* Title + Breadcrumb Block */}
                    <div className="flex flex-column">
                        <h2 className="m-0">Evaluation Calendar</h2>
                        <p className="text-sm text-gray-600 mt-1">
                            <Breadcrumbs />
                        </p>
                    </div>

                    {/* Buttons Block */}
                    <div className="flex flex-wrap gap-3">
                        {/* <ImportExportButton label="Import" icon="pi pi-upload" onClick={() => setShowFileUploadDialog(true)} /> */}
                        <ImportExportButton label="Export" icon="pi pi-download" onClick={handleTogglePanel} />

                        <Link href={'/marketing/evaluation-calendar/add-evaluation-calendar'}>
                            <Button label="Add New" icon="pi pi-plus" />
                        </Link>
                    </div>
                </div>

                {togglePanel && (
                    <div className="flex flex-column gap-4 w-full border-1 border-round surface-border p-3 input-fields-add-new">
                        {/* Input Fields */}
                        <div className="flex flex-wrap w-full justify-content-between gap-4 ">
                            <div className="flex flex-column gap-2" style={{ flex: '1 1 30%' }}>
                                <label htmlFor="evaluationPeriod">
                                    Evaluation Period <span style={{ color: 'red' }}>*</span>
                                </label>
                                <InputText id="evaluationPeriod" value={evaluationPeriod} onChange={(e) => setEvaluationPeriod(e.target.value)} className="w-full" placeholder="Enter Evaluation Period" />
                                {regionError && <small className="p-error">{regionError}</small>}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-content-end gap-3 mt-3">
                            <Button label="Cancel" className="cancle-btn-outline" />
                            <Button label="Save" className="save-btn" />
                        </div>
                    </div>
                )}
                <div className="flex gap-2 justify-content-between align-items-center mt-2">
                    <div className="flex gap-2">
                        <Dropdown placeholder="Review Type" className="w-10rem" showClear />
                        <Dropdown placeholder="Evaluation Type" className="w-10rem" showClear />

                        <Dropdown placeholder="BU" className="w-10rem" showClear />
                        <Dropdown placeholder="Country" className="w-10rem" showClear />
                        <Dropdown placeholder="Status" className="w-10rem" showClear />
                    </div>

                    <div className="flex">
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search" className="w-full" />
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
                            // data={regionList?.map((item: any) => ({
                            //     regionId: item?.regionId,
                            //     regionName: item?.regionName,
                            //     evaluationPeriod: item?.evaluationPeriod,
                            //     completed: item?.completed || 0, // ← Add this
                            //     total: item?.total || 12 // ← And this
                            // }))}
                            extraButtons={(item) => [
                                {
                                    icon: 'pi pi-eye',
                                    tooltip: 'View',
                                    onClick: (e) => {
                                        // setSelectedRow(rowData);
                                        setShowOverviewDialog(true);
                                    }
                                },
                                {
                                    icon: 'pi pi-copy',
                                    tooltip: 'Copy'
                                    // onClick: (e) => {
                                    //     // setSelectedRow(rowData);
                                    //     setShowOverviewDialog(true);
                                    // }
                                }
                                // {
                                //     icon: "pi pi-envelope",
                                //     tooltip:'Send Superior',
                                //     // onClick: (e) => {
                                //     //     handleButtonClick('sendSuperior'); // Pass the item (row data) instead of e
                                //     // }
                                // }
                            ]}
                            isEdit={true} // show edit button
                            isDelete={true} // show delete button
                            data={EvaluationPeriodList}
                            onLoad={handleLoad}
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
                                    header: 'Evaluation Type',
                                    field: 'evaluationType',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 150 },
                                    filterPlaceholder: 'Role'
                                },
                                {
                                    header: 'BU',
                                    field: 'bu',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 150 },
                                    filterPlaceholder: 'Role'
                                },
                                {
                                    header: 'Country',
                                    field: 'country',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 150 },
                                    filterPlaceholder: 'Role'
                                },
                                {
                                    header: 'Version',
                                    field: 'version',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 150 },
                                    filterPlaceholder: 'Role'
                                },
                                {
                                    header: 'Brand',
                                    field: 'brand',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 150 },
                                    filterPlaceholder: 'Role'
                                },
                                {
                                    header: 'Start Date',
                                    field: 'startDate',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 150 },
                                    filterPlaceholder: 'Role'
                                },
                                {
                                    header: 'End Date',
                                    field: 'endDate',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 150 },
                                    filterPlaceholder: 'Role'
                                },
                                {
                                    header: 'Status',
                                    field: 'status',
                                    filter: true,
                                    bodyStyle: { minWidth: 150, maxWidth: 150 },
                                    filterPlaceholder: 'Role'
                                },
                                {
                                    header: 'Progress',
                                    body: (data: any) => {
                                        const completed = data?.completed || 0;
                                        const total = data?.total || 12;
                                        const percent = (completed / total) * 100;

                                        return (
                                            <div className="flex flex-column gap-1">
                                                {/* Outer bar */}
                                                <div className="h-2 border-round overflow-hidden bg-gray-200" style={{ height: '8px' }}>
                                                    {/* Inner fill */}
                                                    <div
                                                        style={{
                                                            width: `${percent > 0 ? percent : 0}%`, // avoids negative or NaN
                                                            background: '#3f4b5b',
                                                            height: '100%',
                                                            minWidth: percent === 0 ? '2px' : undefined, // ensures visibility at 0
                                                            transition: 'width 0.3s ease'
                                                        }}
                                                    ></div>
                                                </div>

                                                {/* Text below the bar */}
                                                <span className="text-sm">
                                                    {completed}/{total}
                                                </span>
                                            </div>
                                        );
                                    },
                                    bodyStyle: { minWidth: 150, maxWidth: 150 }
                                }
                            ]}
                            onDelete={(item: any) => onRowSelect(item, 'delete')}
                            onEdit={(item: any) => onRowSelect(item, 'edit')}
                        />
                    )}
                </div>
                <Dialog header="Evaluation Overview" visible={showOverviewDialog} style={{ width: '90vw' }} onHide={() => setShowOverviewDialog(false)} modal>
                    {/* KPI Cards */}
                    <hr className="mt-0 pt-0" />
                    <div className="grid mt-4">
                        {stats.map((stat, index) => (
                            <div key={index} className="col-12 md:col-4 lg:col-3">
                                <div className="text-left shadow-none border-1 border-round-lg  border-black-200 bg-white p-3">
                                    <div className="text-600 text-sm mb-2">{stat.label}</div>
                                    <div className="text-xl font-bold">{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-[#CBD5E1] border border-1 px-4 py-5 border-round-lg mt-4">
                        {/* Filters */}
                        <div className="flex gap-2  flex-wrap">
                            <Dropdown placeholder="BU" className="w-10rem" />
                            <Dropdown placeholder="Country" className="w-10rem" />
                            <Dropdown placeholder="Brand" className="w-10rem" />
                            <Dropdown placeholder="Assigned" className="w-10rem" />
                            <span className="p-input-icon-left ml-auto">
                                <i className="pi pi-search" />
                                <InputText placeholder="Search" className="w-12rem" />
                            </span>
                        </div>

                        {/* Table */}
                        <div className="overflow-auto ">
                            {isFetchingRegions ? (
                                <TableSkeletonSimple columns={2} rows={5} />
                            ) : (
                                <CustomDataTable
                                    ref={regionList}
                                    page={page}
                                    limit={limit} // no of items per page
                                    totalRecords={totalRecords} // total records from api response
                                    isView={false}
                                    // data={regionList?.map((item: any) => ({
                                    //     regionId: item?.regionId,
                                    //     regionName: item?.regionName,
                                    //     evaluationPeriod: item?.evaluationPeriod,
                                    //     completed: item?.completed || 0, // ← Add this
                                    //     total: item?.total || 12 // ← And this
                                    // }))}
                                    // extraButtons={(item) => [
                                    //     {
                                    //         icon: 'pi pi-eye',
                                    //         tooltip: 'View',
                                    //         onClick: (e) => {
                                    //             // setSelectedRow(rowData);
                                    //             setShowOverviewDialog(true);
                                    //         }
                                    //     },
                                    //     {
                                    //         icon: 'pi pi-copy',
                                    //         tooltip: 'Copy'
                                    //         // onClick: (e) => {
                                    //         //     // setSelectedRow(rowData);
                                    //         //     setShowOverviewDialog(true);
                                    //         // }
                                    //     }
                                    //     // {
                                    //     //     icon: "pi pi-envelope",
                                    //     //     tooltip:'Send Superior',
                                    //     //     // onClick: (e) => {
                                    //     //     //     handleButtonClick('sendSuperior'); // Pass the item (row data) instead of e
                                    //     //     // }
                                    //     // }
                                    // ]}
                                    // isEdit={true} // show edit button
                                    // isDelete={true} // show delete button
                                    data={EvaluationPopupList}
                                    onLoad={handleLoad}
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
                                            header: 'Evaluation Type',
                                            field: 'evaluationType',
                                            filter: true,
                                            bodyStyle: { minWidth: 150, maxWidth: 150 },
                                            filterPlaceholder: 'Role'
                                        },
                                        {
                                            header: 'BU',
                                            field: 'bu',
                                            filter: true,
                                            bodyStyle: { minWidth: 150, maxWidth: 150 },
                                            filterPlaceholder: 'Role'
                                        },
                                        {
                                            header: 'Country',
                                            field: 'country',
                                            filter: true,
                                            bodyStyle: { minWidth: 150, maxWidth: 150 },
                                            filterPlaceholder: 'Role'
                                        },
                                        {
                                            header: 'Version',
                                            field: 'version',
                                            filter: true,
                                            bodyStyle: { minWidth: 150, maxWidth: 150 },
                                            filterPlaceholder: 'Role'
                                        },
                                        {
                                            header: 'Brand',
                                            field: 'brand',
                                            filter: true,
                                            bodyStyle: { minWidth: 150, maxWidth: 150 },
                                            filterPlaceholder: 'Role'
                                        },
                                        {
                                            header: 'Vendors',
                                            field: 'vendor',
                                            filter: true,
                                            bodyStyle: { minWidth: 150, maxWidth: 150, cursor: 'pointer', color: '#DF177C', fontStyle: 'bold' },
                                            filterPlaceholder: 'Role'
                                        },
                                        {
                                            header: 'User Groups',
                                            field: 'userGroups',
                                            filter: false,
                                            bodyStyle: { minWidth: 200, maxWidth: 250 },
                                            body: (rowData: any) => {
                                                const dropdownOptions =
                                                    rowData?.userGroups?.map((ug: string) => ({
                                                        label: ug,
                                                        value: ug
                                                    })) || [];
                                                if (!rowData.selectedUserGroup && dropdownOptions.length > 0) {
                                                    rowData.selectedUserGroup = dropdownOptions[0].value;
                                                }
                                                return (
                                                    <Dropdown
                                                        value={rowData.selectedUserGroup}
                                                        options={dropdownOptions}
                                                        onChange={(e) => {
                                                            rowData.selectedUserGroup = e.value;
                                                        }}
                                                        placeholder="Select Group"
                                                        className="w-full"
                                                    />
                                                );
                                            }
                                        }
                                    ]}
                                    // onDelete={(item: any) => onRowSelect(item, 'delete')}
                                    // onEdit={(item: any) => onRowSelect(item, 'edit')}
                                />
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end mt-4">
                        <Button label="Cancel" className="p-button-text" onClick={() => setShowOverviewDialog(false)} />
                    </div>
                </Dialog>

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
                    // These props would be dynamically set based on which "upload" button was clicked,
                    // or which master data type the user intends to upload.
                    header={'Upload Bulk Area List'}
                    uploadContextLabel="This is Context Label"
                    demoFileLink="Link"
                    demoFileLabel="Download sample Template"
                    apiEndpoint="/mrkt/api/mrkt/bulkuploadmaster"
                    maxFileSizeInBytes={1 * 1024 * 1024} // 1MB
                    acceptedFileExtensions={['xlsx', 'xls', 'xlsm']}
                    onHideDialog={() => setShowFileUploadDialog(false)}
                    // onUploadSuccess={handleDialogUploadSuccess}
                    onUploadSuccess={() => setShowFileUploadDialog(false)}
                />
            )}
        </div>
    );
}

export default EvaluationCalendar;
