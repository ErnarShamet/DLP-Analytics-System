// frontend/src/pages/PolicyPage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Alert as MuiAlert, Paper, Typography, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import PageHeader from '../components/common/PageHeader';
import apiService from '../services/apiService';
import { Policy } from '../types';
import { format } from 'date-fns';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PolicyEditorForm from '../components/policies/PolicyEditorForm'; // Create this component

interface PolicyRow extends Policy {
    id: string;
}

const PolicyPage: React.FC = () => {
    const [policies, setPolicies] = useState<PolicyRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingPolicy, setEditingPolicy] = useState<Policy | null>(null);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [policyToDelete, setPolicyToDelete] = useState<PolicyRow | null>(null);

    const fetchPolicies = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.get('/policies');
            const dataWithIds: PolicyRow[] = response.data.data.map((policy: Policy) => ({
                ...policy,
                id: policy._id,
            }));
            setPolicies(dataWithIds);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch policies.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPolicies();
    }, []);

    const handleOpenEditor = (policy: Policy | null = null) => {
        setEditingPolicy(policy);
        setIsEditorOpen(true);
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
        setEditingPolicy(null);
    };

    const handleSavePolicy = async (policyData: Omit<Policy, '_id' | 'createdAt' | 'updatedAt' | 'version' | 'createdBy' | 'updatedBy'> | Policy) => {
        try {
            if ('_id' in policyData && policyData._id) { // Existing policy
                await apiService.put(`/policies/${policyData._id}`, policyData);
            } else { // New policy
                await apiService.post('/policies', policyData);
            }
            fetchPolicies(); // Refetch policies after save
            handleCloseEditor();
        } catch (saveError: any) {
            console.error("Failed to save policy:", saveError);
            setError(saveError.response?.data?.error || "Failed to save policy.");
            // Keep editor open if save fails for correction
        }
    };

    const confirmDeletePolicy = (policy: PolicyRow) => {
        setPolicyToDelete(policy);
        setDeleteConfirmOpen(true);
    };

    const handleDeletePolicy = async () => {
        if (!policyToDelete) return;
        try {
            await apiService.delete(`/policies/${policyToDelete._id}`);
            fetchPolicies();
            setDeleteConfirmOpen(false);
            setPolicyToDelete(null);
        } catch (deleteError: any) {
            console.error("Failed to delete policy:", deleteError);
            setError(deleteError.response?.data?.error || "Failed to delete policy.");
            setDeleteConfirmOpen(false); // Still close dialog on error
        }
    };


    const columns: GridColDef<PolicyRow>[] = [
        { field: 'name', headerName: 'Policy Name', flex: 0.3, minWidth: 200 },
        { field: 'description', headerName: 'Description', flex: 0.4, minWidth: 250 },
        {
            field: 'isEnabled',
            headerName: 'Status',
            flex: 0.1,
            minWidth: 100,
            renderCell: (params) => (
                <Typography color={params.value ? 'success.main' : 'error.main'}>
                    {params.value ? 'Enabled' : 'Disabled'}
                </Typography>
            ),
        },
        { field: 'version', headerName: 'Version', type: 'number', flex: 0.05, minWidth: 80 },
        {
            field: 'updatedAt',
            headerName: 'Last Updated',
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
            cellClassName: 'actions',
            getActions: ({ row }) => [
                <GridActionsCellItem
                    icon={<Tooltip title="Edit Policy"><EditIcon /></Tooltip>}
                    label="Edit"
                    onClick={() => handleOpenEditor(row)}
                />,
                <GridActionsCellItem
                    icon={<Tooltip title="Delete Policy"><DeleteIcon /></Tooltip>}
                    label="Delete"
                    onClick={() => confirmDeletePolicy(row)}
                    color="error"
                />,
            ],
        },
    ];

    return (
        <Box>
            <PageHeader
                title="Policy Management"
                actionButton={{
                    label: "Create New Policy",
                    onClick: () => handleOpenEditor(),
                    icon: <AddCircleOutlineIcon />
                }}
            />
            {error && <MuiAlert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</MuiAlert>}
            <Paper sx={{ height: '70vh', width: '100%', backgroundColor: 'dlp-surface' }} className="shadow-xl">
                <DataGrid
                    rows={policies}
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

            <Dialog open={isEditorOpen} onClose={handleCloseEditor} maxWidth="md" fullWidth>
                <DialogTitle>{editingPolicy ? 'Edit Policy' : 'Create New Policy'}</DialogTitle>
                <DialogContent>
                    {/* PolicyEditorForm will be complex. This is a placeholder. */}
                    <PolicyEditorForm
                        initialPolicy={editingPolicy}
                        onSubmit={handleSavePolicy}
                        onCancel={handleCloseEditor}
                    />
                </DialogContent>
            </Dialog>

            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the policy "{policyToDelete?.name}"? This action cannot be undone.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeletePolicy} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PolicyPage;