"use client"

import type React from "react"

import { useRef, useState, useEffect } from "react"
import type { Slide, SlideElement } from "@/types/editor"
import { RenderShape } from "@/utils/shape-utils"
import {
  snapToGrid,
  findAlignmentGuides,
  type AlignmentGuide,
  calculateRotationAngle,
  constrainRotation,
} from "@/utils/drag-utils"
import { getTextEffectStyle } from "./text-effects"
import { getImage3DEffectStyle } from "./image-3d-effects"

interface EnhancedSlideCanvasProps {
  slide: Slide
  selectedElementId: string | null
  onSelectElement: (id: string | null) => void
  onUpdateElement: (id: string, updates: Record<string, any>) => void
  zoomLevel: number
}

export default function EnhancedSlideCanvas({
  slide,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  zoomLevel,
}: EnhancedSlideCanvasProps) {
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizing, setResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [rotating, setRotating] = useState(false)
  const [rotateStart, setRotateStart] = useState({ angle: 0, startAngle: 0 })
  const [showGrid, setShowGrid] = useState(true)
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([])
  const [shiftKeyPressed, setShiftKeyPressed] = useState(false)
  const [hoveredElements, setHoveredElements] = useState<Set<string>>(new Set())
  const [dragPreview, setDragPreview] = useState<{ x: number; y: number } | null>(null)

  const canvasRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Handle keyboard events for modifier keys
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShiftKeyPressed(true)
      }

      // Arrow key movement for selected element
      if (selectedElementId && !dragging && !resizing && !rotating) {
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

      // Delete selected element with Delete key
      if (e.key === "Delete" && selectedElementId) {
        e.preventDefault()
        onSelectElement(null)
      }

      // Toggle grid with G key
      if (e.key === "g" || e.key === "G") {
        setShowGrid((prev) => !prev)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") {
        setShiftKeyPressed(false)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      window.removeEventListener("keyup", handleKeyUp)
    }
  }, [selectedElementId, slide.elements, onUpdateElement, dragging, resizing, rotating])

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onSelectElement(null)
    }
  }

  const handleElementMouseDown = (e: React.MouseEvent, element: SlideElement) => {
    e.stopPropagation()
    onSelectElement(element.id)

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setDragStart({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setDragging(true)
    setDragPreview(null)
    setAlignmentGuides([])
  }

  const handleResizeMouseDown = (e: React.MouseEvent, element: SlideElement, direction: string) => {
    e.stopPropagation()
    onSelectElement(element.id)

    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: element.width,
      height: element.height,
    })
    setResizeDirection(direction)
    setResizing(true)
  }

  const handleRotateMouseDown = (e: React.MouseEvent, element: SlideElement) => {
    e.stopPropagation()
    onSelectElement(element.id)

    const elementCenterX = element.x + element.width / 2
    const elementCenterY = element.y + element.height / 2

    const canvasRect = canvasRef.current!.getBoundingClientRect()
    const zoomFactor = zoomLevel / 100
    const mouseX = (e.clientX - canvasRect.left) / zoomFactor
    const mouseY = (e.clientY - canvasRect.top) / zoomFactor

    const currentAngle = calculateRotationAngle(elementCenterX, elementCenterY, mouseX, mouseY)
    const elementAngle = element.rotation || 0

    setRotateStart({
      angle: elementAngle,
      startAngle: currentAngle,
    })
    setRotating(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!selectedElementId) return

    const selectedElement = slide.elements.find((el) => el.id === selectedElementId)
    if (!selectedElement) return

    if (dragging) {
      const canvasRect = canvasRef.current!.getBoundingClientRect()
      const zoomFactor = zoomLevel / 100
      let x = (e.clientX - canvasRect.left - dragStart.x) / zoomFactor
      let y = (e.clientY - canvasRect.top - dragStart.y) / zoomFactor

      // Always snap to grid for better precision
      x = snapToGrid(x)
      y = snapToGrid(y)

      const otherElements = slide.elements.filter((el) => el.id !== selectedElementId)
      const currentElement = {
        x,
        y,
        width: selectedElement.width,
        height: selectedElement.height,
      }

      const guides = findAlignmentGuides(currentElement, otherElements)
      setAlignmentGuides(guides)

      guides.forEach((guide) => {
        if (guide.type === "vertical") {
          if (Math.abs(x - guide.position) < 5) {
            x = guide.position
          } else if (Math.abs(x + selectedElement.width - guide.position) < 5) {
            x = guide.position - selectedElement.width
          } else if (Math.abs(x + selectedElement.width / 2 - guide.position) < 5) {
            x = guide.position - selectedElement.width / 2
          }
        } else if (guide.type === "horizontal") {
          if (Math.abs(y - guide.position) < 5) {
            y = guide.position
          } else if (Math.abs(y + selectedElement.height - guide.position) < 5) {
            y = guide.position - selectedElement.height
          } else if (Math.abs(y + selectedElement.height / 2 - guide.position) < 5) {
            y = guide.position - selectedElement.height / 2
          }
        }
      })

      setDragPreview({ x, y })
      onUpdateElement(selectedElementId, { x, y })
    }

    if (resizing && resizeDirection) {
      const zoomFactor = zoomLevel / 100
      const dx = (e.clientX - resizeStart.x) / zoomFactor
      const dy = (e.clientY - resizeStart.y) / zoomFactor

      let newWidth = resizeStart.width
      let newHeight = resizeStart.height
      let newX = selectedElement.x
      let newY = selectedElement.y

      if (resizeDirection.includes("e")) {
        newWidth = Math.max(50, snapToGrid(resizeStart.width + dx))
      }
      if (resizeDirection.includes("w")) {
        const widthChange = Math.min(resizeStart.width - 50, dx)
        newWidth = resizeStart.width - widthChange
        newX = selectedElement.x + widthChange
      }
      if (resizeDirection.includes("s")) {
        newHeight = Math.max(20, snapToGrid(resizeStart.height + dy))
      }
      if (resizeDirection.includes("n")) {
        const heightChange = Math.min(resizeStart.height - 20, dy)
        newHeight = resizeStart.height - heightChange
        newY = selectedElement.y + heightChange
      }

      if (shiftKeyPressed) {
        const aspectRatio = resizeStart.width / resizeStart.height
        if (resizeDirection === "se" || resizeDirection === "nw") {
          if (Math.abs(dx) > Math.abs(dy)) {
            newHeight = newWidth / aspectRatio
          } else {
            newWidth = newHeight * aspectRatio
          }
        } else if (resizeDirection === "sw" || resizeDirection === "ne") {
          if (Math.abs(dx) > Math.abs(dy)) {
            newHeight = newWidth / aspectRatio
          } else {
            newWidth = newHeight * aspectRatio
          }
        }
      }

      onUpdateElement(selectedElementId, {
        width: newWidth,
        height: newHeight,
        x: newX,
        y: newY,
      })
    }

    if (rotating) {
      const elementCenterX = selectedElement.x + selectedElement.width / 2
      const elementCenterY = selectedElement.y + selectedElement.height / 2

      const canvasRect = canvasRef.current!.getBoundingClientRect()
      const zoomFactor = zoomLevel / 100
      const mouseX = (e.clientX - canvasRect.left) / zoomFactor
      const mouseY = (e.clientY - canvasRect.top) / zoomFactor

      const currentAngle = calculateRotationAngle(elementCenterX, elementCenterY, mouseX, mouseY)
      const angleDiff = currentAngle - rotateStart.startAngle
      let newAngle = rotateStart.angle + angleDiff

      if (shiftKeyPressed) {
        newAngle = constrainRotation(newAngle, true)
      }

      onUpdateElement(selectedElementId, { rotation: newAngle })
    }
  }

  const handleMouseUp = () => {
    if (dragging || resizing || rotating) {
      setAlignmentGuides([])
      setDragPreview(null)
    }

    setDragging(false)
    setResizing(false)
    setResizeDirection(null)
    setRotating(false)
  }

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>, element: SlideElement) => {
    if (element.type !== "text") return
    onUpdateElement(element.id, { content: e.target.value })
  }

  const handleElementHover = (elementId: string, isHovering: boolean) => {
    setHoveredElements((prev) => {
      const newSet = new Set(prev)
      if (isHovering) {
        newSet.add(elementId)
      } else {
        newSet.delete(elementId)
      }
      return newSet
    })
  }

  const getImageFilterStyle = (element: SlideElement) => {
    if (element.type !== "image" || !element.filters) return {}

    const { filters, effects } = element

    let filterString = ""
    if (filters.grayscale) filterString += `grayscale(${filters.grayscale}%) `
    if (filters.sepia) filterString += `sepia(${filters.sepia}%) `
    if (filters.blur) filterString += `blur(${filters.blur}px) `
    if (filters.brightness) filterString += `brightness(${filters.brightness}%) `
    if (filters.contrast) filterString += `contrast(${filters.contrast}%) `
    if (filters.hueRotate) filterString += `hue-rotate(${filters.hueRotate}deg) `
    if (filters.saturate) filterString += `saturate(${filters.saturate}%) `
    if (filters.opacity) filterString += `opacity(${filters.opacity}%) `

    const style: React.CSSProperties = {
      filter: filterString || undefined,
    }

    if (effects) {
      if (effects.borderRadius) style.borderRadius = `${effects.borderRadius}%`
      if (effects.borderWidth) {
        style.border = `${effects.borderWidth}px solid ${effects.borderColor || "#ffffff"}`
      }
      if (effects.shadowBlur) {
        style.boxShadow = `${effects.shadowOffsetX || 0}px ${effects.shadowOffsetY || 0}px ${effects.shadowBlur}px ${effects.shadowColor || "#000000"}`
      }

      let transformString = ""
      if (effects.skewX) transformString += `skewX(${effects.skewX}deg) `
      if (effects.skewY) transformString += `skewY(${effects.skewY}deg) `
      if (effects.scale && effects.scale !== 100) transformString += `scale(${effects.scale / 100}) `

      if (transformString) {
        style.transform = transformString
      }
    }

    return style
  }

  const getBackgroundStyles = () => {
    const bg = slide.background

    if (typeof bg === "string") {
      return { background: bg }
    }

    if (bg.type === "color") {
      return { backgroundColor: bg.value }
    }

    if (bg.type === "gradient") {
      return { background: bg.value }
    }

    if (bg.type === "image") {
      return {
        position: "relative" as const,
      }
    }

    return {}
  }

  const getElementTransform = (element: SlideElement) => {
    let transform = ""

    if (element.rotation) {
      transform += `rotate(${element.rotation}deg)`
    }

    return transform || "none"
  }

  return (
    <div
      ref={containerRef}
      className="relative overflow-hidden"
      style={{
        width: `${1280 * (zoomLevel / 100)}px`,
        height: `${720 * (zoomLevel / 100)}px`,
      }}
    >
      <div
        ref={canvasRef}
        className="w-[1280px] h-[720px] relative overflow-hidden origin-top-left cursor-default"
        style={{
          ...getBackgroundStyles(),
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: "top left",
          marginLeft: "20px",
          marginTop: "20px",
          borderRadius: "32px",
          boxShadow: "0 0 40px rgba(14, 165, 233, 0.25), 0 0 20px rgba(234, 179, 8, 0.15), inset 0 0 40px rgba(14, 165, 233, 0.05)",
          border: "1px solid rgba(14, 165, 233, 0.1)",
        }}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid overlay - always enabled */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "10px 10px",
                opacity: 0.5,
              }}
            />
          </div>
        )}

        {/* Background image */}
        {typeof slide.background !== "string" && slide.background.type === "image" && (
          <>
            <div
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: `url(${slide.background.value})`,
                backgroundSize: slide.background.imagePosition || "cover",
                backgroundPosition: "center",
                opacity: (slide.background.imageOpacity || 100) / 100,
              }}
            />
            {slide.background.overlay && (
              <div className="absolute inset-0 w-full h-full" style={{ backgroundColor: slide.background.overlay }} />
            )}
          </>
        )}

        {/* Alignment guides with glow */}
        {alignmentGuides.map((guide, index) => (
          <div
            key={`guide-${index}`}
            className="absolute pointer-events-none"
            style={{
              backgroundColor: "rgba(59, 130, 246, 0.8)",
              boxShadow: "0 0 8px rgba(59, 130, 246, 0.6), 0 0 15px rgba(59, 130, 246, 0.3)",
              opacity: 0.8,
              ...(guide.type === "vertical"
                ? {
                    width: "1px",
                    height: "100%",
                    left: `${guide.position}px`,
                    top: 0,
                  }
                : {
                    width: "100%",
                    height: "1px",
                    top: `${guide.position}px`,
                    left: 0,
                  }),
            }}
          />
        ))}

        {/* Slide elements */}
        {slide.elements.map((element) => {
          const isSelected = element.id === selectedElementId
          const isHovered = hoveredElements.has(element.id)

          if (element.type === "text") {
            return (
              <div
                key={element.id}
                className={`absolute transition-all duration-100 ${isSelected ? "ring-2 ring-blue-400 ring-offset-1 ring-offset-blue-950" : isHovered ? "ring-1 ring-blue-300/50" : ""}`}
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  transform: getElementTransform(element),
                  transformOrigin: "center center",
                  cursor: isSelected ? "move" : "pointer",
                }}
                onMouseDown={(e) => handleElementMouseDown(e, element)}
                onMouseEnter={() => handleElementHover(element.id, true)}
                onMouseLeave={() => handleElementHover(element.id, false)}
              >
                <textarea
                  className="w-full h-full resize-none border-none bg-transparent p-0 focus:outline-none focus:ring-0 text-white"
                  style={{
                    fontSize: `${element.fontSize}px`,
                    fontWeight: element.fontWeight,
                    textAlign: element.textAlign as any,
                    fontFamily: element.fontFamily,
                    fontStyle: element.fontStyle || "normal",
                    textDecoration: element.textDecoration || "none",
                    overflow: "hidden",
                    ...getTextEffectStyle(element.textEffect),
                  }}
                  value={element.content}
                  onChange={(e) => handleTextChange(e, element)}
                  onClick={(e) => e.stopPropagation()}
                />

                {isSelected && (
                  <>
                    {/* Resize handles with better styling */}
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-400 cursor-nw-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "nw")} />
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 cursor-n-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "n")} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 cursor-ne-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "ne")} />
                    <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-blue-400 cursor-w-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "w")} />
                    <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-blue-400 cursor-e-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "e")} />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 cursor-sw-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "sw")} />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 cursor-s-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "s")} />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 cursor-se-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "se")} />

                    {/* Rotation handle */}
                    <div
                      className="absolute w-3 h-3 bg-yellow-400 rounded-full cursor-grab shadow-lg transition-transform hover:scale-125"
                      style={{
                        left: "50%",
                        top: "-24px",
                        transform: "translateX(-50%)",
                      }}
                      onMouseDown={(e) => handleRotateMouseDown(e, element)}
                    />
                  </>
                )}
              </div>
            )
          }

          if (element.type === "shape") {
            return (
              <div
                key={element.id}
                className={`absolute transition-all duration-100 ${isSelected ? "ring-2 ring-blue-400 ring-offset-1 ring-offset-blue-950" : isHovered ? "ring-1 ring-blue-300/50" : ""}`}
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  transform: getElementTransform(element),
                  transformOrigin: "center center",
                  cursor: isSelected ? "move" : "pointer",
                }}
                onMouseDown={(e) => handleElementMouseDown(e, element)}
                onMouseEnter={() => handleElementHover(element.id, true)}
                onMouseLeave={() => handleElementHover(element.id, false)}
              >
                <RenderShape element={element} />

                {isSelected && (
                  <>
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-400 cursor-nw-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "nw")} />
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 cursor-n-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "n")} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 cursor-ne-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "ne")} />
                    <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-blue-400 cursor-w-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "w")} />
                    <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-blue-400 cursor-e-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "e")} />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 cursor-sw-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "sw")} />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 cursor-s-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "s")} />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 cursor-se-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "se")} />
                    <div
                      className="absolute w-3 h-3 bg-yellow-400 rounded-full cursor-grab shadow-lg transition-transform hover:scale-125"
                      style={{
                        left: "50%",
                        top: "-24px",
                        transform: "translateX(-50%)",
                      }}
                      onMouseDown={(e) => handleRotateMouseDown(e, element)}
                    />
                  </>
                )}
              </div>
            )
          }

          if (element.type === "image") {
            return (
              <div
                key={element.id}
                className={`absolute transition-all duration-100 ${isSelected ? "ring-2 ring-blue-400 ring-offset-1 ring-offset-blue-950" : isHovered ? "ring-1 ring-blue-300/50" : ""}`}
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  transform: getElementTransform(element),
                  transformOrigin: "center center",
                  cursor: isSelected ? "move" : "pointer",
                  overflow: "hidden",
                  borderRadius: element.borderRadius ? `${element.borderRadius}px` : undefined,
                }}
                onMouseDown={(e) => handleElementMouseDown(e, element)}
                onMouseEnter={() => handleElementHover(element.id, true)}
                onMouseLeave={() => handleElementHover(element.id, false)}
              >
                <img
                  src={element.src}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{
                    ...getImageFilterStyle(element),
                    ...getImage3DEffectStyle(element),
                  }}
                />

                {isSelected && (
                  <>
                    <div className="absolute -top-1 -left-1 w-3 h-3 bg-blue-400 cursor-nw-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "nw")} />
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 cursor-n-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "n")} />
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-400 cursor-ne-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "ne")} />
                    <div className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-blue-400 cursor-w-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "w")} />
                    <div className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-blue-400 cursor-e-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "e")} />
                    <div className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-400 cursor-sw-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "sw")} />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-400 cursor-s-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "s")} />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-400 cursor-se-resize rounded-sm shadow-lg" onMouseDown={(e) => handleResizeMouseDown(e, element, "se")} />
                    <div
                      className="absolute w-3 h-3 bg-yellow-400 rounded-full cursor-grab shadow-lg transition-transform hover:scale-125"
                      style={{
                        left: "50%",
                        top: "-24px",
                        transform: "translateX(-50%)",
                      }}
                      onMouseDown={(e) => handleRotateMouseDown(e, element)}
                    />
                  </>
                )}
              </div>
            )
          }

          return null
        })}
      </div>
    </div>
  )
}
