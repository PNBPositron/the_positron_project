"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Play, Share2 } from "lucide-react"
import Link from "next/link"
import { getSharedPresentation, type SharedPresentation } from "@/lib/share-utils"
import { toast } from "@/components/ui/use-toast"
import PresentationMode from "@/components/presentation-mode"
import SlideCanvas from "@/components/slide-canvas"

export default function SharedPresentationPage() {
  const params = useParams()
  const token = params.token as string

  const [presentation, setPresentation] = useState<SharedPresentation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isPresentationMode, setIsPresentationMode] = useState(false)
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0)

  useEffect(() => {
    const loadPresentation = async () => {
      if (!token) {
        setError("Invalid share link")
        setIsLoading(false)
        return
      }

      try {
        const sharedPresentation = await getSharedPresentation(token)

        if (!sharedPresentation) {
          setError("Presentation not found or no longer shared")
          setIsLoading(false)
          return
        }

        setPresentation(sharedPresentation)
      } catch (error: any) {
        console.error("Error loading shared presentation:", error)
        setError("Failed to load presentation")
      } finally {
        setIsLoading(false)
      }
    }

    loadPresentation()
  }, [token])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: presentation?.title || "Shared Presentation",
          text: `Check out this presentation: ${presentation?.title}`,
          url: window.location.href,
        })
      } catch (error) {
        // User cancelled sharing or sharing failed
        console.log("Sharing cancelled or failed:", error)
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.href)
        toast({
          title: "Link copied!",
          description: "The presentation link has been copied to your clipboard.",
          variant: "default",
        })
      } catch (error) {
        toast({
          title: "Failed to copy link",
          description: "Please copy the link manually from your browser's address bar.",
          variant: "destructive",
        })
      }
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading presentation...</p>
        </div>
      </div>
    )
  }

  if (error || !presentation) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <Share2 className="h-8 w-8 text-red-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-100 mb-2">Presentation Not Found</h1>
          <p className="text-gray-400 mb-6">
            {error || "This presentation may have been removed or is no longer shared."}
          </p>
          <Link href="/">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go to Positron
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isPresentationMode) {
    return (
      <PresentationMode
        slides={presentation.slides}
        initialSlide={currentSlideIndex}
        onExit={() => setIsPresentationMode(false)}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Header */}
      <header className="border-b border-gray-800/20 p-4 bg-gradient-to-r from-gray-900/40 via-gray-800/30 to-gray-900/40 backdrop-blur-3xl backdrop-saturate-200 supports-[backdrop-filter]:bg-gray-900/20 shadow-2xl shadow-blue-500/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button
                variant="ghost"
                size="sm"
                className="text-gray-300 hover:bg-gray-700/50 hover:text-gray-100 transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Positron
              </Button>
            </Link>
            <div className="h-6 w-px bg-gray-600"></div>
            <div>
              <h1 className="text-lg font-semibold text-gray-100">{presentation.title}</h1>
              <p className="text-sm text-gray-400">Shared presentation • Read-only</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className="text-gray-300 hover:bg-gray-700/50 hover:text-gray-100 transition-all duration-300"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button
              onClick={() => setIsPresentationMode(true)}
              className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Presentation
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Slides Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-gray-900/20 backdrop-blur-2xl backdrop-saturate-150 rounded-2xl p-4 border border-gray-700/30">
              <h3 className="text-sm font-medium text-gray-300 mb-4">Slides ({presentation.slides.length})</h3>
              <div className="space-y-2">
                {presentation.slides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={() => setCurrentSlideIndex(index)}
                    className={`w-full p-3 rounded-xl border-2 transition-all duration-200 ${
                      currentSlideIndex === index
                        ? "border-blue-500 bg-blue-500/10"
                        : "border-gray-700/40 bg-gray-800/30 hover:border-gray-600/60 hover:bg-gray-800/50"
                    }`}
                  >
                    <div className="aspect-video bg-gray-800 rounded-lg mb-2 overflow-hidden">
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                        Slide {index + 1}
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 text-center">Slide {index + 1}</p>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Main Canvas */}
          <div className="lg:col-span-3">
            <div className="bg-gray-900/20 backdrop-blur-2xl backdrop-saturate-150 rounded-2xl p-6 border border-gray-700/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                    disabled={currentSlideIndex === 0}
                    className="border-gray-700/40 bg-gray-800/30 hover:bg-gray-700/40 text-gray-100"
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-gray-400">
                    {currentSlideIndex + 1} / {presentation.slides.length}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentSlideIndex(Math.min(presentation.slides.length - 1, currentSlideIndex + 1))
                    }
                    disabled={currentSlideIndex === presentation.slides.length - 1}
                    className="border-gray-700/40 bg-gray-800/30 hover:bg-gray-700/40 text-gray-100"
                  >
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </Button>
                </div>

                <Button
                  onClick={() => setIsPresentationMode(true)}
                  className="bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Present
                </Button>
              </div>

              {/* Canvas */}
              <div className="bg-[radial-gradient(ellipse_at_top_right,#0ea5e9_0%,#eab308_100%)] rounded-2xl p-8 flex items-center justify-center">
                <div className="relative">
                  <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/30 to-yellow-400/30 rounded-2xl blur-xl opacity-30"></div>
                  <SlideCanvas
                    slide={presentation.slides[currentSlideIndex]}
                    selectedElementId={null}
                    onSelectElement={() => {}} // Read-only mode
                    onUpdateElement={() => {}} // Read-only mode
                    zoomLevel={75}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
