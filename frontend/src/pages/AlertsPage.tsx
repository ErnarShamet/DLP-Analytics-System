// frontend/src/pages/AlertsPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Box, Paper, Alert as MuiAlert } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import AlertsTable from '../components/alerts/AlertsTable'; // <--- ИМПОРТ
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { fetchAlerts, selectAllAlerts, selectAlertsLoading, selectAlertsError, selectAlertsPagination } from '../store/slices/alertSlice';
import { Alert as AlertType, Policy, User } from '../types';

interface AlertRow extends AlertType {
    id: string;
    policyName?: string;
    userInvolvedNames?: string;
}

const AlertsPage: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useAppDispatch();

    const alertsData = useAppSelector(selectAllAlerts);
    const isLoading = useAppSelector(selectAlertsLoading);
    const error = useAppSelector(selectAlertsError);
    const pagination = useAppSelector(selectAlertsPagination);

    const [paginationModel, setPaginationModel] = useState({
        page: pagination?.page || 0,
        pageSize: pagination?.pageSize || 10,
    });

    const loadAlerts = useCallback(() => {
        dispatch(fetchAlerts({ page: paginationModel.page, limit: paginationModel.pageSize, sort: 'timestamp:desc' }));
    }, [dispatch, paginationModel.page, paginationModel.pageSize]);

    useEffect(() => {
        loadAlerts();
    }, [loadAlerts]);

    const handleViewAlert = (id: string) => {
        navigate(`/alerts/${id}`);
    };

    const handleCreateIncidentFromAlert = (alertId: string) => {
        navigate(`/incidents/new?fromAlert=${alertId}`);
    };

    const handleResolveAlert = async (alertId: string) => {
        // TODO: Implement Redux action for resolving alert
        console.log('Resolve alert:', alertId);
        // Example: await dispatch(resolveAlertAction(alertId));
        // loadAlerts(); // Reload alerts after action
    };

    const preparedAlerts: AlertRow[] = alertsData.map((alert: AlertType) => ({
        ...alert,
        id: alert._id,
        policyName: (alert.policyTriggered as Policy)?.name || 'N/A',
        userInvolvedNames: alert.userInvolved?.map(u => (u as User).username || 'Unknown').join(', ') || 'N/A',
    }));

    return (
        <Box>
            <PageHeader title="Alerts Monitoring" />
            {error && <MuiAlert severity="error" sx={{ mb: 2 }}>{error}</MuiAlert>}
            <Paper sx={{ height: '70vh', width: '100%', backgroundColor: 'dlp-surface' }} className="shadow-xl">
                <AlertsTable
                    alerts={preparedAlerts}
                    loading={isLoading}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    rowCount={pagination?.count || 0}
                    onViewAlert={handleViewAlert}
                    onCreateIncident={handleCreateIncidentFromAlert}
                    onResolveAlert={handleResolveAlert}
                />
            </Paper>
        </Box>
    );
};

export default AlertsPage;