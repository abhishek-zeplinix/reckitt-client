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

const EvaluationPage = () => {
    const toast = useRef<Toast>(null);
    const [savedData, setSavedData] = useState<{ id: number; name: string }[]>([]);
    const [isClient, setIsClient] = useState(false);

    // State for dropdown options
    const [yearOptions, setYearOptions] = useState<{ label: string; value: string }[]>([]);
    const [monthOptions, setMonthOptions] = useState<{ label: string; value: number }[]>([]);
    const [timeframeOptions, setTimeframeOptions] = useState<{ label: string; value: string }[]>([]);
    const [reviewTypes, setReviewTypes] = useState<{ label: string; value: string }[]>([]);
    const [countries, setCountries] = useState<{ label: string; value: string }[]>([]);

    // Form state
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [selectedMonths, setSelectedMonths] = useState<number[]>([]);
    const [selectedTimeframes, setSelectedTimeframes] = useState<string[]>([]);
    const [selectedReviewTypes, setSelectedReviewTypes] = useState<string[]>([]);
    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [combinations, setCombinations] = useState<string[]>([]);

    // New state for edit/delete/search
    const [editableCombinations, setEditableCombinations] = useState<{ id: number; name: string }[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editId, setEditId] = useState<number | null>(null);

    useEffect(() => {
        setIsClient(true);
        handleViewSaved();

        const storedYears = JSON.parse(localStorage.getItem('Year') || '[]');
        setYearOptions(storedYears.map((year: string) => ({ label: year, value: year })));

        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        setMonthOptions(months.map((m, index) => ({ label: m, value: index + 1 })));

        const timeframes = JSON.parse(localStorage.getItem('Evaluation Period') || '[]');
        setTimeframeOptions(timeframes.map((t: string) => ({ label: t, value: t })));

        const storedReviewTypes = JSON.parse(localStorage.getItem('Review Type') || '[]');
        setReviewTypes(storedReviewTypes.map((r: string) => ({ label: r, value: r })));

        const storedCountries = JSON.parse(localStorage.getItem('Country') || '[]');
        setCountries(storedCountries.map((c: string) => ({ label: c, value: c })));
    }, []);

    useEffect(() => {
        if (selectedMonths.length === 0) {
            setSelectedTimeframes([]);
            return;
        }

        const hasH1 = selectedMonths.some((m) => m <= 6);
        const hasH2 = selectedMonths.some((m) => m > 6);

        const newTimeframes = [];
        if (hasH1) newTimeframes.push('H1');
        if (hasH2) newTimeframes.push('H2');

        setSelectedTimeframes(newTimeframes);
    }, [selectedMonths]);

    const handleSubmit = () => {
        if (!selectedYear || !selectedMonths.length || !selectedTimeframes.length || !selectedReviewTypes.length || !selectedCountries.length) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Hold up!',
                detail: 'Please select all the fields',
                life: 3000
            });
            return;
        }

        const newCombos: string[] = [];

        selectedMonths.forEach((month) => {
            selectedTimeframes.forEach((timeframe) => {
                if ((timeframe === 'H1' && month <= 6) || (timeframe === 'H2' && month > 6)) {
                    selectedReviewTypes.forEach((review) => {
                        selectedCountries.forEach((country) => {
                            newCombos.push(`${selectedYear}-${month}-${timeframe}, ${review}-${country}`);
                        });
                    });
                }
            });
        });

        setCombinations((prev) => {
            const updated = [...prev, ...newCombos];
            setEditableCombinations(updated.map((val, idx) => ({ id: idx + 1, name: val })));
            return updated;
        });
    };

    // const handleSave = () => {
    //     const existingEvaluations = JSON.parse(localStorage.getItem('evaluationData') || '[]');
    //     const updatedEvaluations = [...existingEvaluations, ...combinations];
    //     localStorage.setItem('evaluationData', JSON.stringify(updatedEvaluations));

    //     toast.current?.show({
    //         severity: 'success',
    //         summary: 'Success',
    //         detail: 'Saved successfully ✅',
    //         life: 3000
    //     });

    //     setCombinations([]);
    //     setEditableCombinations([]);
    // };

    const handleSave = () => {
        const existingEvaluations = JSON.parse(localStorage.getItem('evaluationData') || '[]');
        const newEvaluations = [...existingEvaluations, ...combinations];
        localStorage.setItem('evaluationData', JSON.stringify(newEvaluations));

        // Update savedData state with the new entries
        const newSavedItems = combinations.map((val, idx) => ({
            id: existingEvaluations.length + idx + 1,
            name: val
        }));
        setSavedData(prev => [...prev, ...newSavedItems]);

        toast.current?.show({
            severity: 'success',
            summary: 'Success',
            detail: 'Saved successfully ✅',
            life: 3000
        });

        setCombinations([]);
        setEditableCombinations([]);
    };

    // const handleViewSaved = () => {
    //     const data = JSON.parse(localStorage.getItem('evaluationData') || '[]');
    //     setSavedData(data);
    // };

    const handleViewSaved = () => {
        const data = JSON.parse(localStorage.getItem('evaluationData') || '[]');
        setSavedData(data.map((val: string, idx: number) => ({ id: idx + 1, name: val })));
    };

    const handleDeleteSaved = (id: number) => {
        const updated = savedData.filter(item => item.id !== id);
        localStorage.setItem('evaluationData', JSON.stringify(updated.map(item => item.name)));
        setSavedData(updated);
    };

    const handleEditSaved = (id: number, value: string) => {
        const updated = savedData.map(item =>
            item.id === id ? { ...item, name: value } : item
        );
        localStorage.setItem('evaluationData', JSON.stringify(updated.map(item => item.name)));
        setSavedData(updated);
    };


    const handleDelete = (id: number) => {
        const updated = editableCombinations.filter((item) => item.id !== id);
        setEditableCombinations(updated);
        setCombinations(updated.map((item) => item.name));
    };

    const handleEdit = (id: number, value: string) => {
        const updated = editableCombinations.map((item) => (item.id === id ? { ...item, name: value } : item));
        setEditableCombinations(updated);
        setCombinations(updated.map((item) => item.name));
    };

    if (!isClient) return null;

    return (
        <div className="p-4 card">
            <Toast ref={toast} />

            {/* <Dialog header="Saved Evaluations" visible={showDialog} style={{ width: '50vw' }} onHide={() => setShowDialog(false)}>
                {savedData.length > 0 ? (
                    <DataTable value={savedData.map((val, i) => ({ id: i + 1, name: val }))}>
                        <Column field="id" header="#" style={{ width: '50px' }} />
                        <Column field="name" header="Evaluation Name" />
                    </DataTable>
                ) : (
                    <p>No saved evaluations found.</p>
                )}
            </Dialog> */}

            <div className="flex justify-content-between mb-3">
                <h2 className="text-xl font-semibold">Evaluation Name</h2>
                {/* <Button label="View Saved Evaluations" icon="pi pi-eye" onClick={handleViewSaved} /> */}
            </div>
            <hr className="my-3" />

            <div className="grid formgrid gap-3 mb-4">
                <div className="flex row col-12">
                    <div className="md:col-4">
                        <label>Year</label>
                        <Dropdown
                            value={selectedYear}
                            options={yearOptions}
                            onChange={(e) => setSelectedYear(e.value)}
                            className="w-full mt-2 p-1 text-lg"
                            placeholder={yearOptions.length ? 'Select Year' : 'No years available'}
                            disabled={yearOptions.length === 0}
                        />
                    </div>
                    <div className="md:col-4">
                        <label>Months</label>
                        <MultiSelect value={selectedMonths} options={monthOptions} onChange={(e) => setSelectedMonths(e.value)} className="w-full mt-2 h-12" placeholder="Select Months" />
                    </div>
                    <div className="md:col-4">
                        <label>Time Frame</label>
                        <MultiSelect
                            value={selectedTimeframes}
                            options={timeframeOptions}
                            onChange={(e) => setSelectedTimeframes(e.value)}
                            className="w-full mt-2"
                            placeholder={timeframeOptions.length ? 'Select Time Frame' : 'No time Frames available'}
                            disabled={selectedMonths.length > 0 || timeframeOptions.length === 0}
                        />
                    </div>
                </div>

                <div className="flex row col-12">
                    <div className="md:col-4">
                        <label>Review Types</label>
                        <MultiSelect
                            value={selectedReviewTypes}
                            options={reviewTypes}
                            onChange={(e) => setSelectedReviewTypes(e.value)}
                            className="w-full mt-2"
                            placeholder={reviewTypes.length ? 'Select Review Types' : 'No review types available'}
                            disabled={reviewTypes.length === 0}
                        />
                    </div>
                    <div className="md:col-4">
                        <label>Countries</label>
                        <MultiSelect
                            value={selectedCountries}
                            options={countries}
                            onChange={(e) => setSelectedCountries(e.value)}
                            className="w-full mt-2"
                            placeholder={countries.length ? 'Select Countries' : 'No countries available'}
                            disabled={countries.length === 0}
                        />
                    </div>
                </div>

                <div className="col-12 flex justify-content-end">
                    <Button label="Submit" icon="pi pi-check" onClick={handleSubmit} />
                </div>
            </div>

            {editableCombinations.length > 0 && (
                <>
                    <h3 className="text-lg font-medium mt-5 mb-3">Generated Evaluations</h3>

                    <div className="flex justify-content-end mb-3">
                        <InputText type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder="Search combinations..." className="w-48 p-2 text-sm border rounded" />
                    </div>

                    <DataTable value={editableCombinations.filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))} className="mb-4">
                        <Column field="id" header="#" style={{ width: '50px' }} />
                        <Column
                            header="Evaluation Name"
                            body={(rowData) => (editId === rowData.id ? <input value={rowData.name} onChange={(e) => handleEdit(rowData.id, e.target.value)} className="w-full p-1 border" /> : <span>{rowData.name}</span>)}
                        />
                        <Column
                            header="Actions"
                            body={(rowData) => (
                                <div className="flex gap-2">
                                    {editId === rowData.id ? (
                                        <Button icon="pi pi-check" className="p-button-success p-button-sm" onClick={() => setEditId(null)} tooltip="Save" />
                                    ) : (
                                        <Button icon="pi pi-pencil" className="p-button-text p-button-sm" onClick={() => setEditId(rowData.id)} tooltip="Edit" />
                                    )}
                                    <Button icon="pi pi-trash" className="p-button-danger p-button-sm" onClick={() => handleDelete(rowData.id)} tooltip="Delete" />
                                </div>
                            )}
                            style={{ width: '120px' }}
                        />
                    </DataTable>

                    <div className="flex justify-content-end">
                        <Button label="Save" icon="pi pi-save" onClick={handleSave} className="p-button-success" />
                    </div>
                </>
            )}
            {/* {savedData.length > 0 ? (
                <DataTable value={savedData.map((val, i) => ({ id: i + 1, name: val }))}>
                    <Column field="id" header="#" style={{ width: '50px' }} />
                    <Column field="name" header="Evaluation Name" />
                </DataTable>
            ) : (
                <p>No saved evaluations found.</p>
            )} */}

            {savedData.length > 0 ? (
                <div className="mt-5">
                    <h3 className="text-lg font-medium mb-3">Saved Evaluations</h3>
                    <div className="flex justify-content-end mb-3">
                        <InputText
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search saved evaluations..."
                            className="w-48 p-2 text-sm border rounded"
                        />
                    </div>
                    <DataTable
                        value={savedData.filter(item =>
                            item.name.toLowerCase().includes(searchTerm.toLowerCase())
                        )}
                        className="mb-4"
                    >
                        <Column field="id" header="#" style={{ width: '50px' }} />
                        <Column
                            header="Evaluation Name"
                            body={(rowData) => (
                                editId === rowData.id ?
                                    <input
                                        value={rowData.name}
                                        onChange={(e) => handleEditSaved(rowData.id, e.target.value)}
                                        className="w-full p-1 border"
                                    /> :
                                    <span>{rowData.name}</span>
                            )}
                        />
                        <Column
                            header="Actions"
                            body={(rowData) => (
                                <div className="flex gap-2">
                                    {editId === rowData.id ? (
                                        <Button
                                            icon="pi pi-check"
                                            className="p-button-success p-button-sm"
                                            onClick={() => setEditId(null)}
                                            tooltip="Save"
                                        />
                                    ) : (
                                        <Button
                                            icon="pi pi-pencil"
                                            className="p-button-text p-button-sm"
                                            onClick={() => setEditId(rowData.id)}
                                            tooltip="Edit"
                                        />
                                    )}
                                    <Button
                                        icon="pi pi-trash"
                                        className="p-button-danger p-button-sm"
                                        onClick={() => handleDeleteSaved(rowData.id)}
                                        tooltip="Delete"
                                    />
                                </div>
                            )}
                            style={{ width: '120px' }}
                        />
                    </DataTable>
                </div>
            ) : (
                <p className="mt-5">No saved evaluations found.</p>
            )}
        </div>
    );
};

export default EvaluationPage;
