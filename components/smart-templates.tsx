"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { 
  Search, 
  Sparkles, 
  Briefcase, 
  GraduationCap, 
  Palette, 
  Zap, 
  TrendingUp,
  Wand2,
  Layout,
  Type,
  Image as ImageIcon,
  Shapes,
  Check,
  RefreshCw,
  Clock,
  Star,
  Flame,
  Award
} from "lucide-react"
import type { Slide, SlideElement } from "@/types/editor"

interface SmartTemplate {
  id: string
  title: string
  description: string
  category: string
  tags: string[]
  trending?: boolean
  new?: boolean
  popular?: boolean
  slides: Slide[]
  preview: string
  style: "minimal" | "bold" | "elegant" | "modern" | "creative" | "corporate"
  colorScheme: string[]
}

interface SmartTemplatesProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectTemplate: (template: { slides: Slide[] }) => void
  onGenerateCustom?: (config: TemplateConfig) => void
}

interface TemplateConfig {
  topic: string
  style: string
  colorScheme: string
  slideCount: number
  includeImages: boolean
  includeShapes: boolean
}

// Trending design styles for 2026
const TRENDING_STYLES = [
  { id: "glassmorphism", name: "Glassmorphism", icon: Sparkles, description: "Frosted glass effects with transparency" },
  { id: "neubrutalism", name: "Neubrutalism", icon: Zap, description: "Bold colors, thick borders, raw aesthetic" },
  { id: "gradient-mesh", name: "Gradient Mesh", icon: Palette, description: "Complex multi-color gradients" },
  { id: "dark-mode", name: "Dark Mode Pro", icon: Layout, description: "Premium dark themes with neon accents" },
  { id: "minimalist", name: "Ultra Minimal", icon: Type, description: "Clean, whitespace-focused design" },
  { id: "3d-elements", name: "3D Elements", icon: Shapes, description: "Depth and dimension with 3D effects" },
]

const COLOR_SCHEMES = [
  { id: "ocean", name: "Ocean Depths", colors: ["#0f172a", "#1e3a5f", "#0ea5e9", "#38bdf8"] },
  { id: "sunset", name: "Sunset Glow", colors: ["#1f1f1f", "#f97316", "#fb923c", "#fcd34d"] },
  { id: "forest", name: "Forest", colors: ["#0f1f0f", "#065f46", "#10b981", "#34d399"] },
  { id: "midnight", name: "Midnight Purple", colors: ["#0f0f1f", "#4c1d95", "#7c3aed", "#a78bfa"] },
  { id: "rose", name: "Rose Gold", colors: ["#1f1015", "#9f1239", "#f43f5e", "#fda4af"] },
  { id: "arctic", name: "Arctic Frost", colors: ["#f8fafc", "#e2e8f0", "#0ea5e9", "#0284c7"] },
]

