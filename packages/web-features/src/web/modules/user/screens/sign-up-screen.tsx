// packages/web-features/src/web/modules/user/screens/sign-up-screen.tsx
// Slice 1 sign-up: step 1 (identifier) → step 2 (OTP code + countdown) → step 3 (name + password).
// CR9: step 2 always shows neutral wording.
// CR8: per-code error handling (OTP_INVALID, OTP_EXPIRED, OTP_ATTEMPTS_EXCEEDED, etc.).
// CR10: submit buttons disabled while pending.
// CR11: 6-digit OTP field, dir=ltr.
// CR12: client-side length validation via PASSWORD_MIN_LENGTH from contracts.

import { useState, useRef, useCallback } from "react"
import {
  useSignUpSendOtp,
  useVerifyOtp,
  useSignUp,
} from "../../../../core/api/index"
import type {
  SignUpSendOtp202Data,
  VerifyOtp200Data,
} from "../../../../core/api/model"
import { useSession } from "../../../../core/auth/session-context"
import { useLocale, Link } from "../../../../core/host"
import { getUserMessages } from "../messages"
import { authPaths } from "../paths"
import { AuthFormWrapper } from "../components/auth-form-wrapper"
import { OtpCodeField } from "../components/otp-code-field"
import { ResendCountdown } from "../components/resend-countdown"
import { Button } from "@avuny/ui/components/button"
import { Input } from "@avuny/ui/components/input"
import { Label } from "@avuny/ui/components/label"

// CR12: shared contract constant (PASSWORD_MIN_LENGTH = 8).
const PASSWORD_MIN_LENGTH = 8

type Step = "identifier" | "code" | "details"

/** Extracts the domain error code from an Axios/Orval error. */
function getCode(err: unknown): string | undefined {
  return (
    err as { response?: { data?: { body?: { code?: string } } } }
  )?.response?.data?.body?.code
}

/** Extracts the server message (Q13 default: show server message). */
function getMessage(err: unknown): string | undefined {
  return (
    err as { response?: { data?: { message?: string } } }
  )?.response?.data?.message
}

