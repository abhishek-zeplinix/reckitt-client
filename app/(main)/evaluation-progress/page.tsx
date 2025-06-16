// 'use client';

// import { useState } from 'react';
// import { Checkbox } from 'primereact/checkbox';
// import { Button } from 'primereact/button';

// const TablePage = () => {
//     const [selected, setSelected] = useState<string[]>([]);

//     const data = [
//     {
//             agency: 'Agency 1',
//             account: 'Creative , Global ,Airwick',
//             openComplete: [true, false, true, false],
//             clientSubmission: '0 of 3',
//             agencySelf: 'N/A',
//             agencySubmission: '0 of 3',
//             clientSelf: 'N/A'
//         },
//         {
//             agency: 'Agency 2',
//             account: 'Creative , Global ,Airwick',
//             openComplete: [true, false, true, false],
//             clientSubmission: '0 of 2',
//             agencySelf: 'N/A',
//             agencySubmission: '0 of 3',
//             clientSelf: 'N/A'
//         }
// ];


//   const lockTemplate = (rowData: any) => (
//         <div className="flex flex-wrap gap-3">
//             {/* First set */}
//             <div className="flex flex-column align-items-center gap-1">
//                 <span className="text-xs text-gray-600 font-medium">1</span>
//                 <i className="pi pi-lock text-yellow-600 text-sm" />
//             </div>
//             <div className="flex flex-column align-items-center gap-1">
//                 <span className="text-xs text-gray-600 font-medium">2</span>
//                 <span className="text-black text-xs font-bold">__</span>
//             </div>

//             {/* Second set */}
//             <div className="flex flex-column align-items-center gap-1">
//                 <span className="text-xs text-gray-600 font-medium">3</span>
//                 <i className="pi pi-lock text-yellow-600 text-sm" />
//             </div>
//             <div className="flex flex-column align-items-center gap-1">
//                 <span className="text-xs text-gray-600 font-medium">4</span>
//                 <span className="text-black text-xs font-bold">__</span>
//             </div>
//         </div>
//     );


//     const toggleSelection = (account: string) => {
//         if (selected.includes(account)) {
//             setSelected(selected.filter((a) => a !== account));
//         } else {
//             setSelected([...selected, account]);
//         }
//     };

//     return (
//         <div className="p-4 bg-gray-50 min-h-screen">
//             {/* Header Info */}
//             <div className="text-sm text-gray-700 mb-3">
//                 <div className="mb-1">
//                     <strong>Evaluation:</strong> 2025-5, H1 Creative Global &nbsp;&nbsp;
//                     <strong>Evaluation Type:</strong> Annual &nbsp;&nbsp;
//                     <strong>Reporting Year:</strong> 2025 &nbsp;&nbsp;
//                     <strong>Reporting Month:</strong> 5
//                 </div>
//             </div>

//             <div className="flex justify-content-end mt-4">
//                 <span className="p-input-icon-left w-full md:w-4">
//                     <i className="pi pi-search" />
//                     <input type="text" className="p-inputtext p-component w-full" placeholder="Search vendors or accounts..." />
//                 </span>
//             </div>
//             {/* Vendor Cards */}
//             <div className="flex flex-column gap-4 mt-4">
//                 {data.map((vendor, idx) => (
//                     <div key={idx} className=" bg-white card border-round-xl px-4 border-1 border-300 ">
//                         <div className="flex justify-content-end mb-2">
//                             <Button icon="pi pi-trash" className="p-button-text p-button-danger p-button-sm" tooltip="Delete vendor" tooltipOptions={{ position: 'top' }} />
//                         </div>
//                         <div className=" border-round p-1">
//                             <div className="mb-3 flex flex-column md:flex-row">
//                                 <div className="w-full md:w-3 text-700 font-semibold mb-2 md:mb-0">Agency:</div>
//                                 <div className="flex-1">{vendor.agency}</div>
//                             </div>
//                             <div className="mb-3 flex flex-column md:flex-row">
//                                 <div className="w-full md:w-3 text-700 font-semibold mb-2 md:mb-0">ACCOUNT:</div>
//                                 <div className="flex-1">{vendor.account}</div>
//                             </div>

