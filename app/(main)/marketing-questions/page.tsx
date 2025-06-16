// 'use client';
// import React, { useEffect, useState, useMemo, useRef } from 'react';
// import { DataTable } from 'primereact/datatable';
// import { Column } from 'primereact/column';
// import { Button } from 'primereact/button';
// import { Dropdown } from 'primereact/dropdown';
// import { Dialog } from 'primereact/dialog';
// import { ProgressBar } from 'primereact/progressbar';
// import { Toast } from 'primereact/toast';
// import { usePathname, useRouter } from 'next/navigation';
// import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
// import { ListBox } from 'primereact/listbox';
// import { ToggleButton } from 'primereact/togglebutton';
// import { DragDropContext, Droppable, Draggable, DropResult, DraggableProvided, DraggableStateSnapshot, DroppableProvided } from 'react-beautiful-dnd';
 
// // Add these interfaces at the top of your file
// interface TemplateType {
//     templateTypeName: string;
//      templateTypeId: string;
// }
// interface AssessorGroup {
//     userGroupName: string;
//     userGroupId: string;
// }
// interface ReviewType {
//     reviewTypeName: string;
//     reviewTypeId: string;
// }
// interface IsCompulsary {
//     isCompulsary: boolean | string;
// }
// interface AllQuestion {
//     id: string; // or number, depending on what you use
//     questionTitle: string;
//     questionDescription: string;
//     templateType?: TemplateType; // Made optional with ?
//     assessorGroup?: AssessorGroup; // Made optional with ?
//     reviewType?: ReviewType; 
//     minRating?: string;
//     maxRating?: string;
//     isCompulsary?: IsCompulsary;
//     ratingComment?: string;
//     ratio?: string;
//     segment?: string;
// }
// const TEMPLATE_DATA: AllQuestion[] = [
//     {
       
//     id: "",
//     questionTitle: "STRATEGIC PLANNING Client provides...",
//     questionDescription: "",
//     templateType: {
//         templateTypeName: "Reckitt to Agency",
//         templateTypeId: "0"
//     },
//     assessorGroup: {
//         userGroupName: "Agency",
//         userGroupId: "agency-1"
//     },
//     reviewType: {
//         reviewTypeName: "Creative",
//         reviewTypeId: "6"
//     },
//     minRating: "1",
//     maxRating:"5",
//     isCompulsary: {
//         isCompulsary: "Yes"
//     },
//     ratingComment: "score 1, 2",
//     ratio: "100",
//     segment: "STRATEGY & PLANNING"

//     },
//     {
       
//     id: "",
//     questionTitle: "BEHAVIOUR CHANGE My agency develops insight-driven creative responses that are crafted to drive measurable consumer behaviour change.",
//     questionDescription: "",
//     templateType: {
//         templateTypeName: "Reckitt to Agency",
//         templateTypeId: "0"
//     },
//     assessorGroup: {
//         userGroupName: "Agency",
//         userGroupId: "agency-1"
//     },
//     reviewType: {
//         reviewTypeName: "Creative",
//         reviewTypeId: "6"
//     },
//     minRating: "3",
//     maxRating:"6",
//     isCompulsary: {
//         isCompulsary: "Yes"
//     },
//     ratingComment: "score 7, 9",
//     ratio: "90",
//     segment: "STRATEGY & PLANNING"

//     },
//     {
       
//     id: "",
//     questionTitle: "POSITVE PORTRAYAL IN COMMUNICATIONS My agency understands and delivers stories that portray people and communities positively reflecting Reckitt's and my brand's D&I ambitions.",
//     questionDescription: "",
//     templateType: {
//         templateTypeName: "Agency to Reckitt",
//         templateTypeId: "0"
//     },
//     assessorGroup: {
//         userGroupName: "Agency",
//         userGroupId: "agency-1"
//     },
//     reviewType: {
//         reviewTypeName: "Creative",
//         reviewTypeId: "6"
//     },
//     minRating: "7",
//     maxRating:"10",
//     isCompulsary: {
//         isCompulsary: "Yes"
//     },
//     ratingComment: "score 9, 2",
//     ratio: "10",
//     segment: "STRATEGY & PLANNING"

//     },
//     {
       
//     id: "",
//     questionTitle: "OMNI-CHANNEL THINKING My agency taps a cross functional team of experts to develop multi-channel ideas aligned to audience and channel strategies.",
//     questionDescription: "",
//     templateType: {
//         templateTypeName: "Agency to Reckitt",
//         templateTypeId: "0"
//     },
//     assessorGroup: {
//         userGroupName: "Agency",
//         userGroupId: "agency-1"
//     },
//     reviewType: {
//         reviewTypeName: "Creative",
//         reviewTypeId: "6"
//     },
//     minRating: "2",
//     maxRating:"8",
//     isCompulsary: {
//         isCompulsary: "Yes"
//     },
//     ratingComment: "score 9, 2",
//     ratio: "70",
//     segment: "CREATIVE EFFECTIVENESS"

