"use client";
import React from 'react';
import { Box, Typography, Paper, useTheme } from '@mui/material';

const BarChart = ({ data, title, xAxisLabel, yAxisLabel }) => {
  const theme = useTheme();
  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', py: 2 }}>
        {data.map((item, index) => (
          <Box
            key={index}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: `${100 / data.length}%`,
              px: 0.5,
            }}
          >
            <Typography variant="caption" sx={{ mb: 0.5 }}>{item.value}</Typography>
            <Box
              sx={{
                width: '80%',
                height: `${(item.value / maxValue) * 100}%`,
                bgcolor: item.color || theme.palette.primary.main,
                borderRadius: '4px 4px 0 0',
                transition: 'height 0.3s ease-in-out',
              }}
            />
            <Typography variant="caption" sx={{ mt: 1, textAlign: 'center' }}>{item.name}</Typography>
          </Box>
        ))}
      </Box>
      {xAxisLabel && <Typography variant="caption" sx={{ textAlign: 'center', mt: 1 }}>{xAxisLabel}</Typography>}
      {yAxisLabel && <Typography variant="caption" sx={{ writingMode: 'vertical-lr', transform: 'rotate(180deg)', mr: 1 }}>{yAxisLabel}</Typography>}
    </Paper>
  );
};

export default BarChart;
