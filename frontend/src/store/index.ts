// frontend/src/store/index.ts

import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import alertReducer from './slices/alertSlice'; // Example for alerts
// Import other reducers here
// import policyReducer from './slices/policySlice';
// import incidentReducer from './slices/incidentSlice';
// import userManagementReducer from './slices/userManagementSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        alerts: alertReducer,
        // policies: policyReducer,
        // incidents: incidentReducer,
        // users: userManagementReducer,
        // Add other reducers here
    },
    // Middleware can be added here, e.g., for logging or other async operations
    // devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools in development
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
