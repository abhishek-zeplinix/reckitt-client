'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { useAppContext } from '@/layout/AppWrapper';
import { GetCall, PostCall, PutCall } from '@/app/api-config/ApiKit';
import { CustomResponse } from '@/types';
import { validateFormCreateQuestion } from '@/utils/utils';
import { InputText } from 'primereact/inputtext';
import { get, set } from 'lodash';
import { InputTextarea } from 'primereact/inputtextarea';
import { Checkbox } from 'primereact/checkbox';
import { EmptyCreatequestion } from '@/types/forms';
import Stepper from '@/components/Stepper';
import { Country, State, City } from 'country-state-city';
import TableSkeletonSimple from '@/components/skeleton/TableSkeletonSimple';
import CustomDataTable, { CustomDataTableRef } from '@/components/CustomDataTable';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import { MultiSelect } from 'primereact/multiselect';
const defaultForm: EmptyCreatequestion = {
    vendorId: null,
    reviewTypeId: null,
    templateTypeId: null,
    userGroupId: null,
    buId: null,
    regionId: null,
    masterCountryId: null,
    brandId: null,
};

const ManageSupplierAddEditPage = () => {
    const totalSteps = 2;
    const router = useRouter();
    const searchParams = useSearchParams();
    const supId = searchParams.get('supId');
    const isEditMode = searchParams.get('edit') === 'true';
    const { isLoading, setAlert, setLoading } = useAppContext();
    const [form, setForm] = useState<EmptyCreatequestion>(defaultForm);
    const [vendors, setVendors] = useState<any>([]);
    const [reviewTypes, setReviewTypes] = useState<any>([]);
    const [templateType, setTemplateType] = useState<any>([]);
    const [userGroup, setUserGroup] = useState<any>([]);
    const [region, setRegion] = useState<any>([]);
    const [bu, setBu] = useState<any>([]);
    const [brand, setBrand] = useState<any>([]);
    const [country, setCountry] = useState<any>([]);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [alphabetErrors, setAlphabetErrors] = useState<{ [key: string]: string }>({});
    const [questionData, setQuestionData] = useState<any[]>([]);
    const dataTableRef = useRef<CustomDataTableRef>(null);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const dataTableHeaderStyle = { fontSize: '12px' };
    const [page, setPage] = useState<number>(1);
    const [totalRecords, setTotalRecords] = useState();
    const [checkedRows, setCheckedRows] = useState<{ [key: string]: boolean }>({});



    useEffect(() => {
        setLoading(false);
        fetchVendors();
        fetchReviewTypes();
        fetchRegion();
    }, []);

useEffect(() => {
    if (form.buId) {
        fetchBrand();
    }
}, [form.buId]);
useEffect(() => {
    if (form.masterCountryId) {
        fetchBU();
    }
}, [form.masterCountryId]);
useEffect(() => {
    if (form.regionId) {
        fetchCountry();
    }
}, [form.regionId]);
useEffect(() => {
    setUserGroup([]);
    if (form.templateTypeId) {
        fetchUserGroup();
    }
}, [form.templateTypeId]);
useEffect(() => {
    setUserGroup([]);
    if (form.templateTypeId) {
        fetchUserGroup();
    }
}, [form.reviewTypeId]);
useEffect(() => {
    if (form.reviewTypeId) {
    fetchTemplateType();
    }
}, [form.reviewTypeId]); 


    useEffect(() => {
        const { reviewTypeId, templateTypeId, userGroupId } = form;

        const hasAnyValue = reviewTypeId != null || templateTypeId != null || userGroupId != null;

        if (hasAnyValue) {
            fetchQuestions(
                reviewTypeId != null ? [reviewTypeId] : [],
                templateTypeId != null ? [templateTypeId] : [],
                userGroupId != null ? [userGroupId] : []
            );
        } else {
            setQuestionData([]);
        }
    }, [form.reviewTypeId, form.templateTypeId, form.userGroupId]);




    const fetchVendors = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/mrkt/api/mrkt/vendors`);
        if (response.code === 'SUCCESS') {
            setVendors(response.data);
            setLoading(false);
        }
    };
    const fetchReviewTypes = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/mrkt/api/mrkt/reviewTypes`);
        if (response.code === 'SUCCESS') {
            setReviewTypes(response.data);
            setLoading(false);
        }
    };
    const fetchTemplateType = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/mrkt/api/mrkt/templateType/reviewType/${form.reviewTypeId}`);
        if (response.code === 'SUCCESS') {
            setTemplateType(response.data);
            setLoading(false);
        }
    };
    const fetchUserGroup = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/mrkt/api/mrkt/marketingAssessorGroup/templateType/${form.templateTypeId}`);
        if (response.code === 'SUCCESS') {
            setUserGroup(response.data);
            setLoading(false);
        }
    };
    const fetchRegion = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/mrkt/api/mrkt/region`);
        if (response.code === 'SUCCESS') {
            setRegion(response.data);
            setLoading(false);
        }
    };
    const fetchCountry = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/mrkt/api/mrkt/country/region/${form.regionId}`);
        if (response.code === 'SUCCESS') {
            setCountry(response.data);
            setLoading(false);
        }
    };
    const fetchBU = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/mrkt/api/mrkt/marketingBU/country/${form.masterCountryId}`);
        if (response.code === 'SUCCESS') {
            setBu(response.data);
            setLoading(false);
        }
    };
    const fetchBrand = async () => {
        setLoading(true);
        const response: CustomResponse = await GetCall(`/mrkt/api/mrkt/brand/BU/${form.buId}`);
        if (response.code === 'SUCCESS') {
            setBrand(response.data);
            setLoading(false);
        }
    };

    const fetchQuestions = async (
        reviewTypeId: number[] = [],
        templateTypeId: number[] = [],
        userGroupId: number[] = []
    ) => {
        if (!reviewTypeId.length && !templateTypeId.length && !userGroupId.length) {
            setQuestionData([]);
            return;
        }

        try {
            const filters: string[] = [];

            reviewTypeId.forEach((id) => {
                filters.push(`filters.reviewTypeId=${id}`);
            });

            templateTypeId.forEach((id) => {
                filters.push(`filters.templateTypeId=${id}`);
            });

            userGroupId.forEach((id) => {
                filters.push(`filters.userGroupId=${id}`);
            });

            const queryString = filters.join('&');

            const response: CustomResponse = await GetCall(
                `/mrkt/api/mrkt/marketingtemplatequestion?${queryString}`
            );

            if (response.code === 'SUCCESS') {
                setQuestionData(response.data);
            } else {
                setQuestionData([]);
            }
        } catch (error) {
            console.error('Error fetching questions:', error);
            setQuestionData([]);
        }
    };



    const handleSubmit = async () => {
        console.log('101', form)
        const { valid, errors } = validateFormCreateQuestion(form);
        if (!valid) {
            setFormErrors(errors);
            return;
        }

        setFormErrors({});
        setLoading(true);
        try {
            const response: CustomResponse = isEditMode ? await PutCall(`/company/supplier/${supId}`, form) : await PostCall(`/company/supplier`, form);

            if (response.code === 'SUCCESS') {
                setAlert('success', `Supplier ${isEditMode ? 'Updated' : 'Added'} Successfully`);
                router.push('/manage-supplier');
            } else {
                setAlert('error', response.message);
            }
        } catch (error) {
            setAlert('error', 'Something went wrong!');
        } finally {
            setLoading(false);
        }
    };

    // const onInputChange = (name: string | { [key: string]: any }, val?: any) => {
    //     setForm((prevForm) => {
    //         const updatedForm = {
    //             ...prevForm,
    //             ...(typeof name === 'string' ? { [name]: val } : name),
    //         };

    //         return updatedForm;
    //     });
    //     // Real-time validation: Remove error if input is valid
    //     setFormErrors((prevErrors) => {
    //         const updatedErrors = { ...prevErrors };

    //         return updatedErrors;
    //     });
    // };
    const onInputChange = (name: string | { [key: string]: any }, val?: any) => {
        setForm((prevForm) => {
            let updatedForm = {
                ...prevForm,
                ...(typeof name === 'string' ? { [name]: val } : name),
            };
            if (name === 'buId') {
                updatedForm.brandId = null;
            }
            if (name === 'masterCountryId') {
                updatedForm.buId = null;
                updatedForm.brandId = null;
            }
            if (name === 'regionId') {
                updatedForm.buId = null;
                updatedForm.masterCountryId = null;
                updatedForm.brandId = null;
            }
            if (name === 'templateTypeId') {
                updatedForm.userGroupId = null;
            }
            if (name === 'reviewTypeId') {
                updatedForm.templateTypeId = null;
                updatedForm.userGroupId = null;
            }
    
            return updatedForm;
        });
    };
    
    const shouldShowMarketingQuestions = (form: any) => {
        return !!(form?.reviewTypeId || form?.templateTypeId || form?.userGroupId);
      };
      
      const handleCheckboxChange = (id: string | number, isChecked: boolean) => {
        setCheckedRows((prev) => ({
          ...prev,
          [id]: isChecked,
        }));
      };

    const pageTitle = isEditMode ? 'Edit Mapping Template Question to User Groups' : 'Add Mapping Template Question to User Groups';
    const renderStepContent = () => {
        return (
            <div>
                <div className="flex flex-column gap-2 pt-2">
                    <h2 className="text-center font-bold ">{pageTitle}</h2>
                    <div className="p-fluid grid mx-1 pt-2">
                        <div className="field col-3">
                            <label htmlFor="vendorName" className="font-semibold">
                                Vendor
                            </label>
                            <MultiSelect
                                id="vendorName"
                                value={get(form, 'vendorId')}
                                options={vendors}
                                optionLabel="vendorName"
                                optionValue="vendorId"
                                onChange={(e) => onInputChange('vendorId', e.value)}
                                placeholder="Select Vendor"
                                className="w-full mb-1"
                                showClear={!!get(form, 'vendorId')}
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="reviewTypeId" className="font-semibold">
                                Review Type
                            </label>
                            <Dropdown
                                id="reviewTypeId"
                                value={get(form, 'reviewTypeId')}
                                options={reviewTypes}
                                optionLabel="reviewTypeName"
                                optionValue="reviewTypeId"
                                onChange={(e) => onInputChange('reviewTypeId', e.value)}
                                placeholder="Select Review Type"
                                className="w-full mb-1"
                                showClear={!!get(form, 'reviewTypeId')}
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="templateTypeId" className="font-semibold">
                                Template Type
                            </label>
                            <Dropdown
                                id="templateTypeId"
                                value={get(form, 'templateTypeId')}
                                options={templateType}
                                optionLabel="templateTypeName"
                                optionValue="templateTypeId"
                                onChange={(e) => onInputChange('templateTypeId', e.value)}
                                placeholder="Select Template Type"
                                className="w-full mb-1"
                                showClear={!!get(form, 'templateTypeId')}
                            />
                        </div>

                        <div className="field col-3">
                            <label htmlFor="assessorGroupId" className="font-semibold">
                                Assessor Group
                            </label>
                            <Dropdown
                                id="assessorGroupId"
                                value={get(form, 'assessorGroupId')}
                                options={userGroup}
                                optionLabel="assessorGroupName"
                                optionValue="assessorGroupId"
                                onChange={(e) => onInputChange('assessorGroupId', e.value)}
                                placeholder="Select Assessor Group Name"
                                className="w-full mb-1"
                                showClear={!!get(form, 'assessorGroupId')}
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="regionId" className="font-semibold">
                                Region
                            </label>
                            <Dropdown
                                id="regionId"
                                value={get(form, 'regionId')}
                                options={region}
                                optionLabel="regionName"
                                optionValue="regionId"
                                onChange={(e) => onInputChange('regionId', e.value)}
                                placeholder="Select Region"
                                className="w-full mb-1"
                                showClear={!!get(form, 'regionId')}
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="masterCountryId" className="font-semibold">
                                Countries
                            </label>
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
                        </div>
                        <div className="field col-3">
                            <label htmlFor="buId" className="font-semibold">
                                BU
                            </label>
                            <Dropdown
                                id="buId"
                                value={get(form, 'buId')}
                                options={bu}
                                optionLabel="buName"
                                optionValue="buId"
                                onChange={(e) => onInputChange('buId', e.value)}
                                placeholder="Select BU"
                                className="w-full mb-1"
                                showClear={!!get(form, 'buId')}
                            />
                        </div>
                        <div className="field col-3">
                            <label htmlFor="brand" className="font-semibold">
                                Brands
                            </label>
                            <MultiSelect
                                id="brandId"
                                value={get(form, 'brandId')}
                                options={brand}
                                optionLabel="brandName"
                                optionValue="brandId"
                                onChange={(e) => onInputChange('brandId', e.value)}
                                placeholder="Select Brand Name"
                                className="w-full mb-1"
                                showClear={!!get(form, 'brandId')}
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
                <hr />
                <div className="p-card-body">{renderStepContent()}</div>
                <hr />
                {shouldShowMarketingQuestions(form) && (
                    <div className='m-4'>
                        <div>
                            <h3>Maketing Template Questions</h3>
                        </div>
                        <hr />
                        {isLoading ? (
                            <TableSkeletonSimple columns={7} rows={limit} />
                        ) : (
                            <CustomDataTable
                                ref={dataTableRef}
                                page={page}
                                limit={limit}
                                totalRecords={totalRecords}
                                data={questionData}
                                columns={[
                                    {
                                        header: '',
                                        body: (rowData: any, options: any) => (
                                          <Checkbox
                                            checked={checkedRows[rowData.id || options.rowIndex] || false}
                                            onChange={(e) => handleCheckboxChange(rowData.id || options.rowIndex, e.target.checked ?? false)}
                                          />
                                        ),
                                        bodyStyle: { textAlign: 'center', minWidth: 50, maxWidth: 50 },
                                    },
                                      
                                      
                                    {
                                        header: 'SR. NO',
                                        body: (data: any, options: any) => {
                                            const normalizedRowIndex = options.rowIndex % limit;
                                            const srNo = (page - 1) * limit + normalizedRowIndex + 1;

                                            return <span>{srNo}</span>;
                                        },
                                        bodyStyle: { minWidth: 50, maxWidth: 50 }
                                    },
                                    {
                                        header: 'Segment ',
                                        field: 'segment',
                                        bodyStyle: { minWidth: 100, maxWidth: 100 },
                                        headerStyle: dataTableHeaderStyle
                                    },

                                    {
                                        header: 'Question',
                                        field: 'questionDescription',
                                        bodyStyle: { minWidth: 400, maxWidth: 400 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Ratings',
                                        body: (row: any) => `${row.minRating} to ${row.maxRating}`,
                                        bodyStyle: { minWidth: 50, maxWidth: 50 },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Compulsory',
                                        field: 'isCompulsary',
                                        bodyStyle: { minWidth: 50, maxWidth: 50, textAlign: 'center' },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                    {
                                        header: 'Comment if rating <=',
                                        field: 'ratingComment',
                                        bodyStyle: { minWidth: 10, maxWidth: 10, textAlign: 'center' },
                                        headerStyle: dataTableHeaderStyle
                                    },
                                ]}
                                onLoad={(event: any) =>
                                    fetchQuestions(
                                        form.reviewTypeId != null ? [form.reviewTypeId] : [],
                                        form.templateTypeId != null ? [form.templateTypeId] : [],
                                        form.userGroupId != null ? [form.userGroupId] : []
                                    )
                                }
                            />
                        )}
                    </div>
                )}
                <div className="p-card-footer flex justify-content-end px-4 gap-3 py-0 bg-slate-300 shadow-slate-400">
                    <Button label={isEditMode ? 'Update' : 'Submit'} icon="pi pi-check" className="bg-primary-main border-primary-main hover:text-white mb-3" onClick={handleSubmit} />
                </div>
            </div>
        </div>
    );
};

export default ManageSupplierAddEditPage;