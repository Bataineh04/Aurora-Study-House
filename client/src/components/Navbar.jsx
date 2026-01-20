import { Link, useLocation } from "wouter"
import {
  GraduationCap,
  CalendarClock,
  BarChart3,
  ListChecks,
  LogIn,
  LogOut,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser, useLogout } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"

export function Navbar() {
  const [location, setLocation] = useLocation()
  const { data: user } = useUser()
  const logoutMutation = useLogout()

  const links = [
    { href: "/", label: "Reserve Room", icon: CalendarClock },
    { href: "/status", label: "Room Status", icon: BarChart3 },
    ...(user?.role === "admin"
      ? [{ href: "/admin", label: "Admin Panel", icon: ListChecks }]
      : []),
  ]

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => setLocation("/login"),
    })
  }

  return (
    <nav className="bg-primary text-primary-foreground shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3">
              <div className="p-2 bg-white/10 rounded-lg cursor-pointer">
                <GraduationCap className="h-6 w-6 text-accent" />
              </div>
              <span className="font-serif text-xl font-bold tracking-tight cursor-pointer">
                Aurora
              </span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <div className="flex space-x-1">
              {links.map((link) => {
                const Icon = link.icon
                const isActive = location === link.href

                return (
                  <Link key={link.href} to={link.href}>
                    <div
                      className={cn(
                        "flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 cursor-pointer",
                        isActive
                          ? "bg-white/20 text-white shadow-inner"
                          : "text-primary-foreground/80 hover:bg-white/10 hover:text-white"
                      )}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {link.label}
                    </div>
                  </Link>
                )
              })}
            </div>
            {user ? (
              <div className="flex items-center space-x-3 border-l border-white/20 pl-4">
                <div className="flex items-center text-sm font-medium text-white">
                  <User className="h-4 w-4 mr-2" />
                  {user.username}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="text-primary-foreground/80 hover:bg-white/10 hover:text-white"
                  disabled={logoutMutation.isPending}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {logoutMutation.isPending ? "Logging out..." : "Logout"}
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary-foreground/80 hover:bg-white/10 hover:text-white"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
