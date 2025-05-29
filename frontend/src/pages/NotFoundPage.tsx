// frontend/src/pages/NotFoundPage.tsx
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined'; // Example Icon

const NotFoundPage: React.FC = () => {
    return (
        <Box
        className="min-h-screen flex flex-col items-center justify-center text-center p-4 bg-dlp-bg"
        >
        <ReportProblemOutlinedIcon sx={{ fontSize: '6rem', color: 'warning.main', mb: 2 }} />
        <Typography variant="h1" component="h1" className="text-6xl font-bold text-dlp-text-primary mb-4">
            404
        </Typography>
        <Typography variant="h5" component="h2" className="text-2xl font-medium text-dlp-text-secondary mb-6">
            Oops! Page Not Found.
        </Typography>
        <Typography variant="body1" className="text-dlp-text-secondary mb-8 max-w-md">
            The page you are looking for might have been removed, had its name changed,
            or is temporarily unavailable.
        </Typography>
        <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/dashboard"
            className="bg-primary hover:bg-primary-dark"
        >
            Go to Dashboard
        </Button>
        </Box>
    );
};

export default NotFoundPage;