import React, { useEffect, useRef } from 'react';
import { OverlayPanel } from 'primereact/overlaypanel';
import { Checkbox } from 'primereact/checkbox';
import { Button } from 'primereact/button';

interface ChildVendor {
    bu: any;
    region: any;
    country: any;
    brand: any;
    vendorId: number;
    vendorName: string;
}

interface Vendor {
    region: string;
    country: string;
    brand: string;
    bu: string;
    vendorId: number;
    vendorName: string;
    childVendors: ChildVendor[];
}
interface SelectedVendor {
  vendorId: number;
  vendorName: string;
  region: string;
  country: string;
  brand: string;
  bu:string;
  childVendor: {
    vendorId: number;
    vendorName: string;
    region: string;
    country: string;
    brand: string;
    bu:string;
  }[];
}


interface CustomVendorDropdownProps {
  options: Vendor[];
  value: Record<number, boolean>;
  onChange: (
    selected: SelectedVendor[],
    updatedValue: Record<number, boolean>
  ) => void;
  placeholder?: string;
  label?: string;
}



const CustomVendorDropdown: React.FC<CustomVendorDropdownProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Select Vendor',
    label = 'Vendors'
}) => {
    const mainOp = useRef<OverlayPanel>(null);
    const childOps = useRef<{ [key: string]: OverlayPanel | null }>({});
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleScroll = () => {
            mainOp.current?.hide();
            Object.values(childOps.current).forEach((child) => child?.hide());
        };
        window.addEventListener('scroll', handleScroll, true);
        return () => {
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, []);
    useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Node;

        const isClickInsideMain = mainOp.current?.getElement()?.contains(target);
        const isClickInsideAnyChild = Object.values(childOps.current).some(
            (op) => op?.getElement()?.contains(target)
        );

        const isClickInsideContainer = containerRef.current?.contains(target);

        if (!isClickInsideMain && !isClickInsideAnyChild && !isClickInsideContainer) {
            mainOp.current?.hide();
            Object.values(childOps.current).forEach((child) => child?.hide());
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, []);

// Utility to build the formatted structure
const buildSelectedVendorTree = (
  options: Vendor[],
  selected: Record<number, boolean>
): SelectedVendor[] => {
  return options.reduce((acc: SelectedVendor[], vendor) => {
    const isParentSelected = selected[vendor.vendorId];
    const selectedChildren = vendor.childVendors.filter(child => selected[child.vendorId]);

    if (isParentSelected || selectedChildren.length > 0) {
      acc.push({
        vendorId: vendor.vendorId,
        vendorName: vendor.vendorName,
        region: vendor.region,
        country: vendor.country,
        brand: vendor.brand,
        bu:vendor.bu,
        childVendor: selectedChildren.map(child => ({
          vendorId: child.vendorId,
          vendorName: child.vendorName,
          region: child.region,
          country: child.country,
          brand: child.brand,
          bu:child.bu
        }))
      });
    }

    return acc;
  }, []);
};

   const handleParentToggle = (vendor: Vendor) => {
  const isSelected = !!value[vendor.vendorId];
  const updated = { ...value };

  updated[vendor.vendorId] = !isSelected;
  vendor.childVendors.forEach(child => {
    updated[child.vendorId] = !isSelected;
  });

  const structured = buildSelectedVendorTree(options, updated);
  onChange(structured, updated); // <-- pass updated map
};


const handleChildToggle = (child: ChildVendor, parent: Vendor) => {
  const updated = { ...value, [child.vendorId]: !value[child.vendorId] };

  const allChildrenSelected = parent.childVendors.every(child => updated[child.vendorId]);
  updated[parent.vendorId] = allChildrenSelected;

  const structured = buildSelectedVendorTree(options, updated);
  onChange(structured, updated); // <-- pass updated map
};



    const isIndeterminate = (vendor: Vendor) => {
        const children = vendor.childVendors;
        const selectedChildren = children.filter(child => value[child.vendorId]);
        return (
            selectedChildren.length > 0 &&
            selectedChildren.length < children.length
        );
    };

    const handleLabelClick = (e: React.MouseEvent, vendor: Vendor) => {
        if (vendor.childVendors.length > 0) {
            e.preventDefault();
            
            Object.entries(childOps.current).forEach(([key, op]) => {
                if (key !== vendor.vendorId.toString() && op) {
                    op.hide();
                }
            });
            
            childOps.current[vendor.vendorId]?.toggle(e);
        }
    };

    // Function to get selected vendor names
    const getSelectedVendorNames = () => {
    const selectedNames: string[] = [];

    options.forEach(vendor => {
        if (value[vendor.vendorId]) {
            selectedNames.push(vendor.vendorName);
        }
        vendor.childVendors.forEach(child => {
            if (value[child.vendorId]) {
                selectedNames.push(child.vendorName);
            }
        });
    });

    if (selectedNames.length === 0) return placeholder;

    const limitedNames = selectedNames.slice(0, 3);
    return selectedNames.length > 3
        ? `${limitedNames.join(', ')}...`
        : limitedNames.join(', ');
};


    return (
        <div className="field relative" ref={containerRef}>
            {label && <label>{label}</label>}
            <Button
                label={getSelectedVendorNames()}
                className="w-full justify-start text-left bg-white text-gray-500 border-gray-300 normal-case"
                onClick={(e) => mainOp.current?.toggle(e)}
                icon="pi pi-chevron-down"
                iconPos="right"
            />
            <OverlayPanel ref={mainOp} className="p-0" dismissable={false} style={{ zIndex: 1000 }}>
                <div className="p-2" style={{ minWidth: '220px', maxHeight: '300px', overflowY: 'auto' }}>
                    {options.map((vendor) => (
                        <div
                            key={vendor.vendorId}
                            className="flex align-items-center justify-content-between hover:bg-primary-50 p-2"
                        >
                            <div className="flex align-items-center w-full">
                                <Checkbox
                                    inputId={`vendor-${vendor.vendorId}`}
                                    checked={!!value[vendor.vendorId]}
                                    onChange={() => handleParentToggle(vendor)}
                                    className="mr-2"
                                    onClick={(e) => e.stopPropagation()}
                                    {...(isIndeterminate(vendor) ? { 'data-indeterminate': true } : {})}
                                />
                                <label
                                    htmlFor={`vendor-${vendor.vendorId}`}
                                    className="flex-grow-1 cursor-pointer"
                                    onClick={(e) => handleLabelClick(e, vendor)}
                                >
                                    {vendor.vendorName}
                                </label>
                            </div>
                            {vendor.childVendors.length > 0 && (
                                <i 
                                    className="pi pi-angle-right cursor-pointer ml-2"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        Object.entries(childOps.current).forEach(([key, op]) => {
                                            if (key !== vendor.vendorId.toString() && op) {
                                                op.hide();
                                            }
                                        });
                                        childOps.current[vendor.vendorId]?.toggle(e);
                                    }}
                                />
                            )}
                            <OverlayPanel
                                ref={(el) => (childOps.current[vendor.vendorId] = el)}
                                className="ml-6 p-2"
                                dismissable={false}
                                style={{ minWidth: '220px', maxHeight: '300px', overflowY: 'auto' }}
                            >
                                {vendor.childVendors.map((child) => (
                                    <div key={child.vendorId} className="flex align-items-center mb-2">
                                        <Checkbox
                                            inputId={`child-${child.vendorId}`}
                                            checked={!!value[child.vendorId]}
                                            onChange={() => handleChildToggle(child, vendor)}
                                            className="mr-2"
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <label
                                            htmlFor={`child-${child.vendorId}`}
                                            className="cursor-pointer"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                            }}
                                        >
                                            {child.vendorName}
                                        </label>
                                    </div>
                                ))}
                            </OverlayPanel>
                        </div>
                    ))}
                </div>
            </OverlayPanel>
        </div>
    );
};

export default CustomVendorDropdown;