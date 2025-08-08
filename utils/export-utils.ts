import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import type { Slide } from "@/types/editor"
import {
  generateTrianglePath,
  generatePentagonPath,
  generateHexagonPath,
  generateStarPath,
  generateArrowPath,
  generateDiamondPath,
  generateSpeechBubblePath,
} from "@/utils/shape-utils"

// Helper function to render a slide to a canvas
async function renderSlideToCanvas(
  slide: Slide,
  options: {
    width?: number
    height?: number
    includeAnimations?: boolean
  } = {},
): Promise<HTMLCanvasElement> {
  const width = options.width || 1000
  const height = options.height || 562.5

  // Create a temporary container for rendering slides
  const container = document.createElement("div")
  container.style.position = "absolute"
  container.style.left = "-9999px"
  container.style.top = "-9999px"
  document.body.appendChild(container)

  try {
    // Create a slide element
    const slideElement = document.createElement("div")
    slideElement.style.width = `${width}px`
    slideElement.style.height = `${height}px`
    slideElement.style.position = "relative"
    slideElement.style.overflow = "hidden"

    // Set background
    if (typeof slide.background === "string") {
      slideElement.style.background = slide.background
    } else {
      if (slide.background.type === "color") {
        slideElement.style.backgroundColor = slide.background.value
      } else if (slide.background.type === "gradient") {
        slideElement.style.background = slide.background.value
      } else if (slide.background.type === "image") {
        // Create background image with overlay
        const bgDiv = document.createElement("div")
        bgDiv.style.position = "absolute"
        bgDiv.style.top = "0"
        bgDiv.style.left = "0"
        bgDiv.style.width = "100%"
        bgDiv.style.height = "100%"
        bgDiv.style.backgroundImage = `url(${slide.background.value})`
        bgDiv.style.backgroundSize = slide.background.imagePosition || "cover"
        bgDiv.style.backgroundPosition = "center"
        bgDiv.style.opacity = `${(slide.background.imageOpacity || 100) / 100}`

        // Add overlay if present
        if (slide.background.overlay) {
          const overlayDiv = document.createElement("div")
          overlayDiv.style.position = "absolute"
          overlayDiv.style.top = "0"
          overlayDiv.style.left = "0"
          overlayDiv.style.width = "100%"
          overlayDiv.style.height = "100%"
          overlayDiv.style.backgroundColor = slide.background.overlay
          slideElement.appendChild(overlayDiv)
        }

        slideElement.appendChild(bgDiv)
      }
    }

    // Add elements
    const imageLoadPromises: Promise<void>[] = []

    for (const element of slide.elements) {
      const elementDiv = document.createElement("div")
      elementDiv.style.position = "absolute"

      // Scale positions and dimensions based on canvas size
      const scaleX = width / 1000
      const scaleY = height / 562.5

      elementDiv.style.left = `${element.x * scaleX}px`
      elementDiv.style.top = `${element.y * scaleY}px`
      elementDiv.style.width = `${element.width * scaleX}px`
      elementDiv.style.height = `${element.height * scaleY}px`

      // Apply rotation if present
      if (element.rotation) {
        elementDiv.style.transform = `rotate(${element.rotation}deg)`
        elementDiv.style.transformOrigin = "center center"
      }

      // Apply animations if enabled
      if (
        options.includeAnimations &&
        element.animation &&
        element.animation.type !== "none" &&
        element.animation.trigger === "onLoad"
      ) {
        // Apply animation styles based on animation type
        const animation = element.animation

        // Set initial state for animations
        switch (animation.type) {
          case "fade":
            elementDiv.style.opacity = "0"
            break
          case "slide":
            const direction = animation.direction || "left"
            if (direction === "left")
              elementDiv.style.transform = `translateX(-30px) ${element.rotation ? `rotate(${element.rotation}deg)` : ""}`
            if (direction === "right")
              elementDiv.style.transform = `translateX(30px) ${element.rotation ? `rotate(${element.rotation}deg)` : ""}`
            if (direction === "top")
              elementDiv.style.transform = `translateY(-30px) ${element.rotation ? `rotate(${element.rotation}deg)` : ""}`
            if (direction === "bottom")
              elementDiv.style.transform = `translateY(30px) ${element.rotation ? `rotate(${element.rotation}deg)` : ""}`
            elementDiv.style.opacity = "0"
            break
          case "zoom":
            elementDiv.style.transform = `scale(0.5) ${element.rotation ? `rotate(${element.rotation}deg)` : ""}`
            elementDiv.style.opacity = "0"
            break
        }

        // Add transition for smooth animation
        elementDiv.style.transition = `opacity ${animation.duration}s ${animation.easing}, transform ${animation.duration}s ${animation.easing}`

        // Trigger animation after a delay
        setTimeout(() => {
          if (animation.type === "fade") {
            elementDiv.style.opacity = "1"
          } else if (animation.type === "slide") {
            elementDiv.style.transform = element.rotation ? `rotate(${element.rotation}deg)` : "none"
            elementDiv.style.opacity = "1"
          } else if (animation.type === "zoom") {
            elementDiv.style.transform = element.rotation ? `rotate(${element.rotation}deg)` : "none"
            elementDiv.style.opacity = "1"
          }
        }, animation.delay * 1000)
      }

      if (element.type === "text") {
        elementDiv.style.fontSize = `${element.fontSize * scaleX}px`
        elementDiv.style.fontWeight = element.fontWeight
        elementDiv.style.textAlign = element.textAlign
        elementDiv.style.fontFamily = element.fontFamily
        elementDiv.style.color = "white"
        elementDiv.style.fontStyle = element.fontStyle || "normal"
        elementDiv.style.textDecoration = element.textDecoration || "none"
        elementDiv.innerText = element.content
      } else if (element.type === "shape") {
        if (element.shape === "square") {
          const shapeDiv = document.createElement("div")
          shapeDiv.style.width = "100%"
          shapeDiv.style.height = "100%"
          shapeDiv.style.backgroundColor = element.color
          elementDiv.appendChild(shapeDiv)
        } else if (element.shape === "circle") {
          const shapeDiv = document.createElement("div")
          shapeDiv.style.width = "100%"
          shapeDiv.style.height = "100%"
          shapeDiv.style.backgroundColor = element.color
          shapeDiv.style.borderRadius = "50%"
          elementDiv.appendChild(shapeDiv)
        } else if (element.shape === "rounded-rect") {
          const shapeDiv = document.createElement("div")
          shapeDiv.style.width = "100%"
          shapeDiv.style.height = "100%"
          shapeDiv.style.backgroundColor = element.color
          shapeDiv.style.borderRadius = "12px"
          elementDiv.appendChild(shapeDiv)
        } else {
          // For complex shapes, use SVG
          const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg")
          svg.setAttribute("width", "100%")
          svg.setAttribute("height", "100%")
          svg.setAttribute("viewBox", `0 0 ${element.width} ${element.height}`)
          svg.setAttribute("preserveAspectRatio", "none")

          const path = document.createElementNS("http://www.w3.org/2000/svg", "path")
          path.setAttribute("fill", element.color)

          let pathData = ""
          const size = Math.min(element.width, element.height)

          switch (element.shape) {
            case "triangle":
              pathData = generateTrianglePath(size)
              break
            case "pentagon":
              pathData = generatePentagonPath(size)
              break
            case "hexagon":
              pathData = generateHexagonPath(size)
              break
            case "star":
              pathData = generateStarPath(size)
              break
            case "arrow":
              pathData = generateArrowPath(element.width, element.height)
              break
            case "diamond":
              pathData = generateDiamondPath(element.width, element.height)
              break
            case "speech-bubble":
              pathData = generateSpeechBubblePath(element.width, element.height)
              break
          }

          path.setAttribute("d", pathData)
          svg.appendChild(path)
          elementDiv.appendChild(svg)
        }
      } else if (element.type === "image") {
        const img = document.createElement("img")
        img.src = element.src
        img.style.width = "100%"
        img.style.height = "100%"
        img.style.objectFit = "cover"
        img.crossOrigin = "anonymous"

        // Create a promise for image loading
        const imageLoadPromise = new Promise<void>((resolve) => {
          img.onload = () => resolve()
          img.onerror = () => {
            console.error("Failed to load image:", element.src)
            resolve() // Resolve anyway to continue with export
          }
        })
        imageLoadPromises.push(imageLoadPromise)

        // Apply filters if present
        if (element.filters) {
          let filterString = ""
          if (element.filters.grayscale) filterString += `grayscale(${element.filters.grayscale}%) `
          if (element.filters.sepia) filterString += `sepia(${element.filters.sepia}%) `
          if (element.filters.blur) filterString += `blur(${element.filters.blur}px) `
          if (element.filters.brightness) filterString += `brightness(${element.filters.brightness}%) `
          if (element.filters.contrast) filterString += `contrast(${element.filters.contrast}%) `
          if (element.filters.hueRotate) filterString += `hue-rotate(${element.filters.hueRotate}deg) `
          if (element.filters.saturate) filterString += `saturate(${element.filters.saturate}%) `
          if (element.filters.opacity) filterString += `opacity(${element.filters.opacity}%) `

          img.style.filter = filterString
        }

        // Apply effects if present
        if (element.effects) {
          if (element.effects.borderRadius) img.style.borderRadius = `${element.effects.borderRadius}%`
          if (element.effects.borderWidth) {
            img.style.border = `${element.effects.borderWidth}px solid ${element.effects.borderColor || "#ffffff"}`
          }
          if (element.effects.shadowBlur) {
            img.style.boxShadow = `${element.effects.shadowOffsetX || 0}px ${element.effects.shadowOffsetY || 0}px ${element.effects.shadowBlur}px ${element.effects.shadowColor || "#000000"}`
          }
        }

        elementDiv.appendChild(img)
      } else if (element.type === "video" || element.type === "audio") {
        // For GIF export, we'll just show a placeholder for media elements
        const placeholderDiv = document.createElement("div")
        placeholderDiv.style.width = "100%"
        placeholderDiv.style.height = "100%"
        placeholderDiv.style.backgroundColor = "#333"
        placeholderDiv.style.display = "flex"
        placeholderDiv.style.alignItems = "center"
        placeholderDiv.style.justifyContent = "center"
        placeholderDiv.style.color = "white"
        placeholderDiv.style.fontSize = "14px"
        placeholderDiv.style.textAlign = "center"
        placeholderDiv.textContent = element.type === "video" ? "Video" : "Audio"

        elementDiv.appendChild(placeholderDiv)
      }

      slideElement.appendChild(elementDiv)
    }

    container.appendChild(slideElement)

    // Wait for all images to load
    await Promise.all(imageLoadPromises)

    // If we have animations, wait for them to complete
    if (options.includeAnimations) {
      // Find the maximum animation duration including delay
      const maxAnimationTime = slide.elements.reduce((max, element) => {
        if (element.animation && element.animation.type !== "none" && element.animation.trigger === "onLoad") {
          const totalTime = element.animation.delay + element.animation.duration
          return Math.max(max, totalTime)
        }
        return max
      }, 0)

      // Wait for animations to complete
      if (maxAnimationTime > 0) {
        await new Promise((resolve) => setTimeout(resolve, maxAnimationTime * 1000 + 100))
      }
    }

    // Convert to canvas
    const canvas = await html2canvas(slideElement, {
      scale: 1, // We're already handling scaling
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      width,
      height,
    })

    return canvas
  } finally {
    // Clean up the container
    document.body.removeChild(container)
  }
}

