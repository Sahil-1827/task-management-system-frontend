'use client';
import InfoPageLayout from '../../components/InfoPageLayout';
import { Typography, TextField, Button, Grid, Box } from '@mui/material';

export default function ContactPage() {
  return (
    <InfoPageLayout title="Contact Us">
      <Typography paragraph>
        We&apos;d love to hear from you! Whether you have a question about features, trials, pricing, or anything else, our team is ready to answer all your questions.
      </Typography>
      
      <Box component="form" noValidate autoComplete="off" sx={{ mt: 4 }}>
        <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField required fullWidth id="name" label="Your Name" />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
                <TextField required fullWidth id="email" label="Your Email" type="email" />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <TextField required fullWidth multiline rows={4} id="message" label="Your Message" />
            </Grid>
            <Grid size={{ xs: 12 }}>
                <Button variant="contained" color="primary" size="large">
                    Send Message
                </Button>
            </Grid>
        </Grid>
      </Box>
    </InfoPageLayout>
  );
}