//     },
//     {
       
//     id: "",
//     questionTitle: "MEDIA-AGNOSTIC IDEAS My agency responds to briefs and delivers creative ideas that are media agnostic and can work in key channels relevant to the brand strategy (and not just TV executions with a bit of digital)",
//     questionDescription: "",
//     templateType: {
//         templateTypeName: "Agency to Reckitt",
//         templateTypeId: "0"
//     },
//     assessorGroup: {
//         userGroupName: "Agency",
//         userGroupId: "agency-1"
//     },
//     reviewType: {
//         reviewTypeName: "Creative",
//         reviewTypeId: "6"
//     },
//     minRating: "4",
//     maxRating:"8",
//     isCompulsary: {
//         isCompulsary: "Yes"
//     },
//     ratingComment: "score 2, 6",
//     ratio: "80",
//     segment: "CREATIVE EFFECTIVENESS"

//     },
// ];
// const STORAGE_KEYS = {
//     MARKETING_TEMPLATE_QUESTIONS: 'marketingTemplateQuestions',
//     UPLOADED_TEMPLATE_DATA: 'uploadedTemplateData',
//     TEMPLATE_DATA: 'Template Type'
// };
 
// const TEMPLATE_TYPE_OPTIONS = [
//     { label: 'Reckitt to Agency', value: 'Reckitt to Agency' },
//     { label: 'Agency to Reckitt', value: 'Agency to Reckitt' },
//     { label: 'Reckitt self to Agency', value: 'Reckitt self to Agency' },
//     { label: 'Agency self to Reckitt', value: 'Agency self to Reckitt' }
// ];
// // Define all possible columns
//     const allColumns = [
//         { field: 'actions', header: 'Actions', visible: true, fixed: true },
//         { field: 'questionTitle', header: 'Question Title', visible: true },
//         { field: 'questionDescription', header: 'Description', visible: true },
//         { field: 'templateType.templateTypeName', header: 'Template Type', visible: true },
//         { field: 'assessorGroup.userGroupName', header: 'User Group', visible: true },
//         { field: 'reviewType.reviewTypeName', header: 'Review Type', visible: true },
//         { field: 'minRating', header: 'Min Rating', visible: true },
//         { field: 'maxRating', header: 'Max Rating', visible: true },
//         { field: 'isCompulsary.isCompulsary', header: 'Is Compulsory', visible: true },
//         { field: 'ratingComment', header: 'Rating Comment', visible: true },
//         { field: 'ratio', header: 'Ratio', visible: true },
//         { field: 'segment', header: 'Segment', visible: true }
//     ];
// const MarketingQuestionsTable = () => {
//     const [questions, setQuestions] = useState<AllQuestion[]>([]);
//     const [templateTypeFilter, setTemplateTypeFilter] = useState(null);
//     const [userGroupFilter, setUserGroupFilter] = useState(null);
//     const [reviewTypeFilter, setReviewTypeFilter] = useState(null);
//     const [showUploadedData, setShowUploadedData] = useState(false);
//     const [uploadedTemplateData, setUploadedTemplateData] = useState<AllQuestion[]>([]);
//     const [isUploadDialogVisible, setIsUploadDialogVisible] = useState(false);
//     const [uploadProgress, setUploadProgress] = useState(0);
//     const [allTemplateTypes, setAllTemplateTypes] = useState<{label: string, value: string}[]>([])
//     const [isUploading, setIsUploading] = useState(false);
//     const [selectedFile, setSelectedFile] = useState(null);
//     const [selectedTemplateType, setSelectedTemplateType] = useState('Agency to Reckitt');
//     const fileInputRef = useRef(null);
//     const toast = useRef<Toast>(null);
//     const router = useRouter();
//     const [columns, setColumns] = useState(allColumns);
//     const [showColumnDialog, setShowColumnDialog] = useState(false);

    
 
//     useEffect(() => {
//         // Load questions from localStorage if they exist
//         const saved = localStorage.getItem(STORAGE_KEYS.MARKETING_TEMPLATE_QUESTIONS);
//         if (saved) {
//             setQuestions(JSON.parse(saved));
//         }

//         const tempsaved = localStorage.getItem(STORAGE_KEYS.TEMPLATE_DATA);
//         if (tempsaved) {
//            try {
//                 const parsedData = JSON.parse(tempsaved);
//                 const templateTypes = new Set<string>();
                
//                 Object.values(parsedData).forEach((category: any) => {
//                     if (Array.isArray(category)) {
//                         category.forEach((type: string) => {
//                             templateTypes.add(type);
//                         });
//                     }
//                 });
                
//                 const options = Array.from(templateTypes).map(type => ({
//                     label: type,
//                     value: type
//                 }));
                
//                 setAllTemplateTypes(options);
//             } catch (error) {
//                 console.error('Error parsing template types:', error);
//             }
//         }
//     }, []);
 
