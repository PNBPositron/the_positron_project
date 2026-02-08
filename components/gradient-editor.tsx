"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, Trash2, RotateCw, Shuffle, Copy, Check } from "lucide-react"

export interface GradientStop {
  color: string
  position: number
}

export interface GradientConfig {
  type: "linear" | "radial" | "conic"
  angle: number
  stops: GradientStop[]
  // Radial-specific
  radialShape?: "circle" | "ellipse"
  radialPosition?: string
  // Conic-specific
  conicFrom?: number
}

interface GradientEditorProps {
  value: string
  onChange: (cssGradient: string) => void
  showPresets?: boolean
}

const GRADIENT_PRESETS: { name: string; css: string }[] = [
  { name: "Ocean", css: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" },
  { name: "Sunset", css: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)" },
  { name: "Forest", css: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)" },
  { name: "Aurora", css: "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)" },
  { name: "Fire", css: "linear-gradient(135deg, #f83600 0%, #f9d423 100%)" },
  { name: "Midnight", css: "linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)" },
  { name: "Neon", css: "linear-gradient(135deg, #00d2ff 0%, #3a47d5 100%)" },
  { name: "Peach", css: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)" },
  { name: "Emerald", css: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)" },
  { name: "Cosmic", css: "linear-gradient(135deg, #ff00cc 0%, #333399 100%)" },
  { name: "Warm", css: "linear-gradient(135deg, #f5af19 0%, #f12711 100%)" },
  { name: "Cool", css: "linear-gradient(135deg, #2193b0 0%, #6dd5ed 100%)" },
  { name: "Berry", css: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)" },
  { name: "Dusk", css: "linear-gradient(135deg, #a8c0ff 0%, #3f2b96 100%)" },
  { name: "Plasma", css: "radial-gradient(circle at center, #ee0979 0%, #ff6a00 100%)" },
  { name: "Vortex", css: "conic-gradient(from 0deg, #ff0000, #ff7700, #ffff00, #00ff00, #0000ff, #8b00ff, #ff0000)" },
]

function parseGradient(css: string): GradientConfig {
  const config: GradientConfig = {
    type: "linear",
    angle: 135,
    stops: [
      { color: "#667eea", position: 0 },
      { color: "#764ba2", position: 100 },
    ],
  }

  if (!css || !css.includes("gradient")) return config

  if (css.startsWith("radial-gradient")) {
    config.type = "radial"
    const shapeMatch = css.match(/radial-gradient\((circle|ellipse)/)
    config.radialShape = (shapeMatch?.[1] as "circle" | "ellipse") || "circle"
    const posMatch = css.match(/at\s+([^,)]+)/)
    config.radialPosition = posMatch?.[1]?.trim() || "center"
  } else if (css.startsWith("conic-gradient")) {
    config.type = "conic"
    const fromMatch = css.match(/from\s+([\d.]+)deg/)
    config.conicFrom = fromMatch ? Number.parseFloat(fromMatch[1]) : 0
  } else {
    const angleMatch = css.match(/([\d.]+)deg/)
    if (angleMatch) {
      config.angle = Number.parseFloat(angleMatch[1])
    } else if (css.includes("to right")) {
      config.angle = 90
    } else if (css.includes("to left")) {
      config.angle = 270
    } else if (css.includes("to bottom")) {
      config.angle = 180
    } else if (css.includes("to top")) {
      config.angle = 0
    }
  }

  const colorStopRegex = /(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-z]+)\s*([\d.]+%?)?/g
  const stops: GradientStop[] = []
  let match: RegExpExecArray | null = null

  const stopsStr = css.replace(/^[^(]+\(/, "").replace(/\)$/, "")
  const parts = stopsStr.split(",").map((s) => s.trim())

  for (const part of parts) {
    if (part.includes("gradient") || part.includes("deg") || part.includes("from") || part.includes("at ")) continue
    const colorMatch = part.match(/(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\))/)
    const positionMatch = part.match(/([\d.]+)%/)
    if (colorMatch) {
      stops.push({
        color: colorMatch[1],
        position: positionMatch ? Number.parseFloat(positionMatch[1]) : -1,
      })
    }
  }

  if (stops.length >= 2) {
    // Auto-fill positions if not specified
    for (let i = 0; i < stops.length; i++) {
      if (stops[i].position === -1) {
        stops[i].position = (i / (stops.length - 1)) * 100
      }
    }
    config.stops = stops
  }

  return config
}