export function SignUpScreen() {
  const { locale } = useLocale()
  const m = getUserMessages(locale).auth.signUp
  const { signIn } = useSession()

  // ── State ─────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>("identifier")
  const [identifier, setIdentifier] = useState("")
  const [challengeData, setChallengeData] = useState<SignUpSendOtp202Data | null>(null)
  const [proofData, setProofData] = useState<VerifyOtp200Data | null>(null)

  const [identifierError, setIdentifierError] = useState("")
  const [codeError, setCodeError] = useState("")
  const [codeDeadMsg, setCodeDeadMsg] = useState("")
  const [nameError, setNameError] = useState("")
  const [passwordError, setPasswordError] = useState("")
  const [formError, setFormError] = useState("")

  const codeRef = useRef<HTMLInputElement>(null)

  // ── API hooks ──────────────────────────────────────────────────────────────
  const sendOtpMutation = useSignUpSendOtp()
  const verifyOtpMutation = useVerifyOtp()
  const signUpMutation = useSignUp()

  // ── Step 1: Send OTP ──────────────────────────────────────────────────────
  const handleSendOtp = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setIdentifierError("")
      setFormError("")

      const value = identifier.trim()
      if (!value) {
        setIdentifierError("Required")
        return
      }

      try {
        const result = await sendOtpMutation.mutateAsync({ data: { identifier: value } })
        if (result.status === 202) {
          setChallengeData(result.data.data)
          setStep("code")
        }
      } catch (err) {
        const code = getCode(err)
        if (code === "OTP_RATE_LIMITED") {
          setFormError(m.step2.rateLimitedMessage)
        } else if (code === "INVALID_IDENTIFIER_TYPE") {
          setIdentifierError(getMessage(err) ?? "Invalid email or phone number.")
        } else if (code) {
          setFormError(getMessage(err) ?? "Failed to send code.")
        } else {
          // Network / unknown — CR8: don't reveal whether identifier exists.
          setStep("code")
        }
      }
    },
    [identifier, m, sendOtpMutation]
  )

  // ── Step 2: Resend ────────────────────────────────────────────────────────
  const handleResend = useCallback(async () => {
    if (!identifier) return
    setCodeError("")
    setCodeDeadMsg("")
    setFormError("")

    try {
      const result = await sendOtpMutation.mutateAsync({ data: { identifier } })
      if (result.status === 202) setChallengeData(result.data.data)
    } catch (err) {
      const code = getCode(err)
      if (code === "OTP_RESEND_TOO_SOON") {
        /* countdown is already running — ignore */
      } else if (code === "OTP_RATE_LIMITED") {
        setFormError(m.step2.rateLimitedMessage)
      } else {
        setFormError(getMessage(err) ?? "")
      }
    }
  }, [identifier, m, sendOtpMutation])

  // ── Step 2: Verify ────────────────────────────────────────────────────────
  const handleVerify = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setCodeError("")
      setCodeDeadMsg("")

      const code = codeRef.current?.value ?? ""
      if (code.length !== 6) {
        setCodeError("Enter the 6-digit code.")
        return
      }
      if (!challengeData) return

      try {
        const result = await verifyOtpMutation.mutateAsync({
          data: { challengeId: challengeData.challengeId, code },
        })
        if (result.status === 200) {
          setProofData(result.data.data)
          setStep("details")
        }
      } catch (err) {
        const c = getCode(err)
        if (c === "OTP_INVALID") {
          // CR8: inline, clear input, keep screen.
          setCodeError(getMessage(err) ?? "Invalid code. Try again.")
          if (codeRef.current) codeRef.current.value = ""
        } else if (c === "OTP_EXPIRED") {
          setCodeDeadMsg(m.step2.codeExpiredMessage)
        } else if (c === "OTP_ATTEMPTS_EXCEEDED") {
          setCodeDeadMsg(m.step2.tooManyAttemptsMessage)
        } else {
          setCodeError(getMessage(err) ?? "Verification failed.")
        }
      }
    },
    [challengeData, m, verifyOtpMutation]
  )

  // ── Step 3: Sign up ───────────────────────────────────────────────────────
  const handleSignUp = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault()
      setNameError("")
      setPasswordError("")
      setFormError("")

      const form = e.currentTarget
      const name = (form.elements.namedItem("name") as HTMLInputElement).value.trim()
      const password = (form.elements.namedItem("password") as HTMLInputElement).value

      if (!name) { setNameError("Name is required."); return }
      if (password.length < PASSWORD_MIN_LENGTH) {
        setPasswordError(`Password must be at least ${PASSWORD_MIN_LENGTH} characters.`)
        return
      }
      if (new TextEncoder().encode(password).length > 72) {
        setPasswordError("Password is too long (max 72 bytes).")
        return
      }
      if (!proofData) return

      try {
        const result = await signUpMutation.mutateAsync({
          data: { identifier, name, password, verificationToken: proofData.verificationToken },
        })
        if (result.status === 201) {
          const { user, tokens } = result.data.data
          signIn(user, tokens.accessToken, tokens.accessTokenExpiresAt)
        }
      } catch (err) {
        const c = getCode(err)
        if (c === "VERIFICATION_TOKEN_INVALID") {
          setStep("identifier")
          setFormError("Your code session expired. Please request a new code.")
        } else if (c === "WEAK_PASSWORD") {
          setPasswordError(getMessage(err) ?? "Password is too weak.")
        } else {
          setFormError(getMessage(err) ?? "Something went wrong. Please try again.")
        }
      }
    },
    [identifier, proofData, signIn, signUpMutation]
  )

  // ── Step 1 render ─────────────────────────────────────────────────────────
  if (step === "identifier") {
    return (
      <AuthFormWrapper heading={m.title}>
        <form onSubmit={handleSendOtp} noValidate className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="su-identifier">{m.step1.identifierLabel}</Label>
            <Input
              id="su-identifier"
              type="text"
              autoComplete="email"
              placeholder={m.step1.identifierPlaceholder}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              aria-invalid={!!identifierError}
            />
            {identifierError && (
              <p role="alert" className="text-destructive text-sm">{identifierError}</p>
            )}
          </div>

          {formError && (
            <p role="alert" className="text-destructive text-sm">{formError}</p>
          )}

          <Button type="submit" className="w-full" disabled={sendOtpMutation.isPending}>
            {sendOtpMutation.isPending ? m.step1.submitting : m.step1.submitButton}
          </Button>
        </form>
      </AuthFormWrapper>
    )
  }

  // ── Step 2 render ─────────────────────────────────────────────────────────
  if (step === "code") {
    const codeIsDead = !!codeDeadMsg
    return (
      <AuthFormWrapper heading={m.step2.heading}>
        {/* CR9: neutral wording */}
        <p className="text-muted-foreground text-sm">{m.step2.neutralMessage}</p>

        {codeDeadMsg && (
          <p role="alert" className="text-destructive bg-destructive/10 rounded-lg px-3 py-2 text-sm">
            {codeDeadMsg}
          </p>
        )}

        <form onSubmit={handleVerify} noValidate className="flex flex-col gap-4">
          <OtpCodeField
            ref={codeRef}
            id="su-code"
            label={m.step2.codeLabel}
            placeholder={m.step2.codePlaceholder}
            error={codeError}
            disabled={codeIsDead}
            onChange={() => setCodeError("")}
          />

          {formError && (
            <p role="alert" className="text-destructive text-sm">{formError}</p>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={codeIsDead || verifyOtpMutation.isPending}
          >
            {verifyOtpMutation.isPending ? m.step2.verifying : m.step2.verifyButton}
          </Button>
        </form>

        <div className="flex items-center justify-between">
          <ResendCountdown
            resendAvailableAt={challengeData?.resendAvailableAt ?? null}
            onResend={handleResend}
            resendLabel={m.step2.resendButton}
            countdownLabel={m.step2.resendCountdown}
            disabled={sendOtpMutation.isPending}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="px-0 text-muted-foreground text-sm"
            onClick={() => {
              setStep("identifier")
              setCodeError("")
              setCodeDeadMsg("")
              setFormError("")
            }}
          >
            {m.step2.changeIdentifier}
          </Button>
        </div>
      </AuthFormWrapper>
    )
  }

  // ── Step 3 render ─────────────────────────────────────────────────────────
  return (
    <AuthFormWrapper heading={m.step3.heading}>
      <form onSubmit={handleSignUp} noValidate className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="su-name">{m.step3.nameLabel}</Label>
          <Input
            id="su-name"
            name="name"
            type="text"
            autoComplete="name"
            placeholder={m.step3.namePlaceholder}
            aria-invalid={!!nameError}
          />
          {nameError && (
            <p role="alert" className="text-destructive text-sm">{nameError}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="su-password">{m.step3.passwordLabel}</Label>
          <Input
            id="su-password"
            name="password"
            type="password"
            autoComplete="new-password"
            placeholder={m.step3.passwordPlaceholder}
            aria-invalid={!!passwordError}
          />
          {passwordError && (
            <p role="alert" className="text-destructive text-sm">{passwordError}</p>
          )}
        </div>

        {formError && (
          <p role="alert" className="text-destructive text-sm">{formError}</p>
        )}

        <Button type="submit" className="w-full" disabled={signUpMutation.isPending}>
          {signUpMutation.isPending ? m.step3.submitting : m.step3.submitButton}
        </Button>
      </form>
    </AuthFormWrapper>
  )
}
