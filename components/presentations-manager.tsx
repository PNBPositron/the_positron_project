"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/lib/supabase"
import { FolderOpen, Search, Calendar, Trash2, Edit3, Copy, FileText, Clock, Layers } from "lucide-react"
import type { Slide } from "@/types/editor"

interface Presentation {
  id: string
  title: string
  slides: Slide[]
  created_at: string
  updated_at: string
}

interface PresentationsManagerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onLoadPresentation: (presentation: Presentation) => void
}

export function PresentationsManager({ open, onOpenChange, onLoadPresentation }: PresentationsManagerProps) {
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const loadPresentations = async () => {
    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to view your presentations.",
          variant: "destructive",
        })
        return
      }

      const { data, error } = await supabase
        .from("presentations")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })

      if (error) throw error

      setPresentations(data || [])
    } catch (error: any) {
      console.error("Load presentations error:", error)
      toast({
        title: "Failed to load presentations",
        description: error.message || "An error occurred while loading your presentations.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deletePresentation = async (id: string) => {
    try {
      const { error } = await supabase.from("presentations").delete().eq("id", id)

      if (error) throw error

      setPresentations((prev) => prev.filter((p) => p.id !== id))
      toast({
        title: "Presentation deleted",
        description: "The presentation has been deleted successfully.",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Delete presentation error:", error)
      toast({
        title: "Failed to delete presentation",
        description: error.message || "An error occurred while deleting the presentation.",
        variant: "destructive",
      })
    }
  }

  const duplicatePresentation = async (presentation: Presentation) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from("presentations").insert({
        title: `${presentation.title} (Copy)`,
        slides: presentation.slides,
        user_id: user.id,
      })

      if (error) throw error

      await loadPresentations()
      toast({
        title: "Presentation duplicated",
        description: "The presentation has been duplicated successfully.",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Duplicate presentation error:", error)
      toast({
        title: "Failed to duplicate presentation",
        description: error.message || "An error occurred while duplicating the presentation.",
        variant: "destructive",
      })
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`
    } else if (diffInHours < 24 * 7) {
      return `${Math.floor(diffInHours / 24)}d ago`
    } else {
      return date.toLocaleDateString()
    }
  }

  const filteredPresentations = presentations.filter((presentation) =>
    presentation.title.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  useEffect(() => {
    if (open) {
      loadPresentations()
    }
  }, [open])

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="bg-gray-800/40 border-gray-700/30 text-gray-100 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/40 shadow-xl shadow-blue-500/10 rounded-2xl max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FolderOpen className="h-5 w-5 text-blue-400" />
              My Presentations
            </DialogTitle>
            <DialogDescription className="text-gray-400">Manage and load your saved presentations</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search presentations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-gray-800/30 border-gray-700/40 text-gray-100 focus-visible:ring-blue-500/70 backdrop-blur-xl"
              />
            </div>

            {/* Presentations List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                </div>
              ) : filteredPresentations.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-400">
                    {searchQuery ? "No presentations found matching your search." : "No presentations found."}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Create your first presentation and save it to see it here.
                  </p>
                </div>
              ) : (
                filteredPresentations.map((presentation) => (
                  <div
                    key={presentation.id}
                    className="flex items-center justify-between p-4 bg-gray-800/30 rounded-lg border border-gray-700/40 hover:bg-gray-700/30 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-medium text-gray-100 truncate">{presentation.title}</h3>
                        <Badge variant="secondary" className="bg-gray-700/50 text-gray-300 text-xs">
                          <Layers className="h-3 w-3 mr-1" />
                          {presentation.slides.length} slides
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Created {formatDate(presentation.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Updated {formatDate(presentation.updated_at)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onLoadPresentation(presentation)
                          onOpenChange(false)
                        }}
                        className="text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                      >
                        <Edit3 className="h-4 w-4 mr-1" />
                        Open
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => duplicatePresentation(presentation)}
                        className="text-gray-400 hover:text-gray-300 hover:bg-gray-600/30"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setDeleteConfirm(presentation.id)}
                        className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent className="bg-gray-800/40 border-gray-700/30 text-gray-100 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/40 shadow-xl shadow-blue-500/10 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Presentation</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to delete this presentation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteConfirm) {
                  deletePresentation(deleteConfirm)
                  setDeleteConfirm(null)
                }
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
