import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import {
  Bell,
  Search,
  MapPin,
  DollarSign,
  Building2,
  Clock,
  Star,
  Plus,
  Settings,
  Mail,
  Smartphone,
  CheckCircle,
  XCircle
} from 'lucide-react'

interface JobAlert {
  id: string
  title: string
  keywords: string[]
  location: string
  salaryRange: string
  isActive: boolean
  matchCount: number
  lastTriggered: string
  frequency: 'daily' | 'weekly' | 'immediate'
}

interface JobMatch {
  id: string
  title: string
  company: string
  location: string
  salary: string
  postedTime: string
  matchScore: number
  alertId: string
}

export default function JobAlerts() {
  const alerts: JobAlert[] = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      keywords: ['React', 'TypeScript', 'Node.js'],
      location: 'San Francisco, CA',
      salaryRange: '$150K - $200K',
      isActive: true,
      matchCount: 24,
      lastTriggered: '2 hours ago',
      frequency: 'immediate'
    },
    {
      id: '2',
      title: 'Full Stack Developer',
      keywords: ['JavaScript', 'Python', 'AWS'],
      location: 'New York, NY',
      salaryRange: '$120K - $180K',
      isActive: true,
      matchCount: 18,
      lastTriggered: '1 day ago',
      frequency: 'daily'
    },
    {
      id: '3',
      title: 'Product Manager',
      keywords: ['Product Strategy', 'Analytics', 'Agile'],
      location: 'Remote',
      salaryRange: '$130K - $190K',
      isActive: false,
      matchCount: 12,
      lastTriggered: '3 days ago',
      frequency: 'weekly'
    }
  ]

  const recentMatches: JobMatch[] = [
    {
      id: '1',
      title: 'Senior React Developer',
      company: 'Stripe',
      location: 'San Francisco, CA',
      salary: '$165K - $200K',
      postedTime: '2 hours ago',
      matchScore: 95,
      alertId: '1'
    },
    {
      id: '2',
      title: 'Frontend Engineer',
      company: 'Airbnb',
      location: 'San Francisco, CA',
      salary: '$150K - $185K',
      postedTime: '4 hours ago',
      matchScore: 88,
      alertId: '1'
    },
    {
      id: '3',
      title: 'Full Stack Engineer',
      company: 'Spotify',
      location: 'New York, NY',
      salary: '$140K - $175K',
      postedTime: '1 day ago',
      matchScore: 82,
      alertId: '2'
    }
  ]

  const stats = {
    activeAlerts: alerts.filter(a => a.isActive).length,
    totalMatches: alerts.reduce((sum, alert) => sum + alert.matchCount, 0),
    newToday: 8,
    applied: 5
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Job Alerts</h1>
          <p style={{ color: 'var(--text-2)' }} className="mt-1">Set up automated job notifications and track matches</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }} className="hover:opacity-80">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button style={{ backgroundColor: 'var(--accent)', color: 'black' }} className="hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            New Alert
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{stats.activeAlerts}</div>
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>Active Alerts</div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{stats.totalMatches}</div>
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>Total Matches</div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: '#10b981' }}>{stats.newToday}</div>
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>New Today</div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: '#3b82f6' }}>{stats.applied}</div>
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>Applied</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Job Alerts */}
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text)' }}>Your Job Alerts</CardTitle>
            <CardDescription style={{ color: 'var(--text-2)' }}>
              Manage your automated job search alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {alerts.map((alert) => (
              <div 
                key={alert.id}
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'var(--background-mute)' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {alert.isActive ? (
                        <CheckCircle style={{ color: '#10b981' }} className="w-4 h-4" />
                      ) : (
                        <XCircle style={{ color: '#ef4444' }} className="w-4 h-4" />
                      )}
                      <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{alert.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {alert.keywords.map((keyword, index) => (
                        <span 
                          key={index}
                          className="px-2 py-1 text-xs rounded-full"
                          style={{ 
                            backgroundColor: 'var(--accent)', 
                            color: 'black' 
                          }}
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4 text-xs mb-2" style={{ color: 'var(--text-3)' }}>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {alert.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {alert.salaryRange}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-2)' }}>
                      <span>{alert.matchCount} matches</span>
                      <span>Last: {alert.lastTriggered}</span>
                      <span className="capitalize">{alert.frequency}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }}>
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Matches */}
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text)' }}>Recent Matches</CardTitle>
            <CardDescription style={{ color: 'var(--text-2)' }}>
              Latest job opportunities matching your alerts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentMatches.map((match) => (
              <div 
                key={match.id}
                className="p-4 rounded-lg"
                style={{ backgroundColor: 'var(--background-mute)' }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 style={{ color: 'var(--accent)' }} className="w-4 h-4" />
                      <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{match.title}</h3>
                      <div className="flex items-center gap-1">
                        <Star style={{ color: 'var(--accent)' }} className="w-3 h-3" fill="var(--accent)" />
                        <span className="text-xs" style={{ color: 'var(--accent)' }}>{match.matchScore}%</span>
                      </div>
                    </div>
                    <p className="text-sm mb-1" style={{ color: 'var(--text)' }}>{match.company}</p>
                    <div className="flex items-center gap-4 text-xs mb-2" style={{ color: 'var(--text-3)' }}>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {match.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {match.salary}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {match.postedTime}
                      </span>
                    </div>
                  </div>
                  <Button size="sm" style={{ backgroundColor: 'var(--accent)', color: 'black' }}>
                    Apply
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}