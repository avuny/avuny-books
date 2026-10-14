// packages/web-features/src/web/modules/user/screens/home-screen.tsx
// Slice 1 home: shows name, primary identifier, and a Sign out button.
// Uses the session user from memory (CR3). Sign-out calls purge → CR6.

import { useCallback, useState } from "react"
import { useSignOut } from "../../../../core/api/index"
import { useSession } from "../../../../core/auth/session-context"
import { useLocale } from "../../../../core/host"
import { getUserMessages } from "../messages"
import { Button } from "@avuny/ui/components/button"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@avuny/ui/components/card"

export function HomeScreen() {
  const { locale } = useLocale()
  const m = getUserMessages(locale).auth.home
  const { user, signOut } = useSession()
  const [isSigningOut, setIsSigningOut] = useState(false)

  const signOutMutation = useSignOut()

  const handleSignOut = useCallback(async () => {
    setIsSigningOut(true)
    try {
      // Fire sign-out API (best-effort — purge runs even on failure per CR6).
      await signOutMutation.mutateAsync()
    } catch {
      // Ignore API errors — purge always happens.
    } finally {
      // CR6: purge = clear token + cache + navigate to sign-in.
      signOut()
    }
  }, [signOut, signOutMutation])

  if (!user) return null

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{m.title}</CardTitle>
        </CardHeader>

        <CardContent className="flex flex-col gap-3">
          {/* Greeting with user name */}
          <p className="text-foreground text-lg font-medium">
            {m.greeting(user.name)}
          </p>

          {/* Primary identifier */}
          <div className="flex flex-col gap-0.5">
            <span className="text-muted-foreground text-xs uppercase tracking-wider">
              {m.primaryIdentifierLabel}
            </span>
            <span className="text-foreground text-sm font-medium">
              {user.identifier}
            </span>
          </div>
        </CardContent>

        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            disabled={isSigningOut}
            onClick={handleSignOut}
          >
            {isSigningOut ? m.signingOut : m.signOutButton}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
