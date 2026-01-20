import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api, buildUrl } from "@shared/routes"
import { toast } from "react-hot-toast"

export function useRooms() {
  return useQuery({
    queryKey: [api.rooms.list.path],
    queryFn: async () => {
      const res = await fetch(api.rooms.list.path)
      if (!res.ok) throw new Error("Failed to fetch rooms")
      return await res.json()
    },
  })
}

export function useCreateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ roomNumber, level, name }) => {
      const res = await fetch(api.rooms.create.path, {
        method: api.rooms.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomNumber, level, name }),
        credentials: "include",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to create room")
      }
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.rooms.list.path] })
      toast.success("Room added")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ roomNumber, updates }) => {
      const url = buildUrl(api.rooms.update.path, { roomNumber })
      const res = await fetch(url, {
        method: api.rooms.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
        credentials: "include",
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || "Failed to update room")
      }
      return await res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.rooms.list.path] })
      toast.success("Room updated")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteRoom() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (roomNumber) => {
      const url = buildUrl(api.rooms.delete.path, { roomNumber })
      const res = await fetch(url, {
        method: api.rooms.delete.method,
        credentials: "include",
      })
      if (!res.ok) throw new Error("Failed to delete room")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.rooms.list.path] })
      toast.success("Room deleted")
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })
}
