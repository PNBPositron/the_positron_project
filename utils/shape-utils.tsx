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

// Function to generate SVG path for a classic picture frame
export function generateClassicFramePath(width: number, height: number, borderWidth = 20): string {
  const outerWidth = width
  const outerHeight = height
  const innerWidth = width - borderWidth * 2
  const innerHeight = height - borderWidth * 2

  return `
    M 0,0
    L ${outerWidth},0
    L ${outerWidth},${outerHeight}
    L 0,${outerHeight}
    Z
    M ${borderWidth},${borderWidth}
    L ${borderWidth},${borderWidth + innerHeight}
    L ${borderWidth + innerWidth},${borderWidth + innerHeight}
    L ${borderWidth + innerWidth},${borderWidth}
    Z
  `
}

// Function to generate SVG path for a modern picture frame
export function generateModernFramePath(width: number, height: number, borderWidth = 10): string {
  const outerWidth = width
  const outerHeight = height
  const innerWidth = width - borderWidth * 2
  const innerHeight = height - borderWidth * 2
  const cornerRadius = borderWidth * 1.5

  return `
    M ${cornerRadius},0
    L ${outerWidth - cornerRadius},0
    Q ${outerWidth},0 ${outerWidth},${cornerRadius}
    L ${outerWidth},${outerHeight - cornerRadius}
    Q ${outerWidth},${outerHeight} ${outerWidth - cornerRadius},${outerHeight}
    L ${cornerRadius},${outerHeight}
    Q 0,${outerHeight} 0,${outerHeight - cornerRadius}
    L 0,${cornerRadius}
    Q 0,0 ${cornerRadius},0
    Z
    M ${borderWidth + cornerRadius / 2},${borderWidth}
    L ${borderWidth + innerWidth - cornerRadius / 2},${borderWidth}
    Q ${borderWidth + innerWidth},${borderWidth} ${borderWidth + innerWidth},${borderWidth + cornerRadius / 2}
    L ${borderWidth + innerWidth},${borderWidth + innerHeight - cornerRadius / 2}
    Q ${borderWidth + innerWidth},${borderWidth + innerHeight} ${borderWidth + innerWidth - cornerRadius / 2},${borderWidth + innerHeight}
    L ${borderWidth + cornerRadius / 2},${borderWidth + innerHeight}
    Q ${borderWidth},${borderWidth + innerHeight} ${borderWidth},${borderWidth + innerHeight - cornerRadius / 2}
    L ${borderWidth},${borderWidth + cornerRadius / 2}
    Q ${borderWidth},${borderWidth} ${borderWidth + cornerRadius / 2},${borderWidth}
    Z
  `
}

// Function to generate SVG path for an ornate picture frame
export function generateOrnateFramePath(width: number, height: number, borderWidth = 25): string {
  const outerWidth = width
  const outerHeight = height
  const innerWidth = width - borderWidth * 2
  const innerHeight = height - borderWidth * 2

  // Create the basic frame shape
  let path = `
    M 0,0
    L ${outerWidth},0
    L ${outerWidth},${outerHeight}
    L 0,${outerHeight}
    Z
    M ${borderWidth},${borderWidth}
    L ${borderWidth},${borderWidth + innerHeight}
    L ${borderWidth + innerWidth},${borderWidth + innerHeight}
    L ${borderWidth + innerWidth},${borderWidth}
    Z
  `

  // Add decorative elements to each corner
  const cornerSize = borderWidth * 1.5

  // Top left corner decoration
  path += `
    M 0,0
    Q ${cornerSize / 2},${cornerSize / 4} ${cornerSize},0
    Q ${cornerSize / 4},${cornerSize / 2} 0,${cornerSize}
    Z
  `

  // Top right corner decoration
  path += `
    M ${outerWidth},0
    Q ${outerWidth - cornerSize / 2},${cornerSize / 4} ${outerWidth - cornerSize},0
    Q ${outerWidth - cornerSize / 4},${cornerSize / 2} ${outerWidth},${cornerSize}
    Z
  `

  // Bottom right corner decoration
  path += `
    M ${outerWidth},${outerHeight}
    Q ${outerWidth - cornerSize / 2},${outerHeight - cornerSize / 4} ${outerWidth - cornerSize},${outerHeight}
    Q ${outerWidth - cornerSize / 4},${outerHeight - cornerSize / 2} ${outerWidth},${outerHeight - cornerSize}
    Z
  `

  // Bottom left corner decoration
  path += `
    M 0,${outerHeight}
    Q ${cornerSize / 2},${outerHeight - cornerSize / 4} ${cornerSize},${outerHeight}
    Q ${cornerSize / 4},${outerHeight - cornerSize / 2} 0,${outerHeight - cornerSize}
    Z
  `

  return path
}

