"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ImageUploader } from "./image-uploader"
import { Search, Upload, ImageIcon } from "lucide-react"

interface ImageLibraryProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectImage: (src: string) => void
}

// Sample images for the library - futuristic science-themed images
const sampleImages = [
  {
    src: "/images/futuristic-science-city.jpg",
    name: "Futuristic Science City",
    description:
      "A high-resolution futuristic science city with radio telescopes, glowing blue waterfalls, and cosmic sky",
  },
  {
    src: "/images/space-station-city.jpg",
    name: "Space Station City",
    description:
      "A vast scientific station city floating in space with interconnected modules and radio telescope arrays",
  },
  {
    src: "/images/science-city-sunset.jpg",
    name: "Science City Sunset",
    description: "A science city with radio telescopes in artistic style with warm sunset colors and cosmic atmosphere",
  },
  {
    src: "/images/futuristic-city-waterfalls.jpg",
    name: "Futuristic City with Waterfalls",
    description: "Advanced cityscape with tall spires, waterfalls, and floating structures in a dramatic landscape",
  },
  {
    src: "/images/cyberpunk-station-ufo.jpg",
    name: "Cyberpunk Station with UFO",
    description: "Futuristic science station with radio telescopes, waterfall, and a classic UFO hovering above",
  },
]

export function ImageLibrary({ open, onOpenChange, onSelectImage }: ImageLibraryProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [userImages, setUserImages] = useState<Array<{ src: string; name?: string }>>([])

  const filteredSampleImages = sampleImages.filter(
    (img) =>
      img.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      img.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredUserImages = userImages.filter(
    (img) => img.name?.toLowerCase().includes(searchQuery.toLowerCase()) || !searchQuery,
  )

  const handleImageUpload = (images: Array<{ src: string; file: File }>) => {
    const newImages = images.map((img) => ({
      src: img.src,
      name: img.file.name,
    }))

    setUserImages([...userImages, ...newImages])

    // If only one image was uploaded, select it automatically
    if (images.length === 1) {
      onSelectImage(images[0].src)
      onOpenChange(false)
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[900px] max-h-[80vh] overflow-y-auto bg-gray-800/40 border-gray-700/30 text-gray-100 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/40 shadow-xl shadow-blue-500/10 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-yellow-300">
              Image Library
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
                  className="pl-8 bg-gray-800/30 border-gray-700/40 text-gray-100 focus-visible:ring-blue-500/70"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button
                onClick={() => setUploadDialogOpen(true)}
                className="bg-gradient-to-r from-blue-500 to-yellow-400 text-white hover:from-blue-600 hover:to-yellow-500"
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>

            <Tabs defaultValue="sample" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 backdrop-blur-md">
                <TabsTrigger value="sample" className="text-gray-300 data-[state=active]:bg-gray-700">
                  Sample Images
                </TabsTrigger>
                <TabsTrigger value="uploaded" className="text-gray-300 data-[state=active]:bg-gray-700">
                  Your Uploads
                </TabsTrigger>
              </TabsList>
              <TabsContent value="sample" className="mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredSampleImages.length > 0 ? (
                    filteredSampleImages.map((image, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square rounded-lg overflow-hidden border border-gray-700/40 cursor-pointer hover:border-blue-400/60 transition-all duration-300 hover:scale-105"
                        onClick={() => {
                          onSelectImage(image.src)
                          onOpenChange(false)
                        }}
                      >
                        <img
                          src={image.src || "/placeholder.svg"}
                          alt={image.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-xs font-medium truncate">{image.name}</p>
                          <p className="text-xs opacity-80 truncate">{image.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center py-8 text-muted-foreground">
                      No images found matching your search.
                    </div>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="uploaded" className="mt-4">
                {filteredUserImages.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredUserImages.map((image, index) => (
                      <div
                        key={index}
                        className="group relative aspect-square rounded-lg overflow-hidden border border-gray-700/40 cursor-pointer hover:border-blue-400/60 transition-all duration-300 hover:scale-105"
                        onClick={() => {
                          onSelectImage(image.src)
                          onOpenChange(false)
                        }}
                      >
                        <img
                          src={image.src || "/placeholder.svg"}
                          alt={image.name || `Uploaded ${index + 1}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <p className="text-xs font-medium truncate">{image.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                      <p className="text-lg font-medium text-gray-300">No images uploaded yet</p>
                      <p className="text-sm text-gray-400">Upload images to use in your presentation</p>
                    </div>
                    <Button
                      onClick={() => setUploadDialogOpen(true)}
                      className="bg-gradient-to-r from-blue-500 to-yellow-400 text-white hover:from-blue-600 hover:to-yellow-500"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Images
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>

      <ImageUploader open={uploadDialogOpen} onOpenChange={setUploadDialogOpen} onImagesUploaded={handleImageUpload} />
    </>
  )
}
