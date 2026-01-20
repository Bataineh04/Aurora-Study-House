import React from 'react';
import { Button as MuiButton } from '@mui/material';

export function Button({ children, variant = 'contained', size = 'medium', onClick, disabled, ...props }) {
  return (
    <MuiButton
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      {...props}
    >
      {children}
    </MuiButton>
  );
}