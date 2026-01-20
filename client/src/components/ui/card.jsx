import React from "react"
import {
  Card as MuiCard,
  CardContent as MuiCardContent,
  CardHeader as MuiCardHeader,
  CardActions as MuiCardActions,
  Typography,
} from "@mui/material"
import { cn } from "@/lib/utils"

export function Card({ children, className, ...props }) {
  return (
    <MuiCard
      className={cn(
        "glass-card rounded-[2rem] shadow-xl border-none overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </MuiCard>
  )
}

export function CardContent({ children, className, ...props }) {
  return (
    <MuiCardContent className={cn("p-4", className)} {...props}>
      {children}
    </MuiCardContent>
  )
}

export function CardHeader({
  children,
  className,
  title,
  subheader,
  icon: Icon,
  ...props
}) {
  return (
    <div
      className={cn(
        "premium-gradient p-5 text-white relative overflow-hidden",
        className
      )}
    >
      <div className="relative z-10">
        {title && (
          <Typography variant="h5" className="font-serif font-bold mb-0.5">
            {title}
          </Typography>
        )}
        {subheader && (
          <Typography className="text-white/80 text-xs font-medium">
            {subheader}
          </Typography>
        )}
        {children}
      </div>
      {Icon && (
        <Icon className="absolute -right-4 -bottom-4 h-24 w-24 text-white/10 rotate-12" />
      )}
    </div>
  )
}

export function CardTitle({ children, className, ...props }) {
  return (
    <Typography
      variant="h4"
      className={cn("font-serif font-bold text-primary mb-1", className)}
      {...props}
    >
      {children}
    </Typography>
  )
}

export function CardDescription({ children, className, ...props }) {
  return (
    <Typography
      variant="body2"
      className={cn(
        "text-muted-foreground font-bold uppercase tracking-widest text-[10px]",
        className
      )}
      {...props}
    >
      {children}
    </Typography>
  )
}

export function CardActions({ children, className, ...props }) {
  return (
    <MuiCardActions
      className={cn(
        "px-8 py-4 bg-primary/5 border-t border-primary/5",
        className
      )}
      {...props}
    >
      {children}
    </MuiCardActions>
  )
}
