"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Eye, Download, Sparkles, Briefcase, GraduationCap, Atom, BarChart3, Palette } from "lucide-react"
import type { Slide } from "@/types/editor"

interface Template {
  id: string
  title: string
  description: string
  category: "business" | "education" | "science" | "creative" | "analytics"
  tags: string[]
  thumbnail: string
  slides: Slide[]
  author: string
  featured?: boolean
}

const TEMPLATES: Template[] = [
  {
    id: "business-pitch",
    title: "Business Pitch Deck",
    description: "Professional pitch deck template for startups and business presentations",
    category: "business",
    tags: ["pitch", "startup", "business", "professional"],
    thumbnail: "/placeholder.svg?height=200&width=300",
    author: "Positron Team",
    featured: true,
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "title-1",
            type: "text",
            content: "Your Company Name",
            x: 100,
            y: 150,
            width: 800,
            height: 100,
            fontSize: 64,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
          },
          {
            id: "subtitle-1",
            type: "text",
            content: "Revolutionizing the Future",
            x: 100,
            y: 280,
            width: 800,
            height: 60,
            fontSize: 32,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
          },
          {
            id: "logo-placeholder",
            type: "shape",
            shape: "circle",
            x: 450,
            y: 400,
            width: 100,
            height: 100,
            color: "#0ea5e9",
          },
        ],
        background: {
          type: "gradient",
          value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        },
      },
      {
        id: "slide-2",
        elements: [
          {
            id: "title-2",
            type: "text",
            content: "The Problem",
            x: 100,
            y: 80,
            width: 800,
            height: 80,
            fontSize: 48,
            fontWeight: "bold",
            textAlign: "left",
            fontFamily: "Inter, sans-serif",
          },
          {
            id: "problem-text",
            type: "text",
            content:
              "• Current solutions are inefficient\n• Market gap exists\n• Customer pain points unaddressed\n• Opportunity for innovation",
            x: 100,
            y: 200,
            width: 800,
            height: 300,
            fontSize: 24,
            fontWeight: "normal",
            textAlign: "left",
            fontFamily: "Inter, sans-serif",
          },
        ],
        background: {
          type: "color",
          value: "#1e293b",
        },
      },
      {
        id: "slide-3",
        elements: [
          {
            id: "title-3",
            type: "text",
            content: "Our Solution",
            x: 100,
            y: 80,
            width: 800,
            height: 80,
            fontSize: 48,
            fontWeight: "bold",
            textAlign: "left",
            fontFamily: "Inter, sans-serif",
          },
          {
            id: "solution-text",
            type: "text",
            content:
              "Innovative approach that solves key problems through cutting-edge technology and user-centered design.",
            x: 100,
            y: 200,
            width: 800,
            height: 200,
            fontSize: 28,
            fontWeight: "normal",
            textAlign: "left",
            fontFamily: "Inter, sans-serif",
          },
        ],
        background: {
          type: "gradient",
          value: "linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)",
        },
      },
    ],
  },
  {
    id: "education-lecture",
    title: "Educational Lecture",
    description: "Clean and organized template for academic presentations and lectures",
    category: "education",
    tags: ["education", "lecture", "academic", "clean"],
    thumbnail: "/placeholder.svg?height=200&width=300",
    author: "Positron Team",
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "course-title",
            type: "text",
            content: "Course Title",
            x: 100,
            y: 120,
            width: 800,
            height: 80,
            fontSize: 56,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
          },
          {
            id: "lecture-number",
            type: "text",
            content: "Lecture 01: Introduction",
            x: 100,
            y: 220,
            width: 800,
            height: 60,
            fontSize: 32,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
          },
          {
            id: "instructor",
            type: "text",
            content: "Professor Name\nUniversity Name",
            x: 100,
            y: 350,
            width: 800,
            height: 100,
            fontSize: 24,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
          },
        ],
        background: {
          type: "color",
          value: "#f8fafc",
        },
      },
      {
        id: "slide-2",
        elements: [
          {
            id: "agenda-title",
            type: "text",
            content: "Today's Agenda",
            x: 100,
            y: 80,
            width: 800,
            height: 80,
            fontSize: 48,
            fontWeight: "bold",
            textAlign: "left",
            fontFamily: "Inter, sans-serif",
          },
          {
            id: "agenda-items",
            type: "text",
            content:
              "1. Introduction to the topic\n2. Key concepts and definitions\n3. Practical examples\n4. Discussion and Q&A",
            x: 100,
            y: 200,
            width: 800,
            height: 300,
            fontSize: 28,
            fontWeight: "normal",
            textAlign: "left",
            fontFamily: "Inter, sans-serif",
          },
        ],
        background: {
          type: "color",
          value: "#ffffff",
        },
      },
    ],
  },
  {
    id: "science-research",
    title: "Scientific Research",
    description: "Professional template for research presentations and scientific conferences",
    category: "science",
    tags: ["research", "science", "academic", "conference"],
    thumbnail: "/placeholder.svg?height=200&width=300",
    author: "Positron Team",
    featured: true,
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "research-title",
            type: "text",
            content: "Research Title",
            x: 100,
            y: 100,
            width: 800,
            height: 120,
            fontSize: 48,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
          },
          {
            id: "authors",
            type: "text",
            content: "Author Names¹, Co-Author²\n¹Institution Name, ²Institution Name",
            x: 100,
            y: 250,
            width: 800,
            height: 100,
            fontSize: 24,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
          },
          {
            id: "conference",
            type: "text",
            content: "Conference Name 2024",
            x: 100,
            y: 400,
            width: 800,
            height: 60,
            fontSize: 28,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
          },
        ],
        background: {
          type: "gradient",
          value: "linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)",
        },
      },
      {
        id: "slide-2",
        elements: [
          {
            id: "abstract-title",
            type: "text",
            content: "Abstract",
            x: 100,
            y: 80,
            width: 800,
            height: 80,
            fontSize: 48,
            fontWeight: "bold",
            textAlign: "left",
            fontFamily: "Inter, sans-serif",
          },
          {
            id: "abstract-text",
            type: "text",
            content:
              "Brief summary of your research objectives, methodology, key findings, and conclusions. This section provides an overview of the entire study.",
            x: 100,
            y: 200,
            width: 800,
            height: 300,
            fontSize: 24,
            fontWeight: "normal",
            textAlign: "left",
            fontFamily: "Inter, sans-serif",
          },
        ],
        background: {
          type: "color",
          value: "#f1f5f9",
        },
      },
    ],
  },
  {
    id: "creative-portfolio",
    title: "Creative Portfolio",
    description: "Stylish template for showcasing creative work and design portfolios",
    category: "creative",
    tags: ["portfolio", "creative", "design", "showcase"],
    thumbnail: "/placeholder.svg?height=200&width=300",
    author: "Positron Team",
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "portfolio-title",
            type: "text",
            content: "Creative Portfolio",
            x: 100,
            y: 150,
            width: 800,
            height: 100,
            fontSize: 64,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
          },
          {
            id: "designer-name",
            type: "text",
            content: "Your Name",
            x: 100,
            y: 280,
            width: 800,
            height: 60,
            fontSize: 32,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
          },
          {
            id: "creative-shape-1",
            type: "shape",
            shape: "circle",
            x: 200,
            y: 400,
            width: 80,
            height: 80,
            color: "#f59e0b",
          },
          {
            id: "creative-shape-2",
            type: "shape",
            shape: "triangle",
            x: 400,
            y: 420,
            width: 60,
            height: 60,
            color: "#ef4444",
          },
          {
            id: "creative-shape-3",
            type: "shape",
            shape: "square",
            x: 600,
            y: 400,
            width: 80,
            height: 80,
            color: "#8b5cf6",
          },
        ],
        background: {
          type: "gradient",
          value: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        },
      },
    ],
  },
  {
    id: "analytics-dashboard",
    title: "Analytics Dashboard",
    description: "Data-focused template for presenting metrics, KPIs, and analytical insights",
    category: "analytics",
    tags: ["analytics", "data", "metrics", "dashboard"],
    thumbnail: "/placeholder.svg?height=200&width=300",
    author: "Positron Team",
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "dashboard-title",
            type: "text",
            content: "Analytics Dashboard",
            x: 100,
            y: 80,
            width: 800,
            height: 80,
            fontSize: 48,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
          },
          {
            id: "period",
            type: "text",
            content: "Q4 2024 Performance Report",
            x: 100,
            y: 180,
            width: 800,
            height: 60,
            fontSize: 28,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
          },
          {
            id: "metric-1",
            type: "shape",
            shape: "rounded-rect",
            x: 100,
            y: 300,
            width: 200,
            height: 120,
            color: "#10b981",
          },
          {
            id: "metric-2",
            type: "shape",
            shape: "rounded-rect",
            x: 400,
            y: 300,
            width: 200,
            height: 120,
            color: "#3b82f6",
          },
          {
            id: "metric-3",
            type: "shape",
            shape: "rounded-rect",
            x: 700,
            y: 300,
            width: 200,
            height: 120,
            color: "#f59e0b",
          },
        ],
        background: {
          type: "color",
          value: "#0f172a",
        },
      },
    ],
  },
]

