// frontend/src/components/auth/ForgotPasswordForm.tsx
import React, { useState } from 'react';
import { Box, TextField, Button, Typography, CircularProgress, Alert as MuiAlert } from '@mui/material';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import apiService from '../../services/apiService'; // Ваш API сервис
import { ApiError } from '../../types/api';

const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email address').required('Email is required'),
});

const ForgotPasswordForm: React.FC = () => {
    const [message, setMessage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    const formik = useFormik({
        initialValues: {
            email: '',
        },
        validationSchema: ForgotPasswordSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            setError(null);
            setMessage(null);
            try {
                // Бэкенд authController.js для forgotPassword возвращает data: 'If an account...'
                // Он не возвращает ошибку, если email не найден, для безопасности.
                const response = await apiService.post('/auth/forgotpassword', { email: values.email });
                setMessage(response.data.data || 'If your email is registered, a password reset link has been sent.');
                resetForm();
            } catch (err) {
                const apiError = err as ApiError;
                setError(apiError.message || 'Failed to send reset link. Please try again.');
                console.error("Forgot Password error:", apiError);
            } finally {
                setSubmitting(false);
            }
        },
    });

    return (
        <Box component="form" onSubmit={formik.handleSubmit} noValidate sx={{ mt: 1 }} className="w-full">
            <Typography variant="h6" gutterBottom align="center">
                Forgot Your Password?
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center" sx={{ mb: 3 }}>
                No worries! Enter your email address below and we'll send you a link to reset your password.
            </Typography>

            {error && <MuiAlert severity="error" sx={{ width: '100%', mb: 2 }}>{error}</MuiAlert>}
            {message && <MuiAlert severity="success" sx={{ width: '100%', mb: 2 }}>{message}</MuiAlert>}

            <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                autoFocus
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
                disabled={formik.isSubmitting}
            />
            <Button
                type="submit"
                fullWidth
                variant="contained"
                sx={{ mt: 3, mb: 2 }}
                disabled={formik.isSubmitting}
                className="bg-primary hover:bg-primary-dark text-white"
            >
                {formik.isSubmitting ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
            </Button>
        </Box>
    );
};

export default ForgotPasswordForm;