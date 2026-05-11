"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Square,
  Circle,
  Triangle,
  Diamond,
  Star,
  Hexagon,
  Zap,
  Palette,
  Airplay,
  RotateCw,
  Copy,
  Trash2,
  ArrowUpDown,
  LucideIcon,
} from "lucide-react"

interface ShapeProperties {
  id: string
  type: "rectangle" | "circle" | "triangle" | "diamond" | "star" | "hexagon" | "polygon"
  x: number
  y: number
  width: number
  height: number
  rotation: number
  fillColor: string
  strokeColor: string
  strokeWidth: number
  opacity: number
  cornerRadius: number
  shadow: {
    blur: number
    offsetX: number
    offsetY: number
    color: string
    opacity: number
  }
  gradient: {
    enabled: boolean
    type: "linear" | "radial"
    angle: number
    color1: string
    color2: string
  }
}

interface AdvancedShapesEditorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedShape?: ShapeProperties | null
  onUpdateShape?: (shape: any) => void
  onDeleteShape?: () => void
}

const SHAPE_PRESETS: Record<string, Partial<ShapeProperties>> = {
  "glass-morph": {
    fillColor: "rgba(255, 255, 255, 0.1)",
    strokeColor: "rgba(255, 255, 255, 0.2)",
    strokeWidth: 1,
    cornerRadius: 20,
    shadow: {
      blur: 30,
      offsetX: 0,
      offsetY: 10,
      color: "rgba(0, 0, 0, 0.2)",
      opacity: 0.8,
    },
  },
  "neon-glow": {
    fillColor: "rgba(100, 200, 255, 0.2)",
    strokeColor: "rgb(100, 200, 255)",
    strokeWidth: 2,
    shadow: {
      blur: 20,
      offsetX: 0,
      offsetY: 0,
      color: "rgb(100, 200, 255)",
      opacity: 0.6,
    },
  },
  "soft-shadow": {
    fillColor: "rgba(59, 130, 246, 0.8)",
    strokeColor: "transparent",
    shadow: {
      blur: 40,
      offsetX: 5,
      offsetY: 10,
      color: "rgba(0, 0, 0, 0.3)",
      opacity: 1,
    },
  },
  "gradient-vibrant": {
    gradient: {
      enabled: true,
      type: "linear",
      angle: 45,
      color1: "rgb(255, 100, 150)",
      color2: "rgb(100, 200, 255)",
    },
    cornerRadius: 10,
  },
  "dark-minimal": {
    fillColor: "rgb(30, 40, 50)",
    strokeColor: "rgb(100, 110, 120)",
    strokeWidth: 1,
    opacity: 0.9,
  },
}

