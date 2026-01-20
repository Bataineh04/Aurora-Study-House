import React from "react"
import {
  Table as MuiTable,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material"
import { cn } from "@/lib/utils"

export function Table({ children, className, ...props }) {
  return (
    <TableContainer
      component={Paper}
      elevation={0}
      className={cn(
        "overflow-hidden border border-black/5 bg-white/40 rounded-[2rem]",
        className
      )}
      {...props}
    >
      <MuiTable>{children}</MuiTable>
    </TableContainer>
  )
}

export function TableHeader({ children, className, ...props }) {
  return (
    <TableHead
      className={cn("bg-slate-50/50 border-bottom-2 border-black/5", className)}
      {...props}
    >
      {children}
    </TableHead>
  )
}

export function TableRowComponent({ children, className, ...props }) {
  return (
    <TableRow
      className={cn(
        "transition-colors hover:bg-slate-50/80 [&:nth-of-type(odd)]:bg-slate-50/30",
        className
      )}
      {...props}
    >
      {children}
    </TableRow>
  )
}

export function TableCellComponent({
  children,
  className,
  isHeader = false,
  ...props
}) {
  return (
    <TableCell
      className={cn(
        "py-4 px-6",
        isHeader
          ? "font-black text-[10px] uppercase tracking-widest text-muted-foreground/60"
          : "font-medium text-slate-700",
        className
      )}
      {...props}
    >
      {children}
    </TableCell>
  )
}

export { TableBody }
