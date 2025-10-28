"use client"

import type { Slide } from "@/types/editor"
import { RenderShape } from "@/utils/shape-utils"
import { getTextEffectStyle } from "./text-effects"
import { getImage3DEffectStyle } from "./image-3d-effects"

interface SlidesThumbnailsProps {
  slides: Slide[]
  currentSlideIndex: number
  onSelectSlide: (index: number) => void
}

export default function SlidesThumbnails({ slides, currentSlideIndex, onSelectSlide }: SlidesThumbnailsProps) {
  const getBackgroundStyles = (background: Slide["background"]) => {
    if (typeof background === "string") {
      return { background }
    }

    if (background.type === "color") {
      return { backgroundColor: background.value }
    }

    if (background.type === "gradient") {
      return { background: background.value }
    }

    if (background.type === "image") {
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: background.imagePosition || "cover",
        backgroundPosition: "center",
        opacity: (background.imageOpacity || 100) / 100,
      }
    }

    return {}
  }

  const getImageFilterStyle = (element: any) => {
    if (element.type !== "image" || !element.filters) return {}

    const { filters, effects, imageEffect3d } = element

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
      ...getImage3DEffectStyle(imageEffect3d),
    }

    if (effects) {
      if (effects.borderRadius) style.borderRadius = `${effects.borderRadius}%`
      if (effects.borderWidth) {
        style.border = `${effects.borderWidth}px solid ${effects.borderColor || "#ffffff"}`
      }
      if (effects.shadowBlur) {
        style.boxShadow = `${effects.shadowOffsetX || 0}px ${effects.shadowOffsetY || 0}px ${effects.shadowBlur}px ${effects.shadowColor || "#000000"}`
      }
    }

    return style
  }

  return (
    <div className="space-y-3">
      {slides.map((slide, index) => {
        const isActive = index === currentSlideIndex
        
        return (
          <div
            key={slide.id}
            className={`relative group cursor-pointer transition-all duration-300 ${
              isActive 
                ? "ring-2 ring-blue-400 shadow-lg shadow-blue-500/25 scale-105" 
                : "hover:ring-2 hover:ring-gray-500/50 hover:scale-102 hover:shadow-lg hover:shadow-black/20"
            }`}
            onClick={() => onSelectSlide(index)}
          >
            <div className="relative">
              {/* Glow effect for active slide */}
              {isActive && (
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-purple-500/30 rounded-2xl blur-sm"></div>
              )}
              
              <div
                className={`relative w-full aspect-video rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                  isActive 
                    ? "border-blue-400/50 bg-gray-800/40" 
                    : "border-gray-700/40 bg-gray-800/20 group-hover:border-gray-600/60"
                }`}
                style={getBackgroundStyles(slide.background)}
              >
                {/* Background overlay for image backgrounds */}
                {typeof slide.background !== "string" && slide.background.type === "image" && slide.background.overlay && (
                  <div 
                    className="absolute inset-0" 
                    style={{ backgroundColor: slide.background.overlay }} 
                  />
                )}

                {/* Slide elements */}
                {slide.elements.map((element) => {
                  const scale = 0.15 // Scale factor for thumbnail

                  if (element.type === "text") {
                    return (
                      <div
                        key={element.id}
                        className="absolute text-white overflow-hidden"
                        style={{
                          left: `${element.x * scale}px`,
                          top: `${element.y * scale}px`,
                          width: `${element.width * scale}px`,
                          height: `${element.height * scale}px`,
                          fontSize: `${Math.max(4, element.fontSize * scale)}px`,
                          fontWeight: element.fontWeight,
                          textAlign: element.textAlign as any,
                          fontFamily: element.fontFamily,
                          fontStyle: element.fontStyle || "normal",
                          textDecoration: element.textDecoration || "none",
                          transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
                          transformOrigin: "center center",
                          ...getTextEffectStyle(element.textEffect),
                        }}
                      >
                        {element.content}
                      </div>
                    )
                  }

                  if (element.type === "shape") {
                    return (
                      <div
                        key={element.id}
                        className="absolute"
                        style={{
                          left: `${element.x * scale}px`,
                          top: `${element.y * scale}px`,
                          width: `${element.width * scale}px`,
                          height: `${element.height * scale}px`,
                          transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
                          transformOrigin: "center center",
                        }}
                      >
                        <RenderShape
                          shape={element.shape}
                          width={element.width * scale}
                          height={element.height * scale}
                          color={element.color}
                          glassmorphism={element.glassmorphism}
                          cornerRadius={element.cornerRadius ? element.cornerRadius * scale : 0}
                        />
                      </div>
                    )
                  }

                  if (element.type === "image") {
                    return (
                      <img
                        key={element.id}
                        src={element.src || "/placeholder.svg"}
                        alt="Slide element"
                        className="absolute object-cover"
                        style={{
                          left: `${element.x * scale}px`,
                          top: `${element.y * scale}px`,
                          width: `${element.width * scale}px`,
                          height: `${element.height * scale}px`,
                          transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
                          transformOrigin: "center center",
                          ...getImageFilterStyle(element),
                        }}
                      />
                    )
                  }

                  if (element.type === "video") {
                    return (
                      <div
                        key={element.id}
                        className="absolute bg-gray-800 border border-gray-600 rounded flex items-center justify-center"
                        style={{
                          left: `${element.x * scale}px`,
                          top: `${element.y * scale}px`,
                          width: `${element.width * scale}px`,
                          height: `${element.height * scale}px`,
                          transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
                          transformOrigin: "center center",
                        }}
                      >
                        <div className="text-gray-400 text-xs">📹</div>
                      </div>
                    )
                  }

                  if (element.type === "audio") {
                    return (
                      <div
                        key={element.id}
                        className="absolute bg-gray-800 border border-gray-600 rounded flex items-center justify-center"
                        style={{
                          left: `${element.x * scale}px`,
                          top: `${element.y * scale}px`,
                          width: `${element.width * scale}px`,
                          height: `${element.height * scale}px`,
                          transform: element.rotation ? `rotate(${element.rotation}deg)` : "none",
                          transformOrigin: "center center",
                        }}
                      >
                        <div className="text-gray-400 text-xs">🎵</div>
                      </div>
                    )
                  }

                  return null
                })}

                {/* Slide number overlay */}
                <div className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-bold transition-all duration-300 ${
                  isActive 
                    ? "bg-blue-500/80 text-white shadow-lg" 
                    : "bg-gray-800/80 text-gray-300 group-hover:bg-gray-700/80"
                }`}>
                  {index + 1}
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-2 left-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
