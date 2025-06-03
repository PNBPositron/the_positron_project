"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Square,
  Type,
  ImageIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Copy,
  Save,
  Atom,
  ChevronDown,
  Palette,
  Wand2,
  Download,
  LayoutGrid,
  Sparkles,
  FileJson,
  Upload,
  Keyboard,
  Video,
  Music,
  FileType,
  Film,
  HelpCircle,
  CuboidIcon as Cube,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

import SlideCanvas from "@/components/slide-canvas"
import SlidesThumbnails from "@/components/slides-thumbnails"
import PresentationMode from "@/components/presentation-mode"
import { ImageFilters } from "@/components/image-filters"
import { BackgroundEditor } from "@/components/background-editor"
import { ZoomControls } from "@/components/zoom-controls"
import { AnimationControls, TransitionControls } from "@/components/animation-controls"
import { KeyboardShortcuts } from "@/components/keyboard-shortcuts"
import { MediaControls } from "@/components/media-controls"
import type { Slide, SlideBackground, ElementAnimation, SlideTransition } from "@/types/editor"
import { exportToPdf, exportToPng, exportToJpg, exportToGif, exportCurrentSlide } from "@/utils/export-utils"
import { exportToJson, importFromJson } from "@/utils/json-utils"
import { ShapeSelector } from "@/components/shape-selector"
import { loadCustomFont } from "@/utils/font-utils"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TextEffects } from "./text-effects"
import { Image3DEffects } from "./image-3d-effects"

const FONT_OPTIONS = [
  { name: "Default", value: "Inter, sans-serif" },
  { name: "Serif", value: "Georgia, serif" },
  { name: "Monospace", value: "Consolas, monospace" },
  { name: "Display", value: "'Bebas Neue', sans-serif" },
  { name: "Handwriting", value: "'Caveat', cursive" },
]

const COLOR_PRESETS = [
  "#0ea5e9", // Blue
  "#3b82f6", // Brighter blue
  "#1d4ed8", // Darker blue
  "#eab308", // Yellow
  "#facc15", // Brighter yellow
  "#ca8a04", // Darker yellow
  "#f97316", // Orange (transition color)
  "#ffffff", // White
  "#000000", // Black
]

