import { useRoomStats } from "@/hooks/use-reservations"
import { Users, TrendingUp, Loader2 } from "lucide-react"
import { motion } from "framer-motion"
import { Typography, Box, Paper } from "@mui/material"

export function StatsCard({ roomNumber }) {
  const { data: stats, isLoading, error } = useRoomStats(roomNumber)

  if (isLoading) {
    return (
      <Paper className="glass-card rounded-[2rem] p-6 shadow-xl border-none h-full flex items-center justify-center min-h-[220px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary/50" />
      </Paper>
    )
  }

  if (error || !stats) {
    return (
      <Paper className="bg-destructive/5 rounded-[2rem] p-6 border border-destructive/20 h-full min-h-[220px] flex items-center justify-center">
        <Typography color="error" className="font-bold text-center">
          Unable to load stats for Room {roomNumber}
        </Typography>
      </Paper>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.4 }}
      className="h-full"
    >
      <Paper
        elevation={0}
        className="glass-card rounded-[2rem] shadow-xl border-none overflow-hidden h-full flex flex-col group transition-all duration-300 hover:shadow-2xl"
      >
        <Box className="p-8 pb-4">
          <Box
            display="flex"
            justifyContent="between"
            alignItems="start"
            className="mb-6"
          >
            <Box flex={1}>
              <Typography
                variant="h4"
                className="font-serif font-black text-primary mb-1"
              >
                Room {stats.roomNumber}
              </Typography>
              <Typography
                variant="body2"
                className="text-muted-foreground font-bold uppercase tracking-widest text-[10px]"
              >
                Level {stats.level || "1"} • Aurora Study Room
              </Typography>
            </Box>
            <Box className="h-12 w-12 rounded-2xl premium-gradient flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Users className="h-6 w-6 text-white" />
            </Box>
          </Box>

          <Box className="grid grid-cols-2 gap-4 mt-auto">
            <Box className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100/50">
              <Typography
                variant="overline"
                className="text-muted-foreground font-black tracking-tighter block leading-none mb-2"
              >
                Active Bookings
              </Typography>
              <Box display="flex" alignItems="baseline" gap={1}>
                <Typography variant="h5" className="font-bold text-slate-800">
                  {stats.totalReservations}
                </Typography>
                <Typography
                  variant="caption"
                  className="text-slate-400 font-bold uppercase"
                >
                  Live
                </Typography>
              </Box>
            </Box>

            <Box className="bg-accent/5 rounded-2xl p-4 border border-accent/20">
              <Box display="flex" alignItems="center" gap={1} mb={2}>
                <TrendingUp className="h-4 w-4 text-accent" />
                <Typography
                  variant="overline"
                  className="text-accent font-black tracking-tighter block leading-none"
                >
                  Popularity
                </Typography>
              </Box>
              <Box display="flex" alignItems="baseline" gap={1}>
                <Typography variant="h5" className="font-bold text-primary">
                  {stats.abacusValue}
                </Typography>
                <Typography
                  variant="caption"
                  className="text-primary/60 font-bold uppercase"
                >
                  Hits
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Box className="mt-auto px-8 py-4 bg-primary/5 border-t border-primary/5">
          <Typography
            variant="caption"
            className="text-primary/60 font-bold uppercase tracking-[0.2em] block text-center"
          >
            Space Verified
          </Typography>
        </Box>
      </Paper>
    </motion.div>
  )
}
