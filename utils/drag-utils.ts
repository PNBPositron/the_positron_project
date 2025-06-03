// Constants for grid snapping
export const GRID_SIZE = 10
export const SNAP_THRESHOLD = 5

// Constants for alignment guides
export const ALIGNMENT_THRESHOLD = 8
export const ALIGNMENT_LINE_COLOR = "#0ea5e9"

// Helper function to snap a value to the grid
export function snapToGrid(value: number): number {
  return Math.round(value / GRID_SIZE) * GRID_SIZE
}

// Helper function to check if a value is close to another value (for snapping)
export function isClose(value1: number, value2: number, threshold = SNAP_THRESHOLD): boolean {
  return Math.abs(value1 - value2) <= threshold
}

// Helper function to find alignment guides for an element
export interface AlignmentGuide {
  position: number
  type: "horizontal" | "vertical"
}

export function findAlignmentGuides(
  currentElement: { x: number; y: number; width: number; height: number },
  otherElements: Array<{ x: number; y: number; width: number; height: number }>,
): AlignmentGuide[] {
  const guides: AlignmentGuide[] = []

  // Current element edges
  const currentLeft = currentElement.x
  const currentRight = currentElement.x + currentElement.width
  const currentTop = currentElement.y
  const currentBottom = currentElement.y + currentElement.height
  const currentCenterX = currentElement.x + currentElement.width / 2
  const currentCenterY = currentElement.y + currentElement.height / 2

  // Check each other element for potential alignment
  for (const element of otherElements) {
    // Other element edges
    const otherLeft = element.x
    const otherRight = element.x + element.width
    const otherTop = element.y
    const otherBottom = element.y + element.height
    const otherCenterX = element.x + element.width / 2
    const otherCenterY = element.y + element.height / 2

    // Vertical alignments (x-axis)
    if (isClose(currentLeft, otherLeft, ALIGNMENT_THRESHOLD)) {
      guides.push({ position: otherLeft, type: "vertical" })
    }
    if (isClose(currentRight, otherRight, ALIGNMENT_THRESHOLD)) {
      guides.push({ position: otherRight, type: "vertical" })
    }
    if (isClose(currentLeft, otherRight, ALIGNMENT_THRESHOLD)) {
      guides.push({ position: otherRight, type: "vertical" })
    }
    if (isClose(currentRight, otherLeft, ALIGNMENT_THRESHOLD)) {
      guides.push({ position: otherLeft, type: "vertical" })
    }
    if (isClose(currentCenterX, otherCenterX, ALIGNMENT_THRESHOLD)) {
      guides.push({ position: otherCenterX, type: "vertical" })
    }

    // Horizontal alignments (y-axis)
    if (isClose(currentTop, otherTop, ALIGNMENT_THRESHOLD)) {
      guides.push({ position: otherTop, type: "horizontal" })
    }
    if (isClose(currentBottom, otherBottom, ALIGNMENT_THRESHOLD)) {
      guides.push({ position: otherBottom, type: "horizontal" })
    }
    if (isClose(currentTop, otherBottom, ALIGNMENT_THRESHOLD)) {
      guides.push({ position: otherBottom, type: "horizontal" })
    }
    if (isClose(currentBottom, otherTop, ALIGNMENT_THRESHOLD)) {
      guides.push({ position: otherTop, type: "horizontal" })
    }
    if (isClose(currentCenterY, otherCenterY, ALIGNMENT_THRESHOLD)) {
      guides.push({ position: otherCenterY, type: "horizontal" })
    }
  }

  return guides
}

// Calculate rotation angle based on mouse position
export function calculateRotationAngle(centerX: number, centerY: number, mouseX: number, mouseY: number): number {
  return Math.atan2(mouseY - centerY, mouseX - centerX) * (180 / Math.PI)
}

// Helper function to constrain rotation to 15-degree increments when shift key is pressed
export function constrainRotation(angle: number, constrain: boolean): number {
  if (!constrain) return angle

  // Constrain to 15-degree increments
  const increment = 15
  return Math.round(angle / increment) * increment
}
