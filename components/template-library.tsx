"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Sparkles, Briefcase, GraduationCap, Palette, Zap, Heart, Globe } from "lucide-react"

interface Template {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  slides: any[]
  preview: string
}

const TEMPLATES: Template[] = [
  // Business Templates
  {
    id: "business-pitch",
    title: "Business Pitch Deck",
    description: "Professional presentation for startups and business proposals",
    category: "business",
    tags: ["professional", "corporate", "startup"],
    preview: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
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
            height: 120,
            fontSize: 64,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#ffffff",
            textEffect: { type: "shadow", depth: 3, color: "#000000" },
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
            color: "#e2e8f0",
          },
        ],
        background: { type: "gradient", value: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)" },
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
            color: "#1e40af",
          },
          {
            id: "content-2",
            type: "text",
            content:
              "• Market inefficiencies cost businesses billions\n• Current solutions are outdated and slow\n• Customers demand better experiences",
            x: 100,
            y: 200,
            width: 800,
            height: 200,
            fontSize: 28,
            fontWeight: "normal",
            textAlign: "left",
            fontFamily: "Inter, sans-serif",
            color: "#334155",
          },
        ],
        background: { type: "solid", value: "#ffffff" },
      },
    ],
  },
  {
    id: "corporate-report",
    title: "Corporate Annual Report",
    description: "Clean and professional template for annual reports and financial presentations",
    category: "business",
    tags: ["corporate", "financial", "annual"],
    preview: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "title-1",
            type: "text",
            content: "Annual Report 2024",
            x: 100,
            y: 200,
            width: 600,
            height: 100,
            fontSize: 56,
            fontWeight: "bold",
            textAlign: "left",
            fontFamily: "Inter, sans-serif",
            color: "#ffffff",
          },
          {
            id: "subtitle-1",
            type: "text",
            content: "Building Tomorrow, Today",
            x: 100,
            y: 320,
            width: 500,
            height: 60,
            fontSize: 24,
            fontWeight: "normal",
            textAlign: "left",
            fontFamily: "Inter, sans-serif",
            color: "#94a3b8",
          },
          {
            id: "shape-1",
            type: "shape",
            shape: "rectangle",
            x: 750,
            y: 150,
            width: 200,
            height: 300,
            color: "#3b82f6",
          },
        ],
        background: { type: "gradient", value: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)" },
      },
    ],
  },

  // Creative Templates
  {
    id: "creative-portfolio",
    title: "Creative Portfolio",
    description: "Showcase your creative work with style and flair",
    category: "creative",
    tags: ["portfolio", "artistic", "colorful"],
    preview: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%)",
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "title-1",
            type: "text",
            content: "Creative Portfolio",
            x: 200,
            y: 100,
            width: 600,
            height: 120,
            fontSize: 64,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#ffffff",
            textEffect: { type: "neon", intensity: 8, color: "#ec4899" },
          },
          {
            id: "subtitle-1",
            type: "text",
            content: "Where Ideas Come to Life",
            x: 200,
            y: 250,
            width: 600,
            height: 60,
            fontSize: 28,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#f1f5f9",
          },
          {
            id: "shape-1",
            type: "shape",
            shape: "circle",
            x: 100,
            y: 350,
            width: 100,
            height: 100,
            color: "#ec4899",
          },
          {
            id: "shape-2",
            type: "shape",
            shape: "triangle",
            x: 800,
            y: 100,
            width: 80,
            height: 80,
            color: "#8b5cf6",
          },
        ],
        background: { type: "gradient", value: "linear-gradient(135deg, #ec4899 0%, #8b5cf6 50%, #06b6d4 100%)" },
      },
    ],
  },
  {
    id: "design-showcase",
    title: "Design Showcase",
    description: "Modern template for showcasing design projects and creative work",
    category: "creative",
    tags: ["design", "modern", "showcase"],
    preview: "linear-gradient(135deg, #000000 0%, #374151 100%)",
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "title-1",
            type: "text",
            content: "DESIGN",
            x: 100,
            y: 150,
            width: 400,
            height: 100,
            fontSize: 72,
            fontWeight: "bold",
            textAlign: "left",
            fontFamily: "Inter, sans-serif",
            color: "#ffffff",
            textEffect: { type: "extrude", depth: 8, color: "#374151" },
          },
          {
            id: "title-2",
            type: "text",
            content: "SHOWCASE",
            x: 500,
            y: 250,
            width: 400,
            height: 100,
            fontSize: 72,
            fontWeight: "bold",
            textAlign: "right",
            fontFamily: "Inter, sans-serif",
            color: "#fbbf24",
          },
          {
            id: "shape-1",
            type: "shape",
            shape: "rectangle",
            x: 50,
            y: 400,
            width: 900,
            height: 4,
            color: "#fbbf24",
          },
        ],
        background: { type: "gradient", value: "linear-gradient(135deg, #000000 0%, #374151 100%)" },
      },
    ],
  },

  // Educational Templates
  {
    id: "academic-lecture",
    title: "Academic Lecture",
    description: "Clean and focused template for educational presentations",
    category: "education",
    tags: ["academic", "lecture", "educational"],
    preview: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "title-1",
            type: "text",
            content: "Introduction to Data Science",
            x: 100,
            y: 150,
            width: 800,
            height: 100,
            fontSize: 52,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#ffffff",
          },
          {
            id: "subtitle-1",
            type: "text",
            content: "Lecture 1: Fundamentals and Applications",
            x: 100,
            y: 270,
            width: 800,
            height: 60,
            fontSize: 28,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#d1fae5",
          },
          {
            id: "author-1",
            type: "text",
            content: "Dr. Sarah Johnson | University of Technology",
            x: 100,
            y: 380,
            width: 800,
            height: 40,
            fontSize: 20,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#a7f3d0",
          },
        ],
        background: { type: "gradient", value: "linear-gradient(135deg, #059669 0%, #10b981 100%)" },
      },
    ],
  },
  {
    id: "student-project",
    title: "Student Project",
    description: "Engaging template for student presentations and projects",
    category: "education",
    tags: ["student", "project", "colorful"],
    preview: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)",
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "title-1",
            type: "text",
            content: "My Science Project",
            x: 150,
            y: 120,
            width: 700,
            height: 100,
            fontSize: 56,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#ffffff",
            textEffect: { type: "shadow", depth: 4, color: "#581c87" },
          },
          {
            id: "subtitle-1",
            type: "text",
            content: "Exploring Renewable Energy Solutions",
            x: 150,
            y: 240,
            width: 700,
            height: 60,
            fontSize: 32,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#fdf2f8",
          },
          {
            id: "name-1",
            type: "text",
            content: "By: Alex Thompson | Grade 10",
            x: 150,
            y: 350,
            width: 700,
            height: 40,
            fontSize: 24,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#f3e8ff",
          },
        ],
        background: { type: "gradient", value: "linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #ec4899 100%)" },
      },
    ],
  },

  // Technology Templates
  {
    id: "tech-startup",
    title: "Tech Startup",
    description: "Modern and innovative template for technology companies",
    category: "technology",
    tags: ["tech", "startup", "innovation"],
    preview: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)",
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "title-1",
            type: "text",
            content: "INNOVATE",
            x: 100,
            y: 100,
            width: 800,
            height: 120,
            fontSize: 72,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#ffffff",
            textEffect: { type: "neon", intensity: 10, color: "#0ea5e9" },
          },
          {
            id: "subtitle-1",
            type: "text",
            content: "The Future of Technology",
            x: 100,
            y: 250,
            width: 800,
            height: 60,
            fontSize: 36,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#bae6fd",
          },
          {
            id: "shape-1",
            type: "shape",
            shape: "hexagon",
            x: 50,
            y: 350,
            width: 60,
            height: 60,
            color: "#0ea5e9",
          },
          {
            id: "shape-2",
            type: "shape",
            shape: "hexagon",
            x: 890,
            y: 80,
            width: 60,
            height: 60,
            color: "#38bdf8",
          },
        ],
        background: { type: "gradient", value: "linear-gradient(135deg, #0c4a6e 0%, #0369a1 50%, #0284c7 100%)" },
      },
    ],
  },

  // Marketing Templates
  {
    id: "product-launch",
    title: "Product Launch",
    description: "Eye-catching template for product launches and marketing campaigns",
    category: "marketing",
    tags: ["product", "launch", "marketing"],
    preview: "linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #eab308 100%)",
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "title-1",
            type: "text",
            content: "LAUNCH DAY",
            x: 100,
            y: 120,
            width: 800,
            height: 100,
            fontSize: 64,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#ffffff",
            textEffect: { type: "extrude", depth: 6, color: "#991b1b" },
          },
          {
            id: "subtitle-1",
            type: "text",
            content: "Introducing Our Revolutionary Product",
            x: 100,
            y: 250,
            width: 800,
            height: 60,
            fontSize: 32,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#fef3c7",
          },
          {
            id: "cta-1",
            type: "text",
            content: "Get Ready to Be Amazed",
            x: 100,
            y: 350,
            width: 800,
            height: 50,
            fontSize: 24,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#ffffff",
          },
        ],
        background: { type: "gradient", value: "linear-gradient(135deg, #dc2626 0%, #ea580c 50%, #eab308 100%)" },
      },
    ],
  },

  // Minimal Templates
  {
    id: "minimal-clean",
    title: "Minimal Clean",
    description: "Simple and elegant template focusing on content",
    category: "minimal",
    tags: ["minimal", "clean", "simple"],
    preview: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "title-1",
            type: "text",
            content: "Simple. Clean. Effective.",
            x: 100,
            y: 200,
            width: 800,
            height: 100,
            fontSize: 48,
            fontWeight: "300",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#1e293b",
          },
          {
            id: "line-1",
            type: "shape",
            shape: "rectangle",
            x: 400,
            y: 320,
            width: 200,
            height: 2,
            color: "#64748b",
          },
        ],
        background: { type: "gradient", value: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)" },
      },
    ],
  },
]

