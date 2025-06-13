"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { LogOut, User, Settings } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export function UserMenu() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    const { error } = await signOut()
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      })
    } else {
      router.push("/login")
    }
  }

  if (!user) {
    return (
      <Link href="/login">
        <Button
          variant="outline"
          size="sm"
          className="border-gray-700/30 bg-gray-800/20 hover:bg-gray-700/30 text-gray-100"
        >
          Sign In
        </Button>
      </Link>
    )
  }

  const userInitials = user.email ? user.email.substring(0, 2).toUpperCase() : "U"

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.user_metadata?.avatar_url || "/placeholder.svg"} alt={user.email || ""} />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-yellow-400 text-white">
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
            {user.email && <p className="font-medium text-sm text-gray-200">{user.email}</p>}
          </div>
        </div>
        <DropdownMenuSeparator className="bg-gray-700/50" />
        <DropdownMenuItem
          className="cursor-pointer hover:bg-gray-700/50"
          onClick={() => {
            setIsOpen(false)
            router.push("/profile")
          }}
        >
          <User className="mr-2 h-4 w-4 text-blue-400" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer hover:bg-gray-700/50"
          onClick={() => {
            setIsOpen(false)
            router.push("/presentations")
          }}
        >
          <Settings className="mr-2 h-4 w-4 text-blue-400" />
          <span>My Presentations</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-700/50" />
        <DropdownMenuItem className="cursor-pointer hover:bg-gray-700/50" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4 text-red-400" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
