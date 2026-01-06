"use client";
import { Card, Typography, Box, Avatar, Skeleton } from '@mui/material';

const StatCard = ({ title, value, icon, color, loading }) => {
  if (loading) {
    return (
      <Card
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 3,
          borderRadius: '16px',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
          minWidth: 150
        }}
      >
        <Skeleton
          variant="circular"
          width={50}
          height={50}
          sx={{ mr: 2 }}
        />
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width={50} height={35} />
          <Skeleton variant="text" width={70} height={20} />
        </Box>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        display: 'flex',
        alignItems: 'center',
        p: 3,
        backgroundColor: 'background.paper',
        borderRadius: '16px',
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
        minWidth: 150
      }}
    >
      <Avatar
        sx={{
          bgcolor: color,
          width: 50,
          height: 50,
          mr: 2
        }}
      >
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
          {value}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {title}
        </Typography>
      </Box>
    </Card>
  );
};

export default StatCard;