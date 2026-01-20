import React from "react"
import { TextField } from "@mui/material"
import { cn } from "@/lib/utils"

export function Input({ className, ...props }) {
  return (
    <TextField
      fullWidth
      variant="outlined"
      className={cn("w-full", className)}
      InputProps={{
        sx: {
          borderRadius: "1rem",
          backgroundColor: "rgba(255,255,255,0.5)",
          "&:hover": { backgroundColor: "white" },
          "&.Mui-focused": { backgroundColor: "white" },
          transition: "all 0.3s ease",
          "& fieldset": {
            borderColor: "rgba(0,0,0,0.1)",
          },
          "&:hover fieldset": {
            borderColor: "var(--primary)",
          },
        },
      }}
      {...props}
    />
  )
}