const CATEGORIES = [
  { id: "all", name: "All Templates", icon: Globe },
  { id: "business", name: "Business", icon: Briefcase },
  { id: "creative", name: "Creative", icon: Palette },
  { id: "education", name: "Education", icon: GraduationCap },
  { id: "technology", name: "Technology", icon: Zap },
  { id: "marketing", name: "Marketing", icon: Heart },
  { id: "minimal", name: "Minimal", icon: Sparkles },
]

interface TemplateLibraryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: Template) => void
}

export function TemplateLibrary({ open, onOpenChange, onSelectTemplate }: TemplateLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  const filteredTemplates = TEMPLATES.filter((template) => {
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[80vh] bg-gray-900/95 border-gray-700/60 text-gray-100 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-900/95">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-yellow-300 bg-clip-text text-transparent">
            Template Library
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose from our collection of professionally designed templates
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 h-full">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700/60 text-gray-100 focus-visible:ring-blue-500/70"
            />
          </div>

          {/* Category Tabs */}
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="flex-1 flex flex-col">
            <TabsList className="grid grid-cols-7 bg-gray-800/50 backdrop-blur-md">
              {CATEGORIES.map((category) => {
                const Icon = category.icon
                return (
                  <TabsTrigger
                    key={category.id}
                    value={category.id}
                    className="text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white flex items-center gap-1"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{category.name}</span>
                  </TabsTrigger>
                )
              })}
            </TabsList>

            <TabsContent value={selectedCategory} className="flex-1 mt-4">
              <ScrollArea className="h-full">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="group relative bg-gray-800/40 rounded-xl border border-gray-700/40 overflow-hidden hover:border-blue-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 cursor-pointer"
                      onClick={() => {
                        onSelectTemplate(template)
                        onOpenChange(false)
                      }}
                    >
                      {/* Preview */}
                      <div className="h-32 w-full relative overflow-hidden" style={{ background: template.preview }}>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-gray-900/80 text-gray-100 text-xs">
                            {template.slides.length} slide{template.slides.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-100 mb-1 group-hover:text-blue-400 transition-colors">
                          {template.title}
                        </h3>
                        <p className="text-sm text-gray-400 mb-3 line-clamp-2">{template.description}</p>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-1">
                          {template.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs border-gray-600 text-gray-300 bg-gray-800/50"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {template.tags.length > 3 && (
                            <Badge variant="outline" className="text-xs border-gray-600 text-gray-400 bg-gray-800/50">
                              +{template.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg">
                          Use Template
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                {filteredTemplates.length === 0 && (
                  <div className="text-center py-12">
                    <Sparkles className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-300 mb-2">No templates found</h3>
                    <p className="text-gray-500">Try adjusting your search or category filter</p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
