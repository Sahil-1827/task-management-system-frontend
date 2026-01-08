import { Paper, Typography, Box, Skeleton, useTheme, alpha } from '@mui/material';

const ChartCard = ({ title, children, loading, action, chartType = 'bar' }) => {
    const theme = useTheme();

    const renderSkeleton = () => {
        if (chartType === 'doughnut' || chartType === 'pie') {
            return (
                <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <Skeleton variant="circular" width={220} height={220} animation="wave" />
                </Box>
            );
        }

        if (chartType === 'horizontalBar') {
            return (
                <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'space-around', px: 2, py: 1 }}>
                    {[1, 2, 3, 4, 5].map((i) => (
                        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2, width: '100%' }}>
                            <Skeleton variant="text" width={60} />
                            <Skeleton
                                variant="rectangular"
                                width={`${Math.random() * (90 - 40) + 40}%`}
                                height={24}
                                sx={{ borderRadius: 1 }}
                                animation="wave"
                            />
                        </Box>
                    ))}
                </Box>
            );
        }

        // Default to 'bar' skeleton
        return (
            <Box sx={{ width: '100%', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', px: 2, pb: 4 }}>
                {[1, 2, 3, 4, 5].map((i) => (
                    <Skeleton
                        key={i}
                        variant="rectangular"
                        width="15%"
                        height={`${Math.random() * (85 - 40) + 40}%`}
                        sx={{ borderRadius: 1.5 }}
                        animation="wave"
                    />
                ))}
            </Box>
        );
    }

    return (
        <Paper
            sx={{
                p: 3,
                height: '100%',
                borderRadius: 4,
                border: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: theme.palette.mode === 'dark',
                overflow: 'hidden',
                position: 'relative'
            }}
            elevation={0}
        >
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" fontWeight="bold">
                    {title}
                </Typography>
                {action && <Box>{action}</Box>}
            </Box>

            {/* Content */}
            <Box sx={{ flexGrow: 1, position: 'relative', minHeight: 250 }}>
                {loading ? (
                    renderSkeleton()
                ) : (
                    children
                )}
            </Box>

            {/* Background Decoration (optional) */}
            <Box sx={{
                position: 'absolute',
                bottom: -50,
                right: -50,
                width: 150,
                height: 150,
                borderRadius: '50%',
                bgcolor: alpha(theme.palette.primary.main, 0.03),
                zIndex: 0,
                pointerEvents: 'none'
            }} />
        </Paper>
    );
};

export default ChartCard;
