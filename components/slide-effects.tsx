"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { 
  Sparkles, 
  Tv, 
  Zap, 
  Layers, 
  Film, 
  Blend, 
  SunDim,
  Waves,
  Grid3X3,
  CircleDot,
  Scan,
  MonitorPlay,
  RotateCcw,
  Check,
  Eye,
  EyeOff,
} from "lucide-react"
import type { Slide } from "@/types/editor"

export interface SlideEffect {
  id: string
  name: string
  type: "grain" | "vhs" | "glitch" | "scanlines" | "chromatic" | "noise" | "blur" | "vignette" | "crt" | "duotone" | "pixelate" | "rgb-shift"
  enabled: boolean
  intensity: number
  settings?: Record<string, number | string | boolean>
}

interface SlideEffectsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentSlide: Slide
  onApplyEffects: (effects: SlideEffect[]) => void
}

const EFFECT_PRESETS: { category: string; effects: Omit<SlideEffect, "enabled">[] }[] = [
  {
    category: "Retro & Vintage",
    effects: [
      {
        id: "grain",
        name: "Film Grain",
        type: "grain",
        intensity: 50,
        settings: { size: 1.5, animated: true, blend: "overlay" },
      },
      {
        id: "vhs",
        name: "VHS Effect",
        type: "vhs",
        intensity: 60,
        settings: { 
          tracking: 0.3, 
          noise: 0.4, 
          colorBleed: 0.5, 
          scanlines: true,
          distortion: 0.2,
        },
      },
      {
        id: "crt",
        name: "CRT Monitor",
        type: "crt",
        intensity: 45,
        settings: { 
          curvature: 0.3, 
          scanlineIntensity: 0.4, 
          bloom: 0.2,
          flickerSpeed: 0.05,
        },
      },
      {
        id: "scanlines",
        name: "Scanlines",
        type: "scanlines",
        intensity: 40,
        settings: { spacing: 2, thickness: 1, animated: false },
      },
    ],
  },
  {
    category: "Glitch & Digital",
    effects: [
      {
        id: "glitch",
        name: "Digital Glitch",
        type: "glitch",
        intensity: 55,
        settings: { 
          sliceCount: 8, 
          rgbShift: 0.5, 
          frequency: 0.3,
          blockSize: 0.1,
          animated: true,
        },
      },
      {
        id: "chromatic",
        name: "Chromatic Aberration",
        type: "chromatic",
        intensity: 35,
        settings: { offset: 3, angle: 45, animated: false },
      },
      {
        id: "rgb-shift",
        name: "RGB Shift",
        type: "rgb-shift",
        intensity: 40,
        settings: { 
          redOffset: { x: 2, y: 0 }, 
          greenOffset: { x: -1, y: 1 }, 
          blueOffset: { x: 0, y: -2 },
        },
      },
      {
        id: "pixelate",
        name: "Pixelate",
        type: "pixelate",
        intensity: 30,
        settings: { blockSize: 8, smoothing: false },
      },
    ],
  },
  {
    category: "Atmosphere",
    effects: [
      {
        id: "noise",
        name: "Static Noise",
        type: "noise",
        intensity: 25,
        settings: { monochrome: true, animated: true, speed: 1 },
      },
      {
        id: "blur",
        name: "Gaussian Blur",
        type: "blur",
        intensity: 20,
        settings: { radius: 5, type: "gaussian" },
      },
      {
        id: "vignette",
        name: "Vignette",
        type: "vignette",
        intensity: 50,
        settings: { radius: 0.7, softness: 0.5, color: "#000000" },
      },
      {
        id: "duotone",
        name: "Duotone",
        type: "duotone",
        intensity: 70,
        settings: { 
          highlightColor: "#ff6b6b", 
          shadowColor: "#1a1a2e",
          contrast: 1.2,
        },
      },
    ],
  },
]

const QUICK_PRESETS = [
  {
    name: "80s Synthwave",
    effects: ["grain", "scanlines", "chromatic"],
    intensities: { grain: 40, scanlines: 30, chromatic: 45 },
  },
  {
    name: "VHS Tape",
    effects: ["vhs", "noise", "vignette"],
    intensities: { vhs: 70, noise: 25, vignette: 40 },
  },
  {
    name: "Cyberpunk",
    effects: ["glitch", "rgb-shift", "scanlines"],
    intensities: { glitch: 50, "rgb-shift": 35, scanlines: 25 },
  },
  {
    name: "Lo-Fi Dreams",
    effects: ["grain", "blur", "duotone"],
    intensities: { grain: 60, blur: 15, duotone: 50 },
  },
  {
    name: "Retro TV",
    effects: ["crt", "noise", "vignette"],
    intensities: { crt: 55, noise: 30, vignette: 45 },
  },
  {
    name: "Digital Decay",
    effects: ["glitch", "pixelate", "chromatic"],
    intensities: { glitch: 40, pixelate: 20, chromatic: 30 },
  },
]

