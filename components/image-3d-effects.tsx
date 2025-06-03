"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { RotateCcw } from "lucide-react"
import type { ImageElement } from "@/types/editor"

interface Image3DEffectsProps {
  element: ImageElement
  onUpdateElement: (id: string, updates: Record<string, any>) => void
}

export function Image3DEffects({ element, onUpdateElement }: Image3DEffectsProps) {
  const imageEffect3d = element.imageEffect3d || {
    type: "none",
    intensity: 5,
    angle: 15,
    perspective: 800,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    translateZ: 0,
    hover: false,
  }

  const [previewHover, setPreviewHover] = useState(false)

  const updateImageEffect = (updates: Partial<ImageElement["imageEffect3d"]>) => {
    onUpdateElement(element.id, {
      imageEffect3d: {
        ...imageEffect3d,
        ...updates,
      },
    })
  }

  const resetImageEffect = () => {
    onUpdateElement(element.id, {
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
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-300">Image 3D Effects</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetImageEffect}
          className="h-7 text-xs text-gray-400 hover:text-gray-100"
        >
          <RotateCcw className="h-3 w-3 mr-1" />
          Reset
        </Button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Effect Type</Label>
          <Select
            value={imageEffect3d.type}
            onValueChange={(value) => updateImageEffect({ type: value as ImageElement["imageEffect3d"]["type"] })}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
              <SelectValue placeholder="Select effect type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="tilt">Tilt</SelectItem>
              <SelectItem value="flip">Flip</SelectItem>
              <SelectItem value="rotate">Rotate</SelectItem>
              <SelectItem value="float">Float</SelectItem>
              <SelectItem value="perspective">Perspective</SelectItem>
              <SelectItem value="fold">Fold</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {imageEffect3d.type !== "none" && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label className="text-sm text-gray-300">Perspective</Label>
                <span className="text-xs text-gray-400">{imageEffect3d.perspective}px</span>
              </div>
              <Slider
                min={200}
                max={2000}
                step={50}
                value={[imageEffect3d.perspective || 800]}
                onValueChange={([value]) => updateImageEffect({ perspective: value })}
                className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-blue-400 [&>span:first-child_span]:bg-blue-400"
              />
            </div>

            {(imageEffect3d.type === "tilt" ||
              imageEffect3d.type === "flip" ||
              imageEffect3d.type === "perspective") && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm text-gray-300">Intensity</Label>
                  <span className="text-xs text-gray-400">{imageEffect3d.intensity}</span>
                </div>
                <Slider
                  min={1}
                  max={20}
                  step={1}
                  value={[imageEffect3d.intensity || 5]}
                  onValueChange={([value]) => updateImageEffect({ intensity: value })}
                  className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-blue-400 [&>span:first-child_span]:bg-blue-400"
                />
              </div>
            )}

            {imageEffect3d.type === "rotate" && (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm text-gray-300">Rotate X</Label>
                    <span className="text-xs text-gray-400">{imageEffect3d.rotateX}°</span>
                  </div>
                  <Slider
                    min={-180}
                    max={180}
                    step={5}
                    value={[imageEffect3d.rotateX || 0]}
                    onValueChange={([value]) => updateImageEffect({ rotateX: value })}
                    className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-blue-400 [&>span:first-child_span]:bg-blue-400"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm text-gray-300">Rotate Y</Label>
                    <span className="text-xs text-gray-400">{imageEffect3d.rotateY}°</span>
                  </div>
                  <Slider
                    min={-180}
                    max={180}
                    step={5}
                    value={[imageEffect3d.rotateY || 0]}
                    onValueChange={([value]) => updateImageEffect({ rotateY: value })}
                    className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-blue-400 [&>span:first-child_span]:bg-blue-400"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label className="text-sm text-gray-300">Rotate Z</Label>
                    <span className="text-xs text-gray-400">{imageEffect3d.rotateZ}°</span>
                  </div>
                  <Slider
                    min={-180}
                    max={180}
                    step={5}
                    value={[imageEffect3d.rotateZ || 0]}
                    onValueChange={([value]) => updateImageEffect({ rotateZ: value })}
                    className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-blue-400 [&>span:first-child_span]:bg-blue-400"
                  />
                </div>
              </>
            )}

            {(imageEffect3d.type === "float" || imageEffect3d.type === "perspective") && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm text-gray-300">Translate Z</Label>
                  <span className="text-xs text-gray-400">{imageEffect3d.translateZ}px</span>
                </div>
                <Slider
                  min={-100}
                  max={100}
                  step={5}
                  value={[imageEffect3d.translateZ || 0]}
                  onValueChange={([value]) => updateImageEffect({ translateZ: value })}
                  className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-blue-400 [&>span:first-child_span]:bg-blue-400"
                />
              </div>
            )}

            {(imageEffect3d.type === "tilt" || imageEffect3d.type === "flip") && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm text-gray-300">Angle</Label>
                  <span className="text-xs text-gray-400">{imageEffect3d.angle}°</span>
                </div>
                <Slider
                  min={-45}
                  max={45}
                  step={5}
                  value={[imageEffect3d.angle || 15]}
                  onValueChange={([value]) => updateImageEffect({ angle: value })}
                  className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-blue-400 [&>span:first-child_span]:bg-blue-400"
                />
              </div>
            )}

            <div className="flex items-center justify-between">
              <Label htmlFor="hover-effect" className="text-sm text-gray-300">
                Apply on Hover
              </Label>
              <Switch
                id="hover-effect"
                checked={imageEffect3d.hover}
                onCheckedChange={(checked) => updateImageEffect({ hover: checked })}
              />
            </div>
          </>
        )}
      </div>

      <div className="mt-4 p-3 bg-gray-900/50 rounded-md">
        <div className="text-center text-sm text-gray-400 mb-2">Preview</div>
        <div
          className="p-4 bg-gray-800 rounded-md flex items-center justify-center h-48"
          style={{
            perspective: `${imageEffect3d.perspective || 800}px`,
          }}
        >
          <div
            className="w-40 h-32 relative overflow-hidden"
            style={{
              ...getImage3DEffectStyle(imageEffect3d, imageEffect3d.hover && previewHover),
              transition: "all 0.3s ease",
            }}
            onMouseEnter={() => setPreviewHover(true)}
            onMouseLeave={() => setPreviewHover(false)}
          >
            <img
              src={element.src || "/placeholder.svg?height=150&width=200"}
              alt="Preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
        {imageEffect3d.hover && (
          <p className="text-center text-xs text-gray-400 mt-2">Hover over the image to see the effect</p>
        )}
      </div>
    </div>
  )
}

