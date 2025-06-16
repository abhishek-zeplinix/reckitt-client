'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { DeleteCall, GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { useAppContext } from '@/layout/AppWrapper';
import { Calendar } from 'primereact/calendar';
import { Card } from 'primereact/card';

const EvaluationPage = () => {
    const toast = useRef<Toast>(null);
    const [savedData, setSavedData] = useState<[]>([]);
    const [isClient, setIsClient] = useState(false);
    const [yearOptions, setYearOptions] = useState<{ label: string; value: string }[]>([]);
    const [monthOptions, setMonthOptions] = useState<{ label: string; value: number }[]>([]);
    const [timeframeOptions, setTimeframeOptions] = useState<{ label: string; value: string }[]>([]);
    const [reviewTypes, setReviewTypes] = useState<{ label: string; value: string }[]>([]);
    const [countries, setCountries] = useState<{ label: string; value: string }[]>([]);
    const [region, setregion] = useState<{ label: string; value: string }[]>([]);
    const [deleteDialogVisible, setDeleteDialogVisible] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
    const [selectedTimeframes, setSelectedTimeframes] = useState<string[]>([]);
    const [selectedReviewTypes, setSelectedReviewTypes] = useState<string[]>([]);
    const [selectedRegion, setSelectedRegion] = useState<any[]>([]);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [implementDate, setImplementDate] = useState<Date | null>(null);
    const { setAlert, setLoading, isLoading } = useAppContext();
    const [editingEvaluation, setEditingEvaluation] = useState<any>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [visible, setVisible] = useState(false);
    const [totalRecords, setTotalRecords] = useState(0);

    useEffect(() => {
        const currentYear = new Date().getFullYear();
        const futureYears = Array.from({ length: 11 }, (_, i) => ({
            label: `${currentYear + i}`, value: `${currentYear + i}`
        }));
        setYearOptions(futureYears);
        const months = Array.from({ length: 12 }, (_, i) => ({
            label: new Date(0, i).toLocaleString('default', { month: 'short' }),
            value: i + 1  
        }));
        setMonthOptions(months);
        setTimeframeOptions([
            { label: 'H1', value: 'H1' },
            { label: 'H2', value: 'H2' }
        ]);
        const fetchDropdowns = async () => {
            try {
                setLoading(true);
                const [reviewRes, countryRes,regionData] = await Promise.all([
                    GetCall('/mrkt/api/mrkt/reviewTypes'),
                    GetCall('/mrkt/api/mrkt/country'),
                    GetCall('/mrkt/api/mrkt/region')
                ]);
                setReviewTypes(reviewRes.data.map((r: any) => ({ label: r.reviewTypeName, value: r.reviewTypeId })));
                setCountries(countryRes.data.map((c: any) => ({ label: c.countryName, value: c.masterCountryId })));
                setregion(regionData.data.map((c: any) => ({ label: c.regionName, value: c.regionId })));
                setLoading(false);
            } catch (error) {
                setAlert('error', 'Failed to load dropdown options');
            }
        };
        fetchDropdowns();
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (startDate && endDate && startDate > endDate) {
            setAlert('warn', 'End date should be after start date');
        }
        if (implementDate && startDate && implementDate < startDate) {
            setAlert('warn', 'Implementation date should be after start date');
        }
    }, [startDate, endDate, implementDate]);

    useEffect(() => {
        fetchSavedEvaluations();
    }, []);

    useEffect(() => {
        if (selectedMonths.length === 0) {
            setSelectedTimeframes([]);
            return;
        }
        const hasH1 = selectedMonths.some((month) => month >= 1 && month <= 6);
        const hasH2 = selectedMonths.some((month) => month >= 7 && month <= 12);

        if (hasH1 && hasH2) {
            setSelectedTimeframes(['H1', 'H2']);
        } else if (hasH1) {
            setSelectedTimeframes(['H1']);
        } else if (hasH2) {
            setSelectedTimeframes(['H2']);
        }
    }, [selectedMonths]);

    const fetchSavedEvaluations = async () => {
        try {
            setLoading(true);
            const response = await GetCall('/mrkt/api/mrkt/evaluation-combination');
            const normalizedData = response.data.map((item: any) => ({
                ...item,
                months: Array.isArray(item.months) ? item.months : [],
                timeFrame: Array.isArray(item.timeFrame) ? item.timeFrame : [],
                reviewTypes: Array.isArray(item.reviewTypes) ? item.reviewTypes : [],
                countries: Array.isArray(item.countries) ? item.countries : []
            }));
            setSavedData(normalizedData);
        } catch (err) {
            setAlert('error', 'Failed to fetch saved evaluations');
        } finally {
            setLoading(false);
        }
    };

    const formatDateWithoutTimezone = (date: Date | null) => {
        if (!date) return null;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const handleSave = async () => {
        if (!selectedYear || selectedMonths.length === 0) {
            setAlert('warn', 'Please fill in required fields');
            return;
        }
        let payload
        if (editingEvaluation) {
            payload = {
                combinationId: editingEvaluation?.combinationId,
                year: parseInt(selectedYear),
                months: selectedMonths,
                timeFrame: selectedTimeframes,
                reviewTypeIds: selectedReviewTypes,
                countryIds: selectedCountries,
                regionId: selectedRegion,
                startDate: formatDateWithoutTimezone(startDate),
                endDate: formatDateWithoutTimezone(endDate),
                implementDate: formatDateWithoutTimezone(implementDate)
            };
        } else {
            payload = {
                year: parseInt(selectedYear),
                months: selectedMonths,
                timeFrame: selectedTimeframes,
                reviewTypes: selectedReviewTypes,
                countries: selectedCountries,
                regionId: selectedRegion,
                startDate: formatDateWithoutTimezone(startDate),
                endDate: formatDateWithoutTimezone(endDate),
                implementDate: formatDateWithoutTimezone(implementDate)
            };
        }
        try {
            setLoading(true);
            let response;
            if (editingEvaluation) {
                response = await PutCall(`/mrkt/api/mrkt/evaluation-combination-update`, payload);
            } else {
                response = await PostCall('/mrkt/api/mrkt/evaluation-combination', payload);
            }
            if (response.code === 'SUCCESS') {
                setAlert('success', `Evaluation ${editingEvaluation ? 'updated' : 'saved'} successfully`);
                fetchSavedEvaluations();
                resetForm();
                setVisible(false);
            } else {
                setAlert('error', response.message);
            }
        } catch (error) {
            setAlert('error', 'Failed to update evaluation');
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedYear(null);
        setSelectedMonths([]);
        setSelectedTimeframes([]);
        setSelectedReviewTypes([]);
        setSelectedCountries([]);
        setSelectedRegion([]);
        setStartDate(null);
        setEndDate(null);
        setImplementDate(null);
        setEditingEvaluation(null);
    };

    const confirmDelete = (id: number) => {
        setItemToDelete(id);
        setDeleteDialogVisible(true);
    };

    const handleDelete = async () => {
        if (!itemToDelete) return;
        
        try {
            setLoading(true);
            const response = await DeleteCall(`/mrkt/api/mrkt/evaluation-combination-delete`, { 
                combinationId: itemToDelete 
            });
            
            if (response.code === 'SUCCESS') {
                setAlert('success', 'Evaluation deleted successfully');
                fetchSavedEvaluations();
            } else {
                setAlert('error', response.message);
            }
        } catch (error) {
            setAlert('error', 'Failed to delete evaluation');
        } finally {
            setLoading(false);
            setDeleteDialogVisible(false);
            setItemToDelete(null);
        }
    };

    const parseDateWithoutTimezone = (dateString: string) => {
        if (!dateString) return null;
        const [year, month, day] = dateString.split('-').map(Number);
        return new Date(year, month - 1, day);
    };

    const handleEdit = (rowData: any) => {
        setEditingEvaluation(rowData);
        setSelectedYear(rowData.year?.toString());
        const monthNumber = monthOptions.find(m => 
            m.label.toUpperCase() === rowData.monthName?.toUpperCase()
        )?.value;
        setSelectedMonths(monthNumber ? [monthNumber] : []);
        setSelectedTimeframes(rowData.timeFrame ? [rowData.timeFrame] : []);
        setSelectedReviewTypes(rowData.reviewTypeId ? [rowData.reviewTypeId] : []);
        setSelectedCountries(rowData.countryId ? [rowData.countryId] : []);
        setSelectedRegion(rowData.regionId || null);
        setStartDate(rowData.startDate ? parseDateWithoutTimezone(rowData.startDate) : null);
        setEndDate(rowData.endDate ? parseDateWithoutTimezone(rowData.endDate) : null);
        setImplementDate(rowData.implementDate ? parseDateWithoutTimezone(rowData.implementDate) : null);
        setVisible(true);
    };

    const openNew = () => {
        resetForm();
        setVisible(true);
    };

    if (!isClient) return null;

    const formDialogFooter = (
    <div className="flex justify-content-end h-3rem">
        <Button
            label="Cancel"
            className="custom-cancel-button h-2rem mt-2 mr-2"
            onClick={() => setVisible(false)}
        />
        <Button
            label="Save"
            onClick={handleSave}
            className="mt-2 h-2rem"
        />
    </div>
);
    return (
        // <div className="p-4 h-full">
            
            <div className="flex flex-column h-full">

                {/* Main Content */}
                <div className="card">
                    <Toast ref={toast} />
                    {/* Header */}
                <div className="flex justify-content-between align-items-center mb-4">
                    <h2 className="text-2xl font-bold m-0">Evaluation Name</h2>
                    <Button 
                        label="Evaluation Name" 
                        icon="pi pi-plus" 
                        onClick={openNew}
                        className="p-button-primary"
                    />
                </div>
                <hr className="my-4" /> 
                    {savedData.length > 0 ? (
                        <div className="flex flex-column h-full">
                            <div className="flex justify-content-between align-items-center mb-4">
                                {/* <h3 className="text-lg font-medium m-0">Saved Evaluations</h3> */}
                                <span className="p-input-icon-left">
                                    <i className="pi pi-search" />
                                    <InputText
                                        type="text"
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        placeholder="Search..."
                                        className="w-64"
                                    />
                                </span>
                            </div>
                                <DataTable 
                                                        value={savedData} 
                                                        paginator 
                                                        rows={10} 
                                                        totalRecords={totalRecords}
                                                        emptyMessage="No Evaluation found"
                                                    >
                                                        <Column 
                                                            header="Actions" 
                                                            body={(rowData) => (
                                                                <div className="flex gap-2">
                                                                    <Button 
                                                                        icon="pi pi-pencil" 
                                                                        className="p-button-rounded p-button-text p-button-plain" 
                                                                        onClick={() => handleEdit(rowData)}
                                                                    />
                                                                    <Button 
                                                                        icon="pi pi-trash" 
                                                                        className="p-button-rounded p-button-text p-button-danger" 
                                                                        onClick={() => confirmDelete(rowData.combinationId)}
                                                                    />
                                                                </div>
                                                            )}
                                                        />
                                                        <Column field="label" header="Evaluation Name" filter filterPlaceholder="Search by name"/>
                                                        <Column field="startDate" header="Start Date" filter filterPlaceholder="Search by name"/>
                                                        <Column field="endDate" header="End Date" filter filterPlaceholder="Search by name"/>
                                                        <Column field="implementDate" header="Implement Date" filter filterPlaceholder="Search by name"/>
                                                    </DataTable>
                            {/* </div> */}
                        </div>
                    ) : (
                        <div className="flex flex-column align-items-center justify-content-center h-full">
                            <p className="text-xl text-500">No saved evaluations found.</p>
                            <Button 
                                label="Create New Evaluation" 
                                icon="pi pi-plus" 
                                onClick={openNew}
                                className="mt-3"
                            />
                        </div>
                    )}
                </div>
            {/* </div> */}

            {/* Form Dialog */}
            <Dialog 
    visible={visible} 
    onHide={() => setVisible(false)}
    header={editingEvaluation ? "Edit Evaluation" : "New Evaluation"}
    footer={formDialogFooter}
    style={{ width: '50vw' }}
    breakpoints={{ '960px': '75vw', '641px': '90vw' }}
>
    {/* Add this style tag for consistent placeholder styling */}
    <style jsx global>{`
        .uniform-placeholders .p-dropdown .p-dropdown-label,
        .uniform-placeholders .p-multiselect .p-multiselect-label,
        .uniform-placeholders .p-calendar .p-inputtext::placeholder {
            font-size: 1rem !important;
            color: #6c757d !important;
        }
        .uniform-placeholders .p-inputtext::placeholder {
            font-size: 1rem !important;
        }
    `}</style>

    <div className="grid formgrid p-fluid uniform-placeholders">
        {/* Year Dropdown */}
        <div className="field col-12 md:col-4">
            <label htmlFor="year">Year</label>
            <Dropdown
                id="year"
                value={selectedYear}
                options={yearOptions}
                onChange={(e) => setSelectedYear(e.value)}
                className="w-full h-3rem"
                placeholder="Select Year"
                disabled={yearOptions.length === 0}
            />
        </div>
        
        {/* Months MultiSelect */}
        <div className="field col-12 md:col-4">
            <label htmlFor="months">Months</label>
            <MultiSelect 
                id="months"
                value={selectedMonths || []} 
                options={monthOptions} 
                onChange={(e) => setSelectedMonths(e.value || [])} 
                className="w-full " 
                placeholder="Select Months" 
            />
        </div>

        {/* Time Frame MultiSelect */}
        <div className="field col-12 md:col-4">
            <label htmlFor="timeframe">Time Frame</label>
            <MultiSelect
                id="timeframe"
                value={selectedTimeframes|| []}
                options={timeframeOptions}
                onChange={(e) => setSelectedTimeframes(e.value|| [])}
                className="w-full "
                placeholder="Select Time Frame"
                disabled
            />
        </div>

        {/* Review Types MultiSelect */}
        <div className="field col-12 md:col-4">
            <label htmlFor="reviewTypes">Review Types</label>
            <MultiSelect
                id="reviewTypes"
                value={selectedReviewTypes|| []}
                options={reviewTypes}
                onChange={(e) => setSelectedReviewTypes(e.value || [])}
                className="w-full"
                placeholder="Select Review Types"
                disabled={reviewTypes.length === 0}
            />
        </div>

        {/* Countries MultiSelect */}
        <div className="field col-12 md:col-4">
            <label htmlFor="countries">Countries</label>
            <MultiSelect
                id="countries"
                value={selectedCountries || []}
                options={countries}
                onChange={(e) => setSelectedCountries(e.value || [])}
                className="w-full"
                placeholder="Select Countries"
                disabled={countries.length === 0}
            />
        </div>

        {/* Region Dropdown */}
        <div className="field col-12 md:col-4">
            <label htmlFor="region">Region</label>
            <Dropdown
                id="region"
                value={selectedRegion}
                options={region}
                onChange={(e) => setSelectedRegion(e.value)}
                className="w-full h-3rem"
                placeholder="Select Region"
                disabled={region.length === 0}
            />
        </div>

        {/* Calendar Fields */}
        <div className="field col-12 md:col-4">
            <label htmlFor="startDate">Start Date</label>
            <Calendar
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.value as Date)}
                className="w-full "
                showIcon
                dateFormat="dd/mm/yy"
                placeholder="Select Start Date"
                inputClassName="w-full"
            />
        </div>

        <div className="field col-12 md:col-4">
            <label htmlFor="endDate">End Date</label>
            <Calendar
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.value as Date)}
                className="w-full "
                showIcon
                dateFormat="dd/mm/yy"
                placeholder="Select End Date"
                inputClassName="w-full"
            />
        </div>

        <div className="field col-12 md:col-4">
            <label htmlFor="implementDate">Implementation Date</label>
            <Calendar
                id="implementDate"
                value={implementDate}
                onChange={(e) => setImplementDate(e.value as Date)}
                className="w-full"
                showIcon
                dateFormat="dd/mm/yy"
                placeholder="Select Implementation Date"
                inputClassName="w-full"
            />
        </div>
    </div>
</Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog 
                visible={deleteDialogVisible} 
                onHide={() => setDeleteDialogVisible(false)}
                header="Confirm Deletion"
                style={{ width: '30vw' }}
                footer={
                    <div>
                        <Button label="No" icon="pi pi-times" onClick={() => setDeleteDialogVisible(false)} className="p-button-text" />
                        <Button label="Yes" icon="pi pi-check" onClick={handleDelete} className="p-button-danger" />
                    </div>
                }
            >
                <p>Are you sure you want to delete this evaluation?</p>
            </Dialog>
        </div>
    );
};

export default EvaluationPage;