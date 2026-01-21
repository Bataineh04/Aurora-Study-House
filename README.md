# Project Architecture & Documentation

Welcome to the **Study Room Reservation System**. This project is built with a modern stack focusing on reliability, speed, and a premium user experience.

## Tech Stack

### Frontend

- **React**: Component-based UI library.
- **MUI (Material UI)**: Theme and component system.
- **Tailwind CSS**: Utility-first styling for layout and custom glassmorphism.
- **TanStack Query (React Query)**: State management for server data fetching and synchronization.
- **Framer Motion**: Smooth animations and transitions.
- **Wouter**: Lightweight routing.

### Backend

- **Node.js & Express**: Server framework.
- **PostgreSQL**: Relational database for persistent storage.
- **Passport.js**: Authentication middleware.
- **date-fns**: Precise date manipulation and comparison.

---

## Folder Structure

```text
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── lib/
│   │   └── App.jsx
├── server/
│   ├── index.js
│   ├── routes.js
│   ├── auth.js
│   ├── storage.js
│   └── db.js
└── shared/
    ├── schema.js
    └── routes.js
```

---

## Key Maintaining Principles

1.  **Shared Routes**: Always use the `api` object from [shared/routes.js](/shared/routes.js) to define or call endpoints. This ensures that if a URL changes, it updates in both the frontend and backend simultaneously.
2.  **Glassmorphism Theme**: The application uses a custom `.glass-card` class combined with `.premium-gradient`. Maintain consistency by reusing these styles for new cards and panels.
3.  **Date Handling**: Always use `format(date, 'yyyy-MM-dd')` from `date-fns` when comparing dates between the server and client to avoid timezone shift bugs.
4.  **Toast Notifications**: Use `react-hot-toast` for global notifications. Avoid the legacy [useToast](/client/src/hooks/use-toast.js#3-24) hook.

# Study Room Reservation API Documentation

This document provides a detailed specification for the Study Room Reservation System API.

## Core Concepts

### Authentication
- **Session-Based**: The API uses `express-session` with `passport.js` for authentication.
- **Roles**: 
    - `student`: Standard user, can view rooms and make reservations.
    - `admin`: Elevated access, can manage rooms and delete reservations.

### Base URL
- Local: `http://localhost:5000`

---

## 1. Authentication Endpoints

### Register User
`POST /api/register`
- **Access**: Public
- **Body**:
  ```json
  {
    "username": "johndoe",
    "password": "securepassword123",
    "role": "student"
  }
  ```
- **Success (201)**: Returns user object and sets session.

### Login
`POST /api/login`
- **Access**: Public
- **Body**:
  ```json
  {
    "username": "johndoe",
    "password": "securepassword123"
  }
  ```
- **Success (200)**: Returns user object and sets session.

### Logout
`POST /api/logout`
- **Access**: Public (requires active session)
- **Success (200)**: Clears session and cookie.

---

## 2. Reservation Endpoints

### Create Reservation
`POST /api/reserve`
- **Access**: Public
- **Body**:
  ```json
  {
    "studentName": "John Doe",
    "roomNumber": "101",
    "reservationDate": "2026-01-20T00:00:00.000Z"
  }
  ```
- **Success (201)**: Returns reservation object.
- **Error (400)**: Validation error or room already reserved for that date.

### Get Room Stats
`GET /api/rooms/:roomNumber/stats`
- **Access**: Public
- **Success (200)**:
  ```json
  {
    "roomNumber": "101",
    "totalReservations": 5,
    "abacusValue": 12,
    "reservedDates": ["2026-01-14T21:00:00.000Z", ...]
  }
  ```

### List Reservations (Admin Only)
`GET /api/reservations`
- **Access**: Admin Only
- **Success (200)**: Returns array of all reservations.

### Delete Reservation (Admin Only)
`DELETE /api/reserve/:id`
- **Access**: Admin Only
- **Success (204)**: No Content.

---

## 3. Room Management (Admin Only)

### List All Rooms
`GET /api/rooms`
- **Access**: Public
- **Success (200)**: Returns array of room objects.

### Create Room
`POST /api/rooms`
- **Access**: Admin Only
- **Body**:
  ```json
  {
    "roomNumber": "205"
  }
  ```

### Delete Room
`DELETE /api/rooms/:roomNumber`
- **Access**: Admin Only
- **Success (204)**: No Content.




========================================

Study Room Reservation System – Entity Relationship Diagram (ERD)

This section presents the Entity Relationship Diagram (ERD) for the Study Room Reservation System.
The ERD illustrates the logical structure of the database by defining the core entities, their attributes, and the relationships between them.
Schema Details & Constraints
Users Table

Purpose:
Stores authentication and authorization information for all system users, including students and administrators.

Constraints:

id: Primary key used as the unique identifier for each user.

username: Must be unique and not null to ensure unambiguous user identification.

password: Mandatory attribute required for authentication.

role: Restricted to predefined values (e.g., student, admin) through application logic or a database-level CHECK constraint.
Rooms Table

Purpose:
Maintains a registry of all available study rooms that can be reserved.

Constraints:

room_number: Serves as the primary key and uniquely identifies each room.

created_at: Automatically records the timestamp when a room entry is created.
Reservations Table

Purpose:
Records reservation transactions linking users to rooms on specific dates.

Relationships:

Many-to-One with User:
Each reservation is associated with exactly one user, while a user may have multiple reservations.

Many-to-One with Room:
Each reservation refers to exactly one room, while a room may appear in multiple reservations.

Proposed Integrity Constraints:

Foreign Key (room_number) REFERENCES Rooms(room_number):
Ensures that reservations can only be created for existing rooms.

UNIQUE (room_number, reservation_date):
Prevents multiple reservations for the same room on the same date at the database level.