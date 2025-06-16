'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { CustomResponse } from '@/types';
import { InputText } from 'primereact/inputtext';
import { get } from 'lodash';
import { EmptyCreateescalation } from '@/types/forms';
import { Calendar } from 'primereact/calendar';
import { Tooltip } from 'primereact/tooltip';
const defaultForm: EmptyCreateescalation = {
    evaluationName: '',
    evaluationTypeId: null,
    reportingMonth: '',
    templateTypeId: null,
    assessorGroupId: null,
    escilationEmail: '',
    finishMonth: '',
    masterCountryId: null,
    masterCountryId2: null
};

const ManageSupplierAddEditPage = () => {
    // const totalSteps = 2;
    const infoRef = useRef(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const supId = searchParams.get('supId');
    const isEditMode = searchParams.get('edit') === 'true';
    const { isLoading, setAlert, setLoading } = useAppContext();
    const [form, setForm] = useState<EmptyCreateescalation>(defaultForm);
    const [evaluationType, setEvaluationType] = useState<any>([]);
    const [templateType, setTemplateType] = useState<any>([]);
    const [assesorGroup, setAssesorGroup] = useState<any>([]);
    const [country, setCountry] = useState<any>([]);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [alphabetErrors, setAlphabetErrors] = useState<{ [key: string]: string }>({});
    const [reminders, setReminders] = useState([{ id: 1, name: "Reminder 1", value: '' }]);
    const [remindersSuperior, setRemindersSuperior] = useState([{ id: 1, name: "Reminder 1", value: '' }]);

    useEffect(() => {
        fetchEvaluationType();
        fetchTemplateType();
        fetchAssesorGroup();
        fetchCountry();
    }, []);


    const fetchEvaluationType = async () => {
        const response: CustomResponse = await GetCall(`/mrkt/api/mrkt/marketingEvaluationType`);
        if (response.code === 'SUCCESS') {
            setEvaluationType(response.data);
        }
    };
    const fetchTemplateType = async () => {
        const response: CustomResponse = await GetCall(`/mrkt/api/mrkt/templateType`);
        if (response.code === 'SUCCESS') {
            setTemplateType(response.data);
        }
    };
    const fetchAssesorGroup = async () => {
        const response: CustomResponse = await GetCall(`/mrkt/api/mrkt/marketingAssessorGroup`);
        if (response.code === 'SUCCESS') {
            setAssesorGroup(response.data);
        }
    };
    const fetchCountry = async () => {
        const response: CustomResponse = await GetCall(`/mrkt/api/mrkt/country`);
        if (response.code === 'SUCCESS') {
            setCountry(response.data);
        }
    };
    setLoading(false)
    const handleReminderChange = (id: number, newValue: string) => {
        setReminders((prevReminders) =>
            prevReminders.map((reminder) =>
                reminder.id === id ? { ...reminder, value: newValue } : reminder
            )
        );
    };

    const handleReminderSuperiorChange = (id: number, newValue: string) => {
        setRemindersSuperior((prevReminders) =>
            prevReminders.map((reminder) =>
                reminder.id === id ? { ...reminder, value: newValue } : reminder
            )
        );
    };

    const handleSubmit = async () => {
        console.log("handleSubmit clicked");
        const updatedForm = {
            ...form,
            reminders: reminders.map(r => r.value), // <--- Adding reminders values
            remindersSuperior: remindersSuperior.map(r => r.value), // <--- Adding remindersSuperior values
        };
        setFormErrors({});
        setLoading(true);
    
        try {
            // const response: CustomResponse = isEditMode
            //     ? await PutCall(`/company/supplier`, updatedForm)
            //     : await PostCall(`/company/supplier`, updatedForm);
    
            // if (response.code === 'SUCCESS') {
            //     setAlert('success', `Supplier ${isEditMode ? 'Updated' : 'Added'} Successfully`);
            //     router.push('/manage-supplier');
            // } else {
            //     setAlert('error', response.message);
            // }
            console.log();
        } catch (error) {
            console.error(error);
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };    

    const onInputChange = (name: string | { [key: string]: any }, val?: any) => {
        if (typeof name !== 'string') return;
    
        if (
            name !== 'evaluationTypeId' &&
            name !== 'reviewTypeId' &&
            name !== 'templateTypeId' &&
            name !== 'assessorGroupId' &&
            name !== 'buId' &&
            name !== 'regionId' &&
            name !== 'masterCountryId'
        ) {
            if (val) {
                const trimmedValue = typeof val === 'string' ? val.trim() : val;
                const wordCount = typeof trimmedValue === 'string' ? trimmedValue.length : 0;
    
                if (name === 'brand') {
                    const isAlphabet = /^[a-zA-Z\s]+$/.test(val);
                    if (!isAlphabet) {
                        setAlphabetErrors((prevAlphaErrors) => ({
                            ...prevAlphaErrors,
                            [name]: 'Must contain only alphabets!',
                        }));
                        return;
                    } else if (wordCount > 50) {
                        setAlphabetErrors((prevWordErrors) => ({
                            ...prevWordErrors,
                            [name]: 'Maximum 50 characters allowed!',
                        }));
                        return;
                    } else {
                        setAlphabetErrors((prevAlphaErrors) => {
                            const updatedErrors = { ...prevAlphaErrors };
                            delete updatedErrors[name];
                            return updatedErrors;
                        });
                    }
                }
            }
        }
    
        setForm((prevForm: any) => {
            const updatedForm = {
                ...prevForm,
                ...(typeof name === 'string' ? { [name]: val } : name),
            };
    
            return updatedForm;
        });

        setFormErrors((prevErrors) => {
            const updatedErrors = { ...prevErrors };
    
            if (val && updatedErrors[name]) {
                delete updatedErrors[name];
            }
    
            return updatedErrors;
        });
    }; 
    const addReminder = () => {
        const newId = reminders.length + 1;
        setReminders([...reminders, { id: newId, name: `Reminder ${newId}`, value: '' }]);
    };

    const removeReminder = (id: number) => {
        const updatedReminders = reminders
            .filter((reminder) => reminder.id !== id)
            .map((reminder, index) => ({
                id: index + 1,
                name: `Reminder ${index + 1}`,
                value: reminder.value || ''
            }));
        setReminders(updatedReminders);
    };
    const addReminderSuperior = () => {
        const newId = remindersSuperior.length + 1;
        setRemindersSuperior([...remindersSuperior, { id: newId, name: `Reminder ${newId}`, value: '' }]);
    };

    const removeReminderSuperior = (id: number) => {
        const updatedRemindersSuperior = remindersSuperior
            .filter((reminder) => reminder.id !== id)
            .map((reminder, index) => ({
                id: index + 1,
                name: `Reminder ${index + 1}`,
                value: reminder.value || ''
            }));
        setRemindersSuperior(updatedRemindersSuperior);
    };

    const renderStepContent = () => {
        return (
            <div>
                <div className="flex flex-column gap-2 pt-2">
                    <h3 className="font-bold text-lg col-12">Escalation Mapping With Timeline</h3>
                    {/* <h2 className="text-center font-bold ">Escalation Mapping With Timeline</h2> */}
                    <div className="p-fluid grid mx-1 pt-2">
                        <div className="field col-3">
                            <label htmlFor="evaluationName" className="font-semibold">
                                Evaluation Name
                            </label>
                            <InputText id="evaluationName" value={get(form, 'evaluationName')} type="evaluationName" onChange={(e) => onInputChange('evaluationName', e.target.value)} placeholder="Enter Evaluation Name " className="p-inputtext w-full mb-1" />
                            {formErrors.evaluationName && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.evaluationName}</p>}
                            {alphabetErrors.evaluationName && <p style={{ color: 'red', fontSize: '10px' }}>{alphabetErrors.evaluationName}</p>}
                        </div>
                        <div className="field col-3">
                            <label htmlFor="evaluationTypeId" className="font-semibold">
                                Evaluation Type
                            </label>
                            <Dropdown
                                id="evaluationTypeId"
                                value={get(form, 'evaluationTypeId')}
                                options={evaluationType}
                                optionLabel="evaluationTypeName"
                                optionValue="evaluationTypeId"
                                onChange={(e) => onInputChange('evaluationTypeId', e.value)}
                                placeholder="Select Evaluation Type"
                                className="w-full mb-1"
                                showClear={!!get(form, 'evaluationTypeId')}
                            />
                            {formErrors.evaluationTypeId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.evaluationTypeId}</p>}
                        </div>
                        <div className="field col-3">
                            <label htmlFor="reportingMonth" className="font-semibold">Reporting Month</label>
                            <Calendar
                                id="reportingMonth"
                                onChange={(e) => {
                                    const date = e.value;
                                    if (date) {
                                        const day = String(date.getDate()).padStart(2, '0');
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const year = date.getFullYear();
                                        const formatted = `${day}-${month}-${year}`;
                                        onInputChange('reportingMonth', formatted);
                                    } else {
                                        onInputChange('reportingMonth', '');
                                    }
                                }}
                                dateFormat="dd-mm-yy"
                                placeholder="Select a date"
                                showIcon
                            />
                            {formErrors.reportingMonth && (
                                <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.reportingMonth}</p>
                            )}
                            </div>

                        <div className="field col-3">
                            <label htmlFor="templateTypeId" className="font-semibold">
                                Templates Account
                            </label>
                            <Dropdown
                                id="templateTypeId"
                                value={get(form, 'templateTypeId')}
                                options={templateType}
                                optionLabel="templateTypeName"
                                optionValue="templateTypeId"
                                onChange={(e) => onInputChange('templateTypeId', e.value)}
                                placeholder="Select Templates Account"
                                className="w-full mb-1"
                                showClear={!!get(form, 'templateTypeId')}
                            />
                            {formErrors.templateTypeId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.templateTypeId}</p>}
                        </div>

                        <div className="field col-3">
                            <label htmlFor="assessorGroupId" className="font-semibold">
                                Assessor Group
                            </label>
                            <Dropdown
                                id="assessorGroupId"
                                value={get(form, 'assessorGroupId')}
                                options={assesorGroup}
                                optionLabel="assessorGroupName"
                                optionValue="assessorGroupId"
                                onChange={(e) => onInputChange('assessorGroupId', e.value)}
                                placeholder="Select Assessor Group "
                                className="w-full mb-1"
                                showClear={!!get(form, 'assessorGroupId')}
                            />
                            {formErrors.assessorGroupId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.assessorGroupId}</p>}
                        </div>
                        <hr className="my-4 border-t-2 border-gray-300 w-full" />
                        {/* New Section Header */}
                        <h3 className="font-bold text-lg col-12">Project Timelines</h3>
                        <div className="field col-3">
                            <label htmlFor="escilationEmail" className="font-semibold">Escalation initiation Email
                                <i className="pi pi-info-circle text-red-500 hover:text-red cursor-pointer ml-2 text-s"
                                    // data-pr-tooltip="Specify how many days before the submission deadline to send the first reminder."
                                    data-pr-position="top"
                                    id={`tooltipEscalation`} 
                                />
                            </label>
                            <Tooltip
                                target={`#tooltipEscalation`} 
                                content="When Initialize(Escalation initiation Email)"
                                pt={{ text: { style: { fontSize: '12px', padding: '4px 6px' } } }}
                            />
                            <Calendar
                                id="escilationEmail"
                                onChange={(e) => {
                                    const date = e.value;
                                    if (date) {
                                        const day = String(date.getDate()).padStart(2, '0');
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const year = date.getFullYear();
                                        const formatted = `${day}-${month}-${year}`;
                                        onInputChange('escilationEmail', formatted);
                                    } else {
                                        onInputChange('escilationEmail', '');
                                    }
                                }}
                                dateFormat="dd-mm-yy"
                                placeholder="Select a date"
                                showIcon
                            />
                            {formErrors.escilationEmail && (
                                <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.escilationEmail}</p>
                            )}
                        </div>
                        <div className="field col-3">
                            <label htmlFor="finishMonth" className="font-semibold">When Finish</label>
                            <Calendar
                                id="finishMonth"
                                onChange={(e) => {
                                    const date = e.value;
                                    if (date) {
                                        const day = String(date.getDate()).padStart(2, '0');
                                        const month = String(date.getMonth() + 1).padStart(2, '0');
                                        const year = date.getFullYear();
                                        const formatted = `${day}-${month}-${year}`;
                                        onInputChange('finishMonth', formatted);
                                    } else {
                                        onInputChange('finishMonth', '');
                                    }
                                }}
                                dateFormat="dd-mm-yy"
                                placeholder="Select a date"
                                showIcon
                            />
                            {formErrors.finishMonth && (
                                <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.finishMonth}</p>
                            )}
                        </div>
                        <hr className="my-4 border-t-2 border-gray-300 w-full" />
                        {/* New Section Header */}
                        <h3 className="font-bold text-lg col-12">Reminders</h3>

                        <div className="field col-3">
                            <label htmlFor="masterCountryId" className="font-semibold">
                                1. Before Completions
                                <i className="pi pi-info-circle text-red-500 hover:text-red cursor-pointer ml-2 text-s"
                                    // data-pr-tooltip="Specify how many days before the submission deadline to send the first reminder."
                                    data-pr-position="top"
                                    id={`tooltipBefore`} // Unique ID for each tooltip
                                />
                            </label>
                            <Tooltip
                                target={`#tooltipBefore`} // Attach tooltip to the specific icon
                                content="1. Before Completions (In Days) Type"
                                pt={{ text: { style: { fontSize: '12px', padding: '4px 6px' } } }} // Set small font size
                            />
                            <Dropdown
                                id="masterCountryId"
                                value={get(form, 'masterCountryId')}
                                options={country}
                                optionLabel="countryName"
                                optionValue="masterCountryId"
                                onChange={(e) => onInputChange('masterCountryId', e.value)}
                                placeholder="Select Country"
                                className="w-full mb-1"
                                showClear={!!get(form, 'masterCountryId')}
                            />
                            {formErrors.masterCountryId && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.masterCountryId}</p>}
                        </div>
                        {reminders.map((reminder) => (
                            <div className="flex items-center gap-2 field col-3" key={reminder.id}>
                                <div className="w-full">
                                    <label htmlFor={reminder.name} className="font-semibold">
                                        {reminder.name}
                                    </label>
                                    <i className="pi pi-info-circle text-red-500 hover:text-red cursor-pointer ml-2 text-s"
                                        // data-pr-tooltip="Specify how many days before the submission deadline to send the first reminder."
                                        data-pr-position="top"
                                        id={`tooltip-${reminder.id}`} // Unique ID for each tooltip
                                    />
                                    <Tooltip
                                        target={`#tooltip-${reminder.id}`} // Attach tooltip to the specific icon
                                        content="Specify how many days before the submission deadline to send the first reminder."
                                        pt={{ text: { style: { fontSize: '12px', padding: '4px 6px' } } }} // Set small font size
                                    />
                                    <InputText
                                        id={reminder.name}
                                        value={reminder.value}
                                        type="text"
                                        onChange={(e) => handleReminderChange(reminder.id, e.target.value)}
                                        placeholder={`Enter ${reminder.name}`}
                                        className="p-inputtext w-full mb-1 mt-2"
                                    />
                                    {formErrors[reminder.name] && <p className="text-red-500 text-xs">{formErrors[reminder.name]}</p>}
                                    {alphabetErrors[reminder.name] && <p className="text-red-500 text-xs">{alphabetErrors[reminder.name]}</p>}
                                </div>
                                <Button
                                    icon="pi pi-trash"
                                    className="p-button-danger p-button-rounded p-button-sm mt-4"
                                    onClick={() => removeReminder(reminder.id)}
                                    disabled={reminders.length === 1} // Disable removal if only 1 reminder exists
                                />
                            </div>
                        ))}
                        <div className="field col-4 mt-4">
                            <Button icon="pi pi-plus" className="bg-red-600 p-button-rounded p-button-sm mt-2 " onClick={addReminder} />
                        </div>
                        {reminders.length === 2 && <div className="field col-6 "></div>}
                        {reminders.length === 3 && <div className="field col-6 "></div>}
                        {reminders.length === 4 && <div className="field col-3 "></div>}

                        <div className="field col-3">
                            <label htmlFor="masterCountryId" className="font-semibold">
                                2.For Superior
                                <i className="pi pi-info-circle text-red-500 hover:text-red cursor-pointer ml-2 text-s"
                                    // data-pr-tooltip="Specify how many days before the submission deadline to send the first reminder."
                                    data-pr-position="top"
                                    id={`tooltipSuperior`} // Unique ID for each tooltip
                                />
                            </label>
                            <Tooltip
                                target={`#tooltipSuperior`} // Attach tooltip to the specific icon
                                content="2. For Superior (In Hours) Type"
                                pt={{ text: { style: { fontSize: '12px', padding: '4px 6px' } } }} // Set small font size
                            />
                            <Dropdown
                                id="masterCountryId2"
                                value={get(form, 'masterCountryId2')}
                                options={country}
                                optionLabel="countryName"
                                optionValue="masterCountryId"
                                onChange={(e) => onInputChange('masterCountryId2', e.value)}
                                placeholder="Select Country"
                                className="w-full mb-1"
                                showClear={!!get(form, 'masterCountryId2')}
                            />
                            {formErrors.masterCountryId2 && <p style={{ color: 'red', fontSize: '10px' }}>{formErrors.masterCountryId2}</p>}
                        </div>
                        {remindersSuperior.map((reminder) => (
                            <div className="flex items-center gap-2 field col-3" key={reminder.id}>
                                <div className="w-full">
                                    <label htmlFor={reminder.name} className="font-semibold">
                                        {reminder.name}
                                    </label>
                                    <i className="pi pi-info-circle text-red-500 hover:text-red cursor-pointer ml-2 text-s"
                                        // data-pr-tooltip="Specify how many days before the submission deadline to send the first reminder."
                                        data-pr-position="top"
                                        id={`tooltip-Superior`} // Unique ID for each tooltip
                                    />
                                    <Tooltip
                                        target={`#tooltip-Superior`} // Attach tooltip to the specific icon
                                        content="Specify how many hrs before the submission deadline to send the second reminder."
                                        pt={{ text: { style: { fontSize: '12px', padding: '4px 6px' } } }} // Set small font size
                                    />
                                    <InputText
                                        id={reminder.name}
                                        value={reminder.value}
                                        type="text"
                                        onChange={(e) => handleReminderSuperiorChange(reminder.id, e.target.value)}
                                        placeholder={`Enter ${reminder.name}`}
                                        className="p-inputtext w-full mb-1 mt-2"
                                    />
                                    {formErrors[reminder.name] && <p className="text-red-500 text-xs">{formErrors[reminder.name]}</p>}
                                    {alphabetErrors[reminder.name] && <p className="text-red-500 text-xs">{alphabetErrors[reminder.name]}</p>}
                                </div>
                                <Button
                                    icon="pi pi-trash"
                                    className="p-button-danger p-button-rounded p-button-sm mt-4"
                                    onClick={() => removeReminderSuperior(reminder.id)}
                                    disabled={remindersSuperior.length === 1} // Disable removal if only 1 reminder exists
                                />
                            </div>
                        ))}
                        <div className="field col-4 mt-4">
                            <Button icon="pi pi-plus" className="bg-red-600 p-button-rounded p-button-sm mt-2" onClick={addReminderSuperior} />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="">
            <div className="p-card">
                <hr />
                <div className="p-card-body">{renderStepContent()}</div>
                <hr />
                <div className="p-card-footer flex justify-content-end px-4 gap-3 py-0 bg-slate-300 shadow-slate-400">
                <Button 
                    label={isLoading ? 'Submitting...' : 'Submit Mapping With Timelines'}
                    icon={isLoading ? 'pi pi-spin pi-spinner' : 'pi pi-check'}
                    className="bg-primary-main border-primary-main hover:text-white mb-3"
                    onClick={handleSubmit}
                    disabled={isLoading}
                    />

                </div>
            </div>
        </div>
    );
};

export default ManageSupplierAddEditPage;
