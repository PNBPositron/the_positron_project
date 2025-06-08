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
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { toast } from "@/components/ui/use-toast"

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
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const compressImage = async (file: File, quality: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        // Calculate new dimensions (max 1920x1080 for optimization)
        const maxWidth = 1920
        const maxHeight = 1080
        let { width, height } = img

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height)
          width *= ratio
          height *= ratio
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error("Failed to compress image"))
            }
          },
          file.type === "image/png" ? "image/png" : "image/jpeg",
          quality,
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
      if (enableCompression && autoCompress && (file.type === "image/jpeg" || file.type === "image/png")) {
        setImages((prev) =>
          prev.map((img) => (img.id === imageId ? { ...img, status: "compressing", progress: 60 } : img)),
        )

        const compressedBlob = await compressImage(file, compressionQuality)
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
      src: img.preview,
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

  const completedCount = images.filter((img) => img.status === "completed").length
  const errorCount = images.filter((img) => img.status === "error").length
  const processingCount = images.filter((img) => ["pending", "uploading", "compressing"].includes(img.status)).length

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800/90 border-gray-700/60 text-gray-100 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/90 max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-blue-400" />
              Upload Images
            </DialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowSettings(!showSettings)}
              className="text-gray-400 hover:text-gray-200"
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Settings Panel */}
          {showSettings && (
            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-700/50 space-y-4">
              <h3 className="text-sm font-medium text-gray-300">Upload Settings</h3>

              {enableCompression && (
                <>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="auto-compress" className="text-sm text-gray-300">
                      Auto-compress images
                    </Label>
                    <Switch id="auto-compress" checked={autoCompress} onCheckedChange={setAutoCompress} />
                  </div>

                  {autoCompress && (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label className="text-sm text-gray-300">Compression Quality</Label>
                        <span className="text-xs text-gray-400">{Math.round(compressionQuality * 100)}%</span>
                      </div>
                      <Slider
                        min={0.1}
                        max={1}
                        step={0.1}
                        value={[compressionQuality]}
                        onValueChange={([value]) => setCompressionQuality(value)}
                        className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-blue-400 [&>span:first-child_span]:bg-blue-400"
                      />
                      <p className="text-xs text-gray-400">Higher quality = larger file size</p>
                    </div>
                  )}
                </>
              )}

              <div className="text-xs text-gray-400 space-y-1">
                <p>• Maximum file size: {maxFileSize}MB</p>
                <p>• Maximum files: {maxFiles}</p>
                <p>• Supported formats: {allowedTypes.map((type) => type.split("/")[1]).join(", ")}</p>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragOver
                ? "border-blue-400 bg-blue-400/10"
                : "border-gray-600 hover:border-gray-500 hover:bg-gray-800/30"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            <div className="space-y-4">
              <div className="mx-auto w-12 h-12 bg-gray-700 rounded-full flex items-center justify-center">
                <Upload className="h-6 w-6 text-gray-400" />
              </div>
              <div>
                <p className="text-lg font-medium text-gray-300">Drop images here or click to browse</p>
                <p className="text-sm text-gray-400 mt-1">
                  Support for {allowedTypes.length} image formats, up to {maxFileSize}MB each
                </p>
              </div>
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <FileImage className="h-4 w-4 mr-2" />
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
            <div className="max-h-64 overflow-y-auto space-y-3">
              {images.map((image) => (
                <div
                  key={image.id}
                  className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg border border-gray-700/50"
                >
                  {/* Preview */}
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 flex-shrink-0">
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
