'use client';
import React, { useState, useRef } from 'react';
import { Menubar } from 'primereact/menubar';
import { Menu } from 'primereact/menu';
import { Button } from 'primereact/button';
import { MenuItem } from 'primereact/menuitem';
import { useRouter } from 'next/navigation';
import { get } from 'lodash';
import { useAuth } from './context/authContext';
import { useAppContext } from './AppWrapper';
import { usePathname } from 'next/navigation';

interface TopNavBarProps {
    className?: string;
}

const AppMenuTop: React.FC<TopNavBarProps> = ({ className = '' }) => {
    const router = useRouter();
    const { hasPermission, hasAnyPermission, isSupplier } = useAuth();
    const { user } = useAppContext();
    const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
    const mobileMenuRef = useRef<Menu>(null);
    const pathname = usePathname();

    const handleNavigation = (url: string) => {
        router.push(url);
        setMobileMenuVisible(false);
    };

    // Check if user has permission for menu item
    const checkPermission = (permissions: string | string[] | ((user: any) => boolean)) => {
        if (typeof permissions === 'function') {
            return permissions(user);
        }

        if (get(user, 'isSuperAdmin')) {
            return true;
        }

        if (Array.isArray(permissions)) {
            return hasAnyPermission(permissions);
        }

        return hasPermission(permissions);
    };

 

    // menu items configuration with permissions
    const menuItems: MenuItem[] = [

        {
            label: 'Marketing',
            icon: 'pi pi-megaphone',
            visible: checkPermission(['manage_faq', 'manage_supply_glossary']),
            items: [
                {
                    label: 'Dashboard',
                    icon: 'pi pi-cog',
                    command: () => handleNavigation('/marketing-master'),
                    visible: checkPermission('manage_faq')
                },
                {
                    label: 'Marketing Questions',
                    icon: 'pi pi-question-circle',
                    command: () => handleNavigation('/marketing-questions'),
                    visible: checkPermission('manage_supply_glossary')
                },
                {
                    label: 'Evaluation Name',
                    icon: 'pi pi-file-edit',
                    command: () => handleNavigation('/marketing-evaluation'),
                    visible: checkPermission('manage_supply_glossary')
                },
                {
                    label: 'Details',
                    icon: 'pi pi-info-circle',
                    command: () => handleNavigation('/marketing-details'),
                    visible: checkPermission('manage_supply_glossary')
                },
                {
                    separator: true,
                    visible: checkPermission('manage_supply_glossary')
                },
                {
                    label: 'Evaluation Setup',
                    icon: 'pi pi-wrench',
                    command: () => handleNavigation('/evaluation-setup'),
                    visible: checkPermission('manage_supply_glossary')
                },
                {
                    label: 'Evaluation Progress',
                    icon: 'pi pi-chart-line',
                    command: () => handleNavigation('/evaluation-progress'),
                    visible: checkPermission('manage_supply_glossary')
                }
            ]
        },
       
        // {
        //     label: 'Reports',
        //     icon: 'pi pi-chart-bar',
        //     visible: checkPermission((user) => get(user, 'role') === 'admin' || get(user, 'isSuperAdmin')),
        //     items: [
        //         {
        //             label: 'Sales Report',
        //             icon: 'pi pi-dollar',
        //             command: () => handleNavigation('/'),
        //             visible: checkPermission('view_sales_reports')
        //         },
        //         {
        //             label: 'User Analytics',
        //             icon: 'pi pi-users',
        //             command: () => handleNavigation('/'),
        //             visible: checkPermission('view_analytics')
        //         },
        //         {
        //             separator: true
        //         },
        //         {
        //             label: 'Export Data',
        //             icon: 'pi pi-download',
        //             items: [
        //                 {
        //                     label: 'CSV Export',
        //                     icon: 'pi pi-file',
        //                     command: () => handleNavigation('/'),
        //                     visible: checkPermission('export_data')
        //                 },
        //                 {
        //                     label: 'PDF Export',
        //                     icon: 'pi pi-file-pdf',
        //                     command: () => handleNavigation('/'),
        //                     visible: checkPermission('export_data')
        //                 }
        //             ]
        //         }
        //     ]
        // },
       
    ];

    // Filter menu items based on visibility
    const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
        return items
            .filter(item => item.visible !== false)
            .map(item => ({
                ...item,
                items: item.items ? filterMenuItems(item.items as any) : undefined
            }))
            .filter(item => !item.items || item.items.length > 0);
    };

    const filteredMenuItems = filterMenuItems(menuItems);

    // Mobile menu items (flattened structure)
    const getMobileMenuItems = (): MenuItem[] => {
        const flattenItems = (items: MenuItem[], level = 0): MenuItem[] => {
            const result: MenuItem[] = [];

            items.forEach(item => {
                if (item.visible === false) return;

                if (item.separator) {
                    result.push({ separator: true });
                    return;
                }

                const menuItem: MenuItem = {
                    label: level > 0 ? `${'  '.repeat(level)}${item.label}` : item.label,
                    icon: item.icon,
                    command: item.command,
                    className: level > 0 ? 'pl-4' : ''
                };

                result.push(menuItem);

                if (item.items && item.items.length > 0) {
                    result.push(...flattenItems(item.items as any, level + 1));
                }
            });

            return result;
        };

        return flattenItems(filteredMenuItems);
    };


    const isActive = (url: string) => {
        return pathname === url || (url !== '/' && pathname.startsWith(url));
    };

    const start = (
        <div className="flex align-items-center">
            <i className="pi pi-home mr-2 text-primary text-2xl"></i>
            <span className="text-xl font-bold text-primary">Your App</span>
        </div>
    );

    const end = (
        <div className="flex align-items-center gap-2">
            {/* User info */}
            <div className="flex align-items-center gap-2 mr-3">
                <i className="pi pi-user text-600"></i>
                <span className="text-sm text-600 hidden md:inline">
                    {get(user, 'name', 'User')}
                </span>
            </div>

            {/* Mobile menu toggle */}
            <Button
                icon="pi pi-bars"
                className="p-button-text p-button-rounded md:hidden"
                onClick={(e) => {
                    setMobileMenuVisible(!mobileMenuVisible);
                    mobileMenuRef.current?.toggle(e);
                }}
                aria-label="Menu"
            />

            {/* Mobile menu */}
            <Menu
                ref={mobileMenuRef}
                model={getMobileMenuItems()}
                popup
                className="md:hidden"
                style={{ width: '250px' }}
            />
        </div>
    );

    return (
        <div className={`surface-0 shadow-2 ${className}`}>
            <Menubar
                model={filteredMenuItems}
                // start={start}
                // end={end}
                className="border-none surface-0 font-bold app-top-menu-custom"
                style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0'
                }}
                
                
            />
        </div>
    );
};

export default AppMenuTop;