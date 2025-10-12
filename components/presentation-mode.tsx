"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import type { Slide, SlideElement } from "@/types/editor"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { RenderShape } from "@/utils/shape-utils"
import { getTextEffectStyle } from "./text-effects"
import { getImage3DEffectStyle } from "./image-3d-effects"

interface PresentationModeProps {
  slides: Slide[]
  initialSlide: number
  onExit: () => void
}

export default function PresentationMode({ slides, initialSlide, onExit }: PresentationModeProps) {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlide)
  const [previousSlideIndex, setPreviousSlideIndex] = useState<number | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [clickedElements, setClickedElements] = useState<Set<string>>(new Set())
  const [hoveredElements, setHoveredElements] = useState<Set<string>>(new Set())

  const slideContainerRef = useRef<HTMLDivElement>(null)
  const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        goToNextSlide()
      } else if (event.key === "ArrowLeft") {
        goToPreviousSlide()
      } else if (event.key === "Escape") {
        onExit()
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      if (transitionTimeoutRef.current) {
        clearTimeout(transitionTimeoutRef.current)
      }
    }
  }, [currentSlideIndex, slides, onExit])

  const goToNextSlide = () => {
    if (currentSlideIndex < slides.length - 1 && !isTransitioning) {
      setPreviousSlideIndex(currentSlideIndex)
      setIsTransitioning(true)
      setClickedElements(new Set())

      // Wait for transition to complete
      transitionTimeoutRef.current = setTimeout(
        () => {
          setCurrentSlideIndex(currentSlideIndex + 1)
          setIsTransitioning(false)
        },
        (slides[currentSlideIndex].transition?.duration || 0.5) * 1000,
      )
    }
  }

  const goToPreviousSlide = () => {
    if (currentSlideIndex > 0 && !isTransitioning) {
      setPreviousSlideIndex(currentSlideIndex)
      setIsTransitioning(true)
      setClickedElements(new Set())

      // Wait for transition to complete
      transitionTimeoutRef.current = setTimeout(
        () => {
          setCurrentSlideIndex(currentSlideIndex - 1)
          setIsTransitioning(false)
        },
        (slides[currentSlideIndex].transition?.duration || 0.5) * 1000,
      )
    }
  }

  const handleElementClick = (elementId: string) => {
    setClickedElements((prev) => {
      const newSet = new Set(prev)
      newSet.add(elementId)
      return newSet
    })
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
    }

    return style
  }

  const getBackgroundStyles = (slide: Slide) => {
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

  const getElementAnimationStyle = (element: SlideElement) => {
    if (!element.animation || element.animation.type === "none") {
      return {}
    }

    const { animation } = element
    const shouldAnimate =
      animation.trigger === "onLoad" || (animation.trigger === "onClick" && clickedElements.has(element.id))

    if (!shouldAnimate) {
      // Hide element until animation is triggered
      if (animation.trigger === "onClick") {
        return {
          opacity: 0,
          transform: "scale(0.95)",
          transition: "none",
        }
      }
      return {}
    }

    const baseStyle: React.CSSProperties = {
      animationDuration: `${animation.duration}s`,
      animationDelay: `${animation.delay}s`,
      animationFillMode: "both",
      animationTimingFunction: animation.easing,
    }

    switch (animation.type) {
      case "fade":
        return {
          ...baseStyle,
          animationName: "fadeIn",
        }
      case "slide":
        let slideAnimation = "slideInLeft"
        if (animation.direction === "right") slideAnimation = "slideInRight"
        if (animation.direction === "top") slideAnimation = "slideInTop"
        if (animation.direction === "bottom") slideAnimation = "slideInBottom"
        return {
          ...baseStyle,
          animationName: slideAnimation,
        }
      case "zoom":
        return {
          ...baseStyle,
          animationName: "zoomIn",
        }
      case "bounce":
        return {
          ...baseStyle,
          animationName: "bounce",
        }
      case "flip":
        let flipAnimation = "flipInX"
        if (animation.direction === "top" || animation.direction === "bottom") {
          flipAnimation = "flipInY"
        }
        return {
          ...baseStyle,
          animationName: flipAnimation,
        }
      case "rotate":
        return {
          ...baseStyle,
          animationName: "rotateIn",
        }
      default:
        return {}
    }
  }

  const getSlideTransitionStyle = () => {
    if (!isTransitioning || previousSlideIndex === null) return {}

    const currentSlide = slides[currentSlideIndex]
    const prevSlide = slides[previousSlideIndex]
    const transition = prevSlide.transition || { type: "fade", duration: 0.5, easing: "ease" }

    if (transition.type === "none") {
      return {}
    }

    const isForward = previousSlideIndex < currentSlideIndex
    const direction = transition.direction || "left"
    const perspective = transition.perspective || 1000
    const depth = transition.depth || 100
    const rotate = transition.rotate || 90

    const baseStyle: React.CSSProperties = {
      transition: `transform ${transition.duration}s ${transition.easing}, opacity ${transition.duration}s ${transition.easing}`,
    }

    switch (transition.type) {
      case "fade":
        return {
          ...baseStyle,
          opacity: isForward ? 0 : 1,
        }
      case "slide":
        let transform = ""
        if (direction === "left") transform = isForward ? "translateX(-100%)" : "translateX(100%)"
        if (direction === "right") transform = isForward ? "translateX(100%)" : "translateX(-100%)"
        if (direction === "top") transform = isForward ? "translateY(-100%)" : "translateY(100%)"
        if (direction === "bottom") transform = isForward ? "translateY(100%)" : "translateY(-100%)"
        return {
          ...baseStyle,
          transform,
        }
      case "zoom":
        return {
          ...baseStyle,
          transform: isForward ? "scale(0.5)" : "scale(1.5)",
          opacity: 0,
        }
      case "flip":
        let flipTransform = ""
        if (direction === "left" || direction === "right") {
          flipTransform = `perspective(${perspective}px) rotateY(${isForward ? "-90deg" : "90deg"})`
        } else {
          flipTransform = `perspective(${perspective}px) rotateX(${isForward ? "90deg" : "-90deg"})`
        }
        return {
          ...baseStyle,
          transform: flipTransform,
          transformStyle: "preserve-3d" as const,
          backfaceVisibility: "hidden" as const,
        }
      case "cube":
        let cubeTransform = ""
        if (direction === "left")
          cubeTransform = `perspective(${perspective}px) translateZ(-${depth}px) rotateY(${isForward ? "-90deg" : "90deg"}) translateZ(${depth}px)`
        if (direction === "right")
          cubeTransform = `perspective(${perspective}px) translateZ(-${depth}px) rotateY(${isForward ? "90deg" : "-90deg"}) translateZ(${depth}px)`
        if (direction === "top")
          cubeTransform = `perspective(${perspective}px) translateZ(-${depth}px) rotateX(${isForward ? "90deg" : "-90deg"}) translateZ(${depth}px)`
        if (direction === "bottom")
          cubeTransform = `perspective(${perspective}px) translateZ(-${depth}px) rotateX(${isForward ? "-90deg" : "90deg"}) translateZ(${depth}px)`
        return {
          ...baseStyle,
          transform: cubeTransform,
          transformStyle: "preserve-3d" as const,
        }
      case "carousel":
        let carouselTransform = ""
        if (direction === "left" || direction === "right") {
          const rotateY = isForward
            ? direction === "left"
              ? -rotate
              : rotate
            : direction === "left"
              ? rotate
              : -rotate
          carouselTransform = `perspective(${perspective}px) translateZ(-${depth}px) rotateY(${rotateY}deg)`
        } else {
          const rotateX = isForward ? (direction === "top" ? rotate : -rotate) : direction === "top" ? -rotate : rotate
          carouselTransform = `perspective(${perspective}px) translateZ(-${depth}px) rotateX(${rotateX}deg)`
        }
        return {
          ...baseStyle,
          transform: carouselTransform,
          transformStyle: "preserve-3d" as const,
        }
      case "fold":
        let foldTransform = ""
        if (direction === "left")
          foldTransform = `perspective(${perspective}px) translateX(${isForward ? "-50%" : "0"}) rotateY(${isForward ? "90deg" : "0deg"})`
        if (direction === "right")
          foldTransform = `perspective(${perspective}px) translateX(${isForward ? "50%" : "0"}) rotateY(${isForward ? "-90deg" : "0deg"})`
        if (direction === "top")
          foldTransform = `perspective(${perspective}px) translateY(${isForward ? "-50%" : "0"}) rotateX(${isForward ? "-90deg" : "0deg"})`
        if (direction === "bottom")
          foldTransform = `perspective(${perspective}px) translateY(${isForward ? "50%" : "0"}) rotateX(${isForward ? "90deg" : "0deg"})`
        return {
          ...baseStyle,
          transform: foldTransform,
          transformStyle: "preserve-3d" as const,
          transformOrigin:
            direction === "left"
              ? "left center"
              : direction === "right"
                ? "right center"
                : direction === "top"
                  ? "center top"
                  : "center bottom",
        }
      case "reveal":
        let revealTransform = ""
        let revealOrigin = ""
        if (direction === "left") {
          revealTransform = `perspective(${perspective}px) rotateY(${isForward ? "30deg" : "0deg"})`
          revealOrigin = "left center"
        }
        if (direction === "right") {
          revealTransform = `perspective(${perspective}px) rotateY(${isForward ? "-30deg" : "0deg"})`
          revealOrigin = "right center"
        }
        if (direction === "top") {
          revealTransform = `perspective(${perspective}px) rotateX(${isForward ? "-30deg" : "0deg"})`
          revealOrigin = "center top"
        }
        if (direction === "bottom") {
          revealTransform = `perspective(${perspective}px) rotateX(${isForward ? "30deg" : "0deg"})`
          revealOrigin = "center bottom"
        }
        return {
          ...baseStyle,
          transform: revealTransform,
          transformStyle: "preserve-3d" as const,
          transformOrigin: revealOrigin,
          opacity: isForward ? 0.5 : 1,
        }
      case "room":
        let roomTransform = ""
        if (direction === "left")
          roomTransform = `perspective(${perspective}px) translateZ(-${depth}px) translateX(${isForward ? "-100%" : "0"}) rotateY(${isForward ? rotate : 0}deg)`
        if (direction === "right")
          roomTransform = `perspective(${perspective}px) translateZ(-${depth}px) translateX(${isForward ? "100%" : "0"}) rotateY(${isForward ? -rotate : 0}deg)`
        if (direction === "top")
          roomTransform = `perspective(${perspective}px) translateZ(-${depth}px) translateY(${isForward ? "-100%" : "0"}) rotateX(${isForward ? -rotate : 0}deg)`
        if (direction === "bottom")
          roomTransform = `perspective(${perspective}px) translateZ(-${depth}px) translateY(${isForward ? "100%" : "0"}) rotateX(${isForward ? rotate : 0}deg)`
        return {
          ...baseStyle,
          transform: roomTransform,
          transformStyle: "preserve-3d" as const,
          transformOrigin:
            direction === "left"
              ? "left center"
              : direction === "right"
                ? "right center"
                : direction === "top"
                  ? "center top"
                  : "center bottom",
        }
      default:
        return {}
    }
  }

  const getElementTransform = (element: SlideElement) => {
    let transform = ""

    if (element.rotation) {
      transform += `rotate(${element.rotation}deg)`
    }

    return transform || "none"
  }

  useEffect(() => {
    // Pause all videos and audio when changing slides
    if (isTransitioning) {
      const videos = document.querySelectorAll("video")
      const audios = document.querySelectorAll("audio")

      videos.forEach((video) => {
        if (!video.paused) video.pause()
      })

      audios.forEach((audio) => {
        if (!audio.paused) audio.pause()
      })
    }
  }, [isTransitioning])

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black z-50 flex flex-col">
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInLeft {
          from { transform: translateX(-50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInRight {
          from { transform: translateX(50px); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideInTop {
          from { transform: translateY(-50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideInBottom {
          from { transform: translateY(50px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes zoomIn {
          from { transform: scale(0.5); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-30px); }
          60% { transform: translateY(-15px); }
        }
        @keyframes flipInX {
          from { transform: rotateX(90deg); opacity: 0; }
          to { transform: rotateX(0deg); opacity: 1; }
        }
        @keyframes flipInY {
          from { transform: rotateY(90deg); opacity: 0; }
          to { transform: rotateY(0deg); opacity: 1; }
        }
        @keyframes rotateIn {
          from { transform: rotate(-200deg) scale(0.5); opacity: 0; }
          to { transform: rotate(0deg) scale(1); opacity: 1; }
        }
      `}</style>

      <div className="absolute top-4 right-4 flex gap-2">
        <button
          className="text-gray-300 hover:text-gray-100 bg-gray-900/50 p-2 rounded-full backdrop-blur-sm"
          onClick={goToPreviousSlide}
          disabled={currentSlideIndex === 0}
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          className="text-gray-300 hover:text-gray-100 bg-gray-900/50 p-2 rounded-full backdrop-blur-sm"
          onClick={goToNextSlide}
          disabled={currentSlideIndex === slides.length - 1}
        >
          <ChevronRight className="h-5 w-5" />
        </button>
        <button
          className="text-gray-300 hover:text-gray-100 bg-gray-900/50 p-2 rounded-full backdrop-blur-sm"
          onClick={onExit}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center perspective-1000">
        <div
          ref={slideContainerRef}
          className="relative w-[1000px] h-[562.5px] transform-style-preserve-3d"
          style={getSlideTransitionStyle()}
        >
          <div
            className="w-[1000px] h-[562.5px] shadow-xl relative rounded-lg overflow-hidden"
            style={getBackgroundStyles(slides[currentSlideIndex])}
          >
            {typeof slides[currentSlideIndex].background !== "string" &&
              slides[currentSlideIndex].background.type === "image" && (
                <>
                  <div
                    className="absolute inset-0 w-full h-full"
                    style={{
                      backgroundImage: `url(${slides[currentSlideIndex].background.value})`,
                      backgroundSize: slides[currentSlideIndex].background.imagePosition || "cover",
                      backgroundPosition: "center",
                      opacity: (slides[currentSlideIndex].background.imageOpacity || 100) / 100,
                    }}
                  />
                  {slides[currentSlideIndex].background.overlay && (
                    <div
                      className="absolute inset-0 w-full h-full"
                      style={{ backgroundColor: slides[currentSlideIndex].background.overlay }}
                    />
                  )}
                </>
              )}

            {slides[currentSlideIndex].elements.map((element) => {
              if (element.type === "text") {
                return (
                  <div
                    key={element.id}
                    className="absolute text-white"
                    style={{
                      left: `${element.x}px`,
                      top: `${element.y}px`,
                      width: `${element.width}px`,
                      height: `${element.height}px`,
                      fontSize: `${element.fontSize}px`,
                      fontWeight: element.fontWeight,
                      textAlign: element.textAlign as any,
                      fontFamily: element.fontFamily,
                      fontStyle: element.fontStyle || "normal",
                      textDecoration: element.textDecoration || "none",
                      whiteSpace: "pre-line",
                      wordBreak: "break-word",
                      transform: getElementTransform(element),
                      transformOrigin: "center center",
                      ...getTextEffectStyle(element.textEffect),
                      ...getElementAnimationStyle(element),
                    }}
                    onClick={() => element.animation?.trigger === "onClick" && handleElementClick(element.id)}
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
                      left: `${element.x}px`,
                      top: `${element.y}px`,
                      width: `${element.width}px`,
                      height: `${element.height}px`,
                      transform: getElementTransform(element),
                      transformOrigin: "center center",
                      ...getElementAnimationStyle(element),
                    }}
                    onClick={() => element.animation?.trigger === "onClick" && handleElementClick(element.id)}
                  >
                    <RenderShape
                      shape={element.shape}
                      width={element.width}
                      height={element.height}
                      color={element.color}
                      glassmorphism={element.glassmorphism}
                      cornerRadius={element.cornerRadius}
                    />
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
                    className="absolute"
                    style={{
                      left: `${element.x}px`,
                      top: `${element.y}px`,
                      width: `${element.width}px`,
                      height: `${element.height}px`,
                      transform: getElementTransform(element),
                      transformOrigin: "center center",
                      perspective: element.imageEffect3d?.perspective || 800,
                      ...getElementAnimationStyle(element),
                    }}
                    onClick={() => element.animation?.trigger === "onClick" && handleElementClick(element.id)}
                    onMouseEnter={() => handleElementHover(element.id, true)}
                    onMouseLeave={() => handleElementHover(element.id, false)}
                  >
                    <div
                      className="w-full h-full"
                      style={{
                        ...image3DEffectStyle,
                        transition: "all 0.5s ease",
                      }}
                    >
                      <img
                        src={element.src || "/placeholder.svg"}
                        alt="Slide element"
                        className="w-full h-full object-cover"
                        style={imageStyle}
                      />
                    </div>
                  </div>
                )
              }

              if (element.type === "video") {
                return (
                  <div
                    key={element.id}
                    className="absolute"
                    style={{
                      left: `${element.x}px`,
                      top: `${element.y}px`,
                      width: `${element.width}px`,
                      height: `${element.height}px`,
                      transform: getElementTransform(element),
                      transformOrigin: "center center",
                      ...getElementAnimationStyle(element),
                    }}
                    onClick={() => element.animation?.trigger === "onClick" && handleElementClick(element.id)}
                  >
                    <video
                      src={element.src}
                      className="w-full h-full object-cover"
                      autoPlay={element.autoplay}
                      controls={element.controls}
                      loop={element.loop}
                      muted={element.muted}
                      playsInline
                    />
                  </div>
                )
              }

              if (element.type === "audio") {
                return (
                  <div
                    key={element.id}
                    className="absolute"
                    style={{
                      left: `${element.x}px`,
                      top: `${element.y}px`,
                      width: `${element.width}px`,
                      height: `${element.height}px`,
                      transform: getElementTransform(element),
                      transformOrigin: "center center",
                      ...getElementAnimationStyle(element),
                    }}
                    onClick={() => element.animation?.trigger === "onClick" && handleElementClick(element.id)}
                  >
                    <div className="w-full h-full flex items-center justify-center bg-gray-800/50 rounded-lg p-2">
                      <audio
                        src={element.src}
                        className="w-full"
                        autoPlay={element.autoplay}
                        controls={element.controls}
                        loop={element.loop}
                      />
                    </div>
                  </div>
                )
              }

              return null
            })}
          </div>
        </div>
      </div>

      <div className="text-center text-gray-400 mb-4">
        Slide {currentSlideIndex + 1} of {slides.length}
      </div>
    </div>
  )
}
