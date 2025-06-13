"use client"

import { useEffect, useState, useMemo } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Atom,
  Plus,
  Trash2,
  Edit,
  Eye,
  Search,
  SlidersHorizontal,
  Clock,
  Calendar,
  Grid2X2,
  List,
  Star,
  StarOff,
  Copy,
  Download,
  Share2,
  MoreHorizontal,
  X,
} from "lucide-react"
import { getUserPresentations, deletePresentation, updatePresentation } from "@/utils/presentation-utils"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"

const supabase = createClientComponentClient()

type Presentation = {
  id: string
  title: string
  slides: any[]
  created_at: string
  updated_at: string
  user_id: string
  is_public: boolean
  thumbnail_url?: string
  is_favorite?: boolean
  tags?: string[]
  folder?: string
}

type SortOption = "updated_desc" | "updated_asc" | "created_desc" | "created_asc" | "title_asc" | "title_desc"
type ViewMode = "grid" | "list"

export default function PresentationsPage() {
  const [presentations, setPresentations] = useState<Presentation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [batchDeleteIds, setBatchDeleteIds] = useState<string[]>([])
  const [isBatchMode, setIsBatchMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOption, setSortOption] = useState<SortOption>("updated_desc")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [renameDialogOpen, setRenameDialogOpen] = useState(false)
  const [renameId, setRenameId] = useState<string | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false)

  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchPresentations = async () => {
      if (!user) {
        router.push("/login")
        return
      }

      try {
        const { data, error } = await getUserPresentations()
        if (error) {
          throw error
        }

        // Add some default properties for the enhanced features
        const enhancedData = (data || []).map((p) => ({
          ...p,
          is_favorite: p.is_favorite || false,
          tags: p.tags || [],
          folder: p.folder || "Main",
        }))

        setPresentations(enhancedData)
      } catch (error) {
        console.error("Error fetching presentations:", error)
        toast({
          title: "Error",
          description: "Failed to load presentations",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchPresentations()
  }, [user, router])

  const handleDelete = async (id: string) => {
    try {
      const { error } = await deletePresentation(id)
      if (error) {
        throw error
      }
      setPresentations((prev) => prev.filter((p) => p.id !== id))
      toast({
        title: "Presentation deleted",
        description: "Your presentation has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting presentation:", error)
      toast({
        title: "Error",
        description: "Failed to delete presentation",
        variant: "destructive",
      })
    } finally {
      setDeleteId(null)
    }
  }

  const handleBatchDelete = async () => {
    try {
      // Delete each presentation in the batch
      for (const id of batchDeleteIds) {
        await deletePresentation(id)
      }

      setPresentations((prev) => prev.filter((p) => !batchDeleteIds.includes(p.id)))
      setBatchDeleteIds([])
      setIsBatchMode(false)

      toast({
        title: "Presentations deleted",
        description: `${batchDeleteIds.length} presentations have been deleted successfully`,
      })
    } catch (error) {
      console.error("Error deleting presentations:", error)
      toast({
        title: "Error",
        description: "Failed to delete some presentations",
        variant: "destructive",
      })
    }
  }

  const handleToggleFavorite = async (id: string) => {
    const presentation = presentations.find((p) => p.id === id)
    if (!presentation) return

    try {
      const updatedPresentation = {
        ...presentation,
        is_favorite: !presentation.is_favorite,
      }

      const { error } = await updatePresentation(id, presentation.title, presentation.slides, presentation.is_public, {
        is_favorite: !presentation.is_favorite,
      })

      if (error) throw error

      setPresentations((prev) => prev.map((p) => (p.id === id ? { ...p, is_favorite: !p.is_favorite } : p)))

      toast({
        title: updatedPresentation.is_favorite ? "Added to favorites" : "Removed from favorites",
        description: `"${presentation.title}" has been ${updatedPresentation.is_favorite ? "added to" : "removed from"} favorites`,
      })
    } catch (error) {
      console.error("Error updating favorite status:", error)
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      })
    }
  }

  const handleRename = async () => {
    if (!renameId || !newTitle.trim()) return

    const presentation = presentations.find((p) => p.id === renameId)
    if (!presentation) return

    try {
      const { error } = await updatePresentation(renameId, newTitle, presentation.slides, presentation.is_public)

      if (error) throw error

      setPresentations((prev) => prev.map((p) => (p.id === renameId ? { ...p, title: newTitle } : p)))

      toast({
        title: "Presentation renamed",
        description: `Presentation has been renamed to "${newTitle}"`,
      })

      setRenameDialogOpen(false)
      setRenameId(null)
      setNewTitle("")
    } catch (error) {
      console.error("Error renaming presentation:", error)
      toast({
        title: "Error",
        description: "Failed to rename presentation",
        variant: "destructive",
      })
    }
  }

  const openRenameDialog = (presentation: Presentation) => {
    setRenameId(presentation.id)
    setNewTitle(presentation.title)
    setRenameDialogOpen(true)
  }

  const handleDuplicate = async (presentation: Presentation) => {
    try {
      const { data, error } = await savePresentation(
        `${presentation.title} (Copy)`,
        presentation.slides,
        presentation.is_public,
      )

      if (error) throw error

      if (data) {
        setPresentations((prev) => [
          {
            ...data,
            is_favorite: false,
            tags: presentation.tags || [],
            folder: presentation.folder || "Main",
          },
          ...prev,
        ])
      }

      toast({
        title: "Presentation duplicated",
        description: `"${presentation.title}" has been duplicated`,
      })
    } catch (error) {
      console.error("Error duplicating presentation:", error)
      toast({
        title: "Error",
        description: "Failed to duplicate presentation",
        variant: "destructive",
      })
    }
  }

  const toggleBatchSelection = (id: string) => {
    if (batchDeleteIds.includes(id)) {
      setBatchDeleteIds((prev) => prev.filter((itemId) => itemId !== id))
    } else {
      setBatchDeleteIds((prev) => [...prev, id])
    }
  }

  const toggleAllSelection = () => {
    if (batchDeleteIds.length === filteredPresentations.length) {
      setBatchDeleteIds([])
    } else {
      setBatchDeleteIds(filteredPresentations.map((p) => p.id))
    }
  }

  // Extract all unique folders
  const folders = useMemo(() => {
    const folderSet = new Set<string>()
    presentations.forEach((p) => {
      if (p.folder) folderSet.add(p.folder)
    })
    return Array.from(folderSet)
  }, [presentations])

  // Extract all unique tags
  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    presentations.forEach((p) => {
      if (p.tags) p.tags.forEach((tag) => tagSet.add(tag))
    })
    return Array.from(tagSet)
  }, [presentations])

  // Filter and sort presentations
  const filteredPresentations = useMemo(() => {
    let result = [...presentations]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(query) || (p.tags && p.tags.some((tag) => tag.toLowerCase().includes(query))),
      )
    }

    // Filter by folder
    if (selectedFolder) {
      result = result.filter((p) => p.folder === selectedFolder)
    }

    // Filter by selected tags
    if (selectedTags.length > 0) {
      result = result.filter((p) => p.tags && selectedTags.every((tag) => p.tags.includes(tag)))
    }

    // Sort
    result.sort((a, b) => {
      switch (sortOption) {
        case "updated_desc":
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        case "updated_asc":
          return new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
        case "created_desc":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "created_asc":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "title_asc":
          return a.title.localeCompare(b.title)
        case "title_desc":
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })

    return result
  }, [presentations, searchQuery, sortOption, selectedFolder, selectedTags])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const savePresentation = async (title: string, slides: any[], isPublic: boolean, additionalData?: any) => {
    try {
      // Get the current user session
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session || !session.user) {
        throw new Error("User not authenticated")
      }

      const { data, error } = await supabase
        .from("presentations")
        .insert({
          title,
          slides,
          is_public: isPublic,
          user_id: session.user.id,
          ...additionalData,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      return { data, error: null }
    } catch (error) {
      console.error("Error saving presentation:", error)
      return { data: null, error }
    }
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <header className="border-b border-gray-800/30 p-4 flex items-center justify-between bg-gray-900/20 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-900/20 shadow-lg shadow-blue-500/5">
        <div className="flex items-center gap-2">
          <Link href="/">
            <div className="flex items-center gap-2">
              <div className="bg-gradient-to-r from-blue-500 to-yellow-400 p-1.5 rounded-md">
                <Atom className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-semibold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-yellow-300 ml-1">
                Positron
              </span>
            </div>
          </Link>
        </div>
        <Link href="/">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700/30 bg-gray-800/20 hover:bg-gray-700/30 text-gray-100"
          >
            <Plus className="h-4 w-4 mr-2 text-blue-400" />
            New Presentation
          </Button>
        </Link>
      </header>

      <main className="container mx-auto p-6 max-w-7xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-yellow-300">
              My Presentations
            </h1>
            <p className="text-gray-400 mt-1">
              {presentations.length} {presentations.length === 1 ? "presentation" : "presentations"} available
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search presentations..."
                className="pl-9 bg-gray-800/30 border-gray-700/30 text-gray-100 w-full sm:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="h-4 w-4 text-gray-400 hover:text-gray-200" />
                </button>
              )}
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="icon"
                className="border-gray-700/30 bg-gray-800/20 hover:bg-gray-700/30 text-gray-100"
                onClick={() => setIsFilterDialogOpen(true)}
              >
                <SlidersHorizontal className="h-4 w-4 text-gray-300" />
              </Button>

              <Select value={sortOption} onValueChange={(value) => setSortOption(value as SortOption)}>
                <SelectTrigger className="w-[180px] bg-gray-800/30 border-gray-700/30 text-gray-100">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                  <SelectItem value="updated_desc">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Newest first</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="updated_asc">
                    <div className="flex items-center">
                      <Clock className="h-4 w-4 mr-2" />
                      <span>Oldest first</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="created_desc">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>Recently created</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="created_asc">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>First created</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="title_asc">
                    <div className="flex items-center">
                      <span>A-Z</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="title_desc">
                    <div className="flex items-center">
                      <span>Z-A</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>

              <div className="flex border border-gray-700/30 rounded-md overflow-hidden">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className={
                    viewMode === "grid"
                      ? "rounded-none bg-gray-700 hover:bg-gray-600 text-gray-100"
                      : "rounded-none bg-gray-800/20 hover:bg-gray-700/30 text-gray-400 hover:text-gray-100"
                  }
                  onClick={() => setViewMode("grid")}
                >
                  <Grid2X2 className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className={
                    viewMode === "list"
                      ? "rounded-none bg-gray-700 hover:bg-gray-600 text-gray-100"
                      : "rounded-none bg-gray-800/20 hover:bg-gray-700/30 text-gray-400 hover:text-gray-100"
                  }
                  onClick={() => setViewMode("list")}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Folder tabs */}
        {folders.length > 0 && (
          <div className="mb-6">
            <Tabs
              defaultValue={selectedFolder || "all"}
              onValueChange={(value) => setSelectedFolder(value === "all" ? null : value)}
            >
              <TabsList className="bg-gray-800/30 border border-gray-700/30">
                <TabsTrigger value="all" className="data-[state=active]:bg-gray-700">
                  All
                </TabsTrigger>
                {folders.map((folder) => (
                  <TabsTrigger key={folder} value={folder} className="data-[state=active]:bg-gray-700">
                    {folder}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        )}

        {/* Batch actions */}
        {isBatchMode && (
          <div className="flex items-center justify-between mb-4 p-3 bg-gray-800/40 border border-gray-700/30 rounded-md">
            <div className="flex items-center gap-3">
              <Checkbox
                id="select-all"
                checked={batchDeleteIds.length > 0 && batchDeleteIds.length === filteredPresentations.length}
                onCheckedChange={toggleAllSelection}
              />
              <label htmlFor="select-all" className="text-sm text-gray-300">
                {batchDeleteIds.length === 0 ? "Select all" : `${batchDeleteIds.length} selected`}
              </label>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-gray-700 bg-gray-800/80 hover:bg-gray-700 text-gray-100"
                onClick={() => {
                  setBatchDeleteIds([])
                  setIsBatchMode(false)
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                disabled={batchDeleteIds.length === 0}
                onClick={handleBatchDelete}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete Selected
              </Button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredPresentations.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/20 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-900/20 rounded-2xl border border-gray-800/30">
            <h2 className="text-xl font-medium text-gray-300 mb-4">No presentations found</h2>
            <p className="text-gray-400 mb-6">
              {searchQuery || selectedTags.length > 0 || selectedFolder
                ? "Try adjusting your search or filters"
                : "Create your first presentation to get started"}
            </p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-500 to-yellow-400 text-white hover:from-blue-600 hover:to-yellow-500">
                <Plus className="h-4 w-4 mr-2" />
                Create Presentation
              </Button>
            </Link>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredPresentations.map((presentation) => (
              <Card
                key={presentation.id}
                className="bg-gray-900/20 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-900/20 border-gray-800/30 overflow-hidden group relative"
              >
                {isBatchMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={batchDeleteIds.includes(presentation.id)}
                      onCheckedChange={() => toggleBatchSelection(presentation.id)}
                      className="h-5 w-5 border-2"
                    />
                  </div>
                )}

                <button
                  className="absolute top-2 right-2 z-10 p-1 rounded-full bg-gray-800/70 hover:bg-gray-700/90 transition-colors"
                  onClick={() => handleToggleFavorite(presentation.id)}
                >
                  {presentation.is_favorite ? (
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </button>

                <div className="h-40 bg-gray-800/50 relative group-hover:opacity-90 transition-opacity">
                  <Link href={`/edit/${presentation.id}`} className="block h-full">
                    {presentation.thumbnail_url ? (
                      <img
                        src={presentation.thumbnail_url || "/placeholder.svg"}
                        alt={presentation.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                        <span className="text-4xl font-bold text-gray-600">
                          {presentation.title.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                      <Button variant="secondary" size="sm" className="mr-2">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                      <Button variant="secondary" size="sm">
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </Link>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg font-medium text-gray-200 truncate pr-6">
                      {presentation.title}
                    </CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-800 border-gray-700 text-gray-100">
                        <DropdownMenuItem onClick={() => router.push(`/edit/${presentation.id}`)}>
                          <Edit className="h-4 w-4 mr-2 text-blue-400" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push(`/view/${presentation.id}`)}>
                          <Eye className="h-4 w-4 mr-2 text-blue-400" />
                          Present
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        <DropdownMenuItem onClick={() => openRenameDialog(presentation)}>
                          <Edit className="h-4 w-4 mr-2 text-blue-400" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDuplicate(presentation)}>
                          <Copy className="h-4 w-4 mr-2 text-blue-400" />
                          Duplicate
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2 text-blue-400" />
                          Export
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Share2 className="h-4 w-4 mr-2 text-blue-400" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-700" />
                        <DropdownMenuItem
                          className="text-red-400 focus:text-red-400"
                          onClick={() => setDeleteId(presentation.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="pb-2">
                  <div className="flex items-center text-xs text-gray-400 mb-2">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>Updated {formatDate(presentation.updated_at)}</span>
                  </div>

                  <div className="flex flex-wrap gap-1 mt-2">
                    {presentation.tags &&
                      presentation.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="text-xs bg-gray-800/50 text-gray-300 border-gray-700"
                        >
                          {tag}
                        </Badge>
                      ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <div className="flex justify-between items-center w-full">
                    <div className="text-xs text-gray-400">{presentation.slides?.length || 0} slides</div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-100 hover:bg-gray-800"
                        onClick={() => router.push(`/edit/${presentation.id}`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-100 hover:bg-gray-800"
                        onClick={() => router.push(`/view/${presentation.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-gray-900/20 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-900/20 border-gray-800/30 rounded-lg overflow-hidden">
            <div className="grid grid-cols-[auto_1fr_auto] gap-4 p-4 border-b border-gray-800/30 bg-gray-800/30">
              {isBatchMode && (
                <div className="flex items-center pr-2">
                  <Checkbox
                    checked={batchDeleteIds.length > 0 && batchDeleteIds.length === filteredPresentations.length}
                    onCheckedChange={toggleAllSelection}
                  />
                </div>
              )}
              <div className={isBatchMode ? "" : "col-span-2"}>
                <span className="font-medium text-gray-300">Presentation</span>
              </div>
              <div className="hidden md:block">
                <span className="font-medium text-gray-300">Last Updated</span>
              </div>
              <div className="hidden lg:block">
                <span className="font-medium text-gray-300">Slides</span>
              </div>
              <div>
                <span className="font-medium text-gray-300">Actions</span>
              </div>
            </div>

            {filteredPresentations.map((presentation) => (
              <div
                key={presentation.id}
                className="grid grid-cols-[auto_1fr_auto] gap-4 p-4 border-b border-gray-800/30 hover:bg-gray-800/20"
              >
                {isBatchMode && (
                  <div className="flex items-center pr-2">
                    <Checkbox
                      checked={batchDeleteIds.includes(presentation.id)}
                      onCheckedChange={() => toggleBatchSelection(presentation.id)}
                    />
                  </div>
                )}

                <div className={isBatchMode ? "" : "col-span-2"}>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-gray-800 rounded flex items-center justify-center flex-shrink-0">
                      {presentation.thumbnail_url ? (
                        <img
                          src={presentation.thumbnail_url || "/placeholder.svg"}
                          alt={presentation.title}
                          className="h-full w-full object-cover rounded"
                        />
                      ) : (
                        <span className="text-lg font-bold text-gray-600">
                          {presentation.title.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/edit/${presentation.id}`}
                          className="font-medium text-gray-200 hover:text-blue-400"
                        >
                          {presentation.title}
                        </Link>
                        {presentation.is_favorite && <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />}
                      </div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {presentation.tags &&
                          presentation.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="outline"
                              className="text-xs bg-gray-800/50 text-gray-300 border-gray-700"
                            >
                              {tag}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex md:items-center">
                  <span className="text-sm text-gray-400">{formatDate(presentation.updated_at)}</span>
                </div>

                <div className="hidden lg:flex lg:items-center">
                  <span className="text-sm text-gray-400">{presentation.slides?.length || 0} slides</span>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-100 hover:bg-gray-800"
                    onClick={() => handleToggleFavorite(presentation.id)}
                  >
                    {presentation.is_favorite ? (
                      <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    ) : (
                      <StarOff className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-100 hover:bg-gray-800"
                    onClick={() => router.push(`/edit/${presentation.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-gray-400 hover:text-gray-100 hover:bg-gray-800"
                    onClick={() => router.push(`/view/${presentation.id}`)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-100 hover:bg-gray-800"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-gray-800 border-gray-700 text-gray-100">
                      <DropdownMenuItem onClick={() => openRenameDialog(presentation)}>
                        <Edit className="h-4 w-4 mr-2 text-blue-400" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDuplicate(presentation)}>
                        <Copy className="h-4 w-4 mr-2 text-blue-400" />
                        Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Download className="h-4 w-4 mr-2 text-blue-400" />
                        Export
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Share2 className="h-4 w-4 mr-2 text-blue-400" />
                        Share
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="bg-gray-700" />
                      <DropdownMenuItem
                        className="text-red-400 focus:text-red-400"
                        onClick={() => setDeleteId(presentation.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Batch mode toggle */}
        <div className="mt-6 flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700/30 bg-gray-800/20 hover:bg-gray-700/30 text-gray-100"
            onClick={() => {
              setIsBatchMode(!isBatchMode)
              setBatchDeleteIds([])
            }}
          >
            {isBatchMode ? "Exit Batch Mode" : "Batch Edit"}
          </Button>

          <div className="text-xs text-gray-400">
            {filteredPresentations.length} of {presentations.length} presentations
          </div>
        </div>
      </main>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="bg-gray-800/40 border-gray-700/30 text-gray-100 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/40 shadow-xl shadow-blue-500/10 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete your presentation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch delete confirmation dialog */}
      <AlertDialog open={batchDeleteIds.length > 0 && isBatchMode} onOpenChange={() => setBatchDeleteIds([])}>
        <AlertDialogContent className="bg-gray-800/40 border-gray-700/30 text-gray-100 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/40 shadow-xl shadow-blue-500/10 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {batchDeleteIds.length} presentations?</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              This action cannot be undone. This will permanently delete the selected presentations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700 text-white" onClick={handleBatchDelete}>
              Delete All
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Rename dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <DialogContent className="bg-gray-800/40 border-gray-700/30 text-gray-100 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/40 shadow-xl shadow-blue-500/10 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Rename Presentation</DialogTitle>
            <DialogDescription className="text-gray-400">Enter a new name for your presentation.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Presentation title"
              className="bg-gray-800/30 border-gray-700/30 text-gray-100"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRenameDialogOpen(false)}
              className="bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600"
            >
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              className="bg-gradient-to-r from-blue-500 to-yellow-400 text-white hover:from-blue-600 hover:to-yellow-500"
              disabled={!newTitle.trim()}
            >
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Filter dialog */}
      <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
        <DialogContent className="bg-gray-800/40 border-gray-700/30 text-gray-100 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/40 shadow-xl shadow-blue-500/10 rounded-2xl">
          <DialogHeader>
            <DialogTitle>Filter Presentations</DialogTitle>
            <DialogDescription className="text-gray-400">
              Select filters to narrow down your presentations.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Tags</h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer ${
                      selectedTags.includes(tag)
                        ? "bg-blue-600 hover:bg-blue-700"
                        : "bg-gray-800/50 text-gray-300 border-gray-700 hover:bg-gray-700/50"
                    }`}
                    onClick={() => {
                      if (selectedTags.includes(tag)) {
                        setSelectedTags(selectedTags.filter((t) => t !== tag))
                      } else {
                        setSelectedTags([...selectedTags, tag])
                      }
                    }}
                  >
                    {tag}
                  </Badge>
                ))}
                {allTags.length === 0 && <span className="text-sm text-gray-400">No tags available</span>}
              </div>
            </div>

            <Separator className="bg-gray-700/50" />

            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-2">Other Filters</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-favorites" className="text-sm text-gray-300">
                    Show favorites only
                  </Label>
                  <Switch id="show-favorites" />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="show-shared" className="text-sm text-gray-300">
                    Show shared presentations
                  </Label>
                  <Switch id="show-shared" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedTags([])
                setIsFilterDialogOpen(false)
              }}
              className="bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600"
            >
              Reset Filters
            </Button>
            <Button
              onClick={() => setIsFilterDialogOpen(false)}
              className="bg-gradient-to-r from-blue-500 to-yellow-400 text-white hover:from-blue-600 hover:to-yellow-500"
            >
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
