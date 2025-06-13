"use client"

import { UserProfile } from "@/components/auth/user-profile"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center bg-gray-950 p-4">
        <UserProfile />
      </div>
    </ProtectedRoute>
  )
}
