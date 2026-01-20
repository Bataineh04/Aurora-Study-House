import express from "express"
import { registerRoutes } from "./routes.js"
import { serveStatic } from "./static.js"
import { createServer } from "http"
import { initializeDatabase } from "./db.js"

const app = express()
const httpServer = createServer(app)

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf
    },
  })
)

app.use(express.urlencoded({ extended: false }))

export function log(message, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  })

  console.log(`${formattedTime} [${source}] ${message}`)
}

app.use((req, res, next) => {
  const start = Date.now()
  const path = req.path
  let capturedJsonResponse = undefined

  const originalResJson = res.json
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson
    return originalResJson.apply(res, [bodyJson, ...args])
  }

  res.on("finish", () => {
    const duration = Date.now() - start
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`
      }

      log(logLine)
    }
  })

  next()
})
;(async () => {
  await initializeDatabase()

  await registerRoutes(httpServer, app)

  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500
    const message = err.message || "Internal Server Error"

    res.status(status).json({ message })
    console.error(err)
  })

  if (app.get("env") === "production") {
    serveStatic(app)
  } else {
    const { setupVite } = await import("./vite.js")
    await setupVite(app, httpServer)
  }

  const port = 5000

  httpServer.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`)
  })
})()
