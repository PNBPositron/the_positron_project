"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase"
import { LogOut, Settings, Cloud, UserIcon } from "lucide-react"
import { toast } from "@/components/ui/use-toast"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface UserMenuProps {
  user: SupabaseUser | null
  onSignOut: () => void
}

export function UserMenu({ user, onSignOut }: UserMenuProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
        variant: "default",
      })

      onSignOut()
    } catch (error: any) {
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!user) return null

  const userInitials = user.user_metadata?.full_name
    ? user.user_metadata.full_name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
    : user.email?.charAt(0).toUpperCase() || "U"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full bg-gray-800/20 hover:bg-gray-700/30 border border-gray-700/30"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage
              src={user.user_metadata?.avatar_url || "/placeholder.svg"}
              alt={user.user_metadata?.full_name || user.email}
            />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-yellow-400 text-white text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-56 bg-gray-800/40 border-gray-700/30 text-gray-100 backdrop-blur-2xl backdrop-saturate-150 supports-[backdrop-filter]:bg-gray-800/40 shadow-xl shadow-blue-500/10"
        align="end"
        forceMount
      >
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.user_metadata?.full_name && (
              <p className="font-medium text-sm text-gray-100">{user.user_metadata.full_name}</p>
            )}
            <p className="w-[200px] truncate text-xs text-gray-400">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
          <UserIcon className="mr-2 h-4 w-4 text-blue-400" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
          <Cloud className="mr-2 h-4 w-4 text-blue-400" />
          <span>My Presentations</span>
        </DropdownMenuItem>
        <DropdownMenuItem className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer">
          <Settings className="mr-2 h-4 w-4 text-blue-400" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem
          className="hover:bg-gray-700 focus:bg-gray-700 cursor-pointer text-red-400 focus:text-red-400"
          onClick={handleSignOut}
          disabled={isLoading}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? "Signing out..." : "Sign out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
