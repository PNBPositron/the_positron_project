"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Atom, Plus, Trash2, Edit, Eye } from "lucide-react"
import { getUserPresentations, deletePresentation } from "@/utils/presentation-utils"
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

export default function PresentationsPage() {
  const [presentations, setPresentations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteId, setDeleteId] = useState<string | null>(null)
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
        setPresentations(data || [])
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

      <main className="container mx-auto p-6 max-w-6xl">
        <h1 className="text-3xl font-bold mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-yellow-300">
          My Presentations
        </h1>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : presentations.length === 0 ? (
          <div className="text-center py-16 bg-gray-900/20 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-900/20 rounded-2xl border border-gray-800/30">
            <h2 className="text-xl font-medium text-gray-300 mb-4">No presentations yet</h2>
            <p className="text-gray-400 mb-6">Create your first presentation to get started</p>
            <Link href="/">
              <Button className="bg-gradient-to-r from-blue-500 to-yellow-400 text-white hover:from-blue-600 hover:to-yellow-500">
                <Plus className="h-4 w-4 mr-2" />
                Create Presentation
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {presentations.map((presentation) => (
              <Card
                key={presentation.id}
                className="bg-gray-900/20 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-900/20 border-gray-800/30 overflow-hidden"
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-medium text-gray-200 truncate">{presentation.title}</CardTitle>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="h-32 bg-gray-800/50 rounded-md flex items-center justify-center">
                    {presentation.thumbnail_url ? (
                      <img
                        src={presentation.thumbnail_url || "/placeholder.svg"}
                        alt={presentation.title}
                        className="h-full w-full object-cover rounded-md"
                      />
                    ) : (
                      <div className="text-gray-500 text-sm">No preview available</div>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Last updated: {new Date(presentation.updated_at).toLocaleDateString()}
                  </p>
                </CardContent>
                <CardFooter className="flex justify-between pt-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-gray-300 hover:bg-gray-800/40 hover:text-gray-100"
                    onClick={() => setDeleteId(presentation.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1 text-red-400" />
                    Delete
                  </Button>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gray-300 hover:bg-gray-800/40 hover:text-gray-100"
                      asChild
                    >
                      <Link href={`/view/${presentation.id}`}>
                        <Eye className="h-4 w-4 mr-1 text-blue-400" />
                        View
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-700/30 bg-gray-800/20 hover:bg-gray-700/30 text-gray-100"
                      asChild
                    >
                      <Link href={`/edit/${presentation.id}`}>
                        <Edit className="h-4 w-4 mr-1 text-blue-400" />
                        Edit
                      </Link>
                    </Button>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>

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
    </div>
  )
}
