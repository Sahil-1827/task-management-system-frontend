"use client";
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent
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
  minWidth: "84px",
  maxWidth: "480px",
  borderRadius: "12px",
  height: "40px",
  padding: "0 16px",
  textTransform: "none",
  fontWeight: 700,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
  "&:hover": {
    backgroundColor: theme.palette.primary.dark
  },
  "@media (min-width: 480px)": {
    height: "48px",
    padding: "0 20px",
    fontSize: "16px"
  }
}));

const FeatureCard = styled(Card)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: "12px",
  padding: "16px",
  border: `1px solid ${theme.palette.mode === "light" ? "#dde1e3" : "#2d3748"}`,
  borderRadius: "8px",
  backgroundColor: theme.palette.background.paper
}));

export default function Home() {
  const router = useRouter();

  return (
    <Box sx={{ bgcolor: "background.default", minHeight: "100vh" }}>
      {/* Only show Navbar and Footer if user is not logged in */}
      {!localStorage.getItem('token') && <Navbar />}
      
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: 5 }}>
        <Box
          sx={{
            backgroundImage:
              'linear-gradient(rgba(0, 0, 0, 0.1) 0%, rgba(0, 0, 0, 0.4) 100%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuAJLqKa41kgHD3BefMo8GqstNl0l7_KOS5IqR2Sduk4F_FSRJ6oo4cwVjzqSTFYcQ53PzGWw09qlcT2w-3dCifcuDoTnXUYMFyWiaf3BOFE6fV-kDBYeN5NheCAFVk5s_V-EkZCfWFPIvOGegaO5TK-H0id_Gr8UvYMSyy9_mBNWg28tTwrbPQF_7JFi-zLS2gQS-l_xq1fKzQjC1qeMlLh5MpPo6rfByOM92l7D7KRvyKqWP_oW5zKZ8S0whveHlS-Ns3w-WmIV30")',
            backgroundSize: "cover",
            backgroundPosition: "center",
            borderRadius: { xs: 0, sm: 4 },
            p: { xs: 2, sm: 5 },
            minHeight: "480px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            gap: 3
          }}
        >
          <Box sx={{ color: "white", maxWidth: "md" }}>
            <Typography variant="h2" sx={{ fontWeight: 900, mb: 2 }}>
              Streamline Your Workflow with TaskMaster
            </Typography>
            <Typography variant="body1">
              Manage tasks, assign team members, track progress, and boost
              productivity with our intuitive task management system. Get
              real-time notifications, role-based access, and activity logs to
              keep your team aligned and efficient.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <StyledButton
              variant="contained"
              onClick={() => router.push("/signup")}
            >
              Get Started
            </StyledButton>
            <StyledButton
              variant="contained"
              sx={{
                bgcolor: "secondary.main",
                "&:hover": {
                  bgcolor: "secondary.dark"
                }
              }}
              onClick={() => router.push("/learn-more")}
            >
              Learn More
            </StyledButton>
          </Box>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 8 }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
            Key Features
          </Typography>
          <Typography variant="body1" sx={{ mb: 5 }}>
            TaskMaster offers a comprehensive suite of tools designed to enhance
            team collaboration and productivity.
          </Typography>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard>
                <ListChecks sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                    Task Management
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Easily create, assign, and organize tasks with detailed
                    descriptions and deadlines.
                  </Typography>
                </Box>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard>
                <Users sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                    Team Collaboration
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Assign tasks to team members, set roles, and manage
                    permissions for seamless teamwork.
                  </Typography>
                </Box>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard>
                <Bell sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                    Real-Time Notifications
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Stay updated with instant notifications on task assignments,
                    updates, and deadlines.
                  </Typography>
                </Box>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FeatureCard>
                <Clock sx={{ fontSize: 32 }} />
                <Box>
                  <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
                    Progress Tracking
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Monitor task completion, track progress, and identify
                    bottlenecks to keep projects on schedule.
                  </Typography>
                </Box>
              </FeatureCard>
            </Grid>
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box sx={{ textAlign: "center", py: 8 }}>
          <Typography variant="h3" sx={{ mb: 2, fontWeight: 700 }}>
            Ready to Transform Your Team Productivity?
          </Typography>
          <Typography variant="body1" sx={{ mb: 4 }}>
            Join thousands of teams already using TaskMaster to achieve their
            goals more efficiently.
          </Typography>
          <StyledButton
            variant="contained"
            sx={{ bgcolor: "#1b3430" }}
            onClick={() => router.push("/signup")}
          >
            Sign Up Now
          </StyledButton>
        </Box>
      </Container>
      {!localStorage.getItem('token') && <Footer />}
    </Box>
  );
}
