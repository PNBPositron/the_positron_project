"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
  LayoutGrid,
  Sparkles,
  FileJson,
  Upload,
  Video,
  FileType,
  Film,
  Cable as Cube,
  UploadCloud,
  User,
  Cloud,
  Share2,
  Download,
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
import { exportToPdf, exportToPng, exportToJpg, exportCurrentSlide } from "@/utils/export-utils"
import { exportToJson, importFromJson } from "@/utils/json-utils"
import { ShapeSelector } from "@/components/shape-selector"
import { loadCustomFont } from "@/utils/font-utils"
import { TextEffects } from "./text-effects"
import { Image3DEffects } from "./image-3d-effects"
import { ImageLibrary } from "@/components/image-library"
import { ImageUploader } from "@/components/image-uploader"
import { AuthModal } from "@/components/auth-modal"
import { UserMenu } from "@/components/user-menu"
import { SavePresentationDialog } from "@/components/save-presentation-dialog"
import { supabase } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { PresentationsManager } from "@/components/presentations-manager"
import { ShareDialog } from "@/components/share-dialog"
import { exportToHtml } from "@/utils/html-export"
import { WallpaperSelector } from "@/components/wallpaper-selector"
// Import TemplateLibrary here
// import { TemplateLibrary } from "@/components/template-library" // Removed TemplateLibrary import
import { ImageInteractions } from "@/components/image-interactions"
import { ExportHub } from "@/components/export-hub"

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

