"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ImageIcon, Download } from "lucide-react"

interface ImageLibraryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectImage: (imageSrc: string) => void
}

const SAMPLE_IMAGES = [
  {
    id: "futuristic-science-city",
    src: "/images/futuristic-science-city.jpg",
    title: "Futuristic Science City",
    description:
      "A high-resolution, detailed futuristic science city with massive radio telescopes integrated into the architecture",
    tags: ["science", "futuristic", "city", "space", "technology"],
  },
  {
    id: "space-station-city",
    src: "/images/space-station-city.jpg",
    title: "Space Station City",
    description:
      "A vast scientific station city floating in space, with multiple interconnected modules and habitation zones",
    tags: ["space", "station", "city", "science", "futuristic"],
  },
  {
    id: "science-city-sunset",
    src: "/images/science-city-sunset.jpg",
    title: "Science City Sunset",
    description: "A science city with radio telescopes in artistic pixel art style with warm sunset colors",
    tags: ["science", "city", "sunset", "artistic", "retro"],
  },
  {
    id: "futuristic-city-waterfalls",
    src: "/images/futuristic-city-waterfalls.jpg",
    title: "Futuristic City with Waterfalls",
    description: "A futuristic cityscape with waterfalls, tall spires, and floating structures",
    tags: ["futuristic", "city", "waterfalls", "nature", "architecture"],
  },
  {
    id: "cyberpunk-station-ufo",
    src: "/images/cyberpunk-station-ufo.jpg",
    title: "Cyberpunk Station with UFO",
    description:
      "A cyberpunk futuristic science station with radio telescopes, waterfalls, and a classic UFO hovering above",
    tags: ["cyberpunk", "ufo", "science", "station", "futuristic"],
  },
]

export function ImageLibrary({ open, onOpenChange, onSelectImage }: ImageLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTab, setSelectedTab] = useState("sample")

  const filteredImages = SAMPLE_IMAGES.filter(
    (image) =>
      image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  const handleImageSelect = (imageSrc: string) => {
    onSelectImage(imageSrc)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800/40 border-gray-700/30 text-gray-100 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/40 shadow-xl shadow-blue-500/10 rounded-2xl max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-blue-400" />
            Image Library
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Choose from our collection of high-quality images for your presentation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search images..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/30 border-gray-700/40 text-gray-100 focus-visible:ring-blue-500/70 backdrop-blur-xl"
            />
          </div>

          {/* Tabs */}
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 backdrop-blur-md">
              <TabsTrigger value="sample" className="text-gray-300 data-[state=active]:bg-gray-700">
                Sample Images
              </TabsTrigger>
              <TabsTrigger value="uploads" className="text-gray-300 data-[state=active]:bg-gray-700">
                Your Uploads
              </TabsTrigger>
            </TabsList>

            <TabsContent value="sample" className="mt-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
                {filteredImages.map((image) => (
                  <div
                    key={image.id}
                    className="group relative bg-gray-800/30 rounded-lg overflow-hidden border border-gray-700/40 hover:border-blue-500/50 transition-all duration-300 cursor-pointer"
                    onClick={() => handleImageSelect(image.src)}
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={image.src || "/placeholder.svg"}
                        alt={image.title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button size="sm" className="bg-blue-500/90 hover:bg-blue-600/90 text-white backdrop-blur-sm">
                          <Download className="h-4 w-4 mr-1" />
                          Select
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-sm text-gray-100 mb-1 line-clamp-1">{image.title}</h3>
                      <p className="text-xs text-gray-400 line-clamp-2">{image.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {image.tags.slice(0, 3).map((tag) => (
                          <span key={tag} className="px-2 py-1 bg-gray-700/50 text-gray-300 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {filteredImages.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No images found matching your search.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="uploads" className="mt-4">
              <div className="text-center py-8 text-gray-400">
                <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Your uploaded images will appear here.</p>
                <p className="text-sm mt-1">Use the Advanced Upload feature to add your own images.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
}
