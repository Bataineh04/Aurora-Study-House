import { storage } from "./storage.js"
import { format } from "date-fns"
import { api } from "../shared/routes.js"
import {
  validateReservationInput,
  validateRoomInput,
} from "../shared/schema.js"

export async function registerRoutes(httpServer, app) {
  const NAMESPACE = "studyroom.myapp"

  // Setup authentication
  await setupAuth(app)
  app.post(api.reservations.create.path, async (req, res) => {
    try {
      const validationResult = validateReservationInput(req.body)
      if (!validationResult.isValid) {
        return res.status(400).json({
          message: validationResult.errors[0].message,
          field: validationResult.errors[0].field,
        })
      }

      // Normalize the reservation date to start of day (midnight)
      let reservationDate = new Date(req.body.reservationDate)
      reservationDate.setHours(0, 0, 0, 0) // Set time to midnight

      console.log(
        `[DEBUG] Normalized reservation date: ${reservationDate.toISOString()}`
      )

      const existing = await storage.getReservationByRoomAndDate(
        req.body.roomNumber,
        reservationDate // Pass the normalized date
      )

      if (existing) {
        return res.status(400).json({
          message: `Room ${
            req.body.roomNumber
          } is already reserved for ${format(
            reservationDate,
            "MMMM d, yyyy"
          )}.`,
        })
      }

      const normalizedReservationDate = new Date(reservationDate)
      normalizedReservationDate.setHours(0, 0, 0, 0)

      const reservation = await storage.createReservation({
        ...req.body,
        reservationDate: normalizedReservationDate,
      })
      const abacusUrl = `https://abacus.jasoncameron.dev/hit/${NAMESPACE}/room-${req.body.roomNumber}`
      try {
        await fetch(abacusUrl)
      } catch (error) {
        console.error("Failed to hit Abacus:", error)
      }

      res.status(201).json(reservation)
    } catch (err) {
      console.error("Error creating reservation:", err)
      res.status(500).json({ message: "Internal Server Error" })
    }
  })

  // Apply admin middleware to delete endpoint
  app.delete(
    api.reservations.delete.path,
    (req, res, next) => {
      if (!req.isAuthenticated || !req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access only" })
      }
      next()
    },
    async (req, res) => {
      const id = Number(req.params.id)
      const exists = await storage.getReservation(id)
      if (!exists) {
        return res.status(404).json({ message: "Reservation not found" })
      }

      await storage.deleteReservation(id)
      res.status(204).send()
    }
  )

  app.get(api.reservations.getStats.path, async (req, res) => {
    const roomNumber = req.params.roomNumber
    const reservations = await storage.getReservationsByRoom(roomNumber)
    const totalReservations = reservations.length

    const abacusUrl = `https://abacus.jasoncameron.dev/get/${NAMESPACE}/room-${roomNumber}`
    let abacusValue = 0

    try {
      const abacusRes = await fetch(abacusUrl)
      if (abacusRes.ok) {
        const abacusData = await abacusRes.json()
        if (abacusData && typeof abacusData.value === "number") {
          abacusValue = abacusData.value
        }
      }
    } catch (error) {
      console.error("Failed to get Abacus stats:", error)
    }

    res.json({
      roomNumber,
      totalReservations,
      abacusValue,
      reservedDates: reservations.map((r) => r.reservation_date),
    })
  })

  // Apply admin middleware to list endpoint
  app.get(
    api.reservations.list.path,
    (req, res, next) => {
      if (!req.isAuthenticated || !req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access only" })
      }
      next()
    },
    async (req, res) => {
      const list = await storage.getReservations()
      res.json(list)
    }
  )

  // Room management routes
  app.get(api.rooms.list.path, async (req, res) => {
    const rooms = await storage.getRooms()
    res.json(rooms)
  })

  app.post(
    api.rooms.create.path,
    (req, res, next) => {
      if (!req.isAuthenticated || !req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access only" })
      }
      next()
    },
    async (req, res) => {
      try {
        const validationResult = validateRoomInput(req.body)
        if (!validationResult.isValid) {
          return res.status(400).json({
            message: validationResult.errors[0].message,
            field: validationResult.errors[0].field,
          })
        }

        const room = await storage.createRoom(
          req.body.roomNumber,
          req.body.level,
          req.body.name
        )
        res.status(201).json(room)
      } catch (err) {
        console.error("Error creating room:", err)
        res.status(500).json({ message: "Internal Server Error" })
      }
    }
  )

  app.put(
    api.rooms.update.path,
    (req, res, next) => {
      if (!req.isAuthenticated || !req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access only" })
      }
      next()
    },
    async (req, res) => {
      try {
        const roomNumber = req.params.roomNumber
        const room = await storage.updateRoom(roomNumber, req.body)
        if (!room) {
          return res.status(404).json({ message: "Room not found" })
        }
        res.json(room)
      } catch (err) {
        console.error("Error updating room:", err)
        res.status(500).json({ message: "Internal Server Error" })
      }
    }
  )

  app.delete(
    api.rooms.delete.path,
    (req, res, next) => {
      if (!req.isAuthenticated || !req.user || req.user.role !== "admin") {
        return res.status(403).json({ message: "Forbidden: Admin access only" })
      }
      next()
    },
    async (req, res) => {
      const roomNumber = req.params.roomNumber
      await storage.deleteRoom(roomNumber)
      res.status(204).send()
    }
  )

  return httpServer
}

// Import auth setup function (will be defined in auth.js)
async function setupAuth(app) {
  const { setupAuth: authSetup } = await import("./auth.js")
  return authSetup(app)
}
