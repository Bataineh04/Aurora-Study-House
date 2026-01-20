import express from "express"
import fs from "fs"
import path, { dirname } from "path"
import { fileURLToPath } from "url"
import { createServer as createViteServer } from "vite"
import { log } from "./index.js"

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

export async function setupVite(app, server) {
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      hmr: { server },
    },
    appType: "custom",
  })

  app.use(vite.middlewares)

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl

    try {
      const clientPath = path.resolve(__dirname, "..", "client", "index.html")
      let template = fs.readFileSync(clientPath, "utf-8")

      template = await vite.transformIndexHtml(url, template)

      res.status(200).set({ "Content-Type": "text/html" }).end(template)
    } catch (e) {
      vite.ssrFixStacktrace(e)
      next(e)
    }
  })
}
