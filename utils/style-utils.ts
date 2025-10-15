import type React from "react"
import type { ShapeElement } from "@/types/editor"

/**
 * Generates glassmorphism CSS styles for shape elements
 */
export function getGlassmorphismStyles(element: ShapeElement): React.CSSProperties {
  if (!element.glassmorphism?.enabled) {
    return {}
  }

  const { blur, opacity, borderOpacity, saturation } = element.glassmorphism

  return {
    backgroundColor: `${element.color}${Math.round((opacity / 100) * 255)
      .toString(16)
      .padStart(2, "0")}`,
    backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
    border: `1px solid ${element.color}${Math.round((borderOpacity / 100) * 255)
      .toString(16)
      .padStart(2, "0")}`,
    boxShadow: `0 8px 32px 0 rgba(31, 38, 135, 0.37)`,
  }
}
