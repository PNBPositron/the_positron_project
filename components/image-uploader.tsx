"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  Upload,
  X,
  ImageIcon,
  AlertCircle,
  CheckCircle,
  Loader2,
  FileImage,
  Trash2,
  Download,
  Settings,
  Sparkles,
  Zap,
  Gauge,
  Presentation,
  Globe,
  ImageIcon as ImageLucide,
  Smartphone,
  Maximize2,
  Minimize2,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ImageFile {
  id: string
  file: File
  preview: string
  status: "pending" | "uploading" | "compressing" | "completed" | "error"
  progress: number
  error?: string
  compressed?: {
    blob: Blob
    originalSize: number
    compressedSize: number
    compressionRatio: number
  }
}

interface CompressionPreset {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  quality: number
  maxWidth: number
  maxHeight: number
  format: "original" | "jpeg" | "png" | "webp"
  preserveTransparency: boolean
}

interface ImageUploaderProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onImagesUploaded: (images: Array<{ src: string; file: File }>) => void
  maxFileSize?: number // in MB
  maxFiles?: number
  allowedTypes?: string[]
  enableCompression?: boolean
}

const DEFAULT_MAX_FILE_SIZE = 10 // 10MB
const DEFAULT_MAX_FILES = 10
const DEFAULT_ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp", "image/svg+xml"]

// Compression presets
const COMPRESSION_PRESETS: CompressionPreset[] = [
  {
    id: "high-quality",
    name: "High Quality",
    description: "Minimal compression, preserves details (large file size)",
    icon: <Sparkles className="h-4 w-4" />,
    quality: 0.9,
    maxWidth: 3840,
    maxHeight: 2160,
    format: "original",
    preserveTransparency: true,
  },
  {
    id: "balanced",
    name: "Balanced",
    description: "Good quality with reasonable file size",
    icon: <Gauge className="h-4 w-4" />,
    quality: 0.75,
    maxWidth: 1920,
    maxHeight: 1080,
    format: "original",
    preserveTransparency: true,
  },
  {
    id: "presentation",
    name: "Presentation",
    description: "Optimized for slide decks and presentations",
    icon: <Presentation className="h-4 w-4" />,
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    format: "original",
    preserveTransparency: true,
  },
  {
    id: "web",
    name: "Web Optimized",
    description: "Fast loading for websites and online sharing",
    icon: <Globe className="h-4 w-4" />,
    quality: 0.7,
    maxWidth: 1200,
    maxHeight: 900,
    format: "webp",
    preserveTransparency: true,
  },
  {
    id: "small",
    name: "Small Size",
    description: "Maximum compression for email and messaging",
    icon: <Zap className="h-4 w-4" />,
    quality: 0.5,
    maxWidth: 800,
    maxHeight: 600,
    format: "jpeg",
    preserveTransparency: false,
  },
  {
    id: "mobile",
    name: "Mobile",
    description: "Optimized for mobile devices and apps",
    icon: <Smartphone className="h-4 w-4" />,
    quality: 0.65,
    maxWidth: 1080,
    maxHeight: 1920,
    format: "webp",
    preserveTransparency: true,
  },
  {
    id: "thumbnail",
    name: "Thumbnail",
    description: "Small previews and thumbnails",
    icon: <ImageLucide className="h-4 w-4" />,
    quality: 0.6,
    maxWidth: 400,
    maxHeight: 400,
    format: "jpeg",
    preserveTransparency: false,
  },
  {
    id: "custom",
    name: "Custom",
    description: "Your custom compression settings",
    icon: <Settings className="h-4 w-4" />,
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    format: "original",
    preserveTransparency: true,
  },
]

