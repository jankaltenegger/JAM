import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Phone,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  Edit,
  Building2
} from 'lucide-react'

interface Interview {
  id: string
  company: string
  position: string
  date: string
  time: string
  type: 'video' | 'phone' | 'onsite'
  status: 'scheduled' | 'completed' | 'cancelled'
  interviewer: string
  round: string
}

interface InterviewStats {
  total: number
  scheduled: number
  completed: number
  cancelled: number
}

export default function InterviewTracker() {
  const stats: InterviewStats = {
    total: 32,
    scheduled: 8,
    completed: 19,
    cancelled: 5
  }

  const upcomingInterviews: Interview[] = [
    {
      id: '1',
      company: 'Google',
      position: 'Senior Software Engineer',
      date: 'Oct 5, 2025',
      time: '2:00 PM',
      type: 'video',
      status: 'scheduled',
      interviewer: 'Sarah Chen',
      round: 'Technical Round 2'
    },
    {
      id: '2',
      company: 'Microsoft',
      position: 'Full Stack Developer',
      date: 'Oct 7, 2025',
      time: '10:00 AM',
      type: 'onsite',
      status: 'scheduled',
      interviewer: 'Michael Rodriguez',
      round: 'Final Interview'
    },
    {
      id: '3',
      company: 'Apple',
      position: 'iOS Developer',
      date: 'Oct 8, 2025',
      time: '3:30 PM',
      type: 'phone',
      status: 'scheduled',
      interviewer: 'Jennifer Liu',
      round: 'Phone Screening'
    }
  ]

  const recentInterviews: Interview[] = [
    {
      id: '4',
      company: 'Meta',
      position: 'Frontend Engineer',
      date: 'Sep 28, 2025',
      time: '1:00 PM',
      type: 'video',
      status: 'completed',
      interviewer: 'David Kim',
      round: 'Technical Round 1'
    },
    {
      id: '5',
      company: 'Netflix',
      position: 'Data Scientist',
      date: 'Sep 25, 2025',
      time: '11:00 AM',
      type: 'video',
      status: 'completed',
      interviewer: 'Amanda Foster',
      round: 'Behavioral Interview'
    }
  ]

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return Video
      case 'phone': return Phone
      case 'onsite': return MapPin
      default: return Calendar
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'var(--accent)'
      case 'completed': return '#10b981'
      case 'cancelled': return '#ef4444'
      default: return 'var(--text-2)'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Interview Tracker</h1>
          <p style={{ color: 'var(--text-2)' }} className="mt-1">Manage and track your interview schedule</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }} className="hover:opacity-80">
            <Calendar className="w-4 h-4 mr-2" />
            Calendar View
          </Button>
          <Button style={{ backgroundColor: 'var(--accent)', color: 'black' }} className="hover:opacity-90">
            <Plus className="w-4 h-4 mr-2" />
            Schedule Interview
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{stats.total}</div>
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>Total Interviews</div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{stats.scheduled}</div>
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>Scheduled</div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: '#10b981' }}>{stats.completed}</div>
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>Completed</div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: '#ef4444' }}>{stats.cancelled}</div>
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>Cancelled</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Interviews */}
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text)' }}>Upcoming Interviews</CardTitle>
            <CardDescription style={{ color: 'var(--text-2)' }}>
              Your scheduled interviews this week
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingInterviews.map((interview) => {
              const TypeIcon = getTypeIcon(interview.type)
              return (
                <div 
                  key={interview.id}
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--background-mute)' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 style={{ color: 'var(--accent)' }} className="w-4 h-4" />
                        <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{interview.company}</h3>
                      </div>
                      <p className="text-sm mb-1" style={{ color: 'var(--text)' }}>{interview.position}</p>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-2)' }}>{interview.round}</p>
                      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-3)' }}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {interview.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {interview.time}
                        </span>
                        <span className="flex items-center gap-1">
                          <TypeIcon className="w-3 h-3" />
                          {interview.type}
                        </span>
                      </div>
                      <p className="text-xs mt-1" style={{ color: 'var(--text-2)' }}>Interviewer: {interview.interviewer}</p>
                    </div>
                    <Button variant="outline" size="sm" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }}>
                      <Edit className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent Interviews */}
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text)' }}>Recent Interviews</CardTitle>
            <CardDescription style={{ color: 'var(--text-2)' }}>
              Completed interviews this month
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentInterviews.map((interview) => {
              const TypeIcon = getTypeIcon(interview.type)
              return (
                <div 
                  key={interview.id}
                  className="p-4 rounded-lg"
                  style={{ backgroundColor: 'var(--background-mute)' }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Building2 style={{ color: 'var(--accent)' }} className="w-4 h-4" />
                        <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{interview.company}</h3>
                        <div className="flex items-center gap-1">
                          <CheckCircle style={{ color: getStatusColor(interview.status) }} className="w-4 h-4" />
                          <span className="text-xs capitalize" style={{ color: getStatusColor(interview.status) }}>
                            {interview.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-sm mb-1" style={{ color: 'var(--text)' }}>{interview.position}</p>
                      <p className="text-sm mb-2" style={{ color: 'var(--text-2)' }}>{interview.round}</p>
                      <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-3)' }}>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {interview.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <TypeIcon className="w-3 h-3" />
                          {interview.type}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}