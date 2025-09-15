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
    } bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 overflow-hidden`}>
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Encounter Builder
            </h2>
          )}
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
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