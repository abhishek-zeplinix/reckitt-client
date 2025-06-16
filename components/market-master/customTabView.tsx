"use client";
import { Button } from 'primereact/button';
import './styles.css';



export default function CustomTabView({ 
  tabs, 
  activeIndex, 
  onTabChange, 
  className = '' 
}: any) {
  
  return (
    <div className={`custom-tabview-container ${className}`}>
      {/* Tab Headers */}
      <div className="custom-tab-headers">
        <div className="custom-tab-nav">
          {tabs.map((tab: any, index: any) => (
            <button
              key={tab.name}
              className={`custom-tab-header ${activeIndex === index ? 'active' : ''}`}
              onClick={() => onTabChange(index)}
              role="tab"
              aria-selected={activeIndex === index}
            >
              {/* {tab.icon && <i className={`${tab.icon} custom-tab-header-icon`}></i>} */}
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
        
        <div className="custom-tab-actions">
          {tabs[activeIndex]?.actionButton && (
            <Button
              icon={tabs[activeIndex].actionButton.icon}
              label={tabs[activeIndex].actionButton.label}
              text
              size="small"
              onClick={tabs[activeIndex].actionButton.onClick}
              tooltip={tabs[activeIndex].actionButton.tooltip}
              tooltipOptions={{ position: 'bottom' }}
              className={`custom-tab-action-btn ${tabs[activeIndex].actionButton.className || ''}`}
            />
          )}
        </div>
      </div>
      
      {/* Tab Content */}
      <div className="custom-tab-content">
        {tabs[activeIndex]?.content}
      </div>
    </div>
  );
}