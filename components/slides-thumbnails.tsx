"use client"

import type React from "react"

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
                ? "ring-2 ring-pink-400 shadow-lg shadow-pink-500/30 scale-105"
                : "hover:ring-2 hover:ring-cyan-500/50 hover:scale-102 hover:shadow-lg hover:shadow-cyan-500/20"
            }`}
            onClick={() => onSelectSlide(index)}
          >
            <div className="relative">
              {/* Cyberpunk glow effect for active slide */}
              {isActive && (
                <>
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/30 via-cyan-500/30 to-purple-500/30 rounded-2xl blur-md animate-cyber-pulse"></div>
                  <div className="absolute -inset-[2px] bg-gradient-to-r from-pink-500 via-cyan-500 to-purple-500 rounded-2xl opacity-20 animate-shimmer"></div>
                </>
              )}

              <div
                className={`relative w-full aspect-video rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                  isActive
                    ? "border-pink-400/50 bg-gray-900/60 shadow-[0_0_20px_rgba(236,72,153,0.3)]"
                    : "border-gray-700/40 bg-gray-900/40 group-hover:border-cyan-500/60 group-hover:shadow-[0_0_15px_rgba(34,211,238,0.2)]"
                }`}
                style={getBackgroundStyles(slide.background)}
              >
                {/* Background overlay for image backgrounds */}
                {typeof slide.background !== "string" &&
                  slide.background.type === "image" &&
                  slide.background.overlay && (
                    <div className="absolute inset-0" style={{ backgroundColor: slide.background.overlay }} />
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
                <div
                  className={`absolute bottom-2 right-2 px-2 py-1 rounded-lg text-xs font-bold transition-all duration-300 backdrop-blur-md ${
                    isActive
                      ? "bg-pink-500/80 text-white shadow-lg shadow-pink-500/50 border border-pink-400/50"
                      : "bg-gray-900/80 text-gray-300 group-hover:bg-cyan-500/60 group-hover:text-white border border-gray-700/50"
                  }`}
                >
                  {index + 1}
                </div>

                {/* Active indicator with neon effect */}
                {isActive && (
                  <div className="absolute top-2 left-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8),0_0_20px_rgba(34,211,238,0.5)]"></div>
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
