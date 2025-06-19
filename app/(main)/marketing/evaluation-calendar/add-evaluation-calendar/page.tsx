'use client';

import React, { useState } from 'react';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { RadioButton } from 'primereact/radiobutton';
import { Button } from 'primereact/button';
import Link from 'next/link';

const years = Array.from({ length: 11 }, (_, i) => 2020 + i);
const periods = ['H1', 'H2', 'Q1', 'Q2', 'Q3', 'Q4', 'Jan', 'Feb'];
const reviewTypes = ['Reckitt to Agency', 'Agency to Reckitt'];
const evaluationTypes = [
  'Media - TV',
  'Media - Digital',
  'Media - TV/Digital/Planning',
  'Media - Strategy',
  'Media - Agency',
  'Creative - CMM/BM',
  'Creative - CDM',
  'Creative - PD',
  'Creative - CDO',
  'Creative - MX',
  'Creative - PRO',
  'Brand Experience',
  'Content Studio',
  'Production',
  'CRM',
  'Digital In-house',
  'Medical Marketing Base',
  'Medical Marketing VERVE'
];
const buList = ['Nutrition', 'Reckitt', 'Essential Home', 'Health', 'Hygiene'];
const countries = [
  'AE-Utd.Arab Emir.',
  'AR-Argentina',
  'AT-Austria',
  'AU-Australia',
  'BD-Bangladesh',
  'BE-Belgium',
  'BH-Bahrain',
  'BR-Brazil',
  'CA-Canada'
];
const versions = ['Original'];
const brands = [
  'Aerogard (Reckitt)',
  'Air Wick (Reckitt)',
  'Allerfre',
  'Attest',
  'Benactiv Gola',
  'Benagol',
  'Blitz',
  'Bonjela',
  'Brasso (Reckitt)',
  'Buprex',
  'Calgon (Reckitt)'
];

