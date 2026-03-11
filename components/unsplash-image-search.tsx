"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "@/components/ui/use-toast"
import {
  Search,
  Loader2,
  ImageIcon,
  ExternalLink,
  Download,
  Sparkles,
  Landscape,
  Square,
  RectangleVertical,
} from "lucide-react"

interface UnsplashImage {
  id: string
  urls: {
    raw: string
    full: string
    regular: string
    small: string
    thumb: string
  }
  alt: string
  photographer: string
  photographerUrl: string
  downloadUrl: string
  width: number
  height: number
  color: string
}

interface UnsplashSearchResponse {
  total: number
  total_pages: number
  results: UnsplashImage[]
}

interface UnsplashImageSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectImage: (imageUrl: string, photographer?: string) => void
}

const SUGGESTED_SEARCHES = [
  "nature",
  "technology",
  "business",
  "abstract",
  "space",
  "minimal",
  "gradient",
  "office",
  "team",
  "city",
  "ocean",
  "mountains",
]

type Orientation = "landscape" | "portrait" | "squarish"

export function UnsplashImageSearch({
  open,
  onOpenChange,
  onSelectImage,
}: UnsplashImageSearchProps) {
  const [query, setQuery] = useState("")
  const [images, setImages] = useState<UnsplashImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [orientation, setOrientation] = useState<Orientation>("landscape")
  const [hasSearched, setHasSearched] = useState(false)

  const searchImages = useCallback(async (searchQuery: string, pageNum: number, orient: Orientation) => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pageNum.toString(),
        per_page: "20",
        orientation: orient,
      })
      if (searchQuery) {
        params.set("query", searchQuery)
      }

      const response = await fetch(`/api/unsplash?${params}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch images")
      }

      const data: UnsplashSearchResponse = await response.json()

      if (pageNum === 1) {
        setImages(data.results)
      } else {
        setImages((prev) => [...prev, ...data.results])
      }
      setTotalPages(data.total_pages)
      setHasSearched(true)
    } catch (error) {
      console.error("Search error:", error)
      toast({
        title: "Search failed",
        description: "Could not fetch images from Unsplash. Please check your API key.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load popular images on open
  useEffect(() => {
    if (open && !hasSearched) {
      searchImages("", 1, orientation)
    }
  }, [open, hasSearched, orientation, searchImages])

  const handleSearch = () => {
    setPage(1)
    searchImages(query, 1, orientation)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const handleLoadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    searchImages(query, nextPage, orientation)
  }

  const handleOrientationChange = (newOrientation: Orientation) => {
    setOrientation(newOrientation)
    setPage(1)
    if (hasSearched) {
      searchImages(query, 1, newOrientation)
    }
  }

  const handleSelectImage = async (image: UnsplashImage) => {
    // Track download for Unsplash attribution
    try {
      await fetch("/api/unsplash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ downloadUrl: image.downloadUrl }),
      })
    } catch {
      // Continue even if tracking fails
    }

    onSelectImage(image.urls.regular, image.photographer)
    onOpenChange(false)

    toast({
      title: "Image added",
      description: `Photo by ${image.photographer} on Unsplash`,
    })
  }

  const handleSuggestedSearch = (term: string) => {
    setQuery(term)
    setPage(1)
    searchImages(term, 1, orientation)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-white/10 text-white overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-cyan-400" />
            Unsplash Image Search
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Search millions of free high-resolution photos
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Search bar */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for images..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:border-cyan-500/50"
              />
            </div>
            <Button
              onClick={handleSearch}
              disabled={isLoading}
              className="bg-cyan-600 hover:bg-cyan-500 text-white"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Search className="h-4 w-4" />
              )}
            </Button>
          </div>

          {/* Orientation filter */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">Orientation:</span>
            <div className="flex gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOrientationChange("landscape")}
                className={`h-8 px-3 ${
                  orientation === "landscape"
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Landscape className="h-4 w-4 mr-1" />
                Landscape
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOrientationChange("portrait")}
                className={`h-8 px-3 ${
                  orientation === "portrait"
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <RectangleVertical className="h-4 w-4 mr-1" />
                Portrait
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleOrientationChange("squarish")}
                className={`h-8 px-3 ${
                  orientation === "squarish"
                    ? "bg-cyan-500/20 text-cyan-300"
                    : "text-gray-400 hover:text-white hover:bg-white/10"
                }`}
              >
                <Square className="h-4 w-4 mr-1" />
                Square
              </Button>
            </div>
          </div>

          {/* Suggested searches */}
          {!hasSearched && (
            <div className="flex flex-wrap gap-2">
              <span className="text-sm text-gray-400 flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                Suggestions:
              </span>
              {SUGGESTED_SEARCHES.map((term) => (
                <Button
                  key={term}
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSuggestedSearch(term)}
                  className="h-7 px-3 text-xs bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-full"
                >
                  {term}
                </Button>
              ))}
            </div>
          )}

          {/* Image grid */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            {isLoading && images.length === 0 ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              </div>
            ) : images.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                <ImageIcon className="h-12 w-12 mb-4 opacity-50" />
                <p>Search for images to get started</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 pb-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="group relative aspect-video rounded-lg overflow-hidden cursor-pointer border border-white/10 hover:border-cyan-500/50 transition-all duration-200"
                    style={{ backgroundColor: image.color }}
                    onClick={() => handleSelectImage(image)}
                  >
                    <img
                      src={image.urls.small}
                      alt={image.alt}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-white text-sm font-medium truncate">
                          {image.alt}
                        </p>
                        <a
                          href={image.photographerUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-gray-300 text-xs hover:text-cyan-400 flex items-center gap-1 mt-1"
                        >
                          by {image.photographer}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1">
                        <Button
                          size="sm"
                          className="h-8 w-8 p-0 bg-cyan-600/90 hover:bg-cyan-500"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectImage(image)
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Load more button */}
            {images.length > 0 && page < totalPages && (
              <div className="flex justify-center pb-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={isLoading}
                  className="bg-white/5 border-white/10 text-white hover:bg-white/10"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    "Load more images"
                  )}
                </Button>
              </div>
            )}
          </ScrollArea>

          {/* Unsplash attribution */}
          <div className="text-center text-xs text-gray-500 pt-2 border-t border-white/10">
            Photos provided by{" "}
            <a
              href="https://unsplash.com/?utm_source=positron&utm_medium=referral"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:text-cyan-300"
            >
              Unsplash
            </a>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
