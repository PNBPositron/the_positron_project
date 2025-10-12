import type React from "react"

interface GlassmorphismConfig {
  enabled?: boolean
  blur?: number
  opacity?: number
  borderOpacity?: number
  saturation?: number
}

export function getGlassmorphismStyles(glassmorphism?: GlassmorphismConfig, baseColor?: string): React.CSSProperties {
  if (!glassmorphism || !glassmorphism.enabled) {
    return {}
  }

  const blur = glassmorphism.blur || 10
  const opacity = glassmorphism.opacity || 20
  const borderOpacity = glassmorphism.borderOpacity || 30
  const saturation = glassmorphism.saturation || 180

  return {
    backgroundColor: baseColor
      ? `${baseColor}${Math.round((opacity / 100) * 255)
          .toString(16)
          .padStart(2, "0")}`
      : `rgba(255, 255, 255, ${opacity / 100})`,
    backdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(${saturation}%)`,
    border: `1px solid rgba(255, 255, 255, ${borderOpacity / 100})`,
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
  }
}

export function applyImageFilters(filters?: {
  grayscale?: number
  sepia?: number
  blur?: number
  brightness?: number
  contrast?: number
  hueRotate?: number
  saturate?: number
  opacity?: number
}): string {
  if (!filters) return "none"

  const filterParts: string[] = []

  if (filters.grayscale) filterParts.push(`grayscale(${filters.grayscale}%)`)
  if (filters.sepia) filterParts.push(`sepia(${filters.sepia}%)`)
  if (filters.blur) filterParts.push(`blur(${filters.blur}px)`)
  if (filters.brightness && filters.brightness !== 100) filterParts.push(`brightness(${filters.brightness}%)`)
  if (filters.contrast && filters.contrast !== 100) filterParts.push(`contrast(${filters.contrast}%)`)
  if (filters.hueRotate) filterParts.push(`hue-rotate(${filters.hueRotate}deg)`)
  if (filters.saturate && filters.saturate !== 100) filterParts.push(`saturate(${filters.saturate}%)`)
  if (filters.opacity && filters.opacity !== 100) filterParts.push(`opacity(${filters.opacity}%)`)

  return filterParts.length > 0 ? filterParts.join(" ") : "none"
}

export function renderShape(
  shape: string,
  width: number,
  height: number,
  color: string,
  cornerRadius?: number,
): React.ReactElement {
  const commonStyle: React.CSSProperties = {
    width: "100%",
    height: "100%",
  }

  if (shape === "square" || shape === "rounded-rect") {
    return (
      <div
        style={{
          ...commonStyle,
          backgroundColor: color,
          borderRadius: cornerRadius ? `${cornerRadius}px` : shape === "rounded-rect" ? "12px" : "0",
        }}
      />
    )
  }

  if (shape === "circle") {
    return (
      <div
        style={{
          ...commonStyle,
          backgroundColor: color,
          borderRadius: "50%",
        }}
      />
    )
  }

  // For other shapes, use SVG
  const svgShapes: Record<string, string> = {
    triangle: `M ${width / 2} 0 L ${width} ${height} L 0 ${height} Z`,
    pentagon: generatePolygonPath(5, width / 2, height / 2, Math.min(width, height) / 2),
    hexagon: generatePolygonPath(6, width / 2, height / 2, Math.min(width, height) / 2),
    star: generateStarPath(width / 2, height / 2, Math.min(width, height) / 2),
    arrow: `M ${width * 0.3} 0 L ${width} ${height / 2} L ${width * 0.3} ${height} L ${width * 0.3} ${height * 0.7} L 0 ${height * 0.7} L 0 ${height * 0.3} L ${width * 0.3} ${height * 0.3} Z`,
    diamond: `M ${width / 2} 0 L ${width} ${height / 2} L ${width / 2} ${height} L 0 ${height / 2} Z`,
    "speech-bubble": `M 10 0 L ${width - 10} 0 Q ${width} 0 ${width} 10 L ${width} ${height * 0.7} Q ${width} ${height * 0.8} ${width - 10} ${height * 0.8} L ${width * 0.6} ${height * 0.8} L ${width * 0.5} ${height} L ${width * 0.4} ${height * 0.8} L 10 ${height * 0.8} Q 0 ${height * 0.8} 0 ${height * 0.7} L 0 10 Q 0 0 10 0 Z`,
  }

  const pathData = svgShapes[shape] || svgShapes.square

  return (
    <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
      <path d={pathData} fill={color} style={{ borderRadius: cornerRadius ? `${cornerRadius}px` : undefined }} />
    </svg>
  )
}

function generatePolygonPath(sides: number, cx: number, cy: number, radius: number): string {
  const points: string[] = []
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides - Math.PI / 2
    const x = cx + radius * Math.cos(angle)
    const y = cy + radius * Math.sin(angle)
    points.push(`${x} ${y}`)
  }
  return `M ${points.join(" L ")} Z`
}

function generateStarPath(cx: number, cy: number, radius: number): string {
  const points: string[] = []
  const outerRadius = radius
  const innerRadius = radius * 0.4

  for (let i = 0; i < 10; i++) {
    const angle = (i * Math.PI) / 5 - Math.PI / 2
    const r = i % 2 === 0 ? outerRadius : innerRadius
    const x = cx + r * Math.cos(angle)
    const y = cy + r * Math.sin(angle)
    points.push(`${x} ${y}`)
  }

  return `M ${points.join(" L ")} Z`
}