//     const handleCreateNavigation = () => {
//         router.push('/marketing-questions/add-questions');
//     };
//     const openUploadDialog = () => {
//         setIsUploadDialogVisible(true);
//     };
//     const closeUploadDialog = () => {
//         setIsUploadDialogVisible(false);
//         setSelectedFile(null);
//         setUploadProgress(0);
//         setIsUploading(false);
//     };
 
//     const handleFileChange = (e: any) => {
//         if (e.target.files && e.target.files.length > 0) {
//             setSelectedFile(e.target.files[0]);
//         }
//     };
//     const simulateUpload = () => {
//     if (!selectedFile) {
//         toast.current?.show({
//             severity: 'error',
//             summary: 'Error',
//             detail: 'Please select a file to upload',
//             life: 3000
//         });
//         return;
//     }

//     setIsUploading(true);
//     setUploadProgress(0);

//     // Simulate progress
//     const interval = setInterval(() => {
//         setUploadProgress((prev) => {
//             const newProgress = prev + Math.floor(Math.random() * 15) + 5;
//             return newProgress >= 100 ? 100 : newProgress;
//         });
//     }, 300);

//     // After "completion"
//     setTimeout(() => {
//         clearInterval(interval);
//         setUploadProgress(100);

//         // Generate unique IDs for each question
//         const questionsWithIds = TEMPLATE_DATA.map(question => ({
//             ...question,
//             id: `uploaded-${Date.now()}-${Math.floor(Math.random() * 1000)}`
//         }));

//         // Get existing questions from localStorage
//         const existingQuestions = JSON.parse(
//             localStorage.getItem(STORAGE_KEYS.MARKETING_TEMPLATE_QUESTIONS) || '[]'
//         );

//         // Combine existing questions with new uploaded questions
//         const allQuestions = [...existingQuestions, ...questionsWithIds];

//         // Save to both storage locations
//         localStorage.setItem(
//             STORAGE_KEYS.UPLOADED_TEMPLATE_DATA,
//             JSON.stringify(questionsWithIds)
//         );
//         localStorage.setItem(
//             STORAGE_KEYS.MARKETING_TEMPLATE_QUESTIONS,
//             JSON.stringify(allQuestions)
//         );

//         // Update state
//         setUploadedTemplateData(questionsWithIds);
//         setQuestions(allQuestions);

//         // Finish upload process
//         setTimeout(() => {
//             setIsUploading(false);
//             closeUploadDialog();

//             toast.current?.show({
//                 severity: 'success',
//                 summary: 'Success',
//                 detail: 'Template uploaded and questions saved successfully!',
//                 life: 3000
//             });
//         }, 500);
//     }, 2000);
// };
 
//     const templateTypeOptions = useMemo(() => {
//         const set = new Set((questions as any[]).map((q) => q.templateType?.templateTypeName));
//         return Array.from(set)
//             .filter(Boolean)
//             .map((name) => ({ label: name, value: name }));
//     }, [questions]);
 
//     const userGroupOptions = useMemo(() => {
//         const set = new Set((questions as any[]).map((q) => q.assessorGroup?.userGroupName));
//         return Array.from(set)
//             .filter(Boolean)
//             .map((name) => ({ label: name, value: name }));
//     }, [questions]);
 
//     const reviewTypeOptions = useMemo(() => {
//         const set = new Set((questions as any[]).map((q) => q.reviewType?.reviewTypeName));
//         return Array.from(set)
//             .filter(Boolean)
//             .map((name) => ({ label: name, value: name }));
//     }, [questions]);
 
//     const filteredQuestions = useMemo(() => {
//         return (questions as any[]).filter((q) => {
//             const matchesTemplate = !templateTypeFilter || q.templateType?.templateTypeName === templateTypeFilter;
//             const matchesUserGroup = !userGroupFilter || q.assessorGroup?.userGroupName === userGroupFilter;
//             const matchesReviewType = !reviewTypeFilter || q.reviewType?.reviewTypeName === reviewTypeFilter;
//             return matchesTemplate && matchesUserGroup && matchesReviewType;
//         });
//     }, [questions, templateTypeFilter, userGroupFilter, reviewTypeFilter]);
 
//     const uploadDialogFooter = (
//         <div className="mt-2 mb-2">
//             <Button label="Cancel" className="p-button-text" onClick={closeUploadDialog} disabled={isUploading} />
//             <Button label="Upload" icon="pi pi-upload" className="p-button-success" onClick={simulateUpload} disabled={!selectedFile || isUploading} />
//         </div>
//     );
//     const handleDeleteQuestion = (questionToDelete: { id: any; }) => {
//     // Confirm before deleting
//     confirmDialog({
//         message: 'Are you sure you want to delete this question?',
//         header: 'Confirmation',
//         icon: 'pi pi-exclamation-triangle',
//         accept: () => {
//             // Filter out the deleted question
//             const updatedQuestions = questions.filter(
//                 q => q.id !== questionToDelete.id
//             );
            
