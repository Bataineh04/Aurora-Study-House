import { Switch, Route } from "wouter"
import { queryClient } from "./lib/queryClient"
import { QueryClientProvider } from "@tanstack/react-query"
import { Navbar } from "@/components/Navbar"
import { Footer } from "@/components/Footer"
import { Snackbar, Alert } from "@mui/material"
import { Toaster } from "react-hot-toast"

// Pages
import Reserve from "@/pages/Reserve"
import Status from "@/pages/Status"
import Admin from "@/pages/Admin"
import Auth from "@/pages/Auth"
import Login from "@/pages/Login"
import Register from "@/pages/Register"
import NotFound from "@/pages/NotFound"

function Router() {
  return (
    <div className="min-h-screen bg-background font-sans flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-background to-secondary/10">
        <Switch>
          <Route path="/" component={Reserve} />
          <Route path="/status" component={Status} />
          <Route path="/admin" component={Admin} />
          <Route path="/auth" component={Auth} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
    </div>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Toaster position="top-right" />
      <Router />
    </QueryClientProvider>
  )
}

export default App
