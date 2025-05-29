// frontend/src/pages/admin/UserManagementPage.tsx
import React, { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Alert as MuiAlert, Paper, Typography, Tooltip, Switch, Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem, FormControlLabel } from '@mui/material';
import { DataGrid, GridColDef, GridActionsCellItem } from '@mui/x-data-grid';
import PageHeader from '../../components/common/PageHeader';
import apiService from '../../services/apiService';
import { User } from '../../types';
import { format } from 'date-fns';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useFormik } from 'formik';
import * as Yup from 'yup';

interface UserRow extends User {
    id: string;
}

const UserSchema = Yup.object().shape({
    fullName: Yup.string().required('Full name is required'),
    username: Yup.string().min(3).required('Username is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    role: Yup.string().required('Role is required'),
    password: Yup.string().when('_id', { // Password required only for new users
        is: (val: string | undefined) => !val,
        then: (schema) => schema.min(8, 'Password must be at least 8 characters').required('Password is required'),
        otherwise: (schema) => schema.min(8, 'Password must be at least 8 characters (leave blank to keep current)'),
    }),
    isActive: Yup.boolean(),
});


const UserManagementPage: React.FC = () => {
    const [users, setUsers] = useState<UserRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null); // For editing existing user

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<UserRow | null>(null);


    const formik = useFormik<Partial<User> & { password?: string }>({
        initialValues: {
            _id: undefined,
            fullName: '',
            username: '',
            email: '',
            role: 'User',
            password: '',
            isActive: true,
        },
        validationSchema: UserSchema,
        onSubmit: async (values, { setSubmitting, resetForm }) => {
            setError(null);
            try {
                const userData = { ...values };
                if (!userData.password) { // Don't send empty password for updates
                    delete userData.password;
                }

                if (editingUser && editingUser._id) {
                    await apiService.put(`/users/${editingUser._id}`, userData);
                } else {
                    await apiService.post('/users', userData);
                }
                fetchUsers();
                handleCloseEditor();
                resetForm();
            } catch (saveError: any) {
                setError(saveError.response?.data?.error || "Failed to save user.");
            } finally {
                setSubmitting(false);
            }
        },
    });

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await apiService.get('/users');
            const dataWithIds: UserRow[] = response.data.data.map((user: User) => ({
                ...user,
                id: user._id,
            }));
            setUsers(dataWithIds);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to fetch users.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleOpenEditor = (user: User | null = null) => {
        setEditingUser(user);
        if (user) {
            formik.setValues({
                _id: user._id,
                fullName: user.fullName,
                username: user.username,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                password: '', // Clear password for edit form
            });
        } else {
            formik.resetForm(); // For new user
        }
        setIsEditorOpen(true);
    };

    const handleCloseEditor = () => {
        setIsEditorOpen(false);
        setEditingUser(null);
        formik.resetForm();
        setError(null); // Clear any previous form errors
    };
    
    const confirmDeleteUser = (user: UserRow) => {
        setUserToDelete(user);
        setDeleteConfirmOpen(true);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        try {
            await apiService.delete(`/users/${userToDelete._id}`);
            fetchUsers(); // Refetch
        } catch (err: any) {
            setError(err.response?.data?.error || 'Failed to delete user.');
        } finally {
            setDeleteConfirmOpen(false);
            setUserToDelete(null);
        }
    };

    const userRoles = ['User', 'Analyst', 'IncidentResponder', 'Admin', 'SuperAdmin'];


    const columns: GridColDef<UserRow>[] = [
        { field: 'username', headerName: 'Username', flex: 0.2, minWidth: 150 },
        { field: 'fullName', headerName: 'Full Name', flex: 0.25, minWidth: 200 },
        { field: 'email', headerName: 'Email', flex: 0.25, minWidth: 200 },
        { field: 'role', headerName: 'Role', flex: 0.1, minWidth: 120 },
        {
            field: 'isActive',
            headerName: 'Active',
            flex: 0.1,
            minWidth: 100,
            renderCell: (params) => (
                <Switch checked={params.value} readOnly disabled size="small"/> // Consider making this editable inline or via edit form
            ),
        },
        {
            field: 'lastLogin',
            headerName: 'Last Login',
            flex: 0.15,
            minWidth: 180,
            valueGetter: (params) => params.value ? new Date(params.value) : null,
            renderCell: (params) => params.value ? format(params.value, 'MMM dd, yyyy HH:mm') : 'Never',
        },
        {
            field: 'actions',
            type: 'actions',
            headerName: 'Actions',
            width: 120,
            getActions: ({ row }) => [
                <GridActionsCellItem
                    icon={<Tooltip title="Edit User"><EditIcon /></Tooltip>}
                    label="Edit"
                    onClick={() => handleOpenEditor(row)}
                />,
                <GridActionsCellItem
                    icon={<Tooltip title="Delete User"><DeleteIcon /></Tooltip>}
                    label="Delete"
                    onClick={() => confirmDeleteUser(row)}
                    color="error"
                    disabled={row.role === 'SuperAdmin'} // Example: Prevent deleting SuperAdmin
                />,
            ],
        },
    ];

    return (
        <Box>
            <PageHeader
                title="User Management"
                actionButton={{
                    label: "Add New User",
                    onClick: () => handleOpenEditor(),
                    icon: <AddCircleOutlineIcon />
                }}
            />
            {error && <MuiAlert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</MuiAlert>}
            <Paper sx={{ height: '70vh', width: '100%', backgroundColor: 'dlp-surface' }} className="shadow-xl">
                <DataGrid
                    rows={users}
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

            <Dialog open={isEditorOpen} onClose={handleCloseEditor} maxWidth="sm" fullWidth>
                <DialogTitle>{editingUser ? 'Edit User' : 'Create New User'}</DialogTitle>
                <form onSubmit={formik.handleSubmit}>
                    <DialogContent>
                        {error && <MuiAlert severity="error" sx={{ mb: 2 }}>{error}</MuiAlert>}
                        <TextField fullWidth margin="dense" name="fullName" label="Full Name" value={formik.values.fullName} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.fullName && Boolean(formik.errors.fullName)} helperText={formik.touched.fullName && formik.errors.fullName} />
                        <TextField fullWidth margin="dense" name="username" label="Username" value={formik.values.username} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.username && Boolean(formik.errors.username)} helperText={formik.touched.username && formik.errors.username} />
                        <TextField fullWidth margin="dense" name="email" label="Email" type="email" value={formik.values.email} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.email && Boolean(formik.errors.email)} helperText={formik.touched.email && formik.errors.email} />
                        <TextField fullWidth margin="dense" name="password" label={editingUser ? "New Password (optional)" : "Password"} type="password" value={formik.values.password} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.password && Boolean(formik.errors.password)} helperText={formik.touched.password && formik.errors.password} />
                        <TextField select fullWidth margin="dense" name="role" label="Role" value={formik.values.role} onChange={formik.handleChange} onBlur={formik.handleBlur} error={formik.touched.role && Boolean(formik.errors.role)} helperText={formik.touched.role && formik.errors.role}>
                            {userRoles.map((option) => (<MenuItem key={option} value={option}>{option}</MenuItem>))}
                        </TextField>
                        <FormControlLabel control={<Switch name="isActive" checked={formik.values.isActive} onChange={formik.handleChange} />} label="Active User" />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseEditor}>Cancel</Button>
                        <Button type="submit" variant="contained" disabled={formik.isSubmitting}>
                            {formik.isSubmitting ? <CircularProgress size={24} /> : (editingUser ? 'Save Changes' : 'Create User')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            <Dialog open={deleteConfirmOpen} onClose={() => setDeleteConfirmOpen(false)}>
                <DialogTitle>Confirm Deletion</DialogTitle>
                <DialogContent>
                    <Typography>
                        Are you sure you want to delete the user "{userToDelete?.username}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
                    <Button onClick={handleDeleteUser} color="error" variant="contained">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UserManagementPage;