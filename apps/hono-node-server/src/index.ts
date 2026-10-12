import { serve } from "@hono/node-server"
import { app } from "@avuny/api"
import { config } from "./config.js"
serve(
  {
    fetch: app.fetch,
    port: config.PORT,
  },
  (info) => {
    console.log(`Server running on http://localhost:${info.port}`)
  }
)
