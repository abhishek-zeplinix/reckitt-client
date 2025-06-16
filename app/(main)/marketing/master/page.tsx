'use client';
import React, { useState, useRef, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation'; // For URL-based tab state
import { TabView, TabPanel } from 'primereact/tabview';
import AddBrandsControl from '@/components/market-master/brands';
import AddCountriesControl from '@/components/market-master/countries';
import AddRegionControl from '@/components/market-master/region';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { Dropdown } from 'primereact/dropdown';
import { FileUpload, FileUploadSelectEvent, FileUploadRemoveEvent } from 'primereact/fileupload'; // Typed events
import { Toast } from 'primereact/toast';
import { Message } from 'primereact/message';
import AddReviewType from '@/components/market-master/reviewType';
import AddTemplateType from '@/components/market-master/templateType';
import BUControls from '@/components/market-master/bu';
import AddUserGroup from '@/components/market-master/userGroup';
import AddAssessorGroup from '@/components/market-master/assessorGroup';
import AddAssessorRole from '@/components/market-master/assesorRole';
import AddAssessorUser from '@/components/market-master/user';
import { useAppContext } from '@/layout/AppWrapper';
import { PostCall } from '@/app/api-config/ApiKit';
import { useMarketing } from '@/layout/context/marketingContext';


// Define tabs with an ID for URL management and a component
const TABS_CONFIG = [
    { id: 'review-type', label: 'Review Type', component: <AddReviewType /> },
    { id: 'template-type', label: 'Template Type', component: <AddTemplateType /> },
    { id: 'region', label: 'Region', component: <AddRegionControl /> },
    { id: 'country', label: 'Country', component: <AddCountriesControl /> },
    { id: 'brand', label: 'Brand', component: <AddBrandsControl /> },
    { id: 'bu', label: 'BU', component: <BUControls /> },
    { id: 'user-group', label: 'User Group', component: <AddUserGroup /> },
    { id: 'assessor-group', label: 'Assessor Group', component: <AddAssessorGroup /> },
    { id: 'assessor-role', label: 'Assessor Role', component: <AddAssessorRole /> },
    { id: 'user', label: 'User', component: <AddAssessorUser /> }
];

const demoFiles: any = {
    'Review Type': 'https://example.com/demo/review-type-template.xlsx',
    'Template Type': 'https://example.com/demo/template-type-template.xlsx',
    // ... (keep your demoFiles mapping, ensure keys match tab labels)
    'Region': 'https://example.com/demo/region-template.xlsx',
    'Country': 'https://example.com/demo/country-template.xlsx',
    'Brand': 'https://example.com/demo/brand-template.xlsx',
    'BU': 'https://example.com/demo/bu-template.xlsx',
    'User Group': 'https://example.com/demo/user-group-template.xlsx',
    'Assessor Group': 'https://example.com/demo/assessor-group-template.xlsx',
    'Assessor Role': 'https://example.com/demo/assessor-role-template.xlsx',
    'User': 'https://example.com/demo/user-template.xlsx'
};

const uploadTypeMapping: any = {
    'Review Type': 'reviewType',
    'Template Type': 'templateType',
    // ... (keep your uploadTypeMapping, ensure keys match tab labels)
    'Region': 'region',
    'Country': 'country',
    'Brand': 'brand',
    'BU': 'marketingBU',
    'User Group': 'usergroup',
    'Assessor Group': 'assessorGroup',
    'Assessor Role': 'assesorRole',
    'User': 'assessorUsers'
};

const MasterTower = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const [activeTabIndex, setActiveTabIndex] = useState(0); // Use index for TabView
    const {showBulkUploadDialog, setShowBulkUploadDialog} = useMarketing();
    const [selectedUploadType, setSelectedUploadType] = useState<string | null>(null);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]); // Type as File array
    const [validationErrors, setValidationErrors] = useState<string[]>([]); // Type as string array
    const { setAlert, setLoading, isLoading } = useAppContext();

    const toast = useRef<Toast>(null); // Type Toast
    const fileUploadRef = useRef<FileUpload>(null); // Type FileUpload

    const uploadOptions = TABS_CONFIG.map(tab => ({ label: tab.label, value: tab.label }));

  
    const validateFile = (file: File): string[] => { // Return type string[]
        const errors: string[] = [];
        const allowedTypes = [
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel.sheet.macroEnabled.12'
        ];
        const fileExtension = file.name.toLowerCase().split('.').pop() || '';
        const allowedExtensions = ['xls', 'xlsx', 'xlsm'];

        if (!allowedTypes.includes(file.type) && !allowedExtensions.includes(fileExtension)) {
            errors.push(`${file.name}: Only Excel files (.xls, .xlsx, .xlsm) are allowed`);
        }

        const maxSize = 1 * 1024 * 1024;
        if (file.size > maxSize) {
            errors.push(`${file.name}: File size must not exceed 1 MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`);
        }
        return errors;
    };

    const handleFileSelect = (e: FileUploadSelectEvent) => { // Typed event
        const files = e.files;
        const allErrors: string[] = [];
        const validFiles: File[] = [];

        files.forEach((file: File) => {
            const fileErrors = validateFile(file);
            if (fileErrors.length > 0) {
                allErrors.push(...fileErrors);
            } else {
                validFiles.push(file);
            }
        });

        setValidationErrors(allErrors);
        setUploadedFiles(prevFiles => [...prevFiles, ...validFiles]); // Append new valid files

        if (allErrors.length > 0 && toast.current) {
            // Show individual errors or a summary
             allErrors.forEach(err => toast.current?.show({ severity: 'error', summary: 'Validation Error', detail: err, life: 5000 }));
        }
    };

    const handleFileRemove = (file: any) => {
        setUploadedFiles(uploadedFiles.filter((f: any) => f.name !== file.name));
        setValidationErrors([]);
    };

    const handleBulkUpload = async () => {
        if (!selectedUploadType) {
            setAlert('info', 'Please select an upload type');
            return;
        }
        if (uploadedFiles.length === 0) {
            setAlert('info', 'Please select a file to upload');
            return;
        }
        if (validationErrors.length > 0) {
            setAlert('info', 'Please fix the validation errors before uploading');
            return;
        }
        setLoading(true);

        try {
            const file = uploadedFiles[0]; // Assuming single file upload based on UI
            const formData = new FormData();
            formData.append('file', file);
            formData.append('uploadType', uploadTypeMapping[selectedUploadType]);

            const response = await PostCall('/mrkt/api/mrkt/bulkuploadmaster', formData);

            if (response.code?.toLowerCase() === 'success') {
                setAlert('success', `${selectedUploadType} uploaded successfully!`);
                // Update active tab if upload type matches a tab
                const targetTabIndex = TABS_CONFIG.findIndex(tab => tab.label === selectedUploadType);
                if (targetTabIndex !== -1) {
                    setActiveTabIndex(targetTabIndex);
                    router.push(`${pathname}?tab=${TABS_CONFIG[targetTabIndex].id}`, { scroll: false });
                }

                setUploadedFiles([]);
                fileUploadRef.current?.clear();
                setValidationErrors([]);
                setSelectedUploadType(null);
                setShowBulkUploadDialog(false);
            } else {
                setAlert('error', response.message || 'Upload failed');
            }
        } catch (error) {
            console.error("Upload error:", error);
            setAlert('error', 'An error occurred while uploading the file');
        } finally {
            setLoading(false);
        }
    };

    const handleDialogClose = () => {
        setShowBulkUploadDialog(false);
        setSelectedUploadType(null);
        setUploadedFiles([]);
        setValidationErrors([]);
        if (fileUploadRef.current) {
            fileUploadRef.current.clear();
        }
    };

    
    const dialogFooter = (
        <div className="flex justify-content-end gap-2 py-3">
            <Button
                label="Cancel"
                icon="pi pi-times"
                onClick={handleDialogClose}
                className='text-primary bg-white border-none' // Consider PrimeFlex or custom class for styling
            />
            <Button
                label="Upload"
                icon="pi pi-upload"
                onClick={handleBulkUpload}
                disabled={!selectedUploadType || uploadedFiles.length === 0 || validationErrors.length > 0}
                loading={isLoading}
            />
        </div>
    );

    return (
        <div className="grid">

            <div className="col-12 ">
                {/* <div className='flex justify-content-end align-items-center mb-4'> 
                    <div className="header">{header}</div>
                    <Button
                        className='custom-thin-button text-gray-500'
                        icon="pi pi-file"
                        label='Bulk Upload'
                        outlined
                        onClick={() => setShowBulkUploadDialog(true)}
                    />
                </div> */}
                
                <TabView activeIndex={activeTabIndex}  className="master-sub-tabview">
                    {TABS_CONFIG.map((tab) => (
                        <TabPanel key={tab.id} header={tab.label}>
                            {/* Content is rendered directly here */}
                            {tab.component}
                        </TabPanel>
                    ))}
                </TabView>

            </div>

         <Dialog
                header="Bulk Upload"
                visible={showBulkUploadDialog}
                style={{ width: '600px' }}
                onHide={handleDialogClose}
                footer={dialogFooter}
                modal
                resizable={false}
            >
                <div className="flex flex-column gap-2">
                    <div className="field">
                        <label htmlFor="uploadType" className="block mb-2 font-semibold">
                            Select Upload Type <span className="text-red-500">*</span>
                        </label>
                        <Dropdown
                            id="uploadType"
                            value={selectedUploadType}
                            options={uploadOptions}
                            onChange={(e) => setSelectedUploadType(e.value)}
                            placeholder="Choose upload type..."
                            className="w-full sm:w-30rem"
                        />
                    </div>

                    {/* Demo File Link */}
                    {selectedUploadType && (
                        <div className="field">
                            <div className="bg-blue-50 border-1 border-blue-200 border-round p-3">
                                <div className="flex align-items-center gap-2 mb-2">
                                    <i className="pi pi-info-circle text-blue-600"></i>
                                    <span className="font-semibold text-blue-800">Sample Template</span>
                                </div>
                                <p className="text-blue-700 m-0 mb-2">
                                    Download the sample template for {selectedUploadType} to ensure your data is in the correct format.
                                </p>
                                <a
                                    href={demoFiles[selectedUploadType]}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline flex align-items-center gap-1"
                                >
                                    <i className="pi pi-download"></i>
                                    Download {selectedUploadType} Template
                                </a>
                            </div>
                        </div>
                    )}

                    <div className="field">
                        <label className="block mb-2 font-semibold">
                            Upload File <span className="text-red-500">*</span>
                        </label>
                        <FileUpload
                            ref={fileUploadRef}
                            mode="basic"
                            accept=".xlsx,.xls,.xlsm"
                            // maxFileSize={1048576} // 1MB
                            onSelect={handleFileSelect}
                            onRemove={handleFileRemove}
                            auto={false}
                            chooseLabel="Choose File"
                            className="w-full"
                            disabled={!selectedUploadType}
                            multiple={false}
                        />
                        <small className="text-500 mt-2 block">
                            Accepted formats: .xlsx, .xls, .xlsm | Maximum size: 1MB
                        </small>
                    </div>

                    {/* errors */}
                    {validationErrors.length > 0 && (
                        <div className="field">
                            {validationErrors.map((error, index) => (
                                <Message
                                    key={index}
                                    severity="error"
                                    text={error}
                                    className="w-full mb-2"
                                />
                            ))}
                        </div>
                    )}

                    {/* Uploaded Files List */}
                    {uploadedFiles.length > 0 && (
                        <div className="field">
                            <label className="block mb-2 font-semibold">Selected Files</label>
                            <div className="border-1 border-200 border-round p-2">
                                {uploadedFiles.map((file: any, index: any) => (
                                    <div key={index} className="flex align-items-center justify-content-between p-2 border-bottom-1 border-200">
                                        <div className="flex align-items-center gap-2">
                                            <i className="pi pi-file-excel text-green-600"></i>
                                            <span>{file.name}</span>
                                            <span className="text-500 text-sm">
                                                ({(file.size / 1024 / 1024).toFixed(2)} MB)
                                            </span>
                                        </div>
                                        <Button
                                            icon="pi pi-times"
                                            className="p-button-text p-button-sm text-red-500"
                                            onClick={() => handleFileRemove(file)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </Dialog>

           
        </div>
    );
};

export default MasterTower;