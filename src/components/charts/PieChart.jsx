"use client";
import { Box, Typography, Tooltip, Paper } from '@mui/material';

const PieChart = ({ data, title }) => {
    if (!data || data.length === 0) {
        return (
            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6" gutterBottom>{title}</Typography>
                <Typography color="text.secondary">No data available</Typography>
            </Paper>
        );
    }

    const total = data.reduce((acc, item) => acc + item.value, 0);
    
    if (total === 0) {
        return (
            <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6" gutterBottom>{title}</Typography>
                <Typography color="text.secondary">No data to display in chart</Typography>
            </Paper>
        );
    }

    let cumulativeAngle = 0;
    const radius = 15.915;
    const circumference = 2 * Math.PI * radius;

    return (
        <Paper sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" gutterBottom>{title}</Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexGrow: 1, my: 2 }}>
                <svg width="150" height="150" viewBox="0 0 40 40">
                    {data.map((item) => {
                        if (item.value === 0) return null;

                        const percentage = (item.value / total) * 100;
                        const arcLength = (percentage / 100) * circumference;
                        const rotation = cumulativeAngle - 90;
                        cumulativeAngle += (percentage / 100) * 360;

                        return (
                            // Using item.id as the key if available, otherwise fallback to item.name
                            <Tooltip key={item.id || item.name} title={`${item.name}: ${item.value}`} placement="top" arrow>
                                <circle
                                    cx="20" cy="20" r={radius}
                                    fill="transparent"
                                    stroke={item.color}
                                    strokeWidth="6"
                                    strokeDasharray={`${arcLength} ${circumference}`}
                                    style={{
                                        transform: `rotate(${rotation}deg)`,
                                        transformOrigin: '20px 20px',
                                        transition: 'all 0.5s ease-out'
                                    }}
                                />
                            </Tooltip>
                        );
                    })}
                </svg>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
                {data.map((item) => (
                    // Using item.id as the key if available, otherwise fallback to item.name
                    <Box key={item.id || item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                        <Typography variant="caption">{item.name} ({item.value})</Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};

export default PieChart;