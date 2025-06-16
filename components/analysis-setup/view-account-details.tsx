'use client';
import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Panel } from 'primereact/panel';
import CustomDataTable from '@/components/CustomDataTable';
import { getRowLimitWithScreenHeight } from '@/utils/utils';

const ViewAccountDetails = ({ data, onBack }: any) => {
    const [agencyFilter, setAgencyFilter] = useState(null);
    const [accountFilter, setAccountFilter] = useState(null);
    const [searchText, setSearchText] = useState('');
    const [showTemplatePanel, setShowTemplatePanel] = useState(true);
    const [isDuplicateDialogOpen, setIsDuplicateDialogOpen] = useState(false);
    const [selectedRowForDuplicate, setSelectedRowForDuplicate] = useState<any>(null);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());

    const templateTypes = [
        { id: 1, name: 'Reckitt to Agency', color: '#582882', initial: 'R' },
        { id: 2, name: 'Reckitt self to Agency', color: '#582882', initial: 'S' },
        { id: 3, name: 'Agency to Reckitt', color: '#0058AA', initial: 'A' },
        { id: 4, name: 'Agency Self to Reckitt', color: '#0058AA', initial: 'S' }
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

    const dummyData = [
        {
            id: 1,
            agency: 'Agency 1',
            account: 'Global Brand Campaign',
            questionSet: 'Creative Evaluation Template V2',
            setUp: ['2024 AD1', '2024 AD1']
        },
        {
            id: 2,
            agency: 'Agency 2',
            account: 'Global Brand Campaign',
            questionSet: 'Creative Evaluation Template V2',
            setUp: ['2024 AD1', '2024 AD1', '2024 AD1']
        },
        {
            id: 3,
            agency: 'Agency 3',
            account: 'Global Brand Campaign',
            questionSet: 'Creative Evaluation Template V2',
            setUp: ['2024 AD1', '2024 AD1']
        },
        {
            id: 4,
            agency: 'Agency 4',
            account: 'Global Brand Campaign',
            questionSet: 'Creative Evaluation Template V2',
            setUp: ['2024 AD1', '2024 AD1']
        }
    ];

   

    const handleDuplicate = (row?: any) => {
        setSelectedRowForDuplicate(row || dummyData[0]);
        setIsDuplicateDialogOpen(true);
    };

    const handleDuplicateConfirm = () => {
        console.log('Duplicating row:', selectedRowForDuplicate);
        setIsDuplicateDialogOpen(false);
        setSelectedRowForDuplicate(null);
    };

    const actionBodyTemplate = (rowData: any) => {
        return (
            <div className="flex gap-2">
                <Button
                    icon="pi pi-pencil"
                    className="p-button-rounded p-button-text p-button-sm"
                    onClick={() => console.log('Edit', rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    className="p-button-rounded p-button-text p-button-sm p-button-danger"
                    onClick={() => console.log('Delete', rowData)}
                />
            </div>
        );
    };

    const setUpBodyTemplate = (rowData: any) => {
        return (
            <div className="flex flex-wrap gap-2">
                {rowData.setUp.map((setup: any, idx: any) => (
                    <div key={idx} className="flex align-items-center gap-1">
                        <i
                            className="pi pi-circle-fill"
                            style={{
                                fontSize: '0.5rem',
                                color: idx % 2 === 0 ? '#8B5CF6' : '#3B82F6'
                            }}
                        ></i>
                        <span className="text-sm text-600">{setup}</span>
                    </div>
                ))}
            </div>
        );
    };

    const templatePanelHeader = (
        <div className="flex align-items-center justify-content-between">
            <span className="font-medium">Template Types</span>
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
                        label="Duplicate"
                        icon="pi pi-copy"
                        onClick={() => handleDuplicate()}
                    />
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
                        {templateTypes.map((template: any) => (
                            <div key={template.id} className="col-12 md:col-3">
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
                        <div className="col-12 md:col-6">
                            <div className="p-1 " >
                                <div className="flex align-items-center gap-2 text-sm font-medium text-700 p-2 border-round" style={{ backgroundColor: '#F8FAFC' }}>
                                    <span>O: Owner</span>
                                </div>
                            </div>
                        </div>
                        <div className="col-12 md:col-6">
                            <div className="p-1">
                                <div className="flex align-items-center gap-2 text-sm font-medium text-700 p-2 border-round" style={{ backgroundColor: '#F8FAFC' }} >
                                    <span>A: Assessor</span>
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
                isEdit={true}
                isDelete={true}
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
                        bodyStyle: { minWidth: 150, maxWidth: 200 },
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
                        header: 'Question Set',
                        field: 'questionSet',
                        filter: true,
                        bodyStyle: { minWidth: 150, maxWidth: 200 },
                        filterPlaceholder: 'Account Name'
                    },
                    {
                        header: 'Set-Up',
                        body: () => setUpBodyTemplate(dummyData[0]),
                        bodyStyle: { minWidth: 200, maxWidth: 250 }
                    },
                    
                ]}
            // onLoad={(params: any) => fetchData(params)}
            // onDelete={(item: any) => onRowSelect(item, ACTIONS.DELETE)}
            // onEdit={(item: any) => onRowSelect(item, ACTIONS.EDIT)}
            // onView={(item: any) => onRowSelect(item, ACTIONS.VIEW)}
            />

            {/* Duplicate Dialog */}
            <Dialog
                header="Duplicate Confirmation"
                visible={isDuplicateDialogOpen}
                style={{ width: '400px' }}
                onHide={() => setIsDuplicateDialogOpen(false)}
                footer={
                    <div className="flex justify-content-end gap-2">
                        <Button
                            label="Cancel"
                            className="p-button-text"
                            onClick={() => setIsDuplicateDialogOpen(false)}
                        />
                        <Button
                            label="Duplicate"
                            style={{ backgroundColor: '#ec4899', borderColor: '#ec4899' }}
                            onClick={handleDuplicateConfirm}
                        />
                    </div>
                }
            >
                <div className="text-center p-4">
                    <i className="pi pi-info-circle text-6xl mb-3" style={{ color: '#ec4899' }}></i>
                    <p className="text-600 mb-0">
                        Are you sure you want to duplicate this evaluation setup? This will create a copy with the same configuration.
                    </p>
                </div>
            </Dialog>
        </div >
    );
};

export default ViewAccountDetails;