//             // Update state
//             setQuestions(updatedQuestions);
            
//             // Update localStorage
//             localStorage.setItem(
//                 STORAGE_KEYS.MARKETING_TEMPLATE_QUESTIONS,
//                 JSON.stringify(updatedQuestions)
//             );
            
//             // Show success message
//             toast.current?.show({
//                 severity: 'success',
//                 summary: 'Success',
//                 detail: 'Question deleted successfully',
//                 life: 3000
//             });
//         }
//     });
// };
// const handleEditQuestion = (questionToEdit: { id: string }) => {
//     router.push(`/marketing-questions/add-questions?marketingTemplateQuestionId=${questionToEdit.id}&edit=true`);
// };

// // Update the onDragEnd function with proper typing
// const onDragEnd = (result: DropResult) => {
//     if (!result.destination) return;

//     const items = Array.from(columns);
//     const [reorderedItem] = items.splice(result.source.index, 1);
//     items.splice(result.destination.index, 0, reorderedItem);

//     setColumns(items);
// };

//     // Toggle column visibility
//     const toggleColumnVisibility = (field: string) => {
//         setColumns(columns.map(col => 
//             col.field === field ? { ...col, visible: !col.visible } : col
//         ));
//     };

//     // Reset to default columns
//     const resetColumns = () => {
//         setColumns(allColumns);
//     };

//     // Render the column dialog
//     const renderColumnDialog = () => {
//         return (
//             <Dialog 
//                 header="Customize Columns" 
//                 visible={showColumnDialog} 
//                 onHide={() => setShowColumnDialog(false)}
//                 style={{ width: '50vw' }}
//             >
//                 <div className="p-fluid">
//                     <div className="flex justify-content-between mb-3">
//                         <Button 
//                             label="Reset to Default" 
//                             className="p-button-text" 
//                             onClick={resetColumns} 
//                         />
//                         <Button 
//                             label="Close" 
//                             className="p-button-text" 
//                             onClick={() => setShowColumnDialog(false)} 
//                         />
//                     </div>

// <DragDropContext onDragEnd={onDragEnd}>
//     <Droppable droppableId="columns">
//         {(provided: DroppableProvided) => (
//             <div {...provided.droppableProps} ref={provided.innerRef}>
//                 {columns.map((col, index) => (
//                     <Draggable key={col.field} draggableId={col.field} index={index}>
//                         {(provided: DraggableProvided, snapshot: DraggableStateSnapshot) => (
//                             <div 
//                                 ref={provided.innerRef}
//                                 {...provided.draggableProps}
//                                 {...provided.dragHandleProps}
//                                 className="flex align-items-center justify-content-between p-2 border-round mb-2"
//                                 style={{ 
//                                     backgroundColor: 'var(--surface-ground)',
//                                     ...provided.draggableProps.style
//                                 }}
//                             >
//                                 <span>{col.header}</span>
//                                 {!col.fixed && (
//                                     <ToggleButton 
//                                         checked={col.visible} 
//                                         onChange={() => toggleColumnVisibility(col.field)}
//                                         onLabel="Visible" 
//                                         offLabel="Hidden" 
//                                         className="w-8rem"
//                                     />
//                                 )}
//                             </div>
//                         )}
//                     </Draggable>
//                 ))}
//                 {provided.placeholder}
//             </div>
//         )}
//     </Droppable>
// </DragDropContext>
//                 </div>
//             </Dialog>
//         );
//     };

//     // Render actions column
//     const renderActions = (rowData: { id: any; }) => (
//         <div className="flex gap-2">
//             <Button 
//                 icon="pi pi-pencil" 
//                 className="p-button-rounded p-button-text p-button-plain" 
//                 onClick={() => handleEditQuestion(rowData)}
//             />
//             <Button 
//                 icon="pi pi-trash" 
//                 className="p-button-rounded p-button-text p-button-danger" 
//                 onClick={() => handleDeleteQuestion(rowData)}
//             />
//         </div>
//     );
 
//     return (
//         <div className="card">
//         <Toast ref={toast} />
//         <ConfirmDialog />
 
//             <div className="flex justify-content-between items-center mb-4">
//                 <h3>Marketing Template Questions</h3>
//                 <div className="flex gap-2">
//                     <Button
//                         label="Add Questions"
//                         icon="pi pi-plus"
//                         className="bg-white border-primary-main text-red-600"
//                         onClick={() => {
//                             setShowUploadedData(false);
//                             handleCreateNavigation();
//                         }}
//                     />
//                     <Button label="Upload Template" icon="pi pi-upload" className="" onClick={openUploadDialog} />
//                 </div>
//             </div>
//             <hr className="my-4" /> 
 
