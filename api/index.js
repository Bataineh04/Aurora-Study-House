import express from "express"
import { registerRoutes } from "../dist/server/routes.js"
import { createServer } from "http"
import { initializeDatabase } from "../dist/server/db.js"

const app = express()
const httpServer = createServer(app)

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf
    },
  }),
)

app.use(express.urlencoded({ extended: false }))

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
      console.log(logLine)
    }
  })

  next()
})

let isInitialized = false

async function initialize() {
  if (!isInitialized) {
    await initializeDatabase()
    await registerRoutes(httpServer, app)

    app.use((err, _req, res, _next) => {
      const status = err.status || err.statusCode || 500
      const message = err.message || "Internal Server Error"
      res.status(status).json({ message })
      console.error(err)
    })

    isInitialized = true
  }
}

export default async function handler(req, res) {
  await initialize()
  return app(req, res)
}
