"use client"

import { Slider } from "@/components/ui/slider"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import type { ImageElement } from "@/types/editor"
import { RotateCcw } from "lucide-react"
import { ColorPicker } from "./color-picker"

interface ImageFiltersProps {
  element: ImageElement
  onUpdateElement: (id: string, updates: Record<string, any>) => void
}

export function ImageFilters({ element, onUpdateElement }: ImageFiltersProps) {
  const filters = element.filters || {
    grayscale: 0,
    sepia: 0,
    blur: 0,
    brightness: 100,
    contrast: 100,
    hueRotate: 0,
    saturate: 100,
    opacity: 100,
  }

  const effects = element.effects || {
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
  }

  const updateFilter = (filterName: string, value: number) => {
    onUpdateElement(element.id, {
      filters: {
        ...filters,
        [filterName]: value,
      },
    })
  }

  const updateEffect = (effectName: string, value: any) => {
    onUpdateElement(element.id, {
      effects: {
        ...effects,
        [effectName]: value,
      },
    })
  }

  const resetFilters = () => {
    onUpdateElement(element.id, {
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
    })
  }

  const resetEffects = () => {
    onUpdateElement(element.id, {
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
    })
  }

  return (
    <Tabs defaultValue="filters" className="w-full">
      <TabsList className="grid grid-cols-2 bg-gray-800">
        <TabsTrigger value="filters" className="text-gray-300 data-[state=active]:bg-gray-700">
          Filters
        </TabsTrigger>
        <TabsTrigger value="effects" className="text-gray-300 data-[state=active]:bg-gray-700">
          Effects
        </TabsTrigger>
      </TabsList>

      <TabsContent value="filters" className="space-y-3 mt-2">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-300">Image Filters</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-7 text-xs text-gray-400 hover:text-gray-100"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-[100px_1fr_40px] items-center gap-2">
            <span className="text-xs text-gray-400">Grayscale</span>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[filters.grayscale || 0]}
              onValueChange={([value]) => updateFilter("grayscale", value)}
              className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-sky-400 [&>span:first-child_span]:bg-sky-400"
            />
            <span className="text-xs text-gray-300 text-right">{filters.grayscale || 0}%</span>
          </div>

          <div className="grid grid-cols-[100px_1fr_40px] items-center gap-2">
            <span className="text-xs text-gray-400">Sepia</span>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[filters.sepia || 0]}
              onValueChange={([value]) => updateFilter("sepia", value)}
              className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-sky-400 [&>span:first-child_span]:bg-sky-400"
            />
            <span className="text-xs text-gray-300 text-right">{filters.sepia || 0}%</span>
          </div>

          <div className="grid grid-cols-[100px_1fr_40px] items-center gap-2">
            <span className="text-xs text-gray-400">Blur</span>
            <Slider
              min={0}
              max={20}
              step={0.5}
              value={[filters.blur || 0]}
              onValueChange={([value]) => updateFilter("blur", value)}
              className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-sky-400 [&>span:first-child_span]:bg-sky-400"
            />
            <span className="text-xs text-gray-300 text-right">{filters.blur || 0}px</span>
          </div>

          <div className="grid grid-cols-[100px_1fr_40px] items-center gap-2">
            <span className="text-xs text-gray-400">Brightness</span>
            <Slider
              min={0}
              max={200}
              step={5}
              value={[filters.brightness || 100]}
              onValueChange={([value]) => updateFilter("brightness", value)}
              className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-sky-400 [&>span:first-child_span]:bg-sky-400"
            />
            <span className="text-xs text-gray-300 text-right">{filters.brightness || 100}%</span>
          </div>

          <div className="grid grid-cols-[100px_1fr_40px] items-center gap-2">
            <span className="text-xs text-gray-400">Contrast</span>
            <Slider
              min={0}
              max={200}
              step={5}
              value={[filters.contrast || 100]}
              onValueChange={([value]) => updateFilter("contrast", value)}
              className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-sky-400 [&>span:first-child_span]:bg-sky-400"
            />
            <span className="text-xs text-gray-300 text-right">{filters.contrast || 100}%</span>
          </div>

          <div className="grid grid-cols-[100px_1fr_40px] items-center gap-2">
            <span className="text-xs text-gray-400">Hue Rotate</span>
            <Slider
              min={0}
              max={360}
              step={5}
              value={[filters.hueRotate || 0]}
              onValueChange={([value]) => updateFilter("hueRotate", value)}
              className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-sky-400 [&>span:first-child_span]:bg-sky-400"
            />
            <span className="text-xs text-gray-300 text-right">{filters.hueRotate || 0}°</span>
          </div>

          <div className="grid grid-cols-[100px_1fr_40px] items-center gap-2">
            <span className="text-xs text-gray-400">Saturation</span>
            <Slider
              min={0}
              max={200}
              step={5}
              value={[filters.saturate || 100]}
              onValueChange={([value]) => updateFilter("saturate", value)}
              className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-sky-400 [&>span:first-child_span]:bg-sky-400"
            />
            <span className="text-xs text-gray-300 text-right">{filters.saturate || 100}%</span>
          </div>

          <div className="grid grid-cols-[100px_1fr_40px] items-center gap-2">
            <span className="text-xs text-gray-400">Opacity</span>
            <Slider
              min={0}
              max={100}
              step={1}
              value={[filters.opacity || 100]}
              onValueChange={([value]) => updateFilter("opacity", value)}
              className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-sky-400 [&>span:first-child_span]:bg-sky-400"
            />
            <span className="text-xs text-gray-300 text-right">{filters.opacity || 100}%</span>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="effects" className="space-y-3 mt-2">
        <div className="flex justify-between items-center">
          <h4 className="text-sm font-medium text-gray-300">Image Effects</h4>
          <Button
            variant="ghost"
            size="sm"
            onClick={resetEffects}
            className="h-7 text-xs text-gray-400 hover:text-gray-100"
          >
            <RotateCcw className="h-3 w-3 mr-1" />
            Reset
          </Button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-[100px_1fr_40px] items-center gap-2">
            <span className="text-xs text-gray-400">Border Radius</span>
            <Slider
              min={0}
              max={50}
              step={1}
              value={[effects.borderRadius || 0]}
              onValueChange={([value]) => updateEffect("borderRadius", value)}
              className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-green-400 [&>span:first-child_span]:bg-green-400"
            />
            <span className="text-xs text-gray-300 text-right">{effects.borderRadius || 0}%</span>
          </div>

          <div className="grid grid-cols-[100px_1fr_40px] items-center gap-2">
            <span className="text-xs text-gray-400">Border Width</span>
            <Slider
              min={0}
              max={20}
              step={1}
              value={[effects.borderWidth || 0]}
              onValueChange={([value]) => updateEffect("borderWidth", value)}
              className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-sky-400 [&>span:first-child_span]:bg-sky-400"
            />
            <span className="text-xs text-gray-300 text-right">{effects.borderWidth || 0}px</span>
          </div>

          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <span className="text-xs text-gray-400">Border Color</span>
            <ColorPicker
              color={effects.borderColor || "#ffffff"}
              onChange={(color) => updateEffect("borderColor", color)}
            />
          </div>

          <div className="grid grid-cols-[100px_1fr_40px] items-center gap-2">
            <span className="text-xs text-gray-400">Shadow Blur</span>
            <Slider
              min={0}
              max={50}
              step={1}
              value={[effects.shadowBlur || 0]}
              onValueChange={([value]) => updateEffect("shadowBlur", value)}
              className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-sky-400 [&>span:first-child_span]:bg-sky-400"
            />
            <span className="text-xs text-gray-300 text-right">{effects.shadowBlur || 0}px</span>
          </div>

          <div className="grid grid-cols-[100px_1fr] items-center gap-2">
            <span className="text-xs text-gray-400">Shadow Color</span>
            <ColorPicker
              color={effects.shadowColor || "#000000"}
              onChange={(color) => updateEffect("shadowColor", color)}
            />
          </div>

          <div className="grid grid-cols-[100px_1fr_40px] items-center gap-2">
            <span className="text-xs text-gray-400">Shadow X</span>
            <Slider
              min={-50}
              max={50}
              step={1}
              value={[effects.shadowOffsetX || 0]}
              onValueChange={([value]) => updateEffect("shadowOffsetX", value)}
              className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-sky-400 [&>span:first-child_span]:bg-sky-400"
            />
            <span className="text-xs text-gray-300 text-right">{effects.shadowOffsetX || 0}px</span>
          </div>

          <div className="grid grid-cols-[100px_1fr_40px] items-center gap-2">
            <span className="text-xs text-gray-400">Shadow Y</span>
            <Slider
              min={-50}
              max={50}
              step={1}
              value={[effects.shadowOffsetY || 0]}
              onValueChange={([value]) => updateEffect("shadowOffsetY", value)}
              className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-sky-400 [&>span:first-child_span]:bg-sky-400"
            />
            <span className="text-xs text-gray-300 text-right">{effects.shadowOffsetY || 0}px</span>
          </div>

          {/* Advanced Image Effects */}
          <div className="pt-3 border-t border-gray-700/50">
            <h5 className="text-xs font-medium text-gray-400 mb-3">Advanced Effects</h5>

            <div className="grid grid-cols-[100px_1fr_40px] items-center gap-2 mb-3">
              <span className="text-xs text-gray-400">Skew X</span>
              <Slider
                min={-45}
                max={45}
                step={1}
                value={[effects.skewX || 0]}
                onValueChange={([value]) => updateEffect("skewX", value)}
                className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-purple-400 [&>span:first-child_span]:bg-purple-400"
              />
              <span className="text-xs text-gray-300 text-right">{effects.skewX || 0}°</span>
            </div>

            <div className="grid grid-cols-[100px_1fr_40px] items-center gap-2 mb-3">
              <span className="text-xs text-gray-400">Skew Y</span>
              <Slider
                min={-45}
                max={45}
                step={1}
                value={[effects.skewY || 0]}
                onValueChange={([value]) => updateEffect("skewY", value)}
                className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-purple-400 [&>span:first-child_span]:bg-purple-400"
              />
              <span className="text-xs text-gray-300 text-right">{effects.skewY || 0}°</span>
            </div>

            <div className="grid grid-cols-[100px_1fr_40px] items-center gap-2">
              <span className="text-xs text-gray-400">Scale</span>
              <Slider
                min={50}
                max={200}
                step={5}
                value={[effects.scale || 100]}
                onValueChange={([value]) => updateEffect("scale", value)}
                className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-yellow-400 [&>span:first-child_span]:bg-yellow-400"
              />
              <span className="text-xs text-gray-300 text-right">{effects.scale || 100}%</span>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}
