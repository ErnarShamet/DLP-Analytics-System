// frontend/src/components/incidents/IncidentCard.tsx

import React from 'react';
import { Card, CardContent, Typography, Box, Chip, Avatar, Tooltip, IconButton } from '@mui/material';
import { Incident, User } from '../../types'; 
import { formatDistanceToNow, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';

import VisibilityIcon from '@mui/icons-material/Visibility';
// import EditIcon from '@mui/icons-material/Edit'; // If edit functionality is needed

interface IncidentCardProps {
    incident: Incident;
    onViewDetails?: (id: string) => void; 
    onEdit?: (id: string) => void; 
}

const getPriorityChipColor = (priority?: string): "error" | "warning" | "info" | "default" => {
    switch (priority?.toLowerCase()) {
        case 'critical': return 'error';
        case 'high': return 'error';
        case 'medium': return 'warning';
        case 'low': return 'info';
        default: return 'default';
    }
};

const getStatusChipColor = (status?: string): "default" | "info" | "warning" | "success" | "error" => {
    switch (status?.toLowerCase()) {
        case 'open': return 'error';
        case 'investigating': return 'warning';
        case 'contained':
        case 'eradicated':
        case 'recovered':
            return 'info';
        case 'lessonslearned':
        case 'closed':
            return 'success';
        case 'onhold':
            return 'default'
        default: return 'default';
    }
};

const IncidentCard: React.FC<IncidentCardProps> = ({ incident, onViewDetails, onEdit }) => {
    const navigate = useNavigate();

    const handleView = () => {
        if (onViewDetails) onViewDetails(incident._id);
        else navigate(`/incidents/${incident._id}`); 
    };

    // const handleEdit = () => {
    //     if (onEdit) onEdit(incident._id);
    //     else navigate(`/incidents/edit/${incident._id}`); 
    // };

    const assignee = incident.assignee as User; 

    return (
        <Card className="bg-dlp-surface shadow-lg hover:shadow-xl transition-shadow duration-300 rounded-lg h-full flex flex-col">
            <CardContent className="flex-grow p-4">
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={1}>
                    <Typography variant="h6" component="h3" className="font-semibold text-dlp-text-primary break-words" gutterBottom>
                        {incident.title}
                    </Typography>
                    <Chip
                        label={incident.priority}
                        color={getPriorityChipColor(incident.priority)}
                        size="small"
                        sx={{ ml: 1, fontWeight: 'medium' }}
                        className="capitalize"
                    />
                </Box>
                <Typography variant="body2" className="text-dlp-text-secondary mb-2 overflow-hidden text-ellipsis" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
                    {incident.description || 'No description provided.'}
                </Typography>

                <Box display="flex" justifyContent="space-between" alignItems="center" mt={2} mb={2}>
                    <Chip
                        label={incident.status}
                        size="small"
                        variant="outlined"
                        color={getStatusChipColor(incident.status)}
                        className="capitalize"
                    />
                    <Typography variant="caption" className="text-dlp-text-secondary">
                        {formatDistanceToNow(parseISO(incident.createdAt as string), { addSuffix: true })}
                    </Typography>
                </Box>

                {assignee && (
                    <Box display="flex" alignItems="center" mt={1}>
                        <Tooltip title={`Assigned to: ${assignee.fullName || assignee.username}`}>
                            <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem', mr: 1, bgcolor: 'primary.main' }} className="bg-primary">
                                {assignee.fullName ? assignee.fullName.charAt(0).toUpperCase() : assignee.username.charAt(0).toUpperCase()}
                            </Avatar>
                        </Tooltip>
                        <Typography variant="body2" className="text-dlp-text-secondary">
                            {assignee.fullName || assignee.username}
                        </Typography>
                    </Box>
                )}
                 {incident.relatedAlerts && incident.relatedAlerts.length > 0 && (
                    <Typography variant="caption" display="block" mt={1} className="text-dlp-text-secondary">
                        {incident.relatedAlerts.length} related alert(s)
                    </Typography>
                )}
            </CardContent>
            <Box sx={{ p: 1, borderTop: 1, borderColor: 'rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end' }}>
                <Tooltip title="View Details">
                    <IconButton size="small" onClick={handleView} className="text-dlp-text-secondary hover:text-dlp-accent">
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                {/* {onEdit && 
                  <Tooltip title="Edit Incident">
                      <IconButton size="small" onClick={handleEdit} className="text-dlp-text-secondary hover:text-dlp-accent">
                          <EditIcon fontSize="small" />
                      </IconButton>
                  </Tooltip>
                } */}
            </Box>
        </Card>
    );
};

export default IncidentCard;