const SMART_TEMPLATES: SmartTemplate[] = [
  // Trending Templates
  {
    id: "glassmorphism-deck",
    title: "Glass UI Deck",
    description: "Modern glassmorphism design with frosted glass cards and vibrant gradients",
    category: "trending",
    tags: ["glassmorphism", "modern", "2026"],
    trending: true,
    new: true,
    preview: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
    style: "modern",
    colorScheme: ["#667eea", "#764ba2", "#f093fb", "#ffffff"],
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "glass-card",
            type: "shape",
            shape: "rounded-rect",
            x: 150,
            y: 100,
            width: 700,
            height: 350,
            color: "rgba(255,255,255,0.15)",
            cornerRadius: 24,
            glassmorphism: {
              enabled: true,
              blur: 20,
              opacity: 0.2,
              borderOpacity: 0.3,
              saturation: 180,
            },
          },
          {
            id: "title-1",
            type: "text",
            content: "Your Presentation",
            x: 200,
            y: 180,
            width: 600,
            height: 100,
            fontSize: 56,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#ffffff",
            textEffect: { type: "shadow", depth: 2, color: "rgba(0,0,0,0.3)" },
          },
          {
            id: "subtitle-1",
            type: "text",
            content: "Glassmorphism Design Style",
            x: 200,
            y: 280,
            width: 600,
            height: 60,
            fontSize: 28,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "rgba(255,255,255,0.9)",
          },
        ],
        background: { type: "gradient", value: "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)" },
        transition: { type: "fade", duration: 0.6, easing: "ease-out" },
      },
    ],
  },
  {
    id: "neubrutalism-bold",
    title: "Neubrutalism Bold",
    description: "Bold, raw aesthetic with thick borders and vibrant accent colors",
    category: "trending",
    tags: ["neubrutalism", "bold", "creative"],
    trending: true,
    popular: true,
    preview: "linear-gradient(135deg, #fef3c7 0%, #fef3c7 100%)",
    style: "bold",
    colorScheme: ["#fef3c7", "#1f2937", "#f97316", "#10b981"],
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "bg-shape",
            type: "shape",
            shape: "rounded-rect",
            x: 80,
            y: 80,
            width: 840,
            height: 400,
            color: "#ffffff",
            cornerRadius: 0,
          },
          {
            id: "accent-shape",
            type: "shape",
            shape: "square",
            x: 90,
            y: 90,
            width: 840,
            height: 400,
            color: "#1f2937",
          },
          {
            id: "main-card",
            type: "shape",
            shape: "square",
            x: 80,
            y: 80,
            width: 840,
            height: 400,
            color: "#fef3c7",
          },
          {
            id: "title-1",
            type: "text",
            content: "MAKE IT BOLD",
            x: 120,
            y: 150,
            width: 760,
            height: 120,
            fontSize: 72,
            fontWeight: "bold",
            textAlign: "left",
            fontFamily: "'Bebas Neue', sans-serif",
            color: "#1f2937",
          },
          {
            id: "subtitle-1",
            type: "text",
            content: "Neubrutalism design for impactful presentations",
            x: 120,
            y: 280,
            width: 760,
            height: 60,
            fontSize: 24,
            fontWeight: "normal",
            textAlign: "left",
            fontFamily: "Inter, sans-serif",
            color: "#374151",
          },
          {
            id: "accent-bar",
            type: "shape",
            shape: "square",
            x: 120,
            y: 360,
            width: 200,
            height: 12,
            color: "#f97316",
          },
        ],
        background: { type: "solid", value: "#fef3c7" },
        transition: { type: "slide", direction: "left", duration: 0.5, easing: "ease-out" },
      },
    ],
  },
  {
    id: "gradient-mesh-pro",
    title: "Gradient Mesh Pro",
    description: "Stunning multi-color gradient backgrounds with smooth transitions",
    category: "trending",
    tags: ["gradient", "colorful", "premium"],
    trending: true,
    preview: "linear-gradient(135deg, #ff6b6b 0%, #feca57 25%, #48dbfb 50%, #ff9ff3 75%, #54a0ff 100%)",
    style: "creative",
    colorScheme: ["#ff6b6b", "#feca57", "#48dbfb", "#ff9ff3"],
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "title-1",
            type: "text",
            content: "Vibrant Ideas",
            x: 100,
            y: 120,
            width: 800,
            height: 120,
            fontSize: 68,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#ffffff",
            textEffect: { type: "shadow", depth: 4, color: "rgba(0,0,0,0.2)" },
          },
          {
            id: "subtitle-1",
            type: "text",
            content: "Where creativity meets innovation",
            x: 100,
            y: 260,
            width: 800,
            height: 60,
            fontSize: 32,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "rgba(255,255,255,0.95)",
          },
          {
            id: "circle-1",
            type: "shape",
            shape: "circle",
            x: 50,
            y: 350,
            width: 80,
            height: 80,
            color: "rgba(255,255,255,0.2)",
          },
          {
            id: "circle-2",
            type: "shape",
            shape: "circle",
            x: 870,
            y: 50,
            width: 120,
            height: 120,
            color: "rgba(255,255,255,0.15)",
          },
        ],
        background: { type: "gradient", value: "linear-gradient(135deg, #667eea 0%, #764ba2 25%, #f093fb 50%, #f5576c 75%, #4facfe 100%)" },
        transition: { type: "zoom", duration: 0.7, easing: "ease-out" },
      },
    ],
  },
  {
    id: "dark-neon-pro",
    title: "Dark Neon Pro",
    description: "Premium dark theme with glowing neon accents and cyber aesthetic",
    category: "trending",
    tags: ["dark", "neon", "cyber", "premium"],
    trending: true,
    popular: true,
    preview: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)",
    style: "modern",
    colorScheme: ["#0a0a0f", "#1a1a2e", "#0ff", "#f0f"],
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "glow-line-1",
            type: "shape",
            shape: "square",
            x: 0,
            y: 250,
            width: 1000,
            height: 2,
            color: "#0ff",
          },
          {
            id: "glow-line-2",
            type: "shape",
            shape: "square",
            x: 0,
            y: 300,
            width: 1000,
            height: 2,
            color: "#f0f",
          },
          {
            id: "title-1",
            type: "text",
            content: "FUTURE",
            x: 100,
            y: 130,
            width: 800,
            height: 120,
            fontSize: 96,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "'Bebas Neue', sans-serif",
            color: "#ffffff",
            textEffect: { type: "neon", intensity: 15, color: "#0ff" },
          },
          {
            id: "subtitle-1",
            type: "text",
            content: "INNOVATION STARTS HERE",
            x: 100,
            y: 330,
            width: 800,
            height: 60,
            fontSize: 24,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#a0aec0",
          },
        ],
        background: { type: "gradient", value: "linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 50%, #16213e 100%)" },
        transition: { type: "fade", duration: 0.8, easing: "ease-out" },
      },
    ],
  },

  // Minimal Templates
  {
    id: "ultra-minimal",
    title: "Ultra Minimal",
    description: "Clean, focused design with maximum whitespace and clarity",
    category: "minimal",
    tags: ["minimal", "clean", "professional"],
    popular: true,
    preview: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)",
    style: "minimal",
    colorScheme: ["#ffffff", "#f8fafc", "#1f2937", "#6366f1"],
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "title-1",
            type: "text",
            content: "Less is More",
            x: 100,
            y: 180,
            width: 800,
            height: 100,
            fontSize: 64,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#1f2937",
          },
          {
            id: "line-accent",
            type: "shape",
            shape: "square",
            x: 400,
            y: 300,
            width: 200,
            height: 4,
            color: "#6366f1",
          },
          {
            id: "subtitle-1",
            type: "text",
            content: "Minimalist presentations that captivate",
            x: 100,
            y: 330,
            width: 800,
            height: 50,
            fontSize: 24,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#64748b",
          },
        ],
        background: { type: "solid", value: "#ffffff" },
        transition: { type: "fade", duration: 0.5, easing: "ease-out" },
      },
    ],
  },

  // Corporate Templates
  {
    id: "corporate-pro",
    title: "Corporate Pro",
    description: "Professional business presentation with modern corporate styling",
    category: "business",
    tags: ["corporate", "professional", "business"],
    popular: true,
    preview: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)",
    style: "corporate",
    colorScheme: ["#1e3a5f", "#2563eb", "#ffffff", "#64748b"],
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "logo-placeholder",
            type: "shape",
            shape: "circle",
            x: 50,
            y: 30,
            width: 60,
            height: 60,
            color: "rgba(255,255,255,0.2)",
          },
          {
            id: "title-1",
            type: "text",
            content: "Company Name",
            x: 100,
            y: 150,
            width: 800,
            height: 100,
            fontSize: 56,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#ffffff",
          },
          {
            id: "subtitle-1",
            type: "text",
            content: "Q4 2026 Business Review",
            x: 100,
            y: 270,
            width: 800,
            height: 50,
            fontSize: 28,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#bfdbfe",
          },
          {
            id: "date-1",
            type: "text",
            content: "March 2026",
            x: 100,
            y: 400,
            width: 800,
            height: 40,
            fontSize: 18,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#93c5fd",
          },
        ],
        background: { type: "gradient", value: "linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)" },
        transition: { type: "slide", direction: "right", duration: 0.6, easing: "ease-out" },
      },
    ],
  },

  // Creative Templates
  {
    id: "creative-portfolio",
    title: "Creative Portfolio",
    description: "Artistic template perfect for portfolios and creative showcases",
    category: "creative",
    tags: ["creative", "portfolio", "artistic"],
    new: true,
    preview: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)",
    style: "creative",
    colorScheme: ["#fbbf24", "#f59e0b", "#1f2937", "#ffffff"],
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "bg-circle",
            type: "shape",
            shape: "circle",
            x: -100,
            y: -100,
            width: 400,
            height: 400,
            color: "rgba(255,255,255,0.1)",
          },
          {
            id: "title-1",
            type: "text",
            content: "Creative Works",
            x: 100,
            y: 150,
            width: 800,
            height: 100,
            fontSize: 64,
            fontWeight: "bold",
            textAlign: "left",
            fontFamily: "'Bebas Neue', sans-serif",
            color: "#1f2937",
          },
          {
            id: "subtitle-1",
            type: "text",
            content: "A collection of my best projects",
            x: 100,
            y: 260,
            width: 500,
            height: 50,
            fontSize: 24,
            fontWeight: "normal",
            textAlign: "left",
            fontFamily: "Inter, sans-serif",
            color: "#374151",
          },
          {
            id: "year-1",
            type: "text",
            content: "2026",
            x: 750,
            y: 400,
            width: 200,
            height: 60,
            fontSize: 48,
            fontWeight: "bold",
            textAlign: "right",
            fontFamily: "'Bebas Neue', sans-serif",
            color: "#1f2937",
          },
        ],
        background: { type: "gradient", value: "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #d97706 100%)" },
        transition: { type: "flip", duration: 0.7, easing: "ease-out" },
      },
    ],
  },

  // Education Templates  
  {
    id: "edu-modern",
    title: "Modern Education",
    description: "Engaging template for lectures, courses, and educational content",
    category: "education",
    tags: ["education", "lecture", "course"],
    preview: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
    style: "modern",
    colorScheme: ["#059669", "#10b981", "#ffffff", "#d1fae5"],
    slides: [
      {
        id: "slide-1",
        elements: [
          {
            id: "icon-placeholder",
            type: "shape",
            shape: "hexagon",
            x: 430,
            y: 80,
            width: 140,
            height: 140,
            color: "rgba(255,255,255,0.2)",
          },
          {
            id: "title-1",
            type: "text",
            content: "Course Title",
            x: 100,
            y: 240,
            width: 800,
            height: 80,
            fontSize: 52,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#ffffff",
          },
          {
            id: "subtitle-1",
            type: "text",
            content: "Chapter 1: Introduction",
            x: 100,
            y: 330,
            width: 800,
            height: 50,
            fontSize: 26,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#d1fae5",
          },
          {
            id: "instructor-1",
            type: "text",
            content: "Instructor Name | Institution",
            x: 100,
            y: 420,
            width: 800,
            height: 40,
            fontSize: 18,
            fontWeight: "normal",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            color: "#a7f3d0",
          },
        ],
        background: { type: "gradient", value: "linear-gradient(135deg, #059669 0%, #10b981 100%)" },
        transition: { type: "slide", direction: "bottom", duration: 0.6, easing: "ease-out" },
      },
    ],
  },
]

