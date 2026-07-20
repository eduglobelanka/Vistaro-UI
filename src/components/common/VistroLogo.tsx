import React from 'react';
import { Box, Typography } from '@mui/material';

interface VistroLogoProps {
  iconSize?: number;
  variant?: 'full' | 'icon' | 'dark-text' | 'light-text';
  tagline?: boolean;
}

export const VistroLogo: React.FC<VistroLogoProps> = ({
  iconSize = 44,
  variant = 'full',
  tagline = true,
}) => {
  const isLightText = variant === 'light-text';
  const subtextColor = isLightText ? 'rgba(255, 255, 255, 0.7)' : '#0d9488';

  // Icon-only mode
  if (variant === 'icon') {
    return (
      <Box
        component="img"
        src="/logo.png"
        alt="Vistaro"
        sx={{ height: iconSize, width: 'auto', objectFit: 'contain' }}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box
        component="img"
        src="/logo.png"
        alt="Vistaro"
        sx={{ height: isLightText ? iconSize * 0.9 : iconSize * 1.2, width: 'auto', objectFit: 'contain' }}
      />

      {tagline && (
        <Typography
          variant="caption"
          sx={{
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 600,
            fontSize: '0.625rem',
            letterSpacing: '2.5px',
            color: subtextColor,
            mt: 0.5,
            textTransform: 'uppercase',
          }}
        >
          See Opportunity. Build Futures.
        </Typography>
      )}
    </Box>
  );
};

export default VistroLogo;