// Function to generate SVG path for a polaroid frame
export function generatePolaroidFramePath(width: number, height: number): string {
  const borderWidth = Math.min(width, height) * 0.08
  const bottomBorder = Math.min(width, height) * 0.2

  return `
    M 0,0
    L ${width},0
    L ${width},${height}
    L 0,${height}
    Z
    M ${borderWidth},${borderWidth}
    L ${width - borderWidth},${borderWidth}
    L ${width - borderWidth},${height - bottomBorder}
    L ${borderWidth},${height - bottomBorder}
    Z
  `
}

// Function to generate SVG path for a ticket frame
export function generateTicketFramePath(width: number, height: number): string {
  const notchSize = Math.min(width, height) * 0.05
  const notchCount = Math.floor(width / (notchSize * 3))
  const notchSpacing = width / notchCount

  let path = `M 0,0 L ${width},0 L ${width},${height} L 0,${height} Z `

  // Inner cutout with notched edge on top and bottom
  path += `M ${notchSize},${notchSize * 2} `

  // Top edge with notches
  for (let i = 0; i < notchCount; i++) {
    const x1 = i * notchSpacing
    const x2 = x1 + notchSpacing / 2
    const x3 = x1 + notchSpacing

    if (i === 0) {
      path += `L ${x2},${notchSize} `
    } else {
      path += `L ${x1},${notchSize * 2} L ${x2},${notchSize} `
    }

    if (i === notchCount - 1) {
      path += `L ${width - notchSize},${notchSize * 2} `
    } else {
      path += `L ${x3},${notchSize * 2} `
    }
  }

  // Right, bottom (with notches), and left edges
  path += `L ${width - notchSize},${height - notchSize * 2} `

  // Bottom edge with notches
  for (let i = notchCount - 1; i >= 0; i--) {
    const x1 = i * notchSpacing + notchSpacing
    const x2 = x1 - notchSpacing / 2
    const x3 = x1 - notchSpacing

    if (i === notchCount - 1) {
      path += `L ${x2},${height - notchSize} `
    } else {
      path += `L ${x1},${height - notchSize * 2} L ${x2},${height - notchSize} `
    }

    if (i === 0) {
      path += `L ${notchSize},${height - notchSize * 2} `
    } else {
      path += `L ${x3},${height - notchSize * 2} `
    }
  }

  path += "Z"
  return path
}

