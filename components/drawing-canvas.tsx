"use client"

import type React from "react"
import { useRef, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Pencil, Eraser, Undo, Redo, Trash2, Save } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface DrawingPath {
  id: string
  d: string
  stroke: string
  strokeWidth: number
  fill?: string
}

interface DrawingCanvasProps {
  isDrawing: boolean
  onSaveDrawing: (paths: DrawingPath[]) => void
  onClose: () => void
  zoomLevel: number
  existingPaths?: DrawingPath[]
}

const COLOR_PRESETS = [
  "#000000", // Black
  "#ffffff", // White
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Yellow
  "#8b5cf6", // Purple
  "#f97316", // Orange
  "#06b6d4", // Cyan
  "#84cc16", // Lime
]

export default function DrawingCanvas({
  isDrawing,
  onSaveDrawing,
  onClose,
  zoomLevel,
  existingPaths = [],
}: DrawingCanvasProps) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [isDrawingMode, setIsDrawingMode] = useState(true)
  const [currentPath, setCurrentPath] = useState<string>("")
  const [paths, setPaths] = useState<DrawingPath[]>(existingPaths)
  const [isMouseDown, setIsMouseDown] = useState(false)
  const [strokeColor, setStrokeColor] = useState("#000000")
  const [strokeWidth, setStrokeWidth] = useState(3)
  const [history, setHistory] = useState<DrawingPath[][]>([existingPaths])
  const [historyIndex, setHistoryIndex] = useState(0)

  const zoomFactor = zoomLevel / 100

  const addToHistory = useCallback(
    (newPaths: DrawingPath[]) => {
      const newHistory = history.slice(0, historyIndex + 1)
      newHistory.push([...newPaths])
      setHistory(newHistory)
      setHistoryIndex(newHistory.length - 1)
    },
    [history, historyIndex],
  )

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setPaths([...history[historyIndex - 1]])
    }
  }

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setPaths([...history[historyIndex + 1]])
    }
  }

  const clearAll = () => {
    const newPaths: DrawingPath[] = []
    setPaths(newPaths)
    addToHistory(newPaths)
  }

  const getMousePosition = (e: React.MouseEvent<SVGSVGElement>) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }

    const rect = svg.getBoundingClientRect()
    return {
      x: (e.clientX - rect.left) / zoomFactor,
      y: (e.clientY - rect.top) / zoomFactor,
    }
  }

  const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isDrawingMode) return

    setIsMouseDown(true)
    const { x, y } = getMousePosition(e)
    setCurrentPath(`M ${x} ${y}`)
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!isMouseDown || !isDrawingMode) return

    const { x, y } = getMousePosition(e)
    setCurrentPath((prev) => `${prev} L ${x} ${y}`)
  }

  const handleMouseUp = () => {
    if (!isMouseDown || !currentPath) return

    const newPath: DrawingPath = {
      id: `path-${Date.now()}`,
      d: currentPath,
      stroke: strokeColor,
      strokeWidth: strokeWidth,
    }

    const newPaths = [...paths, newPath]
    setPaths(newPaths)
    addToHistory(newPaths)
    setCurrentPath("")
    setIsMouseDown(false)
  }

  const handlePathClick = (pathId: string) => {
    if (isDrawingMode) return

    // Eraser mode - remove the clicked path
    const newPaths = paths.filter((path) => path.id !== pathId)
    setPaths(newPaths)
    addToHistory(newPaths)
  }

  const handleSave = () => {
    onSaveDrawing(paths)
    onClose()
  }

  if (!isDrawing) return null

  return (
    <div className="absolute inset-0 z-50 bg-black/50 backdrop-blur-sm">
      {/* Drawing Controls */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-60 px-4 py-2 flex items-center gap-2 bg-gray-900/90 backdrop-blur-xl border border-gray-700/60 rounded-2xl shadow-2xl">
        <Button
          variant={isDrawingMode ? "default" : "ghost"}
          size="sm"
          onClick={() => setIsDrawingMode(true)}
          className="h-10 w-10 rounded-xl transition-all duration-300"
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <Button
          variant={!isDrawingMode ? "default" : "ghost"}
          size="sm"
          onClick={() => setIsDrawingMode(false)}
          className="h-10 w-10 rounded-xl transition-all duration-300"
        >
          <Eraser className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-gray-700/60 mx-2" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-10 w-10 rounded-xl transition-all duration-300">
              <div className="w-4 h-4 rounded-full border border-gray-400" style={{ backgroundColor: strokeColor }} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-800 border-gray-700 text-gray-100 p-2">
            <div className="grid grid-cols-5 gap-1">
              {COLOR_PRESETS.map((color) => (
                <div
                  key={color}
                  className="w-6 h-6 rounded-full cursor-pointer border border-gray-700 hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                  onClick={() => setStrokeColor(color)}
                />
              ))}
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        <div className="flex items-center gap-2 px-2">
          <span className="text-xs text-gray-400">Size:</span>
          <Slider
            className="w-16 [&>span:first-child]:bg-gray-700 [&_[role=slider]]:bg-blue-400 [&>span:first-child_span]:bg-blue-400"
            min={1}
            max={20}
            step={1}
            value={[strokeWidth]}
            onValueChange={([value]) => setStrokeWidth(value)}
          />
          <span className="text-xs w-4 text-gray-300">{strokeWidth}</span>
        </div>

        <div className="w-px h-8 bg-gray-700/60 mx-2" />

        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={historyIndex <= 0}
          className="h-10 w-10 rounded-xl transition-all duration-300 disabled:opacity-50"
        >
          <Undo className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={historyIndex >= history.length - 1}
          className="h-10 w-10 rounded-xl transition-all duration-300 disabled:opacity-50"
        >
          <Redo className="h-4 w-4" />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="h-10 w-10 rounded-xl transition-all duration-300 text-red-400 hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-gray-700/60 mx-2" />

        <Button
          variant="default"
          size="sm"
          onClick={handleSave}
          className="h-10 px-4 rounded-xl transition-all duration-300 bg-blue-600 hover:bg-blue-700"
        >
          <Save className="h-4 w-4 mr-2" />
          Save
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-10 px-4 rounded-xl transition-all duration-300"
        >
          Cancel
        </Button>
      </div>

      {/* Drawing Surface */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full cursor-crosshair"
        style={{
          transform: `scale(${zoomFactor})`,
          transformOrigin: "top left",
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Existing paths */}
        {paths.map((path) => (
          <path
            key={path.id}
            d={path.d}
            stroke={path.stroke}
            strokeWidth={path.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={!isDrawingMode ? "cursor-pointer hover:opacity-50" : ""}
            onClick={() => handlePathClick(path.id)}
          />
        ))}

        {/* Current path being drawn */}
        {currentPath && (
          <path
            d={currentPath}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </svg>
    </div>
  )
}
