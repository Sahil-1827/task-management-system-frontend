"use client";
import React from 'react';
import { Box, Typography, Paper, useTheme, Tooltip } from '@mui/material';

const BarChart = ({ data, title, xAxisLabel, yAxisLabel }) => {
  const theme = useTheme();

  // FIX: Handle null, undefined, or empty data to prevent crash
  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" gutterBottom>{title}</Typography>
        <Typography color="text.secondary">No data available</Typography>
      </Paper>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h6" gutterBottom>{title}</Typography>
      <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', py: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
        {data.map((item, index) => (
          <Box
            key={`${item.name}-${index}`} // FIX: Use a unique key
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: '100%',
              px: 0.5,
            }}
          >
            <Tooltip title={`${item.name}: ${item.value}`} placement="top" arrow>
              <Box
                sx={{
                  width: '60%',
                  height: maxValue > 0 ? `${(item.value / maxValue) * 100}%` : '0%',
                  minHeight: '4px',
                  bgcolor: item.color || theme.palette.primary.main,
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s ease-in-out',
                   '&:hover': {
                      opacity: 0.8
                  }
                }}
              />
            </Tooltip>
            <Typography variant="caption" sx={{ mt: 1, textAlign: 'center', whiteSpace: 'nowrap' }}>{item.name}</Typography>
          </Box>
        ))}
      </Box>
      {xAxisLabel && <Typography variant="caption" sx={{ textAlign: 'center', mt: 1 }}>{xAxisLabel}</Typography>}
    </Paper>
  );
};

export default BarChart;