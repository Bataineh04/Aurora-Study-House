import React, { useState } from "react"
import { Box, Typography, IconButton, Grid, Paper } from "@mui/material"
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react"
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  isBefore,
  startOfToday,
} from "date-fns"
import { cn } from "@/lib/utils"

export function Calendar({
  selected,
  onSelect,
  className,
  disabledDates = [],
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const normalizeDate = (date) => {
    if (!date) return null
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
  }

  const isDateDisabled = (date) => {
    const normalizedDate = normalizeDate(date)
    if (!normalizedDate) return false

    const dayStr = format(normalizedDate, "yyyy-MM-dd")

    return disabledDates.some((disabledDate) => {
      const normalizedDisabledDate = normalizeDate(disabledDate)
      if (!normalizedDisabledDate) return false

      const dbDateStr = format(normalizedDisabledDate, "yyyy-MM-dd")
      return dayStr === dbDateStr
    })
  }

  const renderHeader = () => {
    return (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          px: 3,
          py: 2,
          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
          background: "rgba(255, 255, 255, 0.3)",
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontFamily: "var(--font-serif)",
            fontWeight: 900,
            color: "primary.main",
            fontSize: "1.1rem",
            letterSpacing: "-0.02em",
          }}
        >
          {format(currentMonth, "MMMM yyyy")}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5 }}>
          <IconButton
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.5)",
              "&:hover": { bgcolor: "white" },
            }}
          >
            <ChevronLeft className="h-4 w-4" />
          </IconButton>
          <IconButton
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.5)",
              "&:hover": { bgcolor: "white" },
            }}
          >
            <ChevronRight className="h-4 w-4" />
          </IconButton>
        </Box>
      </Box>
    )
  }

  const renderDays = () => {
    const days = []
    const dateNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    for (let i = 0; i < 7; i++) {
      days.push(
        <Box key={i} sx={{ textAlign: "center", flex: 1 }}>
          <Typography
            variant="caption"
            sx={{
              fontWeight: 900,
              fontSize: "10px",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              color: "text.secondary",
              opacity: 0.6,
            }}
          >
            {dateNames[i]}
          </Typography>
        </Box>
      )
    }
    return <Box sx={{ px: 2, py: 2, display: "flex" }}>{days}</Box>
  }

  const renderCells = () => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(monthStart)
    const startDate = startOfWeek(monthStart)
    const endDate = endOfWeek(monthEnd)

    const rows = []
    let days = []
    let day = startDate
    let formattedDate = ""

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, "d")
        const cloneDay = day
        const isReserved = isDateDisabled(day)
        const isPast =
          isBefore(day, startOfToday()) && !isSameDay(day, startOfToday())
        const isDisabled = isPast || isReserved

        const isSelected = isSameDay(day, selected)
        const isCurrentMonth = isSameMonth(day, monthStart)

        days.push(
          <Box
            key={day.toString()}
            sx={{ p: 0.25, flex: 1, display: "flex", justifyContent: "center" }}
          >
            <Box
              onClick={() => !isDisabled && onSelect(cloneDay)}
              sx={{
                height: "2.25rem",
                width: "2.25rem",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "0.75rem",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                cursor: isDisabled ? "not-allowed" : "pointer",
                fontWeight: "bold",
                fontSize: "0.85rem",
                position: "relative",
                // Default style
                color: !isCurrentMonth ? "rgba(0,0,0,0.15)" : "text.primary",
                // Hover effect (only if not disabled)
                "&:hover": isDisabled
                  ? {}
                  : {
                      bgcolor: "primary.main",
                      color: "white",
                      transform: "translateY(-2px)",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                    },
                // Selected state
                ...(isSelected && {
                  background:
                    "linear-gradient(135deg, hsl(var(--primary)) 0%, #4a90e2 100%)",
                  color: "white !important",
                  boxShadow: "0 6px 15px -3px rgba(30, 58, 138, 0.3)",
                  transform: "scale(1.1) translateY(-2px)",
                  zIndex: 2,
                }),
                // Disabled/Reserved state
                ...(isDisabled && {
                  opacity: 0.4,
                  bgcolor: isReserved
                    ? "rgba(239, 68, 68, 0.05)"
                    : "transparent",
                  color: isReserved ? "#ef4444" : "inherit",
                }),
              }}
            >
              <span
                style={{
                  textDecoration: isReserved ? "line-through" : "none",
                  opacity: isPast ? 0.5 : 1,
                }}
              >
                {formattedDate}
              </span>

              {isReserved && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: "4px",
                    width: "4px",
                    height: "4px",
                    bgcolor: "#ef4444",
                    borderRadius: "50%",
                    boxShadow: "0 0 4px rgba(239, 68, 68, 0.5)",
                  }}
                />
              )}
            </Box>
          </Box>
        )
        day = addDays(day, 1)
      }
      rows.push(
        <Box
          key={day.toString()}
          sx={{ px: 2, mb: 0.5, display: "flex", justifyContent: "center" }}
        >
          {days}
        </Box>
      )
      days = []
    }
    return <Box sx={{ pb: 3 }}>{rows}</Box>
  }

  return (
    <Paper
      elevation={0}
      className={className}
      sx={{
        background: "rgba(255, 255, 255, 0.45)",
        backdropFilter: "blur(12px) saturate(180%)",
        WebkitBackdropFilter: "blur(12px) saturate(180%)",
        border: "1px solid rgba(255, 255, 255, 0.3)",
        borderRadius: "1.5rem",
        overflow: "hidden",
        boxShadow: "0 20px 40px -15px rgba(0,0,0,0.1)",
      }}
    >
      {renderHeader()}
      {renderDays()}
      {renderCells()}
      <Box
        sx={{
          px: 3,
          py: 2,
          background: "rgba(255, 255, 255, 0.3)",
          borderTop: "1px solid rgba(0, 0, 0, 0.05)",
          display: "flex",
          alignItems: "center",
          gap: 1.5,
        }}
      >
        <CalendarIcon className="h-4 w-4 text-primary opacity-50" />
        <Typography
          variant="caption"
          sx={{
            fontWeight: 800,
            color: "primary.main",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontSize: "0.7rem",
          }}
        >
          {selected ? format(selected, "MMMM do, yyyy") : "Select a date"}
        </Typography>
      </Box>
    </Paper>
  )
}