const EvaluationCalendarForm: React.FC = () => {
  const [selectedReminderType, setSelectedReminderType] = useState<string>('Automatic');
  const [startDate, setStartDate] = useState<Date | null>(new Date());
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [reminderType, setReminderType] = useState<'Automatic' | 'Manual'>('Automatic');
  const [reminders, setReminders] = useState<(Date | null)[]>([new Date(), new Date(), new Date()]);

  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);
  const [selectedReviewType, setSelectedReviewType] = useState<string | null>(null);
  const [selectVersion, setSelectVersion] = useState<string | null>(null);

  const [selectedEvalType, setSelectedEvalType] = useState<string | null>(null);
  const [selectedBU, setSelectedBU] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState<string | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);

  const addReminder = () => {
    setReminders([...reminders, null]);
  };

  const updateReminder = (value: Date | null, index: number) => {
    const updated = [...reminders];
    updated[index] = value;
    setReminders(updated);
  };

  return (
    <div className="card ">
      <div className="bg-white ">
        <div>
          <h3 className="px-10 py-4 flex gap-3 ">
            <span>
              <Link href="/marketing/evaluation-calendar">
                <i className="pi pi-arrow-left text-black"></i>
              </Link>
            </span>
            Add Evaluation Calendar
          </h3>
          <hr />
        </div>
        <div className="grid mt-4 px-10">
          <div className="grid">
            <div className="col-12 md:col-4 lg:col-3">
              <label>Year</label>
              <Dropdown value={selectedYear} options={years} onChange={(e) => setSelectedYear(e.value)} placeholder="Year*" className="w-full mt-2" />
            </div>
            <div className="col-12 md:col-4 lg:col-3">
              <label>Evaluation Period</label>
              <Dropdown value={selectedPeriod} options={periods} onChange={(e) => setSelectedPeriod(e.value)} placeholder="Evaluation Period*" className="w-full mt-2" />
            </div>
            <div className="col-12 md:col-4 lg:col-3">
              <label>Review Type</label>
              <Dropdown value={selectedReviewType} options={reviewTypes} onChange={(e) => setSelectedReviewType(e.value)} placeholder="Review Type*" className="w-full mt-2" />
            </div>
            <div className="col-12 md:col-4 lg:col-3">
              <label>Evaluation Type</label>
              <Dropdown value={selectedEvalType} options={evaluationTypes} onChange={(e) => setSelectedEvalType(e.value)} placeholder="Evaluation Type*" className="w-full mt-2" />
            </div>
            <div className="col-12 md:col-4 lg:col-3">
              <label>BU</label>
              <Dropdown value={selectedBU} options={buList} onChange={(e) => setSelectedBU(e.value)} placeholder="BU*" className="w-full mt-2" />
            </div>
            <div className="col-12 md:col-4 lg:col-3">
              <label>Country (Optional)</label>
              <Dropdown value={selectedCountry} options={countries} onChange={(e) => setSelectedCountry(e.value)} placeholder="Country" className="w-full mt-2" />
            </div>
            <div className="col-12 md:col-4 lg:col-3">
              <label>Version</label>
              <Dropdown value={selectVersion} options={versions} onChange={(e) => setSelectVersion(e.value)} placeholder="Versions" className="w-full mt-2" />
            </div>
            <div className="col-12 md:col-4 lg:col-3">
              <label>Brand</label>
              <Dropdown value={selectedBrand} options={brands} onChange={(e) => setSelectedBrand(e.value)} placeholder="Brand" className="w-full mt-2" />
            </div>
          </div>
        </div>
        <div className="px-10 mt-10 border-round w-full ">
          <div className="border border-1 border-round-lg p-4 primary-background">
            <div className="flex justify-content-between">
              <div className="text-xl font-semibold mb-4">Project Timeline</div>
              <div className="text-xl font-semibold mb-4">
                <i className="pi pi-minus"></i>
              </div>
            </div>
            <div className="grid">
              <div className="col-12 md:col-6 lg:col-6">
                <label className="block mb-2">When Initialize</label>
                <Calendar value={startDate} onChange={(e) => setStartDate(e.value ?? null)} showIcon dateFormat="mm/dd/yy" className="w-full" />
              </div>
              <div className="col-12 md:col-6 lg:col-6">
                <label className="block mb-2">When Finish</label>
                <Calendar value={endDate} onChange={(e) => setEndDate(e.value ?? null)} showIcon dateFormat="mm/dd/yy" className="w-full" />
              </div>
            </div>
          </div>

          <div className="border border-1 border-round-lg p-4 primary-background mt-10">
            <div className="flex justify-content-between">
              <div className="text-xl font-semibold mb-3 ">Reminders</div>
              <div className="text-xl font-semibold mb-4">
                <i className="pi pi-minus"></i>
              </div>
            </div>

            <div className="flex align-items-center gap-3 mb-3">
              <label>Select Type of Reminder:</label>
              <div className="flex align-items-center gap-2">
                <RadioButton inputId="auto" name="reminder" value="Automatic" onChange={(e) => setReminderType(e.value)} checked={reminderType === 'Automatic'} />
                <label htmlFor="auto">Automatic</label>
              </div>
              <div className="flex align-items-center gap-2">
                <RadioButton inputId="manual" name="reminder" value="Manual" onChange={(e) => setReminderType(e.value)} checked={reminderType === 'Manual'} />
                <label htmlFor="manual">Manual</label>
              </div>
            </div>

            <div className="border border-1 border-round-lg bg-white p-5">
              <h6>1. Before Completion (In Days)</h6>
              <div className="grid mb-3">
                {reminders.map((reminder, index) => (
                  <div key={index} className="col-12 md:col-4">
                    <label className="block mb-2">Reminder {index + 1}</label>
                    <Calendar value={reminder} onChange={(e) => updateReminder(e.value ?? null, index)} showIcon dateFormat="mm/dd/yy" className="w-full" />
                  </div>
                ))}
              </div>
              <Button icon="pi pi-plus" className="p-button-sm mb-4" onClick={addReminder} />
            </div>
          </div>
          <div className="flex justify-content-end gap-2 mt-5 pb-5">
            <Button label="Cancel" severity="secondary" className="p-button-outlined" />
            <Link href={'/marketing/evaluation-calendar/add-evaluation-calendar/add-evaluation-step2'}>
              <Button label="Next" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EvaluationCalendarForm;
