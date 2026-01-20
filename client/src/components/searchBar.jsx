import React from "react"
import { InputAdornment, TextField } from "@mui/material"
import { Search } from "lucide-react"
import { cn } from "@/lib/utils"

export function SearchBar({
  value,
  onChange,
  placeholder = "Search...",
  className,
  ...props
}) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={cn("max-w-md", className)}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Search className="h-5 w-5 text-primary/50" />
          </InputAdornment>
        ),
        sx: {
          borderRadius: "1.25rem",
          backgroundColor: "white/60",
          backdropFilter: "blur(8px)",
          border: "1px solid rgba(0,0,0,0.05)",
          boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
          "&:hover": {
            backgroundColor: "white/80",
            borderColor: "var(--primary)",
          },
          "&.Mui-focused": {
            backgroundColor: "white",
            boxShadow: "0 8px 16px rgba(0,0,0,0.05)",
          },
          transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          "& fieldset": { border: "none" },
        },
      }}
      {...props}
    />
  )
}
