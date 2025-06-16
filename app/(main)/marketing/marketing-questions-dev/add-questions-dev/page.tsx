'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useAppContext } from '@/layout/AppWrapper';
import { InputText } from 'primereact/inputtext';
import { get } from 'lodash';
import { GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { useZodValidationQuestion } from '@/hooks/useZodValidation';
const defaultForm = {
    templateType: null,
    userGroup: null,
    reviewType: null,
    questionDescription: '',
    questionTitle: '',
    minRating: '',
    maxRating: '',
    isCompulsary: '',
    ratingComment: '',
    ratio: '',
    segment: ''
};

interface DropdownOption {
    [key: string]: any;
    id?: string;
    reviewTypeId?: string;
    templateTypeId?: string;
    userGroupId?: string;
}

interface QuestionForm {
    marketingTemplateQuestionId ?: string;
    questionTitle: string;
    questionDescription: string;
    reviewType: DropdownOption | null;
    templateType: DropdownOption | null;
    userGroup: DropdownOption | null;
    minRating: string;
    maxRating: string;
    isCompulsary: string ; 
    ratingComment: string;
    ratio: string;
    segment: string;
}

const TemplateQuestionPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const marketingTemplateQuestionId = searchParams.get('marketingTemplateQuestionId');
    const isEditMode = searchParams.get('edit') === 'true';
    const { setAlert, setLoading } = useAppContext();
    const [form, setForm] = useState<QuestionForm>(defaultForm);

    const [reviewTypes, setReviewTypes] = useState<DropdownOption[]>([]);
    const [templateTypes, setTemplateTypes] = useState<DropdownOption[]>([]);
    const [userGroups, setUserGroups] = useState<DropdownOption[]>([]);
    const { errors, validate } = useZodValidationQuestion();
    const compulsoryOptions = [
    { label: 'Yes', value: 'yes' },
    { label: 'No', value: 'no' }
];

    // Fetch initial data
    useEffect(() => {
    const fetchData = async () => {
        await fetchReviewTypes();
        
        // If in edit mode, load the existing question data
        if (isEditMode && marketingTemplateQuestionId) {
            // Wait for reviewTypes to be populated
            const reviewTypesResponse = await GetCall('/mrkt/api/mrkt/reviewTypes');
            await fetchQuestionData(marketingTemplateQuestionId, reviewTypesResponse.data || []);
        }
    };

    fetchData();
}, [isEditMode, marketingTemplateQuestionId]);

    // Fetch review types
    const fetchReviewTypes = async () => {
        setLoading(true);
        try {
            const response = await GetCall('/mrkt/api/mrkt/reviewTypes');
            setReviewTypes(response.data || []);
        } catch (error) {
            setAlert('error', 'Failed to fetch review types');
        } finally {
            setLoading(false);
        }
    };

    // Fetch template types based on selected review type
    const fetchTemplateTypes = async (reviewTypeId: string) => {
        setLoading(true);
        try {
            const response = await GetCall(`/mrkt/api/mrkt/templateType?filters.reviewTypeId=${reviewTypeId}`);
            setTemplateTypes(response.data || []);
        } catch (error) {
            setAlert('error', 'Failed to fetch template types');
        } finally {
            setLoading(false);
        }
    };
    console.log('templateTypes',form)
    // Fetch user groups based on selected review type and template type
    const fetchUserGroups = async (reviewTypeId: string, templateTypeId: string) => {
        setLoading(true);
        try {
            const response = await GetCall(
                `/mrkt/api/mrkt/user-group?filters.reviewTypeId=${reviewTypeId}&filters.templateTypeId=${templateTypeId}`
            );
            setUserGroups(response.data || []);
        } catch (error) {
            setAlert('error', 'Failed to fetch user groups');
        } finally {
            setLoading(false);
        }
    };

    const handleReviewTypeChange = async (reviewTypeId: string) => {
    if (!reviewTypeId) {
        setTemplateTypes([]);
        setUserGroups([]);
        setForm(prev => ({
            ...prev,
            templateType: null,
            userGroup: null
        }));
        return;
    }
    
    // Fetch template types directly instead of relying on state
    const response = await GetCall(`/mrkt/api/mrkt/templateType?filters.reviewTypeId=${reviewTypeId}`);
    setTemplateTypes(response.data || []);
    
    setForm(prev => ({
        ...prev,
        templateType: null,
        userGroup: null
    }));
};

const handleTemplateTypeChange = async (reviewTypeId: string, templateTypeId: string) => {
    if (!templateTypeId) {
        setUserGroups([]);
        setForm(prev => ({
            ...prev,
            userGroup: null
        }));
        return;
    }
    
    // Fetch user groups directly instead of relying on state
    const response = await GetCall(
        `/mrkt/api/mrkt/user-group?filters.reviewTypeId=${reviewTypeId}&filters.templateTypeId=${templateTypeId}`
    );
    setUserGroups(response.data || []);
    
    setForm(prev => ({
        ...prev,
        userGroup: null
    }));
};

    // Fetch question data for edit mode
    const fetchQuestionData = async (marketingTemplateQuestionId: string, reviewTypes: DropdownOption[]) => {
    setLoading(true);
    try {
        const response = await GetCall(`/mrkt/api/mrkt/marketingtemplatequestion?filters.marketingTemplateQuestionId=${marketingTemplateQuestionId}`);
        const question = response.data[0];
        
        // First set the review type
        const selectedReviewType = reviewTypes.find(rt => rt.reviewTypeId === question.reviewType?.reviewTypeId);
        
        if (selectedReviewType) {
            // Fetch template types for this review type
            await fetchTemplateTypes(selectedReviewType.reviewTypeId || '');
            
            // Wait for templateTypes to be updated
            const templateTypesResponse = await GetCall(`/mrkt/api/mrkt/templateType?filters.reviewTypeId=${selectedReviewType.reviewTypeId}`);
            const selectedTemplateType = templateTypesResponse.data.find((tt: { templateTypeId: any; }) => tt.templateTypeId === question.templateType?.templateTypeId);
            
            if (selectedTemplateType) {
                // Fetch user groups for this review type and template type
                await fetchUserGroups(selectedReviewType.reviewTypeId || '', selectedTemplateType.templateTypeId || '');
                
                // Wait for userGroups to be updated
                const userGroupsResponse = await GetCall(
                    `/mrkt/api/mrkt/user-group?filters.reviewTypeId=${selectedReviewType.reviewTypeId}&filters.templateTypeId=${selectedTemplateType.templateTypeId}`
                );
                const selectedUserGroup = userGroupsResponse.data.find((ug: { userGroupId: any; }) => ug.userGroupId === question.userGroup?.userGroupId);
                
                // Now set the form with all the data
                setForm({
                    marketingTemplateQuestionId : question.marketingTemplateQuestionId ,
                    questionTitle: question.questionTitle,
                    questionDescription: question.questionDescription,
                    reviewType: selectedReviewType,
                    templateType: selectedTemplateType,
                    userGroup: selectedUserGroup || null,
                    minRating: question.minRating,
                    maxRating: question.maxRating,
                    isCompulsary: question.isCompulsary,
                    ratingComment: question.ratingComment,
                    ratio: question.ratio,
                    segment: question.segment
                });
            }
        }
    } catch (error) {
        setAlert('error', 'Failed to fetch question data');
    } finally {
        setLoading(false);
    }
};
    // Handle form submission
    const handleSubmit = async () => {
        // Validate required fields
         const validationInput = {
        questionTitle: form.questionTitle,
        questionDescription: form.questionDescription,
        segment: form.segment,
        ratio: Number(form.ratio),
        minRating: Number(form.minRating),
        maxRating: Number(form.maxRating)
    };

  const { isValid, fieldErrors } = validate(validationInput);
if (!isValid) {
    const firstErrorMessage = Object.values(fieldErrors)[0] || 'Validation failed';
    setAlert('error', firstErrorMessage);
    return;
}


    if (!form.reviewType || !form.templateType || !form.userGroup) {
        setAlert('error', 'Please fill all required fields');
        return;
    }
        if (!form.questionTitle || !form.reviewType || !form.templateType || !form.userGroup) {
            setAlert('error', 'Please fill all required fields');
            return;
        }

        setLoading(true);
        try {
            const payload = {
                questionTitle: form.questionTitle,
                questionDescription: form.questionDescription,
                reviewTypeId: form.reviewType.reviewTypeId,
                templateTypeId: form.templateType.templateTypeId,
                userGroupId: form.userGroup.userGroupId,
                minRating: form.minRating,
                maxRating: form.maxRating,
                isCompulsary: form.isCompulsary,
                ratingComment: form.ratingComment,
                ratio: form.ratio,
                segment: form.segment
            };

            let response;
            if (isEditMode && form.marketingTemplateQuestionId ) {
                // Update existing question
                response = await PutCall(`/mrkt/api/mrkt/marketingtemplatequestion/${marketingTemplateQuestionId }/review-type/${form.reviewType.reviewTypeId}/template-type/${form.templateType.templateTypeId}/user-group/${form.userGroup.userGroupId}`, payload);
                if (response.code === 'SUCCESS') {
                setAlert('success', `Question updated successfully`);
                } else {
                    setAlert('error', response.message);
                }
            } else {
                // Create new question
                response = await PostCall(
                    `/mrkt/api/mrkt/marketingtemplatequestion/review-type/${form.reviewType.reviewTypeId}/template-type/${form.templateType.templateTypeId}/user-group/${form.userGroup.userGroupId}`,
                    payload
                );
                if (response.code === 'SUCCESS') {
                setAlert('success', `Question created successfully`);
                } else {
                    setAlert('error', response.message);
                }}
                router.push('/marketing-questions-dev');
        } catch (error) {
            setAlert('error', isEditMode ? 'Failed to update question' : 'Failed to create question');
        } finally {
            setLoading(false);
        }
    };

    const onInputChange = (name: string, val: any) => {
        if (name === 'reviewType') {
            handleReviewTypeChange(val?.reviewTypeId || '');
        } else if (name === 'templateType' && form.reviewType) {
            handleTemplateTypeChange(form.reviewType.reviewTypeId || '', val?.templateTypeId || '');
        }

        setForm(prev => ({
            ...prev,
            [name]: val
        }));
    };
    // Adjust title based on edit mode
    const pageTitle = isEditMode ? 'Edit Create Question' : 'Add Create Question';
console.log("form", errors);
    const renderStepContent = () => {
        return (
            <div>
                <div className="flex flex-column gap-2 pt-2">
                    <h2 className="text-center font-bold ">{pageTitle}</h2>
                    <div className="p-fluid grid mx-1 pt-2">
                        <div className="field col-3">
                            <label htmlFor="reviewType" className="font-semibold">
                                Review Type
                            </label>
                            <Dropdown
                                id="reviewType"
                                value={form.reviewType}
                                options={reviewTypes}
                                optionLabel="reviewTypeName"
                                onChange={(e) => onInputChange('reviewType', e.value)}
                                placeholder="Select Review Type"
                                className="w-full mb-1"
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="templateType" className="font-semibold">
                                Template Type
                            </label>
                            <Dropdown
                                id="templateType"
                                value={form.templateType}
                                options={templateTypes}
                                optionLabel="templateTypeName"
                                onChange={(e) => onInputChange('templateType', e.value)}
                                placeholder="Select Template Type"
                                className="w-full mb-1"
                                disabled={!form.reviewType}
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="userGroup" className="font-semibold">
                                User Groups
                            </label>
                            <Dropdown
                                id="userGroup"
                                value={form.userGroup}
                                options={userGroups}
                                optionLabel="userGroupName" 
                                onChange={(e) => onInputChange('userGroup', e.value)}
                                placeholder="Select User Groups"
                                className="w-full mb-1"
                                disabled={!form.templateType}
                            />
                        </div>

                        {/* Rest of your form fields remain the same */}
                        <div className="field col-3">
                            <label htmlFor="questionTitle" className="font-semibold">
                                Question Title
                            </label>
                            <InputText id="questionTitle" type="text" value={form.questionTitle} onChange={(e) => onInputChange('questionTitle', e.target.value)} className="p-inputtext w-full mb-1" placeholder="Enter Question Title" required />
                            {errors.questionTitle && <small className="p-error font-bold">{errors.questionTitle}</small>}
                        </div>
                        <div className="field col-3">
                            <label htmlFor="questionDescription" className="font-semibold">
                                Question Description
                            </label>
                            <InputText
                                id="questionDescription"
                                type="text"
                                value={form.questionDescription}
                                onChange={(e) => onInputChange('questionDescription', e.target.value)}
                                className="p-inputtext w-full mb-1"
                                placeholder="Enter Question Description"
                            />
                            {errors.questionDescription && <small className="p-error font-bold">{errors.questionDescription}</small>}
                        </div>
                        <div className="field col-3">
                            <label htmlFor="minRating" className="font-semibold">
                                Min. Rating
                            </label>
                            <InputText id="minRating" value={form.minRating} type="text" onChange={(e) => onInputChange('minRating', e.target.value)} placeholder="Enter Min. Rating" className="p-inputtext w-full mb-1" />
                            {errors.minRating && <small className="p-error font-bold">{errors.minRating}</small>}
                        </div>
                        <div className="field col-3">
                            <label htmlFor="maxRating" className="font-semibold">
                                Max. Rating
                            </label>
                            <InputText id="maxRating" value={form.maxRating} type="text" onChange={(e) => onInputChange('maxRating', e.target.value)} placeholder="Enter Max. Rating" className="p-inputtext w-full mb-1" />
                            {errors.maxRating && <small className="p-error font-bold">{errors.maxRating}</small>}
                        </div>

                        <div className="field col-3">
                            <label htmlFor="isCompulsary" className="font-semibold">
                                Compulsory
                            </label>
                            <Dropdown
                                id="isCompulsary"
                                value={form.isCompulsary}
                                options={compulsoryOptions}
                                optionLabel="label"
                                optionValue="value"
                                onChange={(e) => onInputChange('isCompulsary', e.value)}
                                placeholder="Select Compulsory"
                                className="w-full mb-1"
                            />
                        </div>

                        <div className="field col-3">
                            <label htmlFor="ratingComment" className="font-semibold">
                                Comment if rating {'(<=)'}
                            </label>
                            <InputText
                                id="ratingComment"
                                type="text"
                                value={form.ratingComment}
                                onChange={(e) => onInputChange('ratingComment', e.target.value)}
                                className="p-inputtext w-full mb-1"
                                placeholder="Enter Comment if rating (Less than or Equal to)"
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="segment" className="font-semibold">
                                Segment
                            </label>
                            <InputText id="segment" type="text" value={form.segment} onChange={(e) => onInputChange('segment', e.target.value)} className="p-inputtext w-full mb-1" placeholder="Enter Segment" />
                            {errors.segment && <small className="p-error font-bold">{errors.segment}</small>}
                        </div>
                        <div className="field col-3">
                            <label htmlFor="ratio" className="font-semibold">
                                Ratio (%)
                            </label>
                            <InputText id="ratio" type="text" value={form.ratio} onChange={(e) => onInputChange('ratio', e.target.value)} className="p-inputtext w-full mb-1" placeholder="Enter Ratio (%)" />
                            {errors.ratio && <small className="p-error font-bold">{errors.ratio}</small>}
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