//             {/* Regular Questions Table - Only shown when uploaded table is not visible */}
//             {!showUploadedData && (
//                 <>
//                     <div className="flex justify-content-start gap-3 mb-4">
//                         <Dropdown value={templateTypeFilter} options={templateTypeOptions} onChange={(e) => setTemplateTypeFilter(e.value)} placeholder="Filter by Template Type" showClear />
//                         <Dropdown value={userGroupFilter} options={userGroupOptions} onChange={(e) => setUserGroupFilter(e.value)} placeholder="Filter by User Group" showClear />
//                         <Dropdown value={reviewTypeFilter} options={reviewTypeOptions} onChange={(e) => setReviewTypeFilter(e.value)} placeholder="Filter by Review Type" showClear />
//                     </div>
//                     <div className="flex justify-content-end mb-3">
//                 <Button 
//                     icon="pi pi-cog" 
//                     label="Customize Columns" 
//                     onClick={() => setShowColumnDialog(true)}
//                 />
//             </div>
//                     <DataTable value={filteredQuestions} paginator rows={10} emptyMessage="No questions found">
//                 {columns.filter(col => col.visible).map(col => (
//                     col.field === 'actions' ? (
//                         <Column 
//                             key={col.field}
//                             header={col.header} 
//                             body={renderActions}
//                         />
//                     ) : (
//                         <Column 
//                             key={col.field}
//                             field={col.field} 
//                             header={col.header} 
//                         />
//                     )
//                 ))}
//             </DataTable>
//             {renderColumnDialog()}

//                 </>
//             )}
 
//             {/* Upload Dialog */}
//             <Dialog header="Upload Template" visible={isUploadDialogVisible} style={{ width: '500px' }} footer={uploadDialogFooter} onHide={closeUploadDialog} closable={!isUploading}>
//                 <div className=" gap-4">
//                     <label htmlFor="fileUpload" className="font-medium">
//                             Template Type
//                         </label>
//                     <div className="flex justify-content-between align-items-center mb-4 mt-2">
//                         <Dropdown
//                             value={selectedTemplateType}
//                             options={allTemplateTypes}
//                             onChange={(e) => setSelectedTemplateType(e.value)}
//                             placeholder="Select Template Type"
//                             className="w-full md:w-14rem"
//                         />
//                     </div>
 
//                     <div className=" gap-2">
//                         <label htmlFor="fileUpload" className="font-medium">
//                             Select Excel Template
//                         </label>
//                         <input ref={fileInputRef} type="file" id="fileUpload" accept=".xlsx, .xls" onChange={handleFileChange} disabled={isUploading} className="border p-2 rounded" />
//                     </div>
 
//                     {isUploading && (
//                         <div className="flex flex-col gap-2">
//                             <label className="font-medium">Upload Progress</label>
//                             <ProgressBar value={uploadProgress} showValue={true} />
//                             <p className="text-center text-blue-600">{uploadProgress < 100 ? 'Uploading...' : 'Processing template...'}</p>
//                         </div>
//                     )}
//                 </div>
//             </Dialog>
//         </div>
//     );
// };
 
// export default MarketingQuestionsTable;
 
 


'use client';
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Dialog } from 'primereact/dialog';
import { ProgressBar } from 'primereact/progressbar';
import { Toast } from 'primereact/toast';
import { usePathname, useRouter } from 'next/navigation';
import { ConfirmDialog, confirmDialog } from 'primereact/confirmdialog';
 
