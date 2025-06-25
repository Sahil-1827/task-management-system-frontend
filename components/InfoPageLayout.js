'use client';

import { Box, Container, Typography, Button } from '@mui/material';
import ArrowBack from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/NavBar';
import Footer from '@/components/Footer';

export default function InfoPageLayout({ title, children }) {
  const router = useRouter();

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* <Navbar /> */}
      <Container component="main" maxWidth="md" sx={{ py: { xs: 4, md: 8 }, flex: 1 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/')}
          sx={{ mb: 3 }}
        >
          Back to Home
        </Button>
        <Typography variant="h2" component="h1" sx={{ mb: 4, fontWeight: 'bold' }}>
          {title}
        </Typography>
        <Box sx={{
          '& p': { mb: 2, lineHeight: 1.75, color: 'text.secondary' },
          '& h3': { mt: 4, mb: 2, fontWeight: 'bold' }
        }}>
            {children}
        </Box>
      </Container>
      {/* <Footer /> */}
    </Box>
  );
}