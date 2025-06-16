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

function MarketingLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const {setShowBulkUploadDialog} = useMarketing()

  useEffect(() => {
    const currentTabIndex = TABS_CONFIG.findIndex(tab => pathname === tab.path || pathname.startsWith(tab.path + '/'));
    if (currentTabIndex !== -1) {
      setActiveIndex(currentTabIndex);
    } else if (pathname === '/marketing' || pathname === '/marketing/') {
      const firstTabPath = TABS_CONFIG[0]?.path;
      if (firstTabPath) {
        router.replace(firstTabPath);
      }
    }
  }, [pathname, router]);

  const onTabChange = (index: number) => {
    if (index !== activeIndex) {
      const targetPath = TABS_CONFIG[index]?.path;
      if (targetPath) {
        router.push(targetPath);
      }
    }
  };

  const tabs = TABS_CONFIG.map((tab, index) => ({
    name: tab.name,
    path: tab.path,
    icon: tab.icon,
    content: children,
    ...(tab.name === 'Master' && {
      actionButton: {
        icon: 'pi pi-upload',
        label: 'Bulk Upload',
        onClick: () => setShowBulkUploadDialog(true),
        tooltip: 'Upload bulk master data',
        className: 'pink'
      }
    })
  }));

  return (
      <div className="marketing-layout">
        <CustomTabView
          tabs={tabs}
          activeIndex={activeIndex}
          onTabChange={onTabChange}
          className="marketing-custom-tabview"
        />
      </div>
  );
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <MarketingLayoutProvider>
      <MarketingLayoutContent>{children}</MarketingLayoutContent>
    </MarketingLayoutProvider>
  );
}