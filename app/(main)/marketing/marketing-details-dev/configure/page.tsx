'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';
import { MultiSelect } from 'primereact/multiselect';
import { DataTableExpandedRows } from 'primereact/datatable';
import { Panel } from 'primereact/panel';
import { FilterMatchMode } from 'primereact/api';

const STORAGE_KEYS = {
    MARKETING_TEMPLATE_QUESTIONS: 'marketingTemplateQuestions',
    FINAL_REVIEW_DATA: 'finalReviewData'
};

interface Question {
    id: number;
    segment?: string;
    questionTitle: string;
    minRating: number;
    maxRating: number;
    isCompulsary?: { isCompulsary: boolean };
    // other fields...
}

const MarketingDetails = () => {
    const toast = useRef<Toast>(null);
    const [showDialog, setShowDialog] = useState(false);
    const [expandedRows, setExpandedRows] = useState<DataTableExpandedRows>({});

    // Dynamic options from localStorage
    const [evaluationOptions, setEvaluationOptions] = useState<{ label: string; value: string }[]>([]);
    const [vendorOptions, setVendorOptions] = useState<{ label: string; value: string }[]>([]);
    const [childVendorOptions, setChildVendorOptions] = useState<{ label: string; value: string }[]>([]);
    const [countryOptions, setCountryOptions] = useState<{ label: string; value: string }[]>([]);
    const [buOptions, setBuOptions] = useState<{ label: string; value: string }[]>([]);
    const [brandOptions, setBrandOptions] = useState<{ label: string; value: string }[]>([]);
    const [statusOptions] = useState([
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' }
    ]);
    const [templateTypeOptions, setTemplateTypeOptions] = useState<{ label: string; value: string }[]>([]);
    const [reviewTypeOptions, setReviewTypeOptions] = useState<{ label: string; value: string }[]>([]);

    // Form state
    const [selectedEval, setSelectedEval] = useState<string | null>(null);
    const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
    const [selectedChildVendor, setSelectedChildVendor] = useState<string | null>(null);
    const [administrator, setAdministrator] = useState<string>('');
    const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
    const [selectedBU, setSelectedBU] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
    const [selectedTemplateTypes, setSelectedTemplateTypes] = useState<string[]>([]);
    const [selectedReviewType, setSelectedReviewType] = useState<string | null>(null);

    // Questions and combos
    const [questions, setQuestions] = useState<any[]>([]);
    const [filteredQuestions, setFilteredQuestions] = useState<any[]>([]);
    const [selectedQuestions, setSelectedQuestions] = useState<any[]>([]);
    const [comboList, setComboList] = useState<any[]>([]);
    const [savedCombos, setSavedCombos] = useState<any[]>([]);

    const [editingCombo, setEditingCombo] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);

    const [questionsByTemplateType, setQuestionsByTemplateType] = useState<Record<string, any[]>>({});


    const [filters, setFilters] = useState<any>({
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        accountName: { value: null, matchMode: FilterMatchMode.CONTAINS },
        evaluation: { value: null, matchMode: FilterMatchMode.CONTAINS },
        vendor: { value: null, matchMode: FilterMatchMode.CONTAINS },
        country: { value: null, matchMode: FilterMatchMode.IN },
        brand: { value: null, matchMode: FilterMatchMode.IN },
        status: { value: null, matchMode: FilterMatchMode.IN }
    });

    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);

    useEffect(() => {
        // Flatten all questions from all template types
        const allQuestions = Object.values(questionsByTemplateType).flat();

        setSelectedQuestions(allQuestions);
    }, [questionsByTemplateType]);
    // Load all initial data from localStorage
    useEffect(() => {
        // Load evaluation data
        const evaluations = JSON.parse(localStorage.getItem('evaluationData') || '[]');

        setEvaluationOptions(
            evaluations.map((e: string) => ({
                label: e,
                value: e
            }))
        );

        // Load vendors and child vendors
        const vendorsData = JSON.parse(localStorage.getItem('vendors') || '[]');
        setVendorOptions(
            vendorsData.map((v: any) => ({
                label: v.name,
                value: v.name
            }))
        );

        // Load other options
        setCountryOptions(getStoredOptions('Country'));
        setBuOptions(getStoredOptions('BU'));
        setBrandOptions(getStoredOptions('Brand'));
        setReviewTypeOptions(getStoredOptions('Review Type'));

        // Load questions
        const savedQuestions = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKETING_TEMPLATE_QUESTIONS) || '[]');
        setQuestions(savedQuestions);

        // Load saved combos
        const savedCombos = JSON.parse(localStorage.getItem(STORAGE_KEYS.FINAL_REVIEW_DATA) || '[]');

        setComboList(savedCombos);
    }, []);

    // helper function to get options from localStorage
    const getStoredOptions = (key: string) => {
        const data = localStorage.getItem(key);
        if (!data) return [];
        try {
            return JSON.parse(data).map((item: string) => ({
                label: item,
                value: item
            }));
        } catch {
            return [];
        }
    };

    // Update child vendors when vendor changes
    useEffect(() => {
        if (!selectedVendor) {
            setChildVendorOptions([]);
            return;
        }

        const vendorsData = JSON.parse(localStorage.getItem('vendors') || '[]');
        const selectedVendorData = vendorsData.find((v: any) => v.name === selectedVendor);

        if (selectedVendorData?.children) {
            setChildVendorOptions(
                selectedVendorData.children.map((child: any) => ({
                    label: child.name,
                    value: child.name
                }))
            );
        } else {
            setChildVendorOptions([]);
        }
        setSelectedChildVendor(null);
    }, [selectedVendor]);

    // Update template types when evaluation name changes
    useEffect(() => {
        if (!selectedEval) {
            handleViewSaved();
            setSelectedReviewType(null);
            setTemplateTypeOptions([]);
            setSelectedTemplateTypes([]);
            return;
        }

        // Extract review type from evaluation name (format: "2025-2-H1, Creative-India")
        const reviewType = selectedEval.split(', ')[1]?.split('-')[0];
        setSelectedReviewType(reviewType);

        // Get template types for this review type
        const templateTypesData = JSON.parse(localStorage.getItem('Template Type') || '{}');
        const templatesForReviewType = templateTypesData[reviewType] || [];

        setTemplateTypeOptions(
            templatesForReviewType.map((t: string) => ({
                label: t,
                value: t
            }))
        );

        // Select all template types by default
        setSelectedTemplateTypes(templatesForReviewType);
    }, [selectedEval]);

    // Filter questions based on selected template types
    useEffect(() => {
        if (selectedTemplateTypes.length === 0) {
            setFilteredQuestions([]);
            return;
        }

        const filtered = questions.filter((q) => selectedTemplateTypes.includes(q.templateType?.templateTypeName));
        setFilteredQuestions(filtered);
    }, [selectedTemplateTypes, questions]);

    const handleQuestionToggle = (question: any) => {
        const updated = selectedQuestions.some((q) => q.id === question.id) ? selectedQuestions.filter((q) => q.id !== question.id) : [...selectedQuestions, question];

        setSelectedQuestions(updated);
    };

    const handleSegmentToggle = (templateType: string, segment: string) => {
        const segmentQuestions = questionsByTemplateType[templateType].filter((q) => q.segment === segment);
        const allSelected = segmentQuestions.every((q) => selectedQuestions.some((sq) => sq.id === q.id));

        const updated = allSelected
            ? selectedQuestions.filter((q) => !(q.templateType?.templateTypeName === templateType && q.segment === segment))
            : [...selectedQuestions, ...segmentQuestions.filter((q) => !selectedQuestions.some((sq) => sq.id === q.id))];

        setSelectedQuestions(updated);
    };
    const handleTemplateTypeToggle = (templateType: string) => {
        const templateQuestions = questionsByTemplateType[templateType] || [];
        const allSelected = templateQuestions.every((q) => selectedQuestions.some((sq) => sq.id === q.id));

        const updated = allSelected ? selectedQuestions.filter((q) => q.templateType?.templateTypeName !== templateType) : [...selectedQuestions, ...templateQuestions.filter((q) => !selectedQuestions.some((sq) => sq.id === q.id))];

        setSelectedQuestions(updated);
    };

    const handleSelectAllQuestions = () => {
        const allQuestions = Object.values(questionsByTemplateType).flat();

        if (selectedQuestions.length === allQuestions.length) {
            // If all are selected, deselect all
            setSelectedQuestions([]);
        } else {
            // Otherwise, select all questions
            setSelectedQuestions(allQuestions);
        }
    };
    const handleFinalSave = () => {
        if (!selectedEval || !selectedVendor || !administrator || !selectedCountry || !selectedBU || !selectedStatus || !selectedBrand || !selectedTemplateTypes.length) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Missing!',
                detail: 'Please fill out all required fields',
                life: 3000
            });
            return;
        }

        if (selectedQuestions.length === 0) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Missing!',
                detail: 'Please select at least one question',
                life: 3000
            });
            return;
        }

        // Create account name (e.g., "Creative-India-Finish")
        const [yearMonth, reviewCountry] = selectedEval.split(', ');
        const country = reviewCountry.split('-')[1];
        const newCombo = {
            accountName: `${selectedReviewType}-${country}-${selectedBrand}`,
            evaluation: selectedEval,
            vendor: selectedVendor,
            childVendor: selectedChildVendor,
            administrator,
            country: selectedCountry,
            bu: selectedBU,
            status: selectedStatus,
            brand: selectedBrand,
            reviewType: selectedReviewType,
            templateTypes: selectedTemplateTypes,
            questions: selectedQuestions
        };

        const updatedCombos = [...comboList, newCombo];
        setComboList(updatedCombos);
        localStorage.setItem(STORAGE_KEYS.FINAL_REVIEW_DATA, JSON.stringify(updatedCombos));

        toast.current?.show({
            severity: 'success',
            summary: 'Success!',
            detail: 'Final review saved successfully',
            life: 3000
        });

        // Reset form (except vendor and administrator)
        setSelectedEval(null);
        setSelectedCountry(null);
        setSelectedBU(null);
        setSelectedStatus(null);
        setSelectedBrand(null);
        setSelectedTemplateTypes([]);
        setSelectedQuestions([]);
    };

    // const handleViewSaved = () => {
    //     setSavedCombos(comboList);
    //     setShowDialog(true);
    // };

    const handleViewSaved = () => {
        try {
            const savedData = localStorage.getItem(STORAGE_KEYS.FINAL_REVIEW_DATA);

            const parsedData = savedData ? JSON.parse(savedData) : [];
            setSavedCombos(Array.isArray(parsedData) ? parsedData : []);
            // Reset expanded rows state completely
            // setExpandedRows(null);
            // setShowDialog(true);
        } catch (error) {
            console.error('Error loading saved reviews:', error);
            toast.current?.show({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load saved reviews',
                life: 3000
            });
            setSavedCombos([]);
            // setShowDialog(true);
        }
    };
    const rowExpansionTemplate = (data: any) => {
        return (
            <div className="p-4">
                <h5 className="font-bold mb-2">Mapped Questions:</h5>
                {data.questions?.length > 0 ? (
                    <DataTable value={data.questions} paginator rows={10}>
                        <Column field="segment" header="Segment" />
                        <Column field="questionTitle" header="Question Title" />
                        <Column field="questionDescription" header="Description" />
                        <Column field="templateType.templateTypeName" header="Template Type" />
                        <Column field="reviewType.reviewTypeName" header="Review Type" />
                        <Column field="minRating" header="Min Rating" />
                        <Column field="maxRating" header="Max Rating" />
                        <Column field="isCompulsary.isCompulsary" header="Is Compulsory" />
                        <Column field="ratio" header="Ratio" />
                    </DataTable>
                ) : (
                    <p>No questions mapped.</p>
                )}
            </div>
        );
    };

    // Group questions by segment for display
    const groupedQuestions: any[] = [];
    const sortedQuestions = [...filteredQuestions].sort((a, b) => (a.segment || '').localeCompare(b.segment || ''));

    let lastSegment: string | null = null;
    sortedQuestions.forEach((q) => {
        if (q.segment !== lastSegment) {
            groupedQuestions.push({ isGroupHeader: true, segment: q.segment });
            lastSegment = q.segment;
        }
        groupedQuestions.push(q);
    });

    // Filter questions based on both review type and template types
    useEffect(() => {
        if (!selectedReviewType || !selectedTemplateTypes.length) {
            setQuestionsByTemplateType({});
            return;
        }

        const filtered: Record<string, any[]> = {};

        // Get questions from localStorage
        const allQuestions = JSON.parse(localStorage.getItem(STORAGE_KEYS.MARKETING_TEMPLATE_QUESTIONS) || '[]');

        selectedTemplateTypes.forEach((templateType) => {
            filtered[templateType] = allQuestions.filter((q: any) => q.reviewType?.reviewTypeName === selectedReviewType && q.templateType?.templateTypeName === templateType);
        });

        setQuestionsByTemplateType(filtered);
    }, [selectedReviewType, selectedTemplateTypes]);

    const renderQuestionsTables = () => {
        return Object.entries(questionsByTemplateType).map(([templateType, questions]) => {
            if (questions.length === 0) return null;

            // Group questions by segment
            const questionsBySegment: Record<string, Question[]> = {};

            questions.forEach((q) => {
                const segment = q.segment || 'Uncategorized';
                if (!questionsBySegment[segment]) {
                    questionsBySegment[segment] = [];
                }
                questionsBySegment[segment].push(q);
            });

            // Check if all questions in this template type are selected
            const allTemplateQuestionsSelected = questions.every((q) => selectedQuestions.some((sq) => sq.id === q.id));

            return (
                <Panel
                    header={
                        <div className="flex align-items-center">
                            <div className="mr-2">
                                <input type="checkbox" checked={allTemplateQuestionsSelected} onChange={() => handleTemplateTypeToggle(templateType)} />
                            </div>
                            <span>
                                {templateType} Questions ({questions.length})
                            </span>
                        </div>
                    }
                    toggleable
                    key={templateType}
                    className="mb-4"
                >
                    {Object.entries(questionsBySegment).map(([segment, segmentQuestions]) => (
                        <div key={`${templateType}-${segment}`} className="mb-3">
                            <div className="flex align-items-center p-2 bg-gray-100">
                                <div className="mr-2">
                                    <input type="checkbox" checked={segmentQuestions.every((q) => selectedQuestions.some((sq) => sq.id === q.id))} onChange={() => handleSegmentToggle(templateType, segment)} />
                                </div>
                                <h5 className="m-0 font-bold">
                                    {segment} ({segmentQuestions.length})
                                </h5>
                            </div>

                            <table className="w-full border border-gray-300 text-sm mt-2">
                                <thead className="bg-gray-100">
                                    <tr>
                                        {/* Remove checkbox from header */}
                                        <th className="border px-2 py-1 text-left "></th>
                                        <th className="border px-2 py-1 text-left">#</th>
                                        <th className="border px-2 py-1 text-left">Title</th>
                                        <th className="border px-2 py-1 text-left">Min Rating</th>
                                        <th className="border px-2 py-1 text-left">Max Rating</th>
                                        <th className="border px-2 py-1 text-left">Compulsory</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {segmentQuestions.map((question, index) => (
                                        <tr key={question.id}>
                                            <td className="border px-2 py-1">
                                                <input type="checkbox" checked={selectedQuestions.some((q) => q.id === question.id)} onChange={() => handleQuestionToggle(question)} />
                                            </td>
                                            <td className="border px-2 py-1">{index + 1}</td>
                                            <td className="border px-2 py-1">{question.questionTitle}</td>
                                            <td className="border px-2 py-1">{question.minRating}</td>
                                            <td className="border px-2 py-1">{question.maxRating}</td>
                                            <td className="border px-2 py-1">{question.isCompulsary?.isCompulsary ? 'Yes' : 'No'}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                </Panel>
            );
        });
    };

    const onGlobalFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };
        _filters['global'].value = value;
        setFilters(_filters);
    };

    const onCountryFilterChange = (e: { value: string[] }) => {
        const value = e.value;
        let _filters = { ...filters };
        _filters['country'].value = value.length ? value : null;
        setSelectedCountries(value);
        setFilters(_filters);
    };

    const onBrandFilterChange = (e: { value: string[] }) => {
        const value = e.value;
        let _filters = { ...filters };
        _filters['brand'].value = value.length ? value : null;
        setSelectedBrands(value);
        setFilters(_filters);
    };

    const onStatusFilterChange = (e: { value: string[] }) => {
        const value = e.value;
        let _filters = { ...filters };
        _filters['status'].value = value.length ? value : null;
        setSelectedStatuses(value);
        setFilters(_filters);
    };

    const handleEdit = (combo: any) => {
        setEditingCombo(combo);
        setSelectedEval(combo.evaluation);
        setSelectedVendor(combo.vendor);
        setSelectedChildVendor(combo.childVendor);
        setAdministrator(combo.administrator);
        setSelectedCountry(combo.country);
        setSelectedBU(combo.bu);
        setSelectedStatus(combo.status);
        setSelectedBrand(combo.brand);
        setSelectedReviewType(combo.reviewType);
        setSelectedTemplateTypes(combo.templateTypes);
        setSelectedQuestions(combo.questions);
        setIsEditing(true);

        // Scroll to form
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };


    const handleDelete = (accountName: string) => {
        const updatedCombos = comboList.filter(combo => combo.accountName !== accountName);
        setComboList(updatedCombos);
        setSavedCombos(updatedCombos);
        localStorage.setItem(STORAGE_KEYS.FINAL_REVIEW_DATA, JSON.stringify(updatedCombos));

        toast.current?.show({
            severity: 'success',
            summary: 'Success!',
            detail: 'Review deleted successfully',
            life: 3000
        });
    };

    const handleUpdate = () => {
        if (!editingCombo) return;

        const updatedCombo = {
            ...editingCombo,
            evaluation: selectedEval,
            vendor: selectedVendor,
            childVendor: selectedChildVendor,
            administrator,
            country: selectedCountry,
            bu: selectedBU,
            status: selectedStatus,
            brand: selectedBrand,
            reviewType: selectedReviewType,
            templateTypes: selectedTemplateTypes,
            questions: selectedQuestions
        };

        const updatedCombos = comboList.map(combo =>
            combo.accountName === editingCombo.accountName ? updatedCombo : combo
        );

        setComboList(updatedCombos);
        setSavedCombos(updatedCombos);
        localStorage.setItem(STORAGE_KEYS.FINAL_REVIEW_DATA, JSON.stringify(updatedCombos));
        setIsEditing(false);
        setEditingCombo(null);

        toast.current?.show({
            severity: 'success',
            summary: 'Success!',
            detail: 'Review updated successfully',
            life: 3000
        });
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditingCombo(null);
        // Reset form fields if needed
    };


    const renderHeader = () => {
        return (
            <div className="flex flex-column md:flex-row  md:justify-content-end md:align-items-center gap-2">
                <div className="flex flex-column md:flex-row gap-2">

                    <MultiSelect
                        value={selectedCountries}
                        options={countryOptions}
                        onChange={onCountryFilterChange}
                        placeholder="Filter by Country"
                        maxSelectedLabels={3}
                        className="w-full md:w-20rem"
                        showClear
                    />
                    <MultiSelect
                        value={selectedBrands}
                        options={brandOptions}
                        onChange={onBrandFilterChange}
                        placeholder="Filter by Brand"
                        maxSelectedLabels={3}
                        className="w-full md:w-20rem"
                        showClear
                    />
                    <MultiSelect
                        value={selectedStatuses}
                        options={statusOptions}
                        onChange={onStatusFilterChange}
                        placeholder="Filter by Status"
                        maxSelectedLabels={3}
                        className="w-full md:w-20rem"
                        showClear
                    />
                </div>
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText
                        type="search"
                        onChange={onGlobalFilterChange}
                        placeholder="Global Search"
                        className="w-full"
                    />
                </span>
            </div>
        );
    };

    const header = renderHeader();

    return (
        <div className="p-4 card">
            <Toast ref={toast} />

            <div className="flex justify-content-between items-center mb-4">
                <h2 className="text-xl font-semibold">Final Review Configuration</h2>
                {/* <Button label="View Saved Reviews" icon="pi pi-eye" onClick={handleViewSaved} className="" /> */}
            </div>

            <div className="grid formgrid gap-3 mb-4">
                <div className="flex row col-12">
                    <div className="col-4">
                        <label>Evaluation Name</label>
                        <Dropdown value={selectedEval} options={evaluationOptions} onChange={(e) => setSelectedEval(e.value)} placeholder="Select Evaluation" className="w-full mt-2" filter />
                    </div>
                    <div className="col-4">
                        <label>Vendor</label>
                        <Dropdown value={selectedVendor} options={vendorOptions} onChange={(e) => setSelectedVendor(e.value)} placeholder="Select Vendor" className="w-full mt-2" filter />
                    </div>
                    <div className="col-4">
                        <label>Child Vendor (Optional)</label>
                        <Dropdown
                            value={selectedChildVendor}
                            options={childVendorOptions}
                            onChange={(e) => setSelectedChildVendor(e.value)}
                            placeholder="Select Child Vendor"
                            className="w-full mt-2"
                            disabled={!selectedVendor || childVendorOptions.length === 0}
                            filter
                        />
                    </div>
                </div>

                <div className="flex row col-12">
                    <div className="col-4">
                        <label>Administrator</label>
                        <InputText value={administrator} onChange={(e) => setAdministrator(e.target.value)} placeholder="Enter Administrator" className="w-full mt-2" />
                    </div>
                    <div className="col-4">
                        <label>Country</label>
                        <Dropdown value={selectedCountry} options={countryOptions} onChange={(e) => setSelectedCountry(e.value)} placeholder="Select Country" className="w-full mt-2" filter />
                    </div>
                    <div className="col-4">
                        <label>BU</label>
                        <Dropdown value={selectedBU} options={buOptions} onChange={(e) => setSelectedBU(e.value)} placeholder="Select BU" className="w-full mt-2" filter />
                    </div>
                </div>

                <div className="flex row col-12">
                    <div className="col-4">
                        <label>Brand</label>
                        <Dropdown value={selectedBrand} options={brandOptions} onChange={(e) => setSelectedBrand(e.value)} placeholder="Select Brand" className="w-full mt-2" filter />
                    </div>
                    <div className="col-4">
                        <label>Status</label>
                        <Dropdown value={selectedStatus} options={statusOptions} onChange={(e) => setSelectedStatus(e.value)} placeholder="Select Status" className="w-full mt-2" />
                    </div>
                    {/* <div className="col-4">
                        <label>Review Type</label>
                        <InputText value={selectedReviewType || ''} readOnly className="w-full mt-2" />
                    </div> */}
                </div>

                {selectedReviewType && (
                    <div className="flex row col-12">
                        <div className="col-12">
                            <label>Template Types</label>
                            <MultiSelect value={selectedTemplateTypes} options={templateTypeOptions} onChange={(e) => setSelectedTemplateTypes(e.value)} placeholder="Select Template Types" className="w-full mt-2" display="chip" />
                        </div>
                    </div>
                )}
            </div>

            {selectedReviewType && selectedTemplateTypes.length > 0 && (
                <div className="mt-4">
                    <h3>Available Questions</h3>
                    <p className="mb-3">
                        Showing questions for <strong>{selectedReviewType}</strong> review type and selected template types
                    </p>

                    {Object.keys(questionsByTemplateType).length > 0 ? renderQuestionsTables() : <p>No questions found for the selected criteria.</p>}

                    <Button
                        label={isEditing ? "Update Review" : "Save Final Review"}
                        icon={isEditing ? "pi pi-check" : "pi pi-save"}
                        className="mt-4"
                        onClick={isEditing ? handleUpdate : handleFinalSave}
                        disabled={selectedQuestions.length === 0}
                    />
                    {isEditing && (
                        <Button
                            label="Cancel"
                            icon="pi pi-times"
                            className="mt-4 ml-2"
                            onClick={handleCancelEdit}
                        />
                        
                    )}
                    {/* <Button label="Save Final Review" icon="pi pi-save" className="mt-4" onClick={handleFinalSave} disabled={selectedQuestions.length === 0} /> */}
                </div>
            )}
            <hr className="my-4" />
            {savedCombos.length > 0 ? (
                <DataTable
                    value={savedCombos}
                    expandedRows={expandedRows}
                    onRowToggle={(e: any) => setExpandedRows(e.data)}
                    rowExpansionTemplate={rowExpansionTemplate}
                    paginator
                    dataKey="accountName"
                    rows={10}
                    filters={filters}
                    filterDisplay="menu"
                    globalFilterFields={['accountName', 'evaluation', 'vendor', 'country', 'brand', 'status']}
                    header={header}
                    emptyMessage="No reviews found matching criteria"
                >
                    <Column
                        header="Actions"
                        body={(rowData) => (
                            <div className="flex gap-2">
                                <Button
                                    icon="pi pi-pencil"
                                    className="p-button-rounded p-button-success p-button-text"
                                    onClick={() => handleEdit(rowData)}
                                    tooltip="Edit"
                                    tooltipOptions={{ position: 'top' }}
                                />
                                <Button
                                    icon="pi pi-trash"
                                    className="p-button-rounded p-button-danger p-button-text"
                                    onClick={() => handleDelete(rowData.accountName)}
                                    tooltip="Delete"
                                    tooltipOptions={{ position: 'top' }}
                                />
                            </div>
                        )}
                        style={{ width: '8rem' }}
                    />
                    <Column expander style={{ width: '3em' }} />
                    <Column header="#" body={(_, { rowIndex }) => rowIndex + 1} />
                    <Column field="accountName" header="Account Name" sortable filter filterField="accountName" />
                    <Column field="evaluation" header="Evaluation" sortable filter filterField="evaluation" />
                    <Column field="vendor" header="Vendor" sortable filter filterField="vendor" />
                    <Column
                        field="country"
                        header="Country"
                        sortable
                        filter
                        filterField="country"
                        filterElement={(options) => (
                            <MultiSelect
                                value={options.value}
                                options={countryOptions}
                                onChange={(e) => options.filterCallback(e.value)}
                                placeholder="Any"
                                className="p-column-filter"
                            />
                        )}
                    />
                    <Column
                        field="brand"
                        header="Brand"
                        sortable
                        filter
                        filterField="brand"
                        filterElement={(options) => (
                            <MultiSelect
                                value={options.value}
                                options={brandOptions}
                                onChange={(e) => options.filterCallback(e.value)}
                                placeholder="Any"
                                className="p-column-filter"
                            />
                        )}
                    />
                    <Column
                        field="status"
                        header="Status"
                        sortable
                        filter
                        filterField="status"
                        filterElement={(options) => (
                            <MultiSelect
                                value={options.value}
                                options={statusOptions}
                                onChange={(e) => options.filterCallback(e.value)}
                                placeholder="Any"
                                className="p-column-filter"
                            />
                        )}
                    />
                </DataTable>
            ) : (
                <p>No saved reviews found.</p>
            )}
        </div>
    );
};

export default MarketingDetails;
