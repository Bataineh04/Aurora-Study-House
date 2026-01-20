import pg from "pg"
import { usersTable, reservationsTable, roomsTable } from "../shared/schema.js"

const { Pool } = pg

export const pool = new Pool({
  connectionString:
    "postgresql://neondb_owner:npg_UFhBeTM6EOf2@ep-dark-band-ag6ntssw-pooler.c-2.eu-central-1.aws.neon.tech/test?sslmode=require&channel_binding=require",
})

export async function initializeDatabase() {
  try {
    await pool.query(usersTable)
    await pool.query(reservationsTable)
    await pool.query(roomsTable)

    await pool.query(`
      ALTER TABLE reservations 
      ADD COLUMN IF NOT EXISTS reservation_date DATE DEFAULT CURRENT_DATE;
    `)

    await pool.query(`
      ALTER TABLE rooms 
      ADD COLUMN IF NOT EXISTS level VARCHAR(50) DEFAULT '1';
    `)

    await pool.query(`
      ALTER TABLE rooms 
      ADD COLUMN IF NOT EXISTS name VARCHAR(255);
    `)

    const roomsCount = await pool.query("SELECT COUNT(*) FROM rooms")
    if (parseInt(roomsCount.rows[0].count) === 0) {
      const defaultRooms = ["101", "102", "103", "201", "202"]
      for (const room of defaultRooms) {
        await pool.query("INSERT INTO rooms (room_number) VALUES ($1)", [room])
      }
      console.log("Default rooms seeded")
    }

    console.log("Database tables initialized successfully")
  } catch (error) {
    console.error("Error initializing database:", error)
    throw error
  }
}

export const db = pool
