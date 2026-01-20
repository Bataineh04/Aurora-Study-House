import React from 'react';
import { Dialog as MuiDialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from '@mui/material';

export function Dialog({ open, onOpenChange, ...props }) {
  return (
    <MuiDialog 
      open={open} 
      onClose={() => onOpenChange && onOpenChange(false)}
      {...props}
    >
      {props.children}
    </MuiDialog>
  );
}

export function DialogTrigger({ children, ...props }) {
  return <>{children}</>;
}

export function DialogContentWrapper({ children, ...props }) {
  return <DialogContent {...props}>{children}</DialogContent>;
}

export function DialogHeader({ children, ...props }) {
  return <DialogTitle {...props}>{children}</DialogTitle>;
}

export function DialogTitle({ children, ...props }) {
  return <DialogTitle {...props}>{children}</DialogTitle>;
}

export function DialogDescription({ children, ...props }) {
  return <DialogContentText {...props}>{children}</DialogContentText>;
}

export function DialogFooter({ children, ...props }) {
  return <DialogActions {...props}>{children}</DialogActions>;
}