export function ImageUploader({
  open,
  onOpenChange,
  onImagesUploaded,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  maxFiles = DEFAULT_MAX_FILES,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  enableCompression = true,
}: ImageUploaderProps) {
  const [images, setImages] = useState<ImageFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [compressionQuality, setCompressionQuality] = useState(0.8)
  const [autoCompress, setAutoCompress] = useState(true)
  const [showSettings, setShowSettings] = useState(false)
  const [selectedPreset, setSelectedPreset] = useState<string>("balanced")
  const [isMinimalistView, setIsMinimalistView] = useState(false)
  const [customSettings, setCustomSettings] = useState({
    quality: 0.8,
    maxWidth: 1920,
    maxHeight: 1080,
    format: "original" as "original" | "jpeg" | "png" | "webp",
    preserveTransparency: true,
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get the current preset settings
  const getCurrentPresetSettings = () => {
    const preset = COMPRESSION_PRESETS.find((p) => p.id === selectedPreset) || COMPRESSION_PRESETS[1] // Default to balanced

    if (preset.id === "custom") {
      return customSettings
    }

    return {
      quality: preset.quality,
      maxWidth: preset.maxWidth,
      maxHeight: preset.maxHeight,
      format: preset.format,
      preserveTransparency: preset.preserveTransparency,
    }
  }

  const validateFile = (file: File): string | null => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return `File type ${file.type} is not supported. Please use: ${allowedTypes.join(", ")}`
    }

    // Check file size
    const fileSizeMB = file.size / (1024 * 1024)
    if (fileSizeMB > maxFileSize) {
      return `File size (${fileSizeMB.toFixed(2)}MB) exceeds the maximum limit of ${maxFileSize}MB`
    }

    return null
  }

  const compressImage = async (file: File, presetSettings: typeof customSettings): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.crossOrigin = "anonymous"
      img.onload = () => {
        // Calculate new dimensions based on preset max dimensions
        const { maxWidth, maxHeight } = presetSettings
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width = Math.floor(width * ratio)
          height = Math.floor(height * ratio)
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        if (ctx) {
          // If background is needed (for JPEG conversion of transparent PNGs)
          if (file.type === "image/png" && presetSettings.format === "jpeg" && !presetSettings.preserveTransparency) {
            ctx.fillStyle = "#FFFFFF"
            ctx.fillRect(0, 0, width, height)
          }

          ctx.drawImage(img, 0, 0, width, height)
        }

        // Determine output format
        let outputFormat = file.type
        if (presetSettings.format !== "original") {
          outputFormat = `image/${presetSettings.format}`
        }

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to compress image"))
            }
          },
          outputFormat,
          presetSettings.quality,
        )
      }

      img.onerror = () => reject(new Error("Failed to load image for compression"))
      img.src = URL.createObjectURL(file)
    })
  }

  const processFile = async (file: File): Promise<void> => {
    const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    // Validate file
    const validationError = validateFile(file)
    if (validationError) {
      setImages((prev) => [
        ...prev,
        {
          id: imageId,
          file,
          preview: "",
          status: "error",
          progress: 0,
          error: validationError,
        },
      ])
      return
    }

    // Create preview
    const preview = URL.createObjectURL(file)

    // Add to images list
    const newImage: ImageFile = {
      id: imageId,
      file,
      preview,
      status: "pending",
      progress: 0,
    }

    setImages((prev) => [...prev, newImage])

    try {
      // Update status to uploading
      setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, status: "uploading", progress: 10 } : img)))

      // Simulate upload progress
      for (let progress = 20; progress <= 50; progress += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setImages((prev) => prev.map((img) => (img.id === imageId ? { ...img, progress } : img)))
      }

      // Compress if enabled
      if (
        enableCompression &&
        autoCompress &&
        (file.type === "image/jpeg" || file.type === "image/png" || file.type === "image/webp")
      ) {
        setImages((prev) =>
          prev.map((img) => (img.id === imageId ? { ...img, status: "compressing", progress: 60 } : img)),
        )

        const presetSettings = getCurrentPresetSettings()
        const compressedBlob = await compressImage(file, presetSettings)
        const compressionRatio = ((file.size - compressedBlob.size) / file.size) * 100

        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? {
                  ...img,
                  compressed: {
                    blob: compressedBlob,
                    originalSize: file.size,
                    compressedSize: compressedBlob.size,
                    compressionRatio,
                  },
                  progress: 90,
                }
              : img,
          ),
        )
      }

      // Complete upload
      await new Promise((resolve) => setTimeout(resolve, 200))
      setImages((prev) =>
        prev.map((img) => (img.id === imageId ? { ...img, status: "completed", progress: 100 } : img)),
      )
    } catch (error) {
      setImages((prev) =>
        prev.map((img) =>
          img.id === imageId
            ? {
                ...img,
                status: "error",
                error: error instanceof Error ? error.message : "Upload failed",
              }
            : img,
        ),
      )
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)

    // Check total file limit
    if (images.length + fileArray.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} files at once. Selected ${fileArray.length}, current ${images.length}.`,
        variant: "destructive",
      })
      return
    }

    // Process each file
    fileArray.forEach(processFile)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const removeImage = (imageId: string) => {
    setImages((prev) => {
      const imageToRemove = prev.find((img) => img.id === imageId)
      if (imageToRemove?.preview) {
        URL.revokeObjectURL(imageToRemove.preview)
      }
      return prev.filter((img) => img.id !== imageId)
    })
  }

  const retryUpload = (imageId: string) => {
    const image = images.find((img) => img.id === imageId)
    if (image) {
      setImages((prev) => prev.filter((img) => img.id !== imageId))
      processFile(image.file)
    }
  }

  const handleUploadCompleted = () => {
    const completedImages = images.filter((img) => img.status === "completed")

    if (completedImages.length === 0) {
      toast({
        title: "No images to upload",
        description: "Please select valid images to upload.",
        variant: "destructive",
      })
      return
    }

    const imagesToUpload = completedImages.map((img) => ({
      src: img.compressed ? URL.createObjectURL(img.compressed.blob) : img.preview,
      file: img.file,
    }))

    onImagesUploaded(imagesToUpload)
    setImages([])
    onOpenChange(false)

    toast({
      title: "Images uploaded successfully",
      description: `${completedImages.length} image(s) have been added to your presentation.`,
    })
  }

  const clearAll = () => {
    images.forEach((img) => {
      if (img.preview) {
        URL.revokeObjectURL(img.preview)
      }
    })
    setImages([])
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value)

    // If not custom, update compression quality to match preset
    if (value !== "custom") {
      const preset = COMPRESSION_PRESETS.find((p) => p.id === value)
      if (preset) {
        setCompressionQuality(preset.quality)
      }
    }
  }

  const handleCustomSettingChange = (setting: keyof typeof customSettings, value: any) => {
    setCustomSettings((prev) => ({
      ...prev,
      [setting]: value,
    }))

    // If we're changing custom settings, make sure we're on the custom preset
    if (selectedPreset !== "custom") {
      setSelectedPreset("custom")
    }
  }

  const completedCount = images.filter((img) => img.status === "completed").length
  const errorCount = images.filter((img) => img.status === "error").length
  const processingCount = images.filter((img) => ["pending", "uploading", "compressing"].includes(img.status)).length

  // Get current preset for display
  const currentPreset = COMPRESSION_PRESETS.find((p) => p.id === selectedPreset) || COMPRESSION_PRESETS[1]

  // Render minimalist view
  if (isMinimalistView) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gray-800/90 border-gray-700/60 text-gray-100 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/90 max-w-xs max-h-[80vh] overflow-hidden">
          <DialogHeader className="space-y-1">
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-sm">
                <Upload className="h-4 w-4 text-blue-400" />
                Upload Images
              </DialogTitle>
              <div className="flex items-center gap-1">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsMinimalistView(false)}
                        className="h-7 w-7 text-gray-400 hover:text-gray-200"
                      >
                        <Maximize2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p className="text-xs">Switch to normal view</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            {enableCompression && (
              <div className="flex items-center justify-between px-1">
                <Select value={selectedPreset} onValueChange={handlePresetChange}>
                  <SelectTrigger className="h-7 text-xs bg-gray-900 border-gray-700 w-[140px]">
                    <div className="flex items-center gap-1.5">
                      {currentPreset.icon}
                      <span>{currentPreset.name}</span>
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-gray-900 border-gray-700">
                    {COMPRESSION_PRESETS.map((preset) => (
                      <SelectItem key={preset.id} value={preset.id} className="text-xs">
                        <div className="flex items-center gap-1.5">
                          {preset.icon}
                          <span>{preset.name}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </DialogHeader>

          <div className="space-y-3">
            {/* Upload Area - Minimalist */}
            <div
              className={`border-2 border-dashed rounded-lg p-3 text-center transition-colors ${
                isDragOver
                  ? "border-blue-400 bg-blue-400/10"
                  : "border-gray-600 hover:border-gray-500 hover:bg-gray-800/30"
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <div className="flex flex-col items-center justify-center gap-2">
                <Upload className="h-6 w-6 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-300">Drop images here</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs text-blue-400 hover:text-blue-300 p-0 h-auto"
                  >
                    or browse files
                  </Button>
                </div>
              </div>
            </div>

            {/* Status Summary - Minimalist */}
            {images.length > 0 && (
              <div className="flex items-center justify-between p-2 bg-gray-900/50 rounded-lg text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="text-gray-400">{images.length} files</span>
                  {completedCount > 0 && (
                    <span className="flex items-center text-green-400">
                      <CheckCircle className="h-3 w-3 mr-0.5" />
                      {completedCount}
                    </span>
                  )}
                  {processingCount > 0 && (
                    <span className="flex items-center text-blue-400">
                      <Loader2 className="h-3 w-3 mr-0.5 animate-spin" />
                      {processingCount}
                    </span>
                  )}
                  {errorCount > 0 && (
                    <span className="flex items-center text-red-400">
                      <AlertCircle className="h-3 w-3 mr-0.5" />
                      {errorCount}
                    </span>
                  )}
                </div>
                {images.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAll}
                    className="h-6 px-1.5 text-xs text-gray-400 hover:text-gray-200"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            )}

            {/* Images List - Minimalist */}
            {images.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1.5">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="flex items-center gap-2 p-1.5 bg-gray-900/30 rounded-md border border-gray-700/50"
                  >
                    {/* Preview */}
                    <div className="w-8 h-8 rounded overflow-hidden bg-gray-800 flex-shrink-0">
                      {image.preview ? (
                        <img
                          src={image.preview || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-medium text-gray-300 truncate">{image.file.name}</p>
                        {image.status === "completed" && <CheckCircle className="h-3 w-3 text-green-400" />}
                        {image.status === "error" && <AlertCircle className="h-3 w-3 text-red-400" />}
                        {["pending", "uploading", "compressing"].includes(image.status) && (
                          <Loader2 className="h-3 w-3 text-blue-400 animate-spin" />
                        )}
                      </div>

                      {/* Progress */}
                      {["pending", "uploading", "compressing"].includes(image.status) && (
                        <Progress value={image.progress} className="h-1 mt-1" />
                      )}
                    </div>

                    {/* Actions */}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeImage(image.id)}
                      className="h-6 w-6 text-gray-400 hover:text-red-400"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="sm:justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs border-gray-700 bg-gray-800/50 hover:bg-gray-700 text-gray-300"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleUploadCompleted}
              disabled={completedCount === 0}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Upload className="h-3 w-3 mr-1" />
              Add {completedCount} Image{completedCount !== 1 ? "s" : ""}
            </Button>
          </DialogFooter>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={allowedTypes.join(",")}
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </DialogContent>
      </Dialog>
    )
  }

  // Render normal view
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800/90 border-gray-700/60 text-gray-100 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/90 max-w-md max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-400" />
              Upload Images
            </DialogTitle>
            <div className="flex items-center gap-1">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setIsMinimalistView(true)}
                      className="h-8 w-8 text-gray-400 hover:text-gray-200"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">Switch to minimalist view</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setShowSettings(!showSettings)}
                      className="h-8 w-8 text-gray-400 hover:text-gray-200"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p className="text-xs">{showSettings ? "Hide" : "Show"} settings</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 space-y-4">
              <Tabs defaultValue="presets" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4">
                  <TabsTrigger value="presets">Compression Presets</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="presets" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="preset-selector" className="text-sm text-gray-300">
                      Compression Preset
                    </Label>
                    <Select value={selectedPreset} onValueChange={handlePresetChange}>
                      <SelectTrigger className="bg-gray-900 border-gray-700">
                        <SelectValue placeholder="Select a preset" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-700">
                        {COMPRESSION_PRESETS.map((preset) => (
                          <SelectItem key={preset.id} value={preset.id} className="flex items-center gap-2">
                            <div className="flex items-center gap-2">
                              {preset.icon}
                              <span>{preset.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700/50">
                      <div className="flex items-center gap-2 mb-2">
                        {currentPreset.icon}
                        <h3 className="font-medium text-gray-200">{currentPreset.name}</h3>
                      </div>
                      <p className="text-xs text-gray-400 mb-3">{currentPreset.description}</p>

                      <div className="space-y-2 text-xs text-gray-300">
                        <div className="flex justify-between">
                          <span>Quality:</span>
                          <span className="text-blue-400">{Math.round(currentPreset.quality * 100)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Max Resolution:</span>
                          <span>
                            {currentPreset.maxWidth}×{currentPreset.maxHeight}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Format:</span>
                          <span className="capitalize">
                            {currentPreset.format === "original" ? "Original" : currentPreset.format}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transparency:</span>
                          <span>{currentPreset.preserveTransparency ? "Preserved" : "Removed"}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-800/50 p-3 rounded-md border border-gray-700/50">
                      <h3 className="font-medium text-gray-200 mb-2">Recommended For</h3>
                      <div className="space-y-2 text-xs">
                        {selectedPreset === "high-quality" && (
                          <>
                            <p className="text-gray-300">• Professional presentations</p>
                            <p className="text-gray-300">• Detailed photographs</p>
                            <p className="text-gray-300">• Print-quality materials</p>
                            <p className="text-gray-300">• When storage space isn't a concern</p>
                          </>
                        )}
                        {selectedPreset === "balanced" && (
                          <>
                            <p className="text-gray-300">• General purpose use</p>
                            <p className="text-gray-300">• Most presentation scenarios</p>
                            <p className="text-gray-300">• Good balance of quality and size</p>
                            <p className="text-gray-300">• Default for most situations</p>
                          </>
                        )}
                        {selectedPreset === "presentation" && (
                          <>
                            <p className="text-gray-300">• Slide decks and presentations</p>
                            <p className="text-gray-300">• Conference materials</p>
                            <p className="text-gray-300">• When images need to look crisp</p>
                            <p className="text-gray-300">• Projector display</p>
                          </>
                        )}
                        {selectedPreset === "web" && (
                          <>
                            <p className="text-gray-300">• Website images</p>
                            <p className="text-gray-300">• Online sharing</p>
                            <p className="text-gray-300">• Fast loading times</p>
                            <p className="text-gray-300">• Modern WebP format support</p>
                          </>
                        )}
                        {selectedPreset === "small" && (
                          <>
                            <p className="text-gray-300">• Email attachments</p>
                            <p className="text-gray-300">• Messaging apps</p>
                            <p className="text-gray-300">• Limited bandwidth situations</p>
                            <p className="text-gray-300">• When size is critical</p>
                          </>
                        )}
                        {selectedPreset === "mobile" && (
                          <>
                            <p className="text-gray-300">• Mobile applications</p>
                            <p className="text-gray-300">• Responsive websites</p>
                            <p className="text-gray-300">• Portrait orientation content</p>
                            <p className="text-gray-300">• Mobile data optimization</p>
                          </>
                        )}
                        {selectedPreset === "thumbnail" && (
                          <>
                            <p className="text-gray-300">• Image previews</p>
                            <p className="text-gray-300">• Gallery thumbnails</p>
                            <p className="text-gray-300">• Avatar images</p>
                            <p className="text-gray-300">• Small UI elements</p>
                          </>
                        )}
                        {selectedPreset === "custom" && (
                          <>
                            <p className="text-gray-300">• Specific requirements</p>
                            <p className="text-gray-300">• Advanced users</p>
                            <p className="text-gray-300">• Special use cases</p>
                            <p className="text-gray-300">• Fine-tuned optimization</p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="advanced" className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-compress" className="text-sm text-gray-300">
                      Auto-compress images
                    </Label>
                    <Switch id="auto-compress" checked={autoCompress} onCheckedChange={setAutoCompress} />
                  </div>

                  {autoCompress && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label className="text-sm text-gray-300">Compression Quality</Label>
                          <span className="text-xs text-gray-400">{Math.round(customSettings.quality * 100)}%</span>
                        </div>
                        <Slider
                          min={0.1}
                          max={1}
                          step={0.05}
                          value={[customSettings.quality]}
                          onValueChange={([value]) => handleCustomSettingChange("quality", value)}
                          className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-blue-400 [&>span:first-child_span]:bg-blue-400"
                        />
                        <p className="text-xs text-gray-400">Higher quality = larger file size</p>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-300">Max Width</Label>
                          <Select
                            value={customSettings.maxWidth.toString()}
                            onValueChange={(value) => handleCustomSettingChange("maxWidth", Number.parseInt(value))}
                          >
                            <SelectTrigger className="bg-gray-900 border-gray-700">
                              <SelectValue placeholder="Select max width" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700">
                              <SelectItem value="640">640px</SelectItem>
                              <SelectItem value="800">800px</SelectItem>
                              <SelectItem value="1080">1080px</SelectItem>
                              <SelectItem value="1280">1280px</SelectItem>
                              <SelectItem value="1920">1920px</SelectItem>
                              <SelectItem value="2560">2560px</SelectItem>
                              <SelectItem value="3840">3840px (4K)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="space-y-2">
                          <Label className="text-sm text-gray-300">Max Height</Label>
                          <Select
                            value={customSettings.maxHeight.toString()}
                            onValueChange={(value) => handleCustomSettingChange("maxHeight", Number.parseInt(value))}
                          >
                            <SelectTrigger className="bg-gray-900 border-gray-700">
                              <SelectValue placeholder="Select max height" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700">
                              <SelectItem value="480">480px</SelectItem>
                              <SelectItem value="600">600px</SelectItem>
                              <SelectItem value="720">720px</SelectItem>
                              <SelectItem value="1080">1080px</SelectItem>
                              <SelectItem value="1440">1440px</SelectItem>
                              <SelectItem value="2160">2160px (4K)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm text-gray-300">Output Format</Label>
                          <Select
                            value={customSettings.format}
                            onValueChange={(value) =>
                              handleCustomSettingChange("format", value as "original" | "jpeg" | "png" | "webp")
                            }
                          >
                            <SelectTrigger className="bg-gray-900 border-gray-700">
                              <SelectValue placeholder="Select format" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-900 border-gray-700">
                              <SelectItem value="original">Original Format</SelectItem>
                              <SelectItem value="jpeg">JPEG (smaller size)</SelectItem>
                              <SelectItem value="png">PNG (better quality)</SelectItem>
                              <SelectItem value="webp">WebP (best compression)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div className="flex items-center justify-between pt-8">
                          <Label htmlFor="preserve-transparency" className="text-sm text-gray-300">
                            Preserve Transparency
                          </Label>
                          <Switch
                            id="preserve-transparency"
                            checked={customSettings.preserveTransparency}
                            onCheckedChange={(value) => handleCustomSettingChange("preserveTransparency", value)}
                            disabled={customSettings.format === "jpeg"}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="text-xs text-gray-400 space-y-1">
                    <p>• Maximum file size: {maxFileSize}MB</p>
                    <p>• Maximum files: {maxFiles}</p>
                    <p>• Supported formats: {allowedTypes.map((type) => type.split("/")[1]).join(", ")}</p>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              isDragOver
                ? "border-blue-400 bg-blue-400/10"
                : "border-gray-600 hover:border-gray-500 hover:bg-gray-800/30"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-3">
              <div className="mx-auto w-10 h-10 bg-gray-700 rounded-full flex items-center justify-center">
                <Upload className="h-5 w-5 text-gray-400" />
              </div>
              <div>
                <p className="text-base font-medium text-gray-300">Drop images here</p>
                <p className="text-xs text-gray-400 mt-1">Up to {maxFileSize}MB each</p>
                {autoCompress && (
                  <div className="mt-1 inline-flex items-center gap-1 bg-blue-500/20 text-blue-300 px-1.5 py-0.5 rounded-md text-xs">
                    <Sparkles className="h-3 w-3" />
                    {currentPreset.name}
                  </div>
                )}
              </div>
              <Button
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FileImage className="h-3.5 w-3.5 mr-1.5" />
                Select Images
              </Button>
            </div>
          </div>

          {/* Status Summary */}
          {images.length > 0 && (
            <div className="flex items-center gap-4 p-3 bg-gray-900/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                  {images.length} Total
                </Badge>
                {completedCount > 0 && (
                  <Badge className="bg-green-600 text-white">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    {completedCount} Ready
                  </Badge>
                )}
                {processingCount > 0 && (
                  <Badge className="bg-blue-600 text-white">
                    <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                    {processingCount} Processing
                  </Badge>
                )}
                {errorCount > 0 && (
                  <Badge variant="destructive">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {errorCount} Failed
                  </Badge>
                )}
              </div>
              <div className="flex-1" />
              <Button variant="ghost" size="sm" onClick={clearAll} className="text-gray-400 hover:text-gray-200">
                <Trash2 className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            </div>
          )}

          {/* Images List */}
          {images.length > 0 && (
            <div className="max-h-48 overflow-y-auto space-y-2">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="flex items-center gap-2 p-2 bg-gray-900/30 rounded-lg border border-gray-700/50"
                >
                  {/* Preview */}
                  <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
                    {image.preview ? (
                      <img
                        src={image.preview || "/placeholder.svg"}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-gray-300 truncate">{image.file.name}</p>
                      <div className="flex items-center gap-2">
                        {image.status === "completed" && <CheckCircle className="h-4 w-4 text-green-400" />}
                        {image.status === "error" && <AlertCircle className="h-4 w-4 text-red-400" />}
                        {["pending", "uploading", "compressing"].includes(image.status) && (
                          <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>{formatFileSize(image.file.size)}</span>
                      {image.compressed && (
                        <>
                          <span>→</span>
                          <span className="text-green-400">{formatFileSize(image.compressed.compressedSize)}</span>
                          <span className="text-green-400">(-{image.compressed.compressionRatio.toFixed(1)}%)</span>
                        </>
                      )}
                    </div>

                    {/* Progress */}
                    {["pending", "uploading", "compressing"].includes(image.status) && (
                      <div className="mt-2">
                        <Progress value={image.progress} className="h-1" />
                        <p className="text-xs text-gray-400 mt-1 capitalize">{image.status}...</p>
                      </div>
                    )}

                    {/* Error */}
                    {image.status === "error" && (
                      <Alert className="mt-2 border-red-600/50 bg-red-600/10">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription className="text-xs">{image.error}</AlertDescription>
                      </Alert>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    {image.status === "error" && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => retryUpload(image.id)}
                        className="h-8 w-8 text-blue-400 hover:text-blue-300"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeImage(image.id)}
                      className="h-8 w-8 text-gray-400 hover:text-red-400"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="border-gray-700 bg-gray-800/50 hover:bg-gray-700 text-gray-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleUploadCompleted}
            disabled={completedCount === 0}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Upload className="h-4 w-4 mr-2" />
            Add {completedCount} Image{completedCount !== 1 ? "s" : ""} to Presentation
          </Button>
        </DialogFooter>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={allowedTypes.join(",")}
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files)}
        />
      </DialogContent>
    </Dialog>
  )
}
