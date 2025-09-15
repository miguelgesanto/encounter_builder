// Left Sidebar Component - Contains the encounter builder
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface LeftSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

export const LeftSidebar: React.FC<LeftSidebarProps> = ({ 
  collapsed, 
  onToggle, 
  children 
}) => {
  return (
    <div className={`${
      collapsed ? 'w-12' : 'w-80'
    } sidebar-dnd flex flex-col transition-all duration-300 overflow-hidden`}>
      <div className="p-4 border-b border-dnd">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-dnd-primary">
              Encounter Builder
            </h2>
          )}
          <button
            onClick={onToggle}
            className="btn-dnd p-1"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-dnd-secondary" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-dnd-secondary" />
            )}
          </button>
        </div>
      </div>
      
      {!collapsed && (
        <div className="flex-1 overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
};

export default LeftSidebar;