//                             <div className="mt-4 flex flex-column md:flex-row align-items-start">
//                                 <div className="w-full md:w-3 text-700 font-semibold">OPEN/COMPLETE:</div>
//                                 <div className="flex-1 flex gap-4 mt-2 md:mt-0">
//                                     {[1, 2, 3, 4].map((step, i) => (
//                                         <div key={i} className="flex flex-column align-items-center gap-1">
//                                             <span className="text-xs text-600">{`Step ${step}`}</span>
//                                             {i % 2 === 0 ? <i className="pi pi-lock text-red-600  p-2 border-circle text-sm shadow-1" /> : <span className="text-900 font-bold text-sm">--</span>}
//                                         </div>
//                                     ))}
//                                 </div>
//                             </div>
//                             <div className="mb-3 flex flex-column md:flex-row mt-3">
//                                 <div className="w-full md:w-3 text-700 font-semibold mb-2 md:mb-0">CLIENT SUBMISSION (1):</div>
//                                 <div className="flex-1">
//                                     <div className="flex-1">{vendor.clientSubmission}</div>
//                                 </div>
//                             </div>
//                             <div className="mb-3 flex flex-column md:flex-row">
//                                 <div className="w-full md:w-3 text-700 font-semibold mb-2 md:mb-0">AGENCY SELF (2):</div>
//                                 <div className="flex-1">
//                                     <div className="flex-1">{vendor.agencySelf}</div>
//                                 </div>
//                             </div>

//                             <div className="mb-3 flex flex-column md:flex-row">
//                                 <div className="w-full md:w-3 text-700 font-semibold mb-2 md:mb-0">AGENCY SUBMISSION (3):</div>
//                                 <div className="flex-1">{vendor.agencySubmission}</div>
//                             </div>
//                             <div className="mb-3 flex flex-column md:flex-row">
//                                 <div className="w-full md:w-3 text-700 font-semibold mb-2 md:mb-0">CLIENT SELF:</div>
//                                 <div className="flex-1">{vendor.clientSelf}</div>
//                             </div>
//                         </div>
//                     </div>
//                 ))}
//             </div>
//         </div>
//     );
// };

// export default TablePage;



// 'use client';

// import { Button } from 'primereact/button';
// import 'primereact/resources/themes/lara-light-blue/theme.css';
// import 'primereact/resources/primereact.min.css';
// import 'primeicons/primeicons.css';
// import 'primeflex/primeflex.css';

// export default function EvaluationSetup() {
//   const vendors = [
//     {
//       agency: 'Dentsu',
//       account: 'Digital, France, Health (Digital) - updated question set',
//       questionSet: [
//         'Dig (IAegis) FR/BE/NL | 5 Sections',
//         'Media AG | 4 Sections',
//       ],
//       clientParticipants: ['0: Owners', '3: Assessors'],
//       agencyParticipants: ['0: Owners', '3: Assessors'],
//     },
//     {
//       agency: 'Dentsu',
//       account: 'Digital, France, Hygiene (Digital) - updated question set',
//       questionSet: [
//         'Dig (IAegis) FR/BE/NL | 5 Sections',
//         'Media AG | 4 Sections',
//       ],
//       clientParticipants: ['0: Owners', '2: Assessors'],
//       agencyParticipants: ['0: Owners', '3: Assessors'],
//     },
//   ];

//   return (
//     <div className="p-3">
//       {/* Header Info */}
//       <div className="border-1 border-300 p-4 border-round-xl bg-white card text-sm font-medium flex flex-column md:flex-row gap-4">
//         <div className="flex-1">
//           <div className="text-500">Evaluation Name</div>
//           <div className="text-900 font-semibold">2025-5, H1 Media, Global</div>
//         </div>
//         <div className="flex-1">
//           <div className="text-500">Evaluation Type</div>
//           <div className="text-900 font-semibold">Annual</div>
//         </div>
//         <div className="flex-1">
//           <div className="text-500">Reporting Year</div>
//           <div className="text-900 font-semibold">2025</div>
//         </div>
//         <div className="flex-1">
//           <div className="text-500">Reporting Month</div>
//           <div className="text-900 font-semibold">05</div>
//         </div>
//       </div>

//       {/* Search Bar */}
//       <div className="flex justify-content-end mt-4">
//         <span className="p-input-icon-left w-full md:w-4">
//           <i className="pi pi-search" />
//           <input
//             type="text"
//             className="p-inputtext p-component w-full"
//             placeholder="Search..."
//           />
//         </span>
//       </div>

//       {/* Vendor Cards */}
//       {/* <div className='border-1 border-300 p-4 border-round-xl bg-white shadow-2'> */}
//       <div className="flex flex-column gap-4 mt-4">
//         {vendors.map((vendor, idx) => (
//           <div
//             key={idx}
//             className="bg-white card border-round-xl p-4 border-1 border-300"
//           >
//             <div className="flex justify-content-end">
//               <Button
//                 icon="pi pi-trash"
//                 className="p-button-text p-button-danger p-button-sm"
//               />
//             </div>
//             <div className="font-bold text-lg text-900 mb-3">
//               {vendor.agency}
//             </div>
            
//             <div className="w-full h-1 mb-4 p-2" style={{ backgroundColor: '#F8FAFC' }}>

