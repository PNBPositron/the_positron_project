"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Stage, Layer, Rect, Text, Image as KonvaImage, Group, Line } from "react-konva"
import type Konva from "konva"
import type { Slide, SlideElement } from "@/types/editor"
import { RenderShape } from "@/utils/shape-utils"

interface KonvaCanvasProps {
  slide: Slide
  selectedElementId: string | null
  onSelectElement: (id: string | null) => void
  onUpdateElement: (id: string, updates: Record<string, any>) => void
  zoomLevel: number
  width: number
  height: number
}

export default function KonvaCanvas({
  slide,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  zoomLevel,
  width,
  height,
}: KonvaCanvasProps) {
  const stageRef = useRef<Konva.Stage>(null)
  const layerRef = useRef<Konva.Layer>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [resizingId, setResizingId] = useState<string | null>(null)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [showGrid, setShowGrid] = useState(false)

  const zoomFactor = zoomLevel / 100
  const HANDLE_SIZE = 8

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "g" || e.key === "G") {
        setShowGrid((prev) => !prev)
      }

      if (e.key === "Delete" && selectedElementId) {
        // Delete selected element logic
        console.log("[v0] Delete key pressed for element:", selectedElementId)
      }

      // Arrow keys for moving selected element
      if (selectedElementId && !draggingId && !resizingId) {
        const element = slide.elements.find((el) => el.id === selectedElementId)
        if (!element) return

        const moveAmount = e.shiftKey ? 10 : 1
        let updates = {}

        switch (e.key) {
          case "ArrowUp":
            updates = { y: element.y - moveAmount }
            break
          case "ArrowDown":
            updates = { y: element.y + moveAmount }
            break
          case "ArrowLeft":
            updates = { x: element.x - moveAmount }
            break
          case "ArrowRight":
            updates = { x: element.x + moveAmount }
            break
        }

        if (Object.keys(updates).length > 0) {
          e.preventDefault()
          onUpdateElement(selectedElementId, updates)
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [selectedElementId, slide.elements, onUpdateElement, draggingId, resizingId])

  const handleElementDragStart = (id: string) => {
    setDraggingId(id)
    onSelectElement(id)
  }

  const handleElementDragEnd = (id: string, e: Konva.KonvaEventObject<DragEvent>) => {
    const node = e.target as Konva.Node
    onUpdateElement(id, {
      x: node.x(),
      y: node.y(),
    })
    setDraggingId(null)
  }

  const handleElementClick = (id: string) => {
    onSelectElement(id)
  }

  const renderElement = (element: SlideElement, index: number) => {
    const isSelected = element.id === selectedElementId
    const key = `${element.id}-${index}`

    switch (element.type) {
      case "text":
        return (
          <Group
            key={key}
            x={element.x}
            y={element.y}
            draggable
            onDragStart={() => handleElementDragStart(element.id)}
            onDragEnd={(e) => handleElementDragEnd(element.id, e)}
            onClick={() => handleElementClick(element.id)}
          >
            <Text
              text={element.content || "Text"}
              width={element.width}
              height={element.height}
              fontSize={element.fontSize || 16}
              fontFamily={element.fontFamily || "Arial"}
              fill={element.color || "#000000"}
              align={element.align || "left"}
              verticalAlign="top"
              opacity={element.opacity || 1}
              rotation={element.rotation || 0}
            />
            {isSelected && (
              <Rect
                x={0}
                y={0}
                width={element.width}
                height={element.height}
                stroke="#00d4ff"
                strokeWidth={2}
                pointerEvents="none"
              />
            )}
          </Group>
        )

      case "shape":
        return (
          <Group
            key={key}
            x={element.x}
            y={element.y}
            draggable
            onDragStart={() => handleElementDragStart(element.id)}
            onDragEnd={(e) => handleElementDragEnd(element.id, e)}
            onClick={() => handleElementClick(element.id)}
          >
            <Rect
              width={element.width}
              height={element.height}
              fill={element.backgroundColor || "#ffffff"}
              stroke={element.borderColor || "#000000"}
              strokeWidth={element.borderWidth || 1}
              cornerRadius={element.borderRadius || 0}
              opacity={element.opacity || 1}
              rotation={element.rotation || 0}
            />
            {isSelected && (
              <Rect
                width={element.width}
                height={element.height}
                stroke="#00d4ff"
                strokeWidth={2}
                cornerRadius={element.borderRadius || 0}
                pointerEvents="none"
              />
            )}
          </Group>
        )

      case "image":
        return (
          <Group
            key={key}
            x={element.x}
            y={element.y}
            draggable
            onDragStart={() => handleElementDragStart(element.id)}
            onDragEnd={(e) => handleElementDragEnd(element.id, e)}
            onClick={() => handleElementClick(element.id)}
          >
            <Rect
              width={element.width}
              height={element.height}
              fill="#f0f0f0"
              stroke={isSelected ? "#00d4ff" : "#cccccc"}
              strokeWidth={isSelected ? 2 : 1}
              opacity={element.opacity || 1}
              rotation={element.rotation || 0}
            />
            <Text
              x={element.width / 2 - 30}
              y={element.height / 2 - 10}
              text="[Image]"
              fontSize={14}
              fill="#999999"
              pointerEvents="none"
            />
          </Group>
        )

      default:
        return null
    }
  }

  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scale={{ x: zoomFactor, y: zoomFactor }}
        onMouseDown={(e) => {
          if (e.target === e.target.getStage()) {
            onSelectElement(null)
          }
        }}
      >
        <Layer ref={layerRef}>
          {/* Background */}
          <Rect
            x={0}
            y={0}
            width={slide.width}
            height={slide.height}
            fill={slide.backgroundColor || "#ffffff"}
          />

          {/* Grid */}
          {showGrid && (
            <Group>
              {Array.from({ length: Math.ceil(slide.width / 20) }).map((_, i) => (
                <Line
                  key={`vline-${i}`}
                  points={[i * 20, 0, i * 20, slide.height]}
                  stroke="#e0e0e0"
                  strokeWidth={0.5}
                />
              ))}
              {Array.from({ length: Math.ceil(slide.height / 20) }).map((_, i) => (
                <Line
                  key={`hline-${i}`}
                  points={[0, i * 20, slide.width, i * 20]}
                  stroke="#e0e0e0"
                  strokeWidth={0.5}
                />
              ))}
            </Group>
          )}

          {/* Elements */}
          {slide.elements.map((element, index) => renderElement(element, index))}
        </Layer>
      </Stage>
    </div>
  )
}
