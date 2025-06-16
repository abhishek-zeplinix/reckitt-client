'use client';
import React, { useState, useRef, useEffect } from 'react';
import { MultiSelect } from 'primereact/multiselect';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Toast } from 'primereact/toast';
import { Dialog } from 'primereact/dialog';

const MarketingAccount = () => {
    const toast = useRef<Toast>(null);
    // const reviewTypes = ['Creative', 'Brand Experience', 'Content/Energy Studio', 'Media', 'Digital', 'Strategy'].map((r) => ({ label: r, value: r }));

    // const countryOptions = ['Global', 'UK', 'Germany'].map((c) => ({ label: c, value: c }));

    const [reviewTypes, setReviewTypes] = useState<{ label: string, value: string }[]>([]);
    const [countryOptions, setCountries] = useState<{ label: string, value: string }[]>([]);
    const brandMapping: Record<string, string> = {
        Global: 'Airwick',
        UK: 'Finish',
        Germany: 'Gaviscon'
    };

    const [selectedCountries, setSelectedCountries] = useState<string[]>([]);
    const [filteredBrands, setFilteredBrands] = useState<{ label: string; value: string }[]>([]);
    const [selectedBrands, setSelectedBrands] = useState<string[]>([]);

    const [selectedReviewTypes, setSelectedReviewTypes] = useState<string[]>([]);
    const [combinations, setCombinations] = useState<string[]>([]);
    const [showDialog, setShowDialog] = useState(false);
    const [savedData, setSavedData] = useState<string[]>([]);

    useEffect(() => {
            const getStoredValues = (key: string) => {
                const data = localStorage.getItem(key);
                if (!data) return [];
                try {
                    return JSON.parse(data).map((item: any) => ({ label: item, value: item }));
                } catch {
                    return [];
                }
            };
            setReviewTypes(getStoredValues('Review Type'));
            setCountries(getStoredValues('Country'));
        }, []);
    
    useEffect(() => {
        // Update brands based on selected countries
        const updatedBrands = selectedCountries.map((country) => {
            const brand = brandMapping[country];
            return { label: brand, value: brand };
        });

        setFilteredBrands(updatedBrands);
        setSelectedBrands([]); // Reset brands on country change
    }, [selectedCountries]);

    const handleSubmit = () => {
        setCombinations([]);
        if (!selectedReviewTypes.length || !selectedCountries.length) {
            toast.current?.show({
                severity: 'warn',
                summary: 'Oops!',
                detail: 'Select Review Types and Countries before submitting ',
                life: 3000
            });
            return;
        }

        const newCombos: string[] = [];

        selectedReviewTypes.forEach((review) => {
            selectedCountries.forEach((country) => {
                const brand = brandMapping[country]; // get mapped brand
                if (brand) {
                    newCombos.push(`${review},${country},${brand}`);
                }
            });
        });

        setCombinations((prev) => [...prev, ...newCombos]);
    };

    const handleSave = () => {
        localStorage.setItem('reviewBrandData', JSON.stringify(combinations));
        toast.current?.show({
            severity: 'success',
            summary: 'Saved!',
            detail: 'Review combinations saved locally ',
            life: 3000
        });
    };

    const handleViewSaved = () => {
        const data = JSON.parse(localStorage.getItem('reviewBrandData') || '[]');
        setSavedData(data);
        setShowDialog(true);
    };

    return (
        <div className="p-4 card">
            <Toast ref={toast} />

            <Dialog header="Saved Review-Brand Combos" visible={showDialog} style={{ width: '50vw' }} onHide={() => setShowDialog(false)}>
                {savedData.length > 0 ? (
                    <DataTable value={savedData.map((val, i) => ({ id: i + 1, name: val }))}>
                        <Column field="id" header="#" style={{ width: '50px' }} />
                        <Column field="name" header="Combo" />
                    </DataTable>
                ) : (
                    <p>No saved review-brand combos found.</p>
                )}
            </Dialog>

            <div className="flex justify-content-between mb-3">
                <h2 className="text-xl font-semibold">Account</h2>
                <Button label="View Saved Combos" icon="pi pi-eye" onClick={handleViewSaved} />
            </div>

            <div className="grid formgrid gap-3 mb-4">
                <div className="flex row col-12">
                    <div className="md:col-4">
                        <label>Review Types</label>
                        <MultiSelect value={selectedReviewTypes} options={reviewTypes} onChange={(e) => setSelectedReviewTypes(e.value)} className="w-full mt-2" placeholder="Select Review Types" />
                    </div>
                    <div className="md:col-4">
                        <label>Countries</label>
                        <MultiSelect value={selectedCountries} options={countryOptions} onChange={(e) => setSelectedCountries(e.value)} className="w-full mt-2" placeholder="Select Countries" />
                    </div>
                    <div className="md:col-4">
                        <label>Brands</label>
                        <MultiSelect value={selectedBrands} options={filteredBrands} onChange={(e) => setSelectedBrands(e.value)} className="w-full mt-2" placeholder="Select Brands" disabled={filteredBrands.length === 0} />
                    </div>
                </div>

                <div className="col-12 flex justify-content-end">
                    <Button label="Submit" icon="pi pi-check" onClick={handleSubmit} />
                </div>
            </div>

            {combinations.length > 0 && (
                <>
                    <h3 className="text-lg font-medium mt-5 mb-3">Generated Combinations</h3>
                    <DataTable value={combinations.map((c, i) => ({ id: i + 1, name: c }))} className="mb-4">
                        <Column field="id" header="#" style={{ width: '50px' }} />
                        <Column field="name" header="Combo" />
                    </DataTable>
                    <div className="flex justify-content-end">
                        <Button label="Save" icon="pi pi-save" onClick={handleSave} className="p-button-success" />
                    </div>
                </>
            )}
        </div>
    );
};

export default MarketingAccount;
