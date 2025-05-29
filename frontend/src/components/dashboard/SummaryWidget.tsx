// frontend/src/components/dashboard/SummaryWidget.tsx
import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, Avatar } from '@mui/material';
import { Icon } from '@mui/material'; // For using string-based icons or SVG icons

interface SummaryWidgetProps {
    title: string;
    value: string | number;
    icon: React.ReactElement; // e.g., <NotificationsIcon />
    color?: string; // Tailwind color class e.g., 'bg-blue-500' or MUI color
    isLoading?: boolean;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

const SummaryWidget: React.FC<SummaryWidgetProps> = ({ title, value, icon, color = 'bg-dlp-accent', isLoading, trend, trendValue }) => {
    return (
        <Card className="shadow-lg h-full bg-dlp-surface"> {/* Tailwind: shadow-lg */}
        <CardContent className="flex flex-col justify-between h-full">
            <Box className="flex justify-between items-start">
            <Typography variant="h6" component="h3" className="font-semibold text-dlp-text-secondary">
                {title}
            </Typography>
            <Avatar sx={{ bgcolor: color, width: 40, height: 40 }} className={`p-2 ${color}`}> {/* Tailwind can be used for bgcolor if not using sx */}
                {React.cloneElement(icon, { className: 'text-white' })}
            </Avatar>
            </Box>
            <Box className="mt-2">
            {isLoading ? (
                <CircularProgress size={36} />
            ) : (
                <Typography variant="h3" component="p" className="font-bold text-dlp-text-primary">
                {value}
                </Typography>
            )}
            </Box>
            {trend && trendValue && !isLoading && (
            <Typography variant="body2" className={`mt-1 flex items-center ${
                trend === 'up' ? 'text-green-500' : trend === 'down' ? 'text-red-500' : 'text-dlp-text-secondary'
            }`}>
                {/* Add trend icon here if desired */}
                {trendValue}
            </Typography>
            )}
        </CardContent>
        </Card>
    );
};

export default SummaryWidget;