// Helper function to generate CSS for image 3D effects
export function getImage3DEffectStyle(effect: ImageElement["imageEffect3d"], isHovering = false): React.CSSProperties {
  if (!effect || effect.type === "none") {
    return {}
  }

  // If effect is set to hover only and we're not hovering, return no transform
  if (effect.hover && !isHovering) {
    return {
      transform: "none",
      transformStyle: "preserve-3d",
    }
  }

  const intensity = effect.intensity || 5
  const angle = effect.angle || 15

  switch (effect.type) {
    case "tilt":
      return {
        transform: `perspective(${effect.perspective || 800}px) rotateY(${angle}deg) rotateX(${-angle / 2}deg)`,
        transformStyle: "preserve-3d",
      }

    case "flip":
      return {
        transform: `perspective(${effect.perspective || 800}px) rotateY(${angle}deg)`,
        transformStyle: "preserve-3d",
      }

    case "rotate":
      return {
        transform: `perspective(${effect.perspective || 800}px) rotateX(${effect.rotateX || 0}deg) rotateY(${effect.rotateY || 0}deg) rotateZ(${effect.rotateZ || 0}deg)`,
        transformStyle: "preserve-3d",
      }

    case "float":
      return {
        transform: `perspective(${effect.perspective || 800}px) translateZ(${effect.translateZ || 50}px)`,
        transformStyle: "preserve-3d",
      }

    case "perspective":
      return {
        transform: `perspective(${effect.perspective || 800}px) rotateX(5deg) rotateY(-5deg) translateZ(${effect.translateZ || 0}px)`,
        transformStyle: "preserve-3d",
      }

    case "fold":
      return {
        transform: `perspective(${effect.perspective || 800}px) rotateX(${intensity}deg)`,
        transformStyle: "preserve-3d",
        transformOrigin: "top center",
      }

    default:
      return {}
  }
}