export function AdvancedShapesEditor({
  open,
  onOpenChange,
  selectedShape,
  onUpdateShape,
  onDeleteShape,
}: AdvancedShapesEditorProps) {
  const [shape, setShape] = useState<ShapeProperties | null>(selectedShape)

  const handleUpdate = (updates: Partial<ShapeProperties>) => {
    if (!shape) return
    const updated = { ...shape, ...updates }
    setShape(updated)
    if (onUpdateShape) onUpdateShape(updated)
  }

  const applyPreset = (preset: Partial<ShapeProperties>) => {
    if (!shape) return
    const updated = { ...shape, ...preset }
    setShape(updated)
    if (onUpdateShape) onUpdateShape(updated)
  }

  if (!shape) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-gray-900/95 border-gray-800 text-gray-100 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-purple-300">Shape Editor</DialogTitle>
          <DialogDescription className="text-gray-400">
            Advanced shape properties and effects
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="properties" className="w-full">
          <TabsList className="bg-gray-800/50 border border-gray-700/50">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="appearance">Appearance</TabsTrigger>
            <TabsTrigger value="effects">Effects</TabsTrigger>
            <TabsTrigger value="presets">Presets</TabsTrigger>
          </TabsList>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-300">Position X</Label>
                <Input
                  type="number"
                  value={Math.round(shape.x)}
                  onChange={(e) => handleUpdate({ x: Number(e.target.value) })}
                  className="bg-gray-800 border-gray-700 text-gray-100 mt-1"
                />
              </div>
              <div>
                <Label className="text-gray-300">Position Y</Label>
                <Input
                  type="number"
                  value={Math.round(shape.y)}
                  onChange={(e) => handleUpdate({ y: Number(e.target.value) })}
                  className="bg-gray-800 border-gray-700 text-gray-100 mt-1"
                />
              </div>
              <div>
                <Label className="text-gray-300">Width</Label>
                <Input
                  type="number"
                  value={Math.round(shape.width)}
                  onChange={(e) => handleUpdate({ width: Number(e.target.value) })}
                  className="bg-gray-800 border-gray-700 text-gray-100 mt-1"
                />
              </div>
              <div>
                <Label className="text-gray-300">Height</Label>
                <Input
                  type="number"
                  value={Math.round(shape.height)}
                  onChange={(e) => handleUpdate({ height: Number(e.target.value) })}
                  className="bg-gray-800 border-gray-700 text-gray-100 mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300 flex items-center gap-2">
                <RotateCw className="h-4 w-4" />
                Rotation: {shape.rotation}°
              </Label>
              <Slider
                value={[shape.rotation]}
                onValueChange={(value) => handleUpdate({ rotation: value[0] })}
                min={0}
                max={360}
                step={1}
                className="mt-2"
              />
            </div>

            {shape.type !== "circle" && shape.type !== "polygon" && (
              <div>
                <Label className="text-gray-300">Corner Radius</Label>
                <Slider
                  value={[shape.cornerRadius]}
                  onValueChange={(value) => handleUpdate({ cornerRadius: value[0] })}
                  min={0}
                  max={50}
                  step={1}
                  className="mt-2"
                />
              </div>
            )}
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6 mt-4">
            <div>
              <Label className="text-gray-300">Fill Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  value={shape.fillColor.startsWith("rgba") ? "#3b82f6" : shape.fillColor}
                  onChange={(e) => handleUpdate({ fillColor: e.target.value })}
                  className="bg-gray-800 border-gray-700 w-16 h-10"
                />
                <Input
                  type="text"
                  value={shape.fillColor}
                  onChange={(e) => handleUpdate({ fillColor: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-gray-100 flex-1"
                  placeholder="Color or rgba(r,g,b,a)"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Stroke Color</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="color"
                  value={shape.strokeColor.startsWith("rgba") ? "#06b6d4" : shape.strokeColor}
                  onChange={(e) => handleUpdate({ strokeColor: e.target.value })}
                  className="bg-gray-800 border-gray-700 w-16 h-10"
                />
                <Input
                  type="text"
                  value={shape.strokeColor}
                  onChange={(e) => handleUpdate({ strokeColor: e.target.value })}
                  className="bg-gray-800 border-gray-700 text-gray-100 flex-1"
                  placeholder="Color or transparent"
                />
              </div>
            </div>

            <div>
              <Label className="text-gray-300">Stroke Width: {shape.strokeWidth}px</Label>
              <Slider
                value={[shape.strokeWidth]}
                onValueChange={(value) => handleUpdate({ strokeWidth: value[0] })}
                min={0}
                max={10}
                step={0.5}
                className="mt-2"
              />
            </div>

            <div>
              <Label className="text-gray-300">Opacity: {Math.round(shape.opacity * 100)}%</Label>
              <Slider
                value={[shape.opacity]}
                onValueChange={(value) => handleUpdate({ opacity: value[0] })}
                min={0}
                max={1}
                step={0.01}
                className="mt-2"
              />
            </div>
          </TabsContent>

          {/* Effects Tab */}
          <TabsContent value="effects" className="space-y-6 mt-4">
            <div className="border border-gray-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-200 mb-4">Shadow</h3>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Blur: {shape.shadow.blur}px</Label>
                  <Slider
                    value={[shape.shadow.blur]}
                    onValueChange={(value) =>
                      handleUpdate({
                        shadow: { ...shape.shadow, blur: value[0] },
                      })
                    }
                    min={0}
                    max={50}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Offset X</Label>
                    <Input
                      type="number"
                      value={shape.shadow.offsetX}
                      onChange={(e) =>
                        handleUpdate({
                          shadow: { ...shape.shadow, offsetX: Number(e.target.value) },
                        })
                      }
                      className="bg-gray-800 border-gray-700 text-gray-100 mt-1"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Offset Y</Label>
                    <Input
                      type="number"
                      value={shape.shadow.offsetY}
                      onChange={(e) =>
                        handleUpdate({
                          shadow: { ...shape.shadow, offsetY: Number(e.target.value) },
                        })
                      }
                      className="bg-gray-800 border-gray-700 text-gray-100 mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300">Shadow Opacity</Label>
                  <Slider
                    value={[shape.shadow.opacity]}
                    onValueChange={(value) =>
                      handleUpdate({
                        shadow: { ...shape.shadow, opacity: value[0] },
                      })
                    }
                    min={0}
                    max={1}
                    step={0.1}
                    className="mt-2"
                  />
                </div>
              </div>
            </div>

            <div className="border border-gray-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
                <Palette className="h-5 w-5 text-purple-400" />
                Gradient
              </h3>
              <div className="space-y-4">
                <Button
                  variant={shape.gradient.enabled ? "default" : "outline"}
                  onClick={() =>
                    handleUpdate({
                      gradient: { ...shape.gradient, enabled: !shape.gradient.enabled },
                    })
                  }
                  className="w-full"
                >
                  {shape.gradient.enabled ? "Disable Gradient" : "Enable Gradient"}
                </Button>

                {shape.gradient.enabled && (
                  <>
                    <div>
                      <Label className="text-gray-300">Type</Label>
                      <div className="flex gap-2 mt-2">
                        {(["linear", "radial"] as const).map((type) => (
                          <Button
                            key={type}
                            variant={shape.gradient.type === type ? "default" : "outline"}
                            onClick={() =>
                              handleUpdate({
                                gradient: { ...shape.gradient, type },
                              })
                            }
                            className="flex-1"
                          >
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {shape.gradient.type === "linear" && (
                      <div>
                        <Label className="text-gray-300">Angle: {shape.gradient.angle}°</Label>
                        <Slider
                          value={[shape.gradient.angle]}
                          onValueChange={(value) =>
                            handleUpdate({
                              gradient: { ...shape.gradient, angle: value[0] },
                            })
                          }
                          min={0}
                          max={360}
                          step={15}
                          className="mt-2"
                        />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-gray-300">Color 1</Label>
                        <Input
                          type="color"
                          value={shape.gradient.color1}
                          onChange={(e) =>
                            handleUpdate({
                              gradient: { ...shape.gradient, color1: e.target.value },
                            })
                          }
                          className="bg-gray-800 border-gray-700 w-full h-10 mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Color 2</Label>
                        <Input
                          type="color"
                          value={shape.gradient.color2}
                          onChange={(e) =>
                            handleUpdate({
                              gradient: { ...shape.gradient, color2: e.target.value },
                            })
                          }
                          className="bg-gray-800 border-gray-700 w-full h-10 mt-1"
                        />
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Presets Tab */}
          <TabsContent value="presets" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(SHAPE_PRESETS).map(([name, preset]) => (
                <Button
                  key={name}
                  variant="outline"
                  className="h-24 border-gray-700 hover:border-purple-500 hover:bg-purple-500/10"
                  onClick={() => applyPreset(preset)}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Airplay className="h-5 w-5 text-purple-400" />
                    <span className="text-sm capitalize">{name.replace("-", " ")}</span>
                  </div>
                </Button>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-6 pt-4 border-t border-gray-700/50">
          <Button
            variant="outline"
            className="flex-1 border-gray-700 hover:bg-gray-800"
            onClick={() => onDeleteShape?.()}
            disabled={!onDeleteShape}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete Shape
          </Button>
          <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
