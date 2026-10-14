// packages/web-features/src/web/modules/user/components/otp-code-field.tsx
// CR11: 6-digit numeric field. dir="ltr" always (even in RTL layouts).
// Accepts paste, autocomplete="one-time-code". Uses shadcn Input.

import { forwardRef, type ComponentPropsWithoutRef } from "react"
import { Input } from "@avuny/ui/components/input"
import { Label } from "@avuny/ui/components/label"

type Props = Omit<
  ComponentPropsWithoutRef<"input">,
  "type" | "maxLength" | "inputMode" | "pattern" | "autoComplete" | "dir"
> & {
  label?: string
  error?: string
}

export const OtpCodeField = forwardRef<HTMLInputElement, Props>(
  ({ label, error, id, className, ...rest }, ref) => (
    <div className="flex flex-col gap-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      <Input
        ref={ref}
        id={id}
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        maxLength={6}
        autoComplete="one-time-code"
        // CR11: digits always left-to-right even in RTL layouts.
        dir="ltr"
        className={[
          "h-12 text-center font-mono text-2xl tracking-widest",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        aria-invalid={!!error}
        aria-describedby={error && id ? `${id}-error` : undefined}
        {...rest}
      />
      {error && id && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-destructive text-sm"
        >
          {error}
        </p>
      )}
    </div>
  )
)
OtpCodeField.displayName = "OtpCodeField"
