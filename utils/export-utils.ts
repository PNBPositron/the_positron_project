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

// Add this import at the top of the file
import GIF from "gif.js"

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

// Update the exportToGif function to support more options
export async function exportToGif(
  slides: Slide[],
  title = "Presentation",
  options = {
    frameDuration: 2000,
    quality: 10,
    resolution: 1,
    loop: 0,
    includeTransitions: true,
    includeAnimations: true,
  },
): Promise<void> {
  try {
    // Show export progress indicator
    const progressContainer = document.createElement("div")
    progressContainer.style.position = "fixed"
    progressContainer.style.top = "50%"
    progressContainer.style.left = "50%"
    progressContainer.style.transform = "translate(-50%, -50%)"
    progressContainer.style.padding = "20px"
    progressContainer.style.background = "rgba(0, 0, 0, 0.8)"
    progressContainer.style.borderRadius = "8px"
    progressContainer.style.zIndex = "10000"
    progressContainer.style.display = "flex"
    progressContainer.style.flexDirection = "column"
    progressContainer.style.alignItems = "center"
    progressContainer.style.gap = "10px"

    const progressText = document.createElement("div")
    progressText.style.color = "white"
    progressText.style.fontFamily = "Inter, sans-serif"
    progressText.textContent = "Preparing GIF export..."

    const progressBar = document.createElement("div")
    progressBar.style.width = "200px"
    progressBar.style.height = "6px"
    progressBar.style.background = "rgba(255, 255, 255, 0.2)"
    progressBar.style.borderRadius = "3px"
    progressBar.style.overflow = "hidden"

    const progressFill = document.createElement("div")
    progressFill.style.width = "0%"
    progressFill.style.height = "100%"
    progressFill.style.background = "linear-gradient(to right, #0ea5e9, #eab308)"
    progressFill.style.transition = "width 0.3s ease"

    progressBar.appendChild(progressFill)
    progressContainer.appendChild(progressText)
    progressContainer.appendChild(progressBar)
    document.body.appendChild(progressContainer)

    const updateProgress = (percent: number, message?: string) => {
      progressFill.style.width = `${percent}%`
      if (message) {
        progressText.textContent = message
      }
    }

    // Calculate dimensions based on resolution
    const width = Math.round(1000 * options.resolution)
    const height = Math.round(562.5 * options.resolution)

    // Create an inline worker script
    const workerBlob = new Blob(
      [
        `(function(b){function a(b,d){if({}.hasOwnProperty.call(a.cache,b))return a.cache[b];var e=a.resolve(b);if(!e)throw new Error('Failed to resolve module '+b);var c={id:b,require:a,filename:b,exports:{},loaded:!1,parent:d,children:[]};d&&d.children.push(c);var f=b.slice(-3);'.js'===f&&(b=b.slice(0,-3));var g=a.cache[b]=c.exports,h=e.call(g,a,c,g,b);return c.loaded=!0,a.cache[b]=h||g}function c(a,b){a=a.split('/');var c=[];b&&'.'!==b.slice(0,1)&&c.push(b);for(var e=0,d=a.length;e<d;++e)'.'!=a[e]&&'..'!=a[e]&&c.push(a[e]);return c.join('/')}function d(a,b){var c=a.split('/');c.pop();var d=c.join('/')+'/'+b;return d}a.cache={},a.resolve=function(b){if(b.slice(0,4)==='.js/')return b;if('.'===b.slice(0,1))return c(location.pathname,b);return b},a.register=function(b,c){a.cache[b]=c=};var e=function(a){function f(a,b){var c=a.charCodeAt(b);if(c>=55296&&c<=56319){var d=a.charCodeAt(b+1);return 56320<=d&&d<=57343?(c-55296)*1024+d-56320+65536:c}return c}function g(a,b){if(a>=55296&&a<=57343){if(b)throw Error('Lone surrogate U+'+a.toString(16).toUpperCase()+' is not a scalar value');return!1}return!0}function h(a,b){return k(a>>b&63|128)}function k(a){return String.fromCharCode(a)}function l(a,b){b=b||{};var c=!1!==b.strict;if(a=a.replace(e,''),c)for(var l=a.length,d=0;d<l;)if(55296<=a.charCodeAt(d)&&a.charCodeAt(d)<=56319){if(d+1===l)throw Error('Unfinished UTF-8 octet sequence');d+=2}else d++;for(var m=a.length,n=[];0<m;){var o=f(a,a.length-m);if(!g(o,c))throw Error('Invalid character');var p,q;if(o<=127){if(0===m)break;m-=1,n.push(o)}else if(o<=2047){if(1>=m)break;m-=2,p=o>>6&31|192,q=63&o|128,n.push(p,q)}else if(o<=65535){if(2>=m)break;m-=3,p=o>>12&15|224,q=o>>6&63|128;var r=63&o|128;n.push(p,q,r)}else{if(3>=m)break;m-=4,p=o>>18&7|240,q=o>>12&63|128;var r=o>>6&63|128,s=63&o|128;n.push(p,q,r,s)}}for(var d=0;d<n.length;++d)n[d]&=255;return c?n:n.length<=j?String.fromCharCode.apply(String,n):i(n)};var i=function(a){for(var b,c=a.length,d=0,e='';d<c;)b=a[d++],b<128?e+=String.fromCharCode(b):191<b&&b<224?(e+=String.fromCharCode((31&b)<<6|63&a[d++]),++d):(e+=String.fromCharCode((15&b)<<12|(63&a[d++])<<6|63&a[d++]),d+=2);return e},j=4096,e=/(?:[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDFFF])/g;return l}();a.register("gif.worker.js",function(a,b,c){"use strict";var d=function(){function c(a){var c={},d=a.width,e=a.height;this.width=d,this.height=e,this.data=a,this.header=[71,73,70,56,57,97],c.GCT=1,c.Color=7,c.GCTSize=d,this.BUF=new Uint8Array(d*e*3),this.LZWMinCodeSize=8;var f=0;for(var g=0;g<e;g++)for(var h=0;h<d;h++){var i=g*d*4+4*h;if(a[i+3]>=128){var j=a[i],k=a[i+1],l=a[i+2];this.BUF[f++]=j,this.BUF[f++]=k,this.BUF[f++]=l}}c.backgroundIndex=this.BUF[0],c.backgroundRGB=this.BUF.slice(0,3),this.GCT=this.BUF.slice(0,3*d),this.LZW=new b(this.LZWMinCodeSize)}function b(a){function h(){c=[],e=a+1,f=1<<a,d=f+1,g=f+2,b=!0}var b,c,d,e,f,g;this.minCodeSize=a,this.encode=function(a,i){var j,k,l,m,n,o,p,q,r,s,t;if(a.length===0)return 0;var u=new Uint8Array(a.length),v=0;h(),r=e,s=0,t=8,j=0;while(j<a.length){k=a[j++],l=r,m=d,n=g-1;while(l<=n){if(l==g){if(l<4095){if(l==g-1){c[l]=[],c[l][0]=-1,c[l][1]=0;if(k<f)c[l][0]=k;else if(k==f){j=a.length;break}else if(k==f+1)break}c[g++]=[],c[g-1][0]=k,c[g-1][1]=l}else{j=a.length;break}break}if(c[l][0]==k){m=l;break}if(c[l][0]==-1){c[l][0]=k,c[l][1]=0;break}o=c[l][1],l=o}if(j>a.length)break;if(s==0)p=m,s=1;else{s++,q=m;while(q>f&&c[q][1]!=0)c[q][0],q=c[q][1];if(q<=f)k=q;else break;if(s>=n){u[v++]=s-1,u[v++]=p;for(var w=0;w<s-1;w++){q=p;for(var x=0;x<s-1-w;x++)q=c[q][1];u[v++]=c[q][0]}s=0,r=e}}if(j>=a.length)break}return u[v++]=s,u[v++]=p;for(var w=0;w<s;w++){q=p;for(var x=0;x<s-w;x++)q=c[q][1];u[v++]=c[q][0]}u[v++]=f+1,u[v++]=0;var y=0,z=v*8;while(z>0){y++;var A=v>255?255:v;i.push(A);for(var w=0;w<A;w++)i.push(u[w]);v-=A,z-=A*8}return y}}return c.prototype.getImageDescriptor=function(a,b,c,d){var e=[];return e.push(44),e.push(a&255),e.push(a>>8&255),e.push(b&255),e.push(b>>8&255),e.push(c&255),e.push(c>>8&255),e.push(d&255),e.push(d>>8&255),e.push(0),e},c.prototype.getGraphicControlExtension=function(a){var b=[];return b.push(33),b.push(249),b.push(4),b.push(9),b.push(a&255),b.push(a>>8&255),b.push(0),b.push(0),b},c.prototype.getGlobalColorTable=function(){var a=[];for(var b=0;b<this.GCT.length;b++)a.push(this.GCT[b]);for(var b=0;b<768-this.GCT.length;b++)a.push(0);return a},c.prototype.getNetscapeExtension=function(a){var b=[];return b.push(33),b.push(255),b.push(11),b.push(78),b.push(69),b.push(84),b.push(83),b.push(67),b.push(65),b.push(80),b.push(69),b.push(50),b.push(46),b.push(48),b.push(3),b.push(1),b.push(a&255),b.push(a>>8&255),b.push(0),b},c.prototype.getHeader=function(){var a=[];for(var b=0;b<this.header.length;b++)a.push(this.header[b]);return a},c.prototype.getApplicationExtension=function(){var a=[];return a.push(33),a.push(255),a.push(11),a.push(78),a.push(69),a.push(84),a.push(83),a.push(67),a.push(65),a.push(80),a.push(69),a.push(50),a.push(46),a.push(48),a.push(3),a.push(1),a.push(0),a.push(0),a.push(0),a},c.prototype.getLogicalScreenDescriptor=function(){var a=[];return a.push(this.width&255),a.push(this.width>>8&255),a.push(this.height&255),a.push(this.height>>8&255),a.push(240),a.push(0),a.push(0),a},c.prototype.encode=function(a){var b=this.getHeader(),c=this.getLogicalScreenDescriptor(),d=this.getGlobalColorTable(),e=this.getApplicationExtension(),f=this.getGraphicControlExtension(a),g=this.getImageDescriptor(0,0,this.width,this.height),h=[];this.LZW.encode(this.BUF,h);var i=[];for(var j=0;j<b.length;j++)i.push(b[j]);for(var j=0;j<c.length;j++)i.push(c[j]);for(var j=0;j<d.length;j++)i.push(d[j]);for(var j=0;j<e.length;j++)i.push(e[j]);for(var j=0;j<f.length;j++)i.push(f[j]);for(var j=0;j<g.length;j++)i.push(g[j]);i.push(this.LZWMinCodeSize);for(var j=0;j<h.length;j++)i.push(h[j]);return i.push(0),i.push(59),i},c}();addEventListener("message",function(a){var b=a.data;try{var c=new d(b);postMessage(c.encode(b.delay))}catch(e){postMessage({error:e})}})}),a.register("gif.js",function(a,b,c){"use strict";var d=function(){function a(a){var b={workers:2,repeat:0,background:"#fff",quality:10,width:null,height:null,transparent:null,debug:!1,dither:!1};for(var c in a)b[c]=a[c];b.workers=Math.max(1,Math.min(b.workers,4)),this.options=b,this.frames=[],this.freeWorkers=[],this.activeWorkers=[],this.setOptions(b),this.setOption("width",this.options.width),this.setOption("height",this.options.height),this.setOption("transparent",this.options.transparent),this.setOption("background",this.options.background),this.setOption("quality",this.options.quality),this.canvas=document.createElement("canvas"),this.canvas.width=this.options.width,this.canvas.height=this.options.height,this.ctx=this.canvas.getContext("2d"),this.frames=[],this.initWorkers()}function b(a,b){var c=[];for(var d=0;d<a.length;d++)c.push(a[d]);for(var d=c.length;d<b;d++)c.push(0);return c}function c(a,c){var d=[];for(var e=0;e<256;e++)d[e]=e;if(!c)return d;for(var e=0;e<a.length;e+=3){var f=a[e],g=a[e+1],h=a[e+2],i=f<<16|g<<8|h;d[e/3]=i}return d}return a.prototype.setOption=function(a,b){this.options[a]=b,this.canvas&&(a==="width"||a==="height")&&(this.canvas.width=this.options.width,this.canvas.height=this.options.height,this.ctx=this.canvas.getContext("2d"))},a.prototype.setOptions=function(a){for(var b in a)this.setOption(b,a[b])},a.prototype.addFrame=function(a,b){b||(b={}),b.delay=b.delay||0,b.copy=b.copy||!1;var c=document.createElement("canvas");c.width=this.options.width,c.height=this.options.height;var d=c.getContext("2d");this.frames.push({data:null,delay:b.delay,imageData:null,ctx:d,globalAlpha:b.globalAlpha||1,disposeOp:b.disposeOp});var e=this.frames.length-1;if(b.copy){var f=a.getImageData(0,0,this.options.width,this.options.height);this.frames[e].ctx.putImageData(f,0,0)}else this.frames[e].ctx.drawImage(a,0,0,this.options.width,this.options.height)},a.prototype.render=function(){var a=0,b=this.frames.length,c=this.frames.map(function(a){var b=a.ctx.getImageData(0,0,this.options.width,this.options.height);return a.data=b.data,a.imageData=b,a.globalAlpha===1&&!a.disposeOp?null:a.data},this),d=function(){var e=a++;if(e<b){var f=this.frames[e],g=c[e];g&&this.activeWorkers.length<this.options.workers?this.renderFrame(e,f,g,d):(this.renderFrameWorker(e,f,d),++a<b&&this.renderNextFrame())}else this.finishedFrames===b&&this.onRenderCompleteCallback&&this.onRenderCompleteCallback(this.frames)}.bind(this);for(var e=0;e<this.options.workers&&a<b;e++)d()},a.prototype.renderNextFrame=function(){if(this.freeWorkers.length===0)throw new Error("No free workers");this.nextFrame>=this.frames.length&&return;var a=this.frames[this.nextFrame++],b=this.getWorker();this.activeWorkers.push(b),b.postMessage(a)},a.prototype.getWorker=function(){return this.freeWorkers.pop()},a.prototype.freeWorker=function(a){return this.freeWorkers.push(a)},a.prototype.renderFrame=function(a,c,d,e){var f=this.frames,g=c.globalAlpha,h=c.disposeOp;f[a].data=d;for(var i=a-1;i>=0;i--){var j=f[i];if(j.disposeOp===2){f[i].data=null;break}if(j.disposeOp===1)break}e()},a.prototype.renderFrameWorker=function(a,b,c){var d=this.frames,e=this.getWorker();this.activeWorkers.push(e);var f={width:this.options.width,height:this.options.height,delay:b.delay,imageData:b.imageData};e.onmessage=function(b){this.activeWorkers.splice(this.activeWorkers.indexOf(e),1),this.freeWorker(e),d[a].data=b.data,c()}.bind(this),e.postMessage(f)},a.prototype.initWorkers=function(){var a=[];try{for(var c=0;c<this.options.workers;c++)a.push(this.createWorker())}catch(d){this.options.workers=0}this.freeWorkers=a,this.activeWorkers=[]},a.prototype.createWorker=function(){var a=new Blob(['('+b.toString()+'())'],{type:"text/javascript"}),c=window.URL.createObjectURL(a),d=new Worker(c);return d},a.prototype.onRenderComplete=function(a){this.onRenderCompleteCallback=a},a.prototype.onRenderProgress=function(a){this.onRenderProgressCallback=a},a.prototype.finishRendering=function(){var a=0;for(var c=0;c<this.frames.length;c++){var d=this.frames[c].delay;a+=d}var e=new Uint8Array(a+this.frames.length*11+1e3),f=0;e[f++]=71,e[f++]=73,e[f++]=70,e[f++]=56,e[f++]=57,e[f++]=97;var g=this.options.width,h=this.options.height;e[f++]=g&255,e[f++]=g>>8&255,e[f++]=h&255,e[f++]=h>>8&255,e[f++]=240,e[f++]=0,e[f++]=0;var i=this.frames[0].data;for(var c=0;c<i.length;c+=4){var j=i[c],k=i[c+1],l=i[c+2];e[f++]=j,e[f++]=k,e[f++]=l}e[f++]=33,e[f++]=255,e[f++]=11,e[f++]=78,e[f++]=69,e[f++]=84,e[f++]=83,e[f++]=67,e[f++]=65,e[f++]=80,e[f++]=69,e[f++]=50,e[f++]=46,e[f++]=48,e[f++]=3,e[f++]=1,e[f++]=this.options.repeat&255,e[f++]=this.options.repeat>>8&255,e[f++]=0;for(var c=0;c<this.frames.length;c++){var m=this.frames[c],i=m.data;e[f++]=33,e[f++]=249,e[f++]=4,e[f++]=0,e[f++]=m.delay&255,e[f++]=m.delay>>8&255,e[f++]=0,e[f++]=0,e[f++]=44,e[f++]=0,e[f++]=0,e[f++]=0,e[f++]=0,e[f++]=g&255,e[f++]=g>>8&255,e[f++]=h&255,e[f++]=h>>8&255,e[f++]=0;var n=3*g*h,o=new Uint8Array(n),p=0;for(var q=0;q<i.length;q+=4){var j=i[q],k=i[q+1],l=i[q+2];o[p++]=j,o[p++]=k,o[p++]=l}var r=b(o,n),s=r.slice(0,768);e[f++]=8;var t=new Uint8Array(n+n+1),u=0;t[u++]=8;var v=0;for(var q=0;q<n;){var w=Math.min(n-q,255);t[u++]=w;for(var x=0;x<w;x++)t[u++]=o[q++]}t[u++]=0,f+=u}return e[f++]=59,e.subarray(0,f)},a.prototype.stream=function(){return new Blob([this.finishRendering()],{type:"image/gif"})},a}();typeof exports!="undefined"?module.exports=d:window.GIF=d}),a("gif.js")})();`,
      ],
      { type: "application/javascript" },
    )

    const workerUrl = URL.createObjectURL(workerBlob)

    const gif = new GIF({
      workers: 2,
      quality: options.quality,
      width,
      height,
      workerScript: workerUrl,
      repeat: options.loop, // 0 for infinite loop, -1 for no repeat
      background: "#000000",
      transparent: null,
    })

    // Make sure to revoke the URL when done
    gif.on("finished", () => {
      URL.revokeObjectURL(workerUrl)
    })

    // If we're including transitions, we need to generate intermediate frames
    const totalFrames = options.includeTransitions
      ? slides.length +
        slides.reduce(
          (acc, slide, i) =>
            i > 0 && slide.transition && slide.transition.type !== "none"
              ? acc + Math.ceil(10 * (slide.transition.duration || 0.5))
              : acc,
          0,
        )
      : slides.length

    let frameCount = 0
    updateProgress(0, "Rendering frames...")

    // Process each slide
    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i]

      // Handle transitions between slides
      if (options.includeTransitions && i > 0 && slide.transition && slide.transition.type !== "none") {
        const prevSlide = slides[i - 1]
        const transitionFrames = Math.ceil(10 * (slide.transition.duration || 0.5)) // 10 frames per second of transition

        // Generate transition frames
        for (let t = 0; t < transitionFrames; t++) {
          const progress = t / transitionFrames
          const transitionCanvas = await renderTransitionFrame(
            prevSlide,
            slide,
            progress,
            slide.transition,
            width,
            height,
          )

          // Add the transition frame
          gif.addFrame(transitionCanvas, {
            delay: Math.round(((slide.transition.duration || 0.5) * 1000) / transitionFrames),
            copy: true,
          })

          frameCount++
          updateProgress((frameCount / totalFrames) * 100, `Rendering transition ${i}/${slides.length - 1}...`)
        }
      }

      // Render the main slide
      const canvas = await renderSlideToCanvas(slide, {
        width,
        height,
        includeAnimations: options.includeAnimations,
      })

      // Add the frame to the GIF
      gif.addFrame(canvas, {
        delay: options.frameDuration,
        copy: true,
      })

      frameCount++
      updateProgress((frameCount / totalFrames) * 100, `Rendering slide ${i + 1}/${slides.length}...`)
    }

    updateProgress(100, "Generating GIF...")

    // Render the GIF
    gif.on("progress", (p: number) => {
      updateProgress(Math.round(p * 100), "Encoding GIF...")
    })

    gif.on("finished", (blob: Blob) => {
      // Create a download link
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `${title}.gif`

      // Trigger the download
      document.body.appendChild(link)
      link.click()

      // Clean up
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      document.body.removeChild(progressContainer)
    })

    // Start the rendering process
    gif.render()
  } catch (error) {
    console.error("Error exporting to GIF:", error)
    throw error
  }
}

