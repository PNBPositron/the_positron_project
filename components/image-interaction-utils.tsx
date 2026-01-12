import type { ImageElement } from "@/types/editor"
import type React from "react"

/**
 * Apply interaction styles to images based on their interaction settings and hover state
 */
export function getInteractionStyle(
  element: ImageElement,
  isHovering: boolean,
  interactions?: ImageElement["interactions"],
): React.CSSProperties {
  if (!interactions || !isHovering) return {}

  const style: React.CSSProperties = {}

  // Apply hover effects
  if (interactions.hoverAction === "zoom") {
    style.transform = "scale(1.1)"
    style.transition = "transform 0.3s ease-out"
  } else if (interactions.hoverAction === "brightness") {
    style.filter = "brightness(1.2)"
    style.transition = "filter 0.3s ease-out"
  } else if (interactions.hoverAction === "blur") {
    style.filter = "blur(5px)"
    style.transition = "filter 0.3s ease-out"
  } else if (interactions.hoverAction === "grayscale") {
    style.filter = "grayscale(0%)"
    style.transition = "filter 0.3s ease-out"
  } else if (interactions.hoverAction === "scale") {
    style.transform = "scale(1.15)"
    style.transition = "transform 0.3s ease-out"
  } else if (interactions.hoverAction === "glow") {
    style.boxShadow = "0 0 20px rgba(14, 165, 233, 0.8)"
    style.transition = "box-shadow 0.3s ease-out"
  }

  return style
}

/**
 * Get CSS classes for interaction styling and cursor hints
 */
export function getInteractionClasses(interactions?: ImageElement["interactions"]): string {
  if (!interactions || interactions.clickAction === "none") return "cursor-default"

  switch (interactions.clickAction) {
    case "lightbox":
      return "cursor-pointer hover:opacity-90"
    case "link":
      return "cursor-pointer hover:opacity-80"
    case "toggle":
      return "cursor-pointer hover:opacity-75"
    case "animate":
      return "cursor-pointer hover:opacity-85"
    default:
      return "cursor-default"
  }
}

/**
 * Handle click interactions on images
 */
export function handleImageClick(
  e: React.MouseEvent,
  element: ImageElement,
  interactions?: ImageElement["interactions"],
): void {
  if (!interactions || interactions.clickAction === "none") return

  e.stopPropagation()

  switch (interactions.clickAction) {
    case "lightbox":
      openLightbox(element)
      break
    case "link":
      if (interactions.linkUrl) {
        window.open(interactions.linkUrl, "_blank")
      }
      break
    case "toggle":
      toggleImageEffect(element)
      break
    case "animate":
      playImageAnimation(element)
      break
  }
}

/**
 * Open an image in a lightbox viewer
 */
function openLightbox(element: ImageElement): void {
  // Create lightbox container
  const lightbox = document.createElement("div")
  lightbox.id = "image-lightbox"
  lightbox.className = "fixed inset-0 bg-black/90 flex items-center justify-center z-50"
  lightbox.style.cssText = `
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.9);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 50;
  `

  // Create image container
  const imageContainer = document.createElement("div")
  imageContainer.className = "relative max-w-4xl max-h-screen"
  imageContainer.style.cssText = `
    position: relative;
    max-width: 90vw;
    max-height: 90vh;
  `

  // Create image
  const img = document.createElement("img")
  img.src = element.src
  img.alt = "Lightbox image"
  img.style.cssText = `
    max-width: 100%;
    max-height: 100%;
    border-radius: 8px;
    box-shadow: 0 0 30px rgba(14, 165, 233, 0.3);
  `

  // Create close button
  const closeButton = document.createElement("button")
  closeButton.innerHTML = "✕"
  closeButton.style.cssText = `
    position: absolute;
    top: -40px;
    right: 0;
    background: none;
    border: none;
    color: white;
    font-size: 32px;
    cursor: pointer;
    padding: 10px;
    transition: color 0.2s;
  `
  closeButton.onmouseover = () => (closeButton.style.color = "#0ea5e9")
  closeButton.onmouseout = () => (closeButton.style.color = "white")

  // Close lightbox on click
  const closeLightbox = () => {
    lightbox.remove()
  }

  closeButton.onclick = closeLightbox
  lightbox.onclick = (e) => {
    if (e.target === lightbox) closeLightbox()
  }

  imageContainer.appendChild(img)
  imageContainer.appendChild(closeButton)
  lightbox.appendChild(imageContainer)
  document.body.appendChild(lightbox)

  // Close on escape key
  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === "Escape") {
      closeLightbox()
      document.removeEventListener("keydown", handleEscape)
    }
  }
  document.addEventListener("keydown", handleEscape)
}

/**
 * Toggle image effects (grayscale, brightness, etc.)
 */
function toggleImageEffect(element: ImageElement): void {
  // This would typically update the element's filters in the presentation state
  console.log("Toggle effect for image:", element.id)
}

/**
 * Play animation on image
 */
function playImageAnimation(element: ImageElement): void {
  // This would trigger the animation defined in element.animation
  console.log("Play animation for image:", element.id)
}
