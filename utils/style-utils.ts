import type { CSSProperties } from "react"

interface GlassmorphismSettings {
  enabled: boolean
  blur: number
  opacity: number
  borderOpacity: number
  saturation: number
}

export function getGlassmorphismStyles(glassmorphism?: GlassmorphismSettings, baseColor?: string): CSSProperties {
  if (!glassmorphism?.enabled) {
    return {}
  }

  // Parse the base color and adjust opacity
  const adjustOpacity = (color: string, opacity: number) => {
    // Handle hex colors
    if (color.startsWith("#")) {
      const hex = color.replace("#", "")
      const r = Number.parseInt(hex.substring(0, 2), 16)
      const g = Number.parseInt(hex.substring(2, 4), 16)
      const b = Number.parseInt(hex.substring(4, 6), 16)
      return `rgba(${r}, ${g}, ${b}, ${opacity / 100})`
    }
    // Handle rgba colors
    if (color.startsWith("rgba")) {
      return color.replace(/[\d.]+\)$/g, `${opacity / 100})`)
    }
    // Handle rgb colors
    if (color.startsWith("rgb")) {
      return color.replace("rgb", "rgba").replace(")", `, ${opacity / 100})`)
    }
    return color
  }

  const backgroundColor = baseColor
    ? adjustOpacity(baseColor, glassmorphism.opacity)
    : `rgba(255, 255, 255, ${glassmorphism.opacity / 100})`
  const borderColor = baseColor
    ? adjustOpacity(baseColor, glassmorphism.borderOpacity)
    : `rgba(255, 255, 255, ${glassmorphism.borderOpacity / 100})`

  return {
    backgroundColor,
    backdropFilter: `blur(${glassmorphism.blur}px) saturate(${glassmorphism.saturation}%)`,
    WebkitBackdropFilter: `blur(${glassmorphism.blur}px) saturate(${glassmorphism.saturation}%)`,
    border: `1px solid ${borderColor}`,
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  }
}
