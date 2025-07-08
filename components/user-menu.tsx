"use client"

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
import { toast } from "@/components/ui/use-toast"
import { LogOut, FolderOpen, Settings } from "lucide-react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface UserMenuProps {
  user: SupabaseUser
  onSignOut: () => void
  onOpenPresentations?: () => void
}

export function UserMenu({ user, onSignOut, onOpenPresentations }: UserMenuProps) {
  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      onSignOut()
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
        variant: "default",
      })
    } catch (error: any) {
      console.error("Sign out error:", error)
      toast({
        title: "Sign out failed",
        description: error.message || "An error occurred during sign out.",
        variant: "destructive",
      })
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const displayName = user.user_metadata?.full_name || user.email?.split("@")[0] || "User"
  const avatarUrl = user.user_metadata?.avatar_url

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-8 w-8 rounded-full bg-gray-800/20 hover:bg-gray-700/30 border border-gray-700/30"
        >
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-yellow-400 text-white text-xs">
              {getInitials(displayName)}
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
          <Avatar className="h-8 w-8">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={displayName} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-yellow-400 text-white text-xs">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-gray-400">{user.email}</p>
          </div>
        </div>
        <DropdownMenuSeparator className="bg-gray-700" />
        {onOpenPresentations && (
          <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer" onClick={onOpenPresentations}>
            <FolderOpen className="mr-2 h-4 w-4 text-blue-400" />
            <span>My Presentations</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer" disabled>
          <Settings className="mr-2 h-4 w-4 text-gray-400" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-700" />
        <DropdownMenuItem className="hover:bg-gray-700 cursor-pointer" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4 text-red-400" />
          <span>Sign out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
