"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/use-toast"
import {
  Sparkles,
  Wand2,
  LayoutTemplate,
  FileText,
  Loader2,
  PenLine,
  Lightbulb,
} from "lucide-react"
import type { Slide, SlideElement } from "@/types/editor"

interface AIContentGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onGenerateSlideContent: (elements: Partial<SlideElement>[]) => void
  onGeneratePresentation: (slides: Slide[]) => void
  onRewriteText: (newText: string) => void
  selectedText?: string
}

export function AIContentGenerator({
  open,
  onOpenChange,
  onGenerateSlideContent,
  onGeneratePresentation,
  onRewriteText,
  selectedText,
}: AIContentGeneratorProps) {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState("slide")
  const [layoutSuggestion, setLayoutSuggestion] = useState<{
    slideCount: number
    slides: { title: string; layout: string; description: string }[]
  } | null>(null)

  const handleGenerateSlideContent = async () => {
    if (!prompt.trim()) return
    setIsLoading(true)

    try {
      const res = await fetch("/api/ai-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type: "slide-content" }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const { title, subtitle, bullets } = data.content
      const elements: Partial<SlideElement>[] = []

      elements.push({
        id: `text-ai-${Date.now()}`,
        type: "text",
        content: title,
        x: 100,
        y: 60,
        width: 800,
        height: 70,
        fontSize: 42,
        fontWeight: "bold",
        textAlign: "center",
        fontFamily: "Inter, sans-serif",
      } as SlideElement)

      if (subtitle) {
        elements.push({
          id: `text-ai-${Date.now() + 1}`,
          type: "text",
          content: subtitle,
          x: 150,
          y: 140,
          width: 700,
          height: 40,
          fontSize: 20,
          fontWeight: "normal",
          textAlign: "center",
          fontFamily: "Inter, sans-serif",
        } as SlideElement)
      }

      if (bullets && bullets.length > 0) {
        const bulletText = bullets.map((b: string) => `\u2022 ${b}`).join("\n")
        elements.push({
          id: `text-ai-${Date.now() + 2}`,
          type: "text",
          content: bulletText,
          x: 120,
          y: subtitle ? 200 : 160,
          width: 760,
          height: bullets.length * 45 + 20,
          fontSize: 22,
          fontWeight: "normal",
          textAlign: "left",
          fontFamily: "Inter, sans-serif",
        } as SlideElement)
      }

      onGenerateSlideContent(elements)
      onOpenChange(false)
      setPrompt("")

      toast({
        title: "Content generated",
        description: "AI-generated slide content has been added.",
      })
    } catch (error) {
      console.error("AI generation error:", error)
      toast({
        title: "Generation failed",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRewriteText = async () => {
    if (!selectedText) return
    setIsLoading(true)

    try {
      const res = await fetch("/api/ai-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: selectedText, type: "rewrite" }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      onRewriteText(data.content)
      onOpenChange(false)

      toast({
        title: "Text rewritten",
        description: "Your text has been rewritten by AI.",
      })
    } catch (error) {
      console.error("AI rewrite error:", error)
      toast({
        title: "Rewrite failed",
        description: "Failed to rewrite text. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLayoutSuggest = async () => {
    if (!prompt.trim()) return
    setIsLoading(true)

    try {
      const res = await fetch("/api/ai-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: `Suggest a presentation layout for the topic: "${prompt}"`,
          type: "layout-suggest",
        }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      setLayoutSuggestion(data.content)
    } catch (error) {
      console.error("AI layout error:", error)
      toast({
        title: "Suggestion failed",
        description: "Failed to suggest layout. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleExpandTopic = async () => {
    if (!prompt.trim()) return
    setIsLoading(true)

    try {
      const res = await fetch("/api/ai-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, type: "expand-topic" }),
      })

      const data = await res.json()
      if (data.error) throw new Error(data.error)

      const { presentationTitle, slides: aiSlides } = data.content
      const newSlides: Slide[] = aiSlides.map(
        (
          aiSlide: {
            title: string
            elements: { type: string; content: string }[]
          },
          index: number
        ) => {
          const elements: SlideElement[] = []

          elements.push({
            id: `text-ai-title-${Date.now()}-${index}`,
            type: "text",
            content: aiSlide.title,
            x: 100,
            y: 60,
            width: 800,
            height: 70,
            fontSize: 40,
            fontWeight: "bold",
            textAlign: "center",
            fontFamily: "Inter, sans-serif",
            animation: {
              type: "fade",
              delay: 0.2,
              duration: 1,
              trigger: "onLoad",
              easing: "ease",
            },
            textEffect: {
              type: "none",
              depth: 5,
              color: "#000000",
              angle: 45,
              intensity: 5,
              perspective: 500,
            },
          })

          let yOffset = 150
          for (const el of aiSlide.elements) {
            const isHeading = el.type === "heading"
            elements.push({
              id: `text-ai-${Date.now()}-${index}-${yOffset}`,
              type: "text",
              content: el.content,
              x: isHeading ? 100 : 120,
              y: yOffset,
              width: isHeading ? 800 : 760,
              height: isHeading ? 50 : 40,
              fontSize: isHeading ? 28 : 20,
              fontWeight: isHeading ? "bold" : "normal",
              textAlign: isHeading ? "center" : "left",
              fontFamily: "Inter, sans-serif",
              animation: {
                type: "fade",
                delay: 0.3 + yOffset * 0.001,
                duration: 0.8,
                trigger: "onLoad",
                easing: "ease",
              },
              textEffect: {
                type: "none",
                depth: 5,
                color: "#000000",
                angle: 45,
                intensity: 5,
                perspective: 500,
              },
            })
            yOffset += isHeading ? 55 : 45
          }

          return {
            id: `slide-ai-${Date.now()}-${index}`,
            elements,
            background: {
              type: "gradient" as const,
              value: `linear-gradient(135deg, ${
                [
                  "#0f172a 0%, #1e293b 100%",
                  "#1a1a2e 0%, #16213e 100%",
                  "#0d1b2a 0%, #1b263b 100%",
                  "#1b1b32 0%, #2d2d5e 100%",
                  "#0b132b 0%, #1c2541 100%",
                ][index % 5]
              })`,
            },
            transition: {
              type: "cube" as const,
              direction: "left" as const,
              duration: 0.8,
              easing: "ease-in-out" as const,
              perspective: 1200,
              depth: 150,
            },
          }
        }
      )

      onGeneratePresentation(newSlides)
      onOpenChange(false)
      setPrompt("")

      toast({
        title: "Presentation generated",
        description: `Created ${newSlides.length} slides for "${presentationTitle}".`,
      })
    } catch (error) {
      console.error("AI expand error:", error)
      toast({
        title: "Generation failed",
        description: "Failed to generate presentation. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const quickPrompts = [
    "Product launch presentation",
    "Quarterly business review",
    "Team introduction slides",
    "Project status update",
    "Research findings summary",
    "Marketing strategy overview",
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-900 border-gray-700 text-gray-100 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-gray-100 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            AI Content Generator
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Use AI to generate slide content, rewrite text, or create entire
            presentations.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="mt-4"
        >
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger
              value="slide"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-1" />
              Slide Content
            </TabsTrigger>
            <TabsTrigger
              value="presentation"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <LayoutTemplate className="h-4 w-4 mr-1" />
              Full Presentation
            </TabsTrigger>
            {selectedText && (
              <TabsTrigger
                value="rewrite"
                className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
              >
                <PenLine className="h-4 w-4 mr-1" />
                Rewrite
              </TabsTrigger>
            )}
            <TabsTrigger
              value="layout"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white"
            >
              <Lightbulb className="h-4 w-4 mr-1" />
              Layout Ideas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="slide" className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                What should this slide be about?
              </label>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Key benefits of our product..."
                className="bg-gray-800 border-gray-700 text-gray-100"
                onKeyDown={(e) =>
                  e.key === "Enter" && handleGenerateSlideContent()
                }
              />
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Quick prompts:</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.slice(0, 3).map((qp) => (
                  <Button
                    key={qp}
                    variant="outline"
                    size="sm"
                    className="text-xs border-gray-700 text-gray-400 hover:text-gray-100 hover:bg-gray-800"
                    onClick={() => setPrompt(qp)}
                  >
                    {qp}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleGenerateSlideContent}
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Wand2 className="h-4 w-4 mr-2" />
              )}
              Generate Slide Content
            </Button>
          </TabsContent>

          <TabsContent value="presentation" className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                What is your presentation about?
              </label>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Q4 2026 Product Roadmap Overview"
                className="bg-gray-800 border-gray-700 text-gray-100"
                onKeyDown={(e) =>
                  e.key === "Enter" && handleExpandTopic()
                }
              />
            </div>

            <div>
              <p className="text-xs text-gray-500 mb-2">Quick prompts:</p>
              <div className="flex flex-wrap gap-2">
                {quickPrompts.slice(3).map((qp) => (
                  <Button
                    key={qp}
                    variant="outline"
                    size="sm"
                    className="text-xs border-gray-700 text-gray-400 hover:text-gray-100 hover:bg-gray-800"
                    onClick={() => setPrompt(qp)}
                  >
                    {qp}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleExpandTopic}
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Full Presentation
            </Button>
          </TabsContent>

          {selectedText && (
            <TabsContent value="rewrite" className="space-y-4 mt-4">
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                <p className="text-xs text-gray-500 mb-1">Current text:</p>
                <p className="text-sm text-gray-300 italic">
                  {'"'}
                  {selectedText}
                  {'"'}
                </p>
              </div>

              <Button
                onClick={handleRewriteText}
                disabled={isLoading}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <PenLine className="h-4 w-4 mr-2" />
                )}
                Rewrite with AI
              </Button>
            </TabsContent>
          )}

          <TabsContent value="layout" className="space-y-4 mt-4">
            <div>
              <label className="text-sm text-gray-400 mb-2 block">
                Describe your presentation topic
              </label>
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., Annual company review for stakeholders"
                className="bg-gray-800 border-gray-700 text-gray-100"
                onKeyDown={(e) =>
                  e.key === "Enter" && handleLayoutSuggest()
                }
              />
            </div>

            <Button
              onClick={handleLayoutSuggest}
              disabled={isLoading || !prompt.trim()}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Lightbulb className="h-4 w-4 mr-2" />
              )}
              Get Layout Suggestions
            </Button>

            {layoutSuggestion && (
              <div className="space-y-3 mt-4">
                <p className="text-sm text-gray-300">
                  Suggested: {layoutSuggestion.slideCount} slides
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {layoutSuggestion.slides.map((slide, i) => (
                    <div
                      key={i}
                      className="bg-gray-800 border border-gray-700 rounded-lg p-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-200">
                          {i + 1}. {slide.title}
                        </span>
                        <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                          {slide.layout}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {slide.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
