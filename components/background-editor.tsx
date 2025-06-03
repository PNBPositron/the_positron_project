"use client"

import type React from "react"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ColorPicker } from "./color-picker"
import type { SlideBackground } from "@/types/editor"
import { RotateCcw, ImageIcon, Palette, Layers } from "lucide-react"

interface BackgroundEditorProps {
  background: string | SlideBackground
  onUpdateBackground: (background: SlideBackground) => void
}

const GRADIENT_PRESETS = [
  "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
  "linear-gradient(to right, #4f46e5, #0ea5e9)",
  "linear-gradient(to right, #f43f5e, #ec4899)",
  "linear-gradient(to right, #10b981, #84cc16)",
  "linear-gradient(to bottom, #6366f1, #a855f7, #ec4899)",
  "radial-gradient(circle at center, #1e293b, #0f172a)",
  "conic-gradient(from 45deg, #0ea5e9, #8b5cf6, #ec4899, #f43f5e, #f59e0b, #84cc16, #0ea5e9)",
]

const COLOR_PRESETS = [
  "#0f172a", // Dark blue
  "#18181b", // Dark gray
  "#0c0a09", // Almost black
  "#0c4a6e", // Dark cyan
  "#1e1b4b", // Dark indigo
  "#4a044e", // Dark purple
  "#000000", // Black
]

export function BackgroundEditor({ background, onUpdateBackground }: BackgroundEditorProps) {
  // Convert string background to object if needed
  const [bgState, setBgState] = useState<SlideBackground>(() => {
    if (typeof background === "string") {
      if (background.includes("gradient")) {
        return { type: "gradient", value: background }
      }
      if (background.startsWith("#") || background.startsWith("rgb")) {
        return { type: "color", value: background }
      }
      // Default
      return { type: "color", value: "#0f172a" }
    }
    return background
  })

  const updateBackground = (updates: Partial<SlideBackground>) => {
    const updated = { ...bgState, ...updates }
    setBgState(updated)
    onUpdateBackground(updated)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const reader = new FileReader()

    reader.onload = (event) => {
      if (!event.target?.result) return
      updateBackground({
        type: "image",
        value: event.target.result as string,
        imagePosition: "cover",
        imageOpacity: 100,
        overlay: "rgba(0,0,0,0)",
      })
    }

    reader.readAsDataURL(file)
    e.target.value = ""
  }

  return (
    <Tabs
      defaultValue={bgState.type}
      className="w-full"
      onValueChange={(value) => {
        if (value === "color" || value === "gradient" || value === "image") {
          updateBackground({ type: value })
        }
      }}
    >
      <TabsList className="grid grid-cols-3 bg-gray-800">
        <TabsTrigger value="color" className="text-gray-300 data-[state=active]:bg-gray-700">
          <Palette className="h-4 w-4 mr-1" />
          Color
        </TabsTrigger>
        <TabsTrigger value="gradient" className="text-gray-300 data-[state=active]:bg-gray-700">
          <Layers className="h-4 w-4 mr-1" />
          Gradient
        </TabsTrigger>
        <TabsTrigger value="image" className="text-gray-300 data-[state=active]:bg-gray-700">
          <ImageIcon className="h-4 w-4 mr-1" />
          Image
        </TabsTrigger>
      </TabsList>

      <TabsContent value="color" className="space-y-4 mt-3">
        <div className="grid gap-3">
          <Label className="text-sm text-gray-300">Select Color</Label>
          <div className="grid grid-cols-7 gap-2">
            {COLOR_PRESETS.map((color) => (
              <button
                key={color}
                className="w-8 h-8 rounded-md border border-gray-700 cursor-pointer hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
                onClick={() => updateBackground({ value: color })}
              />
            ))}
          </div>
          <div className="flex items-center gap-2 mt-2">
            <Label className="text-sm text-gray-300">Custom:</Label>
            <ColorPicker
              color={bgState.type === "color" ? bgState.value : "#0f172a"}
              onChange={(color) => updateBackground({ value: color })}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="gradient" className="space-y-4 mt-3">
        <div className="grid gap-3">
          <Label className="text-sm text-gray-300">Select Gradient</Label>
          <div className="grid grid-cols-2 gap-2">
            {GRADIENT_PRESETS.map((gradient) => (
              <button
                key={gradient}
                className="h-12 rounded-md border border-gray-700 cursor-pointer hover:scale-105 transition-transform"
                style={{ background: gradient }}
                onClick={() => updateBackground({ value: gradient })}
              />
            ))}
          </div>
          <div className="mt-2">
            <Label className="text-sm text-gray-300">Custom CSS Gradient:</Label>
            <Input
              className="mt-1 bg-gray-800 border-gray-700 text-gray-100"
              value={bgState.type === "gradient" ? bgState.value : ""}
              onChange={(e) => updateBackground({ value: e.target.value })}
              placeholder="linear-gradient(to right, #000, #fff)"
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="image" className="space-y-4 mt-3">
        <div className="grid gap-3">
          {bgState.type === "image" && bgState.value ? (
            <div className="relative group">
              <div className="w-full h-32 rounded-md overflow-hidden border border-gray-700">
                <div
                  className="w-full h-full bg-center"
                  style={{
                    backgroundImage: `url(${bgState.value})`,
                    backgroundSize: bgState.imagePosition || "cover",
                    opacity: (bgState.imageOpacity || 100) / 100,
                    backgroundPosition: "center",
                  }}
                />
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="absolute top-2 right-2 bg-gray-900/80 hover:bg-gray-800 text-gray-300"
                onClick={() => updateBackground({ value: "" })}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Remove
              </Button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-md cursor-pointer hover:bg-gray-800/50 transition-colors">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon className="w-8 h-8 mb-3 text-gray-500" />
                <p className="text-sm text-gray-400">Click to upload background image</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
            </label>
          )}

          {bgState.type === "image" && bgState.value && (
            <>
              <div className="space-y-2">
                <Label className="text-sm text-gray-300">Image Position</Label>
                <RadioGroup
                  value={bgState.imagePosition || "cover"}
                  onValueChange={(value) =>
                    updateBackground({ imagePosition: value as "cover" | "contain" | "center" })
                  }
                  className="flex gap-3"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="cover" id="cover" className="text-sky-400" />
                    <Label htmlFor="cover" className="text-gray-300">
                      Cover
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="contain" id="contain" className="text-sky-400" />
                    <Label htmlFor="contain" className="text-gray-300">
                      Contain
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="center" id="center" className="text-sky-400" />
                    <Label htmlFor="center" className="text-gray-300">
                      Center
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm text-gray-300">Opacity</Label>
                  <span className="text-xs text-gray-400">{bgState.imageOpacity || 100}%</span>
                </div>
                <Slider
                  min={0}
                  max={100}
                  step={1}
                  value={[bgState.imageOpacity || 100]}
                  onValueChange={([value]) => updateBackground({ imageOpacity: value })}
                  className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-sky-400 [&>span:first-child_span]:bg-sky-400"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm text-gray-300">Overlay Color</Label>
                <ColorPicker
                  color={bgState.overlay || "rgba(0,0,0,0)"}
                  onChange={(color) => updateBackground({ overlay: color })}
                />
                <p className="text-xs text-gray-400">Add a color overlay to improve text visibility</p>
              </div>
            </>
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}
