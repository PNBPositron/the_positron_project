"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import { supabase } from "@/utils/supabase-client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function UserProfile() {
  const { user, signOut } = useAuth()
  const [isUpdating, setIsUpdating] = useState(false)
  const [fullName, setFullName] = useState(user?.user_metadata?.full_name || "")
  const router = useRouter()

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdating(true)

    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      })

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Your profile has been updated.",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push("/login")
  }

  if (!user) {
    return null
  }

  const userInitials = fullName
    ? fullName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.substring(0, 2).toUpperCase() || "U"

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <div className="text-center">
        <Avatar className="w-24 h-24 mx-auto mb-4">
          <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} />
          <AvatarFallback className="bg-gradient-to-r from-blue-500 to-yellow-400 text-white text-xl">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-yellow-300">
          Your Profile
        </h1>
        <p className="text-gray-400 mt-2">{user.email}</p>
      </div>

      <form onSubmit={handleUpdateProfile} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="full-name">Full Name</Label>
          <Input
            id="full-name"
            type="text"
            placeholder="Your name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="bg-gray-800/30 border-gray-700/30 text-gray-100 focus-visible:ring-blue-500/70"
          />
        </div>

        <Button
          type="submit"
          disabled={isUpdating}
          className="w-full bg-gradient-to-r from-blue-500 to-yellow-400 text-white hover:from-blue-600 hover:to-yellow-500"
        >
          {isUpdating ? "Updating..." : "Update Profile"}
        </Button>
      </form>

      <div className="pt-4 border-t border-gray-800">
        <Button
          variant="outline"
          onClick={handleSignOut}
          className="w-full border-gray-700 bg-gray-800/80 hover:bg-gray-700 text-gray-100"
        >
          Sign Out
        </Button>
      </div>
    </div>
  )
}
