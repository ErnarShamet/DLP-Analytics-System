// frontend/src/App.tsx
import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline, CircularProgress, Box } from '@mui/material';
import { QueryClient, QueryClientProvider } from 'react-query'; // For React Query
import { Provider as ReduxProvider } from 'react-redux'; // For Redux
import { store } from './store'; // Your Redux store

import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
// import AuthProvider from './contexts/AuthContext'; // If using simple context for auth

// MUI Theme (example dark theme)
const muiTheme = createTheme({
    palette: {
        mode: 'dark', // MUI dark mode
        primary: {
        main: '#06b6d4', // Matches Tailwind primary
        },
        secondary: {
        main: '#ec4899', // Matches Tailwind secondary
        },
        background: {
        default: '#1a202c', // Matches Tailwind dlp-bg
        paper: '#2d3748',   // Matches Tailwind dlp-surface
        },
        text: {
        primary: '#e2e8f0',
        secondary: '#a0aec0',
        }
    },
    typography: {
        fontFamily: 'Inter, sans-serif',
    },
    components: {
        // Example: Default props for Button
        MuiButton: {
        defaultProps: {
            disableElevation: true,
        }
        }
    }
});

// React Query Client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
        retry: 1, // Retry failed queries once
        refetchOnWindowFocus: false, // Optional: disable refetch on window focus
        },
    },
});

// Lazy load pages
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const AlertsPage = lazy(() => import('./pages/AlertsPage'));
const AlertDetailPage = lazy(() => import('./pages/AlertDetailPage'));
const PolicyPage = lazy(() => import('./pages/PolicyPage')); // Renamed from PolicyManagementPage
const IncidentPage = lazy(() => import('./pages/IncidentPage')); // Renamed from IncidentManagementPage
const UserManagementPage = lazy(() => import('./pages/admin/UserManagementPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

function App() {
    // Simple check for demo, replace with robust auth state from Redux/Context
    // const isAuthenticated = !!localStorage.getItem('authToken');

    return (
        <ReduxProvider store={store}>
        <QueryClientProvider client={queryClient}>
            {/* <AuthProvider> */}
            <ThemeProvider theme={muiTheme}>
                <CssBaseline /> {/* Normalize CSS and apply theme baseline */}
                <Router>
                <Suspense
                    fallback={
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', bgcolor: 'background.default' }}>
                        <CircularProgress />
                    </Box>
                    }
                >
                    <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />

                    {/* Protected Routes */}
                    <Route element={<ProtectedRoute allowedRoles={['User', 'Analyst', 'IncidentResponder', 'Admin', 'SuperAdmin']} />}>
                        <Route element={<MainLayout />}>
                        <Route path="/" element={<Navigate replace to="/dashboard" />} />
                        <Route path="/dashboard" element={<DashboardPage />} />
                        <Route path="/alerts" element={<AlertsPage />} />
                        <Route path="/alerts/:alertId" element={<AlertDetailPage />} />
                        <Route path="/policies" element={<PolicyPage />} />
                        <Route path="/incidents" element={<IncidentPage />} />
                        {/* Admin specific routes */}
                        <Route
                            path="/admin/users"
                            element={
                            <ProtectedRoute allowedRoles={['Admin', 'SuperAdmin']}>
                                <UserManagementPage />
                            </ProtectedRoute>
                            }
                        />
                        {/* Add more protected routes here */}
                        </Route>
                    </Route>

                    <Route path="*" element={<NotFoundPage />} />
                    </Routes>
                </Suspense>
                </Router>
            </ThemeProvider>
            {/* </AuthProvider> */}
        </QueryClientProvider>
        </ReduxProvider>
    );
}

export default App;