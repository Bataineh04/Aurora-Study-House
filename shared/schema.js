// Users table
export const usersTable = `
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL DEFAULT 'student' -- 'student' or 'admin'
);
`

// Reservations table
export const reservationsTable = `
CREATE TABLE IF NOT EXISTS reservations (
  id SERIAL PRIMARY KEY,
  student_name VARCHAR(255) NOT NULL,
  room_number VARCHAR(50) NOT NULL,
  reservation_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

// Rooms table
export const roomsTable = `
CREATE TABLE IF NOT EXISTS rooms (
  room_number VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255),
  level VARCHAR(50) DEFAULT '1',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`

export const validateUserInput = (data) => {
  const errors = []

  if (
    !data.username ||
    typeof data.username !== "string" ||
    data.username.trim().length === 0
  ) {
    errors.push({ field: "username", message: "Username is required" })
  }

  if (
    !data.password ||
    typeof data.password !== "string" ||
    data.password.length < 6
  ) {
    errors.push({
      field: "password",
      message: "Password must be at least 6 characters",
    })
  }

  if (data.role && !["student", "admin"].includes(data.role)) {
    errors.push({
      field: "role",
      message: "Role must be either student or admin",
    })
  }

  return { isValid: errors.length === 0, errors }
}

export const validateReservationInput = (data) => {
  const errors = []

  if (
    !data.studentName ||
    typeof data.studentName !== "string" ||
    data.studentName.trim().length === 0
  ) {
    errors.push({ field: "studentName", message: "Student name is required" })
  }

  if (
    !data.roomNumber ||
    typeof data.roomNumber !== "string" ||
    data.roomNumber.trim().length === 0
  ) {
    errors.push({ field: "roomNumber", message: "Room number is required" })
  }

  return { isValid: errors.length === 0, errors }
}

export const validateRoomInput = (data) => {
  const errors = []

  if (
    !data.roomNumber ||
    typeof data.roomNumber !== "string" ||
    data.roomNumber.trim().length === 0
  ) {
    errors.push({ field: "roomNumber", message: "Room number is required" })
  }

  if (data.level && typeof data.level !== "string") {
    errors.push({ field: "level", message: "Level must be a string" })
  }

  if (data.name && typeof data.name !== "string") {
    errors.push({ field: "name", message: "Name must be a string" })
  }

  return { isValid: errors.length === 0, errors }
}

export const User = {
  id: 0,
  username: "",
  password: "",
  role: "student",
}

export const Reservation = {
  id: 0,
  studentName: "",
  roomNumber: "",
  reservationDate: new Date(),
  createdAt: new Date(),
}

export const RoomStats = {
  roomNumber: "",
  level: "1",
  totalReservations: 0,
  abacusValue: 0,
}
