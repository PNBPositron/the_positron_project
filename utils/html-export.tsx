import type {
  Slide,
  SlideElement,
  TextElement,
  ShapeElement,
  ImageElement,
  VideoElement,
  AudioElement,
} from "@/types/editor"

// Helper function to generate shape SVG paths
const getShapePath = (shape: string, width: number, height: number, cornerRadius = 0): string => {
  const w = width
  const h = height
  const r = Math.min(cornerRadius, Math.min(w, h) / 2)

  switch (shape) {
    case "square":
    case "rounded-rect":
      if (r > 0) {
        return `M ${r} 0 L ${w - r} 0 Q ${w} 0 ${w} ${r} L ${w} ${h - r} Q ${w} ${h} ${w - r} ${h} L ${r} ${h} Q 0 ${h} 0 ${h - r} L 0 ${r} Q 0 0 ${r} 0 Z`
      }
      return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`

    case "circle":
      const cx = w / 2
      const cy = h / 2
      const rx = w / 2
      const ry = h / 2
      return `M ${cx - rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A ${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`

    case "triangle":
      const points = [
        [w / 2, r],
        [w - r * 0.866, h - r * 0.5],
        [r * 0.866, h - r * 0.5],
      ]
      if (r > 0) {
        return `M ${points[0][0]} ${points[0][1]} L ${points[1][0]} ${points[1][1]} L ${points[2][0]} ${points[2][1]} Z`
      }
      return `M ${w / 2} 0 L ${w} ${h} L 0 ${h} Z`

    case "pentagon":
      const centerX = w / 2
      const centerY = h / 2
      const radius = Math.min(w, h) / 2
      const pentagonPoints = []
      for (let i = 0; i < 5; i++) {
        const angle = (i * 2 * Math.PI) / 5 - Math.PI / 2
        pentagonPoints.push([centerX + radius * Math.cos(angle), centerY + radius * Math.sin(angle)])
      }
      return `M ${pentagonPoints.map((p) => `${p[0]} ${p[1]}`).join(" L ")} Z`

    case "hexagon":
      const hexCenterX = w / 2
      const hexCenterY = h / 2
      const hexRadius = Math.min(w, h) / 2
      const hexPoints = []
      for (let i = 0; i < 6; i++) {
        const angle = (i * 2 * Math.PI) / 6
        hexPoints.push([hexCenterX + hexRadius * Math.cos(angle), hexCenterY + hexRadius * Math.sin(angle)])
      }
      return `M ${hexPoints.map((p) => `${p[0]} ${p[1]}`).join(" L ")} Z`

    case "star":
      const starCenterX = w / 2
      const starCenterY = h / 2
      const outerRadius = Math.min(w, h) / 2
      const innerRadius = outerRadius * 0.4
      const starPoints = []
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI) / 5 - Math.PI / 2
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        starPoints.push([starCenterX + radius * Math.cos(angle), starCenterY + radius * Math.sin(angle)])
      }
      return `M ${starPoints.map((p) => `${p[0]} ${p[1]}`).join(" L ")} Z`

    case "diamond":
      if (r > 0) {
        return `M ${w / 2} ${r} L ${w - r} ${h / 2} L ${w / 2} ${h - r} L ${r} ${h / 2} Z`
      }
      return `M ${w / 2} 0 L ${w} ${h / 2} L ${w / 2} ${h} L 0 ${h / 2} Z`

    case "arrow":
      const arrowWidth = w * 0.6
      const arrowHeight = h * 0.3
      return `M 0 ${h / 2 - arrowHeight / 2} L ${arrowWidth} ${h / 2 - arrowHeight / 2} L ${arrowWidth} 0 L ${w} ${h / 2} L ${arrowWidth} ${h} L ${arrowWidth} ${h / 2 + arrowHeight / 2} L 0 ${h / 2 + arrowHeight / 2} Z`

    case "speech-bubble":
      const bubbleR = Math.min(r, 20)
      const tailSize = Math.min(w, h) * 0.1
      return `M ${bubbleR} 0 L ${w - bubbleR} 0 Q ${w} 0 ${w} ${bubbleR} L ${w} ${h - bubbleR - tailSize} Q ${w} ${h - tailSize} ${w - bubbleR} ${h - tailSize} L ${bubbleR + tailSize * 2} ${h - tailSize} L ${bubbleR} ${h} L ${bubbleR * 2} ${h - tailSize} L ${bubbleR} ${h - tailSize} Q 0 ${h - tailSize} 0 ${h - bubbleR - tailSize} L 0 ${bubbleR} Q 0 0 ${bubbleR} 0 Z`

    default:
      return `M 0 0 L ${w} 0 L ${w} ${h} L 0 ${h} Z`
  }
}

// Helper function to get text effect styles
const getTextEffectStyle = (textEffect: any): string => {
  if (!textEffect || textEffect.type === "none") return ""

  const { type, depth = 5, color = "#000000", angle = 45, intensity = 5, perspective = 500 } = textEffect

  switch (type) {
    case "shadow":
      return `text-shadow: 2px 2px 4px ${color};`

    case "extrude":
      const shadows = []
      for (let i = 1; i <= depth; i++) {
        const opacity = 1 - (i / depth) * 0.8
        shadows.push(
          `${i}px ${i}px 0 ${color}${Math.round(opacity * 255)
            .toString(16)
            .padStart(2, "0")}`,
        )
      }
      return `text-shadow: ${shadows.join(", ")};`

    case "neon":
      return `
        text-shadow: 
          0 0 5px ${color},
          0 0 10px ${color},
          0 0 15px ${color},
          0 0 20px ${color};
        color: white;
      `

    case "3d-rotate":
      const rotateX = Math.sin((angle * Math.PI) / 180) * intensity
      const rotateY = Math.cos((angle * Math.PI) / 180) * intensity
      return `
        transform: perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg);
        transform-style: preserve-3d;
      `

    case "perspective":
      return `
        transform: perspective(${perspective}px) rotateX(${intensity}deg);
        transform-origin: center center;
      `

    default:
      return ""
  }
}

// Helper function to get image filter styles
const getImageFilterStyle = (element: ImageElement): string => {
  const { filters, effects } = element
  let styles = ""

  if (filters) {
    let filterString = ""
    if (filters.grayscale) filterString += `grayscale(${filters.grayscale}%) `
    if (filters.sepia) filterString += `sepia(${filters.sepia}%) `
    if (filters.blur) filterString += `blur(${filters.blur}px) `
    if (filters.brightness) filterString += `brightness(${filters.brightness}%) `
    if (filters.contrast) filterString += `contrast(${filters.contrast}%) `
    if (filters.hueRotate) filterString += `hue-rotate(${filters.hueRotate}deg) `
    if (filters.saturate) filterString += `saturate(${filters.saturate}%) `
    if (filters.opacity) filterString += `opacity(${filters.opacity}%) `

    if (filterString) styles += `filter: ${filterString.trim()}; `
  }

  if (effects) {
    if (effects.borderRadius) styles += `border-radius: ${effects.borderRadius}%; `
    if (effects.borderWidth) {
      styles += `border: ${effects.borderWidth}px solid ${effects.borderColor || "#ffffff"}; `
    }
    if (effects.shadowBlur) {
      styles += `box-shadow: ${effects.shadowOffsetX || 0}px ${effects.shadowOffsetY || 0}px ${effects.shadowBlur}px ${effects.shadowColor || "#000000"}; `
    }

    // Add new transform effects
    let transformString = ""
    if (effects.skewX) transformString += `skewX(${effects.skewX}deg) `
    if (effects.skewY) transformString += `skewY(${effects.skewY}deg) `
    if (effects.scale && effects.scale !== 100) transformString += `scale(${effects.scale / 100}) `

    if (transformString) {
      styles += `transform: ${transformString.trim()}; `
    }
  }

  return styles
}

// Helper function to get glassmorphism styles
const getGlassmorphismStyle = (glassmorphism: any, color: string): string => {
  if (!glassmorphism?.enabled) return `background-color: ${color};`

  const { blur = 10, opacity = 20, borderOpacity = 30, saturation = 180 } = glassmorphism

  return `
    background: ${color}${Math.round((opacity / 100) * 255)
      .toString(16)
      .padStart(2, "0")};
    backdrop-filter: blur(${blur}px) saturate(${saturation}%);
    -webkit-backdrop-filter: blur(${blur}px) saturate(${saturation}%);
    border: 1px solid ${color}${Math.round((borderOpacity / 100) * 255)
      .toString(16)
      .padStart(2, "0")};
  `
}

// Helper function to get background styles
const getBackgroundStyle = (background: any): string => {
  if (typeof background === "string") {
    return `background: ${background};`
  }

  if (background.type === "color") {
    return `background-color: ${background.value};`
  }

  if (background.type === "gradient") {
    return `background: ${background.value};`
  }

  if (background.type === "image") {
    let styles = `
      background-image: url(${background.value});
      background-size: ${background.imagePosition || "cover"};
      background-position: center;
      background-repeat: no-repeat;
    `

    if (background.imageOpacity && background.imageOpacity < 100) {
      styles += `opacity: ${background.imageOpacity / 100};`
    }

    return styles
  }

  return "background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);"
}

// Helper function to render a slide element
const renderElement = (element: SlideElement): string => {
  const baseStyle = `
    position: absolute;
    left: ${element.x}px;
    top: ${element.y}px;
    width: ${element.width}px;
    height: ${element.height}px;
    transform: rotate(${element.rotation || 0}deg);
    transform-origin: center center;
  `

  if (element.type === "text") {
    const textElement = element as TextElement
    const textEffectStyle = getTextEffectStyle(textElement.textEffect)

    return `
      <div class="slide-element text-element" data-animation="${textElement.animation?.type || "none"}" style="${baseStyle}">
        <div style="
          width: 100%;
          height: 100%;
          font-size: ${textElement.fontSize}px;
          font-weight: ${textElement.fontWeight};
          text-align: ${textElement.textAlign};
          font-family: ${textElement.fontFamily};
          font-style: ${textElement.fontStyle || "normal"};
          text-decoration: ${textElement.textDecoration || "none"};
          color: white;
          overflow: hidden;
          display: flex;
          align-items: center;
          ${textEffectStyle}
        ">${textElement.content}</div>
      </div>
    `
  }

  if (element.type === "shape") {
    const shapeElement = element as ShapeElement
    const shapePath = getShapePath(
      shapeElement.shape,
      shapeElement.width,
      shapeElement.height,
      shapeElement.cornerRadius,
    )
    const shapeStyle = getGlassmorphismStyle(shapeElement.glassmorphism, shapeElement.color)

    return `
      <div class="slide-element shape-element" data-animation="${shapeElement.animation?.type || "none"}" style="${baseStyle}">
        <svg width="100%" height="100%" viewBox="0 0 ${shapeElement.width} ${shapeElement.height}">
          <path d="${shapePath}" style="${shapeStyle}" />
        </svg>
      </div>
    `
  }

  if (element.type === "image") {
    const imageElement = element as ImageElement
    const imageStyle = getImageFilterStyle(imageElement)

    return `
      <div class="slide-element image-element" data-animation="${imageElement.animation?.type || "none"}" style="${baseStyle}">
        <img src="${imageElement.src}" alt="Slide image" style="
          width: 100%;
          height: 100%;
          object-fit: cover;
          ${imageStyle}
        " />
      </div>
    `
  }

  if (element.type === "video") {
    const videoElement = element as VideoElement

    return `
      <div class="slide-element video-element" data-animation="${videoElement.animation?.type || "none"}" style="${baseStyle}">
        <video 
          src="${videoElement.src}"
          style="width: 100%; height: 100%; object-fit: cover;"
          ${videoElement.autoplay ? "autoplay" : ""}
          ${videoElement.controls ? "controls" : ""}
          ${videoElement.loop ? "loop" : ""}
          ${videoElement.muted ? "muted" : ""}
        ></video>
      </div>
    `
  }

  if (element.type === "audio") {
    const audioElement = element as AudioElement

    return `
      <div class="slide-element audio-element" data-animation="${audioElement.animation?.type || "none"}" style="${baseStyle}">
        <audio 
          src="${audioElement.src}"
          style="width: 100%; height: 100%;"
          ${audioElement.autoplay ? "autoplay" : ""}
          ${audioElement.controls ? "controls" : ""}
          ${audioElement.loop ? "loop" : ""}
        ></audio>
      </div>
    `
  }

  return ""
}

// Main export function
export const exportToHtml = async (slides: Slide[], title: string): Promise<void> => {
  const slidesHtml = slides
    .map((slide, index) => {
      const backgroundStyle = getBackgroundStyle(slide.background)
      const elementsHtml = slide.elements.map(renderElement).join("\n")

      return `
      <div class="slide" data-slide="${index}" style="
        position: relative;
        width: 1000px;
        height: 562.5px;
        ${backgroundStyle}
        ${typeof slide.background !== "string" && slide.background.overlay ? `background-color: ${slide.background.overlay};` : ""}
        border-radius: 32px;
        overflow: hidden;
        box-shadow: 0 0 30px rgba(14, 165, 233, 0.2), 0 0 10px rgba(234, 179, 8, 0.1);
      ">
        ${elementsHtml}
      </div>
    `
    })
    .join("\n")

  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: white;
            overflow: hidden;
            height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .presentation-container {
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .slide {
            display: none;
            animation: slideIn 0.5s ease-in-out;
        }

        .slide.active {
            display: block;
        }

        .slide-element {
            transition: all 0.3s ease;
        }

        /* Animation Classes */
        .animate-fade { animation: fadeIn 1s ease-in-out; }
        .animate-slide-left { animation: slideInLeft 1s ease-in-out; }
        .animate-slide-right { animation: slideInRight 1s ease-in-out; }
        .animate-slide-up { animation: slideInUp 1s ease-in-out; }
        .animate-slide-down { animation: slideInDown 1s ease-in-out; }
        .animate-zoom { animation: zoomIn 1s ease-in-out; }
        .animate-bounce { animation: bounceIn 1s ease-in-out; }
        .animate-flip { animation: flipIn 1s ease-in-out; }
        .animate-rotate { animation: rotateIn 1s ease-in-out; }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes slideInLeft {
            from { transform: translateX(-100px) rotate(var(--rotation, 0deg)); opacity: 0; }
            to { transform: translateX(0) rotate(var(--rotation, 0deg)); opacity: 1; }
        }

        @keyframes slideInRight {
            from { transform: translateX(100px) rotate(var(--rotation, 0deg)); opacity: 0; }
            to { transform: translateX(0) rotate(var(--rotation, 0deg)); opacity: 1; }
        }

        @keyframes slideInUp {
            from { transform: translateY(-100px) rotate(var(--rotation, 0deg)); opacity: 0; }
            to { transform: translateY(0) rotate(var(--rotation, 0deg)); opacity: 1; }
        }

        @keyframes slideInDown {
            from { transform: translateY(100px) rotate(var(--rotation, 0deg)); opacity: 0; }
            to { transform: translateY(0) rotate(var(--rotation, 0deg)); opacity: 1; }
        }

        @keyframes zoomIn {
            from { transform: scale(0.5) rotate(var(--rotation, 0deg)); opacity: 0; }
            to { transform: scale(1) rotate(var(--rotation, 0deg)); opacity: 1; }
        }

        @keyframes bounceIn {
            0% { transform: scale(0.3) rotate(var(--rotation, 0deg)); opacity: 0; }
            50% { transform: scale(1.05) rotate(var(--rotation, 0deg)); }
            70% { transform: scale(0.9) rotate(var(--rotation, 0deg)); }
            100% { transform: scale(1) rotate(var(--rotation, 0deg)); opacity: 1; }
        }

        @keyframes flipIn {
            from { transform: perspective(400px) rotateY(90deg) rotate(var(--rotation, 0deg)); opacity: 0; }
            to { transform: perspective(400px) rotateY(0deg) rotate(var(--rotation, 0deg)); opacity: 1; }
        }

        @keyframes rotateIn {
            from { transform: rotate(calc(var(--rotation, 0deg) - 180deg)) scale(0.5); opacity: 0; }
            to { transform: rotate(var(--rotation, 0deg)) scale(1); opacity: 1; }
        }

        @keyframes slideIn {
            from { opacity: 0; transform: translateX(50px); }
            to { opacity: 1; transform: translateX(0); }
        }

        /* Controls */
        .controls {
            position: fixed;
            bottom: 30px;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            align-items: center;
            gap: 20px;
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(20px);
            padding: 15px 25px;
            border-radius: 50px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            z-index: 1000;
        }

        .control-btn {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
            color: white;
            padding: 10px 15px;
            border-radius: 25px;
            cursor: pointer;
            transition: all 0.3s ease;
            font-size: 14px;
            font-weight: 500;
        }

        .control-btn:hover {
            background: rgba(14, 165, 233, 0.3);
            border-color: rgba(14, 165, 233, 0.5);
            transform: translateY(-2px);
        }

        .control-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
        }

        .control-btn:disabled:hover {
            transform: none;
            background: rgba(255, 255, 255, 0.1);
        }

        .slide-counter {
            color: rgba(255, 255, 255, 0.8);
            font-size: 14px;
            font-weight: 500;
            padding: 8px 16px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .title-overlay {
            position: fixed;
            top: 30px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(15, 23, 42, 0.8);
            backdrop-filter: blur(20px);
            padding: 12px 24px;
            border-radius: 25px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            color: white;
            font-size: 18px;
            font-weight: 600;
            z-index: 1000;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
            .slide {
                transform: scale(0.8);
                transform-origin: center center;
            }
        }

        @media (max-width: 900px) {
            .slide {
                transform: scale(0.6);
            }
            
            .controls {
                bottom: 20px;
                padding: 12px 20px;
            }
            
            .control-btn {
                padding: 8px 12px;
                font-size: 12px;
            }
        }

        @media (max-width: 600px) {
            .slide {
                transform: scale(0.4);
            }
            
            .title-overlay {
                top: 20px;
                font-size: 16px;
                padding: 10px 20px;
            }
        }

        /* Fullscreen styles */
        .fullscreen {
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            width: 100vw !important;
            height: 100vh !important;
            z-index: 9999 !important;
            background: #000 !important;
        }

        .fullscreen .slide {
            transform: none !important;
            width: 100vw !important;
            height: 100vh !important;
        }
    </style>
</head>
<body>
    <div class="title-overlay">${title}</div>
    
    <div class="presentation-container" id="presentationContainer">
        ${slidesHtml}
    </div>

    <div class="controls">
        <button class="control-btn" id="prevBtn" onclick="previousSlide()">← Previous</button>
        <div class="slide-counter">
            <span id="currentSlide">1</span> / <span id="totalSlides">${slides.length}</span>
        </div>
        <button class="control-btn" id="nextBtn" onclick="nextSlide()">Next →</button>
        <button class="control-btn" onclick="toggleFullscreen()">⛶ Fullscreen</button>
    </div>

    <script>
        let currentSlideIndex = 0;
        const totalSlides = ${slides.length};
        const slides = document.querySelectorAll('.slide');

        function showSlide(index) {
            // Hide all slides
            slides.forEach(slide => {
                slide.classList.remove('active');
            });

            // Show current slide
            if (slides[index]) {
                slides[index].classList.add('active');
                
                // Animate elements
                const elements = slides[index].querySelectorAll('.slide-element');
                elements.forEach((element, i) => {
                    const animationType = element.getAttribute('data-animation');
                    const rotation = element.style.transform.match(/rotate\$$([^)]+)\$$/);
                    const rotationValue = rotation ? rotation[1] : '0deg';
                    
                    element.style.setProperty('--rotation', rotationValue);
                    element.classList.remove('animate-fade', 'animate-slide-left', 'animate-slide-right', 
                                           'animate-slide-up', 'animate-slide-down', 'animate-zoom', 
                                           'animate-bounce', 'animate-flip', 'animate-rotate');
                    
                    setTimeout(() => {
                        switch(animationType) {
                            case 'fade':
                                element.classList.add('animate-fade');
                                break;
                            case 'slide':
                                element.classList.add('animate-slide-left');
                                break;
                            case 'zoom':
                                element.classList.add('animate-zoom');
                                break;
                            case 'bounce':
                                element.classList.add('animate-bounce');
                                break;
                            case 'flip':
                                element.classList.add('animate-flip');
                                break;
                            case 'rotate':
                                element.classList.add('animate-rotate');
                                break;
                            default:
                                element.classList.add('animate-fade');
                        }
                    }, i * 100);
                });
            }

            // Update counter
            document.getElementById('currentSlide').textContent = index + 1;
            
            // Update button states
            document.getElementById('prevBtn').disabled = index === 0;
            document.getElementById('nextBtn').disabled = index === totalSlides - 1;
        }

        function nextSlide() {
            if (currentSlideIndex < totalSlides - 1) {
                currentSlideIndex++;
                showSlide(currentSlideIndex);
            }
        }

        function previousSlide() {
            if (currentSlideIndex > 0) {
                currentSlideIndex--;
                showSlide(currentSlideIndex);
            }
        }

        function toggleFullscreen() {
            const container = document.getElementById('presentationContainer');
            
            if (!document.fullscreenElement) {
                container.requestFullscreen().then(() => {
                    container.classList.add('fullscreen');
                }).catch(err => {
                    console.log('Error attempting to enable fullscreen:', err);
                });
            } else {
                document.exitFullscreen().then(() => {
                    container.classList.remove('fullscreen');
                });
            }
        }

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowRight':
                case ' ':
                case 'PageDown':
                    e.preventDefault();
                    nextSlide();
                    break;
                case 'ArrowLeft':
                case 'PageUp':
                    e.preventDefault();
                    previousSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    currentSlideIndex = 0;
                    showSlide(currentSlideIndex);
                    break;
                case 'End':
                    e.preventDefault();
                    currentSlideIndex = totalSlides - 1;
                    showSlide(currentSlideIndex);
                    break;
                case 'F11':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'Escape':
                    if (document.fullscreenElement) {
                        document.exitFullscreen();
                    }
                    break;
            }
        });

        // Touch/swipe support for mobile
        let touchStartX = 0;
        let touchEndX = 0;

        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });

        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        });

        function handleSwipe() {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    // Swipe left - next slide
                    nextSlide();
                } else {
                    // Swipe right - previous slide
                    previousSlide();
                }
            }
        }

        // Handle fullscreen changes
        document.addEventListener('fullscreenchange', () => {
            const container = document.getElementById('presentationContainer');
            if (!document.fullscreenElement) {
                container.classList.remove('fullscreen');
            }
        });

        // Initialize
        showSlide(0);
    </script>
</body>
</html>
  `

  // Create and download the HTML file
  const blob = new Blob([htmlContent], { type: "text/html" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.html`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
