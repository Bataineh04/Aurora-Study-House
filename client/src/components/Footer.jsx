import { useQuery } from "@tanstack/react-query"
import { Typography } from "@mui/material"

export function Footer() {
  const { data: abacus } = useQuery({
    queryKey: ["/api/site-stats"],
    queryFn: async () => {
      const res = await fetch(
        "https://abacus.jasoncameron.dev/hit/studyroom.myapp/site-visits"
      )
      return res.json()
    },
    refetchOnWindowFocus: false,
  })

  return (
    <footer className="bg-primary py-8 text-center text-primary-foreground/60 text-sm">
      <div className="container mx-auto px-4">
        <Typography
          variant="body2"
          className="mb-0 font-serif font-bold text-white/80"
          sx={{ mb: 1 }}
        >
          &copy; {new Date().getFullYear()} Aurora Study Room Cafe.
        </Typography>
        {abacus && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-foreground/10 rounded-full border border-primary-foreground/20 text-primary-foreground/80">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span>
              Site Visits:{" "}
              <strong className="text-primary-foreground">
                {abacus.value}
              </strong>
            </span>
          </div>
        )}
      </div>
    </footer>
  )
}
