// packages/web-features/src/core/auth/route-guard.tsx
// CR7: signed-out users only reach public screens; signed-in users who open
//      a public screen are redirected to home.

import type { ReactNode } from "react"
import { useSession } from "./session-context"
import { useNavigate } from "../host"
import { useEffect } from "react"

type Props = { children: ReactNode }

/**
 * Wrap authenticated (private) routes.
 * Shows a loading screen while the session is being restored (CR4).
 * Redirects signed-out users to /sign-in (CR7).
 */
export function AuthGuard({ children }: Props) {
  const { user, isLoading } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && user === undefined) {
      navigate("/sign-in", { replace: true })
    }
  }, [isLoading, user, navigate])

  if (isLoading) return <SessionLoadingScreen />
  if (user === undefined) return null // Navigating to sign-in
  return <>{children}</>
}

/**
 * Wrap public (auth) routes.
 * Redirects already-signed-in users to home (CR7).
 */
export function GuestGuard({ children }: Props) {
  const { user, isLoading } = useSession()
  const navigate = useNavigate()

  useEffect(() => {
    if (!isLoading && user) {
      navigate("/", { replace: true })
    }
  }, [isLoading, user, navigate])

  if (isLoading) return <SessionLoadingScreen />
  if (user) return null // Navigating to home
  return <>{children}</>
}

function SessionLoadingScreen() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
      }}
      aria-busy="true"
      aria-live="polite"
    />
  )
}
