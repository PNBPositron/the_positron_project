"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { ImageUploader } from "./image-uploader"
import { Search, Upload, ImageIcon } from "lucide-react"

interface ImageLibraryProps {
  onSelectImage: (src: string) => void
}

// Sample images for the library
const sampleImages = [
  "/images/arecibo-telescope.jpg",
  "/images/digital-abstract.png",
  "/images/observatory-sunset.jpg",
  "/images/observatory-teal.png",
  "/images/space-observatory.jpg",
]

export function ImageLibrary({ onSelectImage }: ImageLibraryProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false)
  const [userImages, setUserImages] = useState<Array<{ src: string; name?: string }>>([])

  const filteredSampleImages = sampleImages.filter((img) => img.toLowerCase().includes(searchQuery.toLowerCase()))

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
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Image Library</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search images..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload
              </Button>
            </div>

            <Tabs defaultValue="sample" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="sample">Sample Images</TabsTrigger>
                <TabsTrigger value="uploaded">Your Uploads</TabsTrigger>
              </TabsList>
              <TabsContent value="sample" className="mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {filteredSampleImages.length > 0 ? (
                    filteredSampleImages.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-md overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          onSelectImage(image)
                          setOpen(false)
                        }}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Sample ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
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
                        className="aspect-square rounded-md overflow-hidden border cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => {
                          onSelectImage(image.src)
                          setOpen(false)
                        }}
                      >
                        <img
                          src={image.src || "/placeholder.svg"}
                          alt={image.name || `Uploaded ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 space-y-4">
                    <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-lg font-medium">No images uploaded yet</p>
                      <p className="text-sm text-muted-foreground">Upload images to use in your presentation</p>
                    </div>
                    <Button onClick={() => setUploadDialogOpen(true)}>
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

      <Button variant="outline" onClick={() => setOpen(true)}>
        <ImageIcon className="h-4 w-4 mr-2" />
        Image Library
      </Button>
    </>
  )
}
