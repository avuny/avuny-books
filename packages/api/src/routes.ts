import { swaggerUI } from "@hono/swagger-ui"
import { OpenAPIHono } from "@hono/zod-openapi"
import { onError } from "./onError.js"

import { resolveRequestLanguageMiddleware } from "@avuny/hono"
import { requestId } from "hono/request-id"
import { structuredLogger } from "@hono/structured-logger"
import { logger } from "@avuny/logger"
import healthRoute from "./health.route.js"
import { installRequestLanguage } from "./intl/i18next.js"
import { otpRoutes } from "./modules/otp/index.js"
import { authRoutes } from "./modules/auth/index.js"
import { usersRoutes } from "./modules/users/index.js"
import { adminRoutes } from "./modules/admin/index.js"

// Initialize server i18n once at startup. Must be called before any request
// uses trans(). Never call i18n.changeLanguage() after this — it is global and
// races between concurrent requests.
installRequestLanguage()

export const app = new OpenAPIHono().basePath("/api")

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(resolveRequestLanguageMiddleware)
app.use(requestId())
app.use(
  structuredLogger({
    createLogger: (c) => logger.child({ requestId: c.var.requestId }),
  })
)

// ── Routes ────────────────────────────────────────────────────────────────────
app.route("/", healthRoute)
app.route("/otp", otpRoutes)
app.route("/auth", authRoutes)
app.route("/users", usersRoutes)
app.route("/admin", adminRoutes)

app.onError(onError)

// ── OpenAPI docs ──────────────────────────────────────────────────────────────
app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: { title: "Avuny API", version: "1.0.0" },
})

app.get("/docs", swaggerUI({ url: "/api/openapi.json" }))
