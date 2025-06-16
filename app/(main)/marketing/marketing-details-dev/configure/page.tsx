'use client'
import React, { use, useEffect, useRef, useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { MultiSelect } from 'primereact/multiselect';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import { Card } from 'primereact/card';
import { InputTextarea } from 'primereact/inputtextarea';
import { GetCall, PostCall } from '@/app/api-config/ApiKit';
import { buildQueryParams } from '@/utils/utils';
import { useAppContext } from '@/layout/AppWrapper';
import { useRouter } from 'next/navigation';
import CustomVendorDropdown from '@/components/CustomVendorDropdown';

const vendors = [
    {
        vendorId: 1,
        vendorName: 'Vendor A',
        region: 'Region A',
        country: 'Country A',
        brand: 'Brand A',
        bu: 'BU A',
        childVendors: [
            { vendorId: 101, vendorName: 'Child A1', region: 'Region A', country: 'Country A', brand: 'Brand A', bu: 'BU A' },
            { vendorId: 102, vendorName: 'Child A2', region: 'Region A', country: 'Country A', brand: 'Brand A', bu: 'BU A' }
        ]
    },
    {
        vendorId: 2,
        vendorName: 'Vendor B',
        region: 'Region B',
        country: 'Country B',
        brand: 'Brand B',
        bu: 'BU B',
        childVendors: [
            { vendorId: 201, vendorName: 'Child B1', region: 'Region B', country: 'Country B', brand: 'Brand B', bu: 'BU B' },
            { vendorId: 202, vendorName: 'Child B2', region: 'Region B', country: 'Country B', brand: 'Brand B', bu: 'BU B' }
        ]
    },
    {
        vendorId: 3,
        vendorName: 'Vendor C',
        region: 'Region C',
        country: 'Country C',
        brand: 'Brand C',
        bu: 'BU C',
        childVendors: [] // no children
    }
];



const MarketingDetails = () => {
    const { setAlert, setLoading, isLoading } = useAppContext();
    // Dropdown options
    const [evaluationOptions, setEvaluationOptions] = useState([]);
    const [vendorOptions, setVendorOptions] = useState<{ label: string; value: string }[]>([]);
    const [childVendorOptions, setChildVendorOptions] = useState<{ label: string; value: string }[]>([]);
    const [buOptions, setBuOptions] = useState<{ label: string; value: string }[]>([]);
    const [brandOptions, setBrandOptions] = useState<any[]>([]);
    const [statusOptions] = useState([
        { label: 'Active', value: 'Active' },
        { label: 'Inactive', value: 'Inactive' }
    ]);

    // Form state
    const [selectedEval, setSelectedEval] = useState<number | null>(null);
    const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
    const [selectedChildVendor, setSelectedChildVendor] = useState<string | null>('2');
    const [administrator, setAdministrator] = useState<string>('');
    const [selectedBU, setSelectedBU] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

    // Evaluation details
    const [evaluationDetails, setEvaluationDetails] = useState<any>(null);
    const [allTemplateTypes, setAllTemplateTypes] = useState<any[]>([]);
    const [selectedTemplateTypeIds, setSelectedTemplateTypeIds] = useState<number[]>([]);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    // const [selectedVendors, setSelectedVendors] = useState<TreeSelectSelectionKeysType | {}>({});
    const [expandedRows, setExpandedRows] = useState<any>({});
    const [selectedVendors, setSelectedVendors] = useState<any[]>([]);

    // Add question dialog
    const [showAddQuestionDialog, setShowAddQuestionDialog] = useState(false);
    const [selectedTemplateTypeForQuestion, setSelectedTemplateTypeForQuestion] = useState<any>(null);
    const [vendorValue, setVendorValue] = useState<Record<number, boolean>>({});
    const [newQuestion, setNewQuestion] = useState({
        questionTitle: '',
        questionDescription: '',
        minRating: 1,
        maxRating: 10,
        isCompulsary: 'no',
        ratingComment: '',
        segment: '',
        ratio: 0
    });
    const router = useRouter();

    // Load initial dropdown options
    useEffect(() => {
        fetchEvaluations();
        loadStaticOptions();
        fetchBrands();
        fetchBU();
    }, []);

    const fetchEvaluations = async () => {
        try {
            setLoading(true);
            const params = { filters: { combinationId: selectedEval }, pagination: false };
            const queryString = buildQueryParams(params)
            const response = await GetCall(`/mrkt/api/mrkt/all-evaluation-name?${queryString}`);
            if (response.code?.toLowerCase() === 'success') {
                setEvaluationOptions(response.data);
            } else {
                setEvaluationOptions([]);
            }
        } catch (error) {
            console.error('Error loading evaluation options:', error);
        } finally {
            setLoading(false);
        }
    };

   
    const selectedKeys = selectedVendors ? Object.keys(selectedVendors) : [];

    const vendorIdList = selectedKeys
        .filter((id) => id.startsWith('vendor-'))
        .map((id) => parseInt(id.replace('vendor-', '')));

    const childVendorIdList = selectedKeys
        .filter((id) => id.startsWith('child-'))
        .map((id) => parseInt(id.replace('child-', '')));



    console.log(selectedVendors, 'selectedVendors');
    console.log(selectedKeys, 'selectedKeys');


    const rowExpansionTemplate = (vendor: any) => {
        const matchedVendor = selectedVendors.find((v: any) => v.vendorId === vendor.vendorId);
        const selectedChildVendors = matchedVendor?.childVendor || [];

        if (selectedChildVendors.length === 0) return null;

        return (
            <div className="pl-4">
                <DataTable value={selectedChildVendors} className="p-datatable-sm" showHeaders={false}>
                    <Column field="vendorName" />
                    <Column field="region" />
                    <Column field="country" />
                    <Column field="brand" />
                    <Column field="bu" />
                </DataTable>
            </div>
        );
    };




    const loadStaticOptions = async () => {
        try {
            setLoading(true);
            const response = await GetCall(`/mrkt/api/mrkt/vendors`);
            if (response.code?.toLowerCase() === 'success') {
                setVendorOptions(response.data);
            } else {
                setVendorOptions([]);
            }
        } catch (error) {
            console.error('Error loading vendors options:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchBrands = async () => {
        try {
            setLoading(true);
            const response = await GetCall(`/mrkt/api/mrkt/brand`);
            if (response.code?.toLowerCase() === 'success') {
                setBrandOptions(response.data);
            } else {
                setBrandOptions([]);
            }
        } catch (error) {
            console.error('Error loading brand options:', error);
        } finally {
            setLoading(false);
        }
    }



    const fetchBU = async () => {
        try {
            setLoading(true);
            const response = await GetCall(`/mrkt/api/mrkt/marketingBU`);
            if (response.code?.toLowerCase() === 'success') {
                setBuOptions(response.data);
            } else {
                setBuOptions([]);
            }
        } catch (error) {
            console.error('Error loading BU options:', error);
        } finally {
            setLoading(false);
        }
    }

    const fetchEvaluationQuestions = async () => {
        try {
            setLoading(true);

            const params = { filters: { combinationId: selectedEval }, pagination: false };
            const queryString = buildQueryParams(params)
            const response = await GetCall(`/mrkt/api/mrkt/evaluation-combination?${queryString}`);

            if (response.code?.toLowerCase() === 'success') {
                const details = response.data[0];
                setEvaluationDetails(details);

                // Process parent template types
                const parentTemplateTypes = details?.reviewType?.templateTypeMap
                    ?.filter((map: any) => map.templateType)
                    .map((map: any) => ({
                        ...map.templateType,
                        isSelected: true, // Select parent by default
                        isParent: true,
                        marketingquestions: map.templateType.marketingquestions?.map((q: any) => ({
                            ...q,
                            checked: true
                        }))
                    })) || [];

                // Process child template types from templateVersions
                const childTemplateTypes: any[] = [];
                parentTemplateTypes.forEach((parent: any) => {
                    if (parent.templateVersions && parent.templateVersions.length > 0) {
                        parent.templateVersions.forEach((version: any) => {
                            childTemplateTypes.push({
                                ...version,
                                isSelected: false,
                                isParent: false,
                                parentTemplateTypeId: parent.templateTypeId,
                                parentName: parent.templateTypeName,
                                marketingquestions: version.marketingquestions?.map((q: any) => ({
                                    ...q,
                                    checked: true
                                })) || []
                            });
                        });
                    }
                });


                // Combine parent and child templates
                const allTemplateTypes = [...parentTemplateTypes, ...childTemplateTypes];
                setAllTemplateTypes(allTemplateTypes);

                // Select only parent template types by default
                const parentTemplateTypeIds = parentTemplateTypes.map((tt: any) => tt.templateTypeId);
                setSelectedTemplateTypeIds(parentTemplateTypeIds);

                setActiveTabIndex(0);
            }
        } catch (error) {
            console.error('Error loading evaluation details:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedEval) {
            fetchEvaluationQuestions();
        } else {
            setEvaluationDetails(null);
            setAllTemplateTypes([]);
            setSelectedTemplateTypeIds([]);
        }
    }, [selectedEval]);

    // Get only selected template types for display
    const getSelectedTemplateTypes = () => {
        return allTemplateTypes.filter(tt => selectedTemplateTypeIds.includes(tt.templateTypeId));
    };

    // Template type multiselect options
    const getTemplateTypeOptions = () => {
        const options: any[] = [];

        // Group templates by parent
        const parentTemplates = allTemplateTypes.filter(tt => tt.isParent);
        const childTemplates = allTemplateTypes.filter(tt => !tt.isParent);

        parentTemplates.forEach(parent => {
            // Add parent option
            options.push({
                label: parent.templateTypeName,
                value: parent.templateTypeId
            });

            // Add child options for this parent
            const childrenOfParent = childTemplates.filter(child =>
                child.parentTemplateTypeId === parent.templateTypeId
            );

            childrenOfParent.forEach(child => {
                options.push({
                    label: `  └── ${child.templateTypeName}`, // Indented with tree structure
                    value: child.templateTypeId
                });
            });
        });

        return options;
    };

    // const handleTemplateTypeSelectionChange = (selectedIds: number[]) => {
    //     setSelectedTemplateTypeIds(selectedIds);

    //     // Update isSelected property in allTemplateTypes
    //     setAllTemplateTypes(prev => prev.map(tt => ({
    //         ...tt,
    //         isSelected: selectedIds.includes(tt.templateTypeId)
    //     })));

    //     // Reset active tab if current tab is no longer selected
    //     const selectedTemplateTypes = allTemplateTypes.filter(tt => selectedIds.includes(tt.templateTypeId));
    //     if (selectedTemplateTypes.length > 0 && activeTabIndex >= selectedTemplateTypes.length) {
    //         setActiveTabIndex(0);
    //     }
    // };

    const handleTemplateTypeSelectionChange = (selectedIds: number[]) => {
        // Get the previously selected IDs to determine what was just clicked
        const previouslySelected = selectedTemplateTypeIds;

        // Find what was just added or removed
        const added = selectedIds.find(id => !previouslySelected.includes(id));
        const removed = previouslySelected.find(id => !selectedIds.includes(id));

        let finalSelectedIds = [...selectedIds];

        if (added) {
            // Something was just selected
            const addedTemplate = allTemplateTypes.find(tt => tt.templateTypeId === added);

            if (addedTemplate?.isParent) {
                // Parent was selected - remove all its children
                const childrenIds = allTemplateTypes
                    .filter(tt => !tt.isParent && tt.parentTemplateTypeId === added)
                    .map(tt => tt.templateTypeId);

                finalSelectedIds = finalSelectedIds.filter(id => !childrenIds.includes(id));
            } else {
                // Child was selected - remove its parent and siblings
                const childTemplate = allTemplateTypes.find(tt => tt.templateTypeId === added);
                if (childTemplate) {
                    const parentId = childTemplate.parentTemplateTypeId;

                    // Remove parent if it exists in selection
                    finalSelectedIds = finalSelectedIds.filter(id => id !== parentId);

                    // Remove all other children of the same parent
                    const siblingIds = allTemplateTypes
                        .filter(tt => !tt.isParent &&
                            tt.parentTemplateTypeId === parentId &&
                            tt.templateTypeId !== added)
                        .map(tt => tt.templateTypeId);

                    finalSelectedIds = finalSelectedIds.filter(id => !siblingIds.includes(id));
                }
            }
        }

        setSelectedTemplateTypeIds(finalSelectedIds);

        // Update isSelected property in allTemplateTypes
        setAllTemplateTypes(prev => prev.map(tt => ({
            ...tt,
            isSelected: finalSelectedIds.includes(tt.templateTypeId)
        })));

        // Reset active tab if current tab is no longer selected
        const selectedTemplateTypes = allTemplateTypes.filter(tt => finalSelectedIds.includes(tt.templateTypeId));
        if (selectedTemplateTypes.length > 0 && activeTabIndex >= selectedTemplateTypes.length) {
            setActiveTabIndex(0);
        }
    };

    const handleQuestionToggle = (templateTypeId: number, questionId: number) => {
        setAllTemplateTypes(prev => prev.map(template => {
            // Allow toggle for parent templates and duplicates
            if (template.templateTypeId === templateTypeId && (template.isParent || template.isDuplicate)) {
                return {
                    ...template,
                    marketingquestions: template.marketingquestions.map((q: any) =>
                        q.marketingTemplateQuestionId === questionId
                            ? { ...q, checked: !q.checked }
                            : q
                    )
                };
            }
            return template;
        }));
    };

    const handleSegmentToggle = (templateTypeId: number, segment: string) => {
        setAllTemplateTypes(prev => prev.map(template => {
            // Allow toggle for parent templates and duplicates
            if (template.templateTypeId === templateTypeId && (template.isParent || template.isDuplicate)) {
                const segmentQuestions = template.marketingquestions.filter((q: any) => q.segment === segment);
                const allChecked = segmentQuestions.every((q: any) => q.checked);

                return {
                    ...template,
                    marketingquestions: template.marketingquestions.map((q: any) =>
                        q.segment === segment ? { ...q, checked: !allChecked } : q
                    )
                };
            }
            return template;
        }));
    }

    const handleTemplateTypeToggle = (templateTypeId: number) => {
        setAllTemplateTypes(prev => prev.map(template => {
            // Allow toggle for parent templates and duplicates
            if (template.templateTypeId === templateTypeId && (template.isParent || template.isDuplicate)) {
                const allChecked = template.marketingquestions.every((q: any) => q.checked);
                return {
                    ...template,
                    marketingquestions: template.marketingquestions.map((q: any) => ({ ...q, checked: !allChecked }))
                };
            }
            return template;
        }));
    };


    const duplicateTemplateType = (templateType: any) => {
        // Rule: Cannot duplicate original child templates that are not marked as duplicates.
        // This prevents duplicating, for example, a backend-provided 'Agency to Reckitt v1' child
        // unless it's already flagged as a duplicate from a prior local action.
        // This rule seems appropriate based on typical scenarios where you duplicate the 'base' or
        // a template you've already modified (a duplicate).
        if (!templateType.isParent && !templateType.isDuplicate) {
            setAlert('info', 'Cannot duplicate this type of template.');
            return;
        }

        // --- START: Logic to find the highest existing version for this template's lineage ---

        // 1. Identify the ultimate original parent ID of the template being duplicated.
        // If the current template is already a duplicate, its originalTemplateTypeId holds the ID.
        // If it's the parent, its own ID is the originalTemplateTypeId.
        const sourceOriginalParentId = templateType.isDuplicate ? templateType.originalTemplateTypeId : templateType.templateTypeId;

        // 2. Find the actual original parent template object (the one with isParent: true)
        // This is needed to get the clean base name before any ' vX' suffix.
        const originalParent = allTemplateTypes.find(t => t.templateTypeId === sourceOriginalParentId && t.isParent);

        if (!originalParent) {
            // This indicates a data inconsistency if a sourceOriginalParentId exists but the parent object doesn't.
            setAlert('error', 'Could not find the original parent template to determine base name for duplication.');
            return;
        }

        // 3. Determine the base name from the original parent's name.
        // Remove any existing ' vX' suffix from the parent's name just in case.
        const baseName = originalParent.templateTypeName.replace(/\s+v\d+$/, '');


        // 4. Find the highest existing version number among ALL templates in the list
        // that belong to the same original parent lineage (including parent, original children, and duplicates).
        let maxVersion = 0;

        allTemplateTypes.forEach(existingTemplate => {
            let existingTemplateUltimateParentId;

            // Determine the ultimate original parent ID for the template being checked.
            if (existingTemplate.isParent) {
                existingTemplateUltimateParentId = existingTemplate.templateTypeId;
            } else if (existingTemplate.isDuplicate) {
                existingTemplateUltimateParentId = existingTemplate.originalTemplateTypeId;
            } else if (existingTemplate.parentTemplateTypeId === sourceOriginalParentId) {
                // This handles original child versions from the backend that correctly point
                // to the source parent's ID via parentTemplateTypeId.
                existingTemplateUltimateParentId = existingTemplate.parentTemplateTypeId;
            } else {
                // This template is not a parent, not a duplicate, and its parentTemplateTypeId
                // doesn't point to the source original parent. It's unrelated for versioning.
                return; // Skip this template
            }


            // If this existing template belongs to the same lineage as the one being duplicated
            if (existingTemplateUltimateParentId === sourceOriginalParentId) {
                // Check if its name has a vX suffix
                const versionMatch = existingTemplate.templateTypeName.match(/\s+v(\d+)$/);
                if (versionMatch) {
                    const version = parseInt(versionMatch[1]);
                    if (!isNaN(version)) {
                        maxVersion = Math.max(maxVersion, version);
                    }
                }
                // Note: If it's the parent itself and has no vX (maxVersion is 0),
                // the first duplicate correctly becomes v1 (0+1). No need for a special case here.
            }
        });

        // 5. The new duplicate's version number is the highest found + 1
        const newVersionNumber = maxVersion + 1;

        // --- END: Logic to find the highest existing version ---


        const newTemplateTypeId = Date.now() + Math.random(); // Generate a new unique ID for the duplicate

        const duplicatedTemplate: any = {
            ...templateType, // Copy properties from the source template
            templateTypeId: newTemplateTypeId, // Assign the new unique ID
            templateTypeName: `${baseName} v${newVersionNumber}`, // Construct the new name
            // duplicateCount: undefined, // Removed as no longer needed for naming logic
            isDuplicate: true, // Mark this as a duplicate
            isParent: false, // A duplicate is never a parent itself

            // Link the new duplicate back to its origin lineage:
            // parentTemplateTypeId points to the template it was duplicated *from* (could be parent or another duplicate)
            parentTemplateTypeId: templateType.templateTypeId,
            // originalTemplateTypeId points to the ultimate root template (the one with isParent: true)
            originalTemplateTypeId: sourceOriginalParentId,

            isSelected: true, // Automatically select the new duplicate
            // Deep copy questions, assign new IDs, and link to the new templateTypeId
            marketingquestions: templateType.marketingquestions?.map((q: any) => ({
                ...q,
                // Generate a new unique ID for the question in the new template
                marketingTemplateQuestionId: Date.now() + Math.random() + Math.random(), // Added second random for higher uniqueness chance
                templateTypeId: newTemplateTypeId, // Link question to the new template ID
                // Keep existing properties like checked status
            })) || []
        };

        // Update the state: add the new duplicated template to the list
        setAllTemplateTypes(prev => [...prev, duplicatedTemplate]);


        // Add the new template type's ID to the list of selected template types
        // setSelectedTemplateTypeIds(prev => [...prev, newTemplateTypeId]);

        //  to remove parent when duplicating (otherwise uncomment above)
        setSelectedTemplateTypeIds(prev => {
            let updatedIds = [...prev, newTemplateTypeId];
            // Remove the parent template from selection
            updatedIds = updatedIds.filter(id => id !== templateType.templateTypeId);
            return updatedIds;
        });

        setAlert('success', `Template type duplicated as "${duplicatedTemplate.templateTypeName}"`);
    };

    const openAddQuestionDialog = (templateType: any) => {
        if (!templateType.isDuplicate) {
            setAlert('info', 'Questions can only be added to duplicate template types');
            return;
        }

        setSelectedTemplateTypeForQuestion(templateType);
        setNewQuestion({
            questionTitle: '',
            questionDescription: '',
            minRating: 1,
            maxRating: 10,
            isCompulsary: 'no',
            ratingComment: '',
            segment: '',
            ratio: 0
        });
        setShowAddQuestionDialog(true);
    };

    const addNewQuestion = async () => {
        if (!selectedTemplateTypeForQuestion || !newQuestion.questionTitle.trim()) {
            setAlert('info', 'Please select a template type and enter a question title');
            return;
        }

        const question: any = {
            ...newQuestion,
            marketingTemplateQuestionId: Date.now() + Math.random(),
            reviewTypeId: evaluationDetails?.reviewTypeId,
            templateTypeId: selectedTemplateTypeForQuestion.templateTypeId,
            userGroupId: selectedTemplateTypeForQuestion.userGroup?.userGroupId,
            checked: true
        };

        setAllTemplateTypes(prev => prev.map(template =>
            template.templateTypeId === selectedTemplateTypeForQuestion.templateTypeId
                ? { ...template, marketingquestions: [...template.marketingquestions, question] }
                : template
        ));

        setAlert('success', 'Question mapped to the template type successfully');
        setShowAddQuestionDialog(false)
    };

    const handleFinalSave = async () => {
        if (!selectedEval || !selectedVendor || !administrator || !selectedBU || !selectedStatus || !selectedBrand) {
            setAlert('info', 'Please fill in all required fields');
            return;
        }

        // const selectedTemplateTypes = getSelectedTemplateTypes();

        const selectedTemplateTypes = allTemplateTypes.filter(template =>
            selectedTemplateTypeIds.includes(template.templateTypeId)
        );

        const duplicateTemplateTypes = selectedTemplateTypes.filter(template => template.isDuplicate);

        // if (duplicateTemplateTypes.length === 0) {
        //     setAlert('info', 'Please create and configure at least one duplicate template type');
        //     return;
        // }

        const checkedQuestions = selectedTemplateTypes.flatMap(template =>
            template.marketingquestions.filter((q: any) => q.checked)
        );

        if (checkedQuestions.length === 0) {
            setAlert('info', 'Please select at least one question from the template types');
            return;
        }


        // setLoading(true);

        const payload = {
            combinationId: selectedEval,
            vendors: [
                ...vendorIdList.map((id) => ({ vendorId: id })),
                ...childVendorIdList.map((id) => ({ vendorId: id }))
            ],
            vendorId: selectedVendor,
            vendorChildId: selectedChildVendor,
            selectedVendors: selectedVendors,
            administrator,
            buId: selectedBU,
            status: selectedStatus,
            brandId: selectedBrand,
            reviewTypeId: evaluationDetails?.reviewTypeId,
            userGroupId: evaluationDetails?.reviewType?.templateTypeMap[0]?.templateType?.userGroup?.userGroupId,
            templateTypes: selectedTemplateTypes.map(template => ({
                templateTypeId: template.templateTypeId,
                templateTypeName: template.templateTypeName,
                isDuplicate: template.isDuplicate ? true : false,
                originalTemplateTypeId: template.originalTemplateTypeId,
                questions: template.marketingquestions
                    .filter((q: any) => q.checked)
                    .map((q: any) => ({
                        marketingTemplateQuestionId: q.marketingTemplateQuestionId,
                        questionTitle: q.questionTitle,
                        questionDescription: q.questionDescription,
                        minRating: q.minRating,
                        maxRating: q.maxRating,
                        isCompulsary: q.isCompulsary,
                        segment: q.segment,
                        ratio: q.ratio
                    }))
            }))
        };

        console.log(payload);
        

        // try {
        //     const response = await PostCall(`/mrkt/api/mrkt/evaluation-details`, payload)

        //     if (response.code?.toLowerCase() === 'success') {
        //         fetchEvaluationQuestions();
        //         setAlert('success', 'Final review configuration saved successfully!');
        //         router.push('/marketing-details-dev');
        //     } else {
        //         setAlert('error', `Error saving configuration: ${response.message || 'Unknown error'}`);
        //     }
        // } catch (error) {
        //     setAlert('error', 'Something went wrong!');
        // } finally {
        //     setLoading(false)
        // }

    };

    const renderQuestionsForTemplateType = (templateType: any) => {
        // Group questions by segment
        const questionsBySegment: any = {};
        templateType.marketingquestions?.forEach((q: any) => {
            const segment = q.segment || 'Uncategorized';
            if (!questionsBySegment[segment]) {
                questionsBySegment[segment] = [];
            }
            questionsBySegment[segment].push(q);
        });

        const allChecked = templateType.marketingquestions?.every((q: any) => q.checked);
        const isDisabled = !templateType.isDuplicate && templateType.isParent; // Disable for child templates that are not duplicates
        const canDuplicate = templateType.isParent && !templateType.isDuplicate; // Only parent can be duplicated
        const canAddQuestion = templateType.isDuplicate; // Only duplicates can have questions added

        return (
            <div className="">
                <div className="flex justify-content-between align-items-center mb-4">
                    <div className="flex align-items-center">
                        <input
                            type="checkbox"
                            checked={allChecked}
                            onChange={() => handleTemplateTypeToggle(templateType.templateTypeId)}
                            className="mr-2"
                            disabled={isDisabled}
                        />
                        <span className="font-bold">Select All Questions</span>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            label="Duplicate"
                            icon="pi pi-copy"
                            size="small"
                            onClick={() => duplicateTemplateType(templateType)}
                            disabled={!canDuplicate}
                            tooltip={!canDuplicate ? "Only parent templates can be duplicated" : ""}
                            tooltipOptions={{ showOnDisabled: true, position: 'top' }}
                        />
                        <Button
                            label="Add Question"
                            icon="pi pi-plus"
                            size="small"
                            onClick={() => openAddQuestionDialog(templateType)}
                            disabled={!canAddQuestion}
                            tooltip={!canAddQuestion ? "Questions can only be added to duplicate templates" : ""}
                            tooltipOptions={{ showOnDisabled: true, position: 'top' }}
                        />
                    </div>
                </div>

                <Card className="mb-4">
                    {Object.entries(questionsBySegment)?.map(([segment, questions]: any) => {
                        const allSegmentChecked = questions?.every((q: any) => q.checked);

                        return (
                            <div key={segment} className="mb-4">
                                <div className="flex align-items-center mb-2">
                                    <input
                                        type="checkbox"
                                        checked={allSegmentChecked}
                                        onChange={() => handleSegmentToggle(templateType.templateTypeId, segment)}
                                        className="mr-3"
                                        disabled={isDisabled}
                                    />
                                    <h5 className="m-0 py-2">{segment}</h5>
                                </div>

                                <DataTable
                                    value={questions}
                                    size="small"
                                    stripedRows
                                    className="text-sm marketing-details-table"
                                >
                                    <Column
                                        header=""
                                        style={{ width: '3rem' }}
                                        body={(question) => (
                                            <input
                                                type="checkbox"
                                                checked={question.checked || false}
                                                onChange={() => handleQuestionToggle(templateType.templateTypeId, question.marketingTemplateQuestionId)}
                                                disabled={isDisabled}
                                            />
                                        )}
                                    />
                                    <Column
                                        header="#"
                                        style={{ width: '3rem' }}
                                        body={(question, options) => options.rowIndex + 1}
                                    />
                                    <Column
                                        field="questionTitle"
                                        header="TITLE"
                                    />
                                    <Column
                                        field="minRating"
                                        header="MIN RATING"
                                        style={{ width: '8rem' }}
                                    />
                                    <Column
                                        field="maxRating"
                                        header="MAX RATING"
                                        style={{ width: '8rem' }}
                                    />
                                    <Column
                                        header="CLIENT SELF"
                                        style={{ width: '8rem' }}
                                        body={(question) => question.isCompulsary === 'yes' ? 'Yes' : 'No'}
                                    />
                                </DataTable>
                            </div>
                        );
                    })}
                </Card>
            </div>
        );
    };

    return (
        <>
            <div className="card">
                <div className="flex justify-content-between align-items-center mb-2">
                    <h2 className="text-xl font-semibold">Final Review Configuration</h2>
                </div>
             
                <hr className="my-4" />
                <div className="grid formgrid gap-3 mb-4 uniform-placeholders">
                    <div className="flex row col-12">
                        <div className="col-4">
                            <label>Evaluation Name</label>
                            <Dropdown
                                value={selectedEval}
                                options={evaluationOptions}
                                onChange={(e) => setSelectedEval(e.value)}
                                optionLabel="label"
                                optionValue="combinationId"
                                placeholder="Select Evaluation"
                                className="w-full mt-2"
                                filter
                            // loading={loading}
                            />
                        </div>
                        <div className="col-4">
                            <label>Vendor</label>
                            <MultiSelect
                                value={selectedVendor}
                                options={vendorOptions}
                                onChange={(e) => setSelectedVendor(e.value)}
                                placeholder="Select Vendor"
                                optionLabel="vendorName"
                                optionValue="vendorId"
                                className="w-full mt-2"
                                filter
                            />
                        </div>
                        <div className="col-4">
                            <label>Child Vendor (Optional)</label>
                            <Dropdown
                                value={selectedChildVendor}
                                options={childVendorOptions}
                                onChange={(e) => setSelectedChildVendor(e.value)}
                                placeholder="Select Child Vendor"
                                className="w-full mt-2"
                                disabled={!selectedVendor || childVendorOptions.length === 0}
                                filter
                            />
                        </div>
                    </div>
                    <div className="flex row col-12">
                        <div className="col-4">
                            <label>Administrator</label>
                            <InputText
                                value={administrator}
                                onChange={(e) => setAdministrator(e.target.value)}
                                placeholder="Enter Administrator"
                                className="w-full mt-2"
                            />
                        </div>
                        <div className="col-4">
                            <label>BU</label>
                            <Dropdown
                                value={selectedBU}
                                options={buOptions}
                                onChange={(e) => setSelectedBU(e.value)}
                                placeholder="Select BU"
                                className="w-full mt-2"
                                optionLabel="buName"
                                optionValue="buId"
                                filter
                            />
                        </div>
                        <div className="col-4">
                            <label>Status</label>
                            <Dropdown
                                value={selectedStatus}
                                options={statusOptions}
                                onChange={(e) => setSelectedStatus(e.value)}
                                placeholder="Select Status"
                                className="w-full mt-2"
                            />
                        </div>
                    </div>

                    <div className="flex row col-12">
                        <div className="col-4">
                            <label>Brand</label>
                            <Dropdown
                                value={selectedBrand}
                                options={brandOptions}
                                onChange={(e) => setSelectedBrand(e.value)}
                                optionLabel="brandName"
                                optionValue="brandId"
                                placeholder="Select Brand"
                                className="w-full mt-2 "
                                filter
                            />
                        </div>
                        <div className="col-4 md:col-4">
                            {/* <label>Vendors/child Vendors</label> */}
                            <CustomVendorDropdown
                                options={vendors}
                                value={vendorValue}
                                onChange={(structured, updatedValue) => {
                                    setSelectedVendors(structured);
                                    setVendorValue(updatedValue); // <-- update checkbox state
                                }}
                                placeholder="Select Vendor"
                                label="Vendors/child Vendors"
                            />
                        </div>
                    </div>
                </div>
                {selectedVendors && Object.keys(selectedVendors).length > 0 && (
                    <div className="card mt-4">
                        <h5 className="mb-3">Selected Vendors & Child Vendors</h5>
                        <DataTable
                            value={selectedVendors}
                            expandedRows={expandedRows}
                            onRowToggle={(e) => setExpandedRows(e.data)}
                            rowExpansionTemplate={rowExpansionTemplate}
                            dataKey="vendorId"
                            className="p-datatable-sm custom-bordered-datatable"
                        >
                            <Column expander style={{ width: '1rem' }} />
                            {/* <Column field="vendorId" header="Vendor ID" className='w-1'/> */}
                            <Column field="vendorName" header="Vendor Name" className='w-2' />
                            <Column field="region" header="Region" />
                            <Column field="country" header="Country" />
                            <Column field="brand" header="Brand" />
                            <Column field="bu" header="BU" />
                        </DataTable>
                    </div>
                )}
                {/* Template Type Selection */}
                {evaluationDetails && allTemplateTypes.length > 0 && (
                    <><hr className="my-4" />
                        <div className="mb-4">
                            <label>Select Template Types</label>
                            <MultiSelect
                                value={selectedTemplateTypeIds}
                                options={getTemplateTypeOptions()}
                                onChange={(e) => handleTemplateTypeSelectionChange(e.value)}
                                placeholder="Select Template Types"
                                className="w-full mt-2"
                                display="chip"
                                filter
                            />
                        </div>
                        <hr className="my-4" />
                    </>
                )}


                {evaluationDetails && getSelectedTemplateTypes().length > 0 ? (
                    <div className="mt-4">
                        <div className="flex justify-content-between align-items-center mb-3">
                            <h3>Available Questions</h3>
                            <div className="text-sm text-600">
                                Review Type: <strong>{evaluationDetails.reviewType.reviewTypeName}</strong> |
                                Country: <strong>{evaluationDetails.country.countryName}</strong>
                            </div>
                        </div>
                        <div className='card details-card'>

                            <TabView
                                activeIndex={activeTabIndex}
                                onTabChange={(e) => setActiveTabIndex(e.index)}
                                className="pill-tabview"
                            >
                                {getSelectedTemplateTypes().map((templateType) => (
                                    <TabPanel
                                        key={templateType.templateTypeId}
                                        header={`${templateType.templateTypeName}`}
                                    >
                                        {renderQuestionsForTemplateType(templateType)}
                                    </TabPanel>
                                ))}
                            </TabView>
                        </div>

                        <div className="mt-4 text-center flex justify-content-end">
                            <Button
                                label="Map Configuration"
                                icon="pi pi-save"
                                // size="large"
                                onClick={handleFinalSave}
                                loading={isLoading}
                            />
                        </div>
                    </div>
                ) :

                    <p className='card font-light'>No details available to map for currrent evaluation</p>}

                {/* Add Question Dialog */}
                <Dialog
                    visible={showAddQuestionDialog}
                    style={{ width: '50vw' }}
                    header="Add New Question"
                    modal
                    onHide={() => setShowAddQuestionDialog(false)}
                >
                    <div className="grid formgrid p-4">
                        <div className="field col-12">
                            <label>Question Title *</label>
                            <InputText
                                value={newQuestion.questionTitle}
                                onChange={(e) => setNewQuestion(prev => ({ ...prev, questionTitle: e.target.value }))}
                                className="w-full"
                            />
                        </div>
                        <div className="field col-12">
                            <label>Question Description</label>
                            <InputTextarea
                                value={newQuestion.questionDescription}
                                onChange={(e) => setNewQuestion(prev => ({ ...prev, questionDescription: e.target.value }))}
                                className="w-full"
                                rows={3}
                            />
                        </div>
                        <div className="field col-6">
                            <label>Segment</label>
                            <InputText
                                value={newQuestion.segment}
                                onChange={(e) => setNewQuestion(prev => ({ ...prev, segment: e.target.value }))}
                                className="w-full"
                            />
                        </div>
                        <div className="field col-6">
                            <label>Ratio</label>
                            <InputText
                                type="number"
                                value={newQuestion.ratio.toString()}
                                onChange={(e) => setNewQuestion(prev => ({ ...prev, ratio: parseInt(e.target.value) || 0 }))}
                                className="w-full"
                            />
                        </div>
                        <div className="field col-6">
                            <label>Min Rating</label>
                            <InputText
                                type="number"
                                value={newQuestion.minRating.toString()}
                                onChange={(e) => setNewQuestion(prev => ({ ...prev, minRating: parseInt(e.target.value) || 1 }))}
                                className="w-full"
                            />
                        </div>
                        <div className="field col-6">
                            <label>Max Rating</label>
                            <InputText
                                type="number"
                                value={newQuestion.maxRating.toString()}
                                onChange={(e) => setNewQuestion(prev => ({ ...prev, maxRating: parseInt(e.target.value) || 10 }))}
                                className="w-full"
                            />
                        </div>
                        <div className="field col-6">
                            <label>Comment</label>
                            <InputText
                                value={newQuestion.ratingComment.toString()}
                                onChange={(e) => setNewQuestion(prev => ({ ...prev, ratingComment: e.target.value }))}
                                className="w-full"
                            />
                        </div>
                        <div className="field col-12">
                            <label>Is Compulsory</label>
                            <Dropdown
                                value={newQuestion.isCompulsary}
                                options={[
                                    { label: 'Yes', value: 'yes' },
                                    { label: 'No', value: 'no' }
                                ]}
                                onChange={(e) => setNewQuestion(prev => ({ ...prev, isCompulsary: e.value }))}
                                className="w-full"
                            />
                        </div>
                    </div>
                    <div className="flex justify-content-end gap-2 p-4">
                        <Button label="Cancel" onClick={() => setShowAddQuestionDialog(false)} />
                        <Button label="Add Question" onClick={addNewQuestion} />
                    </div>
                </Dialog>
            </div>
        </>
    );
};

export default MarketingDetails;