// Export to PDF
export async function exportToPdf(slides: Slide[], title = "Presentation") {
  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "px",
    format: [1000, 562.5], // Match slide dimensions
  })

  // Process each slide
  for (let i = 0; i < slides.length; i++) {
    const canvas = await renderSlideToCanvas(slides[i])
    const imgData = canvas.toDataURL("image/jpeg", 0.95)

    if (i > 0) {
      pdf.addPage()
    }

    pdf.addImage(imgData, "JPEG", 0, 0, 1000, 562.5)
  }

  // Save the PDF
  pdf.save(`${title}.pdf`)
}

// Export to PNG
export async function exportToPng(slides: Slide[], title = "Presentation") {
  if (slides.length === 1) {
    // Single slide export
    const canvas = await renderSlideToCanvas(slides[0])
    const link = document.createElement("a")
    link.download = `${title}.png`
    link.href = canvas.toDataURL("image/png")
    link.click()
  } else {
    // Multiple slides export (zip them)
    for (let i = 0; i < slides.length; i++) {
      const canvas = await renderSlideToCanvas(slides[i])
      const link = document.createElement("a")
      link.download = `${title}-slide-${i + 1}.png`
      link.href = canvas.toDataURL("image/png")
      link.click()

      // Small delay between downloads
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
}

// Export to JPG
export async function exportToJpg(slides: Slide[], title = "Presentation") {
  if (slides.length === 1) {
    // Single slide export
    const canvas = await renderSlideToCanvas(slides[0])
    const link = document.createElement("a")
    link.download = `${title}.jpg`
    link.href = canvas.toDataURL("image/jpeg", 0.9)
    link.click()
  } else {
    // Multiple slides export
    for (let i = 0; i < slides.length; i++) {
      const canvas = await renderSlideToCanvas(slides[i])
      const link = document.createElement("a")
      link.download = `${title}-slide-${i + 1}.jpg`
      link.href = canvas.toDataURL("image/jpeg", 0.9)
      link.click()

      // Small delay between downloads
      await new Promise((resolve) => setTimeout(resolve, 500))
    }
  }
}

// Export current slide
export async function exportCurrentSlide(slide: Slide, format: "png" | "jpg", title = "Slide") {
  const canvas = await renderSlideToCanvas(slide)
  const link = document.createElement("a")

  if (format === "png") {
    link.download = `${title}.png`
    link.href = canvas.toDataURL("image/png")
  } else {
    link.download = `${title}.jpg`
    link.href = canvas.toDataURL("image/jpeg", 0.9)
  }

  link.click()
}
