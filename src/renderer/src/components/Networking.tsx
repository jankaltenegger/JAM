import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import {
  Users,
  Plus,
  MessageCircle,
  Mail,
  Phone,
  Building2,
  MapPin,
  Calendar,
  Star,
  ExternalLink,
  UserPlus,
  Search,
  Filter
} from 'lucide-react'

interface Contact {
  id: string
  name: string
  title: string
  company: string
  location: string
  connectionType: 'colleague' | 'recruiter' | 'referral' | 'alumni'
  lastContact: string
  notes: string
  linkedinUrl?: string
  email?: string
  phone?: string
  rating: number
}

interface NetworkingStats {
  totalContacts: number
  newThisMonth: number
  activeConnections: number
  referrals: number
}

export default function Networking() {
  const stats: NetworkingStats = {
    totalContacts: 124,
    newThisMonth: 18,
    activeConnections: 45,
    referrals: 7
  }

  const contacts: Contact[] = [
    {
      id: '1',
      name: 'Sarah Chen',
      title: 'Senior Engineering Manager',
      company: 'Google',
      location: 'Mountain View, CA',
      connectionType: 'colleague',
      lastContact: '2 days ago',
      notes: 'Former colleague, great reference for frontend roles',
      linkedinUrl: 'https://linkedin.com/in/sarahchen',
      email: 'sarah.chen@google.com',
      rating: 5
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      title: 'Technical Recruiter',
      company: 'Microsoft',
      location: 'Seattle, WA',
      connectionType: 'recruiter',
      lastContact: '1 week ago',
      notes: 'Actively helping with Microsoft positions, very responsive',
      linkedinUrl: 'https://linkedin.com/in/mrodriguez',
      email: 'michael.rodriguez@microsoft.com',
      rating: 4
    },
    {
      id: '3',
      name: 'Jennifer Liu',
      title: 'Product Manager',
      company: 'Apple',
      location: 'Cupertino, CA',
      connectionType: 'alumni',
      lastContact: '3 days ago',
      notes: 'Stanford alumni, works on iOS team',
      linkedinUrl: 'https://linkedin.com/in/jenniferlu',
      rating: 4
    },
    {
      id: '4',
      name: 'David Kim',
      title: 'Software Engineer',
      company: 'Meta',
      location: 'Menlo Park, CA',
      connectionType: 'referral',
      lastContact: '1 day ago',
      notes: 'Referred me for frontend engineer position',
      email: 'david.kim@meta.com',
      rating: 5
    }
  ]

  const getConnectionTypeColor = (type: string) => {
    switch (type) {
      case 'colleague': return '#3b82f6'
      case 'recruiter': return 'var(--accent)'
      case 'alumni': return '#10b981'
      case 'referral': return '#8b5cf6'
      default: return 'var(--text-2)'
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className="w-3 h-3" 
        style={{ color: i < rating ? 'var(--accent)' : 'var(--text-3)' }}
        fill={i < rating ? 'var(--accent)' : 'none'}
      />
    ))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Professional Network</h1>
          <p style={{ color: 'var(--text-2)' }} className="mt-1">Manage your professional contacts and relationships</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }} className="hover:opacity-80">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button variant="outline" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }} className="hover:opacity-80">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button style={{ backgroundColor: 'var(--accent)', color: 'black' }} className="hover:opacity-90">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{stats.totalContacts}</div>
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>Total Contacts</div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{stats.newThisMonth}</div>
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>New This Month</div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: '#10b981' }}>{stats.activeConnections}</div>
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>Active Connections</div>
          </CardContent>
        </Card>
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold" style={{ color: '#8b5cf6' }}>{stats.referrals}</div>
            <div className="text-sm" style={{ color: 'var(--text-2)' }}>Referrals</div>
          </CardContent>
        </Card>
      </div>

      {/* Contacts List */}
      <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--text)' }}>Your Professional Contacts</CardTitle>
          <CardDescription style={{ color: 'var(--text-2)' }}>
            Manage relationships with your professional network
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {contacts.map((contact) => (
            <div 
              key={contact.id}
              className="p-4 rounded-lg"
              style={{ backgroundColor: 'var(--background-mute)' }}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: 'var(--accent)' }}>
                      <span className="text-black font-semibold">
                        {contact.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold" style={{ color: 'var(--text)' }}>{contact.name}</h3>
                      <p className="text-sm" style={{ color: 'var(--text-2)' }}>{contact.title}</p>
                    </div>
                    <span 
                      className="px-2 py-1 text-xs rounded-full capitalize"
                      style={{ 
                        backgroundColor: getConnectionTypeColor(contact.connectionType) + '20',
                        color: getConnectionTypeColor(contact.connectionType)
                      }}
                    >
                      {contact.connectionType}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs mb-2" style={{ color: 'var(--text-3)' }}>
                    <span className="flex items-center gap-1">
                      <Building2 className="w-3 h-3" />
                      {contact.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {contact.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      Last contact: {contact.lastContact}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(contact.rating)}
                  </div>

                  <p className="text-sm mb-3" style={{ color: 'var(--text-2)' }}>{contact.notes}</p>

                  <div className="flex items-center gap-2">
                    {contact.email && (
                      <Button variant="outline" size="sm" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }}>
                        <Mail className="w-3 h-3 mr-1" />
                        Email
                      </Button>
                    )}
                    {contact.phone && (
                      <Button variant="outline" size="sm" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }}>
                        <Phone className="w-3 h-3 mr-1" />
                        Call
                      </Button>
                    )}
                    {contact.linkedinUrl && (
                      <Button variant="outline" size="sm" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }}>
                        <ExternalLink className="w-3 h-3 mr-1" />
                        LinkedIn
                      </Button>
                    )}
                    <Button variant="outline" size="sm" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }}>
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}