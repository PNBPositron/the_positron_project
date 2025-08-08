"use client"

import { Button } from "@/components/ui/button"
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface ZoomControlsProps {
  zoomLevel: number
  onZoomChange: (level: number) => void
}

export function ZoomControls({ zoomLevel, onZoomChange }: ZoomControlsProps) {
  const zoomIn = () => {
    const newLevel = Math.min(200, zoomLevel + 25)
    onZoomChange(newLevel)
  }

  const zoomOut = () => {
    const newLevel = Math.max(25, zoomLevel - 25)
    onZoomChange(newLevel)
  }

  const resetZoom = () => {
    onZoomChange(75)
  }

  return (
    <div className="flex items-center gap-2 bg-gray-800/60 rounded-2xl p-2 border border-gray-700/40">
      <Button
        variant="ghost"
        size="sm"
        onClick={zoomOut}
        disabled={zoomLevel <= 25}
        className="text-gray-300 hover:bg-gray-700/50 hover:text-gray-100 transition-all duration-300 h-8 w-8 rounded-xl disabled:opacity-40 group"
        title="Zoom Out"
      >
        <ZoomOut className="h-4 w-4 group-hover:text-blue-400 transition-colors duration-200" />
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={resetZoom}
        className="text-gray-300 hover:bg-gray-700/50 hover:text-gray-100 transition-all duration-300 px-3 h-8 rounded-xl font-bold text-xs group"
        title="Reset Zoom"
      >
        <span className="group-hover:text-blue-400 transition-colors duration-200">{zoomLevel}%</span>
      </Button>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={zoomIn}
        disabled={zoomLevel >= 200}
        className="text-gray-300 hover:bg-gray-700/50 hover:text-gray-100 transition-all duration-300 h-8 w-8 rounded-xl disabled:opacity-40 group"
        title="Zoom In"
      >
        <ZoomIn className="h-4 w-4 group-hover:text-blue-400 transition-colors duration-200" />
      </Button>
    </div>
  )
}
