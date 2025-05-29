// frontend/src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { Container, Box, Typography, TextField, Button, CircularProgress, Alert as MuiAlert, Paper } from '@mui/material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import apiService from '../services/apiService'; // Your Axios instance
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { ApiError } from '../types/api';

const RegisterSchema = Yup.object().shape({
    fullName: Yup.string().required('Full name is required'),
    username: Yup.string().min(3, 'Username must be at least 3 characters').required('Username is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
});


const RegisterPage: React.FC = () => {
    const navigate = useNavigate();
    const [error, setError] = useState<string | null>(null);
    // const { login } = useAuth(); // If using context and auto-login after register

    const formik = useFormik({
        initialValues: {
        fullName: '',
        username: '',
        email: '',
        password: '',
        confirmPassword: '',
        },
        validationSchema: RegisterSchema,
        onSubmit: async (values, { setSubmitting }) => {
        setError(null);
        try {
            const { confirmPassword, ...registerData } = values; // Exclude confirmPassword
            await apiService.post('/auth/register', registerData);
            // Optional: auto-login user or show success message and redirect
            // const loginResponse = await apiService.post('/auth/login', { emailOrUsername: values.email, password: values.password });
            // login(loginResponse.data.accessToken, loginResponse.data.user); // Context login
            // OR use Redux dispatch for login
            navigate('/login', { state: { message: "Registration successful! Please log in." } });
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Registration failed. Please try again.');
            console.error("Registration error:", apiError);
        } finally {
            setSubmitting(false);
        }
        }
    });


    return (
        <Container component="main" maxWidth="xs" className="min-h-screen flex items-center justify-center">
        <Paper elevation={6} className="p-8 rounded-lg bg-dlp-surface shadow-xl w-full">
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Typography component="h1" variant="h5" className="font-semibold text-dlp-text-primary">
                Create Account
            </Typography>
            <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 3 }} className="w-full">
                {error && <MuiAlert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</MuiAlert>}
                <TextField
                margin="normal" required fullWidth id="fullName" label="Full Name" name="fullName"
                autoComplete="name" autoFocus
                value={formik.values.fullName} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.fullName && Boolean(formik.errors.fullName)}
                helperText={formik.touched.fullName && formik.errors.fullName}
                disabled={formik.isSubmitting}
                />
                <TextField
                margin="normal" required fullWidth id="username" label="Username" name="username"
                autoComplete="username"
                value={formik.values.username} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.username && Boolean(formik.errors.username)}
                helperText={formik.touched.username && formik.errors.username}
                disabled={formik.isSubmitting}
                />
                <TextField
                margin="normal" required fullWidth id="email" label="Email Address" name="email"
                autoComplete="email"
                value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                disabled={formik.isSubmitting}
                />
                <TextField
                margin="normal" required fullWidth name="password" label="Password" type="password" id="password"
                autoComplete="new-password"
                value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.password && Boolean(formik.errors.password)}
                helperText={formik.touched.password && formik.errors.password}
                disabled={formik.isSubmitting}
                />
                <TextField
                margin="normal" required fullWidth name="confirmPassword" label="Confirm Password" type="password" id="confirmPassword"
                autoComplete="new-password"
                value={formik.values.confirmPassword} onChange={formik.handleChange} onBlur={formik.handleBlur}
                error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                disabled={formik.isSubmitting}
                />
                <Button type="submit" fullWidth variant="contained" sx={{ mt: 3, mb: 2 }} disabled={formik.isSubmitting} className="bg-primary hover:bg-primary-dark">
                {formik.isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
                </Button>
                <Box textAlign="center">
                <Typography variant="body2">
                    Already have an account?{' '}
                    <MuiLink component={RouterLink} to="/login" variant="body2" className="text-primary-light hover:underline">
                    Sign In
                    </MuiLink>
                </Typography>
                </Box>
            </Box>
            </Box>
        </Paper>
        </Container>
    );
};

export default RegisterPage;