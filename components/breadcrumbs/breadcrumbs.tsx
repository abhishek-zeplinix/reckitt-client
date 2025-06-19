'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';

const Breadcrumbs = () => {
  const pathname = usePathname();
  const router = useRouter();

  const segments = pathname
    .split('/')
    .filter(Boolean);

  const handleClick = (index: any) => {
    const path = '/' + segments.slice(0, index + 1).join('/');
    router.push(path);
  };

  return (
    <nav className="text-sm text-gray-600 flex flex-wrap gap-1">
      {segments.map((segment, index) => {
        const label = segment
          .replace(/-/g, ' ')              
          .replace(/\b\w/g, c => c.toUpperCase());

        const isLast = index === segments.length - 1;

        return (
          <div key={index} className="flex items-center gap-1">
            {!isLast ? (
              <p
                // onClick={() => handleClick(index)}
                // className="text-blue-600 hover:underline capitalize"
              >
                {label}
              </p>
            ) : (
              <span className="capitalize">{label}</span>
            )}
            {!isLast && <span>/</span>}
          </div>
        );
      })}
    </nav>
  );
};

export default Breadcrumbs;
