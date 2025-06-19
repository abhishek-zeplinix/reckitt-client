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
    { label: 'Vendors', value: 512 },
    { label: 'Total Reviews', value: 200 / 1000 },
    { label: 'Assigned', value: 200 },
    { label: 'Unassigned', value: 800 }
];
const vendorsList = [
    {
        vendorName: 'Vendor1'
    },
    {
        vendorName: 'Vendor2'
    },
    {
        vendorName: 'Vendor3'
    },
    {
        vendorName: 'Vendor4'
    },
    {
        vendorName: 'Vendor5'
    },
    {
        vendorName: 'Vendor6'
    },
    {
        vendorName: 'Vendor7'
    },
    {
        vendorName: 'Vendor8'
    },
    {
        vendorName: 'Vendor9'
    }
];
const AreaList = [
    {
        country: 'AT-Austria',
        areaScorecard: 'Europe',
        region: 'Central Europe',
        comment: 'Comment 3'
    },
    {
        country: 'AE-Utd.Arab Emir.',
        areaScorecard: 'Emerging Markets',
        region: 'MENARP',
        comment: 'Comment 1'
    },
    {
        country: 'AR-Argentina',
        areaScorecard: 'Emerging Markets',
        region: 'LATAM',
        comment: 'Comment 2'
    },

    {
        country: 'AU-Australia',
        areaScorecard: 'Europe',
        region: 'Global',
        comment: 'Comment 4'
    },
    {
        country: 'AU-Australia',
        areaScorecard: 'Europe',
        region: 'Australia & NZ',
        comment: 'Comment 5'
    },
    {
        country: 'BD-Bangladesh',
        areaScorecard: 'Emerging Markets',
        region: 'South Asia',
        comment: 'Comment 6'
    },
    {
        country: 'BE-Belgium',
        areaScorecard: 'Europe',
        region: 'West Europe',
        comment: 'Comment 7'
    },
    {
        country: 'BH-Bahrain',
        areaScorecard: 'Emerging Markets',
        region: 'MENARP',
        comment: 'Comment 8'
    },
    {
        country: 'BR-Brazil',
        areaScorecard: 'Emerging Markets',
        region: 'LATAM',
        comment: 'Comment 9'
    },
    {
        country: 'CA-Canada',
        areaScorecard: 'North America',
        region: 'North America',
        comment: 'Comment 10'
    },
    {
        country: 'CH-Switzerland',
        areaScorecard: 'Europe',
        region: 'Central Europe',
        comment: 'Comment 11'
    },
    {
        country: 'CL-Chile',
        areaScorecard: 'Emerging Markets',
        region: 'LATAM',
        comment: 'Comment 12'
    },
    {
        country: 'CN-China',
        areaScorecard: 'Emerging Markets',
        region: 'Greater China and North Asia',
        comment: 'Comment 13'
    },
    {
        country: 'CO-Colombia',
        areaScorecard: 'Emerging Markets',
        region: 'LATAM',
        comment: 'Comment 14'
    },
    {
        country: 'CR-Costa Rica',
        areaScorecard: 'Emerging Markets',
        region: 'LATAM',
        comment: 'Comment 15'
    }
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
const vendors = [
    {
        vendorName: 'Vendor 1',
        userGroups: ['ProcurementDirectLocalPPM (Evaluator)', 'ProcurementIndirectLocalIMEX (Creator)']
    },
    {
        vendorName: 'Vendor 2',
        userGroups: ['ProcurementDirectLocalPPM (Reviewer)']
    },
    {
        vendorName: 'Vendor 3',
        userGroups: ['ProcurementDirectGlobalEMO (Evaluator)', 'ProcurementDirectLocalPPM (Reviewer)']
    },
    {
        vendorName: 'Vendor 4',
        userGroups: ['ProcurementDirectLocalPPM (Creator)']
    },
    {
        vendorName: 'Vendor 5',
        userGroups: ['ProcurementDirectLocalPPM (Evaluator)']
    },
    {
        vendorName: 'Vendor 6',
        userGroups: ['ProcurementDirectLocalPPM (Reviewer)', 'ProcurementIndirectLocalIMEX (Creator)']
    },
    {
        vendorName: 'Vendor 7',
        userGroups: ['ProcurementDirectGlobalEMO (Evaluator)']
    },
    {
        vendorName: 'Vendor 8',
        userGroups: ['ProcurementIndirectLocalIMEX (Creator)', 'ProcurementDirectLocalPPM (Evaluator)']
    },
    {
        vendorName: 'Vendor 9',
        userGroups: ['ProcurementDirectLocalPPM (Reviewer)']
    },
    {
        vendorName: 'Vendor 10',
        userGroups: ['ProcurementDirectLocalPPM (Evaluator)', 'ProcurementDirectLocalPPM (Creator)']
    }
];

interface OptionType {
    label: string;
    value: string;
}
function AddEvaluationStep2() {
    const [region, setRegion] = useState<any>('Central Europe');
    const [country, setCountry] = useState<any>('AT-Austria');
    const [area, setArea] = useState<any>('Europe');
    const [comment, setComment] = useState<any>('Comment 3');
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
    const [selectedGroup, setSelectedGroup] = useState<OptionType | null>(null);
    const [selectedVendor, setSelectedVendor] = useState<any>(null);
    const [showVendorDialog, setShowVendorDialog] = useState(false);

    const userGroups: OptionType[] = [
        { label: 'ProcurementDirectGlobalEMEA (Evaluator)', value: 'emea' },
        { label: 'SupplyChainIndia (Admin)', value: 'india' },
        { label: 'QualityTeamUSA (Viewer)', value: 'usa' }
    ];
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
            setCountry(perm.country);
            setArea(perm.areaScorecard);
            setRegion(perm.region);
            setComment(perm.comment);
            // setSelectedRegionId(perm.regionId);
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

    const assignUserGroup = () => {
        console.log('Assigning group:', selectedGroup);
    };
    return (
        <div className="card">
            <div className="inner p-4 border-1 surface-border border-round">
                <div className="flex flex-wrap justify-content-between align-items-center mb-2 border-bottom-1 border-300">
                    {/* Title + Breadcrumb Block */}
                    <div className="">
                        <div>
                            <h3 className="flex gap-3 ">
                                <span>
                                    <Link href="">
                                        <i className="pi pi-arrow-left text-black"></i>
                                    </Link>
                                </span>
                                Add Evaluation Calendar
                            </h3>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-round-md">
                    <div className="grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="col-12 md:col-2 lg:col-2">
                                <div className="text-left shadow-none border-1 border-round-lg  border-black-200 bg-white p-3">
                                    <div className="text-600 text-sm mb-2">{stat.label}</div>
                                    <div className="text-xl font-bold">{stat.value}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {togglePanel && (
                    <div className="flex flex-column gap-4 w-full border-1 border-round surface-border p-3 input-fields-add-new">
                        {/* Input Fields */}
                        <div className="flex flex-wrap w-full justify-content-between gap-4 ">
                            <div className="flex flex-column gap-2" style={{ flex: '1 1 20%' }}>
                                <label htmlFor="country">
                                    Country <span style={{ color: 'red' }}>*</span>
                                </label>
                                <InputText id="country" value={country} onChange={(e) => setCountry(e.target.value)} className="w-full" placeholder="Enter Country" />
                                {regionError && <small className="p-error">{regionError}</small>}
                            </div>

                            <div className="flex flex-column gap-2" style={{ flex: '1 1 20%' }}>
                                <label htmlFor="area">
                                    Area Scorecard <span style={{ color: 'red' }}>*</span>
                                </label>
                                <InputText id="area" value={area} onChange={(e) => setArea(e.target.value)} className="w-full" placeholder="Enter Area" />
                                {regionError && <small className="p-error">{regionError}</small>}
                            </div>

                            <div className="flex flex-column gap-2" style={{ flex: '1 1 20%' }}>
                                <label htmlFor="region">
                                    Region <span style={{ color: 'red' }}>*</span>
                                </label>
                                <InputText id="region" value={region} onChange={(e) => setRegion(e.target.value)} className="w-full" placeholder="Enter Region" />
                                {regionError && <small className="p-error">{regionError}</small>}
                            </div>
                            <div className="flex flex-column gap-2" style={{ flex: '1 1 20%' }}>
                                <label htmlFor="comment">
                                    Comment <span style={{ color: 'red' }}>*</span>
                                </label>
                                <InputText id="comment" value={comment} onChange={(e) => setComment(e.target.value)} className="w-full" placeholder="Enter Comment" />
                                {regionError && <small className="p-error">{regionError}</small>}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-content-end gap-3 mt-3">
                            <Button label="Cancel" className="cancle-btn-outline" onClick={handleTogglePanel} />
                            <Button label="Save" className="save-btn" />
                        </div>
                    </div>
                )}

                {/* <div className="flex gap-2 justify-content-between align-items-center mt-3">
                    <div className="flex gap-2">
                        <Dropdown placeholder="Filter" className="w-10rem" showClear />
                        <Dropdown placeholder="Filter" className="w-10rem" showClear />

                        <Dropdown placeholder="Filter" className="w-10rem" showClear />
                    </div>

                    <div className="flex">
                        <span className="p-input-icon-left">
                            <i className="pi pi-search" />
                            <InputText value={searchText} onChange={(e) => setSearchText(e.target.value)} placeholder="Search" className="w-full" />
                        </span>
                    </div>
                </div> */}

                <div className="primary-background border border-1 px-4 py-5 border-round-lg mt-4">
                    {/* Filters */}
                    <div className="flex justify-content-end">
                        <div className="flex align-items-center gap-2 p-3 border-round border-1 border-200 surface-0" style={{ width: 'max-content' }}>
                            <Dropdown value={selectedGroup} onChange={(e) => setSelectedGroup(e.value)} options={userGroups} placeholder="Select Group" className="w-20rem" />
                            <Button label="Assign User Group" className="bg-gray-800 border-none text-white border-round-lg" onClick={assignUserGroup} />
                        </div>
                    </div>

                    <div className="flex gap-2  flex-wrap mt-4">
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
                                        bodyStyle: {
                                            minWidth: 150,
                                            maxWidth: 150,
                                            cursor: 'pointer',
                                            color: '#DF177C',
                                            fontWeight: 'bold'
                                        },
                                        filterPlaceholder: 'Vendor',
                                        body: (rowData: any) => (
                                            <span
                                                onClick={() => {
                                                    setSelectedVendor(rowData);
                                                    setShowVendorDialog(true);
                                                }}
                                            >
                                                {rowData.vendor}
                                            </span>
                                        )
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
                <div className="flex justify-content-end gap-3 mt-3">
                    <Button label="Cancel" className="cancle-btn-outline" onClick={handleTogglePanel} />
                    <Button label="Submit" className="save-btn" />
                </div>
                <Dialog header="Vendor Details" visible={showVendorDialog} onHide={() => setShowVendorDialog(false)} style={{ width: '90vw' }} breakpoints={{ '960px': '75vw', '641px': '90vw' }}>
                    {/* You can replace this with whatever you want inside */}
                    <div className="primary-background p-4 border border-1 border-round-md">
                        <div className="flex justify-content-end">
                            <div className="flex align-items-center gap-2 p-3 border-round border-1 border-200 surface-0" style={{ width: 'max-content' }}>
                                <Dropdown value={selectedGroup} onChange={(e) => setSelectedGroup(e.value)} options={userGroups} placeholder="Select Group" className="w-20rem" />
                                <Button label="Assign User Group" className="bg-gray-800 border-none text-white border-round-lg" onClick={assignUserGroup} />
                            </div>
                        </div>
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
                                    data={vendors}
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
                                            header: 'Vendors',
                                            field: 'vendorName',
                                            filter: true,
                                            bodyStyle: {
                                                minWidth: 150,
                                                maxWidth: 150,
                                                cursor: 'pointer',
                                                fontWeight: 'bold'
                                            },
                                            filterPlaceholder: 'Vendor',
                                            body: (rowData: any) => (
                                                <span
                                                    onClick={() => {
                                                        setSelectedVendor(rowData);
                                                        setShowVendorDialog(true);
                                                    }}
                                                >
                                                    {rowData.vendorName} {/* ✅ corrected key */}
                                                </span>
                                            )
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
                    <div className="flex justify-content-end gap-3 mt-3">
                        <Button label="Cancel" className="cancle-btn-outline" onClick={handleTogglePanel} />
                        <Button label="Submit" className="save-btn" />
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

export default AddEvaluationStep2;
