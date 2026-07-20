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
        src="/logo.jpeg"
        alt="Vistaro"
        sx={{ height: iconSize, width: 'auto', objectFit: 'contain' }}
      />
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* 
        Use logo.jpeg for light backgrounds.
        For dark sidebar (light-text variant), show a white-framed version 
        by placing the image inside a slightly opaque white pill — 
        this avoids the destructive invert filter that turns the logo white.
      */}
      {isLightText ? (
        <Box
          sx={{
            backgroundColor: 'rgba(255,255,255,0.92)',
            borderRadius: '10px',
            px: 1.5,
            py: 0.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box
            component="img"
            src="/logo.jpeg"
            alt="Vistaro"
            sx={{ height: iconSize * 0.9, width: 'auto', objectFit: 'contain', display: 'block' }}
          />
        </Box>
      ) : (
        <Box
          component="img"
          src="/logo.jpeg"
          alt="Vistaro"
          sx={{ height: iconSize * 1.2, width: 'auto', objectFit: 'contain' }}
        />
      )}

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
