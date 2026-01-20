import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "@shared/routes"
import { toast } from "react-hot-toast"

export function useUser() {
  return useQuery({
    queryKey: [api.auth.me.path],
    queryFn: async () => {
      const res = await fetch(api.auth.me.path, { credentials: "include" })
      if (!res.ok) {
        if (res.status === 401) return null
        throw new Error("Failed to fetch user")
      }
      return await res.json()
    },
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials) => {
      const res = await fetch(api.auth.login.path, {
        method: api.auth.login.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Login failed")
      }
      return await res.json()
    },
    onSuccess: (user) => {
      queryClient.setQueryData([api.auth.me.path], user)
      toast.success(`Welcome back, ${user.username}!`)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (credentials) => {
      const res = await fetch(api.auth.register.path, {
        method: api.auth.register.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(credentials),
        credentials: "include",
      })

      if (!res.ok) {
        if (res.status === 400) {
          const error = await res.json()
          throw new Error(error.message)
        }
        throw new Error("Registration failed")
      }
      return await res.json()
    },
    onSuccess: (user) => {
      queryClient.setQueryData([api.auth.me.path], user)
      toast.success("Account created successfully!")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.auth.logout.path, {
        method: api.auth.logout.method,
        credentials: "include",
      })
      if (!res.ok) throw new Error("Logout failed")
    },
    onSuccess: () => {
      queryClient.setQueryData([api.auth.me.path], null)
      toast.success("Logged out successfully")
    },
  })
}