// Add this new component for GIF export options
function GifExportDialog({
  open,
  onOpenChange,
  onExport,
  isSingleSlide = false,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onExport: (options: any) => void
  isSingleSlide?: boolean
}) {
  const [frameDuration, setFrameDuration] = useState(2000)
  const [quality, setQuality] = useState(10)
  const [resolution, setResolution] = useState(1)
  const [loop, setLoop] = useState(0)
  const [includeTransitions, setIncludeTransitions] = useState(true)
  const [includeAnimations, setIncludeAnimations] = useState(true)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800/80 border-gray-700/60 text-gray-100 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/80">
        <DialogHeader>
          <DialogTitle>{isSingleSlide ? "Export Slide as GIF" : "Export Presentation as GIF"}</DialogTitle>
          <DialogDescription className="text-gray-400">Customize your GIF export settings</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm text-gray-300">Frame Duration (ms)</Label>
              <span className="text-xs text-gray-400">{frameDuration}ms</span>
            </div>
            <Slider
              min={500}
              max={5000}
              step={100}
              value={[frameDuration]}
              onValueChange={([value]) => setFrameDuration(value)}
              className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-blue-400 [&>span:first-child_span]:bg-blue-400"
            />
            <p className="text-xs text-gray-400">How long each slide appears in the GIF</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm text-gray-300">Quality</Label>
              <span className="text-xs text-gray-400">{quality}</span>
            </div>
            <Slider
              min={1}
              max={20}
              step={1}
              value={[quality]}
              onValueChange={([value]) => setQuality(value)}
              className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-blue-400 [&>span:first-child_span]:bg-blue-400"
            />
            <p className="text-xs text-gray-400">Lower values = better quality but larger file size</p>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between">
              <Label className="text-sm text-gray-300">Resolution</Label>
              <span className="text-xs text-gray-400">{resolution.toFixed(1)}x</span>
            </div>
            <Slider
              min={0.3}
              max={1}
              step={0.1}
              value={[resolution]}
              onValueChange={([value]) => setResolution(value)}
              className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-blue-400 [&>span:first-child_span]:bg-blue-400"
            />
            <p className="text-xs text-gray-400">Scale of the output GIF (lower = smaller file)</p>
          </div>

          <div className="space-y-2">
            <Label className="text-sm text-gray-300">Loop Behavior</Label>
            <Select value={String(loop)} onValueChange={(value) => setLoop(Number.parseInt(value))}>
              <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
                <SelectValue placeholder="Select loop behavior" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                <SelectItem value="0">Loop forever</SelectItem>
                <SelectItem value="1">Play once</SelectItem>
                <SelectItem value="2">Play twice</SelectItem>
                <SelectItem value="3">Play three times</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="include-transitions" className="text-sm text-gray-300">
              Include Slide Transitions
            </Label>
            <Switch id="include-transitions" checked={includeTransitions} onCheckedChange={setIncludeTransitions} />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="include-animations" className="text-sm text-gray-300">
              Include Element Animations
            </Label>
            <Switch id="include-animations" checked={includeAnimations} onCheckedChange={setIncludeAnimations} />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600"
          >
            Cancel
          </Button>
          <Button
            onClick={() => {
              onExport({
                frameDuration,
                quality,
                resolution,
                loop,
                includeTransitions,
                includeAnimations,
              })
              onOpenChange(false)
            }}
            className="bg-gradient-to-r from-blue-500 to-yellow-400 text-white hover:from-blue-600 hover:to-yellow-500"
          >
            Export GIF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default function DesignEditor() {
  const [presentationTitle, setPresentationTitle] = useState("Untitled Positron")
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: "1",
      elements: [
        {
          id: "title-1",
          type: "text",
          content: "My Positron Project",
          x: 250,
          y: 100,
          width: 500,
          height: 80,
          fontSize: 48,
          fontWeight: "bold",
          textAlign: "center",
          fontFamily: "Inter, sans-serif",
        },
      ],
      background: {
        type: "gradient",
        value: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      },
      transition: {
        type: "fade",
        duration: 0.5,
        easing: "ease",
      },
    },
  ])
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null)
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [showImagePanel, setShowImagePanel] = useState(false)
  const [showMediaPanel, setShowMediaPanel] = useState(false)
  const [showBackgroundPanel, setShowBackgroundPanel] = useState(false)
  const [showAnimationPanel, setShowAnimationPanel] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [zoomLevel, setZoomLevel] = useState(75)
  const [isPreviewingAnimation, setIsPreviewingAnimation] = useState(false)
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false)
  const [importError, setImportError] = useState<string | null>(null)
  const [showGrid, setShowGrid] = useState(false)
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false)
  const [customFonts, setCustomFonts] = useState<Array<{ name: string; value: string }>>([])
  // Add this state variable to the DesignEditor component
  const [isGifExportDialogOpen, setIsGifExportDialogOpen] = useState(false)
  const [isSingleSlideExport, setIsSingleSlideExport] = useState(false)
  const [showTextEffectsPanel, setShowTextEffectsPanel] = useState(false)
  const [showImage3dEffectsPanel, setShowImage3dEffectsPanel] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const fontInputRef = useRef<HTMLInputElement>(null)

  const canvasContainerRef = useRef<HTMLDivElement>(null)

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return
      }

      // Show keyboard shortcuts dialog
      if (e.key === "?" || (e.key === "/" && e.shiftKey)) {
        e.preventDefault()
        setShowKeyboardShortcuts(true)
      }

      // Toggle grid
      if (e.key === "g" || e.key === "G") {
        e.preventDefault()
        setShowGrid((prev) => !prev)
      }

      // Start presentation mode
      if (e.key === "F5") {
        e.preventDefault()
        setIsPresentationMode(true)
      }

      // Delete selected element
      if ((e.key === "Delete" || e.key === "Backspace") && selectedElementId) {
        e.preventDefault()
        deleteElement()
      }

      // Duplicate selected element
      if (e.key === "d" && e.ctrlKey && selectedElementId) {
        e.preventDefault()
        duplicateElement()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedElementId])

  const handleExportJson = () => {
    exportToJson(presentationTitle, slides)
    toast({
      title: "Export successful",
      description: "Your presentation has been exported as JSON.",
      variant: "default",
    })
  }

  const handleImportClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click()
    }
  }

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]

    try {
      const importedData = await importFromJson(file)

      // Update presentation data
      setPresentationTitle(importedData.title)
      setSlides(importedData.slides)
      setCurrentSlideIndex(0)
      setSelectedElementId(null)

      toast({
        title: "Import successful",
        description: "Your presentation has been imported successfully.",
        variant: "default",
      })
    } catch (error) {
      console.error("Import error:", error)
      setImportError((error as Error).message)
      setIsImportDialogOpen(true)
    }

    // Reset the input value so the same file can be selected again
    e.target.value = ""
  }

  const handleFontUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]

    try {
      // Generate a font name based on the file name
      const fontName = file.name.split(".")[0].replace(/[^a-zA-Z0-9]/g, "")
      const fontFamily = await loadCustomFont(file, fontName)

      // Add the new font to our custom fonts list
      setCustomFonts((prev) => [...prev, { name: fontName, value: fontFamily }])

      toast({
        title: "Font uploaded",
        description: `Font "${fontName}" has been added to your fonts list.`,
        variant: "default",
      })
    } catch (error) {
      console.error("Font upload error:", error)
      toast({
        title: "Font upload failed",
        description: "There was an error uploading your font.",
        variant: "destructive",
      })
    }

    // Reset the input value so the same file can be selected again
    e.target.value = ""
  }

  const addNewSlide = () => {
    const newSlide: Slide = {
      id: `slide-${Date.now()}`,
      elements: [],
      background: {
        type: "gradient",
        value: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
      },
      transition: {
        type: "cube",
        direction: "left",
        duration: 0.8,
        easing: "ease-in-out",
        perspective: 1200,
        depth: 150,
      },
    }
    setSlides([...slides, newSlide])
    setCurrentSlideIndex(slides.length)
  }

  const addTextElement = () => {
    const currentSlide = slides[currentSlideIndex]
    const newElement = {
      id: `text-${Date.now()}`,
      type: "text" as const,
      content: "New Text",
      x: 250,
      y: 250,
      width: 200,
      height: 50,
      fontSize: 24,
      fontWeight: "normal",
      textAlign: "left",
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
    }

    const updatedSlides = [...slides]
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: [...currentSlide.elements, newElement],
    }

    setSlides(updatedSlides)
    setSelectedElementId(newElement.id)
  }

  const addShapeElement = (shape: string) => {
    const currentSlide = slides[currentSlideIndex]
    const newElement = {
      id: `shape-${Date.now()}`,
      type: "shape" as const,
      shape,
      x: 250,
      y: 250,
      width: 100,
      height: 100,
      color: "#0ea5e9",
      animation: {
        type: "zoom",
        delay: 0.3,
        duration: 0.8,
        trigger: "onLoad",
        easing: "ease-out",
      },
    }

    const updatedSlides = [...slides]
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: [...currentSlide.elements, newElement],
    }

    setSlides(updatedSlides)
    setSelectedElementId(newElement.id)
  }

  const addImageElement = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const reader = new FileReader()

    reader.onload = (event) => {
      if (!event.target?.result) return

      const currentSlide = slides[currentSlideIndex]
      const newElement = {
        id: `image-${Date.now()}`,
        type: "image" as const,
        src: event.target.result as string,
        x: 250,
        y: 200,
        width: 300,
        height: 200,
        filters: {
          grayscale: 0,
          sepia: 0,
          blur: 0,
          brightness: 100,
          contrast: 100,
          hueRotate: 0,
          saturate: 100,
          opacity: 100,
        },
        effects: {
          borderRadius: 0,
          borderWidth: 0,
          borderColor: "#ffffff",
          shadowBlur: 0,
          shadowColor: "#000000",
          shadowOffsetX: 0,
          shadowOffsetY: 0,
        },
        animation: {
          type: "fade",
          delay: 0.4,
          duration: 1.2,
          trigger: "onLoad",
          easing: "ease-in-out",
        },
      }

      const updatedSlides = [...slides]
      updatedSlides[currentSlideIndex] = {
        ...currentSlide,
        elements: [...currentSlide.elements, newElement],
      }

      setSlides(updatedSlides)
      setSelectedElementId(newElement.id)
    }

    reader.readAsDataURL(file)

    // Reset the input value so the same file can be selected again
    e.target.value = ""
  }

  const addVideoElement = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const reader = new FileReader()

    reader.onload = (event) => {
      if (!event.target?.result) return

      const currentSlide = slides[currentSlideIndex]
      const newElement = {
        id: `video-${Date.now()}`,
        type: "video" as const,
        src: event.target.result as string,
        x: 250,
        y: 200,
        width: 400,
        height: 225,
        autoplay: false,
        controls: true,
        loop: false,
        muted: false,
        animation: {
          type: "fade",
          delay: 0.4,
          duration: 1.2,
          trigger: "onLoad",
          easing: "ease-in-out",
        },
      }

      const updatedSlides = [...slides]
      updatedSlides[currentSlideIndex] = {
        ...currentSlide,
        elements: [...currentSlide.elements, newElement],
      }

      setSlides(updatedSlides)
      setSelectedElementId(newElement.id)
    }

    reader.readAsDataURL(file)

    // Reset the input value so the same file can be selected again
    e.target.value = ""
  }

  const addAudioElement = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const reader = new FileReader()

    reader.onload = (event) => {
      if (!event.target?.result) return

      const currentSlide = slides[currentSlideIndex]
      const newElement = {
        id: `audio-${Date.now()}`,
        type: "audio" as const,
        src: event.target.result as string,
        x: 250,
        y: 200,
        width: 300,
        height: 50,
        autoplay: false,
        controls: true,
        loop: false,
        animation: {
          type: "fade",
          delay: 0.4,
          duration: 1.2,
          trigger: "onLoad",
          easing: "ease-in-out",
        },
      }

      const updatedSlides = [...slides]
      updatedSlides[currentSlideIndex] = {
        ...currentSlide,
        elements: [...currentSlide.elements, newElement],
      }

      setSlides(updatedSlides)
      setSelectedElementId(newElement.id)
    }

    reader.readAsDataURL(file)

    // Reset the input value so the same file can be selected again
    e.target.value = ""
  }

  const updateElement = (elementId: string, updates: Record<string, any>) => {
    const currentSlide = slides[currentSlideIndex]
    const elementIndex = currentSlide.elements.findIndex((el) => el.id === elementId)

    if (elementIndex === -1) return

    const updatedElements = [...currentSlide.elements]
    updatedElements[elementIndex] = {
      ...updatedElements[elementIndex],
      ...updates,
    }

    const updatedSlides = [...slides]
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: updatedElements,
    }

    setSlides(updatedSlides)
  }

  const updateElementAnimation = (animation: ElementAnimation) => {
    if (!selectedElementId) return
    updateElement(selectedElementId, { animation })
  }

  const updateSlideTransition = (transition: SlideTransition) => {
    const currentSlide = slides[currentSlideIndex]

    const updatedSlides = [...slides]
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      transition,
    }

    setSlides(updatedSlides)
  }

  const previewElementAnimation = () => {
    if (!selectedElementId) return

    // Reset and then trigger animation preview
    setIsPreviewingAnimation(true)
    setTimeout(() => {
      setIsPreviewingAnimation(false)
    }, 100)
  }

  const previewSlideTransition = () => {
    // Show a toast with instructions
    toast({
      title: "Transition Preview",
      description: "To preview transitions, use the presentation mode and navigate between slides.",
      duration: 3000,
    })
  }

  const updateBackground = (background: SlideBackground) => {
    const currentSlide = slides[currentSlideIndex]

    const updatedSlides = [...slides]
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      background,
    }

    setSlides(updatedSlides)
  }

  const deleteElement = () => {
    if (!selectedElementId) return

    const currentSlide = slides[currentSlideIndex]
    const updatedElements = currentSlide.elements.filter((el) => el.id !== selectedElementId)

    const updatedSlides = [...slides]
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: updatedElements,
    }

    setSlides(updatedSlides)
    setSelectedElementId(null)
  }

  const duplicateElement = () => {
    if (!selectedElementId) return

    const currentSlide = slides[currentSlideIndex]
    const elementToDuplicate = currentSlide.elements.find((el) => el.id === selectedElementId)

    if (!elementToDuplicate) return

    // Create a deep copy of the element with a new ID
    const duplicatedElement = {
      ...JSON.parse(JSON.stringify(elementToDuplicate)),
      id: `${elementToDuplicate.type}-${Date.now()}`,
      x: elementToDuplicate.x + 20, // Offset slightly to make it visible
      y: elementToDuplicate.y + 20,
    }

    const updatedSlides = [...slides]
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: [...currentSlide.elements, duplicatedElement],
    }

    setSlides(updatedSlides)
    setSelectedElementId(duplicatedElement.id)

    toast({
      title: "Element duplicated",
      description: "The selected element has been duplicated.",
      duration: 2000,
    })
  }

  const deleteSlide = () => {
    if (slides.length <= 1) return

    const updatedSlides = slides.filter((_, index) => index !== currentSlideIndex)
    setSlides(updatedSlides)
    setCurrentSlideIndex(Math.min(currentSlideIndex, updatedSlides.length - 1))
    setSelectedElementId(null)
  }

  const duplicateSlide = () => {
    const currentSlide = slides[currentSlideIndex]
    const newSlide = {
      ...JSON.parse(JSON.stringify(currentSlide)),
      id: `slide-${Date.now()}`,
    }

    const updatedSlides = [...slides]
    updatedSlides.splice(currentSlideIndex + 1, 0, newSlide)

    setSlides(updatedSlides)
    setCurrentSlideIndex(currentSlideIndex + 1)
  }

  // Add this function to handle GIF export with options
  const handleGifExportWithOptions = (options: any, currentOnly = false) => {
    try {
      setIsExporting(true)

      if (currentOnly) {
        exportToGif([slides[currentSlideIndex]], `${presentationTitle}-slide-${currentSlideIndex + 1}`, options)
        toast({
          title: "Export started",
          description: "Your current slide is being exported as a GIF. This may take a moment.",
          variant: "default",
        })
      } else {
        exportToGif(slides, presentationTitle, options)
        toast({
          title: "Export started",
          description: "Your presentation is being exported as a GIF. This may take a moment.",
          variant: "default",
        })
      }
    } catch (error) {
      console.error("GIF export error:", error)
      toast({
        title: "Export failed",
        description: "There was an error exporting your presentation.",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExport = async (format: "pdf" | "png" | "jpg" | "gif", currentOnly = false) => {
    try {
      setIsExporting(true)

      if (currentOnly) {
        if (format === "gif") {
          setIsGifExportDialogOpen(true)
        } else {
          await exportCurrentSlide(
            slides[currentSlideIndex],
            format as "png" | "jpg",
            `${presentationTitle}-slide-${currentSlideIndex + 1}`,
          )
        }
        toast({
          title: "Export successful",
          description: `Current slide has been exported as ${format.toUpperCase()}.`,
          variant: "default",
        })
      } else {
        if (format === "pdf") {
          await exportToPdf(slides, presentationTitle)
        } else if (format === "png") {
          await exportToPng(slides, presentationTitle)
        } else if (format === "jpg") {
          await exportToJpg(slides, presentationTitle)
        } else if (format === "gif") {
          setIsGifExportDialogOpen(true)
        }

        toast({
          title: "Export successful",
          description: `Your presentation has been exported as ${format.toUpperCase()}.`,
          variant: "default",
        })
      }
    } catch (error) {
      console.error(`${format.toUpperCase()} export error:`, error)
      toast({
        title: "Export failed",
        description: "There was an error exporting your presentation.",
        variant: "destructive",
        action: <ToastAction altText="Try again">Try again</ToastAction>,
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleZoomChange = (newZoomLevel: number) => {
    setZoomLevel(newZoomLevel)
  }

  const selectedElement = selectedElementId
    ? slides[currentSlideIndex].elements.find((el) => el.id === selectedElementId)
    : null

  if (isPresentationMode) {
    return (
      <PresentationMode slides={slides} initialSlide={currentSlideIndex} onExit={() => setIsPresentationMode(false)} />
    )
  }

  // Combine built-in and custom fonts
  const allFonts = [...FONT_OPTIONS, ...customFonts]

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800/60 p-4 flex items-center justify-between bg-gray-900/40 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-900/40">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-r from-blue-500 to-yellow-400 p-1.5 rounded-md">
            <Atom className="h-5 w-5 text-white" />
          </div>
          <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-yellow-300 ml-1 mr-2">
            Positron
          </span>
          <Input
            className="w-64 h-8 bg-gray-800/50 border-gray-700/60 text-gray-100 focus-visible:ring-blue-500/70 backdrop-blur-md"
            placeholder="Untitled Presentation"
            value={presentationTitle}
            onChange={(e) => setPresentationTitle(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:bg-gray-800 hover:text-gray-100"
            onClick={() => setShowKeyboardShortcuts(true)}
          >
            <Keyboard className="h-4 w-4 mr-1 text-gray-400" />
            Shortcuts
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-300 hover:bg-gray-800 hover:text-gray-100"
            onClick={() => {
              toast({
                title: "About Positron",
                description:
                  "Positron is an advanced presentation editor with animations, effects, and export capabilities.",
                duration: 4000,
              })
            }}
          >
            <HelpCircle className="h-4 w-4 mr-1 text-blue-400" />
            About
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700/60 bg-gray-800/30 hover:bg-gray-700/50 text-gray-100 backdrop-blur-md"
              >
                <Save className="h-4 w-4 mr-2 text-blue-400" />
                Save
                <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-gray-800/70 border-gray-700/60 text-gray-100 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/70">
              <DropdownMenuItem className="hover:bg-gray-700">
                <Save className="h-4 w-4 mr-2 text-blue-400" />
                Save Project
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem className="hover:bg-gray-700" onClick={handleExportJson}>
                <FileJson className="h-4 w-4 mr-2 text-blue-400" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-gray-700" onClick={handleImportClick}>
                <Upload className="h-4 w-4 mr-2 text-blue-400" />
                Import from JSON
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                className="hover:bg-gray-700"
                onClick={() => handleExport("pdf")}
                disabled={isExporting}
              >
                <Download className="h-4 w-4 mr-2 text-blue-400" />
                {isExporting ? "Exporting..." : "Export as PDF"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-gray-700"
                onClick={() => handleExport("png")}
                disabled={isExporting}
              >
                <ImageIcon className="h-4 w-4 mr-2 text-blue-400" />
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-gray-700"
                onClick={() => handleExport("jpg")}
                disabled={isExporting}
              >
                <ImageIcon className="h-4 w-4 mr-2 text-blue-400" />
                Export as JPG
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-gray-700"
                onClick={() => {
                  setIsSingleSlideExport(false)
                  setIsGifExportDialogOpen(true)
                }}
                disabled={isExporting}
              >
                <Film className="h-4 w-4 mr-2 text-blue-400" />
                Export as GIF (Advanced)
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-700" />
              <DropdownMenuItem
                className="hover:bg-gray-700"
                onClick={() => handleExport("png", true)}
                disabled={isExporting}
              >
                <ImageIcon className="h-4 w-4 mr-2 text-yellow-400" />
                Export Current Slide (PNG)
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-gray-700"
                onClick={() => handleExport("jpg", true)}
                disabled={isExporting}
              >
                <ImageIcon className="h-4 w-4 mr-2 text-yellow-400" />
                Export Current Slide (JPG)
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-gray-700"
                onClick={() => {
                  setIsSingleSlideExport(true)
                  setIsGifExportDialogOpen(true)
                }}
                disabled={isExporting}
              >
                <Film className="h-4 w-4 mr-2 text-yellow-400" />
                Export Current Slide as GIF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Slides Sidebar - Floating Panel */}
        <div className="absolute left-4 top-24 w-64 rounded-xl bg-gray-900/40 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-900/40 p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-8rem)] shadow-lg shadow-black/20 border border-gray-700/30 z-10">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-medium text-gray-300">Slides</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={addNewSlide}
              className="text-gray-300 hover:bg-gray-800 hover:text-gray-100 h-7 w-7"
            >
              <Plus className="h-4 w-4 text-blue-400" />
            </Button>
          </div>

          <SlidesThumbnails
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            onSelectSlide={setCurrentSlideIndex}
          />

          <div className="flex gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-gray-700 bg-gray-800/80 hover:bg-gray-700 text-gray-100"
              onClick={deleteSlide}
              disabled={slides.length <= 1}
            >
              <Trash2 className="h-3 w-3 mr-1 text-red-400" />
              Delete
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-gray-700 bg-gray-800/80 hover:bg-gray-700 text-gray-100"
              onClick={duplicateSlide}
            >
              <Copy className="h-3 w-3 mr-1 text-blue-400" />
              Duplicate
            </Button>
          </div>

          {/* Background Panel */}
          {showBackgroundPanel && (
            <div className="mt-4 border border-gray-800/60 rounded-md p-3 bg-gray-800/30 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/30">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Background Settings</h4>
              <BackgroundEditor
                background={slides[currentSlideIndex].background}
                onUpdateBackground={updateBackground}
              />
            </div>
          )}

          {/* Animation Panel */}
          {showAnimationPanel && (
            <div className="mt-4 border border-gray-800/60 rounded-md p-3 bg-gray-800/30 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/30">
              <Tabs defaultValue={selectedElement ? "element" : "slide"}>
                <TabsList className="grid grid-cols-2 bg-gray-800/50 backdrop-blur-md">
                  <TabsTrigger
                    value="element"
                    className="text-gray-300 data-[state=active]:bg-gray-700"
                    disabled={!selectedElement}
                  >
                    Element
                  </TabsTrigger>
                  <TabsTrigger value="slide" className="text-gray-300 data-[state=active]:bg-gray-700">
                    Slide
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="element" className="mt-3">
                  {selectedElement ? (
                    <AnimationControls
                      animation={selectedElement.animation}
                      onUpdateAnimation={updateElementAnimation}
                      onPreviewAnimation={previewElementAnimation}
                    />
                  ) : (
                    <p className="text-sm text-gray-400">Select an element to configure its animation.</p>
                  )}
                </TabsContent>
                <TabsContent value="slide" className="mt-3">
                  <TransitionControls
                    transition={slides[currentSlideIndex].transition}
                    onUpdateTransition={updateSlideTransition}
                    onPreviewTransition={previewSlideTransition}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Image Filters Panel */}
          {showImagePanel && selectedElement?.type === "image" && (
            <div className="mt-4 border border-gray-800/60 rounded-md p-3 bg-gray-800/30 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/30">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Image Filters & Effects</h4>
              <ImageFilters element={selectedElement} onUpdateElement={updateElement} />
            </div>
          )}

          {/* Media Controls Panel */}
          {showMediaPanel && (selectedElement?.type === "video" || selectedElement?.type === "audio") && (
            <div className="mt-4 border border-gray-800/60 rounded-md p-3 bg-gray-800/30 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/30">
              <h4 className="text-sm font-medium text-gray-300 mb-3">Media Controls</h4>
              <MediaControls element={selectedElement} onUpdateElement={updateElement} />
            </div>
          )}

          {/* Text Effects Panel */}
          {showTextEffectsPanel && selectedElement?.type === "text" && (
            <div className="mt-4 border border-gray-800/60 rounded-md p-3 bg-gray-800/30 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/30">
              <TextEffects element={selectedElement} onUpdateElement={updateElement} />
            </div>
          )}

          {/* Image 3D Effects Panel */}
          {showImage3dEffectsPanel && selectedElement?.type === "image" && (
            <div className="mt-4 border border-gray-800/60 rounded-md p-3 bg-gray-800/30 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/30">
              <Image3DEffects element={selectedElement} onUpdateElement={updateElement} />
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-gray-950 flex flex-col">
          {/* Canvas Controls - Floating Bar */}
          <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10 px-4 py-2 flex justify-between items-center bg-gray-900/70 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-900/70 border border-gray-700/60 rounded-full shadow-lg min-w-[400px]">
            <Button
              variant="ghost"
              size="sm"
              className="text-gray-300 hover:bg-gray-800/60 hover:text-gray-100 h-8 rounded-full"
              onClick={() => handleExport("png", true)}
              disabled={isExporting}
            >
              <ImageIcon className="h-4 w-4 mr-1 text-blue-400" />
              Export
            </Button>

            <div className="flex items-center gap-1 px-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                disabled={currentSlideIndex === 0}
                className="text-gray-300 hover:bg-gray-800/60 hover:text-gray-100 h-8 w-8 rounded-full"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm py-1 px-2 text-gray-300">
                {currentSlideIndex + 1}/{slides.length}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                disabled={currentSlideIndex === slides.length - 1}
                className="text-gray-300 hover:bg-gray-800/60 hover:text-gray-100 h-8 w-8 rounded-full"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <ZoomControls zoomLevel={zoomLevel} onZoomChange={handleZoomChange} />
          </div>

          {/* Canvas */}
          <div
            ref={canvasContainerRef}
            className="flex-1 overflow-auto flex items-center justify-center p-8 bg-[linear-gradient(135deg,#0ea5e9_0%,#eab308_100%)] rounded-3xl"
          >
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500/50 to-yellow-400/50 rounded-lg blur opacity-30 group-hover:opacity-70 transition duration-1000"></div>
              <SlideCanvas
                slide={slides[currentSlideIndex]}
                selectedElementId={selectedElementId}
                onSelectElement={setSelectedElementId}
                onUpdateElement={updateElement}
                zoomLevel={zoomLevel}
              />
            </div>
          </div>
        </div>

        {/* Right Toolbar Panel */}
        <div className="w-56 absolute right-4 top-24 rounded-xl bg-gray-900/60 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-900/60 p-4 flex flex-col gap-4 overflow-y-auto max-h-[calc(100vh-8rem)] shadow-lg shadow-black/20 border border-gray-700/30 z-10">
          <h3 className="text-sm font-medium text-gray-300 mb-2">Tools</h3>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={addTextElement}
              className="text-gray-300 hover:bg-gray-800 hover:text-gray-100"
            >
              <Type className="h-4 w-4 mr-1 text-blue-400" />
              Text
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-gray-800 hover:text-gray-100">
                  <Square className="h-4 w-4 mr-1 text-blue-400" />
                  Shapes
                  <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-gray-800 border-gray-700 text-gray-100 w-[350px]">
                <ShapeSelector onSelectShape={addShapeElement} />
              </DropdownMenuContent>
            </DropdownMenu>

            <label>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-gray-800 hover:text-gray-100" asChild>
                <span>
                  <ImageIcon className="h-4 w-4 mr-1 text-blue-400" />
                  Image
                </span>
              </Button>
              <input type="file" accept="image/*" className="hidden" onChange={addImageElement} />
            </label>

            <label>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-gray-800 hover:text-gray-100" asChild>
                <span>
                  <Video className="h-4 w-4 mr-1 text-blue-400" />
                  Video
                </span>
              </Button>
              <input type="file" accept="video/*" className="hidden" onChange={addVideoElement} ref={videoInputRef} />
            </label>

            <label>
              <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-gray-800 hover:text-gray-100" asChild>
                <span>
                  <Music className="h-4 w-4 mr-1 text-blue-400" />
                  Audio
                </span>
              </Button>
              <input type="file" accept="audio/*" className="hidden" onChange={addAudioElement} ref={audioInputRef} />
            </label>
          </div>

          <Separator className="my-2 bg-gray-700" />

          <div className="flex flex-wrap gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`text-gray-300 hover:bg-gray-800 hover:text-gray-100 ${showBackgroundPanel ? "bg-gray-800" : ""}`}
              onClick={() => {
                setShowBackgroundPanel(!showBackgroundPanel)
                setShowImagePanel(false)
                setShowAnimationPanel(false)
                setShowMediaPanel(false)
                setShowTextEffectsPanel(false)
                setShowImage3dEffectsPanel(false)
              }}
            >
              <LayoutGrid className="h-4 w-4 mr-1 text-blue-400" />
              Background
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`text-gray-300 hover:bg-gray-800 hover:text-gray-100 ${showAnimationPanel ? "bg-gray-800" : ""}`}
              onClick={() => {
                setShowAnimationPanel(!showAnimationPanel)
                setShowBackgroundPanel(false)
                setShowImagePanel(false)
                setShowMediaPanel(false)
                setShowTextEffectsPanel(false)
                setShowImage3dEffectsPanel(false)
              }}
            >
              <Sparkles className="h-4 w-4 mr-1 text-blue-400" />
              Animations
            </Button>
          </div>

          {selectedElement && (
            <>
              <Separator className="my-2 bg-gray-700" />
              <h3 className="text-sm font-medium text-gray-300 mb-2">Element Properties</h3>

              {selectedElement.type === "text" && (
                <>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateElement(selectedElementId!, {
                          fontWeight: selectedElement.fontWeight === "bold" ? "normal" : "bold",
                        })
                      }
                      className={`text-gray-300 hover:bg-gray-800 hover:text-gray-100 ${selectedElement.fontWeight === "bold" ? "bg-gray-800" : ""}`}
                    >
                      <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateElement(selectedElementId!, {
                          fontStyle: selectedElement.fontStyle === "italic" ? "normal" : "italic",
                        })
                      }
                      className="text-gray-300 hover:bg-gray-800 hover:text-gray-100"
                    >
                      <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() =>
                        updateElement(selectedElementId!, {
                          textDecoration: selectedElement.textDecoration === "underline" ? "none" : "underline",
                        })
                      }
                      className="text-gray-300 hover:bg-gray-800 hover:text-gray-100"
                    >
                      <Underline className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateElement(selectedElementId!, { textAlign: "left" })}
                      className={`text-gray-300 hover:bg-gray-800 hover:text-gray-100 ${selectedElement.textAlign === "left" ? "bg-gray-800" : ""}`}
                    >
                      <AlignLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateElement(selectedElementId!, { textAlign: "center" })}
                      className={`text-gray-300 hover:bg-gray-800 hover:text-gray-100 ${selectedElement.textAlign === "center" ? "bg-gray-800" : ""}`}
                    >
                      <AlignCenter className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateElement(selectedElementId!, { textAlign: "right" })}
                      className={`text-gray-300 hover:bg-gray-800 hover:text-gray-100 ${selectedElement.textAlign === "right" ? "bg-gray-800" : ""}`}
                    >
                      <AlignRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mb-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-300 hover:bg-gray-800 hover:text-gray-100 gap-1 w-full justify-between"
                        >
                          <span className="flex items-center">
                            <FileType className="h-4 w-4 mr-2 text-blue-400" />
                            Font
                          </span>
                          <ChevronDown className="h-3 w-3 opacity-50" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-800/70 border-gray-700/60 text-gray-100 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/70">
                        {allFonts.map((font) => (
                          <DropdownMenuItem
                            key={font.value}
                            onClick={() => updateElement(selectedElementId!, { fontFamily: font.value })}
                            className="hover:bg-gray-700"
                          >
                            <span style={{ fontFamily: font.value }}>{font.name}</span>
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator className="bg-gray-700" />
                        <DropdownMenuItem className="hover:bg-gray-700" onClick={() => fontInputRef.current?.click()}>
                          <FileType className="h-4 w-4 mr-2 text-blue-400" />
                          Upload Custom Font
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs text-gray-400">Size:</span>
                    <Slider
                      className="flex-1 [&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-blue-400 [&>span:first-child_span]:bg-blue-400"
                      min={12}
                      max={72}
                      step={1}
                      value={[selectedElement.fontSize]}
                      onValueChange={([value]) => updateElement(selectedElementId!, { fontSize: value })}
                    />
                    <span className="text-xs w-6 text-gray-300">{selectedElement.fontSize}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-gray-300 hover:bg-gray-800 hover:text-gray-100 w-full justify-start ${showTextEffectsPanel ? "bg-gray-800" : ""}`}
                    onClick={() => {
                      setShowTextEffectsPanel(!showTextEffectsPanel)
                      setShowBackgroundPanel(false)
                      setShowImagePanel(false)
                      setShowAnimationPanel(false)
                      setShowMediaPanel(false)
                      setShowImage3dEffectsPanel(false)
                    }}
                  >
                    <Cube className="h-4 w-4 mr-2 text-blue-400" />
                    3D Effects
                  </Button>
                </>
              )}

              {selectedElement.type === "shape" && (
                <>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-300 hover:bg-gray-800 hover:text-gray-100 gap-1 w-full justify-between"
                      >
                        <span className="flex items-center">
                          <Palette className="h-4 w-4 mr-2 text-blue-400" />
                          Color
                        </span>
                        <ChevronDown className="h-3 w-3 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 border-gray-700 text-gray-100 p-2">
                      <div className="grid grid-cols-3 gap-1">
                        {COLOR_PRESETS.map((color) => (
                          <div
                            key={color}
                            className="w-6 h-6 rounded-full cursor-pointer border border-gray-700 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={() => updateElement(selectedElementId!, { color })}
                          />
                        ))}
                      </div>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              {selectedElement.type === "image" && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-gray-300 hover:bg-gray-800 hover:text-gray-100 w-full justify-start ${
                      showImagePanel ? "bg-gray-800" : ""
                    }`}
                    onClick={() => {
                      setShowImagePanel(!showImagePanel)
                      setShowBackgroundPanel(false)
                      setShowAnimationPanel(false)
                      setShowMediaPanel(false)
                      setShowTextEffectsPanel(false)
                      setShowImage3dEffectsPanel(false)
                    }}
                  >
                    <Wand2 className="h-4 w-4 mr-2 text-blue-400" />
                    Filters & Effects
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-gray-300 hover:bg-gray-800 hover:text-gray-100 w-full justify-start ${
                      showImage3dEffectsPanel ? "bg-gray-800" : ""
                    }`}
                    onClick={() => {
                      setShowImage3dEffectsPanel(!showImage3dEffectsPanel)
                      setShowImagePanel(false)
                      setShowBackgroundPanel(false)
                      setShowAnimationPanel(false)
                      setShowMediaPanel(false)
                      setShowTextEffectsPanel(false)
                    }}
                  >
                    <Cube className="h-4 w-4 mr-2 text-blue-400" />
                    3D Effects
                  </Button>
                </>
              )}

              {(selectedElement.type === "video" || selectedElement.type === "audio") && (
                <>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-gray-300 hover:bg-gray-800 hover:text-gray-100 w-full justify-start ${showMediaPanel ? "bg-gray-800" : ""}`}
                    onClick={() => {
                      setShowMediaPanel(!showMediaPanel)
                      setShowBackgroundPanel(false)
                      setShowAnimationPanel(false)
                      setShowImagePanel(false)
                      setShowTextEffectsPanel(false)
                      setShowImage3dEffectsPanel(false)
                    }}
                  >
                    <Wand2 className="h-4 w-4 mr-2 text-blue-400" />
                    Media Controls
                  </Button>
                </>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={duplicateElement}
                className="text-gray-300 hover:bg-gray-800 hover:text-gray-100 w-full justify-start mt-2"
              >
                <Copy className="h-4 w-4 mr-2 text-blue-400" />
                Duplicate Element
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={deleteElement}
                className="text-gray-300 hover:bg-gray-800 hover:text-red-400 w-full justify-start mt-2"
              >
                <Trash2 className="h-4 w-4 mr-2 text-red-400" />
                Delete Element
              </Button>
            </>
          )}
        </div>
      </div>
      {/* Hidden file inputs */}
      <input type="file" ref={fileInputRef} className="hidden" accept=".json" onChange={handleImportFile} />
      <input
        type="file"
        ref={fontInputRef}
        className="hidden"
        accept=".ttf,.otf,.woff,.woff2"
        onChange={handleFontUpload}
      />

      {/* Import error dialog */}
      <AlertDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <AlertDialogContent className="bg-gray-800/80 border-gray-700/60 text-gray-100 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/80">
          <AlertDialogHeader>
            <AlertDialogTitle>Import Error</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              {importError || "There was an error importing your presentation."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600">
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Keyboard shortcuts dialog */}
      <KeyboardShortcuts open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts} />

      {/* GIF Export Dialog */}
      <GifExportDialog
        open={isGifExportDialogOpen}
        onOpenChange={setIsGifExportDialogOpen}
        onExport={(options) => handleGifExportWithOptions(options, isSingleSlideExport)}
        isSingleSlide={isSingleSlideExport}
      />
    </div>
  )
}
