"use client";
import { Box, Typography, Tooltip, Paper, Skeleton } from '@mui/material';

const PieChart = ({ data, title, loading }) => {

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
                <Skeleton variant="text" width="60%" height={28} sx={{mb: 2}}/>

                {/* Circle Skeleton */}
                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <Skeleton variant="circular" width={150} height={150} sx={{mb: 2}}/>
                </Box>

                {/* Legend Skeleton */}
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                    {[1, 2, 3].map((i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Skeleton variant="circular" width={12} height={12} />
                            <Skeleton variant="text" width={60} height={16} />
                        </Box>
                    ))}
                </Box>
            </Paper>
        );
    }

    if (!data || data.length === 0) {
        return (
            <Paper sx={{ p: 3, height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6">{title}</Typography>
                <Typography color="text.secondary">No data available</Typography>
            </Paper>
        );
    }

    const total = data.reduce((acc, item) => acc + item.value, 0);
    
    if (total === 0) {
        return (
            <Paper sx={{ p: 3, height: "100%", display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <Typography variant="h6">{title}</Typography>
                <Typography color="text.secondary">No data to display</Typography>
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
                            <Tooltip key={item.name} title={`${item.name}: ${item.value}`} arrow placement="top">
                                <circle
                                    cx="20" cy="20" r={radius}
                                    fill="transparent"
                                    stroke={item.color}
                                    strokeWidth="6"
                                    strokeDasharray={`${arcLength} ${circumference}`}
                                    style={{
                                        transform: `rotate(${rotation}deg)`,
                                        transformOrigin: '20px 20px',
                                        transition: 'all 0.5s ease'
                                    }}
                                />
                            </Tooltip>
                        );
                    })}
                </svg>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 2 }}>
                {data.map((item) => (
                    <Box key={item.name} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: item.color }} />
                        <Typography variant="caption">{item.name} ({item.value})</Typography>
                    </Box>
                ))}
            </Box>
        </Paper>
    );
};

export default PieChart;