"use client";

import { MarketingLayoutProvider, useMarketing } from "@/layout/context/marketingContext";
import CustomTabView from '@/components/market-master/customTabView';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

const TABS_CONFIG = [
  { name: 'Master', path: '/marketing/master', icon: 'pi pi-fw pi-database' },
  { name: 'Evaluation', path: '/marketing/marketing-evaluation-dev', icon: 'pi pi-fw pi-chart-line' },
  { name: 'Detail', path: '/marketing/marketing-details-dev', icon: 'pi pi-fw pi-list' },
  { name: 'Escalation', path: '/marketing/escalation', icon: 'pi pi-fw pi-list' },
  { name: 'Analysis & Setup', path: '/marketing/analysis-setup', icon: 'pi pi-fw pi-cog' },
];


export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketingLayoutProvider>
      {children}
    </MarketingLayoutProvider>
  );
}