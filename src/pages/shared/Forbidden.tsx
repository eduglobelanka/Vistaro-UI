import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Button, Container } from '@mui/material';
import { Block } from '@mui/icons-material';

export const Forbidden: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          py: 4,
        }}
      >
        <Block sx={{ fontSize: 100, color: 'error.main', mb: 3 }} />
        <Typography
          variant="h3"
          sx={{
            fontFamily: '"Outfit", sans-serif',
            fontWeight: 800,
            color: '#0f2c59',
            mb: 2,
          }}
        >
          Access Denied (403)
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
          You do not have the required permissions to view this page. If you believe this is an error, please contact your administrator.
        </Typography>
        <Button
          variant="contained"
          size="large"
          onClick={() => navigate('/dashboard')}
          sx={{ fontWeight: 700 }}
        >
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default Forbidden;
