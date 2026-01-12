export interface TextElement {
  id: string
  type: "text"
  content: string
  x: number
  y: number
  width: number
  height: number
  fontSize: number
  fontWeight: "normal" | "bold"
  textAlign: string
  fontFamily: string
  fontStyle?: string
  textDecoration?: string
  animation?: ElementAnimation
  rotation?: number
  // Add 3D effect properties
  textEffect?: {
    type: "none" | "shadow" | "extrude" | "neon" | "3d-rotate" | "perspective"
    depth?: number
    color?: string
    angle?: number
    intensity?: number
    perspective?: number
  }
}

export interface ShapeElement {
  id: string
  type: "shape"
  shape:
    | "square"
    | "circle"
    | "triangle"
    | "pentagon"
    | "hexagon"
    | "star"
    | "arrow"
    | "diamond"
    | "rounded-rect"
    | "speech-bubble"
  x: number
  y: number
  width: number
  height: number
  color: string
  animation?: ElementAnimation
  rotation?: number
  cornerRadius?: number
  glassmorphism?: {
    enabled: boolean
    blur: number
    opacity: number
    borderOpacity: number
    saturation: number
  }
}

export interface ImageElement {
  id: string
  type: "image"
  src: string
  x: number
  y: number
  width: number
  height: number
  filters?: {
    grayscale?: number
    sepia?: number
    blur?: number
    brightness?: number
    contrast?: number
    hueRotate?: number
    saturate?: number
    opacity?: number
  }
  effects?: {
    borderRadius?: number
    borderWidth?: number
    borderColor?: string
    shadowBlur?: number
    shadowColor?: string
    shadowOffsetX?: number
    shadowOffsetY?: number
    skewX?: number
    skewY?: number
    scale?: number
  }
  animation?: ElementAnimation
  rotation?: number
  imageEffect3d?: {
    type: "none" | "tilt" | "flip" | "rotate" | "float" | "perspective" | "fold"
    intensity?: number
    angle?: number
    perspective?: number
    rotateX?: number
    rotateY?: number
    rotateZ?: number
    translateZ?: number
    hover?: boolean
  }
  interactions?: {
    type: string
    clickAction: "none" | "lightbox" | "link" | "toggle" | "animate"
    hoverAction: "none" | "zoom" | "brightness" | "blur" | "grayscale" | "scale" | "glow"
    linkUrl?: string
    lightbox?: boolean
    tooltip?: string
    animationTrigger?: "onLoad" | "onHover" | "onClick" | "onScroll"
  }
}

export interface VideoElement {
  id: string
  type: "video"
  src: string
  x: number
  y: number
  width: number
  height: number
  autoplay: boolean
  controls: boolean
  loop: boolean
  muted: boolean
  animation?: ElementAnimation
  rotation?: number
}

export interface AudioElement {
  id: string
  type: "audio"
  src: string
  x: number
  y: number
  width: number
  height: number
  autoplay: boolean
  controls: boolean
  loop: boolean
  animation?: ElementAnimation
  rotation?: number
}

export type SlideElement = TextElement | ShapeElement | ImageElement | VideoElement | AudioElement

export interface SlideBackground {
  type: "color" | "gradient" | "image"
  value: string
  imagePosition?: "cover" | "contain" | "center"
  imageOpacity?: number
  overlay?: string
}

export interface ElementAnimation {
  type: "fade" | "slide" | "zoom" | "bounce" | "flip" | "rotate" | "none"
  direction?: "left" | "right" | "top" | "bottom"
  delay: number
  duration: number
  trigger: "onLoad" | "onClick"
  easing: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out"
}

export interface SlideTransition {
  type: "none" | "fade" | "slide" | "zoom" | "flip" | "cube" | "carousel" | "fold" | "reveal" | "room"
  direction?: "left" | "right" | "top" | "bottom"
  duration: number
  easing: "linear" | "ease" | "ease-in" | "ease-out" | "ease-in-out"
  perspective?: number
  depth?: number
  rotate?: number
}

export interface Slide {
  id: string
  elements: SlideElement[]
  background: string | SlideBackground
  transition?: SlideTransition
}
