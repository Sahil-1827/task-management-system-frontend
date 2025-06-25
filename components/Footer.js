'use client';
import { Box, Container, Typography, Grid, Link, Button, Paper, useTheme } from '@mui/material';
import Image from "next/image";
import { useRouter } from 'next/navigation';
import EmailIcon from '@mui/icons-material/Email';
import TwitterIcon from '@mui/icons-material/Twitter';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import SchoolIcon from '@mui/icons-material/School';

export default function Footer() {
    const router = useRouter();
    const theme = useTheme();

  return (
    <Box component="footer" sx={{ bgcolor: 'background.default', color: 'text.secondary', mt: 8 }}>
        <Container maxWidth="full">
            {/* CTA Section */}
            <Paper 
                elevation={0}
                sx={{
                    position: 'relative',
                    bottom: '-40px',
                    mb: -5,
                    p: {xs: 3, md: 4},
                    borderRadius: '16px',
                    bgcolor: 'primary.main',
                    color: 'primary.contrastText',
                    display: 'flex',
                    flexDirection: {xs: 'column', md: 'row'},
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Box sx={{display: 'flex', alignItems: 'center', gap: 2, textAlign: {xs: 'center', md: 'left'}}}>
                    <SchoolIcon sx={{fontSize: {xs: '36px', md: '48px'}}}/>
                    <Box>
                        <Typography variant="h5" component="h2" sx={{fontWeight: 'bold'}}>Start managing now</Typography>
                        <Typography variant="body2" sx={{opacity: 0.8}}>Boost your productivity with TaskMaster.</Typography>
                    </Box>
                </Box>
                <Button variant="contained" sx={{bgcolor: 'primary.contrastText', color: 'primary.main', '&:hover': {bgcolor: 'rgba(255,255,255,0.9)'}}} onClick={() => router.push('/signup')}>
                    Get Started Free
                </Button>
            </Paper>

            {/* Main Footer */}
            <Box sx={{
                bgcolor: '#1e293b', 
                color: theme.palette.mode === 'dark' ? '#cbd5e1' : '#e2e8f0', 
                p: {xs: 3, md: 6},
                pt: {xs: 10, md: 12},
                borderRadius: '16px 16px 0 0'
             }}>
                <Grid container spacing={4}>
                    {/* Column 1: Logo & Copyright */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                            <Image src="/logo.png" alt="Logo" width={32} height={32} style={{filter: 'brightness(0) invert(1)'}}/>
                            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                            TaskMaster
                            </Typography>
                        </Box>
                        <Typography variant="body2" sx={{color: '#94a3b8'}}>
                            © 2025 TaskMaster. All rights reserved.
                        </Typography>
                    </Grid>

                    {/* Column 2: Navigation */}
                    <Grid item xs={6} sm={4} md={2}>
                        <Typography variant="overline" sx={{fontWeight: 'bold', color: '#94a3b8'}}>Navigation</Typography>
                        <Link href="/" color="inherit" underline="hover" display="block" sx={{mt: 1}}>Home</Link>
                        <Link href="/about" color="inherit" underline="hover" display="block" sx={{mt: 1}}>About Us</Link>
                        <Link href="/login" color="inherit" underline="hover" display="block" sx={{mt: 1}}>Login</Link>
                        <Link href="/contact" color="inherit" underline="hover" display="block" sx={{mt: 1}}>Contact</Link>
                    </Grid>

                    {/* Column 3: Contact */}
                    <Grid item xs={6} sm={4} md={3}>
                        <Typography variant="overline" sx={{fontWeight: 'bold', color: '#94a3b8'}}>Contact</Typography>
                        <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 1}}>
                            <EmailIcon fontSize="small"/>
                            <Typography variant="body2">info@taskmaster.com</Typography>
                        </Box>
                         <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 1}}>
                            <TwitterIcon fontSize="small"/>
                            <Typography variant="body2">@taskmaster</Typography>
                        </Box>
                         <Box sx={{display: 'flex', alignItems: 'center', gap: 1, mt: 1}}>
                            <LinkedInIcon fontSize="small"/>
                            <Typography variant="body2">LinkedIn</Typography>
                        </Box>
                    </Grid>
                    
                    {/* Column 4: Legal */}
                     <Grid item xs={6} sm={4} md={3}>
                        <Typography variant="overline" sx={{fontWeight: 'bold', color: '#94a3b8'}}>Legal</Typography>
                        <Link href="/terms" color="inherit" underline="hover" display="block" sx={{mt: 1}}>Terms of Service</Link>
                        <Link href="/privacy" color="inherit" underline="hover" display="block" sx={{mt: 1}}>Privacy Policy</Link>
                    </Grid>
                </Grid>
            </Box>
        </Container>
    </Box>
  );
}
