"use client"

import { useState } from "react"
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
import { Share2, Copy, Link, Eye, EyeOff, ExternalLink } from "lucide-react"
import { createShareableLink, revokeShareableLink, copyToClipboard } from "@/lib/share-utils"
import { Switch } from "@/components/ui/switch"

interface ShareDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  presentationId: string | null
  presentationTitle: string
  existingShareToken?: string | null
  isPublic?: boolean
}

export function ShareDialog({
  open,
  onOpenChange,
  presentationId,
  presentationTitle,
  existingShareToken,
  isPublic = false,
}: ShareDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [shareUrl, setShareUrl] = useState<string | null>(
    existingShareToken
      ? `${typeof window !== "undefined" ? window.location.origin : ""}/share/${existingShareToken}`
      : null,
  )
  const [isShared, setIsShared] = useState(isPublic)

  const handleCreateShareLink = async () => {
    if (!presentationId) {
      toast({
        title: "Error",
        description: "Please save your presentation first before sharing.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const url = await createShareableLink(presentationId)
      setShareUrl(url)
      setIsShared(true)

      toast({
        title: "Share link created!",
        description: "Your presentation is now publicly accessible via the share link.",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Share link creation error:", error)
      toast({
        title: "Failed to create share link",
        description: error.message || "An error occurred while creating the share link.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRevokeShareLink = async () => {
    if (!presentationId) return

    setIsLoading(true)

    try {
      await revokeShareableLink(presentationId)
      setShareUrl(null)
      setIsShared(false)

      toast({
        title: "Share link revoked",
        description: "Your presentation is no longer publicly accessible.",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Share link revocation error:", error)
      toast({
        title: "Failed to revoke share link",
        description: error.message || "An error occurred while revoking the share link.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopyLink = async () => {
    if (!shareUrl) return

    try {
      await copyToClipboard(shareUrl)
      toast({
        title: "Link copied!",
        description: "The share link has been copied to your clipboard.",
        variant: "default",
      })
    } catch (error) {
      console.error("Copy to clipboard error:", error)
      toast({
        title: "Failed to copy link",
        description: "Please copy the link manually.",
        variant: "destructive",
      })
    }
  }

  const handleOpenLink = () => {
    if (shareUrl) {
      window.open(shareUrl, "_blank", "noopener,noreferrer")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-800/40 border-gray-700/30 text-gray-100 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/40 shadow-xl shadow-blue-500/10 rounded-2xl max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-blue-400" />
            Share Presentation
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Create a public link to share "{presentationTitle}" with others
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Public sharing toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl border border-gray-700/40">
            <div className="flex items-center gap-3">
              {isShared ? <Eye className="h-5 w-5 text-green-400" /> : <EyeOff className="h-5 w-5 text-gray-400" />}
              <div>
                <Label className="text-sm font-medium text-gray-300">Public Access</Label>
                <p className="text-xs text-gray-500 mt-1">
                  {isShared
                    ? "Anyone with the link can view this presentation"
                    : "Only you can access this presentation"}
                </p>
              </div>
            </div>
            <Switch
              checked={isShared}
              onCheckedChange={isShared ? handleRevokeShareLink : handleCreateShareLink}
              disabled={isLoading}
              className="data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-green-500 data-[state=checked]:to-blue-500"
            />
          </div>

          {/* Share URL display */}
          {shareUrl && (
            <div className="space-y-3">
              <Label className="text-sm font-medium text-gray-300">Share Link</Label>
              <div className="flex gap-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="bg-gray-800/30 border-gray-700/40 text-gray-100 focus-visible:ring-blue-500/70 backdrop-blur-xl font-mono text-sm"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleCopyLink}
                  className="border-gray-700/40 bg-gray-800/30 hover:bg-gray-700/40 text-gray-100 shrink-0"
                  title="Copy link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleOpenLink}
                  className="border-gray-700/40 bg-gray-800/30 hover:bg-gray-700/40 text-gray-100 shrink-0"
                  title="Open in new tab"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <Link className="h-4 w-4 text-blue-400 mt-0.5 shrink-0" />
                  <div className="text-sm">
                    <p className="text-blue-300 font-medium">Share Link Active</p>
                    <p className="text-blue-200/80 text-xs mt-1">
                      This presentation is now publicly viewable. Anyone with this link can access it without signing
                      in.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions when not shared */}
          {!shareUrl && (
            <div className="p-4 bg-gray-800/20 border border-gray-700/30 rounded-xl">
              <div className="flex items-start gap-3">
                <Share2 className="h-5 w-5 text-gray-400 mt-0.5 shrink-0" />
                <div className="text-sm text-gray-400">
                  <p className="font-medium text-gray-300 mb-1">Ready to Share?</p>
                  <p>
                    Enable public access to generate a shareable link. Others will be able to view your presentation in
                    read-only mode.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="bg-gray-700 hover:bg-gray-600 text-gray-100 border-gray-600"
          >
            Close
          </Button>
          {shareUrl && (
            <Button
              onClick={handleCopyLink}
              className="bg-gradient-to-r from-blue-500 to-green-400 text-white hover:from-blue-600 hover:to-green-500"
            >
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
