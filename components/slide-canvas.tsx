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
import { getInteractionStyle, handleImageClick, getInteractionClasses } from "@/components/image-interaction-utils"

interface SlideCanvasProps {
  slide: Slide
  selectedElementId: string | null
  onSelectElement: (id: string | null) => void
  onUpdateElement: (id: string, updates: Record<string, any>) => void
  zoomLevel: number
}

export default function SlideCanvas({
  slide,
  selectedElementId,
  onSelectElement,
  onUpdateElement,
  zoomLevel,
}: SlideCanvasProps) {
  const [dragging, setDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })
  const [resizing, setResizing] = useState(false)
  const [resizeDirection, setResizeDirection] = useState<string | null>(null)
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 })
  const [rotating, setRotating] = useState(false)
  const [rotateStart, setRotateStart] = useState({ angle: 0, startAngle: 0 })
  const [showGrid, setShowGrid] = useState(false)
  const [alignmentGuides, setAlignmentGuides] = useState<AlignmentGuide[]>([])
  const [shiftKeyPressed, setShiftKeyPressed] = useState(false)
  const [hoveredElements, setHoveredElements] = useState<Set<string>>(new Set())

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

    // Find other elements for alignment guides
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

    // Calculate canvas-relative mouse position
    const canvasRect = canvasRef.current!.getBoundingClientRect()
    const zoomFactor = zoomLevel / 100
    const mouseX = (e.clientX - canvasRect.left) / zoomFactor
    const mouseY = (e.clientY - canvasRect.top) / zoomFactor

    // Calculate current angle
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
      // Adjust for zoom level
      const zoomFactor = zoomLevel / 100
      let x = (e.clientX - canvasRect.left - dragStart.x) / zoomFactor
      let y = (e.clientY - canvasRect.top - dragStart.y) / zoomFactor

      // Snap to grid if shift key is pressed
      if (shiftKeyPressed) {
        x = snapToGrid(x)
        y = snapToGrid(y)
      }

      // Find alignment guides
      const otherElements = slide.elements.filter((el) => el.id !== selectedElementId)
      const currentElement = {
        x,
        y,
        width: selectedElement.width,
        height: selectedElement.height,
      }

      const guides = findAlignmentGuides(currentElement, otherElements)
      setAlignmentGuides(guides)

      // Snap to alignment guides
      guides.forEach((guide) => {
        if (guide.type === "vertical") {
          // Check if left edge is close to guide
          if (Math.abs(x - guide.position) < 5) {
            x = guide.position
          }
          // Check if right edge is close to guide
          else if (Math.abs(x + selectedElement.width - guide.position) < 5) {
            x = guide.position - selectedElement.width
          }
          // Check if center is close to guide
          else if (Math.abs(x + selectedElement.width / 2 - guide.position) < 5) {
            x = guide.position - selectedElement.width / 2
          }
        } else if (guide.type === "horizontal") {
          // Check if top edge is close to guide
          if (Math.abs(y - guide.position) < 5) {
            y = guide.position
          }
          // Check if bottom edge is close to guide
          else if (Math.abs(y + selectedElement.height - guide.position) < 5) {
            y = guide.position - selectedElement.height
          }
          // Check if center is close to guide
          else if (Math.abs(y + selectedElement.height / 2 - guide.position) < 5) {
            y = guide.position - selectedElement.height / 2
          }
        }
      })

      onUpdateElement(selectedElementId, { x, y })
    }

    if (resizing && resizeDirection) {
      // Adjust for zoom level
      const zoomFactor = zoomLevel / 100
      const dx = (e.clientX - resizeStart.x) / zoomFactor
      const dy = (e.clientY - resizeStart.y) / zoomFactor

      let newWidth = resizeStart.width
      let newHeight = resizeStart.height
      let newX = selectedElement.x
      let newY = selectedElement.y

      // Handle different resize directions
      if (resizeDirection.includes("e")) {
        newWidth = Math.max(50, resizeStart.width + dx)
      }
      if (resizeDirection.includes("w")) {
        const widthChange = Math.min(resizeStart.width - 50, dx)
        newWidth = resizeStart.width - widthChange
        newX = selectedElement.x + widthChange
      }
      if (resizeDirection.includes("s")) {
        newHeight = Math.max(20, resizeStart.height + dy)
      }
      if (resizeDirection.includes("n")) {
        const heightChange = Math.min(resizeStart.height - 20, dy)
        newHeight = resizeStart.height - heightChange
        newY = selectedElement.y + heightChange
      }

      // Maintain aspect ratio if shift key is pressed
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

      // Snap to grid if enabled
      if (shiftKeyPressed) {
        newWidth = snapToGrid(newWidth)
        newHeight = snapToGrid(newHeight)
        newX = snapToGrid(newX)
        newY = snapToGrid(newY)
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

      // Calculate canvas-relative mouse position
      const canvasRect = canvasRef.current!.getBoundingClientRect()
      const zoomFactor = zoomLevel / 100
      const mouseX = (e.clientX - canvasRect.left) / zoomFactor
      const mouseY = (e.clientY - canvasRect.top) / zoomFactor

      // Calculate new angle
      const currentAngle = calculateRotationAngle(elementCenterX, elementCenterY, mouseX, mouseY)
      const angleDiff = currentAngle - rotateStart.startAngle
      let newAngle = rotateStart.angle + angleDiff

      // Constrain rotation to 15-degree increments if shift key is pressed
      if (shiftKeyPressed) {
        newAngle = constrainRotation(newAngle, true)
      }

      onUpdateElement(selectedElementId, { rotation: newAngle })
    }
  }

  const handleMouseUp = () => {
    if (dragging || resizing || rotating) {
      // Clear alignment guides when done dragging
      setAlignmentGuides([])
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

    // Build CSS filter string
    let filterString = ""
    if (filters.grayscale) filterString += `grayscale(${filters.grayscale}%) `
    if (filters.sepia) filterString += `sepia(${filters.sepia}%) `
    if (filters.blur) filterString += `blur(${filters.blur}px) `
    if (filters.brightness) filterString += `brightness(${filters.brightness}%) `
    if (filters.contrast) filterString += `contrast(${filters.contrast}%) `
    if (filters.hueRotate) filterString += `hue-rotate(${filters.hueRotate}deg) `
    if (filters.saturate) filterString += `saturate(${filters.saturate}%) `
    if (filters.opacity) filterString += `opacity(${filters.opacity}%) `

    // Build effects styles
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

      // Add new transform effects
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
        width: `${1000 * (zoomLevel / 100)}px`,
        height: `${562.5 * (zoomLevel / 100)}px`,
      }}
    >
      <div
        ref={canvasRef}
        className="w-[1000px] h-[562.5px] shadow-2xl shadow-blue-500/10 relative overflow-hidden origin-top-left"
        style={{
          ...getBackgroundStyles(),
          transform: `scale(${zoomLevel / 100})`,
          transformOrigin: "top left",
          marginLeft: "20px",
          marginTop: "20px",
          borderRadius: "32px",
          boxShadow: "0 0 30px rgba(14, 165, 233, 0.2), 0 0 10px rgba(234, 179, 8, 0.1)",
        }}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Grid overlay */}
        {showGrid && (
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="w-full h-full"
              style={{
                backgroundImage:
                  "linear-gradient(to right, rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.07) 1px, transparent 1px)",
                backgroundSize: "10px 10px",
              }}
            />
          </div>
        )}

        {/* Background */}
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

        {/* Alignment guides */}
        {alignmentGuides.map((guide, index) => (
          <div
            key={`guide-${index}`}
            className="absolute pointer-events-none"
            style={{
              backgroundColor: "rgba(14, 165, 233, 0.7)",
              boxShadow: "0 0 5px rgba(14, 165, 233, 0.5)",
              opacity: 0.7,
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

          if (element.type === "text") {
            return (
              <div
                key={element.id}
                className={`absolute cursor-move transition-all duration-150 ${isSelected ? "ring-2 ring-sky-500" : ""}`}
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  transform: getElementTransform(element),
                  transformOrigin: "center center",
                }}
                onMouseDown={(e) => handleElementMouseDown(e, element)}
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
                    {/* Resize handles */}
                    <div
                      className="absolute -top-1 -left-1 w-3 h-3 bg-sky-500 cursor-nw-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "nw")}
                    />
                    <div
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-sky-500 cursor-n-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "n")}
                    />
                    <div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-sky-500 cursor-ne-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "ne")}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-sky-500 cursor-w-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "w")}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-sky-500 cursor-e-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "e")}
                    />
                    <div
                      className="absolute -bottom-1 -left-1 w-3 h-3 bg-sky-500 cursor-sw-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "sw")}
                    />
                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-sky-500 cursor-s-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "s")}
                    />
                    <div
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-sky-500 cursor-se-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "se")}
                    />

                    {/* Rotation handle */}
                    <div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 w-4 h-4 bg-sky-500 cursor-grab rounded-full"
                      onMouseDown={(e) => handleRotateMouseDown(e, element)}
                    >
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-5 bg-sky-500"></div>
                    </div>
                  </>
                )}
              </div>
            )
          }

          if (element.type === "shape") {
            return (
              <div
                key={element.id}
                className={`absolute cursor-move transition-all duration-150 ${isSelected ? "ring-2 ring-sky-500" : ""}`}
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  transform: getElementTransform(element),
                  transformOrigin: "center center",
                }}
                onMouseDown={(e) => handleElementMouseDown(e, element)}
              >
                <RenderShape
                  shape={element.shape}
                  width={element.width}
                  height={element.height}
                  color={element.color}
                  className="transition-colors duration-300"
                  glassmorphism={element.glassmorphism}
                  cornerRadius={element.cornerRadius}
                />

                {isSelected && (
                  <>
                    {/* Resize handles */}
                    <div
                      className="absolute -top-1 -left-1 w-3 h-3 bg-sky-500 cursor-nw-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "nw")}
                    />
                    <div
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-sky-500 cursor-n-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "n")}
                    />
                    <div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-sky-500 cursor-ne-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "ne")}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-sky-500 cursor-w-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "w")}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-sky-500 cursor-e-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "e")}
                    />
                    <div
                      className="absolute -bottom-1 -left-1 w-3 h-3 bg-sky-500 cursor-sw-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "sw")}
                    />
                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-sky-500 cursor-s-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "s")}
                    />
                    <div
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-sky-500 cursor-se-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "se")}
                    />

                    {/* Rotation handle */}
                    <div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 w-4 h-4 bg-sky-500 cursor-grab rounded-full"
                      onMouseDown={(e) => handleRotateMouseDown(e, element)}
                    >
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-5 bg-sky-500"></div>
                    </div>
                  </>
                )}
              </div>
            )
          }

          if (element.type === "image") {
            const imageStyle = getImageFilterStyle(element)
            const isHovering = hoveredElements.has(element.id)
            const image3DEffectStyle = element.imageEffect3d
              ? getImage3DEffectStyle(element.imageEffect3d, element.imageEffect3d.hover && isHovering)
              : {}

            return (
              <div
                key={element.id}
                className={`absolute ${isSelected ? "ring-2 ring-sky-500" : ""} ${getInteractionClasses(element.interactions)}`}
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  transform: getElementTransform(element),
                  transformOrigin: "center center",
                }}
                onMouseDown={(e) => handleElementMouseDown(e, element)}
                onMouseEnter={() => handleElementHover(element.id, true)}
                onMouseLeave={() => handleElementHover(element.id, false)}
                onClick={(e) => handleImageClick(e, element, element.interactions)}
              >
                <img
                  src={element.src || "/placeholder.svg"}
                  alt="Slide element"
                  className="w-full h-full object-cover pointer-events-none"
                  style={{
                    ...imageStyle,
                    ...getInteractionStyle(element, hoveredElements.has(element.id), element.interactions),
                  }}
                />

                {/* Tooltip */}
                {element.interactions?.tooltip && hoveredElements.has(element.id) && (
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap pointer-events-none z-50">
                    {element.interactions.tooltip}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900" />
                  </div>
                )}

                {isSelected && (
                  <>
                    {/* Resize handles */}
                    <div
                      className="absolute -top-1 -left-1 w-3 h-3 bg-sky-500 cursor-nw-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "nw")}
                    />
                    <div
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-sky-500 cursor-n-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "n")}
                    />
                    <div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-sky-500 cursor-ne-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "ne")}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-sky-500 cursor-w-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "w")}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-sky-500 cursor-e-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "e")}
                    />
                    <div
                      className="absolute -bottom-1 -left-1 w-3 h-3 bg-sky-500 cursor-sw-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "sw")}
                    />
                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-sky-500 cursor-s-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "s")}
                    />
                    <div
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-sky-500 cursor-se-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "se")}
                    />

                    {/* Rotation handle */}
                    <div
                      className="absolute -top-6 left-1/2 -translate-x-1/2 w-4 h-4 bg-yellow-500 rounded-full cursor-grab active:cursor-grabbing flex items-center justify-center"
                      onMouseDown={(e) => handleRotateMouseDown(e, element)}
                    >
                      <div className="w-1 h-2 bg-white rounded-sm" />
                    </div>
                  </>
                )}
              </div>
            )
          }

          if (element.type === "video") {
            return (
              <div
                key={element.id}
                className={`absolute cursor-move transition-all duration-150 ${isSelected ? "ring-2 ring-blue-500" : ""}`}
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  transform: getElementTransform(element),
                  transformOrigin: "center center",
                }}
                onMouseDown={(e) => handleElementMouseDown(e, element)}
              >
                <video
                  src={element.src}
                  className="w-full h-full object-cover"
                  autoPlay={element.autoplay}
                  controls={element.controls}
                  loop={element.loop}
                  muted={element.muted}
                />

                {isSelected && (
                  <>
                    {/* Resize handles */}
                    <div
                      className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 cursor-nw-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "nw")}
                    />
                    <div
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-n-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "n")}
                    />
                    <div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 cursor-ne-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "ne")}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-blue-500 cursor-w-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "w")}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-blue-500 cursor-e-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "e")}
                    />
                    <div
                      className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 cursor-sw-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "sw")}
                    />
                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-s-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "s")}
                    />
                    <div
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "se")}
                    />

                    {/* Rotation handle */}
                    <div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 cursor-grab rounded-full"
                      onMouseDown={(e) => handleRotateMouseDown(e, element)}
                    >
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-5 bg-blue-500"></div>
                    </div>
                  </>
                )}
              </div>
            )
          }

          if (element.type === "audio") {
            return (
              <div
                key={element.id}
                className={`absolute cursor-move transition-all duration-150 ${isSelected ? "ring-2 ring-blue-500" : ""}`}
                style={{
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  transform: getElementTransform(element),
                  transformOrigin: "center center",
                }}
                onMouseDown={(e) => handleElementMouseDown(e, element)}
              >
                <audio
                  src={element.src}
                  className="w-full h-full"
                  autoPlay={element.autoplay}
                  controls={element.controls}
                  loop={element.loop}
                />

                {isSelected && (
                  <>
                    {/* Resize handles */}
                    <div
                      className="absolute -top-1 -left-1 w-3 h-3 bg-blue-500 cursor-nw-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "nw")}
                    />
                    <div
                      className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-n-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "n")}
                    />
                    <div
                      className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 cursor-ne-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "ne")}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -left-1 w-3 h-3 bg-blue-500 cursor-w-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "w")}
                    />
                    <div
                      className="absolute top-1/2 -translate-y-1/2 -right-1 w-3 h-3 bg-blue-500 cursor-e-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "e")}
                    />
                    <div
                      className="absolute -bottom-1 -left-1 w-3 h-3 bg-blue-500 cursor-sw-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "sw")}
                    />
                    <div
                      className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-blue-500 cursor-s-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "s")}
                    />
                    <div
                      className="absolute -bottom-1 -right-1 w-3 h-3 bg-blue-500 cursor-se-resize rounded-sm"
                      onMouseDown={(e) => handleResizeMouseDown(e, element, "se")}
                    />

                    {/* Rotation handle */}
                    <div
                      className="absolute -top-8 left-1/2 -translate-x-1/2 w-4 h-4 bg-blue-500 cursor-grab rounded-full"
                      onMouseDown={(e) => handleRotateMouseDown(e, element)}
                    >
                      <div className="absolute top-full left-1/2 -translate-x-1/2 w-0.5 h-5 bg-blue-500"></div>
                    </div>
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
