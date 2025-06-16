'use client';
import { MarketingMasterProvider } from "@/layout/context/marketingMasterContext";


const MasterLayout =({ children }: any) =>{
    return (
        <MarketingMasterProvider>
            {children}
        </MarketingMasterProvider>
    );
}

export default MasterLayout;