// Add these interfaces at the top of your file
interface TemplateType {
    templateTypeName: string;
     templateTypeId: string;
}
interface AssessorGroup {
    userGroupName: string;
    userGroupId: string;
}
interface ReviewType {
    reviewTypeName: string;
    reviewTypeId: string;
}
interface IsCompulsary {
    isCompulsary: boolean | string;
}
interface AllQuestion {
    id: string; // or number, depending on what you use
    questionTitle: string;
    questionDescription: string;
    templateType?: TemplateType; // Made optional with ?
    assessorGroup?: AssessorGroup; // Made optional with ?
    reviewType?: ReviewType; 
    minRating?: string;
    maxRating?: string;
    isCompulsary?: IsCompulsary;
    ratingComment?: string;
    ratio?: string;
    segment?: string;
}
const TEMPLATE_DATA: AllQuestion[] = [
    {
       
    id: "",
    questionTitle: "STRATEGIC PLANNING Client provides...",
    questionDescription: "",
    templateType: {
        templateTypeName: "Reckitt to Agency",
        templateTypeId: "0"
    },
    assessorGroup: {
        userGroupName: "Agency",
        userGroupId: "agency-1"
    },
    reviewType: {
        reviewTypeName: "Creative",
        reviewTypeId: "6"
    },
    minRating: "1",
    maxRating:"5",
    isCompulsary: {
        isCompulsary: "Yes"
    },
    ratingComment: "score 1, 2",
    ratio: "100",
    segment: "STRATEGY & PLANNING"

    },
    {
       
    id: "",
    questionTitle: "BEHAVIOUR CHANGE My agency develops insight-driven creative responses that are crafted to drive measurable consumer behaviour change.",
    questionDescription: "",
    templateType: {
        templateTypeName: "Reckitt to Agency",
        templateTypeId: "0"
    },
    assessorGroup: {
        userGroupName: "Agency",
        userGroupId: "agency-1"
    },
    reviewType: {
        reviewTypeName: "Creative",
        reviewTypeId: "6"
    },
    minRating: "3",
    maxRating:"6",
    isCompulsary: {
        isCompulsary: "Yes"
    },
    ratingComment: "score 7, 9",
    ratio: "90",
    segment: "STRATEGY & PLANNING"

    },
    {
       
    id: "",
    questionTitle: "POSITVE PORTRAYAL IN COMMUNICATIONS My agency understands and delivers stories that portray people and communities positively reflecting Reckitt's and my brand's D&I ambitions.",
    questionDescription: "",
    templateType: {
        templateTypeName: "Agency to Reckitt",
        templateTypeId: "0"
    },
    assessorGroup: {
        userGroupName: "Agency",
        userGroupId: "agency-1"
    },
    reviewType: {
        reviewTypeName: "Creative",
        reviewTypeId: "6"
    },
    minRating: "7",
    maxRating:"10",
    isCompulsary: {
        isCompulsary: "Yes"
    },
    ratingComment: "score 9, 2",
    ratio: "10",
    segment: "STRATEGY & PLANNING"

    },
    {
       
    id: "",
    questionTitle: "OMNI-CHANNEL THINKING My agency taps a cross functional team of experts to develop multi-channel ideas aligned to audience and channel strategies.",
    questionDescription: "",
    templateType: {
        templateTypeName: "Agency to Reckitt",
        templateTypeId: "0"
    },
    assessorGroup: {
        userGroupName: "Agency",
        userGroupId: "agency-1"
    },
    reviewType: {
        reviewTypeName: "Creative",
        reviewTypeId: "6"
    },
    minRating: "2",
    maxRating:"8",
    isCompulsary: {
        isCompulsary: "Yes"
    },
    ratingComment: "score 9, 2",
    ratio: "70",
    segment: "CREATIVE EFFECTIVENESS"

    },
    {
       
    id: "",
    questionTitle: "MEDIA-AGNOSTIC IDEAS My agency responds to briefs and delivers creative ideas that are media agnostic and can work in key channels relevant to the brand strategy (and not just TV executions with a bit of digital)",
    questionDescription: "",
    templateType: {
        templateTypeName: "Agency to Reckitt",
        templateTypeId: "0"
    },
    assessorGroup: {
        userGroupName: "Agency",
        userGroupId: "agency-1"
    },
    reviewType: {
        reviewTypeName: "Creative",
        reviewTypeId: "6"
    },
    minRating: "4",
    maxRating:"8",
    isCompulsary: {
        isCompulsary: "Yes"
    },
    ratingComment: "score 2, 6",
    ratio: "80",
    segment: "CREATIVE EFFECTIVENESS"

    },
];
const STORAGE_KEYS = {
    MARKETING_TEMPLATE_QUESTIONS: 'marketingTemplateQuestions',
    UPLOADED_TEMPLATE_DATA: 'uploadedTemplateData',
    TEMPLATE_DATA: 'Template Type'
};
 
