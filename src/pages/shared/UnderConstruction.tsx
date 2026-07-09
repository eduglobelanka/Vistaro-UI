import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import { Construction } from '@mui/icons-material';

export const UnderConstruction: React.FC<{ title: string }> = ({ title }) => {
  return (
    <Box sx={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', p: 3 }}>
      <Paper
        sx={{
          p: 6,
          maxWidth: 500,
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Construction sx={{ fontSize: 80, color: 'secondary.main', mb: 2 }} />
        <Typography variant="h4" sx={{ fontFamily: '"Outfit", sans-serif', fontWeight: 700, mb: 2 }}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          This sub-module is currently under construction and will be fully implemented in the upcoming phase.
        </Typography>
      </Paper>
    </Box>
  );
};

export default UnderConstruction;
