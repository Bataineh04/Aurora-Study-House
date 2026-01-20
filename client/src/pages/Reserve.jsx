import { useState, useEffect } from "react"
import { useCreateReservation, useRoomStats } from "@/hooks/use-reservations"
import { useRooms } from "@/hooks/use-rooms"
import { useUser } from "@/hooks/use-auth"
import { useLocation } from "wouter"
import {
  CheckCircle,
  AlertCircle,
  Loader2,
  Users,
  CalendarClock,
} from "lucide-react"
import { motion } from "framer-motion"
import { toast } from "react-hot-toast"
import {
  TextField,
  Button,
  Grid,
  Box,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
} from "@mui/material"
import { Calendar } from "@/components/ui/calendar"

export default function Reserve() {
  const { data: user } = useUser()
  const { data: rooms, isLoading: roomsLoading } = useRooms()
  const [studentName, setStudentName] = useState("")
  const [roomNumber, setRoomNumber] = useState("")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { mutate, isPending } = useCreateReservation()

  const { data: roomStats } = useRoomStats(roomNumber)
  const reservedDates = roomStats?.reservedDates || []

  const [, setLocation] = useLocation()

  useEffect(() => {
    if (user) {
      setStudentName(user.username)
    }
  }, [user])

  useEffect(() => {
    if (rooms && rooms.length > 0 && !roomNumber) {
      setRoomNumber(rooms[0].room_number)
    }
  }, [rooms, roomNumber])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!studentName.trim() || !roomNumber) return

    mutate(
      { studentName, roomNumber, reservationDate: selectedDate },
      {
        onSuccess: () => {
          toast.success("Reservation Confirmed")
          setLocation("/status")
        },
        onError: (err) => {
          toast.error(err.message || "Booking Failed")
        },
      }
    )
  }

  if (roomsLoading) {
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
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-transparent relative overflow-hidden py-12 px-4">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-10 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-20 left-20 w-96 h-96 bg-sky-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-xl z-10 flex flex-col gap-6"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-gradient">
            Aurora
          </h1>
          <div className="h-1 w-24 bg-accent mx-auto rounded-full shadow-sm" />
        </div>

        <Paper
          elevation={0}
          className="glass-card rounded-[2rem] overflow-hidden shadow-2xl border-none"
        >
          <Box className="premium-gradient p-5 text-white relative overflow-hidden">
            <Box className="relative z-10">
              <Typography variant="h5" className="font-serif font-bold mb-0.5">
                Make a Reservation
              </Typography>
              <Typography className="text-white/80 text-xs font-medium">
                Simple. Secure. Scholarly.
              </Typography>
            </Box>
            <CalendarClock className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10 rotate-12" />
          </Box>

          <Box p={{ xs: 3, md: 4 }}>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="overline"
                    className="text-primary font-black tracking-widest block mb-1 ml-1"
                  >
                    Identification
                  </Typography>
                  <TextField
                    fullWidth
                    placeholder="Enter Full Name"
                    value={studentName}
                    onChange={(e) => setStudentName(e.target.value)}
                    required
                    disabled={!!user}
                    variant="outlined"
                    InputProps={{
                      startAdornment: (
                        <Users className="h-5 w-5 text-muted-foreground mr-3" />
                      ),
                      sx: {
                        borderRadius: "1rem",
                        backgroundColor: "rgba(255,255,255,0.5)",
                        "&:hover": { backgroundColor: "white" },
                        transition: "all 0.3s ease",
                      },
                    }}
                    helperText={user ? `Verified as ${user.username}` : ""}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography
                    variant="overline"
                    className="text-primary font-black tracking-widest block mb-1 ml-1"
                  >
                    Study Space
                  </Typography>
                  <FormControl
                    fullWidth
                    disabled={!rooms || rooms.length === 0}
                  >
                    <Select
                      value={roomNumber}
                      onChange={(e) => setRoomNumber(e.target.value)}
                      displayEmpty
                      variant="outlined"
                      sx={{
                        borderRadius: "1rem",
                        backgroundColor: "rgba(255,255,255,0.5)",
                        "&:hover": { backgroundColor: "white" },
                        transition: "all 0.3s ease",
                      }}
                      startAdornment={
                        <CalendarClock className="h-5 w-5 text-muted-foreground mr-3" />
                      }
                    >
                      {rooms?.map((room) => (
                        <MenuItem
                          key={room.room_number}
                          value={room.room_number}
                        >
                          Room {room.room_number} (Level {room.level || "1"})
                        </MenuItem>
                      ))}
                      {(!rooms || rooms.length === 0) && (
                        <MenuItem disabled>No Rooms Available</MenuItem>
                      )}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12}>
                  <Typography
                    variant="overline"
                    className="text-primary font-black tracking-widest block mb-1 ml-1"
                  >
                    Reservation Date
                  </Typography>
                  <Calendar
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabledDates={reservedDates}
                  />
                </Grid>

                <Grid item xs={12}>
                  <Box mt={2} pt={4} borderTop="1px solid rgba(0,0,0,0.05)">
                    <Button
                      type="submit"
                      variant="contained"
                      fullWidth
                      disabled={isPending || !studentName || !roomNumber}
                      sx={{
                        height: "3.5rem",
                        borderRadius: "1.25rem",
                        fontSize: "1.125rem",
                        fontWeight: "bold",
                        textTransform: "none",
                        background:
                          "linear-gradient(135deg, hsl(var(--primary)) 0%, #4a90e2 100%)",
                        boxShadow: "0 10px 25px -5px rgba(30, 58, 138, 0.4)",
                        "&:hover": {
                          opacity: 0.95,
                          transform: "scale(1.01)",
                        },
                        "&:active": {
                          transform: "scale(0.99)",
                        },
                        transition: "all 0.2s ease-in-out",
                      }}
                      startIcon={
                        !isPending && <CheckCircle className="h-6 w-6" />
                      }
                    >
                      {isPending ? (
                        <CircularProgress size={28} color="inherit" />
                      ) : (
                        "Confirm Reservation"
                      )}
                    </Button>
                  </Box>

                  <Box mt={4} textAlign="center">
                    <Typography
                      variant="caption"
                      className="text-slate-400 font-medium italic"
                    >
                      "Dedicated to academic excellence through quiet study."
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </form>
          </Box>
        </Paper>
      </motion.div>
    </div>
  )
}
