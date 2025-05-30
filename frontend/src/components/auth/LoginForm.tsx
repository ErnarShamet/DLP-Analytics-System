// frontend/src/components/auth/LoginForm.tsx

import React, { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { TextField, Button, Box, Typography, CircularProgress, Alert as MuiAlert, Link as MuiLink } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useAppDispatch } from '../../store/hooks';
import { loginUser } from '../../store/slices/authSlice'; 
import { ApiError } from '../../types/api'; 

const LoginSchema = Yup.object().shape({
    emailOrUsername: Yup.string().required('Email or Username is required'),
    password: Yup.string().required('Password is required'),
});

const LoginForm: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const [error, setError] = useState<string | null>(null);

    const formik = useFormik({
        initialValues: {
        emailOrUsername: '',
        password: '',
        },
        validationSchema: LoginSchema,
        onSubmit: async (values, { setSubmitting }) => {
        setError(null);
        try {
            await dispatch(loginUser(values)).unwrap(); 
            navigate('/dashboard', { replace: true });
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Login failed. Please check your credentials.');
            console.error("Login error:", apiError);
        } finally {
            setSubmitting(false);
        }
        },
    });

    return (
        <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1 }} className="w-full">
        {error && <MuiAlert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</MuiAlert>}
        <TextField
            margin="normal"
            required
            fullWidth
            id="emailOrUsername"
            label="Email Address or Username"
            name="emailOrUsername"
            autoComplete="email"
            autoFocus
            value={formik.values.emailOrUsername}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.emailOrUsername && Boolean(formik.errors.emailOrUsername)}
            helperText={formik.touched.emailOrUsername && formik.errors.emailOrUsername}
            disabled={formik.isSubmitting}
            InputLabelProps={{ className: 'text-dlp-text-secondary' }}
            InputProps={{ className: 'text-dlp-text-primary bg-dlp-surface' }}
        />
        <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            disabled={formik.isSubmitting}
            InputLabelProps={{ className: 'text-dlp-text-secondary' }}
            InputProps={{ className: 'text-dlp-text-primary bg-dlp-surface' }}
        />
        {/* Add Remember Me, Forgot Password later */}
        <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={formik.isSubmitting}
            className="bg-primary hover:bg-primary-dark text-white"
        >
            {formik.isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
        </Button>
        <Box textAlign="center">
            <Typography variant="body2" className="text-dlp-text-secondary">
            Don't have an account?{' '}
            <MuiLink component={RouterLink} to="/register" variant="body2" className="text-primary-light hover:underline">
                Sign Up
            </MuiLink>
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }} className="text-dlp-text-secondary">
                <MuiLink component={RouterLink} to="/forgot-password" variant="body2" className="text-primary-light hover:underline">
                Forgot password?
                </MuiLink>
            </Typography>
        </Box>
        </Box>
    );
};

export default LoginForm;
