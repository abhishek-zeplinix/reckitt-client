'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { FileUpload, FileUploadSelectEvent } from 'primereact/fileupload';
import { Message } from 'primereact/message'; // Kept for inline validation errors if preferred over toast-only
import { Toast } from 'primereact/toast';   // For internal notifications
import { PostCall } from '@/app/api-config/ApiKit';

interface ReusableFileUploadDialogProps {
    visible: boolean;
    header: string; // e.g., "Upload Review Type Data"
    uploadContextLabel: string; // e.g., "Review Type Data", used for success messages

    demoFileLink?: string;
    demoFileLabel?: string;
    demoFileDescription?: string;

    apiEndpoint: string;
    maxFileSizeInBytes: number;
    acceptedFileExtensions: string[]; // e.g., ['xls', 'xlsx', 'xlsm']

    onHideDialog: () => void;
    // contextLabel is still passed back for clarity, confirming which upload succeeded.
    onUploadSuccess: (contextLabel: string, responseData: any) => void;
}

const ReusableFileUploadDialog: React.FC<ReusableFileUploadDialogProps> = ({
    visible,
    header,
    uploadContextLabel,
    demoFileLink,
    demoFileLabel = "Download Sample Template",
    demoFileDescription = "Download the sample template to ensure your data is in the correct format.",
    apiEndpoint,
    maxFileSizeInBytes,
    acceptedFileExtensions,
    onHideDialog,
    onUploadSuccess,
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [fileValidationErrors, setFileValidationErrors] = useState<string[]>([]);
    const [isUploading, setIsUploading] = useState(false); // Internal loading state
    const fileUploadRef = useRef<FileUpload>(null);
    const toastRef = useRef<Toast>(null); // Internal Toast reference

    const getAcceptString = () => acceptedFileExtensions.map(ext => `.${ext}`).join(',');

    useEffect(() => {
        // Reset state when dialog becomes hidden, if it was previously visible
        // or when it's about to be shown to ensure clean state.
        if (!visible) {
            resetInternalState();
        }
    }, [visible]);

    const resetInternalState = () => {
        setSelectedFile(null);
        setFileValidationErrors([]);
        setIsUploading(false);
        if (fileUploadRef.current) {
            fileUploadRef.current.clear();
        }
    };

    const showInternalToast = (severity: 'success' | 'info' | 'warn' | 'error', summary: string, detail?: string, life: number = 4000) => {
        toastRef.current?.show({ severity, summary, detail, life });
    };

    const validateFile = (file: File): string[] => {
        const errors: string[] = [];
        const fileExtension = file.name.toLowerCase().split('.').pop() || '';

        if (!acceptedFileExtensions.includes(fileExtension)) {
            errors.push(`${file.name}: Invalid file type. Allowed: ${acceptedFileExtensions.join(', ')}`);
        }

        if (file.size > maxFileSizeInBytes) {
            errors.push(
                `${file.name}: File size exceeds ${
                    (maxFileSizeInBytes / 1024 / 1024).toFixed(2)
                } MB (current: ${(file.size / 1024 / 1024).toFixed(2)}MB)`
            );
        }
        return errors;
    };

    const handleFileSelect = (e: FileUploadSelectEvent) => {
        const file = e.files[0];
        if (!file) {
            setSelectedFile(null);
            setFileValidationErrors([]);
            return;
        }

        const validationMessages = validateFile(file);
        setFileValidationErrors(validationMessages); // Set errors to display them below input

        if (validationMessages.length > 0) {
            setSelectedFile(null);
            // Optionally, show a summary toast for validation errors
            showInternalToast('error', 'Validation Issues', 'Please review the errors below the file input.', 5000);
            if (fileUploadRef.current) fileUploadRef.current.clear();
        } else {
            setSelectedFile(file);
        }
    };

    const handleFileRemove = () => {
        setSelectedFile(null);
        setFileValidationErrors([]);
        if (fileUploadRef.current) {
            fileUploadRef.current.clear();
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            showInternalToast('info', 'No File', 'Please select a file to upload.');
            return;
        }
        if (fileValidationErrors.length > 0) {
            showInternalToast('info', 'Validation Error', 'Please fix the file errors before uploading.');
            return;
        }

        setIsUploading(true);

        try {
            const formData = new FormData();
            formData.append('file', selectedFile);

            const response = await PostCall(apiEndpoint, formData);

            if (response.code?.toLowerCase() === 'success') {
                showInternalToast('success', 'Upload Successful', `${uploadContextLabel} uploaded successfully!`);
                onUploadSuccess(uploadContextLabel, response);
                handleDialogClose(true); 
            } else {
                showInternalToast('error', 'Upload Failed', response.message || `An error occurred while uploading ${uploadContextLabel}.`);
            }
        } catch (error: any) {
            console.error(`Upload error for ${uploadContextLabel}:`, error);
            showInternalToast('error', 'Upload Error', error.message || `An unexpected error occurred while uploading ${uploadContextLabel}.`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleDialogClose = (uploadedSuccessfully: boolean = false) => {
        if (!uploadedSuccessfully) { // If closed manually or via cancel, reset fully
             resetInternalState();
        }
        onHideDialog();
    };
    
    const dialogFooter = (
        <div className="flex justify-content-end gap-2 py-3">
            <Button
                label="Cancel"
                icon="pi pi-times"
                onClick={() => handleDialogClose(false)}
                className="p-button-text text-primary"
                disabled={isUploading}
            />
            <Button
                label="Upload"
                icon="pi pi-upload"
                onClick={handleUpload}
                disabled={!selectedFile || fileValidationErrors.length > 0 || isUploading}
                loading={isUploading}
            />
        </div>
    );

    return (
        <>
            <Toast ref={toastRef} position="top-right" />
            <Dialog
                header={header}
                visible={visible}
                style={{ width: '500px' }}
                onHide={() => handleDialogClose(false)}
                footer={dialogFooter}
                modal
                resizable={false}
                onShow={resetInternalState} // Reset when dialog is shown to ensure clean state
            >
                <div className="flex flex-column gap-3">
                    {demoFileLink && (
                        <div className="field">
                            <div className="bg-blue-50 border-1 border-blue-200 border-round p-3">
                                <div className="flex align-items-center gap-2 mb-2">
                                    <i className="pi pi-info-circle text-blue-600"></i>
                                    <span className="font-semibold text-blue-800">Sample Template</span>
                                </div>
                                {demoFileDescription && <p className="text-blue-700 m-0 mb-2">{demoFileDescription}</p>}
                                <a
                                    href={demoFileLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 underline flex align-items-center gap-1"
                                >
                                    <i className="pi pi-download"></i>
                                    {demoFileLabel}
                                </a>
                            </div>
                        </div>
                    )}

                    <div className="field">
                        <label htmlFor="fileUploadDialogSingleUnique" className="block mb-2 font-semibold">
                            Upload File <span className="text-red-500">*</span>
                        </label>
                        <FileUpload
                            id="fileUploadDialogSingleUnique" // Ensure unique ID if multiple instances could exist (though unlikely for a modal)
                            ref={fileUploadRef}
                            name="uploadFile"
                            mode="basic"
                            auto={false}
                            customUpload={true}
                            onSelect={handleFileSelect}
                            accept={getAcceptString()}
                            maxFileSize={maxFileSizeInBytes} // PrimeReact handles this with a toast if file is too large before onSelect
                            chooseLabel={selectedFile ? "Change File" : "Choose File"}
                            className="w-full"
                            disabled={isUploading}
                            multiple={false}
                        />
                        <small className="text-500 mt-2 block">
                            Accepted formats: {acceptedFileExtensions.join(', ')} | Maximum size: {(maxFileSizeInBytes / 1024 / 1024).toFixed(2)}MB
                        </small>
                    </div>

                    {fileValidationErrors.length > 0 && (
                        <div className="field mt-2"> {/* Added margin top */}
                            {fileValidationErrors.map((error, index) => (
                                <Message
                                    key={index}
                                    severity="error"
                                    text={error}
                                    className="w-full mb-2"
                                />
                            ))}
                        </div>
                    )}

                    {selectedFile && fileValidationErrors.length === 0 && (
                        <div className="field">
                            <label className="block mb-2 font-semibold">Selected File</label>
                            <div className="border-1 border-200 border-round p-2 bg-gray-50">
                                <div className="flex align-items-center justify-content-between p-2">
                                    <div className="flex align-items-center gap-2">
                                        <i className="pi pi-file-excel text-green-600 text-xl"></i>
                                        <span className="font-medium">{selectedFile.name}</span>
                                        <span className="text-500 text-sm">
                                            ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                                        </span>
                                    </div>
                                    <Button
                                        icon="pi pi-times"
                                        className="p-button-text p-button-sm p-button-danger"
                                        onClick={handleFileRemove}
                                        tooltip="Remove file"
                                        tooltipOptions={{position: 'top'}}
                                        disabled={isUploading}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </Dialog>
        </>
    );
};

export default ReusableFileUploadDialog;