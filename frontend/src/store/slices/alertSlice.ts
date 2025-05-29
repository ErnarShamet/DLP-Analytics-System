// frontend/src/store/slices/alertSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiService from '../../services/apiService';
import { Alert, AlertState } from '../../types'; // Используем AlertState
import { ApiError, PaginatedResponse } from '../../types/api';

const initialState: AlertState = {
    alerts: [],
    currentAlert: null,
    isLoading: false,
    error: null,
    pagination: null,
};

// Async thunk для получения списка оповещений
export const fetchAlerts = createAsyncThunk<
    PaginatedResponse<Alert>, // Возвращаемый тип
    { page?: number; limit?: number; sort?: string; filters?: Record<string, any> } | void, // Аргументы
    { rejectValue: ApiError }
    >(
    'alerts/fetchAlerts',
    async (params, { rejectWithValue }) => {
        try {
        const response = await apiService.get<PaginatedResponse<Alert>>('/alerts', { params });
        return response.data;
        } catch (err: any) {
        return rejectWithValue(err.response?.data as ApiError || { message: 'Failed to fetch alerts' });
        }
    }
);

// Async thunk для получения одного оповещения
export const fetchAlertById = createAsyncThunk<
    Alert,
    string, // ID оповещения
    { rejectValue: ApiError }
    >(
    'alerts/fetchAlertById',
    async (alertId, { rejectWithValue }) => {
        try {
        const response = await apiService.get<{ data: Alert }>(`/alerts/${alertId}`);
        return response.data.data;
        } catch (err: any) {
        return rejectWithValue(err.response?.data as ApiError || { message: 'Failed to fetch alert details' });
        }
    }
);

// Async thunk для обновления оповещения
export const updateAlert = createAsyncThunk<
    Alert,
    { id: string; data: Partial<Alert> },
    { rejectValue: ApiError }
    >(
    'alerts/updateAlert',
    async ({ id, data }, { rejectWithValue }) => {
        try {
        const response = await apiService.put<{ data: Alert }>(`/alerts/${id}`, data);
        return response.data.data;
        } catch (err: any) {
        return rejectWithValue(err.response?.data as ApiError || { message: 'Failed to update alert' });
        }
    }
);


const alertSlice = createSlice({
    name: 'alerts',
    initialState,
    reducers: {
        clearAlertError: (state) => {
        state.error = null;
        },
        // Можно добавить редьюсеры для локального обновления состояния, если нужно
    },
    extraReducers: (builder) => {
        builder
        // Fetch Alerts
        .addCase(fetchAlerts.pending, (state) => {
            state.isLoading = true;
            state.error = null;
        })
        .addCase(fetchAlerts.fulfilled, (state, action: PayloadAction<PaginatedResponse<Alert>>) => {
            state.isLoading = false;
            state.alerts = action.payload.data;
            state.pagination = { // Пример, если ваш API возвращает count для пагинации
                count: action.payload.count,
                page: (action.meta.arg as { page?: number })?.page || 0, // Извлекаем из аргументов thunk
                pageSize: (action.meta.arg as { limit?: number })?.limit || 10,
            };
        })
        .addCase(fetchAlerts.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload?.message || action.error.message || 'Failed to load alerts';
        })
        // Fetch Alert By ID
        .addCase(fetchAlertById.pending, (state) => {
            state.isLoading = true;
            state.currentAlert = null;
            state.error = null;
        })
        .addCase(fetchAlertById.fulfilled, (state, action: PayloadAction<Alert>) => {
            state.isLoading = false;
            state.currentAlert = action.payload;
        })
        .addCase(fetchAlertById.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload?.message || action.error.message || 'Failed to load alert detail';
        })
        // Update Alert
        .addCase(updateAlert.pending, (state) => {
            state.isLoading = true; // Или можно использовать отдельный флаг `isUpdating`
        })
        .addCase(updateAlert.fulfilled, (state, action: PayloadAction<Alert>) => {
            state.isLoading = false;
            state.currentAlert = action.payload; // Обновляем текущее открытое оповещение
            // Также обновляем оповещение в общем списке
            const index = state.alerts.findIndex(alert => alert._id === action.payload._id);
            if (index !== -1) {
            state.alerts[index] = action.payload;
            }
        })
        .addCase(updateAlert.rejected, (state, action) => {
            state.isLoading = false;
            state.error = action.payload?.message || action.error.message || 'Failed to update alert';
        });
    },
});

export const { clearAlertError } = alertSlice.actions;

// Селекторы
export const selectAllAlerts = (state: { alerts: AlertState }) => state.alerts.alerts;
export const selectCurrentAlert = (state: { alerts: AlertState }) => state.alerts.currentAlert;
export const selectAlertsLoading = (state: { alerts: AlertState }) => state.alerts.isLoading;
export const selectAlertsError = (state: { alerts: AlertState }) => state.alerts.error;
export const selectAlertsPagination = (state: { alerts: AlertState }) => state.alerts.pagination;


export default alertSlice.reducer;