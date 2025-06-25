"use client";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  useTheme
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ListChecks from "@mui/icons-material/FormatListBulleted";
import Users from "@mui/icons-material/Group";
import Bell from "@mui/icons-material/NotificationsActive";
import Clock from "@mui/icons-material/AccessTime";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Footer from "@/components/Footer";
import Navbar from "@/components/NavBar";

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: '8px',
  padding: '10px 20px',
  textTransform: 'none',
  fontWeight: 700,
  fontSize: '1rem',
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  padding: theme.spacing(3),
  height: '100%',
}));

export default function Home() {
  const router = useRouter();
  const theme = useTheme();
  const isLocalStorageAvailable = typeof window !== 'undefined' && window.localStorage;

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {(!isLocalStorageAvailable || !localStorage.getItem('token')) && <Navbar />}
      
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
        <Box
          sx={{
            position: 'relative',
            borderRadius: { xs: 0, sm: 4 },
            p: { xs: 3, sm: 6 },
            minHeight: { xs: '360px', md: '480px' },
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: 3,
            color: 'common.white',
            overflow: 'hidden'
          }}
        >
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAJLqKa41kgHD3BefMo8GqstNl0l7_KOS5IqR2Sduk4F_FSRJ6oo4cwVjzqSTFYcQ53PzGWw09qlcT2w-3dCifcuDoTnXUYMFyWiaf3BOFE6fV-kDBYeN5NheCAFVk5s_V-EkZCfWFPIvOGegaO5TK-H0id_Gr8UvYMSyy9_mBNWg28tTwrbPQF_7JFi-zLS2gQS-l_xq1fKzQjC1qeMlLh5MpPo6rfByOM92l7D7KRvyKqWP_oW5zKZ8S0whveHlS-Ns3w-WmIV30"
            alt="Workflow"
            layout="fill"
            objectFit="cover"
            quality={100}
            style={{ zIndex: -2 }}
          />
          <Box sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: -1
          }}/>
          <Box sx={{ maxWidth: "md" }}>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 2 }}>
              Streamline Your Workflow with TaskMaster
            </Typography>
            <Typography variant="body1">
              Manage tasks, assign team members, track progress, and boost
              productivity with our intuitive task management system.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: 'column', sm: 'row' } }}>
            <StyledButton
              variant="contained"
              color="primary"
              onClick={() => router.push("/signup")}
            >
              Get Started
            </StyledButton>
            <StyledButton
              variant="contained"
              color="secondary"
              onClick={() => router.push("/learn-more")}
            >
              Learn More
            </StyledButton>
          </Box>
        </Box>

        <Box sx={{ py: 8 }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 700, textAlign: 'center' }}>
            Key Features
          </Typography>
          <Typography variant="body1" sx={{ mb: 5, textAlign: 'center', maxWidth: 'md', mx: 'auto' }}>
            TaskMaster offers a comprehensive suite of tools designed to enhance
            team collaboration and productivity.
          </Typography>

          <Grid container spacing={4}>
            {[
              { icon: <ListChecks sx={{ fontSize: 40 }} color="primary"/>, title: "Task Management", description: "Easily create, assign, and organize tasks with detailed descriptions and deadlines." },
              { icon: <Users sx={{ fontSize: 40 }} color="primary"/>, title: "Team Collaboration", description: "Assign tasks to team members, set roles, and manage permissions for seamless teamwork." },
              { icon: <Bell sx={{ fontSize: 40 }} color="primary"/>, title: "Real-Time Notifications", description: "Stay updated with instant notifications on task assignments, updates, and deadlines." },
              { icon: <Clock sx={{ fontSize: 40 }} color="primary"/>, title: "Progress Tracking", description: "Monitor task completion, track progress, and identify bottlenecks to keep projects on schedule." }
            ].map(feature => (
              <Grid item xs={12} sm={6} md={3} key={feature.title}>
                <FeatureCard>
                  {feature.icon}
                  <Box>
                    <Typography variant="h6" sx={{ mb: 1 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {feature.description}
                    </Typography>
                  </Box>
                </FeatureCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        <Box sx={{ textAlign: "center", py: 8, bgcolor: 'background.paper', borderRadius: 4 }}>
          <Typography variant="h3" sx={{ mb: 2 }}>
            Ready to Transform Your Productivity?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, maxWidth: 'md', mx: 'auto' }}>
            Join thousands of teams already using TaskMaster to achieve their
            goals more efficiently.
          </Typography>
          <StyledButton
            variant="contained"
            color="primary"
            onClick={() => router.push("/signup")}
          >
            Sign Up Now
          </StyledButton>
        </Box>
      </Container>
      {(!isLocalStorageAvailable || !localStorage.getItem('token')) && <Footer />}
    </Box>
  );
}