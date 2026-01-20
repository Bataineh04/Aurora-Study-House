import { useState } from "react"
import { useLogin, useUser } from "@/hooks/use-auth"
import { useLocation } from "wouter"
import {
  Button,
  TextField,
  Card,
  CardContent,
  Typography,
  Box,
  CircularProgress,
  InputAdornment,
} from "@mui/material"
import { motion } from "framer-motion"
import { Loader2, Lock, User } from "lucide-react"

export default function Login() {
  const loginMutation = useLogin()
  const [, setLocation] = useLocation()
  const { data: user } = useUser()

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })

  // If user is already logged in, redirect them
  if (user) {
    if (user.role === "admin") {
      setLocation("/admin")
    } else {
      setLocation("/")
    }
    return null
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    loginMutation.mutate(formData, {
      onSuccess: (userData) => {
        if (userData.role === "admin") {
          setLocation("/admin")
        } else {
          setLocation("/")
        }
      },
      onError: (error) => {
        console.error("Login failed:", error)
      },
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-transparent relative overflow-hidden py-12 px-4">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000" />

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10 flex flex-col gap-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-primary drop-shadow-sm">
            Student Login
          </h1>
          <div className="h-1.5 w-24 bg-accent mx-auto rounded-full shadow-sm" />
        </div>

        <Card className="glass-card shadow-2xl rounded-[2rem] border-none overflow-hidden">
          <Box className="premium-gradient p-8 text-center text-white border-b border-white/10">
            <Box className="mx-auto flex items-center justify-center w-16 h-16 bg-white/20 rounded-2xl shadow-inner mb-4 transform -rotate-3">
              <Lock className="h-8 w-8 text-white" />
            </Box>
            <Typography
              variant="h5"
              className="font-serif font-bold tracking-tight"
            >
              Welcome Back
            </Typography>
            <Typography className="text-white/70 text-sm font-medium">
              Access your Aurora account
            </Typography>
          </Box>

          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <Box className="space-y-2">
                <Typography
                  variant="overline"
                  className="text-primary font-black tracking-widest block mb-1 ml-1"
                >
                  Username
                </Typography>
                <TextField
                  fullWidth
                  name="username"
                  placeholder="Enter your username"
                  value={formData.username}
                  onChange={handleChange}
                  variant="outlined"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <User className="h-5 w-5 text-muted-foreground mr-1" />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: "1rem",
                      backgroundColor: "rgba(255,255,255,0.5)",
                      transition: "all 0.3s ease",
                      "&:hover": { backgroundColor: "white" },
                    },
                  }}
                />
              </Box>

              <Box className="space-y-2">
                <Typography
                  variant="overline"
                  className="text-primary font-black tracking-widest block mb-1 ml-1"
                >
                  Password
                </Typography>
                <TextField
                  fullWidth
                  name="password"
                  type="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  variant="outlined"
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock className="h-5 w-5 text-muted-foreground mr-1" />
                      </InputAdornment>
                    ),
                    sx: {
                      borderRadius: "1rem",
                      backgroundColor: "rgba(255,255,255,0.5)",
                      transition: "all 0.3s ease",
                      "&:hover": { backgroundColor: "white" },
                    },
                  }}
                />
              </Box>

              <Button
                type="submit"
                fullWidth
                variant="contained"
                className="h-14 premium-gradient text-white font-bold text-lg rounded-2xl shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                disabled={loginMutation.isPending}
                sx={{ textTransform: "none" }}
              >
                {loginMutation.isPending ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </form>

            <Box mt={6} textAlign="center">
              <Typography
                variant="body2"
                color="textSecondary"
                className="flex items-center justify-center gap-2"
              >
                Don't have an account?
                <Button
                  onClick={() => setLocation("/register")}
                  sx={{
                    textTransform: "none",
                    fontWeight: "bold",
                    p: 0,
                    minWidth: "auto",
                  }}
                >
                  Register here
                </Button>
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
