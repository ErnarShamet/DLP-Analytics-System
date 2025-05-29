// frontend/src/services/apiService.ts

import axios from 'axios';
import { store } from '../store'; // Import your Redux store
import { logout } from '../store/slices/authSlice'; // Import logout action

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

const apiService = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the auth token to requests
apiService.interceptors.request.use(
    (config) => {
        const token = store.getState().auth.token; // Get token from Redux store
        // Or: const token = localStorage.getItem('authToken'); // If using localStorage directly
        if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor to handle errors, e.g., 401 Unauthorized
apiService.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        if (error.response && error.response.status === 401) {
        // Handle unauthorized errors (e.g., token expired)
        // Dispatch logout action or redirect to login
        console.error("Unauthorized access - 401 Error. Logging out.");
        store.dispatch(logout()); // Dispatch logout action
        // window.location.href = '/login'; // Force redirect if not handled by ProtectedRoute
        }
        // You can add more error handling here (e.g., for 403, 500)
        return Promise.reject(error.response ? error.response.data : error); // Return error.response.data for easier access in components
    }
);

export default apiService;