// Function to generate SVG path for a stamp frame
export function generateStampFramePath(width: number, height: number): string {
  const borderWidth = Math.min(width, height) * 0.1
  const waveSize = borderWidth * 0.5
  const waveCount = Math.floor(width / (waveSize * 2))
  const waveSpacing = width / waveCount

  let path = `M 0,0 L ${width},0 L ${width},${height} L 0,${height} Z `

  // Inner cutout with wavy edges
  path += `M ${borderWidth},${borderWidth} `

  // Top edge with waves
  for (let i = 0; i < waveCount; i++) {
    const x1 = borderWidth + i * waveSpacing
    const x2 = x1 + waveSpacing / 2
    const x3 = x1 + waveSpacing

    if (i === 0) {
      path += `C ${x1 + waveSize},${borderWidth - waveSize} ${x2 - waveSize},${borderWidth - waveSize} ${x2},${borderWidth} `
    } else {
      path += `C ${x1 + waveSize},${borderWidth - waveSize} ${x2 - waveSize},${borderWidth - waveSize} ${x2},${borderWidth} `
    }

    if (i < waveCount - 1) {
      path += `C ${x2 + waveSize},${borderWidth + waveSize} ${x3 - waveSize},${borderWidth + waveSize} ${x3},${borderWidth} `
    } else {
      path += `C ${x2 + waveSize},${borderWidth + waveSize} ${width - borderWidth - waveSize},${borderWidth + waveSize} ${width - borderWidth},${borderWidth} `
    }
  }

  // Right edge with waves
  for (let i = 0; i < waveCount / 2; i++) {
    const y1 = borderWidth + i * waveSpacing
    const y2 = y1 + waveSpacing / 2
    const y3 = y1 + waveSpacing

    if (i === 0) {
      path += `C ${width - borderWidth + waveSize},${y1 + waveSize} ${width - borderWidth + waveSize},${y2 - waveSize} ${width - borderWidth},${y2} `
    } else {
      path += `C ${width - borderWidth + waveSize},${y1 + waveSize} ${width - borderWidth + waveSize},${y2 - waveSize} ${width - borderWidth},${y2} `
    }

    if (i < waveCount / 2 - 1) {
      path += `C ${width - borderWidth - waveSize},${y2 + waveSize} ${width - borderWidth - waveSize},${y3 - waveSize} ${width - borderWidth},${y3} `
    } else {
      path += `C ${width - borderWidth - waveSize},${y2 + waveSize} ${width - borderWidth - waveSize},${height - borderWidth - waveSize} ${width - borderWidth},${height - borderWidth} `
    }
  }

  // Bottom edge with waves (reverse direction)
  for (let i = waveCount - 1; i >= 0; i--) {
    const x1 = borderWidth + i * waveSpacing + waveSpacing
    const x2 = x1 - waveSpacing / 2
    const x3 = x1 - waveSpacing

    if (i === waveCount - 1) {
      path += `C ${x1 - waveSize},${height - borderWidth + waveSize} ${x2 + waveSize},${height - borderWidth + waveSize} ${x2},${height - borderWidth} `
    } else {
      path += `C ${x1 - waveSize},${height - borderWidth + waveSize} ${x2 + waveSize},${height - borderWidth + waveSize} ${x2},${height - borderWidth} `
    }

    if (i > 0) {
      path += `C ${x2 - waveSize},${height - borderWidth - waveSize} ${x3 + waveSize},${height - borderWidth - waveSize} ${x3},${height - borderWidth} `
    } else {
      path += `C ${x2 - waveSize},${height - borderWidth - waveSize} ${borderWidth + waveSize},${height - borderWidth - waveSize} ${borderWidth},${height - borderWidth} `
    }
  }

  // Left edge with waves (reverse direction)
  for (let i = waveCount / 2 - 1; i >= 0; i--) {
    const y1 = borderWidth + i * waveSpacing + waveSpacing
    const y2 = y1 - waveSpacing / 2
    const y3 = y1 - waveSpacing

    if (i === waveCount / 2 - 1) {
      path += `C ${borderWidth - waveSize},${y1 - waveSize} ${borderWidth - waveSize},${y2 + waveSize} ${borderWidth},${y2} `
    } else {
      path += `C ${borderWidth - waveSize},${y1 - waveSize} ${borderWidth - waveSize},${y2 + waveSize} ${borderWidth},${y2} `
    }

    if (i > 0) {
      path += `C ${borderWidth + waveSize},${y2 - waveSize} ${borderWidth + waveSize},${y3 + waveSize} ${borderWidth},${y3} `
    } else {
      path += `C ${borderWidth + waveSize},${y2 - waveSize} ${borderWidth + waveSize},${borderWidth + waveSize} ${borderWidth},${borderWidth} `
    }
  }

  path += "Z"
  return path
}

