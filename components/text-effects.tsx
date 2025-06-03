"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RotateCcw } from "lucide-react"
import { ColorPicker } from "./color-picker"
import type { TextElement } from "@/types/editor"

interface TextEffectsProps {
  element: TextElement
  onUpdateElement: (id: string, updates: Record<string, any>) => void
}

export function TextEffects({ element, onUpdateElement }: TextEffectsProps) {
  const textEffect = element.textEffect || {
    type: "none",
    depth: 5,
    color: "#000000",
    angle: 45,
    intensity: 5,
    perspective: 500,
  }

  const updateTextEffect = (updates: Partial<TextElement["textEffect"]>) => {
    onUpdateElement(element.id, {
      textEffect: {
        ...textEffect,
        ...updates,
      },
    })
  }

  const resetTextEffect = () => {
    onUpdateElement(element.id, {
      textEffect: {
        type: "none",
        depth: 5,
        color: "#000000",
        angle: 45,
        intensity: 5,
        perspective: 500,
      },
    })
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium text-gray-300">3D Text Effects</h4>
        <Button
          variant="ghost"
          size="sm"
          onClick={resetTextEffect}
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
            value={textEffect.type}
            onValueChange={(value) => updateTextEffect({ type: value as TextElement["textEffect"]["type"] })}
          >
            <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100">
              <SelectValue placeholder="Select effect type" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
              <SelectItem value="none">None</SelectItem>
              <SelectItem value="shadow">3D Shadow</SelectItem>
              <SelectItem value="extrude">Extrude</SelectItem>
              <SelectItem value="neon">Neon Glow</SelectItem>
              <SelectItem value="3d-rotate">3D Rotate</SelectItem>
              <SelectItem value="perspective">Perspective</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {textEffect.type !== "none" && (
          <>
            {(textEffect.type === "shadow" || textEffect.type === "extrude" || textEffect.type === "neon") && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm text-gray-300">Depth</Label>
                  <span className="text-xs text-gray-400">{textEffect.depth}px</span>
                </div>
                <Slider
                  min={1}
                  max={20}
                  step={1}
                  value={[textEffect.depth || 5]}
                  onValueChange={([value]) => updateTextEffect({ depth: value })}
                  className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-blue-400 [&>span:first-child_span]:bg-blue-400"
                />
              </div>
            )}

            {(textEffect.type === "shadow" || textEffect.type === "extrude" || textEffect.type === "neon") && (
              <div className="space-y-2">
                <Label className="text-sm text-gray-300">Effect Color</Label>
                <ColorPicker color={textEffect.color || "#000000"} onChange={(color) => updateTextEffect({ color })} />
              </div>
            )}

            {(textEffect.type === "shadow" || textEffect.type === "extrude") && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm text-gray-300">Angle</Label>
                  <span className="text-xs text-gray-400">{textEffect.angle}°</span>
                </div>
                <Slider
                  min={0}
                  max={360}
                  step={5}
                  value={[textEffect.angle || 45]}
                  onValueChange={([value]) => updateTextEffect({ angle: value })}
                  className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-blue-400 [&>span:first-child_span]:bg-blue-400"
                />
              </div>
            )}

            {textEffect.type === "neon" && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm text-gray-300">Intensity</Label>
                  <span className="text-xs text-gray-400">{textEffect.intensity}</span>
                </div>
                <Slider
                  min={1}
                  max={20}
                  step={1}
                  value={[textEffect.intensity || 5]}
                  onValueChange={([value]) => updateTextEffect({ intensity: value })}
                  className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-blue-400 [&>span:first-child_span]:bg-blue-400"
                />
              </div>
            )}

            {(textEffect.type === "3d-rotate" || textEffect.type === "perspective") && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm text-gray-300">Perspective</Label>
                  <span className="text-xs text-gray-400">{textEffect.perspective}px</span>
                </div>
                <Slider
                  min={100}
                  max={1000}
                  step={50}
                  value={[textEffect.perspective || 500]}
                  onValueChange={([value]) => updateTextEffect({ perspective: value })}
                  className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-blue-400 [&>span:first-child_span]:bg-blue-400"
                />
              </div>
            )}

            {textEffect.type === "3d-rotate" && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm text-gray-300">Rotation Angle</Label>
                  <span className="text-xs text-gray-400">{textEffect.angle}°</span>
                </div>
                <Slider
                  min={-45}
                  max={45}
                  step={1}
                  value={[textEffect.angle || 0]}
                  onValueChange={([value]) => updateTextEffect({ angle: value })}
                  className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-blue-400 [&>span:first-child_span]:bg-blue-400"
                />
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-4 p-3 bg-gray-900/50 rounded-md">
        <div className="text-center text-sm text-gray-400 mb-2">Preview</div>
        <div
          className="p-4 bg-gray-800 rounded-md flex items-center justify-center"
          style={{
            perspective: textEffect.type === "perspective" ? `${textEffect.perspective}px` : "none",
          }}
        >
          <div
            className="text-2xl font-bold"
            style={{
              ...getTextEffectStyle(textEffect),
              color: "white",
            }}
          >
            3D Text
          </div>
        </div>
      </div>
    </div>
  )
}

// Helper function to generate CSS for text effects
function getTextEffectStyle(effect: TextElement["textEffect"]): React.CSSProperties {
  if (!effect || effect.type === "none") {
    return {}
  }

  switch (effect.type) {
    case "shadow":
      const shadowX = Math.cos(((effect.angle || 45) * Math.PI) / 180) * (effect.depth || 5)
      const shadowY = Math.sin(((effect.angle || 45) * Math.PI) / 180) * (effect.depth || 5)
      return {
        textShadow: `${shadowX}px ${shadowY}px ${effect.depth || 5}px ${effect.color || "#000000"}`,
      }

    case "extrude":
      let textShadow = ""
      const depth = effect.depth || 5
      const angle = effect.angle || 45
      const radians = (angle * Math.PI) / 180
      const stepX = Math.cos(radians)
      const stepY = Math.sin(radians)

      for (let i = 1; i <= depth; i++) {
        const x = Math.round(stepX * i)
        const y = Math.round(stepY * i)
        textShadow += `${x}px ${y}px 0px ${effect.color || "#000000"}${i < depth ? ", " : ""}`
      }

      return { textShadow }

    case "neon":
      const intensity = effect.intensity || 5
      const color = effect.color || "#00ffff"
      return {
        textShadow: `
          0 0 ${intensity * 0.5}px #fff,
          0 0 ${intensity}px ${color},
          0 0 ${intensity * 1.5}px ${color},
          0 0 ${intensity * 2}px ${color}
        `,
        color: "white",
      }

    case "3d-rotate":
      return {
        transform: `perspective(${effect.perspective || 500}px) rotateY(${effect.angle || 0}deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.3s ease",
      }

    case "perspective":
      return {
        transform: `perspective(${effect.perspective || 500}px) rotateX(15deg) rotateY(-10deg) rotateZ(0deg)`,
        transformStyle: "preserve-3d",
        transition: "transform 0.3s ease",
      }

    default:
      return {}
  }
}

// Export the helper function for use in other components
export { getTextEffectStyle }