//             <div className="mb-2 flex">
//               <div className="w-3 text-700 font-semibold">ACCOUNT :</div>
//               <div className="flex-1">{vendor.account}</div>
//             </div>

//             <div className="mb-2 flex">
//               <div className="w-3 text-700 font-semibold">QUESTION SET :</div>
//               <div className="flex-1">
//                 <ul className="list-disc pl-5 m-0">
//                   {vendor.questionSet.map((q, i) => (
//                     <li key={i}>{q}</li>
//                   ))}
//                 </ul>
//               </div>
//             </div>

//             <div className="mb-2 flex">
//               <div className="w-3 text-700 font-semibold">
//                 CLIENT PARTICIPANTS :
//               </div>
//               <div className="flex-1">
//                 {vendor.clientParticipants.join(', ')}
//               </div>
//             </div>

//             <div className="mb-3 flex">
//               <div className="w-3 text-700 font-semibold">
//                 AGENCY PARTICIPANTS :
//               </div>
//               <div className="flex-1">
//                 {vendor.agencyParticipants.join(', ')}
//               </div>
//             </div>

//             <div className="mb-3 flex">
//               <div className="w-3 text-700 font-semibold">SET-UP :</div>
//               <div className="flex-1 flex gap-3 mt-1">
//                 {[1, 2, 3, 4].map((step, i) => (
//                   <div
//                     key={i}
//                     className="flex flex-column align-items-center"
//                   >
//                     <span className="text-xs text-600">{step}</span>
//                     {i % 2 === 0 ? (
//                       <i className="pi pi-check text-white bg-green-600 p-1 border-circle text-sm" />
//                     ) : (
//                       <span className="text-900 text-xs font-bold">__</span>
//                     )}
//                   </div>
//                 ))}
//               </div>
//             </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//     // </div>
//   );
// }

'use client';

'use client';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';
import { useState } from 'react';

const TablePage = () => {
    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    const data = [
    {
            agency: 'Agency 1',
            account: 'Creative , Global ,Airwick',
            openComplete: [true, false, true, false],
            clientSubmission: '0 of 2',
            agencySelf: 'N/A',
            agencySubmission: '0 of 2',
            clientSelf: 'N/A'
        },
        // {
        //     agency: 'Agency 2',
        //     account: 'Creative , Global ,Airwick',
        //     openComplete: [true, false, true, false],
        //     clientSubmission: '0 of 2',
        //     agencySelf: 'N/A',
        //     agencySubmission: '0 of 3',
        //     clientSelf: 'N/A'
        // }
];


  const lockTemplate = (rowData: any) => (
        <div className="flex flex-wrap gap-3">
            {/* First set */}
            <div className="flex flex-column align-items-center gap-1">
                <span className="text-xs text-gray-600 font-medium">1</span>
                <i className="pi pi-lock text-yellow-600 text-sm" />
            </div>
            <div className="flex flex-column align-items-center gap-1">
                <span className="text-xs text-gray-600 font-medium">2</span>
                <span className="text-black text-xs font-bold">__</span>
            </div>

            {/* Second set */}
            <div className="flex flex-column align-items-center gap-1">
                <span className="text-xs text-gray-600 font-medium">3</span>
                <i className="pi pi-lock text-yellow-600 text-sm" />
            </div>
            <div className="flex flex-column align-items-center gap-1">
                <span className="text-xs text-gray-600 font-medium">4</span>
                <span className="text-black text-xs font-bold">__</span>
            </div>
        </div>
    );



    return (
        <div className="p-4">
            {/* Header Info */}
            <div className="text-sm text-gray-700 mb-3">
                <div className="mb-1">
                    <strong>Evaluation:</strong> 2025-5, H1 Creative Global &nbsp;&nbsp;
                    <strong>Evaluation Type:</strong> Annual &nbsp;&nbsp;
                    <strong>Reporting Year:</strong> 2025 &nbsp;&nbsp;
                    <strong>Reporting Month:</strong> 5
                </div>
            </div>

            {/* Table */}
            <DataTable value={data} selection={selectedRows} onSelectionChange={(e) => setSelectedRows(e.value)} selectionMode="checkbox" dataKey="account" className="text-sm">
                <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
                <Column field="agency" header="AGENCY" />
                <Column field="account" header="ACCOUNT" />
                <Column header="OPEN/COMPLETE" body={lockTemplate} />
                <Column field="clientSubmission" header="CLIENT SUBMISSION (2)" />
                <Column field="agencySelf" header="AGENCY SELF (2)" />
                <Column field="agencySubmission" header="AGENCY SUBMISSION (2)" />
                <Column field="clientSelf" header="CLIENT SELF" />
            </DataTable>
        </div>
    );
};

export default TablePage;
