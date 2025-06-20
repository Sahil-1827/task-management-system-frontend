'use client';
import { ThemeProvider } from '@mui/material/styles';
import theme from '../lib/theme';

export default function ThemeRegistry({ children }) {
  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}