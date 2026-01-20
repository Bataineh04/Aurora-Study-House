import { StatsCard } from "@/components/StatsCard"
import { useRooms } from "@/hooks/use-rooms"
import { motion } from "framer-motion"
import {
  Grid,
  Typography,
  Container,
  Box,
  CircularProgress,
} from "@mui/material"

export default function Status() {
  const { data: rooms, isLoading } = useRooms()

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <div className="min-h-[calc(100vh-128px)] bg-transparent relative overflow-hidden py-12 px-4 md:px-8">
      <div className="absolute top-0 -left-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob" />
      <div className="absolute -bottom-20 right-0 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000" />

      <Container maxWidth="xl" className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 text-center"
        >
          <h1 className="text-4xl md:text-6xl font-serif font-black tracking-tighter text-gradient mb-4">
            Room Status & Analytics
          </h1>
          <Typography
            variant="h6"
            className="text-muted-foreground font-medium max-w-2xl !mx-auto"
          >
            Real-time insights and popularity metrics for all Aurora study
            rooms.
          </Typography>
          <Box className="h-1.5 w-32 bg-accent mx-auto rounded-full shadow-sm mt-4" />
        </motion.div>

        {isLoading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="300px"
          >
            <CircularProgress size={60} thickness={4} />
          </Box>
        ) : (
          <Box>
            {Object.entries(
              rooms?.reduce((acc, room) => {
                const level = room.level || "1"
                if (!acc[level]) acc[level] = []
                acc[level].push(room)
                return acc
              }, {}) || {}
            )
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([level, levelRooms]) => (
                <Box key={level} mb={8}>
                  <Box display="flex" alignItems="center" gap={2} mb={4}>
                    <Typography
                      variant="h5"
                      className="font-serif font-black text-primary"
                    >
                      Level {level}
                    </Typography>
                    <Box className="h-0.5 flex-1 bg-primary/10 rounded-full" />
                  </Box>
                  <Grid container spacing={4}>
                    {levelRooms.map((room, index) => (
                      <Grid
                        item
                        xs={12}
                        sm={6}
                        md={4}
                        lg={3}
                        key={room.room_number}
                      >
                        <motion.div
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05 }}
                          className="h-full"
                        >
                          <StatsCard roomNumber={room.room_number} />
                        </motion.div>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))}
            {(!rooms || rooms.length === 0) && (
              <Grid item xs={12}>
                <Paper className="glass-card p-12 text-center rounded-[2rem]">
                  <Typography variant="h6" color="textSecondary">
                    No rooms currently configured in the system.
                  </Typography>
                </Paper>
              </Grid>
            )}
          </Box>
        )}
      </Container>
    </div>
  )
}
