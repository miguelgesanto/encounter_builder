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
    } sidebar-dnd flex flex-col transition-all duration-300 overflow-hidden`}>
      <div className="p-4 border-b border-dnd">
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'}`}>
          {!collapsed && (
            <h2 className="text-lg font-semibold text-dnd-primary">{title}</h2>
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
        <div className="flex-1 overflow-y-auto p-4 scrollbar-dnd">
          {children}
        </div>
      )}
    </div>
  )
}