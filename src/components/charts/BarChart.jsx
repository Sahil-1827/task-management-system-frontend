"use client";
import React from 'react';
import {
  Box,
  Typography,
  Paper,
  useTheme,
  Tooltip,
  Skeleton
} from '@mui/material';

const BarChart = ({ data, title, loading, xAxisLabel }) => {
  const theme = useTheme();

  if (loading) {
    return (
      <Paper
        sx={{
          p: 3,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Title */}
        <Skeleton variant="text" width="60%" height={28} />

        {/* Bars skeleton */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-around',
            mt: 2
          }}
        >
          {[1, 2, 3].map((i) => (
            <Box
              key={i}
              sx={{
                width: '20%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 1
              }}
            >
              <Skeleton
                variant="rectangular"
                width="100%"
                height={90 + i * 20}
                sx={{ borderRadius: '4px 4px 0 0' }}
              />
              <Skeleton variant="text" width={30} height={16} />
            </Box>
          ))}
        </Box>
          <Skeleton variant="text" width="100%" height={5} sx={{mt: 1}}/>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper
        sx={{
          p: 3,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <Typography variant="h6">{title}</Typography>
        <Typography color="text.secondary">No data available</Typography>
      </Paper>
    );
  }

  const maxValue = Math.max(...data.map(item => item.value));

  return (
    <Paper
      sx={{
        p: 3,
        height: '100%',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>

      <Box
        sx={{
          flexGrow: 1,
          height: '100%',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-around',
          py: 2,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}
      >
        {data.map((item, index) => (
          <Box
            key={`${item.name}-${index}`}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              width: `${100 / data.length}%`,
              px: 0.5,
              height: '100%',
              justifyContent: 'flex-end',
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
                  transition: 'height 0.3s ease',
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