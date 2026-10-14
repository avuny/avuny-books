// packages/web-features/src/web/modules/user/components/auth-form-wrapper.tsx
// Shared auth page shell: full-height centered card, Tailwind v4 + shadcn Card.

import type { ReactNode } from "react"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@avuny/ui/components/card"

type Props = {
  heading: string
  children: ReactNode
}

export function AuthFormWrapper({ heading, children }: Props) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <Card className="w-full max-w-sm shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{heading}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">{children}</CardContent>
      </Card>
    </div>
  )
}
