// packages/web-features/src/web/modules/user/components/resend-countdown.tsx
// CR11: the resend button stays disabled until resendAvailableAt, shows seconds left.

import { useEffect, useState } from "react"
import { Button } from "@avuny/ui/components/button"

type Props = {
  resendAvailableAt: string | null
  onResend: () => void
  resendLabel: string
  countdownLabel: (seconds: number) => string
  disabled?: boolean
}

export function ResendCountdown({
  resendAvailableAt,
  onResend,
  resendLabel,
  countdownLabel,
  disabled = false,
}: Props) {
  const [secondsLeft, setSecondsLeft] = useState<number>(0)

  useEffect(() => {
    if (!resendAvailableAt) {
      setSecondsLeft(0)
      return
    }

    const update = () => {
      const diff = Math.ceil(
        (new Date(resendAvailableAt).getTime() - Date.now()) / 1000
      )
      setSecondsLeft(Math.max(0, diff))
    }

    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [resendAvailableAt])

  const isDisabled = disabled || secondsLeft > 0

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onResend}
      disabled={isDisabled}
      className="px-0 text-sm"
    >
      {secondsLeft > 0 ? countdownLabel(secondsLeft) : resendLabel}
    </Button>
  )
}
