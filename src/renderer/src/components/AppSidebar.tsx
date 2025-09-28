import React from 'react'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from './ui/sidebar'
import {
  BarChart3,
  Briefcase,
  Settings,
  FileText,
  Calendar,
  Users,
  Bell
} from 'lucide-react'

interface NavigationItem {
  title: string
  icon: React.ElementType
  view?: 'dashboard' | 'job-applications' | 'resume-builder' | 'interview-tracker' | 'job-alerts' | 'networking'
}

const navigationItems: NavigationItem[] = [
  {
    title: 'Dashboard',
    icon: BarChart3,
    view: 'dashboard',
  },
  {
    title: 'Job Applications',
    icon: Briefcase,
    view: 'job-applications',
  },
  {
    title: 'Resume Builder',
    icon: FileText,
    view: 'resume-builder',
  },
  {
    title: 'Interview Tracker',
    icon: Calendar,
    view: 'interview-tracker',
  },
  {
    title: 'Job Alerts',
    icon: Bell,
    view: 'job-alerts',
  },
  {
    title: 'Networking',
    icon: Users,
    view: 'networking',
  },
]

interface AppSidebarProps {
  onNavigate?: (view: 'dashboard' | 'job-applications' | 'resume-builder' | 'interview-tracker' | 'job-alerts' | 'networking') => void
}

export default function AppSidebar({ onNavigate }: AppSidebarProps): React.JSX.Element {
  return (
    <Sidebar 
      style={{ borderColor: 'var(--background-mute)' }} 
      className="border-r"
      variant="sidebar"
    >
      <SidebarHeader style={{ borderColor: 'var(--background-mute)' }} className="border-b p-6">
        <div className="flex items-center justify-center">
          <div className="text-center flex-1">
            <h2 className="text-2xl font-bold tracking-wider" style={{ 
              color: 'var(--accent)', 
              fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              letterSpacing: '0.1em'
            }}>JAM</h2>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>Job Application Manager</p>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-8">
        <SidebarGroup>
          <SidebarGroupLabel style={{ color: 'var(--text-2)' }} className="mb-3 ml-2">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    className="w-full mb-4 rounded-xl transition-all duration-300 hover:text-black flex items-center cursor-pointer justify-start gap-3 px-3 py-4 mx-1"
                    style={{ 
                      color: 'var(--text)',
                      border: '2px solid transparent'
                    }}
                    onClick={() => item.view && onNavigate?.(item.view)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(255, 107, 53, 0.3)'
                      e.currentTarget.style.borderColor = 'rgba(255, 107, 53, 0.5)'
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.borderColor = 'transparent'
                    }}
                  >
                    <div style={{ color: 'var(--accent)' }}>
                      <item.icon className="w-6 h-6" />
                    </div>
                    <span className="text-base font-medium">{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter style={{ borderColor: 'var(--background-mute)' }} className="border-t px-2 py-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="inline-flex rounded-lg transition-all duration-300 hover:text-gray-200 items-center cursor-pointer justify-start gap-2 px-2 py-2 mx-1"
              style={{ 
                color: 'var(--text-2)',
                border: '1px solid transparent'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(128, 128, 128, 0.2)'
                e.currentTarget.style.borderColor = 'rgba(128, 128, 128, 0.3)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = 'transparent'
              }}
            >
              <Settings className="w-6 h-6" />
              <span className="text-base font-medium">Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
