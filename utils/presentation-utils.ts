import { supabase } from "./supabase-client"
import type { Slide } from "@/types/editor"

export async function savePresentation(title: string, slides: Slide[], isPublic = false, additionalData = {}) {
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

export async function updatePresentation(
  id: string,
  title: string,
  slides: Slide[],
  isPublic = false,
  additionalData = {},
) {
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
      .update({
        title,
        slides,
        is_public: isPublic,
        updated_at: new Date().toISOString(),
        ...additionalData,
      })
      .eq("id", id)
      .eq("user_id", session.user.id) // Ensure the user can only update their own presentations
      .select()
      .single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error updating presentation:", error)
    return { data: null, error }
  }
}

export async function getUserPresentations() {
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
      .select("*")
      .eq("user_id", session.user.id) // Only get the user's presentations
      .order("updated_at", { ascending: false })

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error fetching presentations:", error)
    return { data: null, error }
  }
}

export async function getPresentation(id: string) {
  try {
    const { data, error } = await supabase.from("presentations").select("*").eq("id", id).single()

    if (error) {
      throw error
    }

    return { data, error: null }
  } catch (error) {
    console.error("Error fetching presentation:", error)
    return { data: null, error }
  }
}

export async function deletePresentation(id: string) {
  try {
    // Get the current user session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session || !session.user) {
      throw new Error("User not authenticated")
    }

    const { error } = await supabase.from("presentations").delete().eq("id", id).eq("user_id", session.user.id) // Ensure the user can only delete their own presentations

    if (error) {
      throw error
    }

    return { error: null }
  } catch (error) {
    console.error("Error deleting presentation:", error)
    return { error }
  }
}