const CATEGORIES = [
  { id: "all", label: "All Templates", icon: Sparkles },
  { id: "business", label: "Business", icon: Briefcase },
  { id: "education", label: "Education", icon: GraduationCap },
  { id: "science", label: "Science", icon: Atom },
  { id: "creative", label: "Creative", icon: Palette },
  { id: "analytics", label: "Analytics", icon: BarChart3 },
]

interface TemplateLibraryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: Template) => void
}

export function TemplateLibrary({ open, onOpenChange, onSelectTemplate }: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null)

  const filteredTemplates = TEMPLATES.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const featuredTemplates = filteredTemplates.filter((template) => template.featured)
  const regularTemplates = filteredTemplates.filter((template) => !template.featured)

  const handleUseTemplate = (template: Template) => {
    onSelectTemplate(template)
    onOpenChange(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl h-[80vh] bg-gray-900/95 border-gray-700/60 text-gray-100 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-900/95">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-yellow-300">
              Template Library
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Choose from professionally designed templates to jumpstart your presentation
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col h-full">
            {/* Search and Filters */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700 text-gray-100 focus-visible:ring-blue-500/70"
                />
              </div>
            </div>

            {/* Category Tabs */}
            <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
              <TabsList className="grid grid-cols-6 bg-gray-800/50 mb-4">
                {CATEGORIES.map((category) => {
                  const Icon = category.icon
                  return (
                    <TabsTrigger
                      key={category.id}
                      value={category.id}
                      className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-gray-100"
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {category.label}
                    </TabsTrigger>
                  )
                })}
              </TabsList>

              <TabsContent value={selectedCategory} className="flex-1 overflow-y-auto">
                <div className="space-y-6">
                  {/* Featured Templates */}
                  {featuredTemplates.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-4">
                        <Sparkles className="h-5 w-5 text-yellow-400" />
                        <h3 className="text-lg font-semibold text-gray-200">Featured Templates</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {featuredTemplates.map((template) => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            onPreview={() => setPreviewTemplate(template)}
                            onUse={() => handleUseTemplate(template)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Regular Templates */}
                  {regularTemplates.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-200 mb-4">All Templates</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {regularTemplates.map((template) => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            onPreview={() => setPreviewTemplate(template)}
                            onUse={() => handleUseTemplate(template)}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {filteredTemplates.length === 0 && (
                    <div className="text-center py-12">
                      <p className="text-gray-400 text-lg">No templates found matching your criteria</p>
                      <p className="text-gray-500 text-sm mt-2">Try adjusting your search or category filter</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      {/* Template Preview Dialog */}
      {previewTemplate && (
        <TemplatePreview
          template={previewTemplate}
          open={!!previewTemplate}
          onOpenChange={() => setPreviewTemplate(null)}
          onUse={() => handleUseTemplate(previewTemplate)}
        />
      )}
    </>
  )
}

interface TemplateCardProps {
  template: Template
  onPreview: () => void
  onUse: () => void
}

function TemplateCard({ template, onPreview, onUse }: TemplateCardProps) {
  const categoryColors = {
    business: "bg-blue-500/20 text-blue-300",
    education: "bg-green-500/20 text-green-300",
    science: "bg-purple-500/20 text-purple-300",
    creative: "bg-pink-500/20 text-pink-300",
    analytics: "bg-orange-500/20 text-orange-300",
  }

  return (
    <div className="group relative bg-gray-800/50 rounded-lg border border-gray-700/60 overflow-hidden hover:border-blue-500/50 transition-all duration-300">
      {template.featured && (
        <div className="absolute top-2 right-2 z-10">
          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
            <Sparkles className="h-3 w-3 mr-1" />
            Featured
          </Badge>
        </div>
      )}

      <div className="aspect-video bg-gray-700/50 relative overflow-hidden">
        <img
          src={template.thumbnail || "/placeholder.svg"}
          alt={template.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={onPreview}
            className="bg-gray-900/80 border-gray-600 text-gray-100 hover:bg-gray-800"
          >
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button size="sm" onClick={onUse} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="h-4 w-4 mr-1" />
            Use Template
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-100 group-hover:text-blue-300 transition-colors">{template.title}</h4>
          <Badge className={categoryColors[template.category]}>{template.category}</Badge>
        </div>

        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{template.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap gap-1">
            {template.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs border-gray-600 text-gray-400">
                {tag}
              </Badge>
            ))}
            {template.tags.length > 2 && (
              <Badge variant="outline" className="text-xs border-gray-600 text-gray-400">
                +{template.tags.length - 2}
              </Badge>
            )}
          </div>
          <span className="text-xs text-gray-500">{template.slides.length} slides</span>
        </div>
      </div>
    </div>
  )
}

interface TemplatePreviewProps {
  template: Template
  open: boolean
  onOpenChange: (open: boolean) => void
  onUse: () => void
}

function TemplatePreview({ template, open, onOpenChange, onUse }: TemplatePreviewProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] bg-gray-900/95 border-gray-700/60 text-gray-100 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-900/95">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{template.title}</DialogTitle>
          <DialogDescription className="text-gray-400">{template.description}</DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30">{template.category}</Badge>
                <span className="text-sm text-gray-400">
                  {template.slides.length} slides • By {template.author}
                </span>
              </div>
              <Button onClick={onUse} className="bg-blue-600 hover:bg-blue-700 text-white">
                <Download className="h-4 w-4 mr-2" />
                Use This Template
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {template.slides.map((slide, index) => (
                <div key={slide.id} className="relative">
                  <div className="aspect-video bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                    <div
                      className="w-full h-full relative"
                      style={{
                        background:
                          typeof slide.background === "string"
                            ? slide.background
                            : slide.background.type === "color"
                              ? slide.background.value
                              : slide.background.value,
                      }}
                    >
                      {slide.elements.map((element) => (
                        <div
                          key={element.id}
                          className="absolute text-white"
                          style={{
                            left: `${(element.x / 1000) * 100}%`,
                            top: `${(element.y / 562.5) * 100}%`,
                            width: `${(element.width / 1000) * 100}%`,
                            height: `${(element.height / 562.5) * 100}%`,
                            fontSize: `${(element.fontSize || 16) * 0.3}px`,
                            fontWeight: element.fontWeight,
                            textAlign: element.textAlign as any,
                            fontFamily: element.fontFamily,
                          }}
                        >
                          {element.type === "text" && element.content}
                          {element.type === "shape" && (
                            <div
                              className="w-full h-full"
                              style={{
                                backgroundColor: element.color,
                                borderRadius:
                                  element.shape === "circle" ? "50%" : element.shape === "rounded-rect" ? "8px" : "0",
                              }}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="absolute bottom-2 left-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                    Slide {index + 1}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <h4 className="font-semibold text-gray-200 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="border-gray-600 text-gray-400">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
