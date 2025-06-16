'use client';
import { MarketingMasterProvider } from "@/layout/context/marketingMasterContext";


const AnalysisLayout =({ children }: any) =>{
    return (
        <MarketingMasterProvider>
            {children}
        </MarketingMasterProvider>
    );
}

export default AnalysisLayout;