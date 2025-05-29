// frontend/src/pages/IncidentPage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Alert as MuiAlert, Paper, Typography, Tooltip, Chip } from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import PageHeader from '../components/common/PageHeader';
import apiService from '../services/apiService';
import { Incident } from '../types'; // Define this type
import { format } from 'date-fns';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import { useNavigate } from 'react-router-dom';

// Placeholder for IncidentEditor/Detail modal/page
// import IncidentEditorModal from '../components/incidents/IncidentEditorModal';

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
    const navigate = useNavigate();
    const [incidents, setIncidents] = useState<IncidentRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    // const [isEditorOpen, setIsEditorOpen] = useState(false);
    // const [editingIncident, setEditingIncident] = useState<Incident | null>(null);

    const fetchIncidents = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.get('/incidents');
            const dataWithIds: IncidentRow[] = response.data.data.map((inc: Incident) => ({
                ...inc,
                id: inc._id,
                assigneeName: inc.assignee ? (inc.assignee as any).username : 'Unassigned',
            }));
            setIncidents(dataWithIds);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch incidents.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchIncidents();
    }, []);

    const handleViewIncident = (id: string) => {
        // navigate(`/incidents/${id}`); // If you have a dedicated detail page
        console.log("View incident details for:", id);
        // Or open a modal
        // setEditingIncident(incidents.find(inc => inc.id === id) || null);
        // setIsEditorOpen(true);
    };
    
    const handleEditIncident = (id: string) => {
        console.log("Edit incident:", id);
         // navigate(`/incidents/edit/${id}`);
        // Or open a modal
        // setEditingIncident(incidents.find(inc => inc.id === id) || null);
        // setIsEditorOpen(true);
    };

    const handleCreateNewIncident = () => {
        console.log("Create new incident");
        // navigate('/incidents/new');
        // Or open a modal
        // setEditingIncident(null);
        // setIsEditorOpen(true);
    }


    const columns: GridColDef<IncidentRow>[] = [
        { field: 'title', headerName: 'Title', flex: 0.3, minWidth: 250 },
        {
            field: 'priority',
            headerName: 'Priority',
            flex: 0.1,
            minWidth: 120,
            renderCell: (params) => <Chip label={params.value} color={getPriorityColor(params.value)} size="small" />
        },
        { field: 'status', headerName: 'Status', flex: 0.1, minWidth: 120 },
        { field: 'assigneeName', headerName: 'Assignee', flex: 0.15, minWidth: 150 },
        {
            field: 'createdAt',
            headerName: 'Created At',
            flex: 0.15,
            minWidth: 180,
            valueGetter: (params) => params.value ? new Date(params.value) : null,
            renderCell: (params) => params.value ? format(params.value, 'MMM dd, yyyy HH:mm') : 'N/A',
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
                />,
                <GridActionsCellItem
                    icon={<Tooltip title="Edit Incident"><EditIcon /></Tooltip>}
                    label="Edit"
                    onClick={() => handleEditIncident(row.id)}
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
            {error && <MuiAlert severity="error" sx={{ mb: 2 }}>{error}</MuiAlert>}
            <Paper sx={{ height: '70vh', width: '100%', backgroundColor: 'dlp-surface' }} className="shadow-xl">
                <DataGrid
                    rows={incidents}
                    columns={columns}
                    loading={loading}
                    pageSizeOptions={[10, 25, 50]}
                    initialState={{ pagination: { paginationModel: { pageSize: 10 }}}}
                    disableRowSelectionOnClick
                    sx={{
                        border: 'none',
                        '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(255,255,255,0.05)'},
                    }}
                />
            </Paper>
            {/* Placeholder for Incident Editor/Detail Modal */}
            {/* <IncidentEditorModal
                open={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                incident={editingIncident}
                onSave={() => { fetchIncidents(); setIsEditorOpen(false); }}
            /> */}
        </Box>
    );
};

export default IncidentPage;