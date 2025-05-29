// frontend/src/pages/AlertDetailPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, Paper, CircularProgress, Alert as MuiAlert, Grid, Chip, Button, Divider, List, ListItem, ListItemText, TextField } from '@mui/material';
import PageHeader from '../components/common/PageHeader';
import apiService from '../services/apiService';
import { Alert as AlertType, User, Policy } from '../types'; // Assuming these types are defined
import { format } from 'date-fns';

const AlertDetailPage: React.FC = () => {
    const { alertId } = useParams<{ alertId: string }>();
    const navigate = useNavigate();
    const [alert, setAlert] = useState<AlertType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [newNote, setNewNote] = useState('');

    useEffect(() => {
        const fetchAlertDetail = async () => {
            if (!alertId) return;
            setLoading(true);
            setError(null);
            try {
                const response = await apiService.get(`/alerts/${alertId}`);
                setAlert(response.data.data);
            } catch (err: any) {
                setError(err.response?.data?.error || `Failed to fetch alert ${alertId}.`);
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAlertDetail();
    }, [alertId]);

    const handleAddNote = async () => {
        if (!newNote.trim() || !alertId) return;
        try {
            // Assuming an endpoint to add notes, or part of the updateAlert endpoint
            const response = await apiService.put(`/alerts/${alertId}`, {
                notes: [...(alert?.notes || []), { text: newNote /* user will be set by backend */ }]
            });
            setAlert(response.data.data); // Update alert with new note
            setNewNote('');
        } catch (err) {
            console.error("Failed to add note", err);
            // Show error to user
        }
    };
    
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
    }


    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><CircularProgress /></Box>;
    }

    if (error) {
        return <MuiAlert severity="error">{error}</MuiAlert>;
    }

    if (!alert) {
        return <MuiAlert severity="warning">Alert not found.</MuiAlert>;
    }

    const breadcrumbs = [
        { label: 'Alerts', href: '/alerts' },
        { label: `Alert #${alertId?.substring(0,8)}...` }
    ];

    return (
        <Box>
            <PageHeader title={alert.title || "Alert Detail"} breadcrumbs={breadcrumbs} />
            <Paper sx={{ p: 3, mb: 3 }} className="bg-dlp-surface shadow-xl">
                <Grid container spacing={3}>
                    <Grid item xs={12} md={8}>
                        <Typography variant="h5" gutterBottom>{alert.title}</Typography>
                        <Typography variant="body1" paragraph className="text-dlp-text-secondary">{alert.description || "No description provided."}</Typography>
                        <Divider sx={{ my: 2 }} />
                        <Typography variant="subtitle1" gutterBottom>Details</Typography>
                        <Box component="dl" className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                            <dt className="font-medium text-dlp-text-secondary">Severity:</dt>
                            <dd><Chip label={alert.severity} color={getSeverityChipColor(alert.severity)} size="small" /></dd>
                            <dt className="font-medium text-dlp-text-secondary">Status:</dt>
                            <dd><Chip label={alert.status} size="small" variant="outlined" /></dd>
                            <dt className="font-medium text-dlp-text-secondary">Timestamp:</dt>
                            <dd>{format(new Date(alert.timestamp), 'MMM dd, yyyy HH:mm:ss zzz')}</dd>
                            <dt className="font-medium text-dlp-text-secondary">Source:</dt>
                            <dd>{alert.source || 'N/A'}</dd>
                            {alert.policyTriggered && (
                                <>
                                    <dt className="font-medium text-dlp-text-secondary">Policy Triggered:</dt>
                                    <dd>{(alert.policyTriggered as Policy)?.name || 'N/A'}</dd>
                                </>
                            )}
                            {alert.userInvolved && alert.userInvolved.length > 0 && (
                                <>
                                    <dt className="font-medium text-dlp-text-secondary">User(s) Involved:</dt>
                                    <dd>{alert.userInvolved.map(u => (u as User).username || 'Unknown').join(', ')}</dd>
                                </>
                            )}
                            {alert.assignedTo && (
                                <>
                                    <dt className="font-medium text-dlp-text-secondary">Assigned To:</dt>
                                    <dd>{(alert.assignedTo as User)?.username || 'N/A'}</dd>
                                </>
                            )}
                        </Box>

                        {alert.dataSnapshot && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle1" gutterBottom>Data Snapshot</Typography>
                                <pre className="bg-gray-800 p-2 rounded overflow-auto text-sm text-gray-300">
                                    {JSON.stringify(alert.dataSnapshot, null, 2)}
                                </pre>
                            </>
                        )}
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Typography variant="h6" gutterBottom>Actions</Typography>
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                            <Button variant="contained" onClick={() => navigate(`/incidents/new?fromAlert=${alertId}`)}>Create Incident</Button>
                            <Button variant="outlined" onClick={() => {/* Logic to change status, e.g., Acknowledge */ console.log("Acknowledge")}}>Acknowledge</Button>
                            <Button variant="outlined" color="success" onClick={() => {/* Logic to resolve */ console.log("Resolve")}}>Mark as Resolved</Button>
                            <Button variant="outlined" color="warning" onClick={() => {/* Logic to mark as false positive */ console.log("False Positive")}}>Mark as False Positive</Button>
                        </Box>
                        <Divider sx={{ my: 3 }} />
                        <Typography variant="h6" gutterBottom>Notes</Typography>
                        <List dense>
                            {alert.notes && alert.notes.length > 0 ? alert.notes.map((note, index) => (
                                <ListItem key={index} sx={{ flexDirection: 'column', alignItems: 'flex-start', borderBottom: '1px solid rgba(255,255,255,0.1)', pb:1, mb:1 }}>
                                    <ListItemText
                                        primary={note.text}
                                        secondary={`By: ${(note.user as User)?.username || 'System'} at ${format(new Date(note.createdAt), 'MMM dd, yyyy HH:mm')}`}
                                    />
                                </ListItem>
                            )) : <Typography variant="body2" className="text-dlp-text-secondary">No notes yet.</Typography>}
                        </List>
                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            variant="outlined"
                            label="Add a new note"
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            sx={{ mt: 2, mb:1 }}
                        />
                        <Button variant="contained" size="small" onClick={handleAddNote} disabled={!newNote.trim()}>Add Note</Button>
                    </Grid>
                </Grid>
            </Paper>
        </Box>
    );
};

export default AlertDetailPage;