import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import {
  FileText,
  Download,
  Eye,
  Edit,
  Plus,
  Trash2,
  Star,
  Calendar,
  Briefcase,
  GraduationCap,
  Award
} from 'lucide-react'

interface ResumeTemplate {
  id: string
  name: string
  description: string
  lastModified: string
  isActive: boolean
}

interface ResumeSection {
  id: string
  title: string
  icon: React.ElementType
  itemCount: number
  lastUpdated: string
}

export default function ResumeBuilder() {
  const [activeTemplate, setActiveTemplate] = useState<string>('professional')

  const templates: ResumeTemplate[] = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Clean, modern design for corporate positions',
      lastModified: '2 days ago',
      isActive: true
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Bold design for design and creative roles',
      lastModified: '1 week ago',
      isActive: false
    },
    {
      id: 'minimal',
      name: 'Minimal',
      description: 'Simple, clean layout focusing on content',
      lastModified: '3 days ago',
      isActive: false
    }
  ]

  const sections: ResumeSection[] = [
    {
      id: 'experience',
      title: 'Work Experience',
      icon: Briefcase,
      itemCount: 4,
      lastUpdated: 'Updated today'
    },
    {
      id: 'education',
      title: 'Education',
      icon: GraduationCap,
      itemCount: 2,
      lastUpdated: 'Updated 1 week ago'
    },
    {
      id: 'skills',
      title: 'Skills & Technologies',
      icon: Award,
      itemCount: 12,
      lastUpdated: 'Updated 3 days ago'
    },
    {
      id: 'projects',
      title: 'Projects',
      icon: FileText,
      itemCount: 6,
      lastUpdated: 'Updated 2 days ago'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold" style={{ color: 'var(--text)' }}>Resume Builder</h1>
          <p style={{ color: 'var(--text-2)' }} className="mt-1">Create and manage your professional resumes</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }} className="hover:opacity-80">
            <Eye className="w-4 h-4 mr-2" />
            Preview
          </Button>
          <Button style={{ backgroundColor: 'var(--accent)', color: 'black' }} className="hover:opacity-90">
            <Download className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Templates Section */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text)' }}>Resume Templates</CardTitle>
            <CardDescription style={{ color: 'var(--text-2)' }}>
              Choose from professional templates
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {templates.map((template) => (
              <div 
                key={template.id}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  template.isActive ? 'border-accent' : 'border-transparent'
                }`}
                style={{ backgroundColor: 'var(--background-mute)' }}
                onClick={() => setActiveTemplate(template.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText style={{ color: template.isActive ? 'var(--accent)' : 'var(--text-2)' }} className="w-5 h-5" />
                    <div>
                      <h3 className="font-medium" style={{ color: 'var(--text)' }}>{template.name}</h3>
                      <p className="text-sm" style={{ color: 'var(--text-2)' }}>{template.description}</p>
                    </div>
                  </div>
                  {template.isActive && (
                    <Star style={{ color: 'var(--accent)' }} className="w-4 h-4" fill="var(--accent)" />
                  )}
                </div>
                <p className="text-xs mt-2" style={{ color: 'var(--text-3)' }}>Modified {template.lastModified}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Resume Sections */}
        <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
          <CardHeader>
            <CardTitle style={{ color: 'var(--text)' }}>Resume Sections</CardTitle>
            <CardDescription style={{ color: 'var(--text-2)' }}>
              Manage your resume content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {sections.map((section) => {
              const IconComponent = section.icon
              return (
                <div 
                  key={section.id}
                  className="p-4 rounded-lg hover:opacity-80 transition-opacity cursor-pointer"
                  style={{ backgroundColor: 'var(--background-mute)' }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <IconComponent style={{ color: 'var(--accent)' }} className="w-5 h-5" />
                      <div>
                        <h3 className="font-medium" style={{ color: 'var(--text)' }}>{section.title}</h3>
                        <p className="text-sm" style={{ color: 'var(--text-2)' }}>{section.itemCount} items</p>
                      </div>
                    </div>
                    <Button variant="outline" size="sm" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }}>
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                  <p className="text-xs mt-2" style={{ color: 'var(--text-3)' }}>{section.lastUpdated}</p>
                </div>
              )
            })}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card style={{ backgroundColor: 'var(--background-soft)', borderColor: 'var(--background-mute)' }}>
        <CardHeader>
          <CardTitle style={{ color: 'var(--text)' }}>Quick Actions</CardTitle>
          <CardDescription style={{ color: 'var(--text-2)' }}>
            Common resume management tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }} className="h-auto p-4 hover:opacity-80 flex-col items-start">
              <Plus style={{ color: 'var(--accent)' }} className="w-5 h-5 mb-2" />
              <span className="font-medium">Add Experience</span>
              <span className="text-xs" style={{ color: 'var(--text-2)' }}>Add new work experience</span>
            </Button>
            <Button variant="outline" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }} className="h-auto p-4 hover:opacity-80 flex-col items-start">
              <Award style={{ color: 'var(--accent)' }} className="w-5 h-5 mb-2" />
              <span className="font-medium">Update Skills</span>
              <span className="text-xs" style={{ color: 'var(--text-2)' }}>Manage technical skills</span>
            </Button>
            <Button variant="outline" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }} className="h-auto p-4 hover:opacity-80 flex-col items-start">
              <FileText style={{ color: 'var(--accent)' }} className="w-5 h-5 mb-2" />
              <span className="font-medium">Add Project</span>
              <span className="text-xs" style={{ color: 'var(--text-2)' }}>Document new project</span>
            </Button>
            <Button variant="outline" style={{ borderColor: 'var(--background-mute)', color: 'var(--text)' }} className="h-auto p-4 hover:opacity-80 flex-col items-start">
              <Download style={{ color: 'var(--accent)' }} className="w-5 h-5 mb-2" />
              <span className="font-medium">Export Resume</span>
              <span className="text-xs" style={{ color: 'var(--text-2)' }}>Download as PDF/Word</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}