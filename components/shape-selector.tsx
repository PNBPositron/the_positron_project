"use client"

import { Button } from "@/components/ui/button"
import { Square, Circle, Triangle, Pentagon, Hexagon, Star, ArrowRight, Diamond, MessageSquare } from "lucide-react"

interface ShapeSelectorProps {
  onSelectShape: (shape: string) => void
}

export function ShapeSelector({ onSelectShape }: ShapeSelectorProps) {
  const shapes = [
    { name: "square", icon: <Square className="h-5 w-5" />, label: "Square" },
    { name: "circle", icon: <Circle className="h-5 w-5" />, label: "Circle" },
    { name: "triangle", icon: <Triangle className="h-5 w-5" />, label: "Triangle" },
    { name: "pentagon", icon: <Pentagon className="h-5 w-5" />, label: "Pentagon" },
    { name: "hexagon", icon: <Hexagon className="h-5 w-5" />, label: "Hexagon" },
    { name: "star", icon: <Star className="h-5 w-5" />, label: "Star" },
    { name: "arrow", icon: <ArrowRight className="h-5 w-5" />, label: "Arrow" },
    { name: "diamond", icon: <Diamond className="h-5 w-5" />, label: "Diamond" },
    { name: "rounded-rect", icon: <Square className="h-5 w-5 rounded-md" />, label: "Rounded" },
    { name: "speech-bubble", icon: <MessageSquare className="h-5 w-5" />, label: "Speech" },
  ]

  return (
    <div className="p-3 bg-gray-800 rounded-md border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Select Shape</h3>
      <div className="grid grid-cols-5 gap-2">
        {shapes.map((shape) => (
          <Button
            key={shape.name}
            variant="ghost"
            size="sm"
            className="flex flex-col items-center justify-center h-16 p-1 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
            onClick={() => onSelectShape(shape.name)}
          >
            <div className="text-sky-400 mb-1">{shape.icon}</div>
            <span className="text-xs">{shape.label}</span>
          </Button>
        ))}
      </div>
    </div>
  )
}
