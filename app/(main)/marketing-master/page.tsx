'use client';
import React, { useEffect, useState } from 'react';
import { Button } from 'primereact/button';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { useRouter } from 'next/navigation';

const Tabs = ['Year', 'Evaluation Period', 'Review Type', 'Template Type', 'Region', 'Country', 'Brand', 'BU', 'User Group', 'Assessor Group', 'User', 'Vendor'];

const toDropdownOptions = (arr: any) => (Array.isArray(arr) ? arr.map((item) => ({ label: item, value: item })) : []);

interface UserData {
    assessorGroup: string;
    username: string;
    role: string;
    email: string;
}

const MarketingMaster = () => {
    const [activeTab, setActiveTab] = useState('Year');
    const [inputValue, setInputValue] = useState('');
    const [selectedReviewType, setSelectedReviewType] = useState('');
    const [selectedTemplateType, setSelectedTemplateType] = useState('');
    const [selectedUserGroups, setSelectedUserGroups] = useState('');
    const [selectedAssessorGroup, setSelectedAssessorGroup] = useState('');
    const [username, setUsername] = useState('');
    const [role, setRole] = useState('');
    const [email, setEmail] = useState('');
    const [data, setData] = useState<Record<string, any>>({});
    const [editIndex, setEditIndex] = useState<number | null>(null);
    const router = useRouter();
    // Static default values
    const staticDefaults = {
        'Evaluation Period': ['H1'],
        'Brand': ['Airwick'],
        'Review Type': ['Brand Experience', 'Content/Energy Studio', 'Digital', 'Media', 'Strategy', 'Medical Marketing (UK only)'],
    };


    // useEffect(() => {
    //     const storedData: Record<string, any> = {};
    //     Tabs.forEach((tab) => {
    //         const values = localStorage.getItem(tab);
    //         storedData[tab] = values ? JSON.parse(values) : ['Review Type', 'Template Type', 'User Group'].includes(tab) ? {} : [];
    //     });
    //     storedData['Assessor Group'] = localStorage.getItem('Assessor Group') ? JSON.parse(localStorage.getItem('Assessor Group')!) : {};
    //     storedData['User'] = localStorage.getItem('User') ? JSON.parse(localStorage.getItem('User')!) : [];
    //     setData(storedData);
    // }, []);
    console.log(data);
    useEffect(() => {
        const storedData: Record<string, any> = {};

        // First initialize with static defaults
        Tabs.forEach((tab) => {
            if (staticDefaults[tab as keyof typeof staticDefaults]) {
                storedData[tab] = staticDefaults[tab as keyof typeof staticDefaults];
            } else {
                storedData[tab] = ['Review Type', 'Template Type', 'User Group'].includes(tab) ? {} : [];
            }
        });

        // Then load from localStorage, preserving static defaults
        Tabs.forEach((tab) => {

            // if(tab === 'Vendor'){
            //     router.push('/vendors-marketing')
            //     return;
            // }
            const values = localStorage.getItem(tab);
            if (values) {
                if (staticDefaults[tab as keyof typeof staticDefaults]) {
                    // For tabs with static defaults, merge with localStorage
                    const staticValues = staticDefaults[tab as keyof typeof staticDefaults];
                    const storedValues = JSON.parse(values);
                    // Filter out any duplicates of static values
                    const filteredStored = storedValues.filter((val: string) => !staticValues.includes(val));
                    storedData[tab] = [...staticValues, ...filteredStored];
                } else {
                    storedData[tab] = JSON.parse(values);
                }
            }
        });

        storedData['Assessor Group'] = localStorage.getItem('Assessor Group')
            ? JSON.parse(localStorage.getItem('Assessor Group')!)
            : {};
        storedData['User'] = localStorage.getItem('User')
            ? JSON.parse(localStorage.getItem('User')!)
            : [];

        setData(storedData);
    }, []);

    const saveToLocal = (key: string, value: any) => {
        // For static default tabs, ensure we don't delete the default values
        if (staticDefaults[key as keyof typeof staticDefaults]) {
            const staticValues = staticDefaults[key as keyof typeof staticDefaults];
            const filteredValue = Array.isArray(value)
                ? [...staticValues, ...value.filter((item: string) => !staticValues.includes(item))]
                : value;
            localStorage.setItem(key, JSON.stringify(filteredValue));
            setData((prev) => ({ ...prev, [key]: filteredValue }));
        } else {
            localStorage.setItem(key, JSON.stringify(value));
            setData((prev) => ({ ...prev, [key]: value }));
        }
    };

    const handleSave = () => {
        if (activeTab === 'User') {
            if (!selectedAssessorGroup || !username || !role || !email) {
                return alert('Please fill all fields');
            }

            const userData: UserData = {
                assessorGroup: selectedAssessorGroup,
                username: username.trim(),
                role: role.trim(),
                email: email.trim()
            };

            const users = [...(data['User'] || [])];
            if (editIndex !== null) {
                users[editIndex] = userData;
            } else {
                users.push(userData);
            }

            saveToLocal('User', users);
            setSelectedAssessorGroup('');
            setUsername('');
            setRole('');
            setEmail('');
            setEditIndex(null);
            return;
        }

        if (!inputValue.trim()) return;

        let updated: any;

        if (activeTab === 'Template Type') {
            if (!selectedReviewType) return alert('Select Review Type');
            updated = { ...data['Template Type'] };
            const list = [...(updated[selectedReviewType] || [])];
            if (editIndex !== null) list[editIndex] = inputValue.trim();
            else list.push(inputValue.trim());
            updated[selectedReviewType] = list;
            saveToLocal('Template Type', updated);
        } else if (activeTab === 'User Group') {
            if (!selectedReviewType || !selectedTemplateType) return alert('Select both types');
            updated = { ...data['User Group'] };
            if (!updated[selectedReviewType]) updated[selectedReviewType] = {};
            const list = [...(updated[selectedReviewType][selectedTemplateType] || [])];
            if (editIndex !== null) list[editIndex] = inputValue.trim();
            else list.push(inputValue.trim());
            updated[selectedReviewType][selectedTemplateType] = list;
            saveToLocal('User Group', updated);
        } else if (activeTab === 'Assessor Group') {
            if (!selectedReviewType || !selectedTemplateType || !selectedUserGroups) return alert('Select all types');
            updated = { ...data['Assessor Group'] };
            if (!updated[selectedReviewType]) updated[selectedReviewType] = {};
            if (!updated[selectedReviewType][selectedTemplateType]) updated[selectedReviewType][selectedTemplateType] = {};
            const list = [...(updated[selectedReviewType][selectedTemplateType][selectedUserGroups] || [])];
            if (editIndex !== null) list[editIndex] = inputValue.trim();
            else list.push(inputValue.trim());
            updated[selectedReviewType][selectedTemplateType][selectedUserGroups] = list;
            saveToLocal('Assessor Group', updated);
        } else {
            const list = Array.isArray(data[activeTab]) ? [...data[activeTab]] : [];
            if (editIndex !== null) list[editIndex] = inputValue.trim();
            else list.push(inputValue.trim());
            saveToLocal(activeTab, list);
        }

        setInputValue('');
        setEditIndex(null);
    };

    const handleEdit = (index: number, item: any) => {
        if (activeTab === 'User') {
            setSelectedAssessorGroup(item.assessorGroup);
            setUsername(item.username);
            setRole(item.role);
            setEmail(item.email);
            setEditIndex(index);
        } else {
            setInputValue(item);
            setEditIndex(index);
        }
    };

    const handleDelete = (index: number) => {
        if (activeTab === 'User') {
            const users = [...(data['User'] || [])];
            users.splice(index, 1);
            saveToLocal('User', users);
        } else if (activeTab === 'Template Type') {
            const updated = { ...data['Template Type'] };
            updated[selectedReviewType] = updated[selectedReviewType].filter((_: string, i: number) => i !== index);
            saveToLocal('Template Type', updated);
        } else if (activeTab === 'User Group') {
            const updated = { ...data['User Group'] };
            updated[selectedReviewType][selectedTemplateType] = updated[selectedReviewType][selectedTemplateType].filter((_: string, i: number) => i !== index);
            saveToLocal('User Group', updated);
        } else if (activeTab === 'Assessor Group') {
            const updated = { ...data['Assessor Group'] };
            updated[selectedReviewType][selectedTemplateType][selectedUserGroups] = updated[selectedReviewType][selectedTemplateType][selectedUserGroups].filter((_: string, i: number) => i !== index);
            saveToLocal('Assessor Group', updated);
        } else {
            const list = [...(data[activeTab] || [])];
            list.splice(index, 1);
            saveToLocal(activeTab, list);
        }

        setInputValue('');
        setEditIndex(null);
    };

    console.log(data);
    const renderNestedForm = () => {
        if (activeTab === 'User') {
            // Get all assessor groups from all nested structures
            const assessorGroups: string[] = [];
            const assessorGroupData = data['Assessor Group'] || {};

            for (const reviewType in assessorGroupData) {
                for (const templateType in assessorGroupData[reviewType]) {
                    for (const userGroup in assessorGroupData[reviewType][templateType]) {
                        assessorGroups.push(...assessorGroupData[reviewType][templateType][userGroup]);
                    }
                }
            }

            return (
                <>
                    <Dropdown
                        value={selectedAssessorGroup}
                        options={toDropdownOptions(assessorGroups)}
                        onChange={(e) => setSelectedAssessorGroup(e.value)}
                        placeholder="Select Assessor Group"
                        className="w-1/4 border-round-lg"
                    />
                    <InputText
                        type="text"
                        className="p-2 border rounded w-1/4 ml-2 border-round-lg"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <InputText
                        type="text"
                        className="p-2 border rounded w-1/4 ml-2 border-round-lg"
                        placeholder="Role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    />
                    <InputText
                        type="email"
                        className="p-2 border rounded w-1/4 ml-2 border-round-lg"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </>
            );
        }

        return (
            <>
                <Dropdown
                    value={selectedReviewType}
                    options={toDropdownOptions(data['Review Type'])}
                    onChange={(e) => {
                        setSelectedReviewType(e.value);
                        setSelectedTemplateType('');
                        setSelectedUserGroups('');
                    }}
                    placeholder="Select Review Type"
                    className="w-1/4 border-round-lg"
                />
                {activeTab !== 'Template Type' && ['Template Type', 'User Group', 'Assessor Group'].includes(activeTab) && (
                    <Dropdown
                        value={selectedTemplateType}
                        options={toDropdownOptions(data['Template Type']?.[selectedReviewType] || [])}
                        onChange={(e) => {
                            setSelectedTemplateType(e.value);
                            setSelectedUserGroups('');
                        }}
                        placeholder="Select Template Type"
                        className="w-1/4 ml-2 border-round-lg"
                    />
                )}

                {activeTab === 'Assessor Group' && (
                    <Dropdown
                        value={selectedUserGroups}
                        options={toDropdownOptions(data['User Group']?.[selectedReviewType]?.[selectedTemplateType] || [])}
                        onChange={(e) => setSelectedUserGroups(e.value)}
                        placeholder="Select User Group"
                        className="w-1/4 ml-2 border-round-lg"
                    />
                )}
                <InputText type="text" className="p-2 border rounded w-1/4 ml-2 border-round-lg" placeholder={`Enter ${activeTab}`} value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
            </>
        );
    };

    const renderTable = () => {
        const getItems = () => {
            try {
                if (activeTab === 'User') return data['User'] || [];
                if (activeTab === 'Assessor Group') return data['Assessor Group']?.[selectedReviewType]?.[selectedTemplateType]?.[selectedUserGroups] || [];
                if (activeTab === 'User Group') return data['User Group']?.[selectedReviewType]?.[selectedTemplateType] || [];
                if (activeTab === 'Template Type') return data['Template Type']?.[selectedReviewType] || [];
                return Array.isArray(data[activeTab]) ? data[activeTab] : [];
            } catch {
                return [];
            }
        };

        const items = getItems();
        if (!items?.length) return null;

        // Handle nested tabs with parent info
        if (activeTab === 'Template Type') {
            return (
                <table className="w-full border-collapse border border-gray-300 mt-4 border-round-lg">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2 text-left border-round-lg">S.No</th>
                            <th className="border p-2 text-left border-round-lg">Review Type</th>
                            <th className="border p-2 text-left border-round-lg">Template Type</th>
                            <th className="border p-2 text-left border-round-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data['Template Type']?.[selectedReviewType] || []).map((item: string, index: number) => (
                            <tr key={index}>
                                <td className="border p-2 border-round-lg">{index + 1}</td>
                                <td className="border p-2 border-round-lg">{selectedReviewType}</td>
                                <td className="border p-2 border-round-lg">{item}</td>
                                <td className="border p-2 space-x-2 border-round-lg">
                                    <Button icon="pi pi-pencil" className="p-button-text p-button-sm" onClick={() => handleEdit(index, item)} />
                                    <Button icon="pi pi-trash" className="p-button-text p-button-sm p-button-danger" onClick={() => handleDelete(index)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        if (activeTab === 'User Group') {
            return (
                <table className="w-full border-collapse border border-gray-300 mt-4 border-round-lg">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2 text-left border-round-lg">S.No</th>
                            <th className="border p-2 text-left border-round-lg">Review Type</th>
                            <th className="border p-2 text-left border-round-lg">Template Type</th>
                            <th className="border p-2 text-left border-round-lg">User Group</th>
                            <th className="border p-2 text-left border-round-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data['User Group']?.[selectedReviewType]?.[selectedTemplateType] || []).map((item: string, index: number) => (
                            <tr key={index}>
                                <td className="border p-2 border-round-lg">{index + 1}</td>
                                <td className="border p-2 border-round-lg">{selectedReviewType}</td>
                                <td className="border p-2 border-round-lg">{selectedTemplateType}</td>
                                <td className="border p-2 border-round-lg">{item}</td>
                                <td className="border p-2 space-x-2 border-round-lg">
                                    <Button icon="pi pi-pencil" className="p-button-text p-button-sm" onClick={() => handleEdit(index, item)} />
                                    <Button icon="pi pi-trash" className="p-button-text p-button-sm p-button-danger" onClick={() => handleDelete(index)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        if (activeTab === 'Assessor Group') {
            return (
                <table className="w-full border-collapse border border-gray-300 mt-4 border-round-lg">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2 text-left border-round-lg">S.No</th>
                            <th className="border p-2 text-left border-round-lg">Review Type</th>
                            <th className="border p-2 text-left border-round-lg">Template Type</th>
                            <th className="border p-2 text-left border-round-lg">User Group</th>
                            <th className="border p-2 text-left border-round-lg">Assessor Group</th>
                            <th className="border p-2 text-left border-round-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data['Assessor Group']?.[selectedReviewType]?.[selectedTemplateType]?.[selectedUserGroups] || []).map((item: string, index: number) => (
                            <tr key={index}>
                                <td className="border p-2 border-round-lg">{index + 1}</td>
                                <td className="border p-2 border-round-lg">{selectedReviewType}</td>
                                <td className="border p-2 border-round-lg">{selectedTemplateType}</td>
                                <td className="border p-2 border-round-lg">{selectedUserGroups}</td>
                                <td className="border p-2 border-round-lg">{item}</td>
                                <td className="border p-2 space-x-2 border-round-lg">
                                    <Button icon="pi pi-pencil" className="p-button-text p-button-sm" onClick={() => handleEdit(index, item)} />
                                    <Button icon="pi pi-trash" className="p-button-text p-button-sm p-button-danger" onClick={() => handleDelete(index)} />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            );
        }

        if (activeTab === 'User') {
            return (
                <table className="w-full border-collapse border border-gray-300 mt-4 border-round-lg">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border p-2 text-left border-round-lg">S.No</th>
                            {/* <th className="border p-2 text-left border-round-lg">Review Type</th>
                        <th className="border p-2 text-left border-round-lg">Template Type</th>
                        <th className="border p-2 text-left border-round-lg">User Group</th> */}
                            <th className="border p-2 text-left border-round-lg">Assessor Group</th>
                            <th className="border p-2 text-left border-round-lg">Username</th>
                            <th className="border p-2 text-left border-round-lg">Role</th>
                            <th className="border p-2 text-left border-round-lg">Email</th>
                            <th className="border p-2 text-left border-round-lg">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {(data['User'] || []).map((item: UserData, index: number) => {
                            // Find parent info
                            let found = false;
                            let r = '', t = '', u = '';
                            for (const reviewType in data['Assessor Group']) {
                                for (const templateType in data['Assessor Group'][reviewType]) {
                                    for (const userGroup in data['Assessor Group'][reviewType][templateType]) {
                                        if (data['Assessor Group'][reviewType][templateType][userGroup].includes(item.assessorGroup)) {
                                            r = reviewType;
                                            t = templateType;
                                            u = userGroup;
                                            found = true;
                                            break;
                                        }
                                    }
                                    if (found) break;
                                }
                                if (found) break;
                            }

                            return (
                                <tr key={index}>
                                    <td className="border p-2 border-round-lg">{index + 1}</td>
                                    {/* <td className="border p-2 border-round-lg">{r}</td>
                                <td className="border p-2 border-round-lg">{t}</td>
                                <td className="border p-2 border-round-lg">{u}</td> */}
                                    <td className="border p-2 border-round-lg">{item.assessorGroup}</td>
                                    <td className="border p-2 border-round-lg">{item.username}</td>
                                    <td className="border p-2 border-round-lg">{item.role}</td>
                                    <td className="border p-2 border-round-lg">{item.email}</td>
                                    <td className="border p-2 space-x-2 border-round-lg">
                                        <Button icon="pi pi-pencil" className="p-button-text p-button-sm" onClick={() => handleEdit(index, item)} />
                                        <Button icon="pi pi-trash" className="p-button-text p-button-sm p-button-danger" onClick={() => handleDelete(index)} />
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            );
        }


        // Default fallback for simple tabs
        return (
            <table className="w-full border-collapse border border-gray-300 mt-4 border-round-lg">
                <thead>
                    <tr className="bg-gray-100">
                        <th className="border p-2 text-left border-round-lg">S.No</th>
                        <th className="border p-2 text-left border-round-lg">{activeTab}</th>
                        <th className="border p-2 text-left border-round-lg">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {items.map((item: string, index: number) => (
                        <tr key={index}>
                            <td className="border p-2 border-round-lg">{index + 1}</td>
                            <td className="border p-2 border-round-lg">{item}</td>
                            <td className="border p-2 space-x-2 border-round-lg">
                                <Button icon="pi pi-pencil" className="p-button-text p-button-sm" onClick={() => handleEdit(index, item)} />
                                <Button icon="pi pi-trash" className="p-button-text p-button-sm p-button-danger" onClick={() => handleDelete(index)} />
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
    };


    return (
        <div className="grid">
            <div className="col-12">
                <h3>Marketing Master</h3>

                <div className="card mb-4">
                    <div className="flex flex-wrap gap-3">
                        {Tabs.map((tab) => (
                            <div
                                key={tab}
                                className={`px-4 py-2 font-bold cursor-pointer border border-1 border-round-lg ${activeTab === tab ? 'text-pink-500 border-pink-500' : 'text-gray-500'}`}
                                onClick={() => {

                                    if (tab === 'Vendor') {
                                        router.push('/vendors-marketing');
                                        return;
                                    }

                                    setActiveTab(tab);
                                    setInputValue('');
                                    setEditIndex(null);
                                    setSelectedReviewType('');
                                    setSelectedTemplateType('');
                                    setSelectedUserGroups('');
                                    setSelectedAssessorGroup('');
                                    setUsername('');
                                    setRole('');
                                    setEmail('');
                                }}
                            >
                                {tab}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="card px-5 py-4 border-round-lg">
                    <h4 className="mb-2">Add {activeTab}</h4>
                    <div className="flex items-center gap-2 mb-4">
                        {['Template Type', 'User Group', 'Assessor Group', 'User'].includes(activeTab) ? (
                            renderNestedForm()
                        ) : (
                            <InputText type="text" className="p-2 border rounded w-1/2 border-round-lg" placeholder={`Enter ${activeTab}`} value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
                        )}
                        <Button label={editIndex !== null ? 'Update' : 'Save'} icon="pi pi-save" onClick={handleSave} />
                    </div>
                    {renderTable()}
                </div>
            </div>
        </div>
    );
};

export default MarketingMaster;