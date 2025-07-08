"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { ImageIcon, Search, Star, Upload, Heart } from "lucide-react"

interface ImageLibraryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectImage: (imageSrc: string) => void
}

// Sample futuristic science-themed images
const SAMPLE_IMAGES = [
  {
    id: "1",
    src: "/images/futuristic-science-city.jpg",
    title: "Futuristic Science City",
    tags: ["futuristic", "city", "science", "technology"],
    category: "cities",
  },
  {
    id: "2",
    src: "/images/space-station-city.jpg",
    title: "Space Station City",
    tags: ["space", "station", "city", "sci-fi"],
    category: "space",
  },
  {
    id: "3",
    src: "/images/science-city-sunset.jpg",
    title: "Science City at Sunset",
    tags: ["science", "city", "sunset", "futuristic"],
    category: "cities",
  },
  {
    id: "4",
    src: "/images/futuristic-city-waterfalls.jpg",
    title: "Futuristic City with Waterfalls",
    tags: ["futuristic", "city", "waterfalls", "nature"],
    category: "cities",
  },
  {
    id: "5",
    src: "/images/cyberpunk-station-ufo.jpg",
    title: "Cyberpunk Station with UFO",
    tags: ["cyberpunk", "station", "ufo", "sci-fi"],
    category: "space",
  },
]

const CATEGORIES = [
  { id: "all", name: "All", icon: ImageIcon },
  { id: "cities", name: "Cities", icon: ImageIcon },
  { id: "space", name: "Space", icon: Star },
]

export function ImageLibrary({ open, onOpenChange, onSelectImage }: ImageLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [favorites, setFavorites] = useState<string[]>([])
  const [userImages, setUserImages] = useState<Array<{ id: string; src: string; title: string }>>([])

  const toggleFavorite = (imageId: string) => {
    setFavorites((prev) => (prev.includes(imageId) ? prev.filter((id) => id !== imageId) : [...prev, imageId]))
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return

    const file = e.target.files[0]
    const reader = new FileReader()

    reader.onload = (event) => {
      if (!event.target?.result) return

      const newImage = {
        id: `user-${Date.now()}`,
        src: event.target.result as string,
        title: file.name.split(".")[0],
      }

      setUserImages((prev) => [...prev, newImage])
    }

    reader.readAsDataURL(file)
    e.target.value = ""
  }

  const filteredImages = SAMPLE_IMAGES.filter((image) => {
    const matchesSearch =
      image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "all" || image.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const favoriteImages = SAMPLE_IMAGES.filter((image) => favorites.includes(image.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800/40 border-gray-700/30 text-gray-100 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/40 shadow-xl shadow-blue-500/10 rounded-2xl max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-blue-400" />
            Image Library
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Browse and select images for your presentation
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 backdrop-blur-md">
            <TabsTrigger value="browse" className="text-gray-300 data-[state=active]:bg-gray-700">
              Browse
            </TabsTrigger>
            <TabsTrigger value="favorites" className="text-gray-300 data-[state=active]:bg-gray-700">
              Favorites ({favorites.length})
            </TabsTrigger>
            <TabsTrigger value="uploads" className="text-gray-300 data-[state=active]:bg-gray-700">
              My Uploads ({userImages.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="browse" className="space-y-4 mt-4">
            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-gray-800/30 border-gray-700/40 text-gray-100 focus-visible:ring-blue-500/70 backdrop-blur-xl"
                />
              </div>
              <div className="flex gap-2">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={
                      selectedCategory === category.id
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-600/30"
                    }
                  >
                    <category.icon className="h-4 w-4 mr-1" />
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Images Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="relative group cursor-pointer bg-gray-800/30 rounded-lg overflow-hidden border border-gray-700/40 hover:border-blue-500/50 transition-all duration-300"
                  onClick={() => {
                    onSelectImage(image.src)
                    onOpenChange(false)
                  }}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={image.src || "/placeholder.svg"}
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-100 truncate mb-1">{image.title}</h3>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {image.tags.slice(0, 2).map((tag) => (
                        <Badge key={tag} variant="secondary" className="bg-gray-700/50 text-gray-300 text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity ${
                      favorites.includes(image.id) ? "text-red-400" : "text-gray-400"
                    } hover:text-red-400`}
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(image.id)
                    }}
                  >
                    <Heart className={`h-4 w-4 ${favorites.includes(image.id) ? "fill-current" : ""}`} />
                  </Button>
                </div>
              ))}
            </div>

            {filteredImages.length === 0 && (
              <div className="text-center py-8">
                <ImageIcon className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No images found matching your criteria.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {favoriteImages.map((image) => (
                <div
                  key={image.id}
                  className="relative group cursor-pointer bg-gray-800/30 rounded-lg overflow-hidden border border-gray-700/40 hover:border-blue-500/50 transition-all duration-300"
                  onClick={() => {
                    onSelectImage(image.src)
                    onOpenChange(false)
                  }}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={image.src || "/placeholder.svg"}
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-100 truncate">{image.title}</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute top-2 right-2 text-red-400 hover:text-red-300"
                    onClick={(e) => {
                      e.stopPropagation()
                      toggleFavorite(image.id)
                    }}
                  >
                    <Heart className="h-4 w-4 fill-current" />
                  </Button>
                </div>
              ))}
            </div>

            {favoriteImages.length === 0 && (
              <div className="text-center py-8">
                <Heart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No favorite images yet.</p>
                <p className="text-sm text-gray-500 mt-2">
                  Click the heart icon on images to add them to your favorites.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="uploads" className="space-y-4 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-medium text-gray-300">Your Uploaded Images</h3>
              <label>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-gray-700/30 border-gray-600 text-gray-300 hover:bg-gray-600/30"
                  asChild
                >
                  <span>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Image
                  </span>
                </Button>
                <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto">
              {userImages.map((image) => (
                <div
                  key={image.id}
                  className="relative group cursor-pointer bg-gray-800/30 rounded-lg overflow-hidden border border-gray-700/40 hover:border-blue-500/50 transition-all duration-300"
                  onClick={() => {
                    onSelectImage(image.src)
                    onOpenChange(false)
                  }}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={image.src || "/placeholder.svg"}
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-100 truncate">{image.title}</h3>
                  </div>
                </div>
              ))}
            </div>

            {userImages.length === 0 && (
              <div className="text-center py-8">
                <Upload className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No uploaded images yet.</p>
                <p className="text-sm text-gray-500 mt-2">Upload your own images to use in presentations.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
