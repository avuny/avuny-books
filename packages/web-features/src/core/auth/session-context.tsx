// packages/web-features/src/core/auth/session-context.tsx
// CR3: user data and the access token live in memory only.
// CR4: on mount, attempt a refresh to restore the session.
// CR6: when purge.run() fires, clear the user, navigate to sign-in.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useQueryClient } from "@tanstack/react-query"
import { tokenStorage } from "../mutator/auth/token-storage"
import { refreshAccessToken } from "../mutator/auth/refresh-token"
import { purge } from "../mutator/auth/purge"
import { setRequestLocale } from "../mutator/interceptors/request.interceptor"
import { useNavigate, useLocale } from "../host"

// ----- Types ----------------------------------------------------------------

export type SessionUser = {
  id: string
  name: string
  identifier: string
  identifierType: string
  avatarUrl: string | null
  platformRole: string
}

export type SessionState = {
  /** null = not yet determined (loading); undefined = signed out */
  user: SessionUser | null | undefined
  isLoading: boolean
  signIn: (user: SessionUser, accessToken: string, expiresAt: string) => void
  signOut: () => void
}

// ----- Context --------------------------------------------------------------

const SessionContext = createContext<SessionState | null>(null)

export const useSession = (): SessionState => {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("Missing SessionProvider.")
  return ctx
}

// ----- Provider -------------------------------------------------------------

type SessionProviderProps = {
  children: ReactNode
  /** Path to navigate on purge (sign-in). Defaults to "/sign-in". */
  signInPath?: string
  /** Path of the home screen after sign-in. Defaults to "/". */
  homePath?: string
}

export const SessionProvider = ({
  children,
  signInPath = "/sign-in",
  homePath = "/",
}: SessionProviderProps) => {
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const { locale } = useLocale()

  // Keep locale in sync with the request interceptor (CR2).
  useEffect(() => {
    setRequestLocale(locale)
  }, [locale])

  // null = loading, undefined = signed out, SessionUser = signed in.
  const [user, setUser] = useState<SessionUser | null | undefined>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Track whether we're already navigating to avoid duplicate pushes.
  const navigatingRef = useRef(false)

  // CR6 purge handler: clear state, cache, navigate.
  const doPurge = useCallback(() => {
    setUser(undefined)
    queryClient.clear()
    if (!navigatingRef.current) {
      navigatingRef.current = true
      navigate(signInPath, { replace: true })
      // Reset flag after navigation settles.
      setTimeout(() => {
        navigatingRef.current = false
      }, 500)
    }
  }, [navigate, queryClient, signInPath])

  // Subscribe to the purge bus (response interceptor fires purge.run() on
  // REFRESH_TOKEN_INVALID / REFRESH_TOKEN_REUSED).
  useEffect(() => {
    return purge.subscribe(doPurge)
  }, [doPurge])

  // CR4: attempt session restore on mount.
  useEffect(() => {
    let cancelled = false

    async function restore() {
      try {
        // refreshAccessToken sends the HttpOnly cookie and returns the new
        // access token. If no cookie exists, Axios throws a 401.
        await refreshAccessToken()
        // The token is now in memory; the /users/me fetch happens in
        // useCurrentUser after the guard confirms auth.
      } catch {
        // No valid cookie → signed out (not a purge, just no session).
        if (!cancelled) {
          setUser(undefined)
        }
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    restore()
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const signIn = useCallback(
    (newUser: SessionUser, accessToken: string, expiresAt: string) => {
      tokenStorage.setAccessToken(accessToken, expiresAt)
      setUser(newUser)
      navigate(homePath, { replace: true })
    },
    [navigate, homePath]
  )

  const signOut = useCallback(() => {
    purge.run()
  }, [])

  const value: SessionState = {
    user: isLoading ? null : user,
    isLoading,
    signIn,
    signOut,
  }

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}
