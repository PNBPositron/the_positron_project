import { supabase } from "@/lib/supabase"
import type { Slide } from "@/types/editor"

export interface SharedPresentation {
  id: string
  title: string
  slides: Slide[]
  share_token: string
  is_public: boolean
  created_at: string
  updated_at: string
  user_id: string
}

export async function createShareableLink(presentationId: string): Promise<string> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User must be authenticated to share presentations")
    }

    // Generate a unique share token
    const shareToken = crypto.randomUUID()

    // Update the presentation with the share token and make it public
    const { data, error } = await supabase
      .from("presentations")
      .update({
        share_token: shareToken,
        is_public: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", presentationId)
      .eq("user_id", user.id)
      .select()
      .single()

    if (error) throw error

    // Return the shareable URL
    const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
    return `${baseUrl}/share/${shareToken}`
  } catch (error) {
    console.error("Error creating shareable link:", error)
    throw error
  }
}

export async function getSharedPresentation(shareToken: string): Promise<SharedPresentation | null> {
  try {
    const { data, error } = await supabase
      .from("presentations")
      .select("*")
      .eq("share_token", shareToken)
      .eq("is_public", true)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return null // Presentation not found
      }
      throw error
    }

    return data
  } catch (error) {
    console.error("Error fetching shared presentation:", error)
    throw error
  }
}

export async function revokeShareableLink(presentationId: string): Promise<void> {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      throw new Error("User must be authenticated to revoke share links")
    }

    const { error } = await supabase
      .from("presentations")
      .update({
        share_token: null,
        is_public: false,
        updated_at: new Date().toISOString(),
      })
      .eq("id", presentationId)
      .eq("user_id", user.id)

    if (error) throw error
  } catch (error) {
    console.error("Error revoking shareable link:", error)
    throw error
  }
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    return new Promise((resolve, reject) => {
      const textArea = document.createElement("textarea")
      textArea.value = text
      textArea.style.position = "absolute"
      textArea.style.left = "-999999px"
      document.body.prepend(textArea)
      textArea.select()

      try {
        document.execCommand("copy")
        resolve()
      } catch (error) {
        reject(error)
      } finally {
        textArea.remove()
      }
    })
  }
}