// Add a new function to render transition frames
async function renderTransitionFrame(
  fromSlide: Slide,
  toSlide: Slide,
  progress: number,
  transition: any,
  width: number,
  height: number,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext("2d")!

  // Render both slides to separate canvases
  const fromCanvas = await renderSlideToCanvas(fromSlide, { width, height })
  const toCanvas = await renderSlideToCanvas(toSlide, { width, height })

  // Apply transition effect based on type
  switch (transition.type) {
    case "fade":
      // Draw the first slide
      ctx.globalAlpha = 1 - progress
      ctx.drawImage(fromCanvas, 0, 0)

      // Draw the second slide with increasing opacity
      ctx.globalAlpha = progress
      ctx.drawImage(toCanvas, 0, 0)
      break

    case "slide":
      // Determine slide direction
      const direction = transition.direction || "left"
      let x1 = 0,
        y1 = 0,
        x2 = 0,
        y2 = 0

      if (direction === "left") {
        x1 = width * progress * -1
        x2 = width - width * progress
      } else if (direction === "right") {
        x1 = width * progress
        x2 = width * progress * -1
      } else if (direction === "top") {
        y1 = height * progress * -1
        y2 = height - height * progress
      } else if (direction === "bottom") {
        y1 = height * progress
        y2 = height * progress * -1
      }

      ctx.drawImage(fromCanvas, x1, y1)
      ctx.drawImage(toCanvas, x2, y2)
      break

    case "zoom":
      // Draw the first slide zooming out
      const scale1 = 1 + 0.5 * (1 - progress)
      const offsetX1 = (width - width * scale1) / 2
      const offsetY1 = (height - height * scale1) / 2

      ctx.globalAlpha = 1 - progress
      ctx.drawImage(fromCanvas, offsetX1, offsetY1, width * scale1, height * scale1)

      // Draw the second slide zooming in
      const scale2 = 0.5 + 0.5 * progress
      const offsetX2 = (width - width * scale2) / 2
      const offsetY2 = (height - height * scale2) / 2

      ctx.globalAlpha = progress
      ctx.drawImage(toCanvas, offsetX2, offsetY2, width * scale2, height * scale2)
      break

    case "flip":
      // This is a simplified version of flip - a more realistic one would use 3D transforms
      const flipProgress = Math.abs(Math.sin(progress * Math.PI))

      if (progress < 0.5) {
        // First half of the transition - show first slide shrinking horizontally
        const scaleX = 1 - flipProgress
        const offsetX = (width - width * scaleX) / 2
        ctx.drawImage(fromCanvas, offsetX, 0, width * scaleX, height)
      } else {
        // Second half - show second slide growing horizontally
        const scaleX = flipProgress
        const offsetX = (width - width * scaleX) / 2
        ctx.drawImage(toCanvas, offsetX, 0, width * scaleX, height)
      }
      break

    case "cube":
      // Simplified cube effect
      const angle = progress * 90
      const radian = (angle * Math.PI) / 180

      // Calculate width based on rotation
      const w1 = width * Math.cos(radian)
      const w2 = width * Math.sin(radian)

      if (progress < 0.5) {
        // Draw first slide rotating away
        ctx.drawImage(fromCanvas, (width - w1) / 2, 0, w1, height)
      } else {
        // Draw second slide rotating in
        ctx.drawImage(toCanvas, (width - w2) / 2, 0, w2, height)
      }
      break

    default:
      // Fallback to crossfade
      ctx.globalAlpha = 1 - progress
      ctx.drawImage(fromCanvas, 0, 0)
      ctx.globalAlpha = progress
      ctx.drawImage(toCanvas, 0, 0)
  }

  return canvas
}
