import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { ChartContainer, ChartConfig } from './ui/chart'
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import {
  BarChart3,
  TrendingUp,
  Briefcase,
  CheckCircle,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  Users,
  Send
} from 'lucide-react'

interface StatCardProps {
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative' | 'neutral'
  icon: React.ComponentType<{ className?: string }>
}

function StatCard({ title, value, change, changeType, icon: Icon }: StatCardProps) {
  const changeColor = {
    positive: '#10b981',
    negative: '#ef4444',
    neutral: 'var(--text-2)'
  }[changeType]

  const ChangeIcon = changeType === 'positive' ? ArrowUpRight : changeType === 'negative' ? ArrowDownRight : Activity

  return (
    <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle style={{ color: 'var(--text-2)' }}>{title}</CardTitle>
        <div style={{ color: 'var(--accent)' }}>
          <Icon className="h-4 w-4" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{value}</div>
        <div className="flex items-center text-xs" style={{ color: changeColor }}>
          <ChangeIcon className="h-3 w-3 mr-1" />
          {change}
        </div>
      </CardContent>
    </Card>
  )
}

interface ActivityItemProps {
  title: string
  description: string
  time: string
  type: 'user' | 'system' | 'alert'
}

function ActivityItem({ title, description, time, type }: ActivityItemProps) {
  const typeColors = {
    user: '#3b82f6',
    system: 'var(--accent)',
    alert: '#ef4444'
  }

  return (
    <div className="flex items-start space-x-3 p-3 rounded-lg hover:opacity-80 transition-colors" style={{ backgroundColor: 'var(--background-mute)' }}>
      <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: typeColors[type] }} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{title}</p>
        <p className="text-xs" style={{ color: 'var(--text-2)' }}>{description}</p>
        <p className="text-xs mt-1" style={{ color: 'var(--text-3)' }}>{time}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const stats = [
    {
      title: 'Applications Sent',
      value: '186',
      change: '+24 this week',
      changeType: 'positive' as const,
      icon: Briefcase
    },
    {
      title: 'Interviews Scheduled',
      value: '32',
      change: '+8 this week',
      changeType: 'positive' as const,
      icon: Calendar
    },
    {
      title: 'Applications Pending',
      value: '74',
      change: '+12 this week',
      changeType: 'neutral' as const,
      icon: Clock
    },
    {
      title: 'Offers Received',
      value: '7',
      change: '+3 this month',
      changeType: 'positive' as const,
      icon: CheckCircle
    }
  ]

  const activities = [
    {
      title: 'Applied to Software Engineer at Google',
      description: 'Application submitted via LinkedIn',
      time: '2 hours ago',
      type: 'user' as const
    },
    {
      title: 'Interview confirmed',
      description: 'Microsoft - Senior Developer position',
      time: '4 hours ago',
      type: 'system' as const
    },
    {
      title: 'Application rejected',
      description: 'Meta - Full Stack Engineer',
      time: '1 day ago',
      type: 'alert' as const
    },
    {
      title: 'Resume updated',
      description: 'Added new project experience',
      time: '2 days ago',
      type: 'system' as const
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Job Application Dashboard</h1>
          <p style={{ color: 'var(--text-2)' }} className="mt-1">Track your job search progress and manage applications.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }} className="hover:opacity-80">
            <Clock className="w-4 h-4 mr-2" />
            Last 30 days
          </Button>
          <Button style={{ backgroundColor: 'var(--accent)', color: 'black' }} className="hover:opacity-90">
            <BarChart3 className="w-4 h-4 mr-2" />
            Export Data
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Applications Chart */}
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }} className="md:col-span-2">
          <CardHeader>
            <CardTitle style={{ color: 'var(--text)' }}>Applications Over Time</CardTitle>
            <CardDescription style={{ color: 'var(--text-2)' }}>
              Job applications sent over the past 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                applications: {
                  label: "Applications",
                  color: "var(--accent)",
                },
              } satisfies ChartConfig}
              className="min-h-[300px] w-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={[
                    { month: "Jul", applications: 24 },
                    { month: "Aug", applications: 38 },
                    { month: "Sep", applications: 18 },
                    { month: "Oct", applications: 42 },
                    { month: "Nov", applications: 31 },
                    { month: "Dec", applications: 48 }
                  ]}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--background-mute)" opacity={0.5} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: 'var(--text-2)', fontSize: 12 }}
                    axisLine={{ stroke: 'var(--background-mute)' }}
                    tickLine={{ stroke: 'var(--background-mute)' }}
                  />
                  <YAxis 
                    tick={{ fill: 'var(--text-2)', fontSize: 12 }}
                    axisLine={{ stroke: 'var(--background-mute)' }}
                    tickLine={{ stroke: 'var(--background-mute)' }}
                  />
                  <Bar 
                    dataKey="applications" 
                    fill="var(--accent)" 
                    radius={[4, 4, 0, 0]}
                    opacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text)' }}>Recent Applications</CardTitle>
            <CardDescription style={{ color: 'var(--text-2)' }}>
              Latest job application activities
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-1">
            {activities.map((activity, index) => (
              <ActivityItem key={index} {...activity} />
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--text)' }}>Quick Actions</CardTitle>
          <CardDescription style={{ color: 'var(--text-2)' }}>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }} className="h-auto p-4 hover:opacity-80 flex-col items-start">
              <Briefcase style={{ color: 'var(--accent)' }} className="w-5 h-5 mb-2" />
              <span className="font-medium">Add New Application</span>
              <span className="text-xs" style={{ color: 'var(--text-2)' }}>Submit a new job application</span>
            </Button>
            <Button variant="outline" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }} className="h-auto p-4 hover:opacity-80 flex-col items-start">
              <Calendar style={{ color: 'var(--accent)' }} className="w-5 h-5 mb-2" />
              <span className="font-medium">Schedule Interview</span>
              <span className="text-xs" style={{ color: 'var(--text-2)' }}>Book upcoming interviews</span>
            </Button>
            <Button variant="outline" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }} className="h-auto p-4 hover:opacity-80 flex-col items-start">
              <TrendingUp style={{ color: 'var(--accent)' }} className="w-5 h-5 mb-2" />
              <span className="font-medium">View Progress</span>
              <span className="text-xs" style={{ color: 'var(--text-2)' }}>Track application status</span>
            </Button>
            <Button variant="outline" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }} className="h-auto p-4 hover:opacity-80 flex-col items-start">
              <Users style={{ color: 'var(--accent)' }} className="w-5 h-5 mb-2" />
              <span className="font-medium">Network Contacts</span>
              <span className="text-xs" style={{ color: 'var(--text-2)' }}>Manage professional contacts</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}