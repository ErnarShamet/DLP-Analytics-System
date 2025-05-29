// frontend/src/pages/IncidentPage.tsx

import React, { useState, useEffect } from 'react';
import { Box, Chip, Tooltip, Paper } from '@mui/material'; // Removed Button, CircularProgress, Alert, Typography
import { DataGrid, GridColDef, GridActionsCellItem, GridPaginationModel } from '@mui/x-data-grid';
import PageHeader from '../components/common/PageHeader';
import apiService from '../services/apiService';
import { Incident } from '../types'; 
import { format } from 'date-fns';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
// import { useNavigate } from 'react-router-dom'; // useNavigate can be used if needed for navigation
import MuiAlert from '@mui/material/Alert';


interface IncidentRow extends Incident {
    id: string;
    assigneeName?: string;
}

const getPriorityColor = (priority?: string): "error" | "warning" | "info" | "default" => {
    switch (priority?.toLowerCase()) {
        case 'critical': return 'error';
        case 'high': return 'error';
        case 'medium': return 'warning';
        case 'low': return 'info';
        default: return 'default';
    }
};

const IncidentPage: React.FC = () => {
    // const navigate = useNavigate(); // Uncomment if needed
    const [incidents, setIncidents] = useState<IncidentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({ page: 0, pageSize: 10 });
    const [rowCount, setRowCount] = useState(0);

    const fetchIncidents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.get('/incidents', {
                params: { page: paginationModel.page + 1, limit: paginationModel.pageSize, sortBy: 'createdAt:desc' }
            });
            const dataWithIds: IncidentRow[] = response.data.data.map((inc: Incident) => ({
                ...inc,
                id: inc._id,
                assigneeName: inc.assignee ? (inc.assignee as any).username : 'Unassigned',
            }));
            setIncidents(dataWithIds);
            setRowCount(response.data.count || 0);
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to fetch incidents.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paginationModel]);

    const handleViewIncident = (id: string) => {
        console.log("View incident details for:", id);
        // navigate(`/incidents/${id}`);
    };
    
    const handleEditIncident = (id: string) => {
        console.log("Edit incident:", id);
         // navigate(`/incidents/edit/${id}`);
    };

    const handleCreateNewIncident = () => {
        console.log("Create new incident");
        // navigate('/incidents/new');
    }


    const columns: GridColDef<IncidentRow>[] = [
        { field: 'title', headerName: 'Title', flex: 0.3, minWidth: 250, cellClassName: "text-dlp-text-primary" },
        {
            field: 'priority',
            headerName: 'Priority',
            flex: 0.1,
            minWidth: 120,
            renderCell: (params) => <Chip label={params.value as string} color={getPriorityColor(params.value as string)} size="small" className="capitalize"/>
        },
        { field: 'status', headerName: 'Status', flex: 0.1, minWidth: 120, cellClassName: "text-dlp-text-primary capitalize" },
        { field: 'assigneeName', headerName: 'Assignee', flex: 0.15, minWidth: 150, cellClassName: "text-dlp-text-secondary" },
        {
            field: 'createdAt',
            headerName: 'Created At',
            flex: 0.15,
            minWidth: 180,
            valueGetter: (params) => params.value ? new Date(params.value as string) : null,
            renderCell: (params) => params.value ? format(params.value as Date, 'MMM dd, yyyy HH:mm') : 'N/A',
            cellClassName: "text-dlp-text-secondary"
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 120,
            getActions: ({ row }) => [
                <GridActionsCellItem
                    icon={<Tooltip title="View Details"><VisibilityIcon /></Tooltip>}
                    label="View"
                    onClick={() => handleViewIncident(row.id)}
                    key={`view-${row.id}`}
                />,
                <GridActionsCellItem
                    icon={<Tooltip title="Edit Incident"><EditIcon /></Tooltip>}
                    label="Edit"
                    onClick={() => handleEditIncident(row.id)}
                    key={`edit-${row.id}`}
                />,
            ],
        },
    ];

    return (
        <Box>
            <PageHeader
                title="Incident Management"
                actionButton={{
                    label: "Report New Incident",
                    onClick: handleCreateNewIncident,
                    icon: <AddCircleOutlineIcon />
                }}
            />
            {error && <MuiAlert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</MuiAlert>}
            <Paper sx={{ height: '70vh', width: '100%', backgroundColor: 'transparent' }} className="bg-dlp-surface shadow-xl">
                <DataGrid
                    rows={incidents}
                    columns={columns}
                    loading={loading}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    pageSizeOptions={[10, 25, 50]}
                    rowCount={rowCount}
                    paginationMode="server"
                    disableRowSelectionOnClick
                    sx={{
                        border: 'none',
                        color: 'var(--mui-palette-text-primary)', 
                        '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--mui-palette-text-secondary)'},
                        '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(255,255,255,0.1)' },
                        '& .MuiTablePagination-root': { color: 'var(--mui-palette-text-secondary)' },
                        '& .MuiIconButton-root': { color: 'var(--mui-palette-text-secondary)' },
                        '& .MuiDataGrid-selectedRowCount': {color: 'var(--mui-palette-text-secondary)'},
                        '& .MuiCheckbox-root': {color: 'var(--mui-palette-text-secondary)'}
                    }}
                />
            </Paper>
        </Box>
    );
};

export default IncidentPage;
