"use client"

import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function SignupRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/auth/signup")
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <p className="text-gray-600">Redirecting to signup...</p>
      </div>
    </div>
  )
}
