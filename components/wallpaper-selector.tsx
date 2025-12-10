"use client"
import { useState } from "react"
import type React from "react"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ImageIcon, Upload } from "lucide-react"

interface WallpaperSelectorProps {
  onSelectWallpaper: (wallpaperUrl: string) => void
}

const WALLPAPER_OPTIONS = [
  {
    id: "abstract-3d",
    name: "Abstract 3D",
    url: "/images/abstract-3d-wallpaper.jpg",
  },
  {
    id: "dark-gradient",
    name: "Dark Gradient",
    url: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  },
  {
    id: "neon-grid",
    name: "Neon Grid",
    url: "linear-gradient(90deg, rgba(0,212,255,0.1) 1px, transparent 1px), linear-gradient(rgba(0,212,255,0.1) 1px, transparent 1px)",
  },
  {
    id: "deep-space",
    name: "Deep Space",
    url: "radial-gradient(circle at 20% 50%, #1e3a8a 0%, #0f172a 50%)",
  },
  {
    id: "sunset",
    name: "Sunset",
    url: "linear-gradient(135deg, #f59e0b 0%, #ef4444 50%, #8b5cf6 100%)",
  },
  {
    id: "ocean",
    name: "Ocean",
    url: "linear-gradient(180deg, #0c4a6e 0%, #164e63 50%, #0f172a 100%)",
  },
  {
    id: "forest",
    name: "Forest",
    url: "linear-gradient(180deg, #065f46 0%, #10b981 50%, #0f172a 100%)",
  },
  {
    id: "midnight",
    name: "Midnight",
    url: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0c0a09 100%)",
  },
]

export function WallpaperSelector({ onSelectWallpaper }: WallpaperSelectorProps) {
  const [open, setOpen] = useState(false)
  const [customWallpaper, setCustomWallpaper] = useState<string | null>(null)

  const handleSelectWallpaper = (url: string) => {
    onSelectWallpaper(url)
    setOpen(false)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string
        setCustomWallpaper(dataUrl)
        handleSelectWallpaper(dataUrl)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 bg-gray-800 hover:bg-gray-700 border-gray-700 text-gray-200"
        >
          <ImageIcon className="h-4 w-4" />
          Change Wallpaper
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-gray-900 border-gray-800">
        <DialogHeader>
          <DialogTitle className="text-gray-100">Select Wallpaper</DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-96 w-full">
          <div className="grid grid-cols-2 gap-4 p-4">
            <label
              htmlFor="wallpaper-upload"
              className="group relative overflow-hidden rounded-lg border border-dashed border-gray-600 p-2 cursor-pointer transition-all hover:border-gray-500 hover:bg-gray-800/50"
            >
              <div className="h-32 w-full rounded-md flex items-center justify-center bg-gray-800">
                <div className="text-center">
                  <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-xs font-medium text-gray-300">Upload Image</p>
                </div>
              </div>
              <input
                id="wallpaper-upload"
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {WALLPAPER_OPTIONS.map((wallpaper) => (
              <button
                key={wallpaper.id}
                onClick={() => handleSelectWallpaper(wallpaper.url)}
                className="group relative overflow-hidden rounded-lg border border-gray-700 p-2 text-left transition-all hover:border-gray-600"
              >
                <div
                  className="h-32 w-full rounded-md bg-cover bg-center transition-transform group-hover:scale-105"
                  style={
                    wallpaper.url.startsWith("linear") || wallpaper.url.startsWith("radial")
                      ? { background: wallpaper.url }
                      : { backgroundImage: `url(${wallpaper.url})` }
                  }
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                  <span className="text-white font-medium">Select</span>
                </div>
                <p className="mt-2 text-xs font-medium text-gray-300">{wallpaper.name}</p>
              </button>
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
