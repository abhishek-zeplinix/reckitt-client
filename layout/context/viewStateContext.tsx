'use client';
import React, { createContext, useContext } from 'react';

interface ViewState {
  isViewing: boolean;
  viewData: any;
}

interface ViewStates {
  evaluationSetup: ViewState;
  evaluationProgress: ViewState;
  summary: ViewState;
}

interface ViewStateContextType {
  viewStates: ViewStates;
  setViewState: (tab: string, state: { isViewing: boolean; viewData?: any }) => void;
  goBackToMain: (tab: string) => void;
}

const ViewStateContext = createContext<ViewStateContextType | null>(null);

export const useViewState = () => {
  const context = useContext(ViewStateContext);
  if (!context) {
    throw new Error('useViewState must be used within ViewStateProvider');
  }
  return context;
};

export { ViewStateContext };