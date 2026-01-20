import { db, pool } from "./db.js"
import session from "express-session"
import connectPg from "connect-pg-simple"
import bcrypt from "bcryptjs"

const PostgresSessionStore = connectPg(session)

export class DatabaseStorage {
  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool,
      createTableIfMissing: true,
    })
  }

  async getUser(id) {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id])
    return result.rows[0]
  }

  async getUserByUsername(username) {
    const result = await db.query("SELECT * FROM users WHERE username = $1", [
      username,
    ])
    return result.rows[0]
  }

  async createUser(user) {
    const { username, password, role = "student" } = user
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await db.query(
      "INSERT INTO users (username, password, role) VALUES ($1, $2, $3) RETURNING *",
      [username, hashedPassword, role]
    )
    return result.rows[0]
  }

  async createReservation(reservation) {
    const {
      studentName,
      roomNumber,
      reservationDate = new Date(),
    } = reservation
    const result = await db.query(
      "INSERT INTO reservations (student_name, room_number, reservation_date) VALUES ($1, $2, $3) RETURNING *",
      [studentName, roomNumber, reservationDate]
    )
    return result.rows[0]
  }

  async deleteReservation(id) {
    await db.query("DELETE FROM reservations WHERE id = $1", [id])
  }

  async getReservations() {
    const result = await db.query(
      "SELECT * FROM reservations ORDER BY created_at DESC"
    )
    return result.rows
  }

  async getReservationsByRoom(roomNumber) {
    const result = await db.query(
      "SELECT * FROM reservations WHERE room_number = $1 ORDER BY created_at DESC",
      [roomNumber]
    )
    return result.rows
  }

  async getReservationByRoomAndDate(roomNumber, reservationDate) {
    const result = await db.query(
      "SELECT * FROM reservations WHERE room_number = $1 AND reservation_date = $2",
      [roomNumber, reservationDate]
    )
    return result.rows[0]
  }

  async getReservation(id) {
    const result = await db.query("SELECT * FROM reservations WHERE id = $1", [
      id,
    ])
    return result.rows[0]
  }

  // Room management
  async getRooms() {
    const result = await db.query(
      "SELECT * FROM rooms ORDER BY level ASC, room_number ASC"
    )
    return result.rows
  }

  async createRoom(roomNumber, level = "1", name = null) {
    const result = await db.query(
      "INSERT INTO rooms (room_number, level, name) VALUES ($1, $2, $3) RETURNING *",
      [roomNumber, level, name]
    )
    return result.rows[0]
  }

  async updateRoom(roomNumber, updates) {
    const { level, name } = updates
    const result = await db.query(
      "UPDATE rooms SET level = COALESCE($2, level), name = COALESCE($3, name) WHERE room_number = $1 RETURNING *",
      [roomNumber, level, name]
    )
    return result.rows[0]
  }

  async deleteRoom(roomNumber) {
    await db.query("DELETE FROM rooms WHERE room_number = $1", [roomNumber])
  }
}

export const storage = new DatabaseStorage()
