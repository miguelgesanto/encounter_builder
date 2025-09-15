import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface SidebarProps {
  title: string
  collapsed: boolean
  onToggle: () => void
  children: React.ReactNode
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  title, 
  collapsed, 
  onToggle, 
  children 
}) => {
  return (
    <div className={`${
      collapsed ? 'w-12' : 'w-80'
    } bg-white border-r border-gray-200 flex flex-col transition-all duration-300 overflow-hidden`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          )}
          <button
            onClick={onToggle}
            className="p-1 hover:bg-gray-100 rounded"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </div>
      
      {!collapsed && (
        <div className="flex-1 overflow-y-auto p-4">
          {children}
        </div>
      )}
    </div>
  )
}