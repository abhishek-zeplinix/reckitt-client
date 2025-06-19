'use client';
import React, { useEffect, useState, useMemo, useRef, useContext } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { DeleteCall, GetCall } from '@/app/api-config/ApiKit';
import { useAppContext } from '@/layout/AppWrapper';
import { buildQueryParams, getRowLimitWithScreenHeight } from '@/utils/utils';
import CustomDataTable from '@/components/CustomDataTable';
import { Tag } from 'primereact/tag';
import { LayoutContext } from '@/layout/context/layoutcontext';
import { useRouter } from 'next/navigation';
import { Dropdown } from 'primereact/dropdown';
import { TabPanel, TabView } from 'primereact/tabview';
import { InputText } from 'primereact/inputtext';
import ImportExportButton from '@/components/buttons/import-export';
import Breadcrumbs from '@/components/breadcrumbs/breadcrumbs';
import ReusableFileUploadDialog from '@/components/dialog-box/file-upload-dialog';
 
const ACTIONS = {
    ADD: 'add',
    EDIT: 'edit',
    VIEW: 'view',
    DELETE: 'delete'
};
 
const MarketingQuestionsTable = () => {
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(getRowLimitWithScreenHeight());
    const [accounts, setAccounts] = useState([]);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [isDeleteDialogVisible, setIsDeleteDialogVisible] = useState(false);
    const [selectedAccountForDelete, setSelectedAccountForDelete] = useState<any>(null);
    const [isQuestionsDialogVisible, setIsQuestionsDialogVisible] = useState(false);
    const [togglePanel, setTogglePanel] = useState(false)
    const { setAlert, setLoading, isLoading, } = useAppContext();
    const router = useRouter();
    const [totalRecords, setTotalRecords] = useState(0);
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [searchText, setSearchText] = useState('');
    const { layoutState } = useContext(LayoutContext);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const [savedCombos, setSavedCombos] = useState<any[]>([]);
    const [showFileUploadDialog, setShowFileUploadDialog] = useState(false)
    //filters
    const [filters, setFilters] = useState<any>({
        masterCountryId: null,
        brandId: null,
        status: null
    });
    const [countryOptions, setCountryOptions] = useState<any>([]);
    const [brandOptions, setBrandOptions] = useState<any>([]);
    const STORAGE_KEYS = {
    MARKETING_TEMPLATE_QUESTIONS: 'marketingTemplateQuestions',
    FINAL_REVIEW_DATA: 'finalReviewData'
};

const DUMMY_COMBOS = [
  {
    evaluation: "Reckitt to Agency",
    vendor: "Media - TV",
    childVendor: "Nutrition",
    country: "India",
    bu: "original",
    questions: [{
        segment: "Segment 1",
        questionTitle: "Question 1",
        questionDescription: "Description 1",
        templateType: "Template Type 1",
        reviewType: "Review Type 1",
        minRating: "Min Rating 1",
        maxRating: "Max Rating 1",
        isCompulsary: "Is Compulsary 1",
        ratio: "Ratio 1"
    },
    {
        segment: "Segment 2",
        questionTitle: "Question 2",
        questionDescription: "Description 2",
        templateType: "Template Type 2",
        reviewType: "Review Type 2",
        minRating: "Min Rating 2",
        maxRating: "Max Rating 2",
        isCompulsary: "Is Compulsary 2",
        ratio: "Ratio 2"
    }],
  },
  {
    evaluation: "Agency to Reckitt",
    vendor: "Creative - CMM/BM",
    childVendor: "Reckitt",
    country: "UK",
    bu: "original",
    questions: [{
        segment: "Segment 1",
        questionTitle: "Question 1",
        questionDescription: "Description 1",
        templateType: "Template Type 1",
        reviewType: "Review Type 1",
        minRating: "Min Rating 1",
        maxRating: "Max Rating 1",
        isCompulsary: "Is Compulsary 1",
        ratio: "Ratio 1"
    },{
        segment: "Segment 2",
        questionTitle: "Question 2",
        questionDescription: "Description 2",
        templateType: "Template Type 2",
        reviewType: "Review Type 2",
        minRating: "Min Rating 2",
        maxRating: "Max Rating 2",
        isCompulsary: "Is Compulsary 2",
        ratio: "Ratio 2"
    }],
  },
  {
    evaluation: "Reckitt to Agency",
    vendor: "Media - TV",
    childVendor: "Nutrition",
    country: "India",
    bu: "original",
    questions: [
      {
        id: "q1",
        questionTitle: "Brand Visibility",
        questionDescription: "Evaluate how well the brand is visible in campaigns.",
        minRating: 1,
        maxRating: 5,
        isCompulsary: "yes",
        ratingComment: "",
        ratio: 10,
        segment: "Marketing"
      }
    ]
  },
  {
    evaluation: "Agency to Reckitt",
    vendor: "Creative - CMM/BM",
    childVendor: "Reckitt",
    country: "UK",
    bu: "original",
    questions: [
      {
        id: "q2",
        questionTitle: "Brief Clarity",
        questionDescription: "Was the brief clear and actionable?",
        minRating: 1,
        maxRating: 5,
        isCompulsary: "yes",
        ratingComment: "",
        ratio: 8,
        segment: "Communication"
      },
      {
        id: "q3",
        questionTitle: "Timely Feedback",
        questionDescription: "Was feedback given on time?",
        minRating: 1,
        maxRating: 5,
        isCompulsary: "no",
        ratingComment: "",
        ratio: 5,
        segment: "Process"
      }
    ]
  },
  {
    evaluation: "Reckitt to Agency",
    vendor: "Media - Digital",
    childVendor: "Health",
    country: "India",
    bu: "original",
    questions: [
      {
        id: "q4",
        questionTitle: "Digital Spend ROI",
        questionDescription: "Was the ROI tracked and efficient?",
        minRating: 1,
        maxRating: 5,
        isCompulsary: "yes",
        ratingComment: "",
        ratio: 12,
        segment: "Media"
      }
    ]
  },
  {
    evaluation: "Agency to Reckitt",
    vendor: "Creative - PRO",
    childVendor: "Dettol",
    country: "Singapore",
    bu: "original",
    questions: [
      {
        id: "q5",
        questionTitle: "Creative Consistency",
        questionDescription: "Were creatives aligned with brand guidelines?",
        minRating: 1,
        maxRating: 5,
        isCompulsary: "no",
        ratingComment: "",
        ratio: 7,
        segment: "Creative"
      }
    ]
  },
  {
    evaluation: "Reckitt to Agency",
    vendor: "Media - Strategy",
    childVendor: "Hygiene",
    country: "India",
    bu: "original",
    questions: [
      {
        id: "q6",
        questionTitle: "Strategic Clarity",
        questionDescription: "Was the media strategy clearly communicated?",
        minRating: 1,
        maxRating: 5,
        isCompulsary: "yes",
        ratingComment: "",
        ratio: 9,
        segment: "Strategy"
      }
    ]
  }
];


 
    useEffect(() => {
        setPage(1);
        const params = {
           
            page: 1,
            limit,
            ...(filters.brandId && { 'filters.brandId': filters.brandId }),
            ...(filters.masterCountryId && { 'filters.countryId': filters.masterCountryId }),
            ...(filters.status && { 'filters.status': filters.status }),
            searchText: searchText ? searchText.trim().toLowerCase() : ''
        };
        // fetchData(params);
    }, [filters, searchText]);

        useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEYS.FINAL_REVIEW_DATA);

    const parsedData = savedData ? JSON.parse(savedData) : [];

    // Merge only if dummy entries are not already present (optional deduplication logic can be added)
    const combinedData = Array.isArray(parsedData)
        ? [...parsedData, ...DUMMY_COMBOS]
        : [...DUMMY_COMBOS];

    // Save the merged data
    localStorage.setItem(STORAGE_KEYS.FINAL_REVIEW_DATA, JSON.stringify(combinedData));
    setSavedCombos(combinedData);
}, []);

