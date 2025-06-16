'use client';
 
import { useEffect, useState } from 'react';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { v4 as uuidv4 } from 'uuid';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import 'primereact/resources/themes/lara-light-indigo/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css';
 
interface Vendor {
    id: string;
    name: string;
    email: string;
    phone: string;
    companyName: string;
    address: string;
    children?: Vendor[];
}
 
export default function VendorsPage() {
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [expandedRows, setExpandedRows] = useState<Vendor[]>([]);
    const [form, setForm] = useState<Omit<Vendor, 'id'>>({ name: '', email: '', phone: '', companyName: '', address: '' });
    const [editId, setEditId] = useState<string | null>(null);
    const [visible, setVisible] = useState(false);
    const [childForm, setChildForm] = useState<Omit<Vendor, 'id'>>({ name: '', email: '', phone: '', companyName: '', address: '' });
    const [childVisible, setChildVisible] = useState(false);
    const [parentVendorId, setParentVendorId] = useState<string | null>(null);
    const [childEditId, setChildEditId] = useState<string | null>(null);
 
    // Filter states
    const [parentVendorFilter, setParentVendorFilter] = useState<string | null>(null);
    const [parentCompanyFilter, setParentCompanyFilter] = useState<string | null>(null);
    const [childVendorFilters, setChildVendorFilters] = useState<Record<string, string | null>>({});
    const [childCompanyFilters, setChildCompanyFilters] = useState<Record<string, string | null>>({});
 
    // Filter options
    const [parentVendorOptions, setParentVendorOptions] = useState<{ label: string; value: string }[]>([]);
    const [parentCompanyOptions, setParentCompanyOptions] = useState<{ label: string; value: string }[]>([]);
    const [childVendorOptions, setChildVendorOptions] = useState<Record<string, { label: string; value: string }[]>>({});
    const [childCompanyOptions, setChildCompanyOptions] = useState<Record<string, { label: string; value: string }[]>>({});
 
    // useEffect(() => {
    //     const data = localStorage.getItem('vendors');
    //     if (data) {
    //         const parsed = JSON.parse(data);
    //         setVendors(parsed);
    //         setExpandedRows(parsed);
 
    //         // Initialize filter options when data is loaded
    //         updateFilterOptions(parsed);
    //     } else {
    //         // If no data in localStorage, create default vendor
    //         const defaultVendor = createDefaultVendor();
    //         setVendors([defaultVendor]);
    //         setExpandedRows([defaultVendor]);
    //         updateFilterOptions([defaultVendor]);
    //         // Optionally save to localStorage if you want it persisted
    //         localStorage.setItem('vendors', JSON.stringify([defaultVendor]));
    //     }
    // }, []);
 
    useEffect(() => {
        const loadVendors = () => {
            try {
                const data = localStorage.getItem('vendors');
 
                // Case 1: No data exists in localStorage
                if (!data) {
                    const defaultVendor = createDefaultVendor();
                    const initialVendors = [defaultVendor];
                    localStorage.setItem('vendors', JSON.stringify(initialVendors));
                    return initialVendors;
                }
 
                // Case 2: Data exists but might be invalid
                try {
                    const parsed = JSON.parse(data);
 
                    // Case 2a: Data is not an array
                    if (!Array.isArray(parsed)) {
                        throw new Error('Stored data is not an array');
                    }
 
                    // Case 2b: Array is empty
                    if (parsed.length === 0) {
                        const defaultVendor = createDefaultVendor();
                        const initialVendors = [defaultVendor];
                        localStorage.setItem('vendors', JSON.stringify(initialVendors));
                        return initialVendors;
                    }
 
                    // Case 2c: Valid non-empty array exists
                    return parsed;
                } catch (parseError) {
                    console.error('Error parsing vendors data:', parseError);
                    const defaultVendor = createDefaultVendor();
                    const initialVendors = [defaultVendor];
                    localStorage.setItem('vendors', JSON.stringify(initialVendors));
                    return initialVendors;
                }
            } catch (error) {
                console.error('Error loading vendors:', error);
                return [createDefaultVendor()]; // Fallback to default vendor
            }
        };
 
        const loadedVendors = loadVendors();
        setVendors(loadedVendors);
        setExpandedRows(loadedVendors);
        updateFilterOptions(loadedVendors);
    }, []);
 
    const updateFilterOptions = (data: Vendor[]) => {
        // Build parent vendor filter options - using Array.filter for uniqueness
        const vendorNamesMap: { [key: string]: boolean } = {};
        const vendorNames = data
            .map((v) => v.name)
            .filter((name) => {
                if (!vendorNamesMap[name]) {
                    vendorNamesMap[name] = true;
                    return true;
                }
                return false;
            });
        setParentVendorOptions(vendorNames.map((name) => ({ label: name, value: name })));
 
        // Build parent company filter options
        const companyNamesMap: { [key: string]: boolean } = {};
        const companyNames = data
            .map((v) => v.companyName)
            .filter((name) => {
                if (!companyNamesMap[name]) {
                    companyNamesMap[name] = true;
                    return true;
                }
                return false;
            });
        setParentCompanyOptions(companyNames.map((name) => ({ label: name, value: name })));
 
        // Build child vendor and company filter options for each parent
        const childVendorOpts: Record<string, { label: string; value: string }[]> = {};
        const childCompanyOpts: Record<string, { label: string; value: string }[]> = {};
 
        data.forEach((vendor) => {
            if (vendor.children && vendor.children.length > 0) {
                // Get unique child names
                const childNamesMap: { [key: string]: boolean } = {};
                const childNames = vendor.children
                    .map((c) => c.name)
                    .filter((name) => {
                        if (!childNamesMap[name]) {
                            childNamesMap[name] = true;
                            return true;
                        }
                        return false;
                    });
                childVendorOpts[vendor.id] = childNames.map((name) => ({ label: name, value: name }));
 
                // Get unique child company names
                const childCompaniesMap: { [key: string]: boolean } = {};
                const childCompanies = vendor.children
                    .map((c) => c.companyName)
                    .filter((name) => {
                        if (!childCompaniesMap[name]) {
                            childCompaniesMap[name] = true;
                            return true;
                        }
                        return false;
                    });
                childCompanyOpts[vendor.id] = childCompanies.map((name) => ({ label: name, value: name }));
            }
        });
 
        setChildVendorOptions(childVendorOpts);
        setChildCompanyOptions(childCompanyOpts);
    };
 
    const saveToStorage = (data: Vendor[]) => {
        localStorage.setItem('vendors', JSON.stringify(data));
        setVendors(data);
        updateFilterOptions(data);
    };
 
    const handleChange = (key: keyof typeof form, value: string) => {
        setForm({ ...form, [key]: value });
    };
 
    const handleChildChange = (key: keyof typeof childForm, value: string) => {
        setChildForm({ ...childForm, [key]: value });
    };
 
    const handleSubmit = () => {
        if (editId) {
            const updated = vendors.map((v) => (v.id === editId ? { ...v, ...form } : v));
            saveToStorage(updated);
        } else {
            const newVendor: Vendor = { id: uuidv4(), ...form };
            saveToStorage([...vendors, newVendor]);
        }
        resetForm();
    };
 
    const handleChildSubmit = () => {
        if (!parentVendorId) return;
        const updated = [...vendors];
        const idx = updated.findIndex((v) => v.id === parentVendorId);
        if (idx === -1) return;
        if (childEditId) {
            updated[idx].children = updated[idx].children?.map((c) => (c.id === childEditId ? { ...c, ...childForm } : c));
        } else {
            const newChild: Vendor = { id: uuidv4(), ...childForm };
            updated[idx].children = [...(updated[idx].children || []), newChild];
        }
        saveToStorage(updated);
        resetChildForm();
    };
 
    const resetForm = () => {
        setForm({ name: '', email: '', phone: '', companyName: '', address: '' });
        setEditId(null);
        setVisible(false);
    };
 
    const resetChildForm = () => {
        setChildForm({ name: '', email: '', phone: '', companyName: '', address: '' });
        setChildEditId(null);
        setChildVisible(false);
        setParentVendorId(null);
    };
 
    const handleEdit = (vendor: Vendor) => {
        setForm({ name: vendor.name, email: vendor.email, phone: vendor.phone, companyName: vendor.companyName, address: vendor.address });
        setEditId(vendor.id);
        setVisible(true);
    };
 
    const handleEditChild = (parentId: string, child: Vendor) => {
        setChildForm({ name: child.name, email: child.email, phone: child.phone, companyName: child.companyName, address: child.address });
        setChildEditId(child.id);
        setParentVendorId(parentId);
        setChildVisible(true);
    };
 
    const handleDelete = (id: string) => {
        const updated = vendors.filter((v) => v.id !== id);
        saveToStorage(updated);
    };
 
    const handleDeleteChild = (parentId: string, childId: string) => {
        const updated = [...vendors];
        const idx = updated.findIndex((v) => v.id === parentId);
        if (idx !== -1) {
            updated[idx].children = updated[idx].children?.filter((c) => c.id !== childId);
            saveToStorage(updated);
        }
    };
 
    const handleChildVendorFilter = (parentId: string, value: string | null) => {
        setChildVendorFilters({
            ...childVendorFilters,
            [parentId]: value
        });
    };
 
    const handleChildCompanyFilter = (parentId: string, value: string | null) => {
        setChildCompanyFilters({
            ...childCompanyFilters,
            [parentId]: value
        });
    };
 
    const clearParentFilters = () => {
        setParentVendorFilter(null);
        setParentCompanyFilter(null);
    };
 
    const clearChildFilters = (parentId: string) => {
        setChildVendorFilters({
            ...childVendorFilters,
            [parentId]: null
        });
        setChildCompanyFilters({
            ...childCompanyFilters,
            [parentId]: null
        });
    };
 
    const actionBodyTemplate = (vendor: Vendor) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => handleEdit(vendor)} />
            <Button
                icon="pi pi-plus"
                rounded
                text
                severity="success"
                onClick={() => {
                    setParentVendorId(vendor.id);
                    setChildVisible(true);
                }}
            />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDelete(vendor.id)} />
        </div>
    );
 
    const childActionBodyTemplate = (parentId: string, child: Vendor) => (
        <div className="flex gap-2">
            <Button icon="pi pi-pencil" rounded text severity="info" onClick={() => handleEditChild(parentId, child)} />
            <Button icon="pi pi-trash" rounded text severity="danger" onClick={() => handleDeleteChild(parentId, child.id)} />
        </div>
    );
 
    const rowExpansionTemplate = (vendor: Vendor) => {
        const children = vendor.children || [];
 
        // Filter children based on selected filters
        const filteredChildren = children.filter((child) => {
            const nameMatch = childVendorFilters[vendor.id] ? child.name === childVendorFilters[vendor.id] : true;
 
            const companyMatch = childCompanyFilters[vendor.id] ? child.companyName === childCompanyFilters[vendor.id] : true;
 
            return nameMatch && companyMatch;
        });
 
        return (
            <div className="p-3">
                {/* <div className="flex justify-content-end flex-wrap gap-3 mb-3">
                    <div className="flex align-items-center">
                        <Dropdown value={childVendorFilters[vendor.id] || null} options={childVendorOptions[vendor.id] || []} onChange={(e) => handleChildVendorFilter(vendor.id, e.value)} placeholder="Filter by Child Vendor Name" className="mr-2" />
                        <Dropdown value={childCompanyFilters[vendor.id] || null} options={childCompanyOptions[vendor.id] || []} onChange={(e) => handleChildCompanyFilter(vendor.id, e.value)} placeholder="Filter by Child Company" className="mr-2" />
                    </div>
                </div> */}
                <DataTable value={filteredChildren} responsiveLayout="scroll">
                    <Column field="name" header="Name" />
                    <Column field="email" header="Email" />
                    <Column field="phone" header="Phone" />
                    <Column field="companyName" header="Company" />
                    <Column field="address" header="Address" />
                    <Column body={(child) => childActionBodyTemplate(vendor.id, child)} header="Actions" />
                </DataTable>
            </div>
        );
    };
 
 
    const createDefaultVendor = (): Vendor => ({
        id: uuidv4(),
        name: 'Agency 1',
        email: 'agency1@vendor.com',
        phone: '123-456-7890',
        companyName: 'Company',
        address: '123 Main St, Anytown, USA',
        children: [
            {
                id: uuidv4(),
                name: 'Agency 1 Child Vendor',
                email: 'child@vendor.com',
                phone: '987-654-3210',
                companyName: 'Child Company',
                address: '456 Side St, Anytown, USA'
            }
        ]
    });
 
 
    // Filter the parent vendors based on selected filters
    const filteredParents = vendors.filter((v) => {
        const nameMatch = parentVendorFilter ? v.name === parentVendorFilter : true;
        const companyMatch = parentCompanyFilter ? v.companyName === parentCompanyFilter : true;
        return nameMatch && companyMatch;
    });
 
    return (
        <div className="p-4 card">
            <h2 className="text-xl font-semibold mb-4">Vendor Onboarding</h2>
 
            {/* Add form */}
            <div className="grid formgrid gap-3 mb-4">
                <div className="col-12 flex flex-wrap gap-4">
                    <InputText placeholder="Vendor Name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
                    <InputText placeholder="Email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
                    <InputText placeholder="Phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                    <InputText placeholder="Company" value={form.companyName} onChange={(e) => handleChange('companyName', e.target.value)} />
                    <InputText placeholder="Address" value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
                </div>
            </div>
            <div className="flex justify-content-end mb-3">
                <Button label="Add Vendor" icon="pi pi-plus" onClick={handleSubmit} />
            </div>
 
            {/* Parent vendor filters */}
            <div className="flex justify-content-end flex-wrap gap-3 mb-3">
                <div className="flex align-items-center">
                    <Dropdown value={parentVendorFilter} options={parentVendorOptions} onChange={(e) => setParentVendorFilter(e.value)} placeholder="Filter by Parent Vendor Name" className="mr-2" />
                    <Dropdown value={parentCompanyFilter} options={parentCompanyOptions} onChange={(e) => setParentCompanyFilter(e.value)} placeholder="Filter by Parent Company" className="mr-2" />
                </div>
            </div>
            <DataTable
                value={filteredParents}
                stripedRows
                responsiveLayout="scroll"
                rowExpansionTemplate={rowExpansionTemplate}
                expandedRows={expandedRows}
                onRowToggle={(e) => setExpandedRows(e.data as Vendor[])}
                emptyMessage="No vendors found. Add a new vendor or clear filters."
            >
                <Column expander style={{ width: '3em' }} />
                <Column field="name" header="Name" />
                <Column field="email" header="Email" />
                <Column field="phone" header="Phone" />
                <Column field="companyName" header="Company" />
                <Column field="address" header="Address" />
                <Column body={actionBodyTemplate} header="Actions" />
            </DataTable>
 
            {/* Dialogs */}
            <Dialog header={editId ? 'Edit Vendor' : 'Add Vendor'} visible={visible} style={{ width: '30vw' }} onHide={resetForm} modal>
                <div className="flex flex-column gap-3">
                    <InputText placeholder="Vendor Name" value={form.name} onChange={(e) => handleChange('name', e.target.value)} />
                    <InputText placeholder="Email" value={form.email} onChange={(e) => handleChange('email', e.target.value)} />
                    <InputText placeholder="Phone" value={form.phone} onChange={(e) => handleChange('phone', e.target.value)} />
                    <InputText placeholder="Company Name" value={form.companyName} onChange={(e) => handleChange('companyName', e.target.value)} />
                    <InputText placeholder="Address" value={form.address} onChange={(e) => handleChange('address', e.target.value)} />
                    <Button label={editId ? 'Update' : 'Save'} onClick={handleSubmit} />
                </div>
            </Dialog>
 
            <Dialog header={childEditId ? 'Edit Child Vendor' : 'Add Child Vendor'} visible={childVisible} style={{ width: '30vw' }} onHide={resetChildForm} modal>
                <div className="flex flex-column gap-3">
                    <InputText placeholder="Vendor Name" value={childForm.name} onChange={(e) => handleChildChange('name', e.target.value)} />
                    <InputText placeholder="Email" value={childForm.email} onChange={(e) => handleChildChange('email', e.target.value)} />
                    <InputText placeholder="Phone" value={childForm.phone} onChange={(e) => handleChildChange('phone', e.target.value)} />
                    <InputText placeholder="Company Name" value={childForm.companyName} onChange={(e) => handleChildChange('companyName', e.target.value)} />
                    <InputText placeholder="Address" value={childForm.address} onChange={(e) => handleChildChange('address', e.target.value)} />
                    <Button label={childEditId ? 'Update' : 'Save'} onClick={handleChildSubmit} />
                </div>
            </Dialog>
        </div>
    );
}
 
 