'use client';
import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Panel } from 'primereact/panel';
import CustomDataTable from '@/components/CustomDataTable';
import { getRowLimitWithScreenHeight } from '@/utils/utils';
import { Tag } from 'primereact/tag';


const dummyData = [
    {
        id: 1,
        setUp: ['R(0/2)', 'RS(0/2)', 'A(1/2)', 'AS(0/2)'],
    },
    {
        id: 2,
        setUp: ['R(2/2)', 'RS(0/2)', 'A(1/2)', 'AS(0/2)'],
    },
    {
        id: 3,
        setUp: ['R(1/2)', 'RS(2/2)', 'A(1/2)', 'AS(2/2)'],
    },
];

const ViewProgressDetails = ({ data, onBack }: any) => {
    const [agencyFilter, setAgencyFilter] = useState(null);
    const [accountFilter, setAccountFilter] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [showTemplatePanel, setShowTemplatePanel] = useState(true);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());

    const statusTypes = [
        { id: 1, name: 'Peding', color: '#FF3B30' },
        { id: 2, name: 'In Process', color: '#FF9500' },
        { id: 3, name: 'Completed', color: '#34C759' },
    ];

    const agencyOptions = [
        { label: 'Agency 1', value: 'Agency 1' },
        { label: 'Agency 2', value: 'Agency 2' },
        { label: 'Agency 3', value: 'Agency 3' },
        { label: 'Agency 4', value: 'Agency 4' }
    ];

    const accountOptions = [
        { label: 'Global Brand Campaign', value: 'Global Brand Campaign' }
    ];

    //     {
    //         id: 1,
    //         agency: 'Agency 1',
    //         account: 'Global Brand Campaign',
    //         questionSet: 'Creative Evaluation Template V2',
    //         setUp: ['2024 AD1', '2024 AD1']
    //     },
    //     {
    //         id: 2,
    //         agency: 'Agency 2',
    //         account: 'Global Brand Campaign',
    //         questionSet: 'Creative Evaluation Template V2',
    //         setUp: ['2024 AD1', '2024 AD1', '2024 AD1']
    //     },
    //     {
    //         id: 3,
    //         agency: 'Agency 3',
    //         account: 'Global Brand Campaign',
    //         questionSet: 'Creative Evaluation Template V2',
    //         setUp: ['2024 AD1', '2024 AD1']
    //     },
    //     {
    //         id: 4,
    //         agency: 'Agency 4',
    //         account: 'Global Brand Campaign',
    //         questionSet: 'Creative Evaluation Template V2',
    //         setUp: ['2024 AD1', '2024 AD1']
    //     }
    // ];



    // const setUpBodyTemplate = (rowData: any) => {
    //     return (
    //         <div className="flex flex-wrap gap-2">
    //             {rowData.setUp.map((setup: any, idx: any) => (
    //                 <div key={idx} className="flex align-items-center gap-1">
    //                     <i
    //                         className="pi pi-circle-fill"
    //                         style={{
    //                             fontSize: '0.5rem',
    //                             color: idx % 2 === 0 ? '#8B5CF6' : '#3B82F6'
    //                         }}
    //                     ></i>
    //                     <span className="text-sm text-600">{setup}</span>
    //                 </div>
    //             ))}
    //         </div>
    //     );
    // };

    const colorMap: any = {
        R: 'danger',
        RS: 'success',
        A: 'warning',
        AS: 'danger',
    };
    const setUpBodyTemplate = (rowData: any) => {
        return (
            <div className="flex flex-row flex-wrap gap-2">
                {rowData.setUp.map((setup: any, idx: any) => {
                    const [label] = setup.split('(');

                    return (
                        <span
                            key={idx}
                            className={`
                                        px-3 py-1 border text-sm border-round-2xl 
                                        ${label === 'R' ? 'bg-red-100 text-red-700 border-solid border-red-300' : ''}
                                        ${label === 'RS' ? 'bg-green-100 text-green-700 border-solid border-green-300' : ''}
                                        ${label === 'A' ? 'bg-yellow-100 text-yellow-700 border-solid border-yellow-300' : ''}
                                        ${label === 'AS' ? 'bg-red-100 text-red-700 border-solid border-red-300' : ''}
                             `}
                        >
                            {setup}
                        </span>
                    );
                })}
            </div>
        );
    };


    const templatePanelHeader = (
        <div className="flex align-items-center justify-content-between">
            <span className="font-medium">Status Labels</span>
            {/* <Button
                icon={showTemplatePanel ? "pi pi-chevron-up" : "pi pi-chevron-down"}
                className="p-button-text p-button-sm"
                onClick={() => setShowTemplatePanel(!showTemplatePanel)}
            /> */}
        </div>
    );

    return (
        <div className="surface-0 min-h-screen">
            {/* Header */}
            <div className="flex justify-content-between align-items-center mb-4 border-1 border-round p-4 " style={{ backgroundColor: '#F8FAFC', borderColor: '#E5E7EB' }}>
                <div>
                    <h1 className="text-2xl font-semibold text-900 m-0">2025-5, H1 Creative Global</h1>
                    <div className="flex gap-4 text-sm text-600 mt-1">
                        <span>Type: Annual</span>
                        <span>Year: 2025</span>
                        <span>Month: 5</span>
                    </div>
                </div>
                <div className='flex gap-2'>

                    <Button
                        label="Back"
                        icon="pi pi-arrow-left"
                        onClick={() => {
                            console.log('Back button clicked');
                            onBack();
                        }}
                        className="p-button-outlined"
                    />
                </div>
            </div>

            <div className="mb-4 custom-panel-viewaccounts">
                <Panel
                    header={templatePanelHeader}
                    toggleable
                    collapsed={!showTemplatePanel}
                    onToggle={(e) => setShowTemplatePanel(!e.value)}
                >
                    <div className="grid mb-3">
                        {statusTypes.map((template: any) => (
                            <div key={template.id} className="col-12 md:col-4">
                                <div className="flex align-items-center gap-3 p-3 border-round bg-white border-1 border-300">
                                    <div
                                        className="flex align-items-center justify-content-center border-circle text-white font-bold"
                                        style={{
                                            backgroundColor: template.color,
                                            width: '2rem',
                                            height: '2rem'
                                        }}
                                    >
                                        {template.initial}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium text-sm">{template.name}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Owner/Assessor Section */}
                    <div className="grid bg-white">
                        <div className="col-12 md:col-3">
                            <div className="p-1 " >
                                <div className="flex align-items-center gap-2 text-sm font-medium text-700 p-2 border-round" style={{ backgroundColor: '#F8FAFC' }}>
                                    <span>R: Reckitt</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="p-1">
                                <div className="flex align-items-center gap-2 text-sm font-medium text-700 p-2 border-round" style={{ backgroundColor: '#F8FAFC' }} >
                                    <span>RS: Reckitt Self</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="p-1 " >
                                <div className="flex align-items-center gap-2 text-sm font-medium text-700 p-2 border-round" style={{ backgroundColor: '#F8FAFC' }}>
                                    <span>A: Agency</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 md:col-3">
                            <div className="p-1">
                                <div className="flex align-items-center gap-2 text-sm font-medium text-700 p-2 border-round" style={{ backgroundColor: '#F8FAFC' }} >
                                    <span>AS: Agency Self</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Panel>
            </div>

            <div className="flex flex-wrap gap-3 mb-4">
                <Dropdown
                    value={agencyFilter}
                    options={agencyOptions}
                    onChange={(e) => setAgencyFilter(e.value)}
                    placeholder="Filter by Agency"
                    className="w-12rem"
                    showClear
                />

                <Dropdown
                    value={accountFilter}
                    options={accountOptions}
                    onChange={(e) => setAccountFilter(e.value)}
                    placeholder="Filter by Account"
                    className="w-12rem"
                    showClear
                />

                <span className="p-input-icon-left flex-1">
                    <i className="pi pi-search" />
                    <InputText
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        placeholder="Search"
                        className="w-12rem"
                    />
                </span>

                {/* <Button
                    label="Column"
                    icon="pi pi-bars"
                    className="p-button-outlined"
                /> */}
            </div>

            {/* Data Table */}
            <CustomDataTable
                data={dummyData}
                page={page}
                limit={limit}
                isEdit={false}
                isDelete={false}
                isView={false}
                className="p-datatable-sm"
                columns={[
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
                        header: 'Agency',
                        field: 'agency',
                        filter: true,
                        bodyStyle: { minWidth: 150, maxWidth: 200, minHeight: '5rem' },
                        filterPlaceholder: 'Account Name'
                    },
                    {
                        header: 'Account',
                        field: 'account',
                        filter: true,
                        bodyStyle: { minWidth: 150, maxWidth: 200 },
                        filterPlaceholder: 'Account Name'
                    },

                    {
                        header: 'Open/Completed',
                        body: () => setUpBodyTemplate(dummyData[0]),
                        bodyStyle: { minWidth: 200, maxWidth: 250 }
                    },

                ]}
            // onLoad={(params: any) => fetchData(params)}
            // onDelete={(item: any) => onRowSelect(item, ACTIONS.DELETE)}
            // onEdit={(item: any) => onRowSelect(item, ACTIONS.EDIT)}
            // onView={(item: any) => onRowSelect(item, ACTIONS.VIEW)}
            />
        </div >
    );
};

export default ViewProgressDetails;