const CATEGORIES = [
  { id: "all", name: "All Templates", icon: Layout },
  { id: "trending", name: "Trending", icon: TrendingUp },
  { id: "minimal", name: "Minimal", icon: Type },
  { id: "business", name: "Business", icon: Briefcase },
  { id: "creative", name: "Creative", icon: Palette },
  { id: "education", name: "Education", icon: GraduationCap },
]

export function SmartTemplates({ open, onOpenChange, onSelectTemplate }: SmartTemplatesProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeCategory, setActiveCategory] = useState("all")
  const [activeTab, setActiveTab] = useState("gallery")
  
  // Template generator state
  const [generatorTopic, setGeneratorTopic] = useState("")
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [selectedColorScheme, setSelectedColorScheme] = useState<string | null>(null)
  const [slideCount, setSlideCount] = useState(5)

  const filteredTemplates = SMART_TEMPLATES.filter((template) => {
    const matchesSearch =
      searchQuery === "" ||
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory = activeCategory === "all" || template.category === activeCategory

    return matchesSearch && matchesCategory
  })

  const trendingTemplates = SMART_TEMPLATES.filter((t) => t.trending)
  const newTemplates = SMART_TEMPLATES.filter((t) => t.new)
  const popularTemplates = SMART_TEMPLATES.filter((t) => t.popular)

  const generateTemplate = () => {
    if (!generatorTopic || !selectedStyle || !selectedColorScheme) return

    const scheme = COLOR_SCHEMES.find((s) => s.id === selectedColorScheme)
    const style = TRENDING_STYLES.find((s) => s.id === selectedStyle)
    
    if (!scheme) return

    // Generate slides based on configuration
    const generatedSlides: Slide[] = []
    
    // Title slide
    generatedSlides.push({
      id: `slide-${Date.now()}-1`,
      elements: [
        {
          id: `title-${Date.now()}`,
          type: "text",
          content: generatorTopic,
          x: 100,
          y: 150,
          width: 800,
          height: 100,
          fontSize: 56,
          fontWeight: "bold",
          textAlign: "center",
          fontFamily: "Inter, sans-serif",
          color: scheme.colors[3] || "#ffffff",
          textEffect: selectedStyle === "neubrutalism" 
            ? undefined 
            : { type: "shadow", depth: 2, color: "rgba(0,0,0,0.2)" },
        } as SlideElement,
        {
          id: `subtitle-${Date.now()}`,
          type: "text",
          content: `A ${style?.name || ""} Presentation`,
          x: 100,
          y: 280,
          width: 800,
          height: 60,
          fontSize: 28,
          fontWeight: "normal",
          textAlign: "center",
          fontFamily: "Inter, sans-serif",
          color: `${scheme.colors[3]}cc` || "rgba(255,255,255,0.8)",
        } as SlideElement,
      ],
      background: { 
        type: "gradient", 
        value: `linear-gradient(135deg, ${scheme.colors[0]} 0%, ${scheme.colors[1]} 50%, ${scheme.colors[2]} 100%)` 
      },
      transition: { type: "fade", duration: 0.6, easing: "ease-out" },
    })

    // Content slides
    for (let i = 2; i <= slideCount; i++) {
      generatedSlides.push({
        id: `slide-${Date.now()}-${i}`,
        elements: [
          {
            id: `heading-${Date.now()}-${i}`,
            type: "text",
            content: `Section ${i - 1}`,
            x: 100,
            y: 80,
            width: 800,
            height: 80,
            fontSize: 42,
            fontWeight: "bold",
            textAlign: "left",
            fontFamily: "Inter, sans-serif",
            color: scheme.colors[2],
          } as SlideElement,
          {
            id: `content-${Date.now()}-${i}`,
            type: "text",
            content: "Add your content here...",
            x: 100,
            y: 200,
            width: 800,
            height: 200,
            fontSize: 24,
            fontWeight: "normal",
            textAlign: "left",
            fontFamily: "Inter, sans-serif",
            color: "#4b5563",
          } as SlideElement,
        ],
        background: { type: "solid", value: "#ffffff" },
        transition: { type: "slide", direction: "left", duration: 0.5, easing: "ease-out" },
      })
    }

    onSelectTemplate({ slides: generatedSlides })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] bg-gray-900/95 border-gray-800 text-gray-100 p-0 overflow-hidden backdrop-blur-xl">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-gray-800/50">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-gray-100 flex items-center gap-2">
                <Wand2 className="h-6 w-6 text-purple-400" />
                Smart Templates
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Choose from trending designs or generate a custom template
              </DialogDescription>
            </DialogHeader>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-4">
              <TabsList className="bg-gray-800/50 border border-gray-700/50">
                <TabsTrigger value="gallery" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                  <Layout className="h-4 w-4 mr-2" />
                  Gallery
                </TabsTrigger>
                <TabsTrigger value="trending" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="generator" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generator
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Gallery Tab */}
            <TabsContent value="gallery" className="flex-1 overflow-hidden px-6 pb-6 mt-4">
              {/* Search and Filter */}
              <div className="flex gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search templates..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-gray-700 text-gray-100 placeholder:text-gray-500"
                  />
                </div>
              </div>

              {/* Categories */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    variant={activeCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveCategory(category.id)}
                    className={
                      activeCategory === category.id
                        ? "bg-purple-500/20 text-purple-300 border-purple-500/50 hover:bg-purple-500/30"
                        : "bg-gray-800/30 border-gray-700 text-gray-300 hover:bg-gray-700/50"
                    }
                  >
                    <category.icon className="h-4 w-4 mr-2" />
                    {category.name}
                  </Button>
                ))}
              </div>

              {/* Template Grid */}
              <ScrollArea className="h-[calc(100%-120px)]">
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 pr-4">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="group relative bg-gray-800/40 rounded-xl border border-gray-700/40 overflow-hidden hover:border-purple-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer"
                      onClick={() => {
                        onSelectTemplate(template)
                        onOpenChange(false)
                      }}
                    >
                      {/* Preview */}
                      <div className="h-36 w-full relative overflow-hidden" style={{ background: template.preview }}>
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors duration-300" />
                        
                        {/* Badges */}
                        <div className="absolute top-2 left-2 flex gap-1">
                          {template.trending && (
                            <Badge className="bg-orange-500/90 text-white text-xs flex items-center gap-1">
                              <Flame className="h-3 w-3" />
                              Trending
                            </Badge>
                          )}
                          {template.new && (
                            <Badge className="bg-green-500/90 text-white text-xs flex items-center gap-1">
                              <Sparkles className="h-3 w-3" />
                              New
                            </Badge>
                          )}
                          {template.popular && !template.trending && (
                            <Badge className="bg-blue-500/90 text-white text-xs flex items-center gap-1">
                              <Star className="h-3 w-3" />
                              Popular
                            </Badge>
                          )}
                        </div>

                        <div className="absolute top-2 right-2">
                          <Badge variant="secondary" className="bg-gray-900/80 text-gray-100 text-xs">
                            {template.slides.length} slide{template.slides.length !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-100 mb-1 group-hover:text-purple-400 transition-colors">
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
                        </div>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <Button size="sm" className="bg-purple-500 hover:bg-purple-600 text-white shadow-lg">
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

            {/* Trending Tab */}
            <TabsContent value="trending" className="flex-1 overflow-hidden px-6 pb-6 mt-4">
              <ScrollArea className="h-full">
                {/* Trending Section */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                    <Flame className="h-5 w-5 text-orange-400" />
                    Hot Right Now
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {trendingTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="group relative bg-gray-800/40 rounded-xl border border-orange-500/30 overflow-hidden hover:border-orange-500/60 transition-all duration-300 cursor-pointer"
                        onClick={() => {
                          onSelectTemplate(template)
                          onOpenChange(false)
                        }}
                      >
                        <div className="h-32 w-full relative" style={{ background: template.preview }}>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-2 left-2">
                            <Badge className="bg-orange-500 text-white">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Trending
                            </Badge>
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-gray-100 group-hover:text-orange-400 transition-colors">
                            {template.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{template.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* New Templates */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-green-400" />
                    Just Added
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {newTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="group relative bg-gray-800/40 rounded-xl border border-green-500/30 overflow-hidden hover:border-green-500/60 transition-all duration-300 cursor-pointer"
                        onClick={() => {
                          onSelectTemplate(template)
                          onOpenChange(false)
                        }}
                      >
                        <div className="h-32 w-full relative" style={{ background: template.preview }}>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-2 left-2">
                            <Badge className="bg-green-500 text-white">
                              <Sparkles className="h-3 w-3 mr-1" />
                              New
                            </Badge>
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-gray-100 group-hover:text-green-400 transition-colors">
                            {template.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{template.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Popular Templates */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
                    <Award className="h-5 w-5 text-blue-400" />
                    Most Popular
                  </h3>
                  <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                    {popularTemplates.map((template) => (
                      <div
                        key={template.id}
                        className="group relative bg-gray-800/40 rounded-xl border border-blue-500/30 overflow-hidden hover:border-blue-500/60 transition-all duration-300 cursor-pointer"
                        onClick={() => {
                          onSelectTemplate(template)
                          onOpenChange(false)
                        }}
                      >
                        <div className="h-32 w-full relative" style={{ background: template.preview }}>
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          <div className="absolute bottom-2 left-2">
                            <Badge className="bg-blue-500 text-white">
                              <Star className="h-3 w-3 mr-1" />
                              Popular
                            </Badge>
                          </div>
                        </div>
                        <div className="p-3">
                          <h4 className="font-medium text-gray-100 group-hover:text-blue-400 transition-colors">
                            {template.title}
                          </h4>
                          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{template.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>

            {/* Generator Tab */}
            <TabsContent value="generator" className="flex-1 overflow-hidden px-6 pb-6 mt-4">
              <ScrollArea className="h-full pr-4">
                <div className="space-y-6">
                  {/* Topic Input */}
                  <div>
                    <Label className="text-gray-200 mb-2 block">Presentation Topic</Label>
                    <Input
                      placeholder="e.g., Quarterly Business Review, Product Launch..."
                      value={generatorTopic}
                      onChange={(e) => setGeneratorTopic(e.target.value)}
                      className="bg-gray-800/50 border-gray-700 text-gray-100 placeholder:text-gray-500"
                    />
                  </div>

                  {/* Style Selection */}
                  <div>
                    <Label className="text-gray-200 mb-3 block">Design Style</Label>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {TRENDING_STYLES.map((style) => (
                        <div
                          key={style.id}
                          onClick={() => setSelectedStyle(style.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                            selectedStyle === style.id
                              ? "bg-purple-500/20 border-purple-500/60"
                              : "bg-gray-800/40 border-gray-700/50 hover:border-gray-600"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-2">
                            <style.icon className={`h-5 w-5 ${selectedStyle === style.id ? "text-purple-400" : "text-gray-400"}`} />
                            <span className={`font-medium ${selectedStyle === style.id ? "text-purple-300" : "text-gray-200"}`}>
                              {style.name}
                            </span>
                            {selectedStyle === style.id && <Check className="h-4 w-4 text-purple-400 ml-auto" />}
                          </div>
                          <p className="text-xs text-gray-400">{style.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Color Scheme Selection */}
                  <div>
                    <Label className="text-gray-200 mb-3 block">Color Scheme</Label>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                      {COLOR_SCHEMES.map((scheme) => (
                        <div
                          key={scheme.id}
                          onClick={() => setSelectedColorScheme(scheme.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 ${
                            selectedColorScheme === scheme.id
                              ? "bg-purple-500/20 border-purple-500/60"
                              : "bg-gray-800/40 border-gray-700/50 hover:border-gray-600"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-medium ${selectedColorScheme === scheme.id ? "text-purple-300" : "text-gray-200"}`}>
                              {scheme.name}
                            </span>
                            {selectedColorScheme === scheme.id && <Check className="h-4 w-4 text-purple-400" />}
                          </div>
                          <div className="flex gap-1">
                            {scheme.colors.map((color, i) => (
                              <div
                                key={i}
                                className="h-6 flex-1 rounded"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Slide Count */}
                  <div>
                    <Label className="text-gray-200 mb-3 block">Number of Slides: {slideCount}</Label>
                    <Slider
                      value={[slideCount]}
                      onValueChange={([value]) => setSlideCount(value)}
                      min={3}
                      max={15}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>3 slides</span>
                      <span>15 slides</span>
                    </div>
                  </div>

                  {/* Generate Button */}
                  <Button
                    onClick={generateTemplate}
                    disabled={!generatorTopic || !selectedStyle || !selectedColorScheme}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 text-lg font-semibold disabled:opacity-50"
                  >
                    <Wand2 className="h-5 w-5 mr-2" />
                    Generate Template
                  </Button>

                  {/* Preview */}
                  {generatorTopic && selectedStyle && selectedColorScheme && (
                    <div className="mt-4 p-4 rounded-xl bg-gray-800/40 border border-gray-700/50">
                      <h4 className="text-sm font-medium text-gray-300 mb-2">Preview</h4>
                      <div
                        className="h-32 rounded-lg flex items-center justify-center"
                        style={{
                          background: `linear-gradient(135deg, ${COLOR_SCHEMES.find((s) => s.id === selectedColorScheme)?.colors[0]} 0%, ${COLOR_SCHEMES.find((s) => s.id === selectedColorScheme)?.colors[1]} 50%, ${COLOR_SCHEMES.find((s) => s.id === selectedColorScheme)?.colors[2]} 100%)`,
                        }}
                      >
                        <div className="text-center">
                          <div className="text-xl font-bold text-white drop-shadow-lg">{generatorTopic}</div>
                          <div className="text-sm text-white/80 mt-1">
                            {TRENDING_STYLES.find((s) => s.id === selectedStyle)?.name} Style
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
