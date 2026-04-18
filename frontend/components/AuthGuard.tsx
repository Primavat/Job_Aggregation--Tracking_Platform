'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

export default function AuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter()

  const token = useAuthStore((state) => state.token)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)

  useEffect(() => {
    if (!hasHydrated) return

    if (!token) {
      router.replace('/login')
    }
  }, [token, hasHydrated, router])

  // prevent flicker
  if (!hasHydrated) return null
  if (!token) return null

  return <>{children}</>
}