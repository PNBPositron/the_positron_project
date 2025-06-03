"use client"

import type { Slide } from "@/types/editor"
import { RenderShape } from "@/utils/shape-utils"
import { useState } from "react"
import { ChevronDown, ChevronUp, ArrowRightLeft } from "lucide-react"

interface SlidesThumbnailsProps {
  slides: Slide[]
  currentSlideIndex: number
  onSelectSlide: (index: number) => void
}

export default function SlidesThumbnails({ slides, currentSlideIndex, onSelectSlide }: SlidesThumbnailsProps) {
  const [isCollapsed, setIsCollapsed] = useState<Record<number, boolean>>({})

  const toggleCollapse = (index: number) => {
    setIsCollapsed((prev) => ({
      ...prev,
      [index]: !prev[index],
    }))
  }

  return (
    <div className="grid gap-1">
      {slides.map((slide, index) => {
        const isCurrentSlide = index === currentSlideIndex
        const hasTransition = slide.transition && slide.transition.type !== "none"

        return (
          <div key={slide.id} className="relative">
            {/* Timeline connector */}
            {index > 0 && (
              <div className="absolute left-3 -top-3 w-0.5 h-3 bg-gradient-to-b from-blue-400/30 to-yellow-400/30"></div>
            )}
            {index < slides.length - 1 && (
              <div className="absolute left-3 -bottom-3 w-0.5 h-3 bg-gradient-to-b from-blue-400/30 to-yellow-400/30"></div>
            )}

            <div className="flex items-start gap-2">
              {/* Timeline node */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium mt-1
                  ${
                    isCurrentSlide
                      ? "bg-gradient-to-r from-blue-500 to-yellow-400 text-white shadow-lg shadow-blue-500/20"
                      : "bg-gray-800 text-gray-400 border border-gray-700"
                  }`}
              >
                {index + 1}
              </div>

              <div className="flex-1">
                <div
                  className={`
                    border rounded-md overflow-hidden cursor-pointer transition-all group
                    ${
                      isCurrentSlide
                        ? "ring-2 ring-blue-500/70 border-gray-700 shadow-lg shadow-blue-500/10"
                        : "border-gray-800 hover:ring-1 hover:ring-blue-500/50"
                    }
                  `}
                  onClick={() => onSelectSlide(index)}
                >
                  <div className="flex items-center justify-between px-2 py-1 bg-gray-800/70">
                    <span className="text-xs text-gray-300 truncate max-w-[120px]">
                      {slide.elements.find((el) => el.type === "text")?.content || `Slide ${index + 1}`}
                    </span>
                    <button
                      className="text-gray-400 hover:text-gray-200 p-0.5 rounded"
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleCollapse(index)
                      }}
                    >
                      {isCollapsed[index] ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                    </button>
                  </div>

                  {!isCollapsed[index] && (
                    <div
                      className="w-full aspect-video relative scale-[0.98] origin-center my-1"
                      style={{ background: typeof slide.background === "string" ? slide.background : undefined }}
                    >
                      {typeof slide.background !== "string" && slide.background.type === "color" && (
                        <div className="absolute inset-0" style={{ backgroundColor: slide.background.value }}></div>
                      )}
                      {typeof slide.background !== "string" && slide.background.type === "gradient" && (
                        <div className="absolute inset-0" style={{ background: slide.background.value }}></div>
                      )}
                      {typeof slide.background !== "string" && slide.background.type === "image" && (
                        <div
                          className="absolute inset-0 bg-center bg-no-repeat"
                          style={{
                            backgroundImage: `url(${slide.background.value})`,
                            backgroundSize: slide.background.imagePosition || "cover",
                            opacity: (slide.background.imageOpacity || 100) / 100,
                          }}
                        ></div>
                      )}

                      {slide.elements.map((element) => {
                        if (element.type === "text") {
                          return (
                            <div
                              key={element.id}
                              className="absolute overflow-hidden text-white"
                              style={{
                                left: `${element.x / 10}px`,
                                top: `${element.y / 10}px`,
                                width: `${element.width / 10}px`,
                                height: `${element.height / 10}px`,
                                fontSize: `${element.fontSize / 10}px`,
                                fontWeight: element.fontWeight,
                                textAlign: element.textAlign as any,
                                fontFamily: element.fontFamily,
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
                                left: `${element.x / 10}px`,
                                top: `${element.y / 10}px`,
                                width: `${element.width / 10}px`,
                                height: `${element.height / 10}px`,
                              }}
                            >
                              <RenderShape
                                shape={element.shape}
                                width={element.width / 10}
                                height={element.height / 10}
                                color={element.color}
                              />
                            </div>
                          )
                        }

                        if (element.type === "image") {
                          return (
                            <div
                              key={element.id}
                              className="absolute"
                              style={{
                                left: `${element.x / 10}px`,
                                top: `${element.y / 10}px`,
                                width: `${element.width / 10}px`,
                                height: `${element.height / 10}px`,
                              }}
                            >
                              <img
                                src={element.src || "/placeholder.svg"}
                                alt="Thumbnail"
                                className="w-full h-full object-cover"
                              />
                            </div>
                          )
                        }

                        if (element.type === "video") {
                          return (
                            <div
                              key={element.id}
                              className="absolute bg-gray-700 flex items-center justify-center"
                              style={{
                                left: `${element.x / 10}px`,
                                top: `${element.y / 10}px`,
                                width: `${element.width / 10}px`,
                                height: `${element.height / 10}px`,
                              }}
                            >
                              <div className="text-[6px] text-white">Video</div>
                            </div>
                          )
                        }

                        if (element.type === "audio") {
                          return (
                            <div
                              key={element.id}
                              className="absolute bg-gray-700 flex items-center justify-center"
                              style={{
                                left: `${element.x / 10}px`,
                                top: `${element.y / 10}px`,
                                width: `${element.width / 10}px`,
                                height: `${element.height / 10}px`,
                              }}
                            >
                              <div className="text-[6px] text-white">Audio</div>
                            </div>
                          )
                        }

                        return null
                      })}
                    </div>
                  )}
                </div>

                {/* Transition indicator */}
                {hasTransition && index < slides.length - 1 && !isCollapsed[index] && (
                  <div className="flex items-center justify-center my-1 opacity-70 group-hover:opacity-100">
                    <div className="h-px w-8 bg-gradient-to-r from-blue-400/50 to-yellow-400/50"></div>
                    <div className="px-1 py-0.5 rounded-sm bg-gray-800/70 text-[10px] text-gray-400 flex items-center">
                      <ArrowRightLeft size={8} className="mr-1" />
                      {slide.transition?.type}
                    </div>
                    <div className="h-px w-8 bg-gradient-to-r from-yellow-400/50 to-blue-400/50"></div>
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
