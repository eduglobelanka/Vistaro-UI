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
  const textColor = isLightText ? '#ffffff' : '#0f2c59';
  const subtextColor = isLightText ? 'rgba(255, 255, 255, 0.7)' : '#0d9488';

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        {/* Vistro SVG Icon */}
        <svg
          width={iconSize}
          height={iconSize}
          viewBox="0 0 200 200"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          style={{ transition: 'transform 0.3s ease' }}
        >
          <defs>
            <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1b4a8f" />
              <stop offset="100%" stopColor="#0a2540" />
            </linearGradient>
            <linearGradient id="tealGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3db5a0" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
          </defs>

          {/* Left Wing (Blue Arrow Path) */}
          <path
            d="M 15 35 
               C 50 35, 75 75, 75 110 
               C 75 140, 50 170, 15 170 
               L 40 170 
               C 85 170, 100 135, 100 100 
               C 100 70, 85 35, 40 35 
               Z"
            fill="url(#blueGrad)"
          />

          {/* Right Wing (Teal Arrow Path) */}
          <path
            d="M 185 35 
               C 150 35, 125 75, 125 110 
               C 125 140, 150 170, 185 170 
               L 160 170 
               C 115 170, 100 135, 100 100 
               C 100 70, 115 35, 160 35 
               Z"
            fill="url(#tealGrad)"
          />

          {/* Center Upward Rocket / Arrow Path */}
          <path
            d="M 100 45 
               L 125 90 
               L 100 80 
               L 75 90 
               Z"
            fill="#ffffff"
          />

          {/* Gold Sparkle / Star in the center */}
          <path
            d="M 100 70 
               Q 100 82, 112 82 
               Q 100 82, 100 94 
               Q 100 82, 88 82 
               Q 100 82, 100 70 
               Z"
            fill="url(#goldGrad)"
          />
        </svg>

        {variant !== 'icon' && (
          <Box sx={{ display: 'flex', alignItems: 'baseline' }}>
            <Typography
              variant="h4"
              sx={{
                fontFamily: '"Outfit", sans-serif',
                fontWeight: 800,
                color: textColor,
                letterSpacing: '-0.5px',
                display: 'flex',
                alignItems: 'baseline',
              }}
            >
              V
              <span style={{ position: 'relative' }}>
                i
                <span
                  style={{
                    position: 'absolute',
                    top: '-6px',
                    left: '1px',
                    width: '6px',
                    height: '6px',
                    backgroundColor: '#0d9488',
                    borderRadius: '50%',
                  }}
                />
              </span>
              stro
            </Typography>
          </Box>
        )}
      </Box>

      {variant !== 'icon' && tagline && (
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
