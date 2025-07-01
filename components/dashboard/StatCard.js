"use client";
import { Card, CardContent, Typography, Box, Avatar } from '@mui/material';

const StatCard = ({ title, value, icon, color }) => {
  return (
    <Card sx={{ 
      display: 'flex', 
      alignItems: 'center', 
      p: 3, 
      backgroundColor: 'background.paper',
      borderRadius: '16px',
      boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)'
    }}>
      <Avatar sx={{
        bgcolor: color,
        width: 56,
        height: 56,
        mr: 2
      }}>
        {icon}
      </Avatar>
      <Box>
        <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{value}</Typography>
        <Typography variant="body2" color="text.secondary">{title}</Typography>
      </Box>
    </Card>
  );
};

export default StatCard;