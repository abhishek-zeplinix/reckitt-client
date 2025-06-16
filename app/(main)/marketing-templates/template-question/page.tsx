'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { CustomResponse } from '@/types';
import { buildQueryParams, validateFormData } from '@/utils/utils';
import { InputText } from 'primereact/inputtext';
import { get } from 'lodash';
import { EmptyMargetingCreatequestion } from '@/types/forms';
import { Label } from '@mui/icons-material';
const defaultForm: EmptyMargetingCreatequestion = {
    templateTypeId: null,
    assessorGroupId: null,
    reviewTypeId:null,
    questionDescription:'',
    questionTitle:'',
    minRating:'',
    maxRating:'',
    isCompulsary:'',
    ratingComment:'',
    ratio:''
};

const TemplateQuestionPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const marketingTemplateQuestionId = searchParams.get('marketingTemplateQuestionId');
    const isEditMode = searchParams.get('edit') === 'true';
    const { setAlert, setLoading } = useAppContext();
    const [form, setForm] = useState<EmptyMargetingCreatequestion>(defaultForm);
    const [reviewType, setReviewType] = useState<any>([]);
    const [assessorGroup, setAssessorGroup] = useState<any>([]);
    const [templateType, setTemplateType] = useState<any>([]);
    const [compulsory, setCompulsory] = useState<any>([{isCompulsary:'yes'},{isCompulsary:'no'}]); 
    useEffect(() => {
        setLoading(false);
        fetchTemplateType();
        fetchReviewType();
        if (isEditMode && marketingTemplateQuestionId) {
            fetchFormData();
        }
    }, []);
    const fetchTemplateType = async () => {
        const response: CustomResponse = await GetCall(`/mrkt/api/mrkt/templateType`);
        if (response.code === 'SUCCESS') {
            setTemplateType(response.data);
        }
    };
    const fetchAssessorGroup = async (templateTypeId: string) => {
        const response: CustomResponse = await GetCall(`/mrkt/api/mrkt/marketingAssessorGroup/templateType/${templateTypeId}`);
        if (response.code === 'SUCCESS') {
            setAssessorGroup(response.data);
        }
    };

    const fetchFormData = async () => {
        try {
            const response: CustomResponse = await GetCall(`/mrkt/api/mrkt/marketingtemplatequestion?filters.marketingTemplateQuestionId=${marketingTemplateQuestionId}`);
            if (response.code === 'SUCCESS') {
                const data = response.data[0];
    
                setForm({
                    ...data,
                    templateTypeId: data.templateTypeId,
                    assessorGroupId: data.assessorGroupId,
                    reviewTypeId: data.reviewTypeId,
                    // include all necessary fields
                });
    
                // Fetch dependent data so dropdowns populate correctly
                await fetchAssessorGroup(data.templateTypeId);
                await fetchEditReviewType(data.templateTypeId);
            }
        } catch (error) {
            console.error('Failed to fetch data for edit mode', error);
        }
    };
    
    console.log('form', form);
    const fetchReviewType = async () => {
        const response: CustomResponse = await GetCall(`/mrkt/api/mrkt/reviewTypes`);
        if (response.code === 'SUCCESS') {
            setReviewType(response.data);
        }
    };
    const fetchEditReviewType = async (templateTypeId:number) => {
        const response: CustomResponse = await GetCall(`/mrkt/api/mrkt/reviewTypes/${templateTypeId}`);
        if (response.code === 'SUCCESS') {
            setReviewType(response.data);
        }
    };
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const response: CustomResponse = isEditMode ? await PutCall(`/mrkt/api/mrkt/marketingtemplatequestion/${marketingTemplateQuestionId}/review-type/${form.reviewTypeId}/template-type/${form.templateTypeId}/assessor-group/${form.assessorGroupId}`, form) : await PostCall(`/mrkt/api/mrkt/marketingtemplatequestion/review-type/${form.reviewTypeId}/template-type/${form.templateTypeId}/assessor-group/${form.assessorGroupId}`, form);

            if (response.code === 'SUCCESS') {
                setAlert('success', `Marketing Templates ${isEditMode ? 'Updated' : 'Added'} Successfully`);
                router.push('/marketing-templates');
            } else {
                setAlert('error', response.message);
            }
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    const onInputChange = (name: string | { [key: string]: any }, val?: any) => {
        setForm((prevForm) => {
            const updatedForm = {
                ...prevForm,
                ...(typeof name === 'string' ? { [name]: val } : name),
            };
            if (
                (typeof name === 'string' && name === 'templateTypeId') ||
                (typeof name === 'object' && 'templateTypeId' in name)
            ) {
                const selectedId = typeof name === 'string' ? val : name.templateTypeId;
                fetchAssessorGroup(selectedId);
                fetchEditReviewType(selectedId);
            }
    
            return updatedForm;
        });
    };
    
    // adjust title based on edit mode
    const pageTitle = isEditMode ? 'Edit Create Question' : 'Add Create Question';

    const renderStepContent = () => {
        return (
            <div>
                <div className="flex flex-column gap-2 pt-2">
                    <h2 className="text-center font-bold ">{pageTitle}</h2>
                    <div className="p-fluid grid mx-1 pt-2"> 
                        <div className="field col-3">
                            <label htmlFor="templateTypeName" className="font-semibold">
                                Template Type
                            </label>
                            <Dropdown
                                id="templateTypeName"
                                value={get(form, 'templateTypeId')}
                                options={templateType}
                                optionLabel="templateTypeName"
                                optionValue="templateTypeId"
                                onChange={(e) => onInputChange('templateTypeId', e.value)}
                                placeholder="Select Template Type"
                                className="w-full mb-1"
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="assessorGroupName" className="font-semibold">
                                User Groups
                            </label>
                            <Dropdown
                                id="assessorGroupName"
                                value={get(form, 'assessorGroupId')}
                                options={assessorGroup}
                                optionLabel="assessorGroupName"
                                optionValue="assessorGroupId"
                                onChange={(e) => onInputChange('assessorGroupId', e.value)}
                                placeholder="Select Assessor Groups"
                                className="w-full mb-1"
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="reviewTypeName" className="font-semibold">
                                Review Type
                            </label>
                            <Dropdown
                                id="reviewTypeName"
                                value={get(form, 'reviewTypeId')}
                                options={reviewType}
                                optionLabel="reviewTypeName"
                                optionValue="reviewTypeId"
                                onChange={(e) => onInputChange('reviewTypeId', e.value)}
                                placeholder="Select Review Type"
                                className="w-full mb-1"
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="questionTitle" className="font-semibold">
                                Question Title
                            </label>
                            <InputText id="questionTitle" type="text" value={get(form, 'questionTitle')} onChange={(e) => onInputChange('questionTitle', e.target.value)} className="p-inputtext w-full mb-1" placeholder="Enter Question Title" required />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="questionDescription" className="font-semibold">
                                Question Description
                            </label>
                            <InputText
                                id="questionDescription"
                                type="text"
                                value={get(form, 'questionDescription')}
                                onChange={(e) => onInputChange('questionDescription', e.target.value)}
                                className="p-inputtext w-full mb-1"
                                placeholder="Enter Question Description"
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="minRating" className="font-semibold">
                                Min. Rating
                            </label>
                            <InputText id="minRating" value={get(form, 'minRating')} type="text" onChange={(e) => onInputChange('minRating', e.target.value)} placeholder="Enter  Min. Rating" className="p-inputtext w-full mb-1" />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="maxRating" className="font-semibold">
                                Max. Rating
                            </label>
                            <InputText id="maxRating" value={get(form, 'maxRating')} type="text" onChange={(e) => onInputChange('maxRating', e.target.value)} placeholder="Enter Max. Rating" className="p-inputtext w-full mb-1" />
                        </div>

                        <div className="field col-3">
                            <label htmlFor="procurementCategory" className="font-semibold">
                                Compulsory
                            </label>
                                <Dropdown
                                    id="procurementCategory"
                                    value={get(form, 'isCompulsary')}
                                    options={compulsory}
                                    optionLabel="isCompulsary"
                                    optionValue="isCompulsary"
                                    onChange={(e) => onInputChange('isCompulsary', e.value)}
                                    placeholder="Select Compulsory"
                                    className="w-full mb-1"
                                />
                        </div>

                        <div className="field col-3">
                            <label htmlFor="comment" className="font-semibold">
                                Comment if rating (Less than or Equal to)
                            </label>
                            <InputText
                                id="ratingComment"
                                type="text"
                                value={get(form, 'ratingComment')}
                                onChange={(e) => onInputChange('ratingComment', e.target.value)}
                                className="p-inputtext w-full mb-1"
                                placeholder="Enter Comment if rating (Less than or Equal to)"
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="segment" className="font-semibold">
                                Segment
                            </label>
                            <InputText
                                id="segment"
                                type="text"
                                value={get(form, 'segment')}
                                onChange={(e) => onInputChange('segment', e.target.value)}
                                className="p-inputtext w-full mb-1"
                                placeholder="Enter Segment"
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="ratio" className="font-semibold">
                                Ratio (%)
                            </label>
                            <InputText
                                id="ratio"
                                type="text"
                                value={get(form, 'ratio')}
                                onChange={(e) => onInputChange('ratio', e.target.value)}
                                className="p-inputtext w-full mb-1"
                                placeholder="Enter Ratio (%)"
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="">
            <div className="p-card">
                <div className="p-card-body">{renderStepContent()}</div>
                <hr />
                <div className="p-card-footer flex justify-content-end px-4 gap-3 py-0 bg-slate-300 shadow-slate-400">
                    <Button label={isEditMode ? 'Update' : 'Submit'} icon="pi pi-check" className="bg-primary-main border-primary-main hover:text-white mb-3" onClick={handleSubmit} />
                </div>
            </div>
        </div>
    );
};

export default TemplateQuestionPage;