export function DesignEditor() {
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
  const [showTextEffectsPanel, setShowTextEffectsPanel] = useState(false)
  const [showImage3dEffectsPanel, setShowImage3dEffectsPanel] = useState(false)
  const [showImageLibrary, setShowImageLibrary] = useState(false)
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [showImageUploader, setShowImageUploader] = useState(false)
  const [wallpaper, setWallpaper] = useState<string>("/images/abstract-3d-wallpaper.jpg")
  const [showImageInteractionsPanel, setShowImageInteractionsPanel] = useState(false)
  const [showExportHub, setShowExportHub] = useState(false)

  // Auth states
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [currentPresentationId, setCurrentPresentationId] = useState<string | null>(null)

  const [showPresentationsManager, setShowPresentationsManager] = useState(false)
  const [showShareDialog, setShowShareDialog] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const videoInputRef = useRef<HTMLInputElement>(null)
  const audioInputRef = useRef<HTMLInputElement>(null)
  const fontInputRef = useRef<HTMLInputElement>(null)

  const canvasContainerRef = useRef<HTMLDivElement>(null)

  // Store previous selected element ID to detect changes
  const previousSelectedId = useRef<string | null>(null)

  // Initialize auth state
  useEffect(() => {
    const initAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      setUser(session?.user ?? null)
    }

    initAuth()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)

      if (event === "SIGNED_IN") {
        toast({
          title: "Welcome!",
          description: "You are now signed in and can save your presentations.",
          variant: "default",
        })
      }
    })

    return () => subscription.unsubscribe()
  }, [])

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

      // Save presentation (Ctrl+S)
      if (e.key === "s" && e.ctrlKey) {
        e.preventDefault()
        handleSavePresentation()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [selectedElementId, user])

  // Close interactions panels when element changes
  useEffect(() => {
    if (selectedElementId !== previousSelectedId.current) {
      setShowImagePanel(false)
      setShowImage3dEffectsPanel(false)
      setShowImageInteractionsPanel(false)
      previousSelectedId.current = selectedElementId
    }
  }, [selectedElementId])

  const handleSavePresentation = () => {
    if (!user) {
      setShowAuthModal(true)
      return
    }
    setShowSaveDialog(true)
  }

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
      setCurrentPresentationId(null) // Reset presentation ID for imported data

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
      cornerRadius: 0,
      animation: {
        type: "zoom",
        delay: 0.3,
        duration: 0.8,
        trigger: "onLoad",
        easing: "ease-out",
      },
      glassmorphism: {
        enabled: false,
        blur: 10,
        opacity: 20,
        borderOpacity: 30,
        saturation: 180,
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
          skewX: 0,
          skewY: 0,
          scale: 100,
        },
        animation: {
          type: "fade",
          delay: 0.4,
          duration: 1.2,
          trigger: "onLoad",
          easing: "ease-in-out",
        },
        imageEffect3d: {
          type: "none",
          intensity: 5,
          angle: 15,
          perspective: 800,
          rotateX: 0,
          rotateY: 0,
          rotateZ: 0,
          translateZ: 0,
          hover: false,
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

  const handleExport = async (format: "pdf" | "png" | "jpg" | "html", currentOnly = false) => {
    try {
      setIsExporting(true)

      if (currentOnly && format !== "html") {
        await exportCurrentSlide(
          slides[currentSlideIndex],
          format as "png" | "jpg",
          `${presentationTitle}-slide-${currentSlideIndex + 1}`,
        )
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
        } else if (format === "html") {
          await exportToHtml(slides, presentationTitle)
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

  const handleAddImage = (imageSrc: string) => {
    const currentSlide = slides[currentSlideIndex]
    const newElement = {
      id: `image-${Date.now()}`,
      type: "image" as const,
      src: imageSrc,
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
        skewX: 0,
        skewY: 0,
        scale: 100,
      },
      animation: {
        type: "fade",
        delay: 0.4,
        duration: 1.2,
        trigger: "onLoad",
        easing: "ease-in-out",
      },
      imageEffect3d: {
        type: "none",
        intensity: 5,
        angle: 15,
        perspective: 800,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        translateZ: 0,
        hover: false,
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

  const addImageFromLibrary = (imageSrc: string) => {
    const currentSlide = slides[currentSlideIndex]
    const newElement = {
      id: `image-${Date.now()}`,
      type: "image" as const,
      src: imageSrc,
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
        skewX: 0,
        skewY: 0,
        scale: 100,
      },
      animation: {
        type: "fade",
        delay: 0.4,
        duration: 1.2,
        trigger: "onLoad",
        easing: "ease-in-out",
      },
      imageEffect3d: {
        type: "none",
        intensity: 5,
        angle: 15,
        perspective: 800,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        translateZ: 0,
        hover: false,
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

  const handleImagesUploaded = (uploadedImages: Array<{ src: string; file: File }>) => {
    const currentSlide = slides[currentSlideIndex]
    const newElements = uploadedImages.map((image, index) => ({
      id: `image-${Date.now()}-${index}`,
      type: "image" as const,
      src: image.src,
      x: 250 + index * 20, // Offset each image slightly
      y: 200 + index * 20,
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
        skewX: 0,
        skewY: 0,
        scale: 100,
      },
      animation: {
        type: "fade",
        delay: 0.4 + index * 0.1, // Stagger animations
        duration: 1.2,
        trigger: "onLoad",
        easing: "ease-in-out",
      },
      imageEffect3d: {
        type: "none",
        intensity: 5,
        angle: 15,
        perspective: 800,
        rotateX: 0,
        rotateY: 0,
        rotateZ: 0,
        translateZ: 0,
        hover: false,
      },
    }))

    const updatedSlides = [...slides]
    updatedSlides[currentSlideIndex] = {
      ...currentSlide,
      elements: [...currentSlide.elements, ...newElements],
    }

    setSlides(updatedSlides)
    // Select the first uploaded image
    if (newElements.length > 0) {
      setSelectedElementId(newElements[0].id)
    }
  }

  const handleWallpaperSelect = (wallpaperUrl: string) => {
    setWallpaper(wallpaperUrl)
  }

  // const handleSelectTemplate = (template: any) => {
  //   setPresentationTitle(template.title)
  //   setSlides(template.slides)
  //   setCurrentSlideIndex(0)
  //   setSelectedElementId(null)
  //   setCurrentPresentationId(null) // Reset presentation ID for template

  //   toast({
  //     title: "Template applied",
  //     description: `"${template.title}" template has been applied to your presentation.`,
  //     variant: "default",
  //   })
  // }

  const handleLoadPresentation = (presentation: any) => {
    setPresentationTitle(presentation.title)
    setSlides(presentation.slides)
    setCurrentSlideIndex(0)
    setSelectedElementId(null)
    setCurrentPresentationId(presentation.id)

    toast({
      title: "Presentation loaded",
      description: `"${presentation.title}" has been loaded successfully.`,
      variant: "default",
    })
  }

  const handleSaveSuccess = (presentationId: string) => {
    setCurrentPresentationId(presentationId)
  }

  const handleSignOut = () => {
    setUser(null)
    setCurrentPresentationId(null)
  }

  if (isPresentationMode) {
    return (
      <PresentationMode slides={slides} initialSlide={currentSlideIndex} onExit={() => setIsPresentationMode(false)} />
    )
  }

  // Combine built-in and custom fonts
  const allFonts = [...FONT_OPTIONS, ...customFonts]

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-sans overflow-hidden">
      {/* Header - Enhanced Frosted Glass */}
      <header className="relative border-b border-border/20 p-4 flex items-center justify-between backdrop-blur-2xl bg-card/5 shadow-2xl shadow-cyber-pink/10 z-50">
        {/* Enhanced glass effect overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyber-pink/5 via-cyber-cyan/5 to-cyber-purple/5 pointer-events-none"></div>

        {/* Subtle animated border effect - make it more prominent */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-foreground/50 to-transparent"></div>

        {/* Content wrapper with relative positioning */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="relative group">
            {/* Outer glow ring */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyber-pink/30 via-cyber-cyan/30 to-cyber-purple/30 rounded-xl blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            {/* Main logo container - Frosted glass */}
            <div className="relative backdrop-blur-md bg-card/5 p-2 rounded-xl shadow-lg border border-border/10">
              <Atom className="h-6 w-6 text-cyber-cyan drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyber-pink via-cyber-cyan to-cyber-purple drop-shadow-[0_0_8px_rgba(236,72,153,0.3)]">
              POSITRON
            </span>
            <span className="text-xs text-cyber-cyan/80 font-medium tracking-wider uppercase drop-shadow-[0_0_4px_rgba(34,211,238,0.3)]">
              Open-source presentation editor
            </span>
          </div>
          <div className="h-8 w-px bg-gradient-to-b from-transparent via-border/20 to-transparent mx-2"></div>
          <Input
            className="w-72 h-10 backdrop-blur-md bg-card/5 border-border/10 text-foreground focus-visible:ring-2 focus-visible:ring-cyber-cyan/30 focus-visible:border-cyber-cyan/30 rounded-xl shadow-inner placeholder:text-muted-foreground transition-all duration-300 hover:bg-card/10 hover:border-border/20"
            placeholder="Enter presentation title..."
            value={presentationTitle}
            onChange={(e) => setPresentationTitle(e.target.value)}
          />
        </div>
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 backdrop-blur-md bg-card/5 rounded-xl border border-border/10">
            <span className="text-xs text-muted-foreground">Slides:</span>
            <span className="text-sm font-semibold text-cyber-cyan">
              {currentSlideIndex + 1}/{slides.length}
            </span>
          </div>

          <WallpaperSelector onSelectWallpaper={handleWallpaperSelect} />

          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className={`gap-1 backdrop-blur-md border-border/10 text-foreground hover:bg-card/10 hover:border-border/20 transition-all duration-300 ${
              showGrid ? "bg-cyber-cyan/20 border-cyber-cyan/30 text-cyber-cyan" : "bg-card/5"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
            Grid
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="gap-1 backdrop-blur-md bg-card/5 border-border/10 text-foreground hover:bg-card/10 hover:border-border/20 transition-all duration-300"
                disabled={isExporting}
              >
                <Download className="h-4 w-4" />
                Export
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="backdrop-blur-xl bg-popover/80 border-border/10 shadow-2xl shadow-cyber-cyan/10">
              <DropdownMenuItem
                onClick={() => setShowExportHub(true)}
                className="text-foreground hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent/10"
              >
                <Sparkles className="h-4 w-4 mr-2 text-cyber-purple" />
                Export Hub
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/20" />
              <DropdownMenuItem
                onClick={() => handleExport("pdf")}
                className="text-foreground hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent/10"
              >
                <FileType className="h-4 w-4 mr-2 text-destructive" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("png")}
                className="text-foreground hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent/10"
              >
                <ImageIcon className="h-4 w-4 mr-2 text-cyber-cyan" />
                Export as PNG
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("jpg")}
                className="text-foreground hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent/10"
              >
                <ImageIcon className="h-4 w-4 mr-2 text-cyber-green" />
                Export as JPG
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleExport("html")}
                className="text-foreground hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent/10"
              >
                <Film className="h-4 w-4 mr-2 text-cyber-purple" />
                Export as HTML
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border/20" />
              <DropdownMenuItem
                onClick={handleExportJson}
                className="text-foreground hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent/10"
              >
                <FileJson className="h-4 w-4 mr-2 text-cyber-yellow" />
                Export as JSON
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleImportClick}
                className="text-foreground hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent/10"
              >
                <Upload className="h-4 w-4 mr-2 text-cyber-cyan" />
                Import JSON
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {user ? (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1 backdrop-blur-md bg-card/5 border-border/10 text-foreground hover:bg-card/10 hover:border-border/20 transition-all duration-300"
                  >
                    <Cloud className="h-4 w-4" />
                    Cloud
                    <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="backdrop-blur-xl bg-popover/80 border-border/10 shadow-2xl shadow-cyber-cyan/10">
                  <DropdownMenuItem
                    onClick={handleSavePresentation}
                    className="text-foreground hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent/10"
                  >
                    <Save className="h-4 w-4 mr-2 text-cyber-green" />
                    Save to Cloud
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setShowPresentationsManager(true)}
                    className="text-foreground hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent/10"
                  >
                    <UploadCloud className="h-4 w-4 mr-2 text-cyber-cyan" />
                    My Presentations
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-border/20" />
                  <DropdownMenuItem
                    onClick={() => setShowShareDialog(true)}
                    className="text-foreground hover:bg-accent/10 hover:text-accent-foreground focus:bg-accent/10"
                    disabled={!currentPresentationId}
                  >
                    <Share2 className="h-4 w-4 mr-2 text-cyber-purple" />
                    Share Presentation
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <UserMenu user={user} onSignOut={handleSignOut} />
            </>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAuthModal(true)}
              className="gap-1 backdrop-blur-md bg-card/5 border-border/10 text-foreground hover:bg-card/10 hover:border-border/20 transition-all duration-300"
            >
              <User className="h-4 w-4" />
              Sign In
            </Button>
          )}

          <Button
            onClick={() => setIsPresentationMode(true)}
            className="gap-1 bg-gradient-to-r from-cyber-pink via-cyber-purple to-cyber-cyan text-primary-foreground hover:opacity-90 shadow-lg shadow-cyber-pink/30 transition-all duration-300 hover:shadow-cyber-pink/50"
          >
            Present
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Slides */}
        <div className="w-48 backdrop-blur-xl bg-card/5 border-r border-border/10 flex flex-col overflow-hidden shadow-xl shadow-cyber-pink/5">
          <div className="p-3 border-b border-border/10 backdrop-blur-md bg-card/5">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">Slides</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={addNewSlide}
                className="h-7 w-7 text-cyber-cyan hover:text-cyber-cyan hover:bg-cyber-cyan/10 transition-all duration-300"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <SlidesThumbnails
            slides={slides}
            currentSlideIndex={currentSlideIndex}
            onSlideSelect={setCurrentSlideIndex}
            onSlideDelete={deleteSlide}
            onSlideDuplicate={duplicateSlide}
          />
        </div>

        {/* Canvas Area */}
        <div
          ref={canvasContainerRef}
          className="flex-1 p-4 flex items-center justify-center overflow-auto relative"
          style={{
            background:
              wallpaper.startsWith("linear") || wallpaper.startsWith("radial")
                ? wallpaper
                : `url(${wallpaper}) center/cover no-repeat`,
          }}
        >
          {/* Overlay for better contrast */}
          <div className="absolute inset-0 bg-background/30 backdrop-blur-sm pointer-events-none"></div>

          <div
            className="relative"
            style={{
              transform: `scale(${zoomLevel / 100})`,
              transformOrigin: "center center",
              transition: "transform 0.2s ease-out",
            }}
          >
            <SlideCanvas
              slide={slides[currentSlideIndex]}
              selectedElementId={selectedElementId}
              onSelectElement={setSelectedElementId}
              onUpdateElement={updateElement}
              showGrid={showGrid}
              isPreviewingAnimation={isPreviewingAnimation}
            />
          </div>

          {/* Canvas Navigation Controls - Frosted Glass Dock */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-4 py-2 backdrop-blur-xl bg-card/10 rounded-2xl border border-border/10 shadow-2xl shadow-cyber-cyan/10">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
              disabled={currentSlideIndex === 0}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-card/10 disabled:opacity-30 transition-all duration-300"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium text-foreground min-w-[80px] text-center">
              Slide {currentSlideIndex + 1} of {slides.length}
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
              disabled={currentSlideIndex === slides.length - 1}
              className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-card/10 disabled:opacity-30 transition-all duration-300"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <div className="w-px h-6 bg-border/20 mx-1"></div>
            <ZoomControls zoomLevel={zoomLevel} onZoomChange={handleZoomChange} />
          </div>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-72 backdrop-blur-xl bg-card/5 border-l border-border/10 overflow-y-auto shadow-xl shadow-cyber-pink/5">
          <Tabs defaultValue="elements" className="w-full">
            <TabsList className="w-full justify-start rounded-none border-b border-border/10 bg-card/5 p-1 backdrop-blur-md">
              <TabsTrigger
                value="elements"
                className="text-muted-foreground data-[state=active]:text-cyber-cyan data-[state=active]:bg-cyber-cyan/10 transition-all duration-300"
              >
                Elements
              </TabsTrigger>
              <TabsTrigger
                value="properties"
                className="text-muted-foreground data-[state=active]:text-cyber-cyan data-[state=active]:bg-cyber-cyan/10 transition-all duration-300"
              >
                Properties
              </TabsTrigger>
              <TabsTrigger
                value="animations"
                className="text-muted-foreground data-[state=active]:text-cyber-cyan data-[state=active]:bg-cyber-cyan/10 transition-all duration-300"
              >
                Animations
              </TabsTrigger>
            </TabsList>

            <TabsContent value="elements" className="p-4 space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Add Elements</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className="h-20 flex-col gap-1 backdrop-blur-md bg-card/5 border-border/10 text-foreground hover:bg-cyber-cyan/10 hover:border-cyber-cyan/30 hover:text-cyber-cyan transition-all duration-300"
                    onClick={addTextElement}
                  >
                    <Type className="h-5 w-5" />
                    <span className="text-xs">Text</span>
                  </Button>

                  <ShapeSelector onSelectShape={addShapeElement} />

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-1 backdrop-blur-md bg-card/5 border-border/10 text-foreground hover:bg-cyber-cyan/10 hover:border-cyber-cyan/30 hover:text-cyber-cyan transition-all duration-300"
                      >
                        <ImageIcon className="h-5 w-5" />
                        <span className="text-xs">Image</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="backdrop-blur-xl bg-popover/80 border-border/10">
                      <DropdownMenuItem
                        onClick={() => fileInputRef.current?.click()}
                        className="text-foreground hover:bg-accent/10"
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Image
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowImageUploader(true)}
                        className="text-foreground hover:bg-accent/10"
                      >
                        <UploadCloud className="h-4 w-4 mr-2" />
                        Advanced Upload
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setShowImageLibrary(true)}
                        className="text-foreground hover:bg-accent/10"
                      >
                        <LayoutGrid className="h-4 w-4 mr-2" />
                        Image Library
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="h-20 flex-col gap-1 backdrop-blur-md bg-card/5 border-border/10 text-foreground hover:bg-cyber-cyan/10 hover:border-cyber-cyan/30 hover:text-cyber-cyan transition-all duration-300"
                      >
                        <Video className="h-5 w-5" />
                        <span className="text-xs">Media</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="backdrop-blur-xl bg-popover/80 border-border/10">
                      <DropdownMenuItem
                        onClick={() => videoInputRef.current?.click()}
                        className="text-foreground hover:bg-accent/10"
                      >
                        <Video className="h-4 w-4 mr-2" />
                        Add Video
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => audioInputRef.current?.click()}
                        className="text-foreground hover:bg-accent/10"
                      >
                        <Film className="h-4 w-4 mr-2" />
                        Add Audio
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Slide Background</h3>
                <Button
                  variant="outline"
                  className="w-full justify-start backdrop-blur-md bg-card/5 border-border/10 text-foreground hover:bg-cyber-purple/10 hover:border-cyber-purple/30 hover:text-cyber-purple transition-all duration-300"
                  onClick={() => setShowBackgroundPanel(!showBackgroundPanel)}
                >
                  <Square className="h-4 w-4 mr-2" />
                  Edit Background
                </Button>
              </div>

              {showBackgroundPanel && (
                <div className="mt-4 p-3 backdrop-blur-md bg-card/5 rounded-lg border border-cyber-purple/20 shadow-lg shadow-cyber-purple/5">
                  <BackgroundEditor
                    background={slides[currentSlideIndex].background}
                    onUpdateBackground={updateBackground}
                  />
                </div>
              )}

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground">Typography</h3>
                <Button
                  variant="outline"
                  className="w-full justify-start backdrop-blur-md bg-card/5 border-border/10 text-foreground hover:bg-cyber-yellow/10 hover:border-cyber-yellow/30 hover:text-cyber-yellow transition-all duration-300"
                  onClick={() => fontInputRef.current?.click()}
                >
                  <FileType className="h-4 w-4 mr-2" />
                  Upload Custom Font
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="properties" className="p-4 space-y-4">
              {selectedElement ? (
                <>
                  {/* Element Type Badge */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-cyber-cyan uppercase tracking-wider">
                      {selectedElement.type} Element
                    </span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={duplicateElement}
                        className="h-7 w-7 text-muted-foreground hover:text-cyber-cyan hover:bg-cyber-cyan/10"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={deleteElement}
                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {selectedElement.type === "text" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Font Family</label>
                        <select
                          className="w-full h-9 px-3 rounded-md backdrop-blur-md bg-card/5 border border-border/10 text-foreground text-sm focus:border-cyber-cyan/30 focus:ring-1 focus:ring-cyber-cyan/30 transition-all"
                          value={selectedElement.fontFamily}
                          onChange={(e) => updateElement(selectedElement.id, { fontFamily: e.target.value })}
                        >
                          {allFonts.map((font) => (
                            <option key={font.value} value={font.value}>
                              {font.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Font Size</label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[selectedElement.fontSize]}
                            onValueChange={(value) => updateElement(selectedElement.id, { fontSize: value[0] })}
                            min={8}
                            max={120}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm text-foreground w-12 text-right">{selectedElement.fontSize}px</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Text Color</label>
                        <div className="flex gap-1 flex-wrap">
                          {COLOR_PRESETS.map((color) => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded-md border-2 transition-all duration-200 hover:scale-110 ${
                                selectedElement.color === color
                                  ? "border-cyber-cyan shadow-lg shadow-cyber-cyan/30"
                                  : "border-border/30"
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => updateElement(selectedElement.id, { color })}
                            />
                          ))}
                          <input
                            type="color"
                            value={selectedElement.color || "#ffffff"}
                            onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                            className="w-6 h-6 rounded-md cursor-pointer border border-border/30"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Style</label>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className={`h-8 w-8 backdrop-blur-md border-border/10 transition-all ${
                              selectedElement.fontWeight === "bold"
                                ? "bg-cyber-cyan/20 border-cyber-cyan/30 text-cyber-cyan"
                                : "bg-card/5 text-foreground hover:bg-card/10"
                            }`}
                            onClick={() =>
                              updateElement(selectedElement.id, {
                                fontWeight: selectedElement.fontWeight === "bold" ? "normal" : "bold",
                              })
                            }
                          >
                            <Bold className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className={`h-8 w-8 backdrop-blur-md border-border/10 transition-all ${
                              selectedElement.fontStyle === "italic"
                                ? "bg-cyber-cyan/20 border-cyber-cyan/30 text-cyber-cyan"
                                : "bg-card/5 text-foreground hover:bg-card/10"
                            }`}
                            onClick={() =>
                              updateElement(selectedElement.id, {
                                fontStyle: selectedElement.fontStyle === "italic" ? "normal" : "italic",
                              })
                            }
                          >
                            <Italic className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className={`h-8 w-8 backdrop-blur-md border-border/10 transition-all ${
                              selectedElement.textDecoration === "underline"
                                ? "bg-cyber-cyan/20 border-cyber-cyan/30 text-cyber-cyan"
                                : "bg-card/5 text-foreground hover:bg-card/10"
                            }`}
                            onClick={() =>
                              updateElement(selectedElement.id, {
                                textDecoration: selectedElement.textDecoration === "underline" ? "none" : "underline",
                              })
                            }
                          >
                            <Underline className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Alignment</label>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className={`h-8 w-8 backdrop-blur-md border-border/10 transition-all ${
                              selectedElement.textAlign === "left"
                                ? "bg-cyber-cyan/20 border-cyber-cyan/30 text-cyber-cyan"
                                : "bg-card/5 text-foreground hover:bg-card/10"
                            }`}
                            onClick={() => updateElement(selectedElement.id, { textAlign: "left" })}
                          >
                            <AlignLeft className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className={`h-8 w-8 backdrop-blur-md border-border/10 transition-all ${
                              selectedElement.textAlign === "center"
                                ? "bg-cyber-cyan/20 border-cyber-cyan/30 text-cyber-cyan"
                                : "bg-card/5 text-foreground hover:bg-card/10"
                            }`}
                            onClick={() => updateElement(selectedElement.id, { textAlign: "center" })}
                          >
                            <AlignCenter className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className={`h-8 w-8 backdrop-blur-md border-border/10 transition-all ${
                              selectedElement.textAlign === "right"
                                ? "bg-cyber-cyan/20 border-cyber-cyan/30 text-cyber-cyan"
                                : "bg-card/5 text-foreground hover:bg-card/10"
                            }`}
                            onClick={() => updateElement(selectedElement.id, { textAlign: "right" })}
                          >
                            <AlignRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Text Effects Button */}
                      <Button
                        variant="outline"
                        className="w-full justify-start backdrop-blur-md bg-card/5 border-border/10 text-foreground hover:bg-cyber-purple/10 hover:border-cyber-purple/30 hover:text-cyber-purple transition-all duration-300"
                        onClick={() => setShowTextEffectsPanel(!showTextEffectsPanel)}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Text Effects
                      </Button>

                      {showTextEffectsPanel && (
                        <div className="mt-2 p-3 backdrop-blur-md bg-card/5 rounded-lg border border-cyber-purple/20 shadow-lg shadow-cyber-purple/5">
                          <TextEffects element={selectedElement} onUpdateElement={updateElement} />
                        </div>
                      )}
                    </div>
                  )}

                  {selectedElement.type === "shape" && (
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Shape Color</label>
                        <div className="flex gap-1 flex-wrap">
                          {COLOR_PRESETS.map((color) => (
                            <button
                              key={color}
                              className={`w-6 h-6 rounded-md border-2 transition-all duration-200 hover:scale-110 ${
                                selectedElement.color === color
                                  ? "border-cyber-cyan shadow-lg shadow-cyber-cyan/30"
                                  : "border-border/30"
                              }`}
                              style={{ backgroundColor: color }}
                              onClick={() => updateElement(selectedElement.id, { color })}
                            />
                          ))}
                          <input
                            type="color"
                            value={selectedElement.color || "#0ea5e9"}
                            onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
                            className="w-6 h-6 rounded-md cursor-pointer border border-border/30"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-muted-foreground">Corner Radius</label>
                        <div className="flex items-center gap-2">
                          <Slider
                            value={[selectedElement.cornerRadius || 0]}
                            onValueChange={(value) => updateElement(selectedElement.id, { cornerRadius: value[0] })}
                            min={0}
                            max={50}
                            step={1}
                            className="flex-1"
                          />
                          <span className="text-sm text-foreground w-12 text-right">
                            {selectedElement.cornerRadius || 0}px
                          </span>
                        </div>
                      </div>

                      {/* Glassmorphism Controls */}
                      <div className="space-y-3 p-3 backdrop-blur-md bg-card/5 rounded-lg border border-cyber-cyan/20">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-medium text-muted-foreground">Glassmorphism</label>
                          <input
                            type="checkbox"
                            checked={selectedElement.glassmorphism?.enabled || false}
                            onChange={(e) =>
                              updateElement(selectedElement.id, {
                                glassmorphism: {
                                  ...selectedElement.glassmorphism,
                                  enabled: e.target.checked,
                                },
                              })
                            }
                            className="rounded border-border/30 bg-card/5"
                          />
                        </div>

                        {selectedElement.glassmorphism?.enabled && (
                          <>
                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">Blur</label>
                              <Slider
                                value={[selectedElement.glassmorphism?.blur || 10]}
                                onValueChange={(value) =>
                                  updateElement(selectedElement.id, {
                                    glassmorphism: {
                                      ...selectedElement.glassmorphism,
                                      blur: value[0],
                                    },
                                  })
                                }
                                min={0}
                                max={50}
                                step={1}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-xs text-muted-foreground">Opacity</label>
                              <Slider
                                value={[selectedElement.glassmorphism?.opacity || 20]}
                                onValueChange={(value) =>
                                  updateElement(selectedElement.id, {
                                    glassmorphism: {
                                      ...selectedElement.glassmorphism,
                                      opacity: value[0],
                                    },
                                  })
                                }
                                min={0}
                                max={100}
                                step={1}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedElement.type === "image" && (
                    <div className="space-y-4">
                      <Button
                        variant="outline"
                        className="w-full justify-start backdrop-blur-md bg-card/5 border-border/10 text-foreground hover:bg-cyber-cyan/10 hover:border-cyber-cyan/30 hover:text-cyber-cyan transition-all duration-300"
                        onClick={() => setShowImagePanel(!showImagePanel)}
                      >
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Image Filters
                      </Button>

                      {showImagePanel && (
                        <div className="mt-2 p-3 backdrop-blur-md bg-card/5 rounded-lg border border-cyber-cyan/20 shadow-lg shadow-cyber-cyan/5">
                          <ImageFilters element={selectedElement} onUpdateElement={updateElement} />
                        </div>
                      )}

                      <Button
                        variant="outline"
                        className="w-full justify-start backdrop-blur-md bg-card/5 border-border/10 text-foreground hover:bg-cyber-purple/10 hover:border-cyber-purple/30 hover:text-cyber-purple transition-all duration-300"
                        onClick={() => setShowImage3dEffectsPanel(!showImage3dEffectsPanel)}
                      >
                        <Cube className="h-4 w-4 mr-2" />
                        3D Effects
                      </Button>

                      {showImage3dEffectsPanel && (
                        <div className="mt-2 p-3 backdrop-blur-md bg-card/5 rounded-lg border border-cyber-purple/20 shadow-lg shadow-cyber-purple/5">
                          <Image3DEffects element={selectedElement} onUpdateElement={updateElement} />
                        </div>
                      )}

                      <Button
                        variant="outline"
                        className="w-full justify-start backdrop-blur-md bg-card/5 border-border/10 text-foreground hover:bg-cyber-pink/10 hover:border-cyber-pink/30 hover:text-cyber-pink transition-all duration-300"
                        onClick={() => setShowImageInteractionsPanel(!showImageInteractionsPanel)}
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Interactive Features
                      </Button>

                      {showImageInteractionsPanel && (
                        <div className="mt-2 p-3 backdrop-blur-md bg-card/5 rounded-lg border border-cyber-pink/20 shadow-lg shadow-cyber-pink/5">
                          <ImageInteractions element={selectedElement} onUpdateElement={updateElement} />
                        </div>
                      )}
                    </div>
                  )}

                  {(selectedElement.type === "video" || selectedElement.type === "audio") && (
                    <MediaControls element={selectedElement} onUpdateElement={updateElement} />
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <Square className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
                  <p className="text-sm text-muted-foreground">Select an element to edit its properties</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="animations" className="p-4 space-y-4">
              {selectedElement ? (
                <AnimationControls
                  animation={selectedElement.animation}
                  onUpdateAnimation={updateElementAnimation}
                  onPreview={previewElementAnimation}
                />
              ) : (
                <div className="text-center py-4">
                  <p className="text-sm text-muted-foreground mb-4">Select an element to edit animations</p>
                </div>
              )}

              <div className="border-t border-border/10 pt-4">
                <TransitionControls
                  transition={slides[currentSlideIndex].transition}
                  onUpdateTransition={updateSlideTransition}
                  onPreview={previewSlideTransition}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.json"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) {
            if (file.type === "application/json" || file.name.endsWith(".json")) {
              handleImportFile(e)
            } else {
              addImageElement(e)
            }
          }
        }}
      />
      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={addVideoElement} />
      <input ref={audioInputRef} type="file" accept="audio/*" className="hidden" onChange={addAudioElement} />
      <input
        ref={fontInputRef}
        type="file"
        accept=".ttf,.otf,.woff,.woff2"
        className="hidden"
        onChange={handleFontUpload}
      />

      {/* Dialogs */}
      <AlertDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
        <AlertDialogContent className="backdrop-blur-xl bg-popover/80 border-border/10">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Import Error</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">{importError}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-card/5 border-border/10 text-foreground hover:bg-card/10">
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <KeyboardShortcuts open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts} />

      <ImageLibrary open={showImageLibrary} onOpenChange={setShowImageLibrary} onSelectImage={addImageFromLibrary} />

      <ImageUploader
        open={showImageUploader}
        onOpenChange={setShowImageUploader}
        onImagesUploaded={handleImagesUploaded}
      />

      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} />

      <SavePresentationDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        title={presentationTitle}
        slides={slides}
        presentationId={currentPresentationId}
        onSaveSuccess={handleSaveSuccess}
      />

      <PresentationsManager
        open={showPresentationsManager}
        onOpenChange={setShowPresentationsManager}
        onLoadPresentation={handleLoadPresentation}
      />

      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        presentationId={currentPresentationId}
        presentationTitle={presentationTitle}
      />

      <ExportHub
        open={showExportHub}
        onOpenChange={setShowExportHub}
        slides={slides}
        presentationTitle={presentationTitle}
      />

      {/* Commented out TemplateLibrary */}
      {/* <TemplateLibrary
        open={showTemplateLibrary}
        onOpenChange={setShowTemplateLibrary}
        onSelectTemplate={handleSelectTemplate}
      /> */}
    </div>
  )
}

export default DesignEditor
