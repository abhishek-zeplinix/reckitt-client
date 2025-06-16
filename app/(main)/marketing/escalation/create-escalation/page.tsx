'use client';
import { useRouter } from "next/navigation";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { Dropdown } from "primereact/dropdown";
import { Panel } from "primereact/panel";
import { RadioButton } from "primereact/radiobutton";
import { useState } from "react";

const CreateEscalation = () => {
    const [showEvaluationDetailsTemplatePanel, setShowEvaluationDetailsTemplatePanel] = useState(true);
    const [showProjectTimelineTemplatePanel, setShowProjectTimelineTemplatePanel] = useState(true);
    const [showReminderTemplatePanel, setShowReminderTemplatePanel] = useState(true);
    const [implementDate, setImplementDate] = useState<Date | null>(null);
    const [reminderType, setReminderType] = useState<string | null>("Manual");
    const [initializeDate, setInitializeDate] = useState<Date | null>(null);
    const [finishDate, setFinishDate] = useState<Date | null>(null);
    const router = useRouter();

    const handleBackClick = () => {
        router.push('/marketing/escalation');
    }

    const templatePanelHeader = (header: string) => (
        <div className="flex align-items-center justify-content-between">
            <span className="font-medium">{header}</span>
        </div>
    );

    return (
        <div>
            <div className="flex justify-content-between items-center mb-4">
                <div className="flex align-items-center flex-nowrap gap-1">
                    <i className="mr-2 text-700 text-lg pi pi-arrow-left" onClick={handleBackClick} />
                    <h3>Escalation Mapping With Timeline</h3>
                </div>

            </div>
            <div className="flex flex-column gap-4">
                <Panel
                    header={templatePanelHeader("Evaluation Details")}
                    toggleable
                    collapsed={!showEvaluationDetailsTemplatePanel}
                    onToggle={(e) => setShowEvaluationDetailsTemplatePanel(!e.value)}
                    className="custom-panel-viewaccounts"
                >
                    <div className="grid mb-3">
                        <div className="col-12 md:col-6">
                            <label htmlFor="Account Name" className="block mb-2">Account Name</label>
                            <input id="escalationName" type="text" className="p-inputtext p-component w-full" />
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="Implementation Month" className="block mb-2">Implementation Month</label>
                            <Calendar
                                id="implementDate"
                                value={implementDate}
                                onChange={(e) => setImplementDate(e.value as Date)}
                                className="w-full"
                                showIcon
                                dateFormat="mm/yy"
                                placeholder="Select Implementation Date"
                                inputClassName="w-full"
                            />
                        </div>
                    </div>
                </Panel>

                <Panel
                    header={templatePanelHeader("Project Timeline")}
                    toggleable
                    collapsed={!showProjectTimelineTemplatePanel}
                    onToggle={(e) => setShowProjectTimelineTemplatePanel(!e.value)}
                    className="custom-panel-viewaccounts"
                >
                    <div className="grid mb-3">
                        <div className="col-12 md:col-6">
                            <label htmlFor="WhenInitialize" className="block mb-2">When Initialize</label>
                            <Calendar
                                id="WhenInitialize"
                                value={initializeDate}
                                onChange={(e) => setInitializeDate(e.value as Date)}
                                className="w-full"
                                showIcon
                                dateFormat="dd/mm/yy"
                                placeholder="Select Implementation Date"
                                inputClassName="w-full"
                            />
                            <p className="text-sm text-primary mt-2">Escalation Initiation Email Date</p>
                        </div>
                        <div className="col-12 md:col-6">
                            <label htmlFor="WhenFinish" className="block mb-2">When Finish</label>
                            <Calendar
                                id="WhenFinish"
                                value={finishDate}
                                onChange={(e) => setFinishDate(e.value as Date)}
                                className="w-full"
                                showIcon
                                dateFormat="dd/mm/yy"
                                placeholder="Select Implementation Date"
                                inputClassName="w-full"

                            />
                        </div>
                    </div>
                </Panel>

                <Panel
                    header={templatePanelHeader("Reminders")}
                    toggleable
                    collapsed={!showReminderTemplatePanel}
                    onToggle={(e) => setShowReminderTemplatePanel(!e.value)}
                    className="custom-panel-viewaccounts"
                >

                    <div className="flex mb-3">
                        <div className="flex flex-wrap gap-3 mb-3">
                            <div className="flex align-items-center">
                                <span className="font-medium mr-4">Select Type of Reminder: </span>
                                <RadioButton inputId="Automatic" name="Automatic" value="Automatic" onChange={(e) => setReminderType(e.value)} checked={reminderType === 'Automatic'} />
                                <label htmlFor="Automatic" className="ml-2">Automatic</label>
                            </div>
                            <div className="flex align-items-center">
                                <RadioButton inputId="Manual" name="Manual" value="Manual" onChange={(e) => setReminderType(e.value)} checked={reminderType === 'Manual'} />
                                <label htmlFor="Manual" className="ml-2">Manual</label>
                            </div>

                        </div>
                    </div>

                    {
                        reminderType === 'Manual' ? (
                            <div className="">

                                <div className="flex flex-column gap-3">
                                    1. Before Completions (In Days)
                                    <div className="flex flex-column mb-3 bg-white p-3 border-round border-1 surface-border w-full">


                                        <div className="flex flex-wrap gap-3 mb-3 md:flex-nowrap">
                                            <div className=" w-full">

                                                <label htmlFor="role" className="block mb-2">Select Role</label>
                                                <Dropdown
                                                    id="role"
                                                    value={initializeDate}
                                                    onChange={(e) => setInitializeDate(e.value as Date)}
                                                    className="w-full"
                                                    placeholder="Select Role"
                                                />
                                            </div>
                                            <div className=" w-full">

                                                <label htmlFor="user" className="block mb-2">Select User</label>
                                                <Dropdown
                                                    id="user"
                                                    value={initializeDate}
                                                    onChange={(e) => setInitializeDate(e.value as Date)}
                                                    className="w-full"
                                                    placeholder="Select User"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3 mb-3 md:flex-nowrap">
                                            <div className="w-full">
                                                <label htmlFor="reminder1-b" className="block mb-2">Reminder 1</label>
                                                <Calendar
                                                    id="reminder1-b"
                                                    value={initializeDate}
                                                    onChange={(e) => setInitializeDate(e.value as Date)}
                                                    className="w-full"
                                                    showIcon
                                                    dateFormat="dd/mm/yy"
                                                    placeholder="Reminder 1"
                                                    inputClassName="w-full"
                                                />
                                            </div>
                                            <div className="w-full">
                                                <label htmlFor="reminder2-b" className="block mb-2">Reminder 2</label>
                                                <Calendar
                                                    id="reminder2-b"
                                                    value={initializeDate}
                                                    onChange={(e) => setInitializeDate(e.value as Date)}
                                                    className="w-full"
                                                    showIcon
                                                    dateFormat="dd/mm/yy"
                                                    placeholder="Reminder 2"
                                                    inputClassName="w-full"
                                                />
                                            </div>
                                            <div className="w-full">
                                                <label htmlFor="reminder3-b" className="block mb-2">Reminder 3</label>
                                                <Calendar
                                                    id="reminder3-b"
                                                    value={finishDate}
                                                    onChange={(e) => setFinishDate(e.value as Date)}
                                                    className="w-full"
                                                    showIcon
                                                    dateFormat="dd/mm/yy"
                                                    placeholder="Reminder 3"
                                                    inputClassName="w-full"

                                                />
                                            </div>
                                        </div>
                                    </div>

                                </div>


                                <div className="flex flex-column gap-3">
                                    2. For Superior (In Hours)
                                    <div className="flex gap-3 flex-wrap mb-3 bg-white p-3 border-round border-1 surface-border md:flex-nowrap">

                                        <div className="w-full">

                                            <label htmlFor="role" className="block mb-2">Select Role</label>
                                            <Dropdown
                                                id="role"
                                                value={initializeDate}
                                                onChange={(e) => setInitializeDate(e.value as Date)}
                                                className="w-full"
                                                placeholder="Select Role"
                                            />
                                        </div>

                                        <div className="w-full">
                                            <label htmlFor="WhenInitialize" className="block mb-2">Reminder 1</label>
                                            <Calendar
                                                id="WhenInitialize"
                                                value={initializeDate}
                                                onChange={(e) => setInitializeDate(e.value as Date)}
                                                className="w-full"
                                                showIcon
                                                dateFormat="dd/mm/yy"
                                                placeholder="Reminder 1"
                                                inputClassName="w-full"
                                            />
                                        </div>
                                        <div className="w-full">
                                            <label htmlFor="WhenInitialize" className="block mb-2">Reminder 2</label>
                                            <Calendar
                                                id="WhenInitialize"
                                                value={initializeDate}
                                                onChange={(e) => setInitializeDate(e.value as Date)}
                                                className="w-full"
                                                showIcon
                                                dateFormat="dd/mm/yy"
                                                placeholder="Reminder 2"
                                                inputClassName="w-full"
                                            />
                                        </div>
                                        <div className="w-full">
                                            <label htmlFor="WhenFinish" className="block mb-2">Reminder 3</label>
                                            <Calendar
                                                id="WhenFinish"
                                                value={finishDate}
                                                onChange={(e) => setFinishDate(e.value as Date)}
                                                className="w-full"
                                                showIcon
                                                dateFormat="dd/mm/yy"
                                                placeholder="Reminder 3"
                                                inputClassName="w-full"

                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>

                        ) : (

                            <div className="">

                                <div className="flex flex-column gap-3">
                                    1. Before Completions (In Days)
                                    <div className="flex flex-column mb-3 bg-white p-3 border-round border-1 surface-border w-full">


                                        <div className="flex flex-wrap gap-3 mb-3 md:flex-nowrap">
                                            <div className=" w-full">

                                                <label htmlFor="role" className="block mb-2">Select Role</label>
                                                <Dropdown
                                                    id="role"
                                                    value={initializeDate}
                                                    onChange={(e) => setInitializeDate(e.value as Date)}
                                                    className="w-full"
                                                    placeholder="Select Role"
                                                />
                                            </div>
                                            <div className=" w-full">

                                                <label htmlFor="user" className="block mb-2">Select User</label>
                                                <Dropdown
                                                    id="user"
                                                    value={initializeDate}
                                                    onChange={(e) => setInitializeDate(e.value as Date)}
                                                    className="w-full"
                                                    placeholder="Select User"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-3 mb-3 md:flex-nowrap">
                                            <div className="w-full">
                                                <label htmlFor="reminder1-b" className="block mb-2">Reminder 1</label>
                                                <Calendar
                                                    id="reminder1-b"
                                                    value={initializeDate ?? new Date()}
                                                    onChange={(e) => setInitializeDate(e.value as Date)}
                                                    className="w-full"
                                                    showIcon
                                                    dateFormat="dd/mm/yy"
                                                    placeholder="Reminder 1"
                                                    inputClassName="w-full"
                                                />
                                            </div>
                                            <div className="w-full">
                                                <label htmlFor="reminder2-b" className="block mb-2">Reminder 2</label>
                                                <Calendar
                                                    id="reminder2-b"
                                                    value={initializeDate ?? new Date()}
                                                    onChange={(e) => setInitializeDate(e.value as Date)}
                                                    className="w-full"
                                                    showIcon
                                                    dateFormat="dd/mm/yy"
                                                    placeholder="Reminder 2"
                                                    inputClassName="w-full"
                                                />
                                            </div>
                                            <div className="w-full">
                                                <label htmlFor="reminder3-b" className="block mb-2">Reminder 3</label>
                                                <div className="flex flex-row gap-2">
                                                <Calendar
                                                    id="reminder3-b"
                                                    value={finishDate ?? new Date()}
                                                    onChange={(e) => setFinishDate(e.value as Date)}
                                                    className="w-full"
                                                    showIcon
                                                    dateFormat="dd/mm/yy"
                                                    placeholder="Reminder 3"
                                                    inputClassName="w-full"

                                                />

                                                 <Button label="+"></Button>
                                                 </div>
                                            </div>
                                           
                                        </div>
                                    </div>

                                </div>


                                <div className="flex flex-column gap-3">
                                    2. For Superior (In Hours)
                                    <div className="flex gap-3 flex-wrap mb-3 bg-white p-3 border-round border-1 surface-border md:flex-nowrap">

                                        <div className="w-full">

                                            <label htmlFor="role" className="block mb-2">Select Role</label>
                                            <Dropdown
                                                id="role"
                                                value={initializeDate}
                                                onChange={(e) => setInitializeDate(e.value as Date)}
                                                className="w-full"
                                                placeholder="Select Role"
                                            />
                                        </div>

                                        <div className="w-full">
                                            <label htmlFor="WhenInitialize" className="block mb-2">Reminder 1</label>
                                            <Calendar
                                                id="WhenInitialize"
                                                value={initializeDate ?? new Date()}
                                                onChange={(e) => setInitializeDate(e.value as Date)}
                                                className="w-full"
                                                showIcon
                                                dateFormat="dd/mm/yy"
                                                placeholder="Reminder 1"
                                                inputClassName="w-full"
                                            />
                                        </div>
                                        <div className="w-full">
                                            <label htmlFor="WhenInitialize" className="block mb-2">Reminder 2</label>
                                            <Calendar
                                                id="WhenInitialize"
                                                value={initializeDate ?? new Date()}
                                                onChange={(e) => setInitializeDate(e.value as Date)}
                                                className="w-full"
                                                showIcon
                                                dateFormat="dd/mm/yy"
                                                placeholder="Reminder 2"
                                                inputClassName="w-full"
                                            />
                                        </div>
                                        <div className="w-full">
                                            <label htmlFor="WhenFinish" className="block mb-2">Reminder 3</label>
                                            <Calendar
                                                id="WhenFinish"
                                                value={finishDate ?? new Date()}
                                                onChange={(e) => setFinishDate(e.value as Date)}
                                                className="w-full"
                                                showIcon
                                                dateFormat="dd/mm/yy"
                                                placeholder="Reminder 3"
                                                inputClassName="w-full"

                                            />
                                        </div>
                                    </div>

                                </div>
                            </div>
                        )
                    }

                </Panel>
            </div>
        </div>
    )
}

export default CreateEscalation;
