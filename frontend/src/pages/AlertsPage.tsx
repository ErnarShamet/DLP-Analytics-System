// frontend/src/pages/AlertsPage.tsx
import React, { useState, useEffect } from 'react';
import { Box, CircularProgress, Alert as MuiAlert, Chip, IconButton, Tooltip } from '@mui/material';
import { DataGrid, GridColDef, GridValueGetterParams, GridActionsCellItem } from '@mui/x-data-grid';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/common/PageHeader';
import apiService from '../services/apiService';
import { Alert, User, Policy } from '../types'; // Assuming these types are defined
import { format } from 'date-fns'; // For date formatting

// Icons
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // For "Create Incident"
import CheckCircleIcon from '@mui/icons-material/CheckCircle'; // For "Resolve"
import FlagIcon from '@mui/icons-material/Flag'; // For "Escalate"

interface AlertRow extends Alert {
    id: string; // DataGrid requires an 'id' field
    policyName?: string;
    userInvolvedNames?: string;
}

const getSeverityChipColor = (severity: string): "error" | "warning" | "info" | "success" | "default" => {
    switch (severity?.toLowerCase()) {
        case 'critical':
        case 'high':
            return 'error';
        case 'medium':
            return 'warning';
        case 'low':
            return 'info';
        case 'informational':
            return 'success';
        default:
            return 'default';
    }
}

const AlertsPage: React.FC = () => {
    const navigate = useNavigate();
    const [alerts, setAlerts] = useState<AlertRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paginationModel, setPaginationModel] = useState({ page: 0, pageSize: 10 });


    useEffect(() => {
        const fetchAlerts = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await apiService.get('/alerts', {
                    // params: { page: paginationModel.page + 1, limit: paginationModel.pageSize, sortBy: 'timestamp:desc' } // Example for backend pagination
                });
                const dataWithIds: AlertRow[] = response.data.data.map((alert: Alert) => ({
                    ...alert,
                    id: alert._id, // Use _id as id for DataGrid
                    policyName: (alert.policyTriggered as Policy)?.name || 'N/A',
                    userInvolvedNames: alert.userInvolved?.map(u => (u as User).username || 'Unknown').join(', ') || 'N/A',
                }));
                setAlerts(dataWithIds);
            } catch (err: any) {
                setError(err.response?.data?.error || 'Failed to fetch alerts.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlerts();
    }, [paginationModel]);


    const handleViewAlert = (id: string) => {
        navigate(`/alerts/${id}`);
    };

    const handleCreateIncidentFromAlert = (alertId: string) => {
        // Logic to create an incident, possibly pre-filling from alert
        console.log('Create incident from alert:', alertId);
        navigate(`/incidents/new?fromAlert=${alertId}`); // Example navigation
    };
    
    const handleResolveAlert = (alertId: string) => {
        // Logic to resolve an alert
        console.log('Resolve alert:', alertId);
        // API call to update alert status, then refetch or update local state
    };


    const columns: GridColDef<AlertRow>[] = [
        { field: 'title', headerName: 'Title', flex: 0.25, minWidth: 200 },
        {
            field: 'severity',
            headerName: 'Severity',
            flex: 0.1,
            minWidth: 120,
            renderCell: (params) => (
                <Chip label={params.value} color={getSeverityChipColor(params.value)} size="small" />
            ),
        },
        { field: 'status', headerName: 'Status', flex: 0.1, minWidth: 120 },
        { field: 'policyName', headerName: 'Policy Triggered', flex: 0.15, minWidth: 150, valueGetter: (params) => params.row.policyTriggered ? (params.row.policyTriggered as Policy).name : 'N/A' },
        { field: 'userInvolvedNames', headerName: 'User(s) Involved', flex: 0.15, minWidth: 150, valueGetter: (params) => params.row.userInvolved?.map(u => (u as User).username).join(', ') || 'N/A'},
        {
            field: 'timestamp',
            headerName: 'Timestamp',
            flex: 0.15,
            minWidth: 180,
            valueGetter: (params) => params.value ? new Date(params.value) : null,
            renderCell: (params) => params.value ? format(params.value, 'MMM dd, yyyy HH:mm:ss') : 'N/A',
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 150,
            cellClassName: 'actions',
            getActions: ({ id, row }) => {
                return [
                    <GridActionsCellItem
                        icon={<Tooltip title="View Details"><VisibilityIcon /></Tooltip>}
                        label="View"
                        onClick={() => handleViewAlert(id as string)}
                        color="inherit"
                    />,
                    <GridActionsCellItem
                        icon={<Tooltip title="Create Incident"><AddCircleOutlineIcon /></Tooltip>}
                        label="Create Incident"
                        onClick={() => handleCreateIncidentFromAlert(id as string)}
                        color="primary"
                        // showInMenu // Optional: if too many actions
                    />,
                    <GridActionsCellItem
                        icon={<Tooltip title="Resolve Alert"><CheckCircleIcon /></Tooltip>}
                        label="Resolve"
                        onClick={() => handleResolveAlert(id as string)}
                        color="success"
                        disabled={row.status === 'Resolved' || row.status === 'Closed'}
                        // showInMenu
                    />,
                ];
            },
        },
    ];

    return (
        <Box>
            <PageHeader title="Alerts Monitoring" />
            {error && <MuiAlert severity="error" sx={{ mb: 2 }}>{error}</MuiAlert>}
            <Paper sx={{ height: '70vh', width: '100%', backgroundColor: 'dlp-surface' }} className="shadow-xl">
                <DataGrid
                    rows={alerts}
                    columns={columns}
                    loading={loading}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[5, 10, 25, 50]}
                    // rowCount={rowCountState} // For server-side pagination
                    // paginationMode="server" // For server-side pagination
                    checkboxSelection
                    disableRowSelectionOnClick
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(255,255,255,0.05)'},
                        '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(255,255,255,0.1)' },
                    }}
                />
            </Paper>
        </Box>
    );
};

export default AlertsPage;