import express from "express"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

export function serveStatic(app) {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)

  const distPath = path.resolve(__dirname, "..", "dist", "public")

  if (!fs.existsSync(distPath)) {
    const alternativePaths = [
      path.resolve(__dirname, "..", "public"),
      path.resolve(__dirname, "..", "build"),
      path.resolve(__dirname, "..", "dist"),
      path.resolve(__dirname, "..", "out"),
    ]

    let foundPath = null
    for (const altPath of alternativePaths) {
      if (fs.existsSync(altPath)) {
        foundPath = altPath
        break
      }
    }

    if (foundPath) {
      app.use(express.static(foundPath))
      app.use("*", (_req, res) => {
        res.sendFile(path.resolve(foundPath, "index.html"))
      })
      return
    }

    throw new Error(
      `Could not find the build directory. Expected locations: ${distPath} or common alternatives (build, dist, out). Make sure to build the client first.`,
    )
  }

  app.use(express.static(distPath))

  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"))
  })
}
