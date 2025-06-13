"use client"

import DesignEditor from "@/components/design-editor"
import { ProtectedRoute } from "@/components/auth/protected-route"

export default function Home() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <DesignEditor />
      </div>
    </ProtectedRoute>
  )
}