function buildGradientCSS(config: GradientConfig): string {
  const stopsStr = config.stops
    .sort((a, b) => a.position - b.position)
    .map((s) => `${s.color} ${s.position}%`)
    .join(", ")

  switch (config.type) {
    case "radial":
      return `radial-gradient(${config.radialShape || "circle"} at ${config.radialPosition || "center"}, ${stopsStr})`
    case "conic":
      return `conic-gradient(from ${config.conicFrom || 0}deg, ${stopsStr})`
    default:
      return `linear-gradient(${config.angle}deg, ${stopsStr})`
  }
}

export function GradientEditor({ value, onChange, showPresets = true }: GradientEditorProps) {
  const [config, setConfig] = useState<GradientConfig>(() => parseGradient(value))
  const [selectedStopIndex, setSelectedStopIndex] = useState(0)
  const [copied, setCopied] = useState(false)
  const gradientBarRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  useEffect(() => {
    const parsed = parseGradient(value)
    setConfig(parsed)
  }, [value])

  const updateConfig = useCallback(
    (updates: Partial<GradientConfig>) => {
      const newConfig = { ...config, ...updates }
      setConfig(newConfig)
      onChange(buildGradientCSS(newConfig))
    },
    [config, onChange],
  )

  const updateStop = useCallback(
    (index: number, updates: Partial<GradientStop>) => {
      const newStops = [...config.stops]
      newStops[index] = { ...newStops[index], ...updates }
      updateConfig({ stops: newStops })
    },
    [config.stops, updateConfig],
  )

  const addStop = useCallback(() => {
    const midIndex = Math.floor(config.stops.length / 2)
    const leftStop = config.stops[midIndex - 1] || config.stops[0]
    const rightStop = config.stops[midIndex] || config.stops[config.stops.length - 1]
    const newPosition = (leftStop.position + rightStop.position) / 2
    const newStops = [
      ...config.stops,
      { color: "#ffffff", position: Math.round(newPosition) },
    ].sort((a, b) => a.position - b.position)
    updateConfig({ stops: newStops })
    setSelectedStopIndex(newStops.findIndex((s) => s.position === Math.round(newPosition)))
  }, [config.stops, updateConfig])

  const removeStop = useCallback(
    (index: number) => {
      if (config.stops.length <= 2) return
      const newStops = config.stops.filter((_, i) => i !== index)
      updateConfig({ stops: newStops })
      setSelectedStopIndex(Math.min(selectedStopIndex, newStops.length - 1))
    },
    [config.stops, selectedStopIndex, updateConfig],
  )

  const handleBarClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!gradientBarRef.current || isDragging.current) return
      const rect = gradientBarRef.current.getBoundingClientRect()
      const position = Math.round(((e.clientX - rect.left) / rect.width) * 100)
      const newStops = [...config.stops, { color: "#ffffff", position: Math.max(0, Math.min(100, position)) }].sort(
        (a, b) => a.position - b.position,
      )
      updateConfig({ stops: newStops })
      setSelectedStopIndex(newStops.findIndex((s) => s.position === Math.max(0, Math.min(100, position))))
    },
    [config.stops, updateConfig],
  )

  const handleStopDrag = useCallback(
    (index: number, e: React.MouseEvent) => {
      e.stopPropagation()
      isDragging.current = true
      setSelectedStopIndex(index)

      const handleMouseMove = (moveEvent: MouseEvent) => {
        if (!gradientBarRef.current) return
        const rect = gradientBarRef.current.getBoundingClientRect()
        const position = Math.round(((moveEvent.clientX - rect.left) / rect.width) * 100)
        updateStop(index, { position: Math.max(0, Math.min(100, position)) })
      }

      const handleMouseUp = () => {
        isDragging.current = false
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }

      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
    },
    [updateStop],
  )

  const randomizeGradient = () => {
    const randomColor = () =>
      `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`
    const numStops = 2 + Math.floor(Math.random() * 3)
    const stops: GradientStop[] = []
    for (let i = 0; i < numStops; i++) {
      stops.push({ color: randomColor(), position: Math.round((i / (numStops - 1)) * 100) })
    }
    const types: ("linear" | "radial" | "conic")[] = ["linear", "radial", "conic"]
    updateConfig({
      type: types[Math.floor(Math.random() * types.length)],
      angle: Math.round(Math.random() * 360),
      stops,
    })
  }

  const reverseStops = () => {
    const newStops = config.stops.map((s) => ({ ...s, position: 100 - s.position })).sort((a, b) => a.position - b.position)
    updateConfig({ stops: newStops })
  }

  const copyCSS = () => {
    navigator.clipboard.writeText(buildGradientCSS(config))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const currentCSS = buildGradientCSS(config)

  return (
    <div className="space-y-4">
      {/* Live Preview */}
      <div className="w-full h-24 rounded-xl border border-white/10 overflow-hidden" style={{ background: currentCSS }} />

      {/* Gradient Type Selection */}
      <div className="flex gap-2">
        {(["linear", "radial", "conic"] as const).map((type) => (
          <Button
            key={type}
            variant="ghost"
            size="sm"
            className={`flex-1 text-xs font-medium rounded-xl transition-all duration-300 h-9 ${
              config.type === type
                ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/30"
                : "text-gray-400 hover:bg-white/10 hover:text-gray-200"
            }`}
            onClick={() => updateConfig({ type })}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </Button>
        ))}
      </div>

      {/* Angle / Type-specific controls */}
      {config.type === "linear" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-gray-300">Angle</Label>
            <span className="text-xs font-bold text-gray-400 bg-white/5 px-2 py-1 rounded-lg">{config.angle}deg</span>
          </div>
          <div className="flex items-center gap-3">
            <Slider
              min={0}
              max={360}
              step={1}
              value={[config.angle]}
              onValueChange={([v]) => updateConfig({ angle: v })}
              className="flex-1 [&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-cyan-400 [&_[role=slider]]:border-2 [&_[role=slider]]:border-cyan-300 [&>span:first-child_span]:bg-cyan-500"
            />
            {/* Quick angle buttons */}
            <div className="flex gap-1">
              {[0, 45, 90, 135, 180].map((a) => (
                <button
                  key={a}
                  className={`w-7 h-7 text-xs rounded-lg border transition-all duration-200 ${
                    config.angle === a
                      ? "bg-cyan-500/20 border-cyan-500/30 text-cyan-300"
                      : "border-white/10 text-gray-500 hover:bg-white/10 hover:text-gray-300"
                  }`}
                  onClick={() => updateConfig({ angle: a })}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {config.type === "radial" && (
        <div className="flex gap-3">
          <div className="flex-1 space-y-1">
            <Label className="text-xs text-gray-400">Shape</Label>
            <div className="flex gap-2">
              {(["circle", "ellipse"] as const).map((shape) => (
                <Button
                  key={shape}
                  variant="ghost"
                  size="sm"
                  className={`flex-1 text-xs h-8 rounded-xl ${
                    config.radialShape === shape
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "text-gray-400 hover:bg-white/10"
                  }`}
                  onClick={() => updateConfig({ radialShape: shape })}
                >
                  {shape}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex-1 space-y-1">
            <Label className="text-xs text-gray-400">Position</Label>
            <div className="grid grid-cols-3 gap-1">
              {["top left", "top", "top right", "left", "center", "right", "bottom left", "bottom", "bottom right"].map((pos) => (
                <button
                  key={pos}
                  className={`h-6 text-[9px] rounded border transition-all ${
                    config.radialPosition === pos
                      ? "bg-purple-500/20 border-purple-500/30 text-purple-300"
                      : "border-white/10 text-gray-500 hover:bg-white/10"
                  }`}
                  onClick={() => updateConfig({ radialPosition: pos })}
                >
                  {pos === "center" ? "C" : pos.replace("top", "T").replace("bottom", "B").replace("left", "L").replace("right", "R").replace(" ", "")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {config.type === "conic" && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-gray-300">Start Angle</Label>
            <span className="text-xs font-bold text-gray-400 bg-white/5 px-2 py-1 rounded-lg">{config.conicFrom || 0}deg</span>
          </div>
          <Slider
            min={0}
            max={360}
            step={1}
            value={[config.conicFrom || 0]}
            onValueChange={([v]) => updateConfig({ conicFrom: v })}
            className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-pink-400 [&_[role=slider]]:border-2 [&_[role=slider]]:border-pink-300 [&>span:first-child_span]:bg-pink-500"
          />
        </div>
      )}

      {/* Gradient Bar with Stops */}
      <div className="space-y-2">
        <Label className="text-sm text-gray-300">Color Stops</Label>
        <div className="relative">
          <div
            ref={gradientBarRef}
            className="w-full h-8 rounded-lg cursor-crosshair border border-white/10"
            style={{ background: currentCSS.replace(/radial|conic/, "linear").replace(/circle|ellipse|from\s+[\d.]+deg/, "90deg") }}
            onClick={handleBarClick}
          />
          {/* Stop handles */}
          {config.stops.map((stop, index) => (
            <div
              key={index}
              className={`absolute top-6 w-4 h-4 -translate-x-1/2 cursor-grab rounded-full border-2 transition-shadow ${
                selectedStopIndex === index
                  ? "border-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)] z-10"
                  : "border-white/50 hover:border-white"
              }`}
              style={{
                left: `${stop.position}%`,
                backgroundColor: stop.color,
              }}
              onMouseDown={(e) => handleStopDrag(index, e)}
              onClick={(e) => {
                e.stopPropagation()
                setSelectedStopIndex(index)
              }}
            />
          ))}
        </div>
      </div>

      {/* Selected Stop Controls */}
      {config.stops[selectedStopIndex] && (
        <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-400">
              Stop {selectedStopIndex + 1} of {config.stops.length}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg"
              onClick={() => removeStop(selectedStopIndex)}
              disabled={config.stops.length <= 2}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
          <div className="flex gap-3 items-center">
            <Popover>
              <PopoverTrigger asChild>
                <button
                  className="w-10 h-10 rounded-xl border border-white/20 flex-shrink-0 transition-transform hover:scale-105"
                  style={{ backgroundColor: config.stops[selectedStopIndex].color }}
                />
              </PopoverTrigger>
              <PopoverContent className="w-52 p-3 bg-gray-900 border-white/10 rounded-xl">
                <Input
                  type="color"
                  value={config.stops[selectedStopIndex].color}
                  onChange={(e) => updateStop(selectedStopIndex, { color: e.target.value })}
                  className="w-full h-24 p-1 border-0 rounded-lg cursor-pointer"
                />
                <Input
                  type="text"
                  value={config.stops[selectedStopIndex].color}
                  onChange={(e) => updateStop(selectedStopIndex, { color: e.target.value })}
                  className="mt-2 h-8 bg-white/5 border-white/10 text-gray-100 text-xs font-mono rounded-lg"
                />
              </PopoverContent>
            </Popover>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-gray-400">Position</Label>
                <span className="text-xs font-mono text-gray-500">{config.stops[selectedStopIndex].position}%</span>
              </div>
              <Slider
                min={0}
                max={100}
                step={1}
                value={[config.stops[selectedStopIndex].position]}
                onValueChange={([v]) => updateStop(selectedStopIndex, { position: v })}
                className="[&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-white [&_[role=slider]]:border-2 [&_[role=slider]]:border-cyan-400 [&>span:first-child_span]:bg-cyan-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={addStop}
          className="flex-1 text-gray-300 hover:bg-cyan-500/20 hover:text-cyan-300 h-9 rounded-xl text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Stop
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={reverseStops}
          className="text-gray-300 hover:bg-purple-500/20 hover:text-purple-300 h-9 rounded-xl text-xs"
        >
          <RotateCw className="h-3 w-3 mr-1" />
          Reverse
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={randomizeGradient}
          className="text-gray-300 hover:bg-pink-500/20 hover:text-pink-300 h-9 rounded-xl text-xs"
        >
          <Shuffle className="h-3 w-3 mr-1" />
          Random
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={copyCSS}
          className="text-gray-300 hover:bg-green-500/20 hover:text-green-300 h-9 rounded-xl text-xs"
        >
          {copied ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
          {copied ? "Copied" : "CSS"}
        </Button>
      </div>

      {/* Gradient Presets */}
      {showPresets && (
        <div className="space-y-2">
          <Label className="text-sm text-gray-300">Presets</Label>
          <div className="grid grid-cols-4 gap-2">
            {GRADIENT_PRESETS.map((preset) => (
              <button
                key={preset.name}
                className="group relative h-10 rounded-lg border border-white/10 overflow-hidden cursor-pointer hover:border-cyan-500/40 transition-all duration-200 hover:scale-105"
                style={{ background: preset.css }}
                onClick={() => {
                  const parsed = parseGradient(preset.css)
                  setConfig(parsed)
                  onChange(preset.css)
                }}
                title={preset.name}
              >
                <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-white/0 group-hover:text-white/90 transition-colors duration-200 drop-shadow-lg bg-black/0 group-hover:bg-black/30">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* CSS Output */}
      <div className="space-y-1">
        <Label className="text-xs text-gray-400">CSS Output</Label>
        <div className="p-2 rounded-lg bg-black/30 border border-white/5">
          <code className="text-[10px] text-cyan-300/70 font-mono break-all leading-relaxed">{currentCSS}</code>
        </div>
      </div>
    </div>
  )
}