const TEMPLATE_TYPE_OPTIONS = [
    { label: 'Reckitt to Agency', value: 'Reckitt to Agency' },
    { label: 'Agency to Reckitt', value: 'Agency to Reckitt' },
    { label: 'Reckitt self to Agency', value: 'Reckitt self to Agency' },
    { label: 'Agency self to Reckitt', value: 'Agency self to Reckitt' }
];
const MarketingQuestionsTable = () => {
    const [questions, setQuestions] = useState<AllQuestion[]>([]);
    const [templateTypeFilter, setTemplateTypeFilter] = useState(null);
    const [userGroupFilter, setUserGroupFilter] = useState(null);
    const [reviewTypeFilter, setReviewTypeFilter] = useState(null);
    const [showUploadedData, setShowUploadedData] = useState(false);
    const [uploadedTemplateData, setUploadedTemplateData] = useState<AllQuestion[]>([]);
    const [isUploadDialogVisible, setIsUploadDialogVisible] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [allTemplateTypes, setAllTemplateTypes] = useState<{label: string, value: string}[]>([])
    const [isUploading, setIsUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedTemplateType, setSelectedTemplateType] = useState('Agency to Reckitt');
    const fileInputRef = useRef(null);
    const toast = useRef<Toast>(null);
    const router = useRouter();
 
    useEffect(() => {
        // Load questions from localStorage if they exist
        const saved = localStorage.getItem(STORAGE_KEYS.MARKETING_TEMPLATE_QUESTIONS);
        if (saved) {
            setQuestions(JSON.parse(saved));
        }

        const tempsaved = localStorage.getItem(STORAGE_KEYS.TEMPLATE_DATA);
        if (tempsaved) {
           try {
                const parsedData = JSON.parse(tempsaved);
                const templateTypes = new Set<string>();
                
                Object.values(parsedData).forEach((category: any) => {
                    if (Array.isArray(category)) {
                        category.forEach((type: string) => {
                            templateTypes.add(type);
                        });
                    }
                });
                
                const options = Array.from(templateTypes).map(type => ({
                    label: type,
                    value: type
                }));
                
                setAllTemplateTypes(options);
            } catch (error) {
                console.error('Error parsing template types:', error);
            }
        }
    }, []);
 
    const handleCreateNavigation = () => {
        router.push('/marketing-questions/add-questions');
    };
    const openUploadDialog = () => {
        setIsUploadDialogVisible(true);
    };
    const closeUploadDialog = () => {
        setIsUploadDialogVisible(false);
        setSelectedFile(null);
        setUploadProgress(0);
        setIsUploading(false);
    };
 
    const handleFileChange = (e: any) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };
    const simulateUpload = () => {
    if (!selectedFile) {
        toast.current?.show({
            severity: 'error',
            summary: 'Error',
            detail: 'Please select a file to upload',
            life: 3000
        });
        return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress
    const interval = setInterval(() => {
        setUploadProgress((prev) => {
            const newProgress = prev + Math.floor(Math.random() * 15) + 5;
            return newProgress >= 100 ? 100 : newProgress;
        });
    }, 300);

    // After "completion"
    setTimeout(() => {
        clearInterval(interval);
        setUploadProgress(100);

        // Generate unique IDs for each question
        const questionsWithIds = TEMPLATE_DATA.map(question => ({
            ...question,
            id: `uploaded-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        }));

        // Get existing questions from localStorage
        const existingQuestions = JSON.parse(
            localStorage.getItem(STORAGE_KEYS.MARKETING_TEMPLATE_QUESTIONS) || '[]'
        );

        // Combine existing questions with new uploaded questions
        const allQuestions = [...existingQuestions, ...questionsWithIds];

        // Save to both storage locations
        localStorage.setItem(
            STORAGE_KEYS.UPLOADED_TEMPLATE_DATA,
            JSON.stringify(questionsWithIds)
        );
        localStorage.setItem(
            STORAGE_KEYS.MARKETING_TEMPLATE_QUESTIONS,
            JSON.stringify(allQuestions)
        );

        // Update state
        setUploadedTemplateData(questionsWithIds);
        setQuestions(allQuestions);

        // Finish upload process
        setTimeout(() => {
            setIsUploading(false);
            closeUploadDialog();

            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Template uploaded and questions saved successfully!',
                life: 3000
            });
        }, 500);
    }, 2000);
};
 
    const templateTypeOptions = useMemo(() => {
        const set = new Set((questions as any[]).map((q) => q.templateType?.templateTypeName));
        return Array.from(set)
            .filter(Boolean)
            .map((name) => ({ label: name, value: name }));
    }, [questions]);
 
    const userGroupOptions = useMemo(() => {
        const set = new Set((questions as any[]).map((q) => q.assessorGroup?.userGroupName));
        return Array.from(set)
            .filter(Boolean)
            .map((name) => ({ label: name, value: name }));
    }, [questions]);
 
    const reviewTypeOptions = useMemo(() => {
        const set = new Set((questions as any[]).map((q) => q.reviewType?.reviewTypeName));
        return Array.from(set)
            .filter(Boolean)
            .map((name) => ({ label: name, value: name }));
    }, [questions]);
 
    const filteredQuestions = useMemo(() => {
        return (questions as any[]).filter((q) => {
            const matchesTemplate = !templateTypeFilter || q.templateType?.templateTypeName === templateTypeFilter;
            const matchesUserGroup = !userGroupFilter || q.assessorGroup?.userGroupName === userGroupFilter;
            const matchesReviewType = !reviewTypeFilter || q.reviewType?.reviewTypeName === reviewTypeFilter;
            return matchesTemplate && matchesUserGroup && matchesReviewType;
        });
    }, [questions, templateTypeFilter, userGroupFilter, reviewTypeFilter]);
 
    const uploadDialogFooter = (
        <div className="mt-2 mb-2">
            <Button label="Cancel" className="p-button-text" onClick={closeUploadDialog} disabled={isUploading} />
            <Button label="Upload" icon="pi pi-upload" className="p-button-success" onClick={simulateUpload} disabled={!selectedFile || isUploading} />
        </div>
    );
    const handleDeleteQuestion = (questionToDelete: { id: any; }) => {
    // Confirm before deleting
    confirmDialog({
        message: 'Are you sure you want to delete this question?',
        header: 'Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => {
            // Filter out the deleted question
            const updatedQuestions = questions.filter(
                q => q.id !== questionToDelete.id
            );
            
            // Update state
            setQuestions(updatedQuestions);
            
            // Update localStorage
            localStorage.setItem(
                STORAGE_KEYS.MARKETING_TEMPLATE_QUESTIONS,
                JSON.stringify(updatedQuestions)
            );
            
            // Show success message
            toast.current?.show({
                severity: 'success',
                summary: 'Success',
                detail: 'Question deleted successfully',
                life: 3000
            });
        }
    });
};
const handleEditQuestion = (questionToEdit: { id: string }) => {
    router.push(`/marketing-questions/add-questions?marketingTemplateQuestionId=${questionToEdit.id}&edit=true`);
};
 
    return (
        <div className="card">
        <Toast ref={toast} />
        <ConfirmDialog />
 
            <div className="flex justify-content-between items-center mb-4">
                <h3>Marketing Template Questions</h3>
                <div className="flex gap-2">
                    <Button
                        label="Add Questions"
                        icon="pi pi-plus"
                        className="bg-white border-primary-main text-red-600"
                        onClick={() => {
                            setShowUploadedData(false);
                            handleCreateNavigation();
                        }}
                    />
                    <Button label="Upload Template" icon="pi pi-upload" className="" onClick={openUploadDialog} />
                </div>
            </div>
            <hr className="my-4" /> 
 
            {/* Regular Questions Table - Only shown when uploaded table is not visible */}
            {!showUploadedData && (
                <>
                    <div className="flex justify-content-start gap-3 mb-4">
                        <Dropdown value={templateTypeFilter} options={templateTypeOptions} onChange={(e) => setTemplateTypeFilter(e.value)} placeholder="Filter by Template Type" showClear />
                        <Dropdown value={userGroupFilter} options={userGroupOptions} onChange={(e) => setUserGroupFilter(e.value)} placeholder="Filter by User Group" showClear />
                        <Dropdown value={reviewTypeFilter} options={reviewTypeOptions} onChange={(e) => setReviewTypeFilter(e.value)} placeholder="Filter by Review Type" showClear />
                    </div>
                    <DataTable value={filteredQuestions} paginator rows={10} emptyMessage="No questions found">
                        <Column 
        header="Actions" 
        body={(rowData) => (
            <div className="flex gap-2">
                <Button 
                    icon="pi pi-pencil" 
                    className="p-button-rounded p-button-text p-button-plain" 
                    onClick={() => handleEditQuestion(rowData)}
                />
                <Button 
                    icon="pi pi-trash" 
                    className="p-button-rounded p-button-text p-button-danger" 
                    onClick={() => handleDeleteQuestion(rowData)}
                />
            </div>
        )}
    />
                        <Column field="questionTitle" header="Question Title" />
                        <Column field="questionDescription" header="Description" />
                        <Column field="templateType.templateTypeName" header="Template Type" />
                        <Column field="assessorGroup.userGroupName" header="User Group" />
                        <Column field="reviewType.reviewTypeName" header="Review Type" />
                        <Column field="minRating" header="Min Rating" />
                        <Column field="maxRating" header="Max Rating" />
                        <Column field="isCompulsary.isCompulsary" header="Is Compulsory" />
                        <Column field="ratingComment" header="Rating Comment" />
                        <Column field="ratio" header="Ratio" />
                        <Column field="segment" header="Segment" />
                        
                    </DataTable>
                </>
            )}
 
            {/* Upload Dialog */}
            <Dialog header="Upload Template" visible={isUploadDialogVisible} style={{ width: '500px' }} footer={uploadDialogFooter} onHide={closeUploadDialog} closable={!isUploading}>
                <div className=" gap-4">
                    <label htmlFor="fileUpload" className="font-medium">
                            Template Type
                        </label>
                    <div className="flex justify-content-between align-items-center mb-4 mt-2">
                        <Dropdown
                            value={selectedTemplateType}
                            options={allTemplateTypes}
                            onChange={(e) => setSelectedTemplateType(e.value)}
                            placeholder="Select Template Type"
                            className="w-full md:w-14rem"
                        />
                    </div>
 
                    <div className=" gap-2">
                        <label htmlFor="fileUpload" className="font-medium">
                            Select Excel Template
                        </label>
                        <input ref={fileInputRef} type="file" id="fileUpload" accept=".xlsx, .xls" onChange={handleFileChange} disabled={isUploading} className="border p-2 rounded" />
                    </div>
 
                    {isUploading && (
                        <div className="flex flex-col gap-2">
                            <label className="font-medium">Upload Progress</label>
                            <ProgressBar value={uploadProgress} showValue={true} />
                            <p className="text-center text-blue-600">{uploadProgress < 100 ? 'Uploading...' : 'Processing template...'}</p>
                        </div>
                    )}
                </div>
            </Dialog>
        </div>
    );
};
 
export default MarketingQuestionsTable;
 
 