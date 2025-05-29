// frontend/src/components/dashboard/SummaryWidget.tsx

import React from 'react';
import { Card, CardContent, Typography, Box, CircularProgress, Avatar } from '@mui/material';
// import { Icon } from '@mui/material'; // Not used directly, React.ReactElement for icon

interface SummaryWidgetProps {
    title: string;
    value: string | number;
    icon: React.ReactElement; // e.g., <NotificationsIcon />
    color?: string; // Tailwind color class for background e.g., 'bg-blue-500'
    iconColor?: string; // Tailwind color class for icon e.g., 'text-white'
    isLoading?: boolean;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
}

const SummaryWidget: React.FC<SummaryWidgetProps> = ({ title, value, icon, color = 'bg-dlp-accent', iconColor = 'text-white', isLoading, trend, trendValue }) => {
    return (
        <Card className="shadow-lg h-full bg-dlp-surface"> 
        <CardContent className="flex flex-col justify-between h-full p-4">
            <Box className="flex justify-between items-start">
            <Typography variant="h6" component="h3" className="font-semibold text-dlp-text-secondary">
                {title}
            </Typography>
            <Avatar sx={{ width: 40, height: 40 }} className={`p-2 ${color}`}> 
                {React.cloneElement(icon, { className: iconColor })}
            </Avatar>
            </Box>
            <Box className="mt-2">
            {isLoading ? (
                <CircularProgress size={36} className="text-dlp-accent"/>
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
