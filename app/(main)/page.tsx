'use client';
import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { TabView, TabPanel } from 'primereact/tabview';
import Breadcrumbs from '@/components/breadcrumbs/breadcrumbs';

const dummyData = [
    {
        account: 'Creative, Global, Airwick',
        score: 4.5,
        agencies: [
            { name: 'Havas', status: 'Pending' },
            { name: 'Havas', status: 'In progress' },
            { name: 'Havas', status: 'Completed' }
        ]
    },
    {
        account: 'Creative, Global, Gaviscon',
        score: 7.4,
        agencies: [
            { name: 'Harpic', status: 'Pending' },
            { name: 'Harpic', status: 'In progress' },
            { name: 'Harpic', status: 'Completed' }
        ]
    }
];

// Dummy data for the dialog
const dummyTemplateTypes = [
    {
        templateTypeId: 1,
        templateTypeName: 'Brand Guidelines',
        questions: [
            { id: 1, question: 'Are brand colors properly defined?' },
            { id: 2, question: 'Is the logo usage clearly explained?' }
        ]
    },
    {
        templateTypeId: 2,
        templateTypeName: 'Social Media',
        questions: [
            { id: 3, question: 'Are posting guidelines provided?' },
            { id: 4, question: 'Is the tone of voice specified?' }
        ]
    }
];

const renderScoreTable = () => {
    const data = [
        {
            name: "Strategy & Planning",
            assessors: [
                { name: "Assessor 1", score: 2 },
                { name: "Assessor 2", score: 4 },
                { name: "Assessor 3", score: 2 },
                { name: "Assessor 4", score: 2 },
            ]
        },
        {
            name: "Planning & Execution",
            assessors: [
                { name: "Assessor 1", score: 2 },
                { name: "Assessor 2", score: 4 },
                { name: "Assessor 3", score: 2 },
                { name: "Assessor 4", score: 1 },
            ]
        }
    ];

    return (
        <div className="overflow-auto">
    <table className="w-full text-sm text-gray-700 border-1 border-gray-300 border-round" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
        <thead className="bg-gray-100">
            <tr>
                <th className="text-left px-4 py-2 border-1 border-gray-300 border-r">Name</th>
                <th className="text-left px-4 py-2 border-1 border-gray-300 border-r">Assessor</th>
                <th className="text-left px-4 py-2 border-1 border-gray-300">Score</th>
            </tr>
        </thead>
        <tbody>
            {data.map((group, groupIndex) => (
                <React.Fragment key={groupIndex}>
                    {group.assessors.map((assessor, assessorIndex) => (
                        <tr key={`${groupIndex}-${assessorIndex}`}>
                            {assessorIndex === 0 && (
                                <td 
                                    rowSpan={group.assessors.length} 
                                    className="px-4 py-2 font-medium border-right-1 border-gray-300 border-r"
                                    style={{ 
                                        verticalAlign: 'middle',
                                        textAlign: 'center',
                                        height: '100%'
                                    }}
                                >
                                    <div className="flex items-center justify-center h-full">
                                        {group.name}
                                    </div>
                                </td>
                            )}
                            <td className="px-4 py-2 border-right-1 border-gray-300 border-r">{assessor.name}</td>
                            <td className="px-4 py-2 border-b border-gray-300">
                                <div className="bg-gray-200 w-12 text-center border-round">
                                    {assessor.score}
                                </div>
                            </td>
                        </tr>
                    ))}
                    {/* More visible divider between groups */}
                    {groupIndex < data.length - 1 && (
                        <tr>
                            <td colSpan={3} className="p-0">
                                <div style={{ 
                                    height: '1px', 
                                    backgroundColor: '#d1d5db'
                                }}></div>
                            </td>
                        </tr>
                    )}
                </React.Fragment>
            ))}
        </tbody>
    </table>
</div>
    );
};

type StatusType = 'Pending' | 'In progress' | 'Completed';
type SeverityType = 'danger' | 'warning' | 'success' | 'info';

const statusSeverity: Record<StatusType, SeverityType> = {
    'Pending': 'danger',
    'In progress': 'warning',
    'Completed': 'success'
};
const statusColorMap: Record<SeverityType, string> = {
    danger: '#f87171',    // red-400
    warning: '#fbbf24',   // amber-400
    success: '#4ade80',   // green-400
    info: '#60a5fa'       // blue-400
};

const Summary = () => {
    const headerStats = [
  { label: 'BU', value: 164 },
  { label: 'Countries', value: 324 },
  { label: 'Total Vendors', value: 1240 },
  { label: 'Brand', value: 286 },
  { label: 'Total Employee', value: 150 },
  { label: 'Assesments', value: 400 },
  { label: 'Ongoing Assesments', value: 518 },
  { label: 'Completed Assesments', value: 322 }
];


    return (
        <div className="p-6">
            {/* Top Summary Cards */}
            <div className="flex flex-column">
                        <h2 className="m-0">Marketing Dashboard</h2>
                        <p className="text-sm text-gray-600 mt-1"><Breadcrumbs /></p>
                    </div>
            <div className="grid m-4">
                {headerStats.map((stat, idx) => (
                    <div className="col-6 md:col-3" key={idx}>
                        <div className="flex align-items-center border-1 border-gray-700 p-2 gap-3 text-center border-round h-4rem">
                            <h3 className="m-0 text-lg font-medium">{stat.value}</h3>
                            <span className="text-xs">{stat.label}</span>
                        </div>
                    </div>
                ))}

            </div>
        </div>
    );
};

export default Summary;