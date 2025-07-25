import React from 'react'
import { 
  Home, 
  FileText, 
  Code, 
  Bug, 
  Search, 
  Settings, 
  Palette,
  Users,
  GitBranch,
  Terminal
} from 'lucide-react'

export interface ActivityBarItem {
  id: string
  icon: React.ReactNode
  label: string
  badge?: number
  active?: boolean
  onClick: () => void
}

interface ActivityBarProps {
  items: ActivityBarItem[]
  activeItem?: string
}

export const ActivityBar: React.FC<ActivityBarProps> = ({ items, activeItem }) => {
  return (
    <div className="activity-bar">
      {items.map((item) => (
        <div
          key={item.id}
          className={`activity-bar-item ${item.active || item.id === activeItem ? 'active' : ''}`}
          onClick={item.onClick}
          title={item.label}
        >
          <div className="relative">
            {item.icon}
            {item.badge && item.badge > 0 && (
              <div className="absolute -top-1 -right-1 bg-error text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                {item.badge > 99 ? '99+' : item.badge}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}