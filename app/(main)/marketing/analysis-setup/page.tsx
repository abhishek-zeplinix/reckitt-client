'use client';
import React, { useState } from 'react';
import { TabView, TabPanel } from 'primereact/tabview';
import EvaluationSetup from '@/components/analysis-setup/evaluation-setup';
import EvaluationProgress from '@/components/analysis-setup/evaluation-progress';
import Summary from '@/components/analysis-setup/summary';
import ViewAccountDetails from '@/components/analysis-setup/view-account-details';
import { ViewStateContext } from '@/layout/context/viewStateContext';
import ViewProgressDetails from '@/components/analysis-setup/view-progress-details';

const TABS_CONFIG = [
    {
        id: 'evaluationSetup',
        label: 'Evaluation Setup',
        component: 'EvaluationSetup',
        detailComponent: 'ViewAccountDetails'
    },
    {
        id: 'evaluationProgress',
        label: 'Evaluation Progress',
        component: 'EvaluationProgress',
        detailComponent: 'ViewProgressDetails'
    },
    {
        id: 'summary',
        label: 'Summary',
        component: 'Summary'
    },
];

const AnalysisAndSetup = () => {
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [viewStates, setViewStates] = useState({
        evaluationSetup: { isViewing: false, viewData: null },
        evaluationProgress: { isViewing: false, viewData: null },
        summary: { isViewing: false, viewData: null },
    });

    const setViewState = (tab: string, state: { isViewing: boolean; viewData?: any }) => {
        console.log('setViewState called:', { tab, state });
        setViewStates(prev => {
            const newState = {
                ...prev,
                [tab]: state
            };
            console.log('New viewStates:', newState);
            return newState;
        });
    };

    const goBackToMain = (tab: string) => {
        console.log('goBackToMain called for tab:', tab);
        setViewState(tab, { isViewing: false, viewData: null });
    };

    const renderTabContent = (tabId: string) => {
        const tabConfig = TABS_CONFIG.find(tab => tab.id === tabId);
        const viewState = viewStates[tabId as keyof typeof viewStates];

        if (viewState?.isViewing) {

            const DetailComponent: any = {
                'ViewAccountDetails': ViewAccountDetails,
                'ViewProgressDetails': ViewProgressDetails
            }[tabConfig?.detailComponent || 'ViewAccountDetails'];

            return (
                <DetailComponent
                    data={viewState.viewData}
                    onBack={() => {
                        goBackToMain(tabId);
                    }}
                />
            );
        }

        switch (tabId) {
            case 'evaluationSetup':
                return <EvaluationSetup />;
            case 'evaluationProgress':
                return <EvaluationProgress />;
            case 'summary':
                return <Summary />;
            default:
                return null;
        }
    };

    const contextValue = {
        viewStates,
        setViewState,
        goBackToMain
    };

    console.log('Current viewStates in render:', viewStates);

    return (
        <ViewStateContext.Provider value={contextValue}>
            <div className="grid">
                <div className="col-12">
                    <TabView
                        activeIndex={activeTabIndex}
                        onTabChange={(e) => setActiveTabIndex(e.index)}
                        className="master-sub-tabview"
                    >
                        {TABS_CONFIG.map((tab) => (
                            <TabPanel key={tab.id} header={tab.label}>
                                {renderTabContent(tab.id)}
                            </TabPanel>
                        ))}
                    </TabView>
                </div>
            </div>
        </ViewStateContext.Provider>
    );
};

export default AnalysisAndSetup;