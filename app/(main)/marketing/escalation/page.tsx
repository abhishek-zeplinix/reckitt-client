'use client';
import React, { useEffect, useState, useMemo, useRef, useContext } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DeleteCall, GetCall } from '@/app/api-config/ApiKit';
import { useAppContext } from '@/layout/AppWrapper';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import CustomDataTable from '@/components/CustomDataTable';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { useRouter } from 'next/navigation';
import { InputText } from 'primereact/inputtext';
import { OverlayPanel } from 'primereact/overlaypanel';

const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};



const EscalationList = () => {
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [accounts, setAccounts] = useState<any>([]);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
    const [selectedAccountForDelete, setSelectedAccountForDelete] = useState<any>(null);
    const { setAlert, setLoading, isLoading, } = useAppContext();
    const router = useRouter();
    const [totalRecords, setTotalRecords] = useState(0);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [searchText, setSearchText] = useState('');
    const { layoutState } = useContext(LayoutContext);
    const [menu, setMenu] = useState<any>(null);
    const overlayRef = useRef<any>(null);

    const searchInputRef = useRef<HTMLInputElement>(null);

    //filters
    const [filters, setFilters] = useState<any>({
        masterCountryId: null,
        brandId: null,
        status: null
    });
    const [countryOptions, setCountryOptions] = useState<any>([]);
    const [brandOptions, setBrandOptions] = useState<any>([]);


    useEffect(() => {
        fetchData();
        // fetchOptions();
    }, []);

    useEffect(() => {
        setPage(1);
        const params = {

            page: 1,
            limit,
            ...(filters.brandId && { 'filters.brandId': filters.brandId }),
            ...(filters.masterCountryId && { 'filters.countryId': filters.masterCountryId }),
            ...(filters.status && { 'filters.status': filters.status }),
            searchText: searchText ? searchText.trim().toLowerCase() : ''
        };
        fetchData(params);
    }, [filters, searchText]);

    const handleViewOpen = (account: any) => {
        // router.push('/marketing/analysis-setup/view-account-details');
    };

    const fetchOptions = async () => {
        try {
            const params = { pagination: false };
            const queryString = buildQueryParams(params);
            const responseCountries = await GetCall(`/mrkt/api/mrkt/country?${queryString}`);
            if (responseCountries.code?.toLowerCase() === 'success') {
                setCountryOptions(responseCountries.data);
            } else {
                setCountryOptions([]);
                setAlert('error', responseCountries.message || 'Failed to load country options');
            }


            const responseBrands = await GetCall(`/mrkt/api/mrkt/brand?${queryString}`);
            if (responseBrands.code?.toLowerCase() === 'success') {
                setBrandOptions(responseBrands.data);
            } else {
                setBrandOptions([]);
                setAlert('error', responseBrands.message || 'Failed to load brand options');
            }
        } catch (err) {
            setAlert('error', 'Failed to load filter options');
        }
    };

    console.log(filters, 'filters');

    const fetchData = async (params?: any) => {
        setLoading(true);

        const dummyData = [
            {
                evaluationAccountId: 1,
                accountName: "2025-JAN-H1-Creative-uzbekistan",
                evaluationCombination: {
                    label: "January 2025",
                    country: {
                        countryName: "Uzbekistan"
                    }
                },
                vendor: {
                    vendorName: "Vendor A"
                },
                brand: {
                    brandName: "Brand X"
                },
                assessorGroup: "Group 1",
                Vendor: "Vendor A",
                region: "APAC",
                bu: "BU 1",
                account: 'Account 1'
            },
            {
                evaluationAccountId: 2,
                accountName: "2025-FEB-H1-Creative-UK",
                evaluationCombination: {
                    label: "February 2025",
                    country: {
                        countryName: "UK"
                    }
                },
                vendor: {
                    vendorName: "Vendor B"
                },
                brand: {
                    brandName: "Brand Y"
                },
                assessorGroup: "Group 2",
                region: "EMEA",
                Vendor: "Vendor B",
                bu: "BU 1",
                account: 'Account 1'
            },
            {
                evaluationAccountId: 3,
                accountName: "2025-MAR-H2-Performance-India",
                evaluationCombination: {
                    label: "March 2025",
                    country: {
                        countryName: "India"
                    }
                },
                vendor: {
                    vendorName: "Vendor C"
                },
                brand: {
                    brandName: "Brand Z"
                },
                assessorGroup: "Group 3",
                region: "APAC",
                Vendor: "Vendor C",
                bu: "BU 2",
                account: 'Account 2'
            },
            {
                evaluationAccountId: 4,
                accountName: "2025-APR-H1-Creative-UAE",
                evaluationCombination: {
                    label: "April 2025",
                    country: {
                        countryName: "UAE"
                    }
                },
                vendor: {
                    vendorName: "Vendor D"
                },
                brand: {
                    brandName: "Brand W"
                },
                assessorGroup: "Group 4",
                region: "MEA",
                Vendor: "Vendor D",
                bu: "BU 3",
                account: 'Account 3'
            },
            {
                evaluationAccountId: 5,
                accountName: "2025-MAY-H2-Performance-KSA",
                evaluationCombination: {
                    label: "May 2025",
                    country: {
                        countryName: "KSA"
                    }
                },
                vendor: {
                    vendorName: "Vendor E"
                },
                brand: {
                    brandName: "Brand V"
                },
                assessorGroup: "Group 5",
                region: "MEA",
                Vendor: "Vendor E",
                bu: "BU 4",
                account: 'Account 4'
            }
        ];

        if (!params) {
            params = {
                page: page,
                limit: limit,
                ...(filters.brandId && { 'filters.brandId': filters.brandId }),
                ...(filters.masterCountryId && { 'filters.countryId': filters.masterCountryId }),
                ...(filters.status && { 'filters.status': filters.status }),
                searchText: searchText ? searchText.trim().toLowerCase() : ''
            };
        }


        let filteredData = dummyData;
        if (params?.searchText) {
            const searchText = params.searchText.toLowerCase();
            filteredData = dummyData.filter(item =>
                item.accountName.toLowerCase().includes(searchText) ||
                item.evaluationCombination?.label.toLowerCase().includes(searchText) ||
                item.vendor?.vendorName.toLowerCase().includes(searchText) ||
                item.evaluationCombination?.country?.countryName.toLowerCase().includes(searchText) ||
                item.brand?.brandName.toLowerCase().includes(searchText)
            );
        }

        // Simulate pagination
        const startIndex = (page - 1) * limit;
        const paginatedData = filteredData.slice(startIndex, startIndex + limit);

        // console.log(params.filters, 'params.filters');

        // const queryString = buildQueryParams(params);

        // try {
        //     const response = await GetCall(`/mrkt/api/mrkt/evaluation-details?${queryString}`);
        //     if (response.code?.toLowerCase() === 'success') {
        //         setAccounts(response.data);
        //         // setAccounts([]);
        //         setTotalRecords(response.total || response.data.length);
        //     } else {
        //         setAlert('error', response.message || 'Failed to fetch data');
        //         setAccounts([]);
        //         setTotalRecords(0);
        //     }
        // } catch (err) {
        //     setAlert('error', 'Something went wrong!');
        // } finally {
        //     setLoading(false);
        // }

        setAccounts(paginatedData);
        setTotalRecords(filteredData.length);
        setLoading(false);

    };

    const handleDeleteAccount = async (accountToDelete: { evaluationAccountId: any; }) => {
        try {
            await DeleteCall(`/mrkt/api/mrkt/evaluation-account/${accountToDelete.evaluationAccountId}`);
            await fetchData();
            setAlert('success', 'Account deleted successfully!');
        } catch (err) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setIsDeleteDialogVisible(false);
            setSelectedAccountForDelete(null);
        }
    };

    const openDeleteDialog = (account: any) => {
        setSelectedAccountForDelete(account);
        setIsDeleteDialogVisible(true);
    };

    const closeDeleteDialog = () => {
        // setIsDeleteDialogVisible(false);
        setSelectedAccountForDelete(null);
    };



    const onRowSelect = async (account: any, action: any) => {
        if (action === ACTIONS.DELETE) {
            openDeleteDialog(account);
        }

        if (action === ACTIONS.EDIT) {
            router.push(`marketing/marketing-details-dev/configure?evaluationAccountId=${account.evaluationAccountId}&edit=true`);
        }

        if (action === ACTIONS.VIEW) {
            setSelectedAccount(account);
            handleViewOpen(account);
            setActiveTabIndex(0);
        }
    };

    const handleOpenMenu = (event: any, item: any) => {
        setSelectedAccount(item);
        overlayRef.current?.toggle(event);
    };


    return (
        <div className="">
            <div className="flex justify-content-between items-center mb-4">
                <div>
                    <h3>Manage Escalations</h3>
                    <div className='-mt-2'>
                        <span className="text-sm">Manage and review your Escalations.</span>
                    </div>
                </div>
                <div>
                    <Button
                        label="Create Escalation"
                        icon="pi pi-plus"
                        onClick={() => router.push('/marketing/escalation/create-escalation')}
                    />
                </div>
            </div>
            <hr className="my-4" />

            <div className="flex gap-2 align-items-center">
                {/* <Dropdown
                    value={filters.masterCountryId}
                    options={[
                        { label: 'All Countries', value: null },
                        ...countryOptions.map((c: any) => ({ label: c.countryName, value: c.masterCountryId }))
                    ]}
                    onChange={(e) => setFilters({ ...filters, masterCountryId: e.value })}
                    placeholder="Select Country"
                    className="w-10rem"
                    showClear
                />

                <Dropdown
                    value={filters.brandId}
                    options={[
                        { label: 'All Brands', value: null },
                        ...brandOptions.map((b: any) => ({ label: b.brandName, value: b.brandId }))
                    ]}
                    onChange={(e) => setFilters({ ...filters, brandId: e.value })}
                    placeholder="Select Brand"
                    className="w-10rem"
                    showClear
                />

                <Dropdown
                    value={filters.status}
                    options={[
                        { label: 'All Status', value: null },
                        { label: 'Active', value: 'active' },
                        { label: 'Inactive', value: 'inactive' }
                    ]}
                    onChange={(e) => setFilters({ ...filters, status: e.value })}
                    placeholder="Select Status"
                    className="w-10rem"
                    showClear
                /> */}

                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        ref={searchInputRef}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search"
                        className="w-full"
                    />
                </span>

            </div>
            <CustomDataTable
                page={page}
                limit={limit}
                totalRecords={totalRecords}
                // isView={true}
                isEdit={false}
                isDelete={false}
                data={accounts}


                columns={[
                    {
                        // header: 'Actions',
                        body: (data: any) => (
                            <>
                                <Button
                                    icon="pi pi-eye"
                                    className="p-button-rounded p-button-text text-primary"
                                // onClick={(e) => handleOpenMenu(e, data)}
                                />
                                <Button
                                    icon="pi pi-ellipsis-h"
                                    className="p-button-rounded p-button-text text-primary"
                                    onClick={(e) => handleOpenMenu(e, data)}
                                />
                            </>
                        ),
                        bodyStyle: { minWidth: 80, maxWidth: 80 }
                    },
                    {
                        header: '#',
                        body: (data: any, options: any) => {
                            const normalizedRowIndex = options.rowIndex % limit;
                            const srNo = (page - 1) * limit + normalizedRowIndex + 1;
                            return <span>{srNo}</span>;
                        },
                        bodyStyle: { minWidth: 60, maxWidth: 60 }
                    },
                    {
                        header: 'Evaluation',
                        field: 'accountName',
                        filter: true,
                        bodyStyle: { minWidth: 150, maxWidth: 200 },
                        filterPlaceholder: 'Account Name'
                    },
                    {
                        header: 'Reporting Month',
                        body: (data: any) => data.evaluationCombination?.label || '',
                        bodyStyle: { minWidth: 200, maxWidth: 250 }
                    },
                    {
                        header: 'Account',
                        body: (data: any) => data.account || '',
                        bodyStyle: { minWidth: 120, maxWidth: 150 }
                    },
                    {
                        header: 'BU',
                        body: (data: any) => data.bu || '',
                        bodyStyle: { minWidth: 100, maxWidth: 120 }
                    },
                    {
                        header: 'Region',
                        body: (data: any) => data.region || '',
                        bodyStyle: { minWidth: 100, maxWidth: 120 }
                    },
                    {
                        header: 'Vendor',
                        body: (data: any) => data.Vendor || '',
                        bodyStyle: { minWidth: 100, maxWidth: 120 }
                    },
                    {
                        header: 'Assessor Group',
                        body: (data: any) => data.assessorGroup || '',
                        bodyStyle: { minWidth: 100, maxWidth: 120 }
                    },

                ]}
                onLoad={(params: any) => fetchData(params)}
                onDelete={(item: any) => onRowSelect(item, ACTIONS.DELETE)}
                onEdit={(item: any) => onRowSelect(item, ACTIONS.EDIT)}
                onView={(item: any) => onRowSelect(item, ACTIONS.VIEW)}
            />

            <OverlayPanel ref={overlayRef}>
                <div className="flex flex-column gap-2">
                    <Button
                        icon="pi pi-caret-right mr-2"
                        className="p-button-text p-button text-600 text-sm p-1 px-2 border-1 border-round-xl border-solid border-400"
                        onClick={() => {
                            onRowSelect(selectedAccount, ACTIONS.VIEW);
                            overlayRef.current?.hide();
                        }}
                    >
                        {/* <i className="pi pi-caret-right mr-2"></i> */}
                        Initialise
                    </Button>
                    <Button
                        icon="pi pi-bell mr-2"
                        className="p-button-text text-600 text-sm p-0 p-1 px-2 border-1 border-round-xl border-solid border-400"
                        onClick={() => {
                            onRowSelect(selectedAccount, ACTIONS.VIEW);
                            overlayRef.current?.hide();
                        }}
                    >
                        Send Reminder
                    </Button>
                    <Button
                        icon="pi pi-send mr-2"
                        className="p-button-text text-600 text-sm p-0 p-1 px-2 border-1 border-round-xl border-solid border-400"
                        onClick={() => {
                            onRowSelect(selectedAccount, ACTIONS.VIEW);
                            overlayRef.current?.hide();
                        }}
                    >
                        Send Superior
                    </Button>
                </div>
            </OverlayPanel >
            <Dialog
                header="Delete confirmation"
                visible={isDeleteDialogVisible}
                style={{ width: layoutState?.isMobile ? '90vw' : '50vw' }}
                className="delete-dialog"
                footer={
                    <div className="flex justify-content-center p-2">
                        <Button
                            label="Cancel"
                            style={{ color: '#DF1740' }}
                            className="px-7"
                            text
                            onClick={closeDeleteDialog}
                        />
                        <Button
                            label="Delete"
                            style={{ backgroundColor: '#DF1740', border: 'none' }}
                            className="px-7 hover:text-white"
                            onClick={() => handleDeleteAccount(selectedAccountForDelete)}
                            loading={isLoading}
                        />
                    </div>
                }
                onHide={closeDeleteDialog}
            >
                <div className="flex flex-column w-full surface-border p-2 text-center gap-4">
                    <i className="pi pi-info-circle text-6xl" style={{ marginRight: 10, color: '#DF1740' }}></i>
                    <div className="flex flex-column align-items-center gap-1">
                        <span>Are you sure you want to delete this Account? </span>
                        <span>This action cannot be undone. </span>
                    </div>
                </div>
            </Dialog>


        </div >
    );
};

export default EscalationList;