/**
 * Copyright (c) 2025 Financbase. All Rights Reserved.
 * 
 * PROPRIETARY SOFTWARE - Unauthorized copying, modification, distribution,
 * or use of this software, via any medium, is strictly prohibited.
 * 
 * @see LICENSE file in the root directory for full license terms.
 */

"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Calendar, DollarSign, MapPin, Clock, Users, Briefcase, Target, Award } from "lucide-react"

interface JobPostingModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (jobData: any) => void
}

const categories = [
  "Web Development",
  "Mobile Development",
  "UI/UX Design",
  "Graphic Design",
  "Content Writing",
  "Digital Marketing",
  "Data Science",
  "DevOps",
  "Blockchain",
  "AI/ML",
  "Other"
]

const experienceLevels = [
  { value: "entry", label: "Entry Level", description: "0-2 years experience" },
  { value: "intermediate", label: "Intermediate", description: "2-5 years experience" },
  { value: "expert", label: "Expert", description: "5+ years experience" }
]

const projectTypes = [
  { value: "fixed", label: "Fixed Price", icon: DollarSign },
  { value: "hourly", label: "Hourly Rate", icon: Clock },
  { value: "milestone", label: "Milestone-based", icon: Target }
]

export function JobPostingModal({ isOpen, onClose, onSubmit }: JobPostingModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    experienceLevel: "",
    projectType: "fixed",
    budget: "",
    minBudget: "",
    maxBudget: "",
    hourlyRate: "",
    duration: "",
    skills: [] as string[],
    location: "",
    remote: true,
    featured: false,
    urgent: false,
    deadline: "",
    attachments: [] as File[]
  })

  const [skillInput, setSkillInput] = useState("")
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addSkill = () => {
    if (skillInput.trim() && !formData.skills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }))
      setSkillInput("")
    }
  }

  const removeSkill = (skillToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }))
  }

  const handleSubmit = () => {
    onSubmit(formData)
    // Reset form
    setFormData({
      title: "",
      description: "",
      category: "",
      experienceLevel: "",
      projectType: "fixed",
      budget: "",
      minBudget: "",
      maxBudget: "",
      hourlyRate: "",
      duration: "",
      skills: [],
      location: "",
      remote: true,
      featured: false,
      urgent: false,
      deadline: "",
      attachments: []
    })
    setCurrentStep(1)
  }

  const canProceedToNext = () => {
    switch (currentStep) {
      case 1:
        return formData.title && formData.description && formData.category
      case 2:
        return formData.experienceLevel && formData.skills.length > 0
      case 3:
        return (formData.projectType === "fixed" && (formData.budget || (formData.minBudget && formData.maxBudget))) ||
               (formData.projectType === "hourly" && formData.hourlyRate)
      default:
        return false
    }
  }

  const ProjectTypeIcon = projectTypes.find(type => type.value === formData.projectType)?.icon || DollarSign

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Briefcase className="h-6 w-6" />
            Post a New Job
          </DialogTitle>
          <div className="flex items-center gap-2 mt-2">
            <div className="flex gap-1">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`h-2 w-8 rounded-full ${
                    i + 1 <= currentStep ? 'bg-primary' : 'bg-muted'
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              Step {currentStep} of {totalSteps}
            </span>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {currentStep === 1 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="h-5 w-5" />
                    Job Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="title">Job Title *</Label>
                      <Input
                        id="title"
                        placeholder="e.g., E-commerce Website Development"
                        value={formData.title}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("title", e.target.value)}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="description">Job Description *</Label>
                      <Textarea
                        id="description"
                        placeholder="Describe your project requirements, goals, and expectations..."
                        value={formData.description}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange("description", e.target.value)}
                        rows={6}
                      />
                    </div>

                    <div>
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={(value: string) => handleInputChange("category", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="duration">Project Duration</Label>
                      <Select value={formData.duration} onValueChange={(value: string) => handleInputChange("duration", value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select duration" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1-week">Less than 1 week</SelectItem>
                          <SelectItem value="1-month">1-4 weeks</SelectItem>
                          <SelectItem value="3-months">1-3 months</SelectItem>
                          <SelectItem value="6-months">3-6 months</SelectItem>
                          <SelectItem value="long-term">6+ months</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="remote"
                      checked={formData.remote}
                      onCheckedChange={(checked: boolean) => handleInputChange("remote", checked)}
                    />
                    <Label htmlFor="remote">Remote work allowed</Label>
                  </div>

                  {!formData.remote && (
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        placeholder="e.g., New York, NY or Remote"
                        value={formData.location}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("location", e.target.value)}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Requirements & Skills
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Experience Level *</Label>
                    <div className="grid gap-3 mt-2">
                      {experienceLevels.map(level => (
                        <div
                          key={level.value}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            formData.experienceLevel === level.value
                              ? 'border-primary bg-primary/5'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => handleInputChange("experienceLevel", level.value)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium">{level.label}</h4>
                              <p className="text-sm text-muted-foreground">{level.description}</p>
                            </div>
                            {formData.experienceLevel === level.value && (
                              <div className="w-4 h-4 bg-primary rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <Label>Skills Required *</Label>
                    <div className="flex gap-2 mt-2">
                      <Input
                        placeholder="Add a skill..."
                        value={skillInput}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSkillInput(e.target.value)}
                        onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                      />
                      <Button onClick={addSkill} variant="outline">Add</Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.skills.map(skill => (
                        <Badge key={skill} variant="secondary" className="cursor-pointer" onClick={() => removeSkill(skill)}>
                          {skill} ×
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ProjectTypeIcon className="h-5 w-5" />
                    Budget & Payment
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Project Type</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                      {projectTypes.map(type => {
                        const Icon = type.icon
                        return (
                          <div
                            key={type.value}
                            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                              formData.projectType === type.value
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/50'
                            }`}
                            onClick={() => handleInputChange("projectType", type.value)}
                          >
                            <Icon className="h-6 w-6 mb-2" />
                            <h4 className="font-medium">{type.label}</h4>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {formData.projectType === "fixed" && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="minBudget">Minimum Budget ($)</Label>
                          <Input
                            id="minBudget"
                            type="number"
                            placeholder="1000"
                            value={formData.minBudget}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("minBudget", e.target.value)}
                          />
                        </div>
                        <div>
                          <Label htmlFor="maxBudget">Maximum Budget ($)</Label>
                          <Input
                            id="maxBudget"
                            type="number"
                            placeholder="5000"
                            value={formData.maxBudget}
                            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("maxBudget", e.target.value)}
                          />
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Set a budget range to attract the right freelancers
                      </p>
                    </div>
                  )}

                  {formData.projectType === "hourly" && (
                    <div>
                      <Label htmlFor="hourlyRate">Hourly Rate ($)</Label>
                      <Input
                        id="hourlyRate"
                        type="number"
                        placeholder="50"
                        value={formData.hourlyRate}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("hourlyRate", e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Rate per hour for this project
                      </p>
                    </div>
                  )}

                  {formData.projectType === "milestone" && (
                    <div>
                      <Label htmlFor="budget">Total Project Budget ($)</Label>
                      <Input
                        id="budget"
                        type="number"
                        placeholder="3000"
                        value={formData.budget}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("budget", e.target.value)}
                      />
                      <p className="text-sm text-muted-foreground mt-1">
                        Total budget to be distributed across milestones
                      </p>
                    </div>
                  )}

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Featured Job</Label>
                        <p className="text-sm text-muted-foreground">Get more visibility with featured placement</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$49</div>
                        <Switch
                          checked={formData.featured}
                          onCheckedChange={(checked: boolean) => handleInputChange("featured", checked)}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-base">Urgent Hiring</Label>
                        <p className="text-sm text-muted-foreground">Mark as urgent to attract faster responses</p>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">$29</div>
                        <Switch
                          checked={formData.urgent}
                          onCheckedChange={(checked: boolean) => handleInputChange("urgent", checked)}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="deadline">Application Deadline</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange("deadline", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
          >
            Previous
          </Button>

          {currentStep < totalSteps ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!canProceedToNext()}
            >
              Next Step
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={!canProceedToNext()}>
              Post Job
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
