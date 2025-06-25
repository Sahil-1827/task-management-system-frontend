'use client';
import { Box, Container, Typography } from '@mui/material';
import Twitter from '@mui/icons-material/Twitter';
import Facebook from '@mui/icons-material/Facebook';
import Instagram from '@mui/icons-material/Instagram';

export default function Footer() {
  return (
    <Box component="footer" sx={{ bgcolor: 'background.paper', py: 6 }}>
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 4, mb: 4 }}>
          <Typography variant="body1" color="text.secondary" sx={{ minWidth: '160px' }}>
            About Us
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ minWidth: '160px' }}>
            Contact
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ minWidth: '160px' }}>
            Privacy Policy
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ minWidth: '160px' }}>
            Terms of Service
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 2 }}>
          <Twitter sx={{ color: 'text.secondary' }} />
          <Facebook sx={{ color: 'text.secondary' }} />
          <Instagram sx={{ color: 'text.secondary' }} />
        </Box>
        <Typography variant="body1" color="text.secondary" align="center">
          © 2025 TaskMaster. All rights reserved. Created by SAHIL GADHIYA.
        </Typography>
      </Container>
    </Box>
  );
}