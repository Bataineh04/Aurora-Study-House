import { validateReservationInput, validateUserInput } from "./schema.js"

export const errorSchemas = {
  validation: {
    message: "string",
    field: "string",
  },
  notFound: {
    message: "string",
  },
  internal: {
    message: "string",
  },
}

export const api = {
  auth: {
    register: {
      method: "POST",
      path: "/api/register",
      validate: validateUserInput,
      responses: {
        201: { id: "number", username: "string", role: "string" },
        400: errorSchemas.validation,
      },
    },
    login: {
      method: "POST",
      path: "/api/login",
      validate: (data) => {
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
          errors.push({ field: "password", message: "Password is required" })
        }
        return { isValid: errors.length === 0, errors }
      },
      responses: {
        200: { id: "number", username: "string", role: "string" },
        401: { message: "string" },
      },
    },
    logout: {
      method: "POST",
      path: "/api/logout",
      responses: {
        200: null,
      },
    },
    me: {
      method: "GET",
      path: "/api/user",
      responses: {
        200: { id: "number", username: "string", role: "string" },
      },
    },
  },
  reservations: {
    create: {
      method: "POST",
      path: "/api/reserve",
      validate: validateReservationInput,
      responses: {
        201: {
          id: "number",
          studentName: "string",
          roomNumber: "string",
          createdAt: "date",
        },
        400: errorSchemas.validation,
      },
    },
    delete: {
      method: "DELETE",
      path: "/api/reserve/:id",
      responses: {
        204: null,
        403: { message: "string" },
        404: errorSchemas.notFound,
      },
    },
    getStats: {
      method: "GET",
      path: "/api/rooms/:roomNumber/stats",
      responses: {
        200: {
          roomNumber: "string",
          totalReservations: "number",
          abacusValue: "number",
        },
      },
    },
    list: {
      method: "GET",
      path: "/api/reservations",
      responses: {
        200: "array",
        403: { message: "string" },
      },
    },
  },
  rooms: {
    list: {
      method: "GET",
      path: "/api/rooms",
      responses: {
        200: "array",
      },
    },
    create: {
      method: "POST",
      path: "/api/rooms",
      responses: {
        201: { room_number: "string", created_at: "date" },
        400: errorSchemas.validation,
        403: { message: "string" },
      },
    },
    update: {
      method: "PUT",
      path: "/api/rooms/:roomNumber",
      responses: {
        200: {
          room_number: "string",
          level: "string",
          name: "string",
          created_at: "date",
        },
        400: errorSchemas.validation,
        403: { message: "string" },
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: "DELETE",
      path: "/api/rooms/:roomNumber",
      responses: {
        204: null,
        403: { message: "string" },
        404: errorSchemas.notFound,
      },
    },
  },
}

export function buildUrl(path, params) {
  let url = path
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value))
      }
    })
  }
  return url
}
