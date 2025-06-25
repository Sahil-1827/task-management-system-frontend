"use client";
import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Typography,
  Grid,
  Link,
  TextField,
  IconButton,
  Divider,
  InputAdornment,
  useTheme,
  Fab,
  Zoom
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";

// Icons
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FacebookIcon from "@mui/icons-material/Facebook";
import TwitterIcon from "@mui/icons-material/Twitter";
import InstagramIcon from "@mui/icons-material/Instagram";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

// Reusable component for footer links for cleaner code
const FooterLink = ({ href, children }) => (
  <Link
    href={href}
    color="inherit"
    underline="hover"
    display="block"
    sx={{
      mt: 1,
      fontSize: "0.875rem",
      textDecoration: "none",
      "&:hover": { color: "primary.main" }
    }}
  >
    {children}
  </Link>
);

export default function Footer() {
  const theme = useTheme();
  const router = useRouter();
  const [showScroll, setShowScroll] = useState(false);

  // Show/hide scroll-to-top button
  useEffect(() => {
    const checkScrollTop = () => {
      if (!showScroll && window.pageYOffset > 400) {
        setShowScroll(true);
      } else if (showScroll && window.pageYOffset <= 400) {
        setShowScroll(false);
      }
    };
    window.addEventListener("scroll", checkScrollTop);
    return () => window.removeEventListener("scroll", checkScrollTop);
  }, [showScroll]);

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const isDark = theme.palette.mode === "dark";

  // Gradients for both light and dark modes
  const gradient = isDark
    ? "linear-gradient(90deg, #1e293b 0%, #312e81 100%)" // Slate to Indigo for a rich, noticeable dark gradient
    : "linear-gradient(90deg, #e2e8f0 0%, #cbd5e1 100%)"; // A darker, professional gradient for light mode

  const textColor = isDark ? "#cbd5e1" : "#1e293b";
  const headingColor = isDark ? "#94a3b8" : "#475569";
  const dividerColor = isDark
    ? "rgba(255, 255, 255, 0.1)"
    : "rgba(0, 0, 0, 0.1)";

  return (
    <Box
      component="footer"
      sx={{
        position: "relative",
        color: textColor,
        backgroundImage: gradient,
        pt: 8, // Increased top padding for the SVG curve
        transition: "background-image 0.3s ease-in-out" // Smooth transition for theme change
      }}
    >
      {/* Decorative SVG Top Border */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          overflow: "hidden",
          lineHeight: 0,
          transform: "rotate(180deg)"
        }}
      >
        <svg
          data-name="Layer 1"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          style={{
            position: "relative",
            display: "block",
            width: "calc(100% + 1.3px)",
            height: "60px"
          }}
        >
          <path
            d="M1200 120L0 120 0 0 1200 0 1200 120z"
            style={{
              fill: theme.palette.background.default,
              transition: "fill .3s ease"
            }}
          ></path>
        </svg>
      </Box>

      <Container maxWidth="xl" sx={{ position: "relative", mt: 5 }}>
        <Grid 
          container 
          spacing={{ xs: 4, md: 8 }} 
          justifyContent="center"
          alignItems="center"
        >
          {/* Column 1: Brand Info */}
          <Grid 
            item 
            xs={12} 
            md={4} 
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
              <Image src="/logo.png" alt="Logo" width={28} height={28} />
              <Typography
                variant="h6"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                TaskMaster
              </Typography>
            </Box>
            <Typography
              variant="body2"
              align="center"
              sx={{ color: headingColor, fontSize: "0.875rem" }}
            >
              The ultimate platform to streamline your workflow, manage tasks,
              and boost your team&apos;s productivity.
            </Typography>
          </Grid>

          {/* Column 2: Office */}
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={2.5}
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Typography
              variant="overline"
              align="center"
              sx={{ fontWeight: "bold", color: headingColor }}
            >
              Office
            </Typography>
            <Typography 
              variant="body2" 
              align="center"
              sx={{ mt: 1, fontSize: "0.875rem" }}
            >
              123 Productivity Lane, <br />
              Innovation City, 54321 <br />
              India
            </Typography>
          </Grid>

          {/* Column 3: Links */}
          <Grid 
            item 
            xs={12} 
            sm={6} 
            md={2.5}
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Typography
              variant="overline"
              align="center"
              sx={{ fontWeight: "bold", color: headingColor }}
            >
              Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <FooterLink href="/">Home</FooterLink>
              <FooterLink href="/about">About Us</FooterLink>
              <FooterLink href="/contact">Contact</FooterLink>
              <FooterLink href="/privacy">Privacy Policy</FooterLink>
            </Box>
          </Grid>

          {/* Column 4: Newsletter */}
          <Grid 
            item 
            xs={12} 
            md={3}
            sx={{ 
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Typography
              variant="overline"
              align="center"
              sx={{ fontWeight: "bold", color: headingColor }}
            >
              Newsletter
            </Typography>
            <TextField
              variant="standard"
              fullWidth
              placeholder="Enter your email"
              sx={{ mt: 0.5 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" sx={{ color: textColor }}>
                      <ArrowForwardIcon />
                    </IconButton>
                  </InputAdornment>
                ),
                sx: { color: textColor, fontSize: "0.875rem" }
              }}
            />
            <Box sx={{ mt: 1.5, display: "flex", gap: 0.5, justifyContent: 'center' }}>
              <IconButton size="small" sx={{ color: textColor }}>
                <FacebookIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: textColor }}>
                <TwitterIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: textColor }}>
                <InstagramIcon />
              </IconButton>
              <IconButton size="small" sx={{ color: textColor }}>
                <LinkedInIcon />
              </IconButton>
            </Box>
          </Grid>
        </Grid>

        <Divider sx={{ my: 3, bgcolor: dividerColor }} />

        <Typography
          variant="body2"
          align="center"
          sx={{ pb: 2, color: headingColor, fontSize: "0.875rem" }}
        >
          © {new Date().getFullYear()} TaskMaster. All Rights Reserved.
        </Typography>
      </Container>
      <Zoom in={showScroll}>
        <Fab
          color="primary"
          size="small"
          onClick={scrollTop}
          sx={{ position: "fixed", bottom: 16, right: 16 }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Zoom>
    </Box>
  );
}