export function SlideEffects({ open, onOpenChange, currentSlide, onApplyEffects }: SlideEffectsProps) {
  const [activeEffects, setActiveEffects] = useState<SlideEffect[]>(
    (currentSlide as any)?.effects || []
  )
  const [previewEnabled, setPreviewEnabled] = useState(true)
  const [activeTab, setActiveTab] = useState("effects")

  const toggleEffect = (effect: Omit<SlideEffect, "enabled">) => {
    const existingIndex = activeEffects.findIndex(e => e.id === effect.id)
    if (existingIndex >= 0) {
      setActiveEffects(prev => prev.filter(e => e.id !== effect.id))
    } else {
      setActiveEffects(prev => [...prev, { ...effect, enabled: true }])
    }
  }

  const updateEffectIntensity = (effectId: string, intensity: number) => {
    setActiveEffects(prev => 
      prev.map(e => e.id === effectId ? { ...e, intensity } : e)
    )
  }

  const updateEffectSetting = (effectId: string, key: string, value: any) => {
    setActiveEffects(prev => 
      prev.map(e => e.id === effectId 
        ? { ...e, settings: { ...e.settings, [key]: value } } 
        : e
      )
    )
  }

  const applyQuickPreset = (preset: typeof QUICK_PRESETS[0]) => {
    const newEffects: SlideEffect[] = preset.effects.map(effectId => {
      const effectData = EFFECT_PRESETS
        .flatMap(cat => cat.effects)
        .find(e => e.id === effectId)
      
      if (effectData) {
        return {
          ...effectData,
          enabled: true,
          intensity: (preset.intensities as any)[effectId] || effectData.intensity,
        }
      }
      return null
    }).filter(Boolean) as SlideEffect[]

    setActiveEffects(newEffects)
  }

  const resetEffects = () => {
    setActiveEffects([])
  }

  const handleApply = () => {
    onApplyEffects(activeEffects)
    onOpenChange(false)
  }

  const isEffectActive = (effectId: string) => 
    activeEffects.some(e => e.id === effectId)

  const getEffectIcon = (type: SlideEffect["type"]) => {
    switch (type) {
      case "grain": return <Grid3X3 className="h-4 w-4" />
      case "vhs": return <Tv className="h-4 w-4" />
      case "glitch": return <Zap className="h-4 w-4" />
      case "scanlines": return <Scan className="h-4 w-4" />
      case "chromatic": return <Blend className="h-4 w-4" />
      case "noise": return <Waves className="h-4 w-4" />
      case "blur": return <SunDim className="h-4 w-4" />
      case "vignette": return <CircleDot className="h-4 w-4" />
      case "crt": return <MonitorPlay className="h-4 w-4" />
      case "duotone": return <Layers className="h-4 w-4" />
      case "pixelate": return <Grid3X3 className="h-4 w-4" />
      case "rgb-shift": return <Sparkles className="h-4 w-4" />
      default: return <Film className="h-4 w-4" />
    }
  }

  // Generate CSS for effect preview
  const getEffectCSS = () => {
    if (!previewEnabled || activeEffects.length === 0) return {}

    let filter = ""
    let mixBlendMode = "normal"
    let opacity = 1

    activeEffects.forEach(effect => {
      const i = effect.intensity / 100
      switch (effect.type) {
        case "grain":
          // Handled via overlay
          break
        case "blur":
          filter += ` blur(${i * 10}px)`
          break
        case "vignette":
          // Handled via overlay
          break
        case "duotone":
          filter += ` sepia(${i}) saturate(${1.5 * i}) hue-rotate(${i * 30}deg)`
          break
        case "chromatic":
        case "rgb-shift":
          // Complex - would need shader
          break
      }
    })

    return { filter: filter.trim() || undefined }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl h-[90vh] p-0 overflow-hidden border-0 bg-transparent">
        {/* Liquid Glass Container */}
        <div className="relative h-full w-full rounded-3xl overflow-hidden">
          {/* Glass Background Layers */}
          <div className="absolute inset-0 bg-gradient-to-br from-gray-900/80 via-gray-900/90 to-black/95" />
          <div className="absolute inset-0 backdrop-blur-2xl" />
          <div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-cyan-500/10" />
          
          {/* Animated Gradient Orbs */}
          <div className="absolute -top-40 -left-40 w-80 h-80 bg-purple-500/20 rounded-full blur-[100px] animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-cyan-500/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />

          {/* Glass Border */}
          <div className="absolute inset-0 rounded-3xl border border-white/10" />
          <div className="absolute inset-[1px] rounded-3xl border border-white/5" />

          {/* Content */}
          <div className="relative h-full flex flex-col z-10">
            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-white/10">
              <DialogHeader>
                <DialogTitle className="text-3xl font-bold bg-gradient-to-r from-purple-300 via-pink-300 to-cyan-300 bg-clip-text text-transparent flex items-center gap-3">
                  <div className="p-2.5 rounded-2xl bg-gradient-to-br from-purple-500/30 to-pink-500/30 border border-white/10">
                    <Film className="h-7 w-7 text-purple-300" />
                  </div>
                  Slide Effects Studio
                </DialogTitle>
                <DialogDescription className="text-gray-400 text-base mt-2">
                  Add cinematic effects like grain, VHS, glitch, and more to your slides
                </DialogDescription>
              </DialogHeader>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
              {/* Preview Panel */}
              <div className="w-[45%] p-6 border-r border-white/10 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-200">Preview</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPreviewEnabled(!previewEnabled)}
                    className="text-gray-400 hover:text-white hover:bg-white/10"
                  >
                    {previewEnabled ? (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        Effects On
                      </>
                    ) : (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Effects Off
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Slide Preview */}
                <div className="flex-1 relative rounded-2xl overflow-hidden border border-white/10 bg-black/40">
                  <div 
                    className="absolute inset-4 rounded-xl overflow-hidden"
                    style={{
                      background: currentSlide?.background?.type === "gradient" 
                        ? currentSlide.background.value 
                        : currentSlide?.background?.value || "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
                      ...getEffectCSS(),
                    }}
                  >
                    {/* Grain Overlay */}
                    {previewEnabled && activeEffects.some(e => e.type === "grain") && (
                      <div 
                        className="absolute inset-0 pointer-events-none opacity-30 mix-blend-overlay"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                          opacity: (activeEffects.find(e => e.type === "grain")?.intensity || 50) / 100 * 0.5,
                        }}
                      />
                    )}
                    
                    {/* VHS Lines */}
                    {previewEnabled && activeEffects.some(e => e.type === "vhs" || e.type === "scanlines") && (
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `repeating-linear-gradient(
                            0deg,
                            transparent,
                            transparent 2px,
                            rgba(0,0,0,0.1) 2px,
                            rgba(0,0,0,0.1) 4px
                          )`,
                          opacity: (activeEffects.find(e => e.type === "vhs" || e.type === "scanlines")?.intensity || 50) / 100 * 0.6,
                        }}
                      />
                    )}

                    {/* Vignette */}
                    {previewEnabled && activeEffects.some(e => e.type === "vignette") && (
                      <div 
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: `radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)`,
                          opacity: (activeEffects.find(e => e.type === "vignette")?.intensity || 50) / 100,
                        }}
                      />
                    )}

                    {/* Glitch Effect */}
                    {previewEnabled && activeEffects.some(e => e.type === "glitch") && (
                      <div className="absolute inset-0 pointer-events-none animate-pulse">
                        <div 
                          className="absolute top-1/4 left-0 right-0 h-2 bg-cyan-500/30"
                          style={{
                            transform: `translateX(${Math.random() * 10 - 5}px)`,
                            opacity: (activeEffects.find(e => e.type === "glitch")?.intensity || 50) / 100 * 0.5,
                          }}
                        />
                        <div 
                          className="absolute top-1/2 left-0 right-0 h-1 bg-pink-500/30"
                          style={{
                            transform: `translateX(${Math.random() * 10 - 5}px)`,
                            opacity: (activeEffects.find(e => e.type === "glitch")?.intensity || 50) / 100 * 0.5,
                          }}
                        />
                      </div>
                    )}

                    {/* Sample Content */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                        <h2 className="text-3xl font-bold text-white mb-2">Preview Slide</h2>
                        <p className="text-gray-400">Effects will apply to your slides</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Active Effects */}
                {activeEffects.length > 0 && (
                  <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium text-gray-300">
                        Active Effects ({activeEffects.length})
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={resetEffects}
                        className="h-7 text-xs text-gray-400 hover:text-white"
                      >
                        <RotateCcw className="h-3 w-3 mr-1" />
                        Reset All
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {activeEffects.map(effect => (
                        <div
                          key={effect.id}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-300 text-sm"
                        >
                          {getEffectIcon(effect.type)}
                          <span>{effect.name}</span>
                          <span className="text-purple-400/60">{effect.intensity}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Effects Panel */}
              <div className="flex-1 flex flex-col overflow-hidden">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                  <div className="px-6 pt-4">
                    <TabsList className="bg-white/5 border border-white/10 p-1 rounded-xl">
                      <TabsTrigger 
                        value="effects" 
                        className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 rounded-lg px-4"
                      >
                        <Film className="h-4 w-4 mr-2" />
                        Effects
                      </TabsTrigger>
                      <TabsTrigger 
                        value="presets" 
                        className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 rounded-lg px-4"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        Quick Presets
                      </TabsTrigger>
                      <TabsTrigger 
                        value="settings" 
                        className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300 rounded-lg px-4"
                      >
                        <Layers className="h-4 w-4 mr-2" />
                        Fine Tune
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  {/* Effects Tab */}
                  <TabsContent value="effects" className="flex-1 overflow-hidden px-6 pb-6 mt-4">
                    <ScrollArea className="h-full pr-2 [&>[data-radix-scroll-area-viewport]]:!overflow-y-scroll [&_[data-radix-scroll-area-scrollbar]]:!flex [&_[data-radix-scroll-area-scrollbar]]:!w-2.5 [&_[data-radix-scroll-area-scrollbar]]:!bg-white/5 [&_[data-radix-scroll-area-thumb]]:!bg-purple-500/40 [&_[data-radix-scroll-area-thumb]]:hover:!bg-purple-500/60 [&_[data-radix-scroll-area-thumb]]:!rounded-full">
                      <div className="space-y-6 pr-2">
                        {EFFECT_PRESETS.map((category) => (
                          <div key={category.category}>
                            <h4 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
                              {category.category}
                            </h4>
                            <div className="grid grid-cols-2 gap-3">
                              {category.effects.map((effect) => {
                                const isActive = isEffectActive(effect.id)
                                return (
                                  <button
                                    key={effect.id}
                                    onClick={() => toggleEffect(effect)}
                                    className={`
                                      relative p-4 rounded-xl border text-left transition-all duration-300
                                      ${isActive 
                                        ? "bg-purple-500/20 border-purple-500/50 shadow-lg shadow-purple-500/10" 
                                        : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                      }
                                    `}
                                  >
                                    {isActive && (
                                      <div className="absolute top-2 right-2 p-1 rounded-full bg-purple-500">
                                        <Check className="h-3 w-3 text-white" />
                                      </div>
                                    )}
                                    <div className={`mb-2 p-2 rounded-lg w-fit ${isActive ? "bg-purple-500/30" : "bg-white/10"}`}>
                                      {getEffectIcon(effect.type)}
                                    </div>
                                    <h5 className={`font-medium mb-1 ${isActive ? "text-purple-200" : "text-gray-200"}`}>
                                      {effect.name}
                                    </h5>
                                    <p className="text-xs text-gray-500">
                                      Default: {effect.intensity}%
                                    </p>
                                  </button>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Quick Presets Tab */}
                  <TabsContent value="presets" className="flex-1 overflow-hidden px-6 pb-6 mt-4">
                    <ScrollArea className="h-full pr-2 [&>[data-radix-scroll-area-viewport]]:!overflow-y-scroll [&_[data-radix-scroll-area-scrollbar]]:!flex [&_[data-radix-scroll-area-scrollbar]]:!w-2.5 [&_[data-radix-scroll-area-scrollbar]]:!bg-white/5 [&_[data-radix-scroll-area-thumb]]:!bg-purple-500/40 [&_[data-radix-scroll-area-thumb]]:hover:!bg-purple-500/60 [&_[data-radix-scroll-area-thumb]]:!rounded-full">
                      <div className="grid grid-cols-2 gap-4 pr-2">
                        {QUICK_PRESETS.map((preset, index) => (
                          <button
                            key={preset.name}
                            onClick={() => applyQuickPreset(preset)}
                            className="group relative p-5 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-purple-500/50 transition-all duration-300 text-left overflow-hidden"
                          >
                            {/* Hover Glow */}
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:to-pink-500/10 transition-all duration-500" />
                            
                            <div className="relative">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-white/10">
                                  <Sparkles className="h-5 w-5 text-purple-300" />
                                </div>
                                <h4 className="font-semibold text-gray-200 group-hover:text-white transition-colors">
                                  {preset.name}
                                </h4>
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {preset.effects.map((effectId) => (
                                  <span
                                    key={effectId}
                                    className="px-2 py-1 text-xs rounded-full bg-white/10 text-gray-400 capitalize"
                                  >
                                    {effectId.replace("-", " ")}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>

                  {/* Fine Tune Tab */}
                  <TabsContent value="settings" className="flex-1 overflow-hidden px-6 pb-6 mt-4">
                    <ScrollArea className="h-full pr-2 [&>[data-radix-scroll-area-viewport]]:!overflow-y-scroll [&_[data-radix-scroll-area-scrollbar]]:!flex [&_[data-radix-scroll-area-scrollbar]]:!w-2.5 [&_[data-radix-scroll-area-scrollbar]]:!bg-white/5 [&_[data-radix-scroll-area-thumb]]:!bg-purple-500/40 [&_[data-radix-scroll-area-thumb]]:hover:!bg-purple-500/60 [&_[data-radix-scroll-area-thumb]]:!rounded-full">
                      {activeEffects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 mb-4">
                            <Layers className="h-8 w-8 text-gray-500" />
                          </div>
                          <h4 className="text-lg font-medium text-gray-300 mb-2">No Effects Selected</h4>
                          <p className="text-gray-500 text-sm max-w-xs">
                            Select effects from the Effects tab to adjust their settings here
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4 pr-2">
                          {activeEffects.map((effect) => (
                            <div
                              key={effect.id}
                              className="p-4 rounded-xl bg-white/5 border border-white/10"
                            >
                              <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 rounded-lg bg-purple-500/20">
                                    {getEffectIcon(effect.type)}
                                  </div>
                                  <div>
                                    <h5 className="font-medium text-gray-200">{effect.name}</h5>
                                    <p className="text-xs text-gray-500">{effect.type}</p>
                                  </div>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => toggleEffect(effect)}
                                  className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                >
                                  Remove
                                </Button>
                              </div>

                              {/* Intensity Slider */}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <Label className="text-sm text-gray-400">Intensity</Label>
                                  <span className="text-sm text-purple-300 font-medium">
                                    {effect.intensity}%
                                  </span>
                                </div>
                                <Slider
                                  value={[effect.intensity]}
                                  onValueChange={([value]) => updateEffectIntensity(effect.id, value)}
                                  max={100}
                                  step={1}
                                  className="[&_[role=slider]]:bg-purple-500 [&_[role=slider]]:border-purple-400 [&_.bg-primary]:bg-purple-500"
                                />
                              </div>

                              {/* Effect-specific settings */}
                              {effect.settings && Object.keys(effect.settings).length > 0 && (
                                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                                  {Object.entries(effect.settings).map(([key, value]) => {
                                    if (typeof value === "boolean") {
                                      return (
                                        <div key={key} className="flex items-center justify-between">
                                          <Label className="text-sm text-gray-400 capitalize">
                                            {key.replace(/([A-Z])/g, " $1").trim()}
                                          </Label>
                                          <Switch
                                            checked={value}
                                            onCheckedChange={(checked) => 
                                              updateEffectSetting(effect.id, key, checked)
                                            }
                                          />
                                        </div>
                                      )
                                    }
                                    if (typeof value === "number") {
                                      return (
                                        <div key={key} className="space-y-2">
                                          <div className="flex items-center justify-between">
                                            <Label className="text-sm text-gray-400 capitalize">
                                              {key.replace(/([A-Z])/g, " $1").trim()}
                                            </Label>
                                            <span className="text-xs text-gray-500">
                                              {value.toFixed(2)}
                                            </span>
                                          </div>
                                          <Slider
                                            value={[value * 100]}
                                            onValueChange={([v]) => 
                                              updateEffectSetting(effect.id, key, v / 100)
                                            }
                                            max={100}
                                            step={1}
                                            className="[&_[role=slider]]:bg-gray-500 [&_[role=slider]]:border-gray-400"
                                          />
                                        </div>
                                      )
                                    }
                                    return null
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-white/10 flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={resetEffects}
                className="text-gray-400 hover:text-white hover:bg-white/10"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset All
              </Button>
              <div className="flex gap-3">
                <Button
                  variant="ghost"
                  onClick={() => onOpenChange(false)}
                  className="text-gray-400 hover:text-white hover:bg-white/10 px-6"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleApply}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 rounded-xl shadow-lg shadow-purple-500/25"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Apply Effects
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