// Component to render the appropriate shape
export function RenderShape({
  shape,
  width,
  height,
  color,
  className = "",
  glassmorphism,
  cornerRadius = 0,
}: {
  shape: string
  width: number
  height: number
  color: string
  className?: string
  cornerRadius?: number
  glassmorphism?: {
    enabled: boolean
    blur: number
    opacity: number
    borderOpacity: number
    saturation: number
  }
}) {
  const size = Math.min(width, height)

  // Generate glassmorphism styles
  const getGlassmorphismStyles = () => {
    if (!glassmorphism?.enabled) return {}
    
    return {
      backdropFilter: `blur(${glassmorphism.blur}px) saturate(${glassmorphism.saturation}%)`,
      backgroundColor: `${color}${Math.round(glassmorphism.opacity * 2.55).toString(16).padStart(2, '0')}`,
      border: `1px solid ${color}${Math.round(glassmorphism.borderOpacity * 2.55).toString(16).padStart(2, '0')}`,
      boxShadow: `0 8px 32px 0 rgba(31, 38, 135, 0.37)`,
    }
  }

  const glassmorphismStyles = getGlassmorphismStyles()

  // Apply corner radius to basic shapes
  const getShapeStyles = () => {
    const baseStyles = glassmorphism?.enabled ? 
      { backgroundColor: 'transparent', ...glassmorphismStyles } : 
      { backgroundColor: color }
    
    if (cornerRadius > 0) {
      return {
        ...baseStyles,
        borderRadius: `${cornerRadius}px`
      }
    }
    
    return baseStyles
  }

  switch (shape) {
    case "square":
      return (
        <div 
          className={`w-full h-full ${className}`} 
          style={getShapeStyles()}
        />
      )
    case "circle":
      return (
        <div 
          className={`w-full h-full rounded-full ${className}`} 
          style={{ 
            backgroundColor: glassmorphism?.enabled ? 'transparent' : color,
            ...glassmorphismStyles
          }} 
        />
      )
    case "rounded-rect":
      return (
        <div 
          className={`w-full h-full ${className}`} 
          style={{
            backgroundColor: glassmorphism?.enabled ? 'transparent' : color,
            borderRadius: cornerRadius > 0 ? `${cornerRadius}px` : '12px',
            ...glassmorphismStyles
          }} 
        />
      )
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

      if (glassmorphism?.enabled) {
        return (
          <div className={`w-full h-full ${className}`} style={glassmorphismStyles}>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <filter id={`glassmorphism-${shape}`}>
                  <feGaussianBlur in="SourceGraphic" stdDeviation={glassmorphism.blur / 4} />
                </filter>
              </defs>
              <path 
                d={path} 
                fill={`${color}${Math.round(glassmorphism.opacity * 2.55).toString(16).padStart(2, '0')}`}
                stroke={`${color}${Math.round(glassmorphism.borderOpacity * 2.55).toString(16).padStart(2, '0')}`}
                strokeWidth="1"
                filter={`url(#glassmorphism-${shape})`}
                rx={cornerRadius > 0 ? cornerRadius : undefined}
              />
            </svg>
          </div>
        )
      }

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className={`w-full h-full ${className}`} preserveAspectRatio="none">
          <path 
            d={path} 
            fill={color} 
            rx={cornerRadius > 0 ? cornerRadius : undefined}
          />
        </svg>
      )

    // Image frame shapes
    case "frame-classic":
    case "frame-modern":
    case "frame-ornate":
    case "frame-polaroid":
    case "frame-ticket":
    case "frame-stamp":
      let framePath = ""

      if (shape === "frame-classic") framePath = generateClassicFramePath(width, height)
      else if (shape === "frame-modern") framePath = generateModernFramePath(width, height)
      else if (shape === "frame-ornate") framePath = generateOrnateFramePath(width, height)
      else if (shape === "frame-polaroid") framePath = generatePolaroidFramePath(width, height)
      else if (shape === "frame-ticket") framePath = generateTicketFramePath(width, height)
      else if (shape === "frame-stamp") framePath = generateStampFramePath(width, height)

      if (glassmorphism?.enabled) {
        return (
          <div className={`w-full h-full ${className}`} style={glassmorphismStyles}>
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full" preserveAspectRatio="none">
              <defs>
                <filter id={`glassmorphism-${shape}`}>
                  <feGaussianBlur in="SourceGraphic" stdDeviation={glassmorphism.blur / 4} />
                </filter>
              </defs>
              <path 
                d={framePath} 
                fill={`${color}${Math.round(glassmorphism.opacity * 2.55).toString(16).padStart(2, '0')}`}
                stroke={`${color}${Math.round(glassmorphism.borderOpacity * 2.55).toString(16).padStart(2, '0')}`}
                strokeWidth="1"
                fillRule="evenodd" 
                filter={`url(#glassmorphism-${shape})`}
                rx={cornerRadius > 0 ? cornerRadius : undefined}
              />
            </svg>
          </div>
        )
      }

      return (
        <svg viewBox={`0 0 ${width} ${height}`} className={`w-full h-full ${className}`} preserveAspectRatio="none">
          <path 
            d={framePath} 
            fill={color} 
            fillRule="evenodd" 
            rx={cornerRadius > 0 ? cornerRadius : undefined}
          />
        </svg>
      )

    default:
      return (
        <div 
          className={`w-full h-full ${className}`} 
          style={getShapeStyles()}
        />
      )
  }
}
