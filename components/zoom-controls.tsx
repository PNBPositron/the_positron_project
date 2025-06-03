"use client"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ZoomIn, ZoomOut, ChevronDown } from "lucide-react"

interface ZoomControlsProps {
  zoomLevel: number
  onZoomChange: (level: number) => void
}

const ZOOM_PRESETS = [25, 50, 75, 100, 125, 150, 200]

export function ZoomControls({ zoomLevel, onZoomChange }: ZoomControlsProps) {
  const zoomIn = () => {
    const nextZoomLevel = Math.min(300, zoomLevel + 25)
    onZoomChange(nextZoomLevel)
  }

  const zoomOut = () => {
    const nextZoomLevel = Math.max(25, zoomLevel - 25)
    onZoomChange(nextZoomLevel)
  }

  const resetZoom = () => {
    onZoomChange(100)
  }

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        onClick={zoomOut}
        disabled={zoomLevel <= 25}
        className="h-8 w-8 text-gray-300 hover:bg-gray-800 hover:text-gray-100"
      >
        <ZoomOut className="h-4 w-4" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-gray-300 hover:bg-gray-800 hover:text-gray-100 min-w-[80px]"
          >
            {zoomLevel}%
            <ChevronDown className="h-3 w-3 ml-1 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-gray-800 border-gray-700 text-gray-100">
          {ZOOM_PRESETS.map((preset) => (
            <DropdownMenuItem key={preset} onClick={() => onZoomChange(preset)} className="hover:bg-gray-700">
              {preset}%
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem onClick={resetZoom} className="hover:bg-gray-700 font-medium">
            Reset to 100%
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Button
        variant="ghost"
        size="icon"
        onClick={zoomIn}
        disabled={zoomLevel >= 300}
        className="h-8 w-8 text-gray-300 hover:bg-gray-800 hover:text-gray-100"
      >
        <ZoomIn className="h-4 w-4" />
      </Button>
    </div>
  )
}
