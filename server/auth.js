import passport from "passport"
import { Strategy as LocalStrategy } from "passport-local"
import session from "express-session"
import { storage } from "./storage.js"
import bcrypt from "bcryptjs"
import { validateUserInput } from "../shared/schema.js"

export function setupAuth(app) {
  const sessionSettings = {
    secret: process.env.SESSION_SECRET || "default_secret",
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      secure: app.get("env") === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 1 week
    },
  }

  if (app.get("env") === "production") {
    app.set("trust proxy", 1)
  }

  app.use(session(sessionSettings))
  app.use(passport.initialize())
  app.use(passport.session())

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        const user = await storage.getUserByUsername(username)
        if (!user) {
          return done(null, false, { message: "Invalid username or password" })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
          return done(null, false, { message: "Invalid username or password" })
        }

        return done(null, user)
      } catch (err) {
        return done(err)
      }
    }),
  )

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser(async (id, done) => {
    try {
      const user = await storage.getUser(id)
      done(null, user)
    } catch (err) {
      done(err, null)
    }
  })

  app.post("/api/register", async (req, res, next) => {
    try {
      const validationResult = validateUserInput(req.body)
      if (!validationResult.isValid) {
        return res.status(400).json({
          message: validationResult.errors[0].message,
          field: validationResult.errors[0].field,
        })
      }

      const existingUser = await storage.getUserByUsername(req.body.username)
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" })
      }

      const user = await storage.createUser(req.body)
      req.login(user, (err) => {
        if (err) return next(err)
        res
          .status(201)
          .json({ id: user.id, username: user.username, role: user.role })
      })
    } catch (err) {
      next(err)
    }
  })

  app.post("/api/login", (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
      if (err) return next(err)
      if (!user)
        return res
          .status(401)
          .json({ message: info?.message || "Login failed" })

      req.login(user, (err) => {
        if (err) return next(err)
        res.json({ id: user.id, username: user.username, role: user.role })
      })
    })(req, res, next)
  })

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err)
      req.session.destroy((err) => {
        if (err) return next(err)
        res.clearCookie("connect.sid")
        res.sendStatus(200)
      })
    })
  })

  app.get("/api/user", (req, res) => {
    if (req.isAuthenticated()) {
      res.json({
        id: req.user.id,
        username: req.user.username,
        role: req.user.role,
      })
    } else {
      res.status(200).json(null)
    }
  })

  app.use("/api/admin", (req, res, next) => {
    if (!req.isAuthenticated() || !req.user || req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden: Admin access only" })
    }
    next()
  })
}
