"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { Save, Cloud, Loader2 } from "lucide-react"
import type { Slide } from "@/types/editor"

interface SavePresentationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  slides: Slide[]
  presentationId?: string | null
  onSaveSuccess?: (id: string, title: string) => void
}

export function SavePresentationDialog({
  open,
  onOpenChange,
  title,
  slides,
  presentationId,
  onSaveSuccess,
}: SavePresentationDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [presentationTitle, setPresentationTitle] = useState(title)

  // Update the title when prop changes
  useEffect(() => {
    setPresentationTitle(title)
  }, [title])

  const handleSave = async () => {
    if (!presentationTitle.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your presentation.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Check authentication
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to save your presentation.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      const presentationData = {
        title: presentationTitle.trim(),
        slides: slides,
        user_id: user.id,
      }

      let result

      if (presentationId) {
        // Update existing presentation
        console.log("Updating presentation:", presentationId)
        result = await supabase
          .from("presentations")
          .update({
            title: presentationData.title,
            slides: presentationData.slides,
          })
          .eq("id", presentationId)
          .eq("user_id", user.id)
          .select()
          .single()

        if (result.error) {
          console.error("Update error:", result.error)
          throw result.error
        }

        console.log("Update successful:", result.data)
      } else {
        // Create new presentation
        console.log("Creating new presentation")
        result = await supabase.from("presentations").insert(presentationData).select().single()

        if (result.error) {
          console.error("Insert error:", result.error)
          throw result.error
        }

        console.log("Insert successful:", result.data)
      }

      toast({
        title: presentationId ? "Presentation updated" : "Presentation saved",
        description: `"${presentationTitle}" has been ${presentationId ? "updated" : "saved"} to your account.`,
        variant: "default",
      })

      onSaveSuccess?.(result.data.id, presentationTitle)
      onOpenChange(false)
    } catch (error: any) {
      console.error("Save error:", error)
      toast({
        title: "Save failed",
        description: error.message || "An error occurred while saving your presentation.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800/40 border-gray-700/30 text-gray-100 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/40 shadow-xl shadow-blue-500/10 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-400" />
            {presentationId ? "Update Presentation" : "Save Presentation"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {presentationId
              ? "Update your presentation in the cloud"
              : "Save your presentation to your account and access it anywhere"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="presentation-title" className="text-sm text-gray-300">
              Presentation Title
            </Label>
            <Input
              id="presentation-title"
              value={presentationTitle}
              onChange={(e) => setPresentationTitle(e.target.value)}
              placeholder="Enter presentation title"
              className="bg-gray-800/30 border-gray-700/40 text-gray-100 focus-visible:ring-blue-500/70 backdrop-blur-xl"
              disabled={isLoading}
            />
          </div>

          <div className="p-3 bg-gray-800/30 rounded-lg border border-gray-700/40">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Slides:</span>
              <span className="text-gray-200 font-medium">{slides.length}</span>
            </div>
            <div className="flex items-center justify-between text-sm mt-2">
              <span className="text-gray-400">Elements:</span>
              <span className="text-gray-200 font-medium">
                {slides.reduce((total, slide) => total + slide.elements.length, 0)}
              </span>
            </div>
          </div>

          {presentationId && (
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              This will update your existing presentation
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600"
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-gradient-to-r from-blue-500 to-yellow-400 text-white hover:from-blue-600 hover:to-yellow-500"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {presentationId ? "Update" : "Save"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
