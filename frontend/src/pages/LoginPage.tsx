// frontend/src/pages/LoginPage.tsx
import React from 'react';
import { Container, Box, Typography, Paper } from '@mui/material';
import LoginForm from '../components/auth/LoginForm'; // Import the LoginForm
// import { useAuth } from '../contexts/AuthContext'; // If using context
import { Navigate } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectIsAuthenticated } from '../store/slices/authSlice';

// Example: Add a logo
// import AppLogo from '../assets/images/logo-dark.svg'; // Make sure you have a logo

const LoginPage: React.FC = () => {
    const isAuthenticated = useAppSelector(selectIsAuthenticated);
    // const { isAuthenticated, isLoading } = useAuth(); // If using context

    // if (isLoading && !isAuthenticated) return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><CircularProgress /></Box>; // Loading state from context
    if (isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <Container component="main" maxWidth="xs" className="min-h-screen flex items-center justify-center">
        <Paper elevation={6} className="p-8 rounded-lg bg-dlp-surface shadow-xl w-full">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* <img src={AppLogo} alt="App Logo" style={{ marginBottom: '1rem', height: '50px' }} /> */}
            <Typography component="h1" variant="h5" className="font-semibold text-dlp-text-primary">
                Sign In
            </Typography>
            <Typography variant="body2" className="text-dlp-text-secondary mt-1 mb-4">
                Welcome back to {process.env.REACT_APP_NAME || "DLP Analytics"}
            </Typography>
            <LoginForm />
            </Box>
        </Paper>
        </Container>
    );
};

export default LoginPage;