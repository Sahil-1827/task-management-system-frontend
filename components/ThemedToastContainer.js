"use client";

import { ToastContainer } from 'react-toastify';
import { useTheme } from '@mui/material/styles';

const ThemedToastContainer = () => {
  const theme = useTheme();
  const toastTheme = theme.palette.mode === 'dark' ? 'dark' : 'light';

  return <ToastContainer theme={toastTheme} />;
};

export default ThemedToastContainer;
