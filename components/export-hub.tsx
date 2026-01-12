"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, FileText, ImageIcon, Film, Globe, Presentation, Package, Sparkles, Loader2 } from "lucide-react"
import type { Slide } from "@/types/editor"
import { exportToPdf } from "@/utils/pdf-export"
import { exportToPng, exportToJpg } from "@/utils/export-utils"
import { exportToHtml } from "@/utils/html-export"
import { exportToJson } from "@/utils/json-utils"
import { toast } from "@/components/ui/use-toast"

interface ExportHubProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  slides: Slide[]
  title?: string
  presentationTitle?: string
}

export function ExportHub({ open, onOpenChange, slides, title, presentationTitle }: ExportHubProps) {
  const [isExporting, setIsExporting] = useState(false)
  const [exportProgress, setExportProgress] = useState(0)
  const [exportType, setExportType] = useState<string | null>(null)

  const exportTitle = presentationTitle || title || "Untitled Presentation"

  const handleExport = async (type: string) => {
    setIsExporting(true)
    setExportType(type)
    setExportProgress(0)

    try {
      // Simulate progress for better UX
      const progressInterval = setInterval(() => {
        setExportProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      switch (type) {
        case "pdf":
          await exportToPdf(slides, exportTitle)
          break
        case "png":
          await exportToPng(slides, exportTitle)
          break
        case "jpg":
          await exportToJpg(slides, exportTitle)
          break
        case "html":
          await exportToHtml(slides, exportTitle)
          break
        case "json":
          exportToJson(exportTitle, slides)
          break
        case "video":
          // Video export placeholder - requires FFmpeg.wasm integration
          toast({
            title: "Video export coming soon",
            description: "We're working on adding video export functionality!",
            variant: "default",
          })
          break
        case "pptx":
          // PowerPoint export placeholder
          toast({
            title: "PowerPoint export coming soon",
            description: "We're working on adding PPTX export functionality!",
            variant: "default",
          })
          break
      }

      clearInterval(progressInterval)
      setExportProgress(100)

      if (type !== "video" && type !== "pptx") {
        toast({
          title: "Export successful",
          description: `Your presentation has been exported as ${type.toUpperCase()}.`,
          variant: "default",
        })
      }
    } catch (error: any) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: error.message || "An error occurred during export.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
      setTimeout(() => {
        setExportProgress(0)
        setExportType(null)
      }, 1000)
    }
  }

  const exportFormats = [
    {
      id: "pdf",
      name: "PDF Document",
      description: "High-quality PDF with all slides",
      icon: FileText,
      color: "text-destructive",
      bgColor: "bg-destructive/10",
      available: true,
    },
    {
      id: "png",
      name: "PNG Images",
      description: "Lossless image format, best quality",
      icon: ImageIcon,
      color: "text-cyber-cyan",
      bgColor: "bg-cyber-cyan/10",
      available: true,
    },
    {
      id: "jpg",
      name: "JPG Images",
      description: "Compressed images, smaller file size",
      icon: ImageIcon,
      color: "text-cyber-green",
      bgColor: "bg-cyber-green/10",
      available: true,
    },
    {
      id: "html",
      name: "HTML Presentation",
      description: "Interactive web presentation",
      icon: Globe,
      color: "text-cyber-purple",
      bgColor: "bg-cyber-purple/10",
      available: true,
    },
    {
      id: "video",
      name: "Video (MP4)",
      description: "Record presentation as video",
      icon: Film,
      color: "text-cyber-pink",
      bgColor: "bg-cyber-pink/10",
      available: false,
    },
    {
      id: "pptx",
      name: "PowerPoint",
      description: "Microsoft PowerPoint format",
      icon: Presentation,
      color: "text-cyber-yellow",
      bgColor: "bg-cyber-yellow/10",
      available: false,
    },
    {
      id: "json",
      name: "JSON Data",
      description: "Raw presentation data for backup",
      icon: Package,
      color: "text-cyber-cyan",
      bgColor: "bg-cyber-cyan/10",
      available: true,
    },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-popover/40 border-border/30 text-foreground backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-popover/40 shadow-xl shadow-cyber-cyan/10 rounded-2xl max-w-4xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5 text-cyber-cyan" />
            Export & Publish
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Export your presentation in multiple formats or publish it online
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="export" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card/30">
            <TabsTrigger value="export">Export</TabsTrigger>
            <TabsTrigger value="publish">Publish</TabsTrigger>
          </TabsList>

          <TabsContent value="export" className="space-y-4 mt-4">
            {isExporting && (
              <div className="p-4 bg-card/30 rounded-lg border border-border/40">
                <div className="flex items-center gap-3 mb-2">
                  <Loader2 className="h-4 w-4 animate-spin text-cyber-cyan" />
                  <span className="text-sm text-muted-foreground">Exporting as {exportType?.toUpperCase()}...</span>
                </div>
                <Progress value={exportProgress} className="h-2" />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
              {exportFormats.map((format) => (
                <button
                  key={format.id}
                  onClick={() => handleExport(format.id)}
                  disabled={!format.available || isExporting}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    format.available
                      ? "bg-card/30 border-border/40 hover:bg-card/50 hover:border-border/60"
                      : "bg-card/20 border-border/20 opacity-50 cursor-not-allowed"
                  } ${isExporting ? "opacity-50" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${format.bgColor}`}>
                      <format.icon className={`h-5 w-5 ${format.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium text-foreground text-sm">{format.name}</h3>
                        {!format.available && (
                          <Badge variant="secondary" className="text-xs bg-secondary/50 text-muted-foreground">
                            Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{format.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-4 bg-cyber-cyan/10 border border-cyber-cyan/20 rounded-lg">
              <div className="flex items-start gap-2">
                <Sparkles className="h-4 w-4 text-cyber-cyan mt-0.5 shrink-0" />
                <div className="text-sm">
                  <p className="text-cyber-cyan font-medium">Export Tips</p>
                  <p className="text-cyber-cyan/80 text-xs mt-1">
                    • PDF and HTML preserve all animations and effects
                    <br />• PNG offers the highest image quality
                    <br />• JSON format is perfect for backups
                    <br />• Video export will capture slide animations (coming soon)
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="publish" className="space-y-4 mt-4">
            <div className="text-center py-12">
              <Globe className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">Web Publishing</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Publish your presentation to the web with custom domains, analytics, and viewer engagement tracking.
              </p>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="secondary" className="bg-cyber-purple/20 text-cyber-purple">
                  Coming Soon
                </Badge>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
