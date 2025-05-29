// frontend/src/store/slices/authSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/apiService';
import { User, AuthState, LoginCredentials, RegisterData } from '../../types'; 
import { ApiError } from '../../types/api'; 

// Начальное состояние
const initialState: AuthState = {
    user: JSON.parse(localStorage.getItem('user') || 'null'),
    token: localStorage.getItem('authToken'),
    isAuthenticated: !!localStorage.getItem('authToken') && !!localStorage.getItem('user'),
    isLoading: false,
    error: null,
};

// Async thunk для входа пользователя
export const loginUser = createAsyncThunk<
    { token: string; user: User }, // Возвращаемый тип успешного выполнения
    LoginCredentials,             // Аргументы thunk
    { rejectValue: ApiError }     // Тип для ошибки
    >(
    'auth/loginUser',
    async (credentials, { rejectWithValue }) => {
        try {
        const response = await apiService.post<{ accessToken: string; user: User }>('/auth/login', credentials);
        localStorage.setItem('authToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        apiService.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
        return { token: response.data.accessToken, user: response.data.user };
        } catch (err: any) {
        const errorData = err.response?.data || { message: err.message || 'Login failed' };
        return rejectWithValue(errorData as ApiError);
        }
    }
);

// Async thunk для регистрации пользователя
export const registerUser = createAsyncThunk<
    { token: string; user: User }, 
    RegisterData,
    { rejectValue: ApiError }
    >(
    'auth/registerUser',
    async (registerData, { rejectWithValue }) => {
        try {
        const response = await apiService.post<{ accessToken: string; user: User }>('/auth/register', registerData);
        localStorage.setItem('authToken', response.data.accessToken);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        apiService.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
        return { token: response.data.accessToken, user: response.data.user };
        } catch (err: any) {
        const errorData = err.response?.data || { message: err.message || 'Registration failed' };
        return rejectWithValue(errorData as ApiError);
        }
    }
);

// Async thunk для получения текущего пользователя (например, при загрузке приложения, если токен существует)
export const fetchCurrentUser = createAsyncThunk<
    User,
    void, // Нет аргументов
    { rejectValue: ApiError; state: { auth: AuthState } } // Добавляем state для getState
    >(
    'auth/fetchCurrentUser',
    async (_, { rejectWithValue, getState }) => {
        const token = getState().auth.token || localStorage.getItem('authToken'); 
        if (!token) {
        return rejectWithValue({ message: 'No token found' } as ApiError);
        }
        
        if (!apiService.defaults.headers.common['Authorization'] && token) {
            apiService.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }

        try {
        const response = await apiService.get<{ data: User }>('/auth/me'); 
        localStorage.setItem('user', JSON.stringify(response.data.data));
        return response.data.data;
        } catch (err: any) {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        if (apiService.defaults.headers.common) {
            delete apiService.defaults.headers.common['Authorization'];
        }
        const errorData = err.response?.data || { message: err.message || 'Failed to fetch current user' };
        return rejectWithValue(errorData as ApiError);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        if (apiService.defaults.headers.common) {
            delete apiService.defaults.headers.common['Authorization'];
        }
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
        state.isLoading = false;
        },
        clearAuthError: (state) => {
        state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
        // Login User
        .addCase(loginUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(loginUser.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;
        })
        .addCase(loginUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null;
            state.error = action.payload ? action.payload.message : (action.error.message || 'Login failed');
        })
        // Register User
        .addCase(registerUser.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(registerUser.fulfilled, (state, action: PayloadAction<{ token: string; user: User }>) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.error = null;
        })
        .addCase(registerUser.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload ? action.payload.message : (action.error.message || 'Registration failed');
        })
        // Fetch Current User
        .addCase(fetchCurrentUser.pending, (state) => {
            state.isLoading = true; 
            state.error = null;
        })
        .addCase(fetchCurrentUser.fulfilled, (state, action: PayloadAction<User>) => {
            state.isLoading = false;
            state.isAuthenticated = true;
            state.user = action.payload;
            if (!state.token) state.token = localStorage.getItem('authToken');
        })
        .addCase(fetchCurrentUser.rejected, (state, action) => {
            state.isLoading = false;
            state.isAuthenticated = false;
            state.user = null;
            state.token = null; 
        });
    },
});

export const { logout, clearAuthError } = authSlice.actions;

// Селекторы
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated;
export const selectUser = (state: { auth: AuthState }) => state.auth.user;
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.isLoading;
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error;
export const selectAuthToken = (state: { auth: AuthState }) => state.auth.token;


export default authSlice.reducer;
