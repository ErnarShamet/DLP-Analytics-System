// frontend/src/components/alerts/AlertsTable.tsx

import React from 'react';
import { DataGrid, GridColDef, GridPaginationModel, GridActionsCellItem } from '@mui/x-data-grid';
import { Box, Chip, Tooltip } from '@mui/material'; // Removed IconButton as GridActionsCellItem handles it
import { Alert as AlertType, User, Policy } from '../../types'; 
import { format } from 'date-fns';

// Icons (примеры, импортируйте нужные)
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface AlertRow extends AlertType {
    id: string;
    policyName?: string;
    userInvolvedNames?: string;
}

interface AlertsTableProps {
    alerts: AlertRow[];
    loading: boolean;
    paginationModel: GridPaginationModel;
    onPaginationModelChange: (model: GridPaginationModel) => void;
    rowCount: number; // Для серверной пагинации
    onViewAlert: (id: string) => void;
    onCreateIncident: (alertId: string) => void;
    onResolveAlert: (alertId: string) => void;
}

const getSeverityChipColor = (severity?: string): "error" | "warning" | "info" | "success" | "default" => {
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
};

const AlertsTable: React.FC<AlertsTableProps> = ({
    alerts,
    loading,
    paginationModel,
    onPaginationModelChange,
    rowCount,
    onViewAlert,
    onCreateIncident,
    onResolveAlert
}) => {
    const columns: GridColDef<AlertRow>[] = [
        { field: 'title', headerName: 'Title', flex: 0.25, minWidth: 200 },
        {
            field: 'severity',
            headerName: 'Severity',
            flex: 0.1,
            minWidth: 120,
            renderCell: (params) => (
                <Chip label={params.value as string} color={getSeverityChipColor(params.value as string)} size="small" />
            ),
        },
        { field: 'status', headerName: 'Status', flex: 0.1, minWidth: 120 },
        {
            field: 'policyName',
            headerName: 'Policy Triggered',
            flex: 0.15,
            minWidth: 150,
            valueGetter: (params) => params.row.policyTriggered ? (params.row.policyTriggered as Policy).name : 'N/A'
        },
        {
            field: 'userInvolvedNames',
            headerName: 'User(s) Involved',
            flex: 0.15,
            minWidth: 150,
            valueGetter: (params) => params.row.userInvolved?.map(u => (u as User).username).join(', ') || 'N/A'
        },
        {
            field: 'timestamp',
            headerName: 'Timestamp',
            flex: 0.15,
            minWidth: 180,
            valueGetter: (params) => params.value ? new Date(params.value as string) : null,
            renderCell: (params) => params.value ? format(params.value as Date, 'MMM dd, yyyy HH:mm:ss') : 'N/A',
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
                        onClick={() => onViewAlert(id as string)}
                        color="inherit"
                        key={`view-${id}`}
                    />,
                    <GridActionsCellItem
                        icon={<Tooltip title="Create Incident"><AddCircleOutlineIcon /></Tooltip>}
                        label="Create Incident"
                        onClick={() => onCreateIncident(id as string)}
                        color="primary"
                        key={`create-incident-${id}`}
                    />,
                    <GridActionsCellItem
                        icon={<Tooltip title="Resolve Alert"><CheckCircleIcon /></Tooltip>}
                        label="Resolve"
                        onClick={() => onResolveAlert(id as string)}
                        color="success"
                        disabled={(row as AlertRow).status === 'Resolved' || (row as AlertRow).status === 'Closed'}
                        key={`resolve-${id}`}
                    />,
                ];
            },
        },
    ];

    return (
        <Box sx={{ height: '100%', width: '100%' }}>
            <DataGrid
                rows={alerts}
                columns={columns}
                loading={loading}
                paginationModel={paginationModel}
                onPaginationModelChange={onPaginationModelChange}
                pageSizeOptions={[5, 10, 25, 50]}
                rowCount={rowCount}
                paginationMode="server" // Если используется серверная пагинация
                checkboxSelection
                disableRowSelectionOnClick
                sx={{
                    border: 'none',
                    '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(255,255,255,0.05)' },
                    '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(255,255,255,0.1)' },
                }}
            />
        </Box>
    );
};

export default AlertsTable;
