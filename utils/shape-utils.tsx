"use client"

// Function to generate SVG path for a star
export function generateStarPath(size: number): string {
  const outerRadius = size / 2
  const innerRadius = outerRadius / 2
  const points = 5
  const centerX = size / 2
  const centerY = size / 2

  let path = ""

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius
    const angle = (Math.PI / points) * i
    const x = centerX + radius * Math.sin(angle)
    const y = centerY - radius * Math.cos(angle)

    if (i === 0) {
      path += `M ${x},${y} `
    } else {
      path += `L ${x},${y} `
    }
  }

  path += "Z"
  return path
}

// Function to generate SVG path for a triangle
export function generateTrianglePath(size: number): string {
  const height = size
  const width = size
  return `M ${width / 2},0 L ${width},${height} L 0,${height} Z`
}

// Function to generate SVG path for a pentagon
export function generatePentagonPath(size: number): string {
  const radius = size / 2
  const centerX = size / 2
  const centerY = size / 2
  const points = 5

  let path = ""

  for (let i = 0; i < points; i++) {
    const angle = (Math.PI * 2 * i) / points - Math.PI / 2
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)

    if (i === 0) {
      path += `M ${x},${y} `
    } else {
      path += `L ${x},${y} `
    }
  }

  path += "Z"
  return path
}

// Function to generate SVG path for a hexagon
export function generateHexagonPath(size: number): string {
  const radius = size / 2
  const centerX = size / 2
  const centerY = size / 2
  const points = 6

  let path = ""

  for (let i = 0; i < points; i++) {
    const angle = (Math.PI * 2 * i) / points
    const x = centerX + radius * Math.cos(angle)
    const y = centerY + radius * Math.sin(angle)

    if (i === 0) {
      path += `M ${x},${y} `
    } else {
      path += `L ${x},${y} `
    }
  }

  path += "Z"
  return path
}

// Function to generate SVG path for an arrow
export function generateArrowPath(width: number, height: number): string {
  const arrowWidth = width * 0.7
  const arrowHeadWidth = width
  const arrowHeadHeight = height * 0.4
  const arrowBodyHeight = height * 0.2

  return `
    M 0,${height / 2 - arrowBodyHeight / 2}
    L ${arrowWidth},${height / 2 - arrowBodyHeight / 2}
    L ${arrowWidth},${height / 2 - arrowHeadHeight / 2}
    L ${arrowHeadWidth},${height / 2}
    L ${arrowWidth},${height / 2 + arrowHeadHeight / 2}
    L ${arrowWidth},${height / 2 + arrowBodyHeight / 2}
    L 0,${height / 2 + arrowBodyHeight / 2}
    Z
  `
}

// Function to generate SVG path for a diamond
export function generateDiamondPath(width: number, height: number): string {
  return `
    M ${width / 2},0
    L ${width},${height / 2}
    L ${width / 2},${height}
    L 0,${height / 2}
    Z
  `
}

// Function to generate SVG path for a speech bubble
export function generateSpeechBubblePath(width: number, height: number): string {
  const bubbleWidth = width
  const bubbleHeight = height * 0.8
  const tailWidth = width * 0.2
  const tailHeight = height * 0.2
  const cornerRadius = Math.min(width, height) * 0.1

  return `
    M ${cornerRadius},0
    L ${bubbleWidth - cornerRadius},0
    Q ${bubbleWidth},0 ${bubbleWidth},${cornerRadius}
    L ${bubbleWidth},${bubbleHeight - cornerRadius}
    Q ${bubbleWidth},${bubbleHeight} ${bubbleWidth - cornerRadius},${bubbleHeight}
    L ${bubbleWidth * 0.7},${bubbleHeight}
    L ${bubbleWidth * 0.5},${height}
    L ${bubbleWidth * 0.3},${bubbleHeight}
    L ${cornerRadius},${bubbleHeight}
    Q 0,${bubbleHeight} 0,${bubbleHeight - cornerRadius}
    L 0,${cornerRadius}
    Q 0,0 ${cornerRadius},0
    Z
  `
}

// Component to render the appropriate shape
export function RenderShape({
  shape,
  width,
  height,
  color,
  className = "",
}: {
  shape: string
  width: number
  height: number
  color: string
  className?: string
}) {
  const size = Math.min(width, height)

  switch (shape) {
    case "square":
      return <div className={`w-full h-full ${className}`} style={{ backgroundColor: color }} />
    case "circle":
      return <div className={`w-full h-full rounded-full ${className}`} style={{ backgroundColor: color }} />
    case "rounded-rect":
      return <div className={`w-full h-full rounded-xl ${className}`} style={{ backgroundColor: color }} />
    case "triangle":
    case "pentagon":
    case "hexagon":
    case "star":
    case "arrow":
    case "diamond":
    case "speech-bubble":
      let path = ""

      if (shape === "triangle") path = generateTrianglePath(size)
      else if (shape === "pentagon") path = generatePentagonPath(size)
      else if (shape === "hexagon") path = generateHexagonPath(size)
      else if (shape === "star") path = generateStarPath(size)
      else if (shape === "arrow") path = generateArrowPath(width, height)
      else if (shape === "diamond") path = generateDiamondPath(width, height)
      else if (shape === "speech-bubble") path = generateSpeechBubblePath(width, height)

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className={`w-full h-full ${className}`} preserveAspectRatio="none">
          <path d={path} fill={color} />
        </svg>
      )
    default:
      return <div className={`w-full h-full ${className}`} style={{ backgroundColor: color }} />
  }
}
