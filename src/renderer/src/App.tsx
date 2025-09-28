import React, { useState } from 'react'
import AppSidebar from '@renderer/components/AppSidebar'
import Dashboard from '@renderer/components/Dashboard'
import JobApplications from '@renderer/components/JobApplications'
import ResumeBuilder from '@renderer/components/ResumeBuilder'
import InterviewTracker from '@renderer/components/InterviewTracker'
import JobAlerts from '@renderer/components/JobAlerts'
import Networking from '@renderer/components/Networking'
import { SidebarProvider } from '@renderer/components/ui/sidebar'

function App(): React.JSX.Element {
  const [currentView, setCurrentView] = useState<'dashboard' | 'job-applications' | 'resume-builder' | 'interview-tracker' | 'job-alerts' | 'networking'>('dashboard')

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'job-applications':
        return <JobApplications />
      case 'resume-builder':
        return <ResumeBuilder />
      case 'interview-tracker':
        return <InterviewTracker />
      case 'job-alerts':
        return <JobAlerts />
      case 'networking':
        return <Networking />
      default:
        return <Dashboard />
    }
  }

  console.log('App component rendering...')
  return (
    <SidebarProvider>
      <div className="min-h-screen w-full flex" style={{ backgroundColor: 'var(--background)', color: 'var(--text)' }}>
        {/* Sidebar */}
        <AppSidebar onNavigate={setCurrentView} />

        {/* Main */}
        <main className="flex-1 min-h-screen overflow-auto" style={{ backgroundColor: 'var(--background)' }}>
          <div className="p-6">
            {renderCurrentView()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}

export default App