console.log(savedCombos, 'savedCombos');

    const handleCreateNavigation = () => {
        router.push('marketing-details-dev/configure');
    };
 
 
    const openDeleteDialog = (account: any) => {
        setSelectedAccountForDelete(account);
        setIsDeleteDialogVisible(true);
    };
 
    const closeDeleteDialog = () => {
        // setIsDeleteDialogVisible(false);
        setSelectedAccountForDelete(null);
    };
 
    const closeQuestionsDialog = () => {
        setIsQuestionsDialogVisible(false);
        setSelectedAccount(null);
        setActiveTabIndex(0);
    };
 
    const onRowSelect = async (account: any, action: any) => {
        if (action === ACTIONS.DELETE) {
            openDeleteDialog(account);
        }
 
        if (action === ACTIONS.EDIT) {
            router.push(`marketing/marketing-details-dev/configure?evaluationAccountId=${account.evaluationAccountId}&edit=true`);
        }
 
        if (action === ACTIONS.VIEW) {
            setSelectedAccount(account);
            setIsQuestionsDialogVisible(true);
            setActiveTabIndex(0);
        }
    };
 
    const handleTogglePanel = () => {
        setTogglePanel((prev) => !prev)
    }
 
    const getSelectedTemplateTypes = () => {
        if (!selectedAccount?.accountMappedTemplate) return [];
        return selectedAccount.accountMappedTemplate.map((template: any) => template.templateType);
    };
 
    const renderQuestionsForTemplateType = (templateType: any) => {
        const questions = templateType.marketingquestions || [];
 
        const filteredQuestions = questions.filter((q: any) =>
            !searchText ||
            q.questionTitle?.toLowerCase().includes(searchText.toLowerCase()) ||
            q.segment?.toLowerCase().includes(searchText.toLowerCase())
        );
 
        return (
            <CustomDataTable
                page={1}
                limit={50}
                totalRecords={filteredQuestions.length}
                isView={false}
                isEdit={true}
                isDelete={true}
                data={filteredQuestions}
                columns={[
                    {
                        header: '#',
                        body: (data: any, options: any) => <span>{options.rowIndex + 1}</span>,
                        bodyStyle: { minWidth: 60, maxWidth: 60 }
                    },
                    {
                        header: 'Segment',
                        field: 'segment',
                        bodyStyle: { minWidth: 150, maxWidth: 200 }
                    },
                    {
                        header: 'Question Title',
                        field: 'questionTitle',
                        bodyStyle: { minWidth: 200, maxWidth: 300 }
                    },
                    {
                        header: 'Template Type',
                        body: () => templateType.templateTypeName,
                        bodyStyle: { minWidth: 150, maxWidth: 200 }
                    },
                    {
                        header: 'Review Type',
                        field: 'reviewTypeId',
                        bodyStyle: { minWidth: 120, maxWidth: 150 }
                    },
                    {
                        header: 'Min Rating',
                        field: 'minRating',
                        bodyStyle: { minWidth: 80, maxWidth: 100 }
                    },
                    {
                        header: 'Max Rating',
                        field: 'maxRating',
                        bodyStyle: { minWidth: 80, maxWidth: 100 }
                    },
                    {
                        header: 'Is Compulsory',
                        body: (data: any) => (
                            <Tag
                                value={data.isCompulsary}
                                severity={data.isCompulsary?.toLowerCase() === 'yes' ? 'success' : 'warning'}
                            />
                        ),
                        bodyStyle: { minWidth: 100, maxWidth: 120 }
                    },
                    {
                        header: 'Ratio',
                        field: 'ratio',
                        bodyStyle: { minWidth: 70, maxWidth: 90 }
                    }
                ]}
                onLoad={() => { }}
            />
        );
    };
    return (
        <div className='card'>
            <div className='inner p-4 border-1 surface-border border-round'>
                <div className="flex flex-wrap justify-content-between align-items-center mb-2">
                <div className="flex flex-column">
                        <h2 className="m-0">Question Base</h2>
                        <p className="text-sm text-gray-600 mt-1"><Breadcrumbs /></p>
                    </div>
                <div className="flex flex-wrap gap-3">
                    <ImportExportButton
                            label='Import'
                            icon="pi pi-upload"
                            onClick={() => setShowFileUploadDialog(true)}
                        />
                        <ImportExportButton
                            label='Export'
                            icon="pi pi-download"
                            onClick={handleTogglePanel}
                        />
                    <Button
                        label="Add New"
                        icon="pi pi-plus"
                        onClick={handleCreateNavigation}
                    />
                </div>
            </div>
 
            <div className="flex gap-2 justify-content-between align-items-center mt-3">
            
                                <div className='flex gap-2'>
                                    <Dropdown
                                        placeholder="Filter"
                                        className="w-10rem"
                                        showClear
                                    />
                                    <Dropdown
                                        placeholder="Filter"
                                        className="w-10rem"
                                        showClear
                                    />
            
                                    <Dropdown
                                        placeholder="Filter"
                                        className="w-10rem"
                                        showClear
                                    />
                                </div>
            
                                <div className='flex'>
                                    <span className="p-input-icon-left">
                                        <i className="pi pi-search" />
                                        <InputText
                                            value={searchText}
                                            onChange={(e) => setSearchText(e.target.value)}
                                            placeholder="Search"
                                            className="w-full"
                                        />
                                    </span>
                                </div>
            
                            </div>
            <CustomDataTable
                page={page}
                limit={limit}
                totalRecords={totalRecords}
                // isView={true}
                isEdit={true}
                isDelete={true}
                data={savedCombos}
                extraButtons={(item: any) => [
                    {
                        icon: 'pi pi-copy',
                        tooltip: 'Copy',
                        // onClick: () => onRowSelect(item, ACTIONS.EDIT)
                    },
                ]}
                columns={[
                    {
                        header: '#',
                        body: (data: any, options: any) => {
                            const normalizedRowIndex = options.rowIndex % limit;
                            const srNo = (page - 1) * limit + normalizedRowIndex + 1;
                            return <span>{srNo}</span>;
                        },
                        bodyStyle: { minWidth: 60, maxWidth: 60 }
                    },
                    {
                        header: 'Review Type',
                        field: 'evaluation',
                        filter: true,
                        bodyStyle: { minWidth: 150, maxWidth: 200 },
                        filterPlaceholder: 'Review Type'
                    },
                    {
                        header: 'Evaluation Type',
                        field: 'vendor',
                        bodyStyle: { minWidth: 200, maxWidth: 250 }
                    },
                    {
                        header: 'BU',
                        field: 'childVendor',
                        bodyStyle: { minWidth: 120, maxWidth: 150 }
                    },
                    {
                        header: 'Country',
                        field: 'country',
                        bodyStyle: { minWidth: 100, maxWidth: 120 }
                    },
                    {
                        header: 'Version',
                        field: 'bu',
                        bodyStyle: { minWidth: 100, maxWidth: 120 }
                    }
                ]}
                // onLoad={(params: any) => fetchData(params)}
                // onDelete={(item: any) => onRowSelect(item, ACTIONS.DELETE)}
                // onEdit={(item: any) => onRowSelect(item, ACTIONS.EDIT)}
                onView={(item: any) => onRowSelect(item, ACTIONS.VIEW)}
            />
 
            <Dialog
                header="Delete confirmation"
                visible={isDeleteDialogVisible}
                style={{ width: layoutState?.isMobile ? '90vw' : '50vw' }}
                className="delete-dialog"
                footer={
                    <div className="flex justify-content-center p-2">
                        <Button
                            label="Cancel"
                            style={{ color: '#DF1740' }}
                            className="px-7"
                            text
                            onClick={closeDeleteDialog}
                        />
                        <Button
                            label="Delete"
                            style={{ backgroundColor: '#DF1740', border: 'none' }}
                            className="px-7 hover:text-white"
                            // onClick={() => }
                            loading={isLoading}
                        />
                    </div>
                }
                onHide={closeDeleteDialog}
            >
                <div className="flex flex-column w-full surface-border p-2 text-center gap-4">
                    <i className="pi pi-info-circle text-6xl" style={{ marginRight: 10, color: '#DF1740' }}></i>
                    <div className="flex flex-column align-items-center gap-1">
                        <span>Are you sure you want to delete this Account? </span>
                        <span>This action cannot be undone. </span>
                    </div>
                </div>
            </Dialog>
            </div>
 
            <Dialog
                header="Account Template Questions"
                visible={isQuestionsDialogVisible}
                style={{ width: '95vw', maxHeight: '90vh' }}
                maximizable
                onHide={closeQuestionsDialog}
            >
                <div>
                    {selectedAccount && (
                        <>
                            <TabView
                                activeIndex={activeTabIndex}
                                onTabChange={(e) => setActiveTabIndex(e.index)}
                                className="pill-tabview"
                            >
 
                                {getSelectedTemplateTypes().map((templateType: any, index: any) => (
                                    <TabPanel
                                        key={templateType.templateTypeId}
                                        header={templateType.templateTypeName}
                                    >
                                        <hr className='-mt-2' />
                                        <div className="mb-3">
                                            <span className="p-input-icon-left">
                                                <i className="pi pi-search" />
                                                <InputText
                                                    value={searchText}
                                                    onChange={(e) => setSearchText(e.target.value)}
                                                    placeholder="Search questions..."
                                                    className="w-full"
                                                />
                                            </span>
                                        </div>
 
                                        {renderQuestionsForTemplateType(templateType)}
                                    </TabPanel>
                                ))}
                            </TabView>
 
                            {getSelectedTemplateTypes().length === 0 && (
                                <div className="text-center p-4">
                                    <p>No template types found for this account.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </Dialog>
             {showFileUploadDialog && (
                <ReusableFileUploadDialog
                    visible={showFileUploadDialog}
                    // These props would be dynamically set based on which "upload" button was clicked,
                    // or which master data type the user intends to upload.
                    header={'Upload Bulk Area List'}
                    uploadContextLabel="This is Context Label"
                    demoFileLink="Link"
                    demoFileLabel="Download sample Template"
                    apiEndpoint="/mrkt/api/mrkt/bulkuploadmaster"
                    maxFileSizeInBytes={1 * 1024 * 1024} // 1MB
                    acceptedFileExtensions={['xlsx', 'xls', 'xlsm']}

                    onHideDialog={() => setShowFileUploadDialog(false)}
                    // onUploadSuccess={handleDialogUploadSuccess}
                    onUploadSuccess={() => setShowFileUploadDialog(false)}
                />
            )}
        </div>
        
    );
};
 
export default MarketingQuestionsTable;