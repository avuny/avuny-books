import { swaggerUI } from "@hono/swagger-ui"
import { OpenAPIHono } from "@hono/zod-openapi"
import { onError } from "./onError.js"

import { resolveRequestLanguageMiddleware } from "@avuny/hono"
// import { UserRoutes, AuthRoutes } from "./modules/user/index.js"

import { requestId } from "hono/request-id"
import { structuredLogger } from "@hono/structured-logger"
import { logger } from "@avuny/logger"
import healthRoute from "./health.route.js"


export const app = new OpenAPIHono().basePath("/api")
app.use(resolveRequestLanguageMiddleware)
// routes here
app.use(requestId())
app.use(
  structuredLogger({
    createLogger: (c) => logger.child({ requestId: c.var.requestId }),
  })
)
app.route("/", healthRoute)
// app.route("/auth", AuthRoutes)
// app.route("/user", UserRoutes)


app.onError(onError)

app.doc("/openapi.json", {
  openapi: "3.0.0",
  info: { title: "IMS API", version: "1.0.0" },
})

app.get("/docs", swaggerUI({ url: "/api/openapi.json" }))
