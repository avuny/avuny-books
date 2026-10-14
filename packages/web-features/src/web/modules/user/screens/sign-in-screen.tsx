// packages/web-features/src/web/modules/user/screens/sign-in-screen.tsx
// Slice 1 sign-in: identifier + password.
// CR8: INVALID_CREDENTIALS (generic), TOO_MANY_ATTEMPTS (disabled + countdown),
//      ACCOUNT_SUSPENDED (show, no retry).
// CR10: disabled while pending.
// CR12: autocomplete="username" / "current-password".

import { useCallback, useState } from "react"
import { useSignIn } from "../../../../core/api/index"
import { useSession } from "../../../../core/auth/session-context"
import { useLocale, Link } from "../../../../core/host"
import { getUserMessages } from "../messages"
import { authPaths } from "../paths"
import { AuthFormWrapper } from "../components/auth-form-wrapper"
import { Button } from "@avuny/ui/components/button"
import { Input } from "@avuny/ui/components/input"
import { Label } from "@avuny/ui/components/label"

function getCode(err: unknown): string | undefined {
  return (
    err as { response?: { data?: { body?: { code?: string } } } }
  )?.response?.data?.body?.code
}

function getMessage(err: unknown): string | undefined {
  return (
    err as { response?: { data?: { message?: string } } }
  )?.response?.data?.message
}

function getRetryAfter(err: unknown): number {
  const raw = (
    err as { response?: { data?: { body?: { retryAfter?: number | string } } } }
  )?.response?.data?.body?.retryAfter
  if (!raw) return 60
  if (typeof raw === "number") return raw
  return Math.max(0, Math.ceil((new Date(raw as string).getTime() - Date.now()) / 1000))
}

export function SignInScreen() {
  const { locale } = useLocale()
  const m = getUserMessages(locale).auth.signIn
  const { signIn } = useSession()

  const [formError, setFormError] = useState("")
  const [isSuspended, setIsSuspended] = useState(false)
  const [retrySecondsLeft, setRetrySecondsLeft] = useState(0)

  const signInMutation = useSignIn()

  const startCountdown = useCallback((seconds: number) => {
    setRetrySecondsLeft(seconds)
    const id = setInterval(() => {
      setRetrySecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id)
          setFormError("")
          return 0
        }
        return s - 1
      })
    }, 1000)
  }, [])

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setFormError("")
      setIsSuspended(false)

      const form = e.currentTarget
      const identifier = (form.elements.namedItem("identifier") as HTMLInputElement).value.trim()
      const password = (form.elements.namedItem("password") as HTMLInputElement).value

      try {
        const result = await signInMutation.mutateAsync({ data: { identifier, password } })
        if (result.status === 200) {
          const { user, tokens } = result.data.data
          signIn(user, tokens.accessToken, tokens.accessTokenExpiresAt)
        }
      } catch (err) {
        const code = getCode(err)

        if (code === "INVALID_CREDENTIALS") {
          // CR8: generic — never say which field is wrong.
          setFormError(m.invalidCredentialsMessage)
        } else if (code === "TOO_MANY_ATTEMPTS") {
          // CR8: disable + live countdown.
          const secs = getRetryAfter(err)
          setFormError(m.tooManyAttemptsMessage(secs))
          startCountdown(secs)
        } else if (code === "ACCOUNT_SUSPENDED") {
          // CR8: show message, no retry.
          setIsSuspended(true)
          setFormError(m.accountSuspendedMessage)
        } else {
          setFormError(getMessage(err) ?? "Something went wrong. Please try again.")
        }
      }
    },
    [m, signIn, signInMutation, startCountdown]
  )

  const isBlocked = signInMutation.isPending || isSuspended || retrySecondsLeft > 0

  return (
    <AuthFormWrapper heading={m.title}>
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="si-identifier">{m.identifierLabel}</Label>
          <Input
            id="si-identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            placeholder={m.identifierPlaceholder}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="si-password">{m.passwordLabel}</Label>
          <Input
            id="si-password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder={m.passwordPlaceholder}
          />
        </div>

        {/* CR8: single form-level error, never per-field for credentials */}
        {formError && (
          <p role="alert" className="text-destructive text-sm">
            {retrySecondsLeft > 0 ? m.tooManyAttemptsMessage(retrySecondsLeft) : formError}
          </p>
        )}

        {/* CR10: disabled while pending or blocked */}
        <Button type="submit" className="w-full" disabled={isBlocked}>
          {signInMutation.isPending ? m.submitting : m.submitButton}
        </Button>
      </form>

      <p className="text-muted-foreground text-center text-sm">
        {m.noAccount}{" "}
        <Link to={authPaths.signUp} className="text-primary underline underline-offset-4">
          {m.signUpLink}
        </Link>
      </p>
    </AuthFormWrapper>
  )
}
