"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Search, Download, X, ImageIcon } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface LibraryImage {
  id: string
  src: string
  title: string
  category: string
  tags: string[]
  description: string
}

const LIBRARY_IMAGES: LibraryImage[] = [
  {
    id: "observatory-sunset",
    src: "/images/observatory-sunset.jpg",
    title: "Observatory at Sunset",
    category: "Science",
    tags: ["observatory", "telescope", "sunset", "astronomy", "science"],
    description: "Astronomical observatory complex during golden hour with dramatic sky",
  },
  {
    id: "arecibo-telescope",
    src: "/images/arecibo-telescope.jpg",
    title: "Arecibo Radio Telescope",
    category: "Science",
    tags: ["radio telescope", "arecibo", "science", "research", "technology"],
    description: "Famous Arecibo radio telescope dish surrounded by tropical forest",
  },
  {
    id: "observatory-teal",
    src: "/images/observatory-teal.png",
    title: "Observatory (Teal)",
    category: "Science",
    tags: ["observatory", "telescope", "filtered", "astronomy", "blue"],
    description: "Observatory complex with artistic teal color treatment",
  },
  {
    id: "digital-abstract",
    src: "/images/digital-abstract.png",
    title: "Digital Code Abstract",
    category: "Technology",
    tags: ["code", "programming", "abstract", "digital", "colorful"],
    description: "Abstract visualization of code and digital elements with vibrant colors",
  },
  {
    id: "space-observatory",
    src: "/images/space-observatory.jpg",
    title: "Space Observatory Fantasy",
    category: "Space",
    tags: ["space", "planets", "observatory", "fantasy", "cosmic", "stars"],
    description: "Fantasy space scene with observatory dome and multiple planets",
  },
]

const CATEGORIES = ["All", "Science", "Technology", "Space"]

interface ImageLibraryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectImage: (imageSrc: string) => void
}

export function ImageLibrary({ open, onOpenChange, onSelectImage }: ImageLibraryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedImage, setSelectedImage] = useState<LibraryImage | null>(null)

  const filteredImages = LIBRARY_IMAGES.filter((image) => {
    const matchesSearch =
      image.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))

    const matchesCategory = selectedCategory === "All" || image.category === selectedCategory

    return matchesSearch && matchesCategory
  })

  const handleImageSelect = (image: LibraryImage) => {
    onSelectImage(image.src)
    onOpenChange(false)
  }

  const handleImageClick = (image: LibraryImage) => {
    setSelectedImage(image)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gray-800/90 border-gray-700/60 text-gray-100 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/90 max-w-4xl max-h-[80vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-blue-400" />
              Image Library
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-4 items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search images..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800/50 border-gray-700/60 text-gray-100"
                />
              </div>
              <div className="flex gap-2">
                {CATEGORIES.map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                    className={
                      selectedCategory === category
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "border-gray-700 bg-gray-800/50 hover:bg-gray-700 text-gray-300"
                    }
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Image Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-96 overflow-y-auto pr-2">
              {filteredImages.map((image) => (
                <div
                  key={image.id}
                  className="group relative bg-gray-900/50 rounded-lg overflow-hidden border border-gray-700/50 hover:border-blue-500/50 transition-all cursor-pointer"
                  onClick={() => handleImageClick(image)}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={image.src || "/placeholder.svg"}
                      alt={image.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleImageSelect(image)
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3"
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Use
                      </Button>
                    </div>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-200 mb-1 truncate">{image.title}</h3>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary" className="bg-gray-700/50 text-gray-300 text-xs">
                        {image.category}
                      </Badge>
                      <span className="text-xs text-gray-400">{image.tags.length} tags</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredImages.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No images found matching your search.</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="bg-gray-800/90 border-gray-700/60 text-gray-100 backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/90 max-w-3xl">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <DialogTitle>{selectedImage.title}</DialogTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedImage(null)}
                  className="text-gray-400 hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div className="relative">
                <img
                  src={selectedImage.src || "/placeholder.svg"}
                  alt={selectedImage.title}
                  className="w-full max-h-64 object-cover rounded-lg"
                />
              </div>

              <div className="space-y-3">
                <p className="text-gray-300 text-sm">{selectedImage.description}</p>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-gray-700/50 text-gray-300">
                    {selectedImage.category}
                  </Badge>
                  <div className="flex flex-wrap gap-1">
                    {selectedImage.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="border-gray-600 text-gray-400 text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleImageSelect(selectedImage)}
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Use This Image
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setSelectedImage(null)}
                    className="border-gray-700 bg-gray-800/50 hover:bg-gray-700 text-gray-300"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  )
}
