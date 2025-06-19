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
    const { hasPermission, hasAnyPermission } = useAuth();
    const { user } = useAppContext();
    const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
    const mobileMenuRef = useRef<Menu>(null);
    const pathname = usePathname();

    const handleNavigation = (url: string) => {
        router.push(url);
        setMobileMenuVisible(false);
    };

    // check if user has permission for menu item
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
            icon: 'pi pi-home',
            command: () => handleNavigation('/'),
            visible: checkPermission(['manage_faq', 'manage_supply_glossary']),
        },
        {
            label: 'Marketing',
            icon: 'pi pi-megaphone',
            visible: checkPermission(['manage_faq', 'manage_supply_glossary']),
            items: [
                {
                    label: 'Dashboard',
                    icon: 'pi pi-cog',
                    command: () => handleNavigation('/'),
                    visible: checkPermission('manage_faq')
                },
                {
                    label: 'Master',
                    icon: 'pi pi-download',
                    items: [
                        {
                            label: 'Area Base',
                            icon: 'pi pi-file',
                            command: () => handleNavigation('/marketing/master/area-base'),
                            visible: checkPermission('export_data')
                        },
                        {
                            label: 'Review Type',
                            icon: 'pi pi-file',
                            command: () => handleNavigation('/marketing/master/review-type'),
                            visible: checkPermission('export_data')
                        },
                        {
                            label: 'Evaluation Type',
                            icon: 'pi pi-file',
                            command: () => handleNavigation('/marketing/master/evaluation-type'),
                            visible: checkPermission('export_data')
                        },
                        {
                            label: 'BU Master',
                            icon: 'pi pi-file',
                            command: () => handleNavigation('/marketing/master/bu-master'),
                            visible: checkPermission('export_data')
                        },
                        {
                            label: 'Evaluation Period',
                            icon: 'pi pi-file',
                            command: () => handleNavigation('/marketing/master/evaluation-period'),
                            visible: checkPermission('export_data')
                        },
                        {
                            label: 'Brand Master',
                            icon: 'pi pi-file',
                            command: () => handleNavigation('/marketing/master/brand-master'),
                            visible: checkPermission('export_data')
                        }
                    ]
                },
                {
                    label: 'Employee Data',
                    icon: 'pi pi-file-edit',
                    command: () => handleNavigation('/marketing/master/employee'),
                    visible: checkPermission('manage_supply_glossary')
                },
                {
                    label: 'Vendor Base',
                    icon: 'pi pi-info-circle',
                    command: () => handleNavigation('/marketing/master/vendor-base'),
                    visible: checkPermission('manage_supply_glossary')
                },
                {
                    label: 'Question Base',
                    icon: 'pi pi-question-circle',
                    command: () => handleNavigation('/marketing/marketing-details-dev'),
                    visible: checkPermission('manage_supply_glossary')
                },
                // {
                //     separator: true,
                //     visible: checkPermission('manage_supply_glossary')
                // },
               
            ]
        }

       
    ];

    // Filter menu items based on visibility
    const filterMenuItems = (items: MenuItem[]): MenuItem[] => {
        return items
            .filter((item) => item.visible !== false)
            .map((item) => ({
                ...item,
                items: item.items ? filterMenuItems(item.items as any) : undefined
            }))
            .filter((item) => !item.items || item.items.length > 0);
    };

    const filteredMenuItems = filterMenuItems(menuItems);

    // Mobile menu items (flattened structure)
    const getMobileMenuItems = (): MenuItem[] => {
        const flattenItems = (items: MenuItem[], level = 0): MenuItem[] => {
            const result: MenuItem[] = [];

            items.forEach((item) => {
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
                <span className="text-sm text-600 hidden md:inline">{get(user, 'name', 'User')}</span>
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
            <Menu ref={mobileMenuRef} model={getMobileMenuItems()} popup className="md:hidden" style={{ width: '250px' }} />
        </div>
    );

    console.log('Filtered Menu Items:', JSON.stringify(filteredMenuItems, null, 2));

    return (
        <div className={`surface-0 shadow-2 ${className}`}>
            <Menubar
                model={filteredMenuItems}
                // start={start}
                // end={end}
                className="border-none surface-0 font-bold"
                style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '0'
                }}  
            />
        </div>
    );
};

export default AppMenuTop;
