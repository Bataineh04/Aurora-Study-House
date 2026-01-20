import { useState, useEffect } from "react"
import { useLogin, useRegister, useUser } from "@/hooks/use-auth"
import { useQuery } from "@tanstack/react-query"
import { useLocation } from "wouter"
import { motion } from "framer-motion"
import {
  Button,
  Card,
  CardContent,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
} from "@mui/material"
import { Loader2, User, Lock, ArrowLeft } from "lucide-react"

export default function Auth() {
  const [, setLocation] = useLocation()
  const { data: user, isLoading } = useUser()

  useEffect(() => {
    if (user) {
      setLocation(user.role === "admin" ? "/admin" : "/")
    }
  }, [user, setLocation])

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh"
      >
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </Box>
    )
  }

  return (
    <div className="min-h-[calc(100vh-128px)] flex items-center justify-center bg-transparent relative overflow-hidden py-12 px-4">
      {/* Background Blobs */}
      <div className="absolute top-0 -left-10 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute -bottom-20 right-0 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-serif font-black tracking-tighter text-gradient mb-2">
            Aurora
          </h1>
          <Typography
            variant="h6"
            className="text-muted-foreground font-medium"
          >
            Academic Resource Portal
          </Typography>
          <Box className="h-1 w-16 bg-accent mx-auto rounded-full mt-3 shadow-sm" />
        </div>

        <Card className="glass-card shadow-2xl rounded-[2.5rem] border-none overflow-hidden">
          <AuthContent />
        </Card>
      </motion.div>
    </div>
  )
}

function AuthContent() {
  const [activeTab, setActiveTab] = useState(0)

  return (
    <Box>
      <Box className="bg-primary/5 p-2">
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="fullWidth"
          sx={{
            "& .MuiTab-root": {
              borderRadius: "1.25rem",
              fontWeight: 800,
              fontSize: "0.8rem",
              letterSpacing: "0.1em",
              py: 2,
              transition: "all 0.3s ease",
            },
            "& .Mui-selected": {
              bgcolor: "white",
              color: "primary.main",
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            },
            "& .MuiTabs-indicator": { display: "none" },
          }}
        >
          <Tab label="LOGIN" />
          <Tab label="REGISTER" />
        </Tabs>
      </Box>

      <Box p={6}>
        {activeTab === 0 ? (
          <AuthForm type="login" />
        ) : (
          <AuthForm type="register" />
        )}
      </Box>
    </Box>
  )
}

function AuthForm({ type }) {
  const loginMutation = useLogin()
  const registerMutation = useRegister()
  const [, setLocation] = useLocation()

  const isLogin = type === "login"
  const mutation = isLogin ? loginMutation : registerMutation

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    role: "student",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    mutation.mutate(formData, {
      onSuccess: (user) => {
        setLocation(user.role === "admin" ? "/admin" : "/")
      },
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <Box className="text-center mb-6">
        <Box className="inline-flex items-center justify-center p-4 bg-primary/5 rounded-2xl mb-3">
          {isLogin ? (
            <Lock className="h-6 w-6 text-primary" />
          ) : (
            <User className="h-6 w-6 text-primary" />
          )}
        </Box>
        <Typography variant="h5" className="font-serif font-black">
          {isLogin ? "Welcome Back" : "Create Account"}
        </Typography>
        <Typography
          variant="body2"
          className="text-muted-foreground font-medium"
        >
          {isLogin ? "Enter your credentials" : "Join our study community"}
        </Typography>
      </Box>

      <Box className="space-y-4">
        <TextField
          fullWidth
          name="username"
          label="Username"
          value={formData.username}
          onChange={handleChange}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <User size={18} className="text-primary/50" />
              </InputAdornment>
            ),
            sx: { borderRadius: "1rem" },
          }}
        />

        <TextField
          fullWidth
          name="password"
          type="password"
          label="Password"
          value={formData.password}
          onChange={handleChange}
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Lock size={18} className="text-primary/50" />
              </InputAdornment>
            ),
            sx: { borderRadius: "1rem" },
          }}
        />

        {!isLogin && (
          <FormControl fullWidth>
            <Select
              name="role"
              value={formData.role}
              onChange={handleChange}
              sx={{ borderRadius: "1rem" }}
            >
              <MenuItem value="student">Student</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
        )}
      </Box>

      <Button
        type="submit"
        fullWidth
        variant="contained"
        disabled={mutation.isPending}
        sx={{
          py: 2,
          borderRadius: "1rem",
          fontWeight: 900,
          background:
            "linear-gradient(135deg, hsl(var(--primary)) 0%, #4a90e2 100%)",
          boxShadow: "0 8px 16px -4px rgba(0,0,0,0.2)",
          "&:hover": {
            transform: "translateY(-2px)",
            boxShadow: "0 12px 20px -4px rgba(0,0,0,0.3)",
          },
          transition: "all 0.3s ease",
        }}
      >
        {mutation.isPending ? (
          <Loader2 className="animate-spin" />
        ) : isLogin ? (
          "SIGN IN"
        ) : (
          "CREATE ACCOUNT"
        )}
      </Button>
    </form>
  )
}
