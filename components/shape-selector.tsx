"use client"

import { Button } from "@/components/ui/button"
import {
  Square,
  Circle,
  Triangle,
  Pentagon,
  Hexagon,
  Star,
  ArrowRight,
  Diamond,
  MessageSquare,
  Frame,
  ImageIcon,
} from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface ShapeSelectorProps {
  onSelectShape: (shape: string) => void
}

export function ShapeSelector({ onSelectShape }: ShapeSelectorProps) {
  const basicShapes = [
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

  const frameShapes = [
    { name: "frame-classic", icon: <Frame className="h-5 w-5" />, label: "Classic" },
    { name: "frame-modern", icon: <Frame className="h-5 w-5" />, label: "Modern" },
    { name: "frame-ornate", icon: <Frame className="h-5 w-5" />, label: "Ornate" },
    { name: "frame-polaroid", icon: <ImageIcon className="h-5 w-5" />, label: "Polaroid" },
    { name: "frame-ticket", icon: <Frame className="h-5 w-5" />, label: "Ticket" },
    { name: "frame-stamp", icon: <Frame className="h-5 w-5" />, label: "Stamp" },
  ]

  return (
    <div className="p-3 bg-gray-800 rounded-md border border-gray-700">
      <Tabs defaultValue="shapes">
        <TabsList className="grid grid-cols-2 mb-3 bg-gray-900">
          <TabsTrigger value="shapes" className="text-sm">
            Basic Shapes
          </TabsTrigger>
          <TabsTrigger value="frames" className="text-sm">
            Image Frames
          </TabsTrigger>
        </TabsList>

        <TabsContent value="shapes">
          <div className="grid grid-cols-5 gap-2">
            {basicShapes.map((shape) => (
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
        </TabsContent>

        <TabsContent value="frames">
          <div className="grid grid-cols-3 gap-2">
            {frameShapes.map((frame) => (
              <Button
                key={frame.name}
                variant="ghost"
                size="sm"
                className="flex flex-col items-center justify-center h-16 p-1 text-gray-300 hover:bg-gray-700 hover:text-gray-100"
                onClick={() => onSelectShape(frame.name)}
              >
                <div className="text-yellow-400 mb-1">{frame.icon}</div>
                <span className="text-xs">{frame.label}</span>
              </Button>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
