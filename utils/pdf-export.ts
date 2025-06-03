import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import type { Slide } from "@/types/editor"

export async function exportToPdf(slides: Slide[], title = "Presentation") {
  // Create a temporary container for rendering slides
  const container = document.createElement("div")
  container.style.position = "absolute"
  container.style.left = "-9999px"
  container.style.top = "-9999px"
  document.body.appendChild(container)

  try {
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [1000, 562.5], // Match slide dimensions
    })

    // Process each slide
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]

      // Create a slide element
      const slideElement = document.createElement("div")
      slideElement.style.width = "1000px"
      slideElement.style.height = "562.5px"
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
      for (const element of slide.elements) {
        const elementDiv = document.createElement("div")
        elementDiv.style.position = "absolute"
        elementDiv.style.left = `${element.x}px`
        elementDiv.style.top = `${element.y}px`
        elementDiv.style.width = `${element.width}px`
        elementDiv.style.height = `${element.height}px`

        if (element.type === "text") {
          elementDiv.style.fontSize = `${element.fontSize}px`
          elementDiv.style.fontWeight = element.fontWeight
          elementDiv.style.textAlign = element.textAlign
          elementDiv.style.fontFamily = element.fontFamily
          elementDiv.style.color = "white"
          elementDiv.style.fontStyle = element.fontStyle || "normal"
          elementDiv.style.textDecoration = element.textDecoration || "none"
          elementDiv.innerText = element.content
        } else if (element.type === "shape") {
          const shapeDiv = document.createElement("div")
          shapeDiv.style.width = "100%"
          shapeDiv.style.height = "100%"
          shapeDiv.style.backgroundColor = element.color

          if (element.shape === "circle") {
            shapeDiv.style.borderRadius = "50%"
          }

          elementDiv.appendChild(shapeDiv)
        } else if (element.type === "image") {
          const img = document.createElement("img")
          img.src = element.src
          img.style.width = "100%"
          img.style.height = "100%"
          img.style.objectFit = "cover"

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
        }

        slideElement.appendChild(elementDiv)
      }

      container.appendChild(slideElement)

      // Convert to canvas and add to PDF
      const canvas = await html2canvas(slideElement, {
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
        backgroundColor: null,
      })

      const imgData = canvas.toDataURL("image/jpeg", 0.95)

      if (i > 0) {
        pdf.addPage()
      }

      pdf.addImage(imgData, "JPEG", 0, 0, 1000, 562.5)

      // Clean up
      container.removeChild(slideElement)
    }

    // Save the PDF
    pdf.save(`${title}.pdf`)
  } finally {
    // Clean up the container
    document.body.removeChild(container)
  }
}
