import { useState, useMemo, useEffect } from "react"
import { useReservations, useDeleteReservation } from "@/hooks/use-reservations"
import {
  useRooms,
  useCreateRoom,
  useDeleteRoom,
  useUpdateRoom,
} from "@/hooks/use-rooms"
import {
  Loader2,
  Trash2,
  Calendar,
  User,
  ShieldAlert,
  LogOut,
  Building,
  Search,
  Settings,
  Clock,
  MapPin,
  Plus,
  Edit,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { useUser, useLogout } from "@/hooks/use-auth"
import { useLocation } from "wouter"
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Chip,
  CircularProgress,
  Tabs,
  Tab,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment,
  Grid,
  useTheme,
  useMediaQuery,
  Avatar,
  Stack,
  Alert,
  AlertTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Container,
} from "@mui/material"
import { SearchBar } from "@/components/searchBar"
import { red, blue, grey, green } from "@mui/material/colors"

export default function Admin() {
  const {
    data: reservations,
    isLoading: reservationsLoading,
    error: reservationsError,
  } = useReservations()
  const { mutate: deleteReservation, isPending: isDeletingReservation } =
    useDeleteReservation()

  const { data: rooms, isLoading: roomsLoading } = useRooms()
  const { mutate: createRoom, isPending: isCreatingRoom } = useCreateRoom()
  const { mutate: updateRoom, isPending: isUpdatingRoom } = useUpdateRoom()
  const { mutate: deleteRoom, isPending: isDeletingRoom } = useDeleteRoom()

  const { data: user, isLoading: userLoading } = useUser()
  const [, setLocation] = useLocation()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const [mainTab, setMainTab] = useState(0) // 0: Reservations, 1: Rooms
  const [selectedFloor, setSelectedFloor] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [reservationToDelete, setReservationToDelete] = useState(null)

  const [addRoomNumber, setAddRoomNumber] = useState("")
  const [addRoomLevel, setAddRoomLevel] = useState("1")
  const [addRoomName, setAddRoomName] = useState("")

  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [roomToEdit, setRoomToEdit] = useState(null)
  const [editRoomNumber, setEditRoomNumber] = useState("")
  const [editRoomLevel, setEditRoomLevel] = useState("1")
  const [editRoomName, setEditRoomName] = useState("")

  useEffect(() => {
    if (!userLoading && (!user || user.role !== "admin")) {
      setLocation("/login")
    }
  }, [user, userLoading, setLocation])

  const getStudentName = (reservation) => {
    try {
      if (!reservation || typeof reservation !== "object") return "Unknown"
      const name = reservation.studentName || reservation.student_name
      if (typeof name !== "string") return "Unknown"
      const trimmed = name.trim()
      return trimmed.length > 0 ? trimmed : "Unknown"
    } catch {
      return "Unknown"
    }
  }

  const getRoomNumber = (reservation) => {
    if (!reservation) return "N/A"
    return reservation.roomNumber || reservation.room_number || "N/A"
  }

  const getReservationDate = (reservation) => {
    if (!reservation || !reservation.created_at) return "N/A"
    try {
      return format(new Date(reservation.created_at), "MMM d, yyyy h:mm a")
    } catch {
      return "Invalid Date"
    }
  }

  const filteredReservations = useMemo(() => {
    let result = reservations || []

    if (selectedFloor !== "all") {
      result = result.filter((reservation) => {
        const room = parseInt(getRoomNumber(reservation))
        if (selectedFloor === "floor1") return room >= 101 && room <= 199
        if (selectedFloor === "floor2") return room >= 201 && room <= 299
        if (selectedFloor === "floor3") return room >= 301 && room <= 399
        return true
      })
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        (reservation) =>
          getStudentName(reservation).toLowerCase().includes(term) ||
          String(getRoomNumber(reservation)).toLowerCase().includes(term)
      )
    }

    return result
  }, [reservations, selectedFloor, searchTerm])

  const stats = useMemo(() => {
    const all = reservations || []
    const now = new Date()
    const last24h = all.filter((r) => {
      const created = new Date(r.created_at || r.createdAt)
      return now - created < 24 * 60 * 60 * 1000
    }).length

    const activeRooms = new Set(all.map((r) => getRoomNumber(r))).size
    const totalRooms = rooms?.length || 0

    return {
      total: all.length,
      last24h,
      activeRooms,
      totalRooms,
    }
  }, [reservations, rooms])

  const handleDeleteClick = (reservation) => {
    setReservationToDelete(reservation)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = () => {
    if (reservationToDelete) {
      deleteReservation(reservationToDelete.id, {
        onSuccess: () => {
          toast.success("Reservation Cancelled")
          setDeleteDialogOpen(false)
          setReservationToDelete(null)
        },
      })
    }
  }

  const handleAddRoom = (e) => {
    e.preventDefault()
    if (!addRoomNumber.trim()) return
    createRoom(
      { roomNumber: addRoomNumber, level: addRoomLevel, name: addRoomName },
      {
        onSuccess: () => {
          setAddRoomNumber("")
          setAddRoomLevel("1")
          setAddRoomName("")
        },
      }
    )
  }

  const handleEditClick = (room) => {
    setRoomToEdit(room)
    setEditRoomNumber(room.room_number)
    setEditRoomLevel(room.level || "1")
    setEditRoomName(room.name || "")
    setEditDialogOpen(true)
  }

  const handleEditSave = () => {
    if (roomToEdit) {
      // If room number changed, we need to delete and recreate (since it's primary key)
      // For now, just update level and name
      updateRoom(
        {
          roomNumber: roomToEdit.room_number,
          updates: { level: editRoomLevel, name: editRoomName || null },
        },
        {
          onSuccess: () => {
            setEditDialogOpen(false)
            setRoomToEdit(null)
          },
        }
      )
    }
  }

  if (userLoading || reservationsLoading || roomsLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <CircularProgress size={60} thickness={4} />
      </Box>
    )
  }

  if (!user || user.role !== "admin") return null

  return (
    <div className="min-h-[calc(100vh-128px)] bg-transparent relative overflow-hidden py-8 px-4 md:px-8">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-10 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-10 w-96 h-96 bg-indigo-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-20 left-20 w-96 h-96 bg-sky-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <Container maxWidth="xl" className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-gradient">
            Aurora Admin
          </h1>
          <Typography
            variant="body2"
            className="text-muted-foreground font-medium max-w-xl !mx-auto leading-relaxed mt-1"
          >
            Study Room Cafe command center for resource management and
            reservation oversight.
          </Typography>
          <Box className="h-1 w-24 bg-accent mx-auto rounded-full shadow-sm mt-3" />
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            {
              label: "Total Reservations",
              val: stats.total,
              sub: "All time",
              color: "#61b38a",
              icon: Calendar,
            },
            {
              label: "Daily Peak",
              val: stats.last24h,
              sub: "Last 24h",
              color: "#86c5a6",
              icon: Clock,
            },
            {
              label: "Active Spaces",
              val: stats.activeRooms,
              sub: "Live now",
              color: "#99c8ce",
              icon: MapPin,
            },
            {
              label: "Total Capacity",
              val: stats.totalRooms,
              sub: "Configured",
              color: "#61a9b3",
              icon: Building,
            },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -3 }}
              className="relative"
            >
              <div
                className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 relative overflow-hidden group shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
                style={{
                  borderLeft: i % 2 === 0 ? `4px solid ${item.color}` : "none",
                  borderRight: i % 2 !== 0 ? `4px solid ${item.color}` : "none",
                }}
              >
                <div className="relative z-10">
                  <p className="font-black tracking-[0.2em] text-gray-400 text-[0.65rem] uppercase mb-1">
                    {item.label}
                  </p>
                  <div className="flex items-baseline gap-2">
                    <h4
                      className="text-4xl font-black tracking-tight"
                      style={{ color: item.color }}
                    >
                      {item.val}
                    </h4>
                  </div>
                  <p className="font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1 text-[0.6rem] mt-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    {item.sub}
                  </p>
                </div>
                <item.icon className="absolute -right-3 -bottom-3 h-20 w-20 opacity-[0.05] text-gray-900 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700" />
              </div>
            </motion.div>
          ))}
        </div>

        <Paper
          elevation={0}
          className="bg-white/95 backdrop-blur-sm rounded-[2rem] overflow-hidden shadow-xl border border-gray-100"
        >
          {/* Dashboard Header Section */}
          <Box className="premium-gradient p-5 text-white relative overflow-hidden">
            <Box className="relative z-10">
              <Typography variant="h5" className="font-serif font-bold mb-0.5">
                Resource Control Center
              </Typography>
              <Typography className="text-white/80 text-[10px] font-medium tracking-wide uppercase">
                System Oversight & Administration
              </Typography>
            </Box>
            <ShieldAlert className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10 rotate-12" />
          </Box>

          <Box className="p-1.5 bg-white/30 backdrop-blur-md border-b border-white/20">
            <Tabs
              value={mainTab}
              onChange={(e, newValue) => setMainTab(newValue)}
              variant="fullWidth"
              sx={{
                "& .MuiTab-root": {
                  py: 1.5,
                  fontSize: "0.75rem",
                  fontWeight: 900,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "text.secondary",
                  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
                  borderRadius: "1rem",
                  mx: 0.5,
                  minHeight: "44px",
                  "&:hover": {
                    bgcolor: "white/50",
                    transform: "translateY(-1px)",
                  },
                },
                "& .Mui-selected": {
                  color: "primary.main !important",
                  bgcolor: "white !important",
                  boxShadow: "0 10px 20px -5px rgba(0,0,0,0.05)",
                },
                "& .MuiTabs-indicator": {
                  display: "none",
                },
              }}
            >
              <Tab
                label="RESERVATIONS"
                icon={<Calendar size={18} />}
                iconPosition="start"
              />
              <Tab
                label="SPACE INVENTORY"
                icon={<Building size={18} />}
                iconPosition="start"
              />
            </Tabs>
          </Box>

          <Box p={{ xs: 3, md: 4 }}>
            {mainTab === 0 ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Grid container spacing={2} sx={{ mb: 4 }} alignItems="center">
                  <Grid item xs={12} md={7}>
                    <SearchBar
                      placeholder="Search bookings..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={12} md={5}>
                    <FormControl fullWidth size="small">
                      <Select
                        value={selectedFloor}
                        onChange={(e) => setSelectedFloor(e.target.value)}
                        sx={{
                          borderRadius: "0.75rem",
                          bgcolor: "rgba(255,255,255,0.5)",
                          "& .MuiOutlinedInput-notchedOutline": {
                            border: "none",
                          },
                          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                        }}
                      >
                        <MenuItem value="all">All Levels</MenuItem>
                        <MenuItem value="floor1">Floor 1</MenuItem>
                        <MenuItem value="floor2">Floor 2</MenuItem>
                        <MenuItem value="floor3">Floor 3</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Paper
                  elevation={0}
                  className="overflow-hidden border border-black/5 bg-white/40"
                  sx={{ borderRadius: "1.5rem" }}
                >
                  <Table size="small">
                    <TableHead
                      sx={{
                        bgcolor: "slate.50",
                        borderBottom: "1px solid rgba(0,0,0,0.03)",
                      }}
                    >
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "slate.500",
                            py: 2,
                            pl: 3,
                            fontSize: "0.7rem",
                          }}
                        >
                          STUDENT
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "slate.500",
                            fontSize: "0.7rem",
                          }}
                        >
                          SPACE
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "slate.500",
                            fontSize: "0.7rem",
                          }}
                        >
                          RESERVATION DATE
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "slate.500",
                            fontSize: "0.7rem",
                          }}
                        >
                          CREATED
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "slate.500",
                            pr: 3,
                            fontSize: "0.7rem",
                          }}
                        >
                          ACTIONS
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredReservations.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 12 }}>
                            <Box
                              display="flex"
                              flexDirection="column"
                              alignItems="center"
                              gap={2}
                              opacity={0.3}
                            >
                              <Search size={60} />
                              <Typography variant="h6" fontWeight="bold">
                                No Activity Records Found
                              </Typography>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredReservations.map((reservation) => (
                          <TableRow
                            key={reservation.id}
                            sx={{
                              "&:nth-of-type(odd)": { bgcolor: "action.hover" },
                              "&:hover": { bgcolor: "grey.50" },
                              transition: "background-color 0.2s",
                            }}
                          >
                            <TableCell sx={{ pl: 3 }}>
                              <Stack
                                direction="row"
                                spacing={2}
                                alignItems="center"
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: "primary.main",
                                    width: 32,
                                    height: 32,
                                    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
                                    fontSize: "0.9rem",
                                    fontWeight: 900,
                                  }}
                                >
                                  {getStudentName(
                                    reservation
                                  )[0]?.toUpperCase() || "?"}
                                </Avatar>
                                <Typography className="font-bold text-slate-800 text-sm">
                                  {getStudentName(reservation)}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`ROOM ${getRoomNumber(reservation)}`}
                                className="font-black text-[10px]"
                                variant="outlined"
                                sx={{
                                  borderRadius: "8px",
                                  border: "2px solid",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="body2"
                                className="text-muted-foreground font-medium"
                              >
                                {reservation.reservation_date
                                  ? format(
                                      new Date(reservation.reservation_date),
                                      "MMM d, yyyy"
                                    )
                                  : "N/A"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="caption"
                                className="text-muted-foreground"
                              >
                                {getReservationDate(reservation)}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <IconButton
                                sx={{
                                  bgcolor: "error.main",
                                  color: "white",
                                  "&:hover": {
                                    bgcolor: "error.dark",
                                    transform: "scale(1.1)",
                                  },
                                  transition: "all 0.2s",
                                }}
                                onClick={() => handleDeleteClick(reservation)}
                                disabled={isDeletingReservation}
                              >
                                <Trash2 size={18} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Paper>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Box
                  mb={4}
                  className="bg-white/95 backdrop-blur-sm p-6 rounded-[1.5rem] border border-gray-100 shadow-md"
                >
                  <Typography
                    variant="h6"
                    className="font-serif font-black mb-0.5"
                  >
                    Initialize New Resource
                  </Typography>
                  <Typography
                    variant="caption"
                    className="text-muted-foreground mb-4 font-medium block"
                  >
                    Add a physical room or study space to the database.
                  </Typography>
                  <form onSubmit={handleAddRoom}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Room Number"
                          placeholder="e.g. 104"
                          value={addRoomNumber}
                          onChange={(e) => setAddRoomNumber(e.target.value)}
                          variant="outlined"
                          required
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "0.75rem",
                              bgcolor: "white/60",
                              "& fieldset": {
                                border: "1px solid rgba(0,0,0,0.05)",
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Room Name (Optional)"
                          placeholder="e.g. Quiet Corner"
                          value={addRoomName}
                          onChange={(e) => setAddRoomName(e.target.value)}
                          variant="outlined"
                          sx={{
                            "& .MuiOutlinedInput-root": {
                              borderRadius: "0.75rem",
                              bgcolor: "white/60",
                              "& fieldset": {
                                border: "1px solid rgba(0,0,0,0.05)",
                              },
                            },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <FormControl fullWidth size="small">
                          <InputLabel sx={{ fontSize: "0.8rem" }}>
                            Level
                          </InputLabel>
                          <Select
                            value={addRoomLevel}
                            onChange={(e) => setAddRoomLevel(e.target.value)}
                            label="Level"
                            sx={{
                              borderRadius: "0.75rem",
                              bgcolor: "white/60",
                              "& fieldset": {
                                border: "1px solid rgba(0,0,0,0.05)",
                              },
                            }}
                          >
                            <MenuItem value="1">1</MenuItem>
                            <MenuItem value="2">2</MenuItem>
                            <MenuItem value="3">3</MenuItem>
                            <MenuItem value="4">4</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          sx={{
                            height: "40px",
                            borderRadius: "0.75rem",
                            fontWeight: 900,
                            letterSpacing: "0.05em",
                            background:
                              "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
                            boxShadow: "0 4px 12px -2px rgba(0,0,0,0.2)",
                            fontSize: "0.75rem",
                          }}
                          startIcon={
                            isCreatingRoom ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <Plus size={16} />
                            )
                          }
                          disabled={isCreatingRoom}
                        >
                          DEPLOY
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Box>

                <Typography
                  variant="h6"
                  className="font-serif font-black mb-3 ml-2"
                >
                  Inventory Catalogue
                </Typography>
                <Paper
                  elevation={0}
                  className="overflow-hidden border border-black/5 bg-white/40"
                  sx={{ borderRadius: "1.5rem" }}
                >
                  <Table size="small">
                    <TableHead
                      sx={{
                        bgcolor: "slate.50",
                        borderBottom: "1px solid rgba(0,0,0,0.03)",
                      }}
                    >
                      <TableRow>
                        <TableCell
                          sx={{
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "slate.500",
                            py: 2,
                            pl: 3,
                            fontSize: "0.7rem",
                          }}
                        >
                          IDENTIFIER
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "slate.500",
                            fontSize: "0.7rem",
                          }}
                        >
                          FLOOR LEVEL
                        </TableCell>
                        <TableCell
                          sx={{
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "slate.500",
                            fontSize: "0.7rem",
                          }}
                        >
                          CREATED
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            fontWeight: 900,
                            textTransform: "uppercase",
                            letterSpacing: "0.1em",
                            color: "slate.500",
                            pr: 3,
                            fontSize: "0.7rem",
                          }}
                        >
                          ACTIONS
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {rooms?.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} align="center" sx={{ py: 12 }}>
                            <Typography color="textSecondary" fontWeight="bold">
                              Space Inventory Empty
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ) : (
                        rooms?.map((room) => (
                          <TableRow
                            key={room.room_number}
                            sx={{
                              "&:nth-of-type(odd)": { bgcolor: "action.hover" },
                              "&:hover": { bgcolor: "grey.50" },
                              transition: "background-color 0.2s",
                            }}
                          >
                            <TableCell sx={{ pl: 3 }}>
                              <Box display="flex" alignItems="center" gap={1.5}>
                                <Box className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Building
                                    size={16}
                                    className="text-primary"
                                  />
                                </Box>
                                <Typography className="font-black text-primary text-sm">
                                  ROOM {room.room_number}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>
                              <Chip
                                label={`LEVEL ${room.level || "1"}`}
                                size="small"
                                sx={{
                                  fontWeight: 900,
                                  fontSize: "0.6rem",
                                  borderRadius: "6px",
                                  bgcolor: "primary.light",
                                  color: "primary.main",
                                }}
                              />
                            </TableCell>
                            <TableCell>
                              <Typography
                                variant="caption"
                                className="text-muted-foreground"
                              >
                                {room.created_at
                                  ? format(
                                      new Date(room.created_at),
                                      "MMM d, yyyy"
                                    )
                                  : "Seed"}
                              </Typography>
                            </TableCell>
                            <TableCell align="right">
                              <Stack
                                direction="row"
                                spacing={1}
                                justifyContent="flex-end"
                              >
                                <IconButton
                                  sx={{
                                    border: "2px solid",
                                    borderColor: "primary.main",
                                    color: "primary.main",
                                    "&:hover": {
                                      bgcolor: "primary.main",
                                      color: "white",
                                    },
                                    transition: "all 0.2s",
                                  }}
                                  onClick={() => handleEditClick(room)}
                                  disabled={isUpdatingRoom}
                                >
                                  <Edit size={18} />
                                </IconButton>
                                <IconButton
                                  sx={{
                                    bgcolor: "error.main",
                                    color: "white",
                                    "&:hover": {
                                      bgcolor: "error.dark",
                                      transform: "scale(1.1)",
                                    },
                                    transition: "all 0.2s",
                                  }}
                                  onClick={() => deleteRoom(room.room_number)}
                                  disabled={isDeletingRoom}
                                >
                                  <Trash2 size={18} />
                                </IconButton>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </Paper>
              </motion.div>
            )}
          </Box>
        </Paper>
      </Container>

      {/* Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: "2rem", p: 2 } }}
      >
        <DialogTitle className="font-serif font-black text-2xl">
          Security Verification
        </DialogTitle>
        <DialogContent>
          <Typography className="text-muted-foreground py-2 font-medium">
            Are you absolutely sure you wish to terminate the reservation for{" "}
            <strong className="text-primary">
              {reservationToDelete && getStudentName(reservationToDelete)}
            </strong>{" "}
            in Room{" "}
            <strong className="text-primary">
              {reservationToDelete && getRoomNumber(reservationToDelete)}
            </strong>
            ?
          </Typography>
          <Alert severity="warning" sx={{ mt: 2, borderRadius: "1rem" }}>
            This action is irreversible and will immediately free up the
            resource.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setDeleteDialogOpen(false)}
            sx={{ fontWeight: "bold", color: "slate.500" }}
          >
            DISMISS
          </Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            sx={{ borderRadius: "1rem", fontWeight: 900, px: 4 }}
          >
            CONFIRM TERMINATION
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Room Dialog */}
      <Dialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        PaperProps={{ sx: { borderRadius: "2rem", p: 2, minWidth: "400px" } }}
      >
        <DialogTitle className="font-serif font-black text-2xl">
          Edit Room Details
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" className="text-muted-foreground mb-4">
            Update room details
          </Typography>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Room Number"
              value={editRoomNumber}
              onChange={(e) => setEditRoomNumber(e.target.value)}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "0.75rem",
                },
              }}
            />
            <TextField
              fullWidth
              label="Room Name (Optional)"
              placeholder="e.g. Quiet Corner, Team Space"
              value={editRoomName}
              onChange={(e) => setEditRoomName(e.target.value)}
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "0.75rem",
                },
              }}
            />
            <FormControl fullWidth>
              <InputLabel>Floor Level</InputLabel>
              <Select
                value={editRoomLevel}
                onChange={(e) => setEditRoomLevel(e.target.value)}
                label="Floor Level"
                sx={{ borderRadius: "0.75rem" }}
              >
                <MenuItem value="1">Level 1</MenuItem>
                <MenuItem value="2">Level 2</MenuItem>
                <MenuItem value="3">Level 3</MenuItem>
                <MenuItem value="4">Level 4</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button
            onClick={() => setEditDialogOpen(false)}
            sx={{ fontWeight: "bold", color: "slate.500" }}
          >
            CANCEL
          </Button>
          <Button
            onClick={handleEditSave}
            color="primary"
            variant="contained"
            sx={{ borderRadius: "1rem", fontWeight: 900, px: 4 }}
            disabled={isUpdatingRoom}
          >
            {isUpdatingRoom ? "SAVING..." : "SAVE CHANGES"}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}
