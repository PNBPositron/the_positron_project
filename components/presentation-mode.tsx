"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import type { Slide, SlideElement, SlideBackground } from "@/types/editor"
import { renderShape } from "@/utils/shape-utils"
import { getGlassmorphismStyles } from "@/utils/style-utils"

interface PresentationModeProps {
  slides: Slide[]
  initialSlide?: number
  onExit: () => void
}

export default function PresentationMode({ slides, initialSlide = 0, onExit }: PresentationModeProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlide)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [direction, setDirection] = useState<"forward" | "backward">("forward")
  const [elementsVisible, setElementsVisible] = useState<Record<string, boolean>>({})

  const currentSlide = slides[currentSlideIndex]
  const transition = currentSlide.transition || { type: "fade", duration: 0.5, easing: "ease" }

  // Initialize element visibility
  useEffect(() => {
    const initialVisibility: Record<string, boolean> = {}
    currentSlide.elements.forEach((element) => {
      initialVisibility[element.id] = false
    })
    setElementsVisible(initialVisibility)

    // Trigger animations for onLoad elements
    const timer = setTimeout(() => {
      const updatedVisibility: Record<string, boolean> = {}
      currentSlide.elements.forEach((element) => {
        if (element.animation?.trigger === "onLoad") {
          updatedVisibility[element.id] = true
        }
      })
      setElementsVisible(updatedVisibility)
    }, 100)

    return () => clearTimeout(timer)
  }, [currentSlideIndex, currentSlide.elements])

  const goToNextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1 && !isTransitioning) {
      setDirection("forward")
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentSlideIndex(currentSlideIndex + 1)
        setIsTransitioning(false)
      }, transition.duration * 1000)
    }
  }, [currentSlideIndex, slides.length, isTransitioning, transition.duration])

  const goToPreviousSlide = useCallback(() => {
    if (currentSlideIndex > 0 && !isTransitioning) {
      setDirection("backward")
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentSlideIndex(currentSlideIndex - 1)
        setIsTransitioning(false)
      }, transition.duration * 1000)
    }
  }, [currentSlideIndex, isTransitioning, transition.duration])

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        goToNextSlide()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        goToPreviousSlide()
      } else if (e.key === "Escape") {
        onExit()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [goToNextSlide, goToPreviousSlide, onExit])

  const handleElementClick = (element: SlideElement) => {
    if (element.animation?.trigger === "onClick") {
      setElementsVisible((prev) => ({
        ...prev,
        [element.id]: !prev[element.id],
      }))
    }
  }

  const getBackgroundStyle = (background: string | SlideBackground): React.CSSProperties => {
    if (typeof background === "string") {
      return {
        background,
      }
    }

    if (background.type === "color") {
      return {
        backgroundColor: background.value,
      }
    }

    if (background.type === "gradient") {
      return {
        background: background.value,
      }
    }

    if (background.type === "image") {
      return {
        backgroundImage: `url(${background.value})`,
        backgroundSize: background.imagePosition || "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }
    }

    return {}
  }

  const getTransitionClass = () => {
    if (!isTransitioning) return ""

    const baseClass = "transition-all"
    const durationClass = `duration-[${transition.duration * 1000}ms]`
    const easingMap = {
      linear: "ease-linear",
      ease: "ease",
      "ease-in": "ease-in",
      "ease-out": "ease-out",
      "ease-in-out": "ease-in-out",
    }
    const easingClass = easingMap[transition.easing] || "ease"

    switch (transition.type) {
      case "fade":
        return `${baseClass} ${durationClass} ${easingClass} ${isTransitioning ? "opacity-0" : "opacity-100"}`
      case "slide":
        const slideDirection = transition.direction || "left"
        const offset = direction === "forward" ? "100%" : "-100%"
        if (slideDirection === "left") {
          return `${baseClass} ${durationClass} ${easingClass} ${isTransitioning ? `translate-x-[-${offset}]` : "translate-x-0"}`
        } else if (slideDirection === "right") {
          return `${baseClass} ${durationClass} ${easingClass} ${isTransitioning ? `translate-x-[${offset}]` : "translate-x-0"}`
        } else if (slideDirection === "top") {
          return `${baseClass} ${durationClass} ${easingClass} ${isTransitioning ? `translate-y-[-${offset}]` : "translate-y-0"}`
        } else if (slideDirection === "bottom") {
          return `${baseClass} ${durationClass} ${easingClass} ${isTransitioning ? `translate-y-[${offset}]` : "translate-y-0"}`
        }
        return ""
      case "zoom":
        return `${baseClass} ${durationClass} ${easingClass} ${isTransitioning ? "scale-0" : "scale-100"}`
      case "flip":
        return `${baseClass} ${durationClass} ${easingClass} ${isTransitioning ? "rotate-y-180" : "rotate-y-0"}`
      default:
        return ""
    }
  }

  const getElementAnimationClass = (element: SlideElement) => {
    if (!element.animation || !elementsVisible[element.id]) return "opacity-0"

    const animation = element.animation
    const baseClass = "transition-all"
    const delayClass = `delay-[${animation.delay * 1000}ms]`
    const durationClass = `duration-[${animation.duration * 1000}ms]`
    const easingMap = {
      linear: "ease-linear",
      ease: "ease",
      "ease-in": "ease-in",
      "ease-out": "ease-out",
      "ease-in-out": "ease-in-out",
    }
    const easingClass = easingMap[animation.easing] || "ease"

    const classes = [baseClass, delayClass, durationClass, easingClass]

    switch (animation.type) {
      case "fade":
        classes.push("opacity-100")
        break
      case "slide":
        classes.push("opacity-100")
        if (animation.direction === "left") classes.push("translate-x-0")
        else if (animation.direction === "right") classes.push("translate-x-0")
        else if (animation.direction === "top") classes.push("translate-y-0")
        else if (animation.direction === "bottom") classes.push("translate-y-0")
        break
      case "zoom":
        classes.push("opacity-100", "scale-100")
        break
      case "bounce":
        classes.push("opacity-100", "animate-bounce")
        break
      case "flip":
        classes.push("opacity-100")
        break
      case "rotate":
        classes.push("opacity-100", "rotate-0")
        break
      default:
        classes.push("opacity-100")
    }

    return classes.join(" ")
  }

  const getElementInitialStyle = (element: SlideElement): React.CSSProperties => {
    if (!element.animation || elementsVisible[element.id]) return {}

    switch (element.animation.type) {
      case "slide":
        if (element.animation.direction === "left") return { transform: "translateX(100%)" }
        if (element.animation.direction === "right") return { transform: "translateX(-100%)" }
        if (element.animation.direction === "top") return { transform: "translateY(100%)" }
        if (element.animation.direction === "bottom") return { transform: "translateY(-100%)" }
        return {}
      case "zoom":
        return { transform: "scale(0)" }
      case "flip":
        return { transform: "rotateY(180deg)" }
      case "rotate":
        return { transform: "rotate(180deg)" }
      default:
        return {}
    }
  }

  const renderElement = (element: SlideElement) => {
    const commonProps = {
      key: element.id,
      className: getElementAnimationClass(element),
      style: {
        position: "absolute" as const,
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
        cursor: element.animation?.trigger === "onClick" ? "pointer" : "default",
        ...getElementInitialStyle(element),
      },
      onClick: () => handleElementClick(element),
    }

    if (element.type === "text") {
      const textEffect = element.textEffect || { type: "none" }
      let textStyle: React.CSSProperties = {}

      switch (textEffect.type) {
        case "shadow":
          textStyle = {
            textShadow: `${textEffect.depth || 5}px ${textEffect.depth || 5}px 0px ${textEffect.color || "#000000"}`,
          }
          break
        case "extrude":
          const extrudeDepth = textEffect.depth || 5
          const shadows = Array.from(
            { length: extrudeDepth },
            (_, i) => `${i}px ${i}px 0px ${textEffect.color || "#000000"}`,
          ).join(", ")
          textStyle = {
            textShadow: shadows,
          }
          break
        case "neon":
          textStyle = {
            textShadow: `0 0 ${textEffect.intensity || 5}px ${textEffect.color || "#00ff00"}, 0 0 ${(textEffect.intensity || 5) * 2}px ${textEffect.color || "#00ff00"}`,
            color: textEffect.color || "#00ff00",
          }
          break
        case "3d-rotate":
          textStyle = {
            transform: `perspective(${textEffect.perspective || 500}px) rotateX(${textEffect.angle || 45}deg)`,
            textShadow: `0 ${textEffect.depth || 5}px ${textEffect.depth || 5}px rgba(0,0,0,0.3)`,
          }
          break
        case "perspective":
          textStyle = {
            transform: `perspective(${textEffect.perspective || 500}px) rotateY(${textEffect.angle || 15}deg)`,
          }
          break
      }

      return (
        <div
          {...commonProps}
          style={{
            ...commonProps.style,
            fontSize: element.fontSize,
            fontWeight: element.fontWeight,
            textAlign: element.textAlign as any,
            fontFamily: element.fontFamily,
            fontStyle: element.fontStyle,
            textDecoration: element.textDecoration,
            display: "flex",
            alignItems: "center",
            justifyContent:
              element.textAlign === "center" ? "center" : element.textAlign === "right" ? "flex-end" : "flex-start",
            ...textStyle,
          }}
        >
          {element.content}
        </div>
      )
    }

    if (element.type === "shape") {
      const glassmorphismStyles = getGlassmorphismStyles(element)

      return (
        <div
          {...commonProps}
          style={{
            ...commonProps.style,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            ...glassmorphismStyles,
          }}
        >
          {renderShape(element.shape, element.width, element.height, element.color, element.cornerRadius)}
        </div>
      )
    }

    if (element.type === "image") {
      const filters = element.filters || {}
      const effects = element.effects || {}
      const imageEffect3d = element.imageEffect3d || { type: "none" }

      let filterString = ""
      if (filters.grayscale) filterString += `grayscale(${filters.grayscale}%) `
      if (filters.sepia) filterString += `sepia(${filters.sepia}%) `
      if (filters.blur) filterString += `blur(${filters.blur}px) `
      if (filters.brightness) filterString += `brightness(${filters.brightness}%) `
      if (filters.contrast) filterString += `contrast(${filters.contrast}%) `
      if (filters.hueRotate) filterString += `hue-rotate(${filters.hueRotate}deg) `
      if (filters.saturate) filterString += `saturate(${filters.saturate}%) `
      if (filters.opacity !== undefined) filterString += `opacity(${filters.opacity}%) `

      let transform3d = ""
      if (imageEffect3d.type !== "none") {
        const {
          intensity = 5,
          angle = 15,
          perspective = 800,
          rotateX = 0,
          rotateY = 0,
          rotateZ = 0,
          translateZ = 0,
        } = imageEffect3d

        switch (imageEffect3d.type) {
          case "tilt":
            transform3d = `perspective(${perspective}px) rotateX(${angle}deg) rotateY(${angle}deg)`
            break
          case "flip":
            transform3d = `perspective(${perspective}px) rotateY(${angle * 10}deg)`
            break
          case "rotate":
            transform3d = `perspective(${perspective}px) rotateZ(${angle * 2}deg)`
            break
          case "float":
            transform3d = `perspective(${perspective}px) translateZ(${intensity * 5}px)`
            break
          case "perspective":
            transform3d = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg) translateZ(${translateZ}px)`
            break
          case "fold":
            transform3d = `perspective(${perspective}px) rotateY(${angle * 5}deg)`
            break
        }
      }

      const imageTransform = [
        element.rotation ? `rotate(${element.rotation}deg)` : "",
        transform3d,
        effects.skewX ? `skewX(${effects.skewX}deg)` : "",
        effects.skewY ? `skewY(${effects.skewY}deg)` : "",
        effects.scale ? `scale(${effects.scale / 100})` : "",
      ]
        .filter(Boolean)
        .join(" ")

      return (
        <img
          {...commonProps}
          src={element.src || "/placeholder.svg"}
          alt="Presentation element"
          style={{
            ...commonProps.style,
            filter: filterString.trim(),
            borderRadius: effects.borderRadius ? `${effects.borderRadius}%` : undefined,
            border: effects.borderWidth ? `${effects.borderWidth}px solid ${effects.borderColor}` : undefined,
            boxShadow: effects.shadowBlur
              ? `${effects.shadowOffsetX || 0}px ${effects.shadowOffsetY || 0}px ${effects.shadowBlur}px ${effects.shadowColor || "#000000"}`
              : undefined,
            transform: imageTransform || (element.rotation ? `rotate(${element.rotation}deg)` : undefined),
            objectFit: "cover",
            transition: imageEffect3d.hover ? "transform 0.3s ease" : undefined,
          }}
          onMouseEnter={(e) => {
            if (imageEffect3d.hover && transform3d) {
              e.currentTarget.style.transform = `${imageTransform} scale(1.05)`
            }
          }}
          onMouseLeave={(e) => {
            if (imageEffect3d.hover) {
              e.currentTarget.style.transform = imageTransform
            }
          }}
        />
      )
    }

    if (element.type === "video") {
      return (
        <video
          {...commonProps}
          src={element.src}
          autoPlay={element.autoplay}
          controls={element.controls}
          loop={element.loop}
          muted={element.muted}
          style={{
            ...commonProps.style,
            objectFit: "cover",
          }}
        />
      )
    }

    if (element.type === "audio") {
      return (
        <audio
          {...commonProps}
          src={element.src}
          autoPlay={element.autoplay}
          controls={element.controls}
          loop={element.loop}
          style={commonProps.style}
        />
      )
    }

    return null
  }

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <div className="px-4 py-2 bg-gray-900/80 backdrop-blur-xl rounded-lg text-white text-sm">
          {currentSlideIndex + 1} / {slides.length}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={onExit}
          className="bg-gray-900/80 backdrop-blur-xl hover:bg-gray-800 text-white"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Slide Content */}
      <div className="flex-1 relative overflow-hidden">
        <div className={`absolute inset-0 ${getTransitionClass()}`} style={getBackgroundStyle(currentSlide.background)}>
          <div className="relative w-full h-full">{currentSlide.elements.map((element) => renderElement(element))}</div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-4 z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPreviousSlide}
          disabled={currentSlideIndex === 0 || isTransitioning}
          className="bg-gray-900/80 backdrop-blur-xl hover:bg-gray-800 text-white disabled:opacity-30 h-12 w-12 rounded-full"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextSlide}
          disabled={currentSlideIndex === slides.length - 1 || isTransitioning}
          className="bg-gray-900/80 backdrop-blur-xl hover:bg-gray-800 text-white disabled:opacity-30 h-12 w-12 rounded-full"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>
    </div>
  )
}
