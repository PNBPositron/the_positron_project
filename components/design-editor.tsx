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
  ChevronDown,
  Palette,
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
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { TextEffects } from "./text-effects"
import { Image3DEffects } from "./image-3d-effects"
import { ImageLibrary } from "@/components/image-library"
import { TemplateLibrary } from "@/components/template-library"
import { ImageUploader } from "@/components/image-uploader"
import { AuthModal } from "@/components/auth-modal"
import { UserMenu } from "@/components/user-menu"
import { SavePresentationDialog } from "@/components/save-presentation-dialog"
import { supabase } from "@/lib/supabase"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { PresentationsManager } from "@/components/presentations-manager"
import { ShareDialog } from "@/components/share-dialog"
import { exportToHtml } from "@/utils/html-export"

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
  const [showTextEffectsPanel, setShowTextEffectsPanel] = useState(false)
  const [showImage3dEffectsPanel, setShowImage3dEffectsPanel] = useState(false)
  const [showImageLibrary, setShowImageLibrary] = useState(false)
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false)
  const [showImageUploader, setShowImageUploader] = useState(false)

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

  const handleSelectTemplate = (template: any) => {
    setPresentationTitle(template.title)
    setSlides(template.slides)
    setCurrentSlideIndex(0)
    setSelectedElementId(null)
    setCurrentPresentationId(null) // Reset presentation ID for template

    toast({
      title: "Template applied",
      description: `"${template.title}" template has been applied to your presentation.`,
      variant: "default",
    })
  }

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
    <div className="flex flex-col h-screen bg-black text-cyan-300">
      {/* Header */}
      <header className="border-b border-cyan-500/30 p-4 flex items-center justify-between bg-gradient-to-r from-black via-purple-900/20 to-black backdrop-blur-3xl backdrop-saturate-200 supports-[backdrop-filter]:bg-black/20 shadow-2xl shadow-cyan-500/20">
        <div className="flex items-center gap-3">
          <div className="h-8 w-px bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent mx-2"></div>
          <Input
            className="w-72 h-10 bg-black/60 border-cyan-500/30 text-cyan-300 focus-visible:ring-2 focus-visible:ring-cyan-400/50 focus-visible:border-cyan-400/50 backdrop-blur-xl rounded-xl shadow-inner shadow-cyan-500/10 placeholder:text-cyan-600/40 transition-all duration-300 hover:bg-black/80 hover:border-cyan-400/50 neon-text"
            placeholder="ENTER PRESENTATION TITLE..."
            value={presentationTitle}
            onChange={(e) => setPresentationTitle(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/40 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
            <Button
              variant="ghost"
              size="sm"
              className="text-cyan-300 hover:bg-magenta-500/30 hover:text-magenta-300 transition-all duration-300 h-8 px-3 rounded-lg"
              onClick={() => setIsPresentationMode(true)}
            >
              <Film className="h-4 w-4 mr-2 text-magenta-400" />
              PRESENT
            </Button>
          </div>

          <a href="https://github.com/PNBFor/the_positron_project" target="_blank" rel="noopener noreferrer">
            <Button
              variant="ghost"
              size="sm"
              className="text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-200 transition-all duration-300 h-9 px-4 rounded-xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10"
            >
              <svg
                className="h-4 w-4 mr-2 text-cyan-400"
                viewBox="0 0 24 24"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
              </svg>
              GITHUB
            </Button>
          </a>

          {/* Auth Section */}
          {user ? (
            <UserMenu
              user={user}
              onSignOut={handleSignOut}
              onOpenPresentations={() => setShowPresentationsManager(true)}
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="border-cyan-500/40 bg-black/40 hover:bg-cyan-500/20 text-cyan-300 backdrop-blur-xl shadow-lg shadow-cyan-500/10 h-9 px-4 rounded-xl transition-all duration-300 hover:shadow-cyan-500/30 hover:border-cyan-400/60 neon-text"
              onClick={() => setShowAuthModal(true)}
            >
              <User className="h-4 w-4 mr-2 text-cyan-400" />
              SIGN IN
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="border-cyan-500/40 bg-black/40 hover:bg-cyan-500/20 text-cyan-300 backdrop-blur-xl shadow-lg shadow-cyan-500/10 h-9 px-4 rounded-xl transition-all duration-300 hover:shadow-cyan-500/30 neon-text"
              >
                <Save className="h-4 w-4 mr-2" />
                SAVE
                <ChevronDown className="h-3 w-3 ml-2 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-black/80 border-cyan-500/40 text-cyan-300 backdrop-blur-3xl backdrop-saturate-200 supports-[backdrop-filter]:bg-black/80 shadow-2xl shadow-cyan-500/20 rounded-xl p-2 min-w-[200px]">
              {user && (
                <>
                  <DropdownMenuItem
                    className="hover:bg-cyan-500/20 rounded-lg px-3 py-2 transition-colors duration-200 text-cyan-300"
                    onClick={handleSavePresentation}
                  >
                    <Cloud className="h-4 w-4 mr-3 text-magenta-400" />
                    <span className="font-medium uppercase text-xs tracking-wider">Save to Cloud</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-cyan-500/30 my-2" />
                </>
              )}
              <DropdownMenuItem
                className="hover:bg-cyan-500/20 rounded-lg px-3 py-2 transition-colors duration-200 text-cyan-300"
                onClick={handleExportJson}
              >
                <FileJson className="h-4 w-4 mr-3" />
                <span className="font-medium uppercase text-xs tracking-wider">Export JSON</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="hover:bg-cyan-500/20 rounded-lg px-3 py-2 transition-colors duration-200 text-cyan-300"
                onClick={handleImportClick}
              >
                <Upload className="h-4 w-4 mr-3" />
                <span className="font-medium uppercase text-xs tracking-wider">Import JSON</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-cyan-500/30 my-2" />
              <DropdownMenuItem
                className="hover:bg-cyan-500/20 rounded-lg px-3 py-2 transition-colors duration-200 text-cyan-300"
                onClick={() => handleExport("html")}
              >
                <FileType className="h-4 w-4 mr-3" />
                <span className="font-medium uppercase text-xs tracking-wider">Export HTML</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            className="border-magenta-500/40 bg-black/40 hover:bg-magenta-500/20 text-magenta-300 backdrop-blur-xl shadow-lg shadow-magenta-500/10 h-9 px-4 rounded-xl transition-all duration-300 hover:shadow-magenta-500/30 neon-accent"
            onClick={() => setShowShareDialog(true)}
            disabled={!user || !currentPresentationId}
          >
            <Share2 className="h-4 w-4 mr-2" />
            SHARE
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Slides Sidebar - Cyberpunk Panel */}
        <div className="absolute left-6 top-28 w-72 rounded-3xl bg-black/40 backdrop-blur-3xl backdrop-saturate-200 supports-[backdrop-filter]:bg-black/20 p-6 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-9rem)] shadow-2xl shadow-cyan-500/20 border border-cyan-500/30 z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-magenta-400 rounded-full animate-pulse"></div>
              <h3 className="text-base font-semibold neon-text uppercase text-xs tracking-wider">Slides</h3>
              <span className="text-xs text-cyan-400/60 bg-black/60 px-2 py-1 rounded-full border border-cyan-500/30">
                {slides.length}
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={addNewSlide}
              className="text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-200 transition-all duration-300 h-8 w-8 rounded-xl shadow-lg hover:shadow-cyan-500/30 border border-cyan-500/30"
            >
              <Plus className="h-4 w-4 text-magenta-400" />
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-magenta-500/10 rounded-2xl"></div>
            <SlidesThumbnails
              slides={slides}
              currentSlideIndex={currentSlideIndex}
              onSelectSlide={setCurrentSlideIndex}
            />
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-magenta-500/40 bg-black/40 hover:bg-magenta-500/20 text-magenta-300 transition-all duration-300 rounded-xl"
              onClick={deleteSlide}
              disabled={slides.length <= 1}
            >
              <Trash2 className="h-3 w-3 mr-2" />
              DELETE
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-cyan-500/40 bg-black/40 hover:bg-cyan-500/20 text-cyan-300 transition-all duration-300 rounded-xl"
              onClick={duplicateSlide}
            >
              <Copy className="h-3 w-3 mr-2" />
              COPY
            </Button>
          </div>

          {/* Background Panel */}
          {showBackgroundPanel && (
            <div className="mt-4 border border-cyan-500/30 rounded-md p-3 bg-black/40 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-black/40 shadow-lg shadow-cyan-500/10">
              <h4 className="text-sm font-medium text-cyan-300 mb-3 uppercase tracking-wider">BACKGROUND</h4>
              <BackgroundEditor
                background={slides[currentSlideIndex].background}
                onUpdateBackground={updateBackground}
              />
            </div>
          )}

          {/* Animation Panel */}
          {showAnimationPanel && (
            <div className="mt-4 border border-cyan-500/30 rounded-md p-3 bg-black/40 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-black/40 shadow-lg shadow-cyan-500/10">
              <Tabs defaultValue={selectedElement ? "element" : "slide"}>
                <TabsList className="grid grid-cols-2 bg-black/60 backdrop-blur-md border border-cyan-500/20">
                  <TabsTrigger
                    value="element"
                    className="text-cyan-300 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-200"
                    disabled={!selectedElement}
                  >
                    ELEMENT
                  </TabsTrigger>
                  <TabsTrigger
                    value="slide"
                    className="text-cyan-300 data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-200"
                  >
                    SLIDE
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
                    <p className="text-sm text-cyan-600/60">SELECT AN ELEMENT TO CONFIGURE ANIMATION.</p>
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
            <div className="mt-4 border border-cyan-500/30 rounded-md p-3 bg-black/40 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-black/40 shadow-lg shadow-cyan-500/10">
              <h4 className="text-sm font-medium text-cyan-300 mb-3 uppercase tracking-wider">IMAGE FILTERS</h4>
              <ImageFilters element={selectedElement} onUpdateElement={updateElement} />
            </div>
          )}

          {/* Media Controls Panel */}
          {showMediaPanel && (selectedElement?.type === "video" || selectedElement?.type === "audio") && (
            <div className="mt-4 border border-cyan-500/30 rounded-md p-3 bg-black/40 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-black/40 shadow-lg shadow-cyan-500/10">
              <h4 className="text-sm font-medium text-cyan-300 mb-3 uppercase tracking-wider">MEDIA</h4>
              <MediaControls element={selectedElement} onUpdateElement={updateElement} />
            </div>
          )}

          {/* Text Effects Panel */}
          {showTextEffectsPanel && selectedElement?.type === "text" && (
            <div className="mt-4 border border-cyan-500/30 rounded-md p-3 bg-black/40 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-black/40 shadow-lg shadow-cyan-500/10">
              <TextEffects element={selectedElement} onUpdateElement={updateElement} />
            </div>
          )}

          {/* Image 3D Effects Panel */}
          {showImage3dEffectsPanel && selectedElement?.type === "image" && (
            <div className="mt-4 border border-cyan-500/30 rounded-md p-3 bg-black/40 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-black/40 shadow-lg shadow-cyan-500/10">
              <Image3DEffects element={selectedElement} onUpdateElement={updateElement} />
            </div>
          )}
        </div>

        {/* Canvas Area */}
        <div className="flex-1 bg-black flex flex-col">
          {/* Canvas Controls */}
          <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/30 via-magenta-500/30 to-cyan-500/30 rounded-3xl blur-xl opacity-60"></div>
              <div className="relative px-8 py-4 flex items-center gap-4 bg-black/40 backdrop-blur-3xl backdrop-saturate-200 supports-[backdrop-filter]:bg-black/40 border border-cyan-500/40 rounded-3xl shadow-2xl shadow-cyan-500/30">
                <div className="flex items-center gap-2 transition-all duration-300 ease-out">
                  <div className="w-px h-10 bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent mx-3"></div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                    disabled={currentSlideIndex === 0}
                    className="text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-200 transition-all duration-300 h-12 w-12 rounded-2xl hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/30 flex items-center justify-center disabled:opacity-40 disabled:hover:scale-100 group border border-cyan-500/30"
                    title="PREVIOUS SLIDE"
                  >
                    <ChevronLeft className="h-6 w-6 group-hover:text-cyan-200 transition-colors duration-200" />
                  </Button>

                  <div className="px-4 py-2 bg-black/60 rounded-2xl border border-cyan-500/30 transition-all duration-300 ease-out hover:scale-105 shadow-inner shadow-cyan-500/10">
                    <span className="text-sm font-bold neon-text">{currentSlideIndex + 1}</span>
                    <span className="text-xs text-cyan-400/60 mx-1">/</span>
                    <span className="text-sm font-medium text-cyan-400/70">{slides.length}</span>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                    disabled={currentSlideIndex === slides.length - 1}
                    className="text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-200 transition-all duration-300 h-12 w-12 rounded-2xl hover:scale-110 hover:shadow-lg hover:shadow-cyan-500/30 flex items-center justify-center disabled:opacity-40 disabled:hover:scale-100 group border border-cyan-500/30"
                    title="NEXT SLIDE"
                  >
                    <ChevronRight className="h-6 w-6 group-hover:text-cyan-200 transition-colors duration-200" />
                  </Button>

                  <div className="w-px h-10 bg-gradient-to-b from-transparent via-cyan-500/40 to-transparent mx-3"></div>

                  <div className="transition-all duration-300 ease-out hover:scale-105">
                    <ZoomControls zoomLevel={zoomLevel} onZoomChange={handleZoomChange} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Canvas */}
          <div
            ref={canvasContainerRef}
            className="flex-1 overflow-auto flex items-center justify-center p-8 slide-canvas rounded-3xl font-mono"
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/50 to-magenta-500/50 rounded-2xl blur-xl opacity-40 group-hover:opacity-70 transition duration-1000 animate-pulse"></div>
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
        <div className="w-80 absolute right-6 top-28 rounded-3xl bg-black/40 backdrop-blur-3xl backdrop-saturate-200 supports-[backdrop-filter]:bg-black/20 p-6 flex flex-col gap-5 overflow-y-auto max-h-[calc(100vh-9rem)] shadow-2xl shadow-cyan-500/20 border border-cyan-500/30 z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-2 h-2 bg-magenta-400 rounded-full animate-pulse"></div>
            <h3 className="text-base font-semibold neon-text uppercase text-xs tracking-wider">Design Tools</h3>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={addTextElement}
              className="text-cyan-300 hover:bg-cyan-500/20 hover:text-cyan-200 transition-all duration-300 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 group border border-cyan-500/30"
            >
              <Type className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-xs font-medium uppercase">Text</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-300 hover:bg-magenta-500/20 hover:text-magenta-200 transition-all duration-300 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 group border border-cyan-500/30"
                >
                  <Square className="h-5 w-5 text-magenta-400 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs font-medium uppercase">Shapes</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/80 border-cyan-500/40 text-cyan-300 backdrop-blur-3xl backdrop-saturate-200 w-[400px] rounded-2xl p-4 shadow-2xl shadow-cyan-500/20">
                <ShapeSelector onSelectShape={addShapeElement} />
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-cyan-300 hover:bg-green-500/20 hover:text-green-200 transition-all duration-300 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 group border border-cyan-500/30"
                >
                  <ImageIcon className="h-5 w-5 text-green-400 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs font-medium uppercase">Image</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/80 border-cyan-500/40 text-cyan-300 backdrop-blur-3xl backdrop-saturate-200 rounded-2xl p-2 shadow-2xl shadow-cyan-500/20">
                <DropdownMenuItem
                  onClick={() => setShowImageLibrary(true)}
                  className="hover:bg-cyan-500/20 focus:bg-cyan-500/20 cursor-pointer rounded-xl px-4 py-3 transition-colors duration-200"
                  role="button"
                  onKeyDown={(e) => e.key === "Enter" && setShowImageLibrary(true)}
                >
                  <ImageIcon className="h-4 w-4 mr-3 text-green-400" />
                  <span className="font-medium uppercase text-xs">Browse</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setShowImageUploader(true)}
                  className="hover:bg-cyan-500/20 rounded-xl px-4 py-3 transition-colors duration-200"
                >
                  <UploadCloud className="h-4 w-4 mr-3 text-cyan-400" />
                  <span className="font-medium uppercase text-xs">Advanced</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                  asChild
                  className="hover:bg-cyan-500/20 rounded-xl px-4 py-3 transition-colors duration-200"
                >
                  <label className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-3" />
                    <span className="font-medium uppercase text-xs">Upload</span>
                    <input type="file" accept="image/*" className="hidden" onChange={addImageElement} />
                  </label>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <label>
              <Button
                variant="ghost"
                size="sm"
                className="text-cyan-300 hover:bg-red-500/20 hover:text-red-300 transition-all duration-300 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 group cursor-pointer border border-cyan-500/30"
                asChild
              >
                <span>
                  <Video className="h-5 w-5 text-red-400 group-hover:scale-110 transition-transform duration-200" />
                  <span className="text-xs font-medium uppercase">Video</span>
                </span>
              </Button>
              <input type="file" accept="video/*" className="hidden" onChange={addVideoElement} ref={videoInputRef} />
            </label>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent my-2"></div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="ghost"
              size="sm"
              className={`text-cyan-300 hover:bg-cyan-500/20 transition-all duration-300 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 group border ${showBackgroundPanel ? "bg-cyan-500/20 text-cyan-200 border-cyan-400" : "border-cyan-500/30"}`}
              onClick={() => {
                setShowBackgroundPanel(!showBackgroundPanel)
                setShowImagePanel(false)
                setShowAnimationPanel(false)
                setShowMediaPanel(false)
                setShowTextEffectsPanel(false)
                setShowImage3dEffectsPanel(false)
              }}
            >
              <LayoutGrid className="h-5 w-5 text-cyan-400 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-xs font-medium uppercase">Background</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              className={`text-cyan-300 hover:bg-magenta-500/20 transition-all duration-300 h-12 rounded-2xl flex flex-col items-center justify-center gap-1 group border ${showAnimationPanel ? "bg-magenta-500/20 text-magenta-200 border-magenta-400" : "border-cyan-500/30"}`}
              onClick={() => {
                setShowAnimationPanel(!showAnimationPanel)
                setShowBackgroundPanel(false)
                setShowImagePanel(false)
                setShowMediaPanel(false)
                setShowTextEffectsPanel(false)
                setShowImage3dEffectsPanel(false)
              }}
            >
              <Sparkles className="h-5 w-5 text-magenta-400 group-hover:scale-110 transition-transform duration-200" />
              <span className="text-xs font-medium uppercase">Animations</span>
            </Button>
          </div>

          {selectedElement && (
            <>
              <div className="h-px bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent my-4"></div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 bg-magenta-400 rounded-full animate-pulse"></div>
                <h3 className="text-base font-semibold neon-text uppercase text-xs tracking-wider">Properties</h3>
              </div>

              {selectedElement.type === "text" && (
                <div className="space-y-4">
                  <div className="p-4 bg-black/40 rounded-2xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                    <h4 className="text-sm font-medium text-cyan-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                      <Type className="h-4 w-4 text-cyan-400" />
                      TEXT
                    </h4>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() =>
                          updateElement(selectedElementId!, {
                            fontWeight: selectedElement.fontWeight === "bold" ? "normal" : "bold",
                          })
                        }
                        className={`text-cyan-300 hover:bg-cyan-500/20 transition-all duration-300 h-10 rounded-xl border ${selectedElement.fontWeight === "bold" ? "bg-cyan-500/20 text-cyan-200 border-cyan-400" : "border-cyan-500/30"}`}
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
                        className={`text-cyan-300 hover:bg-cyan-500/20 transition-all duration-300 h-10 rounded-xl border ${selectedElement.fontStyle === "italic" ? "bg-cyan-500/20 text-cyan-200 border-cyan-400" : "border-cyan-500/30"}`}
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
                        className={`text-cyan-300 hover:bg-cyan-500/20 transition-all duration-300 h-10 rounded-xl border ${selectedElement.textDecoration === "underline" ? "bg-cyan-500/20 text-cyan-200 border-cyan-400" : "border-cyan-500/30"}`}
                      >
                        <Underline className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateElement(selectedElementId!, { textAlign: "left" })}
                        className={`text-cyan-300 hover:bg-cyan-500/20 transition-all duration-300 h-10 rounded-xl border ${selectedElement.textAlign === "left" ? "bg-cyan-500/20 text-cyan-200 border-cyan-400" : "border-cyan-500/30"}`}
                      >
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateElement(selectedElementId!, { textAlign: "center" })}
                        className={`text-cyan-300 hover:bg-cyan-500/20 transition-all duration-300 h-10 rounded-xl border ${selectedElement.textAlign === "center" ? "bg-cyan-500/20 text-cyan-200 border-cyan-400" : "border-cyan-500/30"}`}
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => updateElement(selectedElementId!, { textAlign: "right" })}
                        className={`text-cyan-300 hover:bg-cyan-500/20 transition-all duration-300 h-10 rounded-xl border ${selectedElement.textAlign === "right" ? "bg-cyan-500/20 text-cyan-200 border-cyan-400" : "border-cyan-500/30"}`}
                      >
                        <AlignRight className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="space-y-3">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-cyan-300 hover:bg-cyan-500/20 transition-all duration-300 w-full justify-between h-10 rounded-xl border border-cyan-500/30"
                          >
                            <span className="flex items-center">
                              <FileType className="h-4 w-4 mr-3 text-cyan-400" />
                              <span className="font-medium uppercase text-xs">Font</span>
                            </span>
                            <ChevronDown className="h-4 w-4 opacity-60" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="bg-black/80 border-cyan-500/40 text-cyan-300 backdrop-blur-3xl backdrop-saturate-200 w-64 rounded-2xl p-2 shadow-2xl shadow-cyan-500/20">
                          {allFonts.map((font) => (
                            <DropdownMenuItem
                              key={font.value}
                              onClick={() => updateElement(selectedElementId!, { fontFamily: font.value })}
                              className="hover:bg-cyan-500/20 rounded-xl px-4 py-3 transition-colors duration-200"
                            >
                              <span style={{ fontFamily: font.value }} className="font-medium text-xs uppercase">
                                {font.name}
                              </span>
                            </DropdownMenuItem>
                          ))}
                          <DropdownMenuSeparator className="bg-cyan-500/30 my-2" />
                          <DropdownMenuItem
                            className="hover:bg-cyan-500/20 rounded-xl px-4 py-3 transition-colors duration-200"
                            onClick={() => fontInputRef.current?.click()}
                          >
                            <FileType className="h-4 w-4 mr-3 text-cyan-400" />
                            <span className="font-medium uppercase text-xs">Custom</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-cyan-400/70 uppercase">Size</span>
                          <span className="text-sm font-bold neon-text bg-black/60 px-2 py-1 rounded-lg border border-cyan-500/30">
                            {selectedElement.fontSize}px
                          </span>
                        </div>
                        <Slider
                          className="[&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-cyan-400 [&>span:first-child]:to-magenta-400 [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-cyan-400 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-500/30 [&>span:first-child_span]:bg-gradient-to-r [&>span:first-child_span]:from-cyan-400 [&>span:first-child_span]:to-magenta-400"
                          min={12}
                          max={72}
                          step={1}
                          value={[selectedElement.fontSize]}
                          onValueChange={([value]) => updateElement(selectedElementId!, { fontSize: value })}
                        />
                      </div>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-cyan-300 hover:bg-magenta-500/20 transition-all duration-300 w-full justify-start h-12 rounded-2xl border ${showTextEffectsPanel ? "bg-magenta-500/20 text-magenta-200 border-magenta-400" : "border-cyan-500/30"}`}
                    onClick={() => {
                      setShowTextEffectsPanel(!showTextEffectsPanel)
                      setShowBackgroundPanel(false)
                      setShowImagePanel(false)
                      setShowAnimationPanel(false)
                      setShowMediaPanel(false)
                      setShowImage3dEffectsPanel(false)
                    }}
                  >
                    <Cube className="h-5 w-5 mr-3 text-magenta-400" />
                    <span className="font-medium uppercase text-xs">3D Effects</span>
                  </Button>
                </div>
              )}

              {selectedElement.type === "shape" && (
                <div className="space-y-4">
                  <div className="p-4 bg-black/40 rounded-2xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                    <h4 className="text-sm font-medium text-cyan-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                      <Palette className="h-4 w-4 text-magenta-400" />
                      SHAPE
                    </h4>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-cyan-300 hover:bg-cyan-500/20 transition-all duration-300 w-full justify-between h-10 rounded-xl mb-4 border border-cyan-500/30"
                        >
                          <span className="flex items-center">
                            <div
                              className="w-4 h-4 rounded-full mr-3 border border-cyan-400"
                              style={{ backgroundColor: selectedElement.color }}
                            ></div>
                            <span className="font-medium uppercase text-xs">Color</span>
                          </span>
                          <ChevronDown className="h-4 w-4 opacity-60" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-black/80 border-cyan-500/40 text-cyan-300 backdrop-blur-3xl backdrop-saturate-200 rounded-2xl p-4 shadow-2xl shadow-cyan-500/20">
                        <div className="grid grid-cols-3 gap-3">
                          {COLOR_PRESETS.map((color) => (
                            <div
                              key={color}
                              className="w-10 h-10 rounded-2xl cursor-pointer border-2 border-cyan-500/40 hover:border-cyan-300 hover:scale-110 transition-all duration-200 shadow-lg shadow-cyan-500/20"
                              style={{ backgroundColor: color }}
                              onClick={() => updateElement(selectedElementId!, { color })}
                            />
                          ))}
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {(selectedElement.shape === "square" ||
                      selectedElement.shape === "rounded-rect" ||
                      selectedElement.shape === "triangle" ||
                      selectedElement.shape === "pentagon" ||
                      selectedElement.shape === "hexagon" ||
                      selectedElement.shape === "diamond") && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-cyan-400/70 uppercase">RADIUS</span>
                          <span className="text-sm font-bold neon-text bg-black/60 px-2 py-1 rounded-lg border border-cyan-500/30">
                            {selectedElement.cornerRadius || 0}px
                          </span>
                        </div>
                        <Slider
                          className="[&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-magenta-400 [&>span:first-child]:to-pink-500 [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-magenta-400 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-magenta-500/30 [&>span:first-child_span]:bg-gradient-to-r [&>span:first-child_span]:from-magenta-400 [&>span:first-child_span]:to-pink-500"
                          min={0}
                          max={Math.min(selectedElement.width, selectedElement.height) / 2}
                          step={1}
                          value={[selectedElement.cornerRadius || 0]}
                          onValueChange={([value]) => updateElement(selectedElementId!, { cornerRadius: value })}
                        />
                      </div>
                    )}
                  </div>

                  <div className="p-4 bg-black/40 rounded-2xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-cyan-400" />
                        <Label className="text-sm font-medium text-cyan-300 uppercase">Glass</Label>
                      </div>
                      <Switch
                        checked={selectedElement.glassmorphism?.enabled || false}
                        onCheckedChange={(enabled) =>
                          updateElement(selectedElementId!, {
                            glassmorphism: {
                              ...selectedElement.glassmorphism,
                              enabled,
                            },
                          })
                        }
                        className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-cyan-400 data-[state=checked]:to-magenta-400"
                      />
                    </div>

                    {selectedElement.glassmorphism?.enabled && (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-medium text-cyan-400/70 uppercase">Blur</Label>
                            <span className="text-xs font-bold neon-text bg-black/60 px-2 py-1 rounded-lg border border-cyan-500/30">
                              {selectedElement.glassmorphism?.blur || 10}px
                            </span>
                          </div>
                          <Slider
                            min={0}
                            max={30}
                            step={1}
                            value={[selectedElement.glassmorphism?.blur || 10]}
                            onValueChange={([blur]) =>
                              updateElement(selectedElementId!, {
                                glassmorphism: {
                                  ...selectedElement.glassmorphism,
                                  blur,
                                },
                              })
                            }
                            className="[&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-cyan-400 [&>span:first-child]:to-magenta-400 [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-cyan-400 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-500/30 [&>span:first-child_span]:bg-gradient-to-r [&>span:first-child_span]:from-cyan-400 [&>span:first-child_span]:to-magenta-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-medium text-cyan-400/70 uppercase">Opacity</Label>
                            <span className="text-xs font-bold neon-text bg-black/60 px-2 py-1 rounded-lg border border-cyan-500/30">
                              {selectedElement.glassmorphism?.opacity || 20}%
                            </span>
                          </div>
                          <Slider
                            min={5}
                            max={50}
                            step={1}
                            value={[selectedElement.glassmorphism?.opacity || 20]}
                            onValueChange={([opacity]) =>
                              updateElement(selectedElementId!, {
                                glassmorphism: {
                                  ...selectedElement.glassmorphism,
                                  opacity,
                                },
                              })
                            }
                            className="[&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-cyan-400 [&>span:first-child]:to-magenta-400 [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-cyan-400 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-500/30 [&>span:first-child_span]:bg-gradient-to-r [&>span:first-child_span]:from-cyan-400 [&>span:first-child_span]:to-magenta-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-medium text-cyan-400/70 uppercase">Border</Label>
                            <span className="text-xs font-bold neon-text bg-black/60 px-2 py-1 rounded-lg border border-cyan-500/30">
                              {selectedElement.glassmorphism?.borderOpacity || 30}%
                            </span>
                          </div>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            value={[selectedElement.glassmorphism?.borderOpacity || 30]}
                            onValueChange={([borderOpacity]) =>
                              updateElement(selectedElementId!, {
                                glassmorphism: {
                                  ...selectedElement.glassmorphism,
                                  borderOpacity,
                                },
                              })
                            }
                            className="[&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-cyan-400 [&>span:first-child]:to-magenta-400 [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-cyan-400 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-500/30 [&>span:first-child_span]:bg-gradient-to-r [&>span:first-child_span]:from-cyan-400 [&>span:first-child_span]:to-magenta-400"
                          />
                        </div>

                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Label className="text-xs font-medium text-cyan-400/70 uppercase">Saturation</Label>
                            <span className="text-xs font-bold neon-text bg-black/60 px-2 py-1 rounded-lg border border-cyan-500/30">
                              {selectedElement.glassmorphism?.saturation || 180}%
                            </span>
                          </div>
                          <Slider
                            min={100}
                            max={300}
                            step={10}
                            value={[selectedElement.glassmorphism?.saturation || 180]}
                            onValueChange={([saturation]) =>
                              updateElement(selectedElementId!, {
                                glassmorphism: {
                                  ...selectedElement.glassmorphism,
                                  saturation,
                                },
                              })
                            }
                            className="[&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-cyan-400 [&>span:first-child]:to-magenta-400 [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-cyan-400 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-cyan-500/30 [&>span:first-child_span]:bg-gradient-to-r [&>span:first-child_span]:from-cyan-400 [&>span:first-child_span]:to-magenta-400"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {selectedElement.type === "image" && (
                <div className="space-y-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-cyan-300 hover:bg-green-500/20 transition-all duration-300 w-full justify-start h-12 rounded-2xl border ${showImagePanel ? "bg-green-500/20 text-green-200 border-green-400" : "border-cyan-500/30"}`}
                    onClick={() => {
                      setShowImagePanel(!showImagePanel)
                      setShowBackgroundPanel(false)
                      setShowAnimationPanel(false)
                      setShowMediaPanel(false)
                      setShowTextEffectsPanel(false)
                      setShowImage3dEffectsPanel(false)
                    }}
                  >
                    <ImageIcon className="h-5 w-5 mr-3 text-green-400" />
                    <span className="font-medium uppercase text-xs">Filters</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className={`text-cyan-300 hover:bg-cyan-500/20 transition-all duration-300 w-full justify-start h-12 rounded-2xl border ${showImage3dEffectsPanel ? "bg-cyan-500/20 text-cyan-200 border-cyan-400" : "border-cyan-500/30"}`}
                    onClick={() => {
                      setShowImage3dEffectsPanel(!showImage3dEffectsPanel)
                      setShowBackgroundPanel(false)
                      setShowImagePanel(false)
                      setShowAnimationPanel(false)
                      setShowMediaPanel(false)
                      setShowTextEffectsPanel(false)
                    }}
                  >
                    <Cube className="h-5 w-5 mr-3 text-cyan-400" />
                    <span className="font-medium uppercase text-xs">3D</span>
                  </Button>

                  <div className="p-4 bg-black/40 rounded-2xl border border-cyan-500/30 shadow-lg shadow-cyan-500/10">
                    <h4 className="text-sm font-medium text-cyan-300 mb-3 flex items-center gap-2 uppercase tracking-wider">
                      <ImageIcon className="h-4 w-4 text-green-400" />
                      IMAGE
                    </h4>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-cyan-400/70 uppercase">RADIUS</span>
                        <span className="text-sm font-bold neon-text bg-black/60 px-2 py-1 rounded-lg border border-cyan-500/30">
                          {selectedElement.effects?.borderRadius || 0}%
                        </span>
                      </div>
                      <Slider
                        className="[&>span:first-child]:bg-gradient-to-r [&>span:first-child]:from-green-400 [&>span:first-child]:to-cyan-400 [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-green-400 [&_[role=slider]]:shadow-lg [&_[role=slider]]:shadow-green-500/30 [&>span:first-child_span]:bg-gradient-to-r [&>span:first-child_span]:from-green-400 [&>span:first-child_span]:to-cyan-400"
                        min={0}
                        max={50}
                        step={1}
                        value={[selectedElement.effects?.borderRadius || 0]}
                        onValueChange={([value]) =>
                          updateElement(selectedElementId!, {
                            effects: {
                              ...selectedElement.effects,
                              borderRadius: value,
                            },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 mt-6">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={duplicateElement}
                  className="text-cyan-300 hover:bg-cyan-500/20 transition-all duration-300 w-full justify-start h-12 rounded-2xl border border-cyan-500/30"
                >
                  <Copy className="h-5 w-5 mr-3 text-cyan-400" />
                  <span className="font-medium uppercase text-xs">DUPLICATE</span>
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={deleteElement}
                  className="text-cyan-300 hover:bg-red-500/20 transition-all duration-300 w-full justify-start h-12 rounded-2xl border border-red-500/30"
                >
                  <Trash2 className="h-5 w-5 mr-3 text-red-400" />
                  <span className="font-medium uppercase text-xs">DELETE</span>
                </Button>
              </div>
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
        <AlertDialogContent className="bg-black/40 border-cyan-500/30 text-cyan-300 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-black/40 shadow-xl shadow-cyan-500/10 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Import Error</AlertDialogTitle>
            <AlertDialogDescription className="text-cyan-400">
              {importError || "There was an error importing your presentation."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border-cyan-500/30">
              Close
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Keyboard shortcuts dialog */}
      <KeyboardShortcuts open={showKeyboardShortcuts} onOpenChange={setShowKeyboardShortcuts} />

      {/* Auth Modal */}
      <AuthModal open={showAuthModal} onOpenChange={setShowAuthModal} onAuthSuccess={() => setShowAuthModal(false)} />

      {/* Save Presentation Dialog */}
      <SavePresentationDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        title={presentationTitle}
        slides={slides}
        presentationId={currentPresentationId}
        onSaveSuccess={handleSaveSuccess}
      />

      {/* Image Library Dialog */}
      <ImageLibrary open={showImageLibrary} onOpenChange={setShowImageLibrary} onSelectImage={addImageFromLibrary} />

      {/* Template Library Dialog */}
      <TemplateLibrary
        open={showTemplateLibrary}
        onOpenChange={setShowTemplateLibrary}
        onSelectTemplate={handleSelectTemplate}
      />

      {/* Enhanced Image Uploader Dialog */}
      <ImageUploader
        open={showImageUploader}
        onOpenChange={setShowImageUploader}
        onImagesUploaded={handleImagesUploaded}
        maxFileSize={10}
        maxFiles={10}
        enableCompression={true}
      />

      {/* Presentations Manager */}
      <PresentationsManager
        open={showPresentationsManager}
        onOpenChange={setShowPresentationsManager}
        onLoadPresentation={handleLoadPresentation}
      />
      {/* Share Dialog */}
      <ShareDialog
        open={showShareDialog}
        onOpenChange={setShowShareDialog}
        presentationId={currentPresentationId}
        presentationTitle={presentationTitle}
      />
    </div>
  )
}
