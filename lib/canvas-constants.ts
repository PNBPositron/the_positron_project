// PowerPoint standard canvas dimensions (16:9 aspect ratio)
// Standard PowerPoint slide: 10 inches × 5.625 inches

export const CANVAS_CONFIG = {
  // Dimensions in pixels (at standard display density)
  WIDTH: 1280,
  HEIGHT: 720,
  
  // Display aspect ratio (16:9)
  ASPECT_RATIO: 16 / 9,
  
  // Minimum element sizes
  MIN_WIDTH: 20,
  MIN_HEIGHT: 20,
  
  // Padding inside canvas to prevent elements from touching edges
  PADDING: 0,
} as const

// Helper function to constrain element position/size to canvas bounds
export function constrainElementToBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  padding = CANVAS_CONFIG.PADDING
) {
  // Constrain position
  const constrainedX = Math.max(padding, Math.min(x, CANVAS_CONFIG.WIDTH - width - padding))
  const constrainedY = Math.max(padding, Math.min(y, CANVAS_CONFIG.HEIGHT - height - padding))
  
  // Constrain size to fit within bounds
  const maxWidth = CANVAS_CONFIG.WIDTH - constrainedX - padding
  const maxHeight = CANVAS_CONFIG.HEIGHT - constrainedY - padding
  const constrainedWidth = Math.max(CANVAS_CONFIG.MIN_WIDTH, Math.min(width, maxWidth))
  const constrainedHeight = Math.max(CANVAS_CONFIG.MIN_HEIGHT, Math.min(height, maxHeight))
  
  return {
    x: constrainedX,
    y: constrainedY,
    width: constrainedWidth,
    height: constrainedHeight,
  }
}

// Helper to check if element is within canvas bounds
export function isElementWithinBounds(
  x: number,
  y: number,
  width: number,
  height: number,
  padding = CANVAS_CONFIG.PADDING
): boolean {
  return (
    x >= padding &&
    y >= padding &&
    x + width <= CANVAS_CONFIG.WIDTH - padding &&
    y + height <= CANVAS_CONFIG.HEIGHT - padding
  )
}
