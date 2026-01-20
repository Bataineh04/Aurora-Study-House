import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useReservations() {
  return useQuery({
    queryKey: [api.reservations.list.path],
    queryFn: async () => {
      const res = await fetch(api.reservations.list.path);
      if (!res.ok) throw new Error("Failed to fetch reservations");
      return await res.json();
    },
  });
}

export function useRoomStats(roomNumber) {
  return useQuery({
    queryKey: [api.reservations.getStats.path, roomNumber],
    queryFn: async () => {
      const url = buildUrl(api.reservations.getStats.path, { roomNumber });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch room stats");
      return await res.json();
    },
    // Refresh often to show live "popularity" from Abacus
    refetchInterval: 5000, 
  });
}

export function useCreateReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data) => {
      const res = await fetch(api.reservations.create.path, {
        method: api.reservations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        if (res.status === 400) {
           const error = await res.json();
           throw new Error(error.message);
        }
        throw new Error("Failed to create reservation");
      }
      return await res.json();
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.reservations.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.reservations.getStats.path, variables.roomNumber] });
    },
  });
}

export function useDeleteReservation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id) => {
      const url = buildUrl(api.reservations.delete.path, { id });
      const res = await fetch(url, { 
        method: api.reservations.delete.method 
      });
      
      if (!res.ok) {
         if (res.status === 404) {
             throw new Error("Reservation not found");
         }
         throw new Error("Failed to delete reservation");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.reservations.list.path] });
    },
  });
}
