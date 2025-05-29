// frontend/src/components/MainLayout.tsx
import React, { useState } from 'react';
import { Outlet, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
    AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, IconButton, Box, CssBaseline, Tooltip, Avatar, Menu, MenuItem, Divider
} from '@mui/material';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NotificationsIcon from '@mui/icons-material/Notifications'; // For Alerts
import SecurityIcon from '@mui/icons-material/Security'; // For Policies
import ReportProblemIcon from '@mui/icons-material/ReportProblem'; // For Incidents
import PeopleIcon from '@mui/icons-material/People'; // For User Management
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

import { useAppDispatch, useAppSelector } from '../store/hooks'; // Redux hooks
import { logout, selectUser } from '../store/slices/authSlice'; // Redux auth actions and selector

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
});

const closedMixin = (theme: Theme): CSSObject => ({
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: 'hidden',
    width: `calc(${theme.spacing(7)} + 1px)`,
    [theme.breakpoints.up('sm')]: {
        width: `calc(${theme.spacing(8)} + 1px)`,
    },
});

const DrawerHeader = styled('div')(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: theme.spacing(0, 1),
    ...theme.mixins.toolbar,
}));

const StyledAppBar = styled(AppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
    })<{ open?: boolean }>(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
        }),
    }),
}));

const StyledDrawer = styled(Drawer, { shouldForwardProp: (prop) => prop !== 'open' })(
    ({ theme, open }) => ({
        width: drawerWidth,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        ...(open && {
        ...openedMixin(theme),
        '& .MuiDrawer-paper': openedMixin(theme),
        }),
        ...(!open && {
        ...closedMixin(theme),
        '& .MuiDrawer-paper': closedMixin(theme),
        }),
    }),
);

const MainLayout: React.FC = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser); // Get user from Redux store

    const [open, setOpen] = useState(true);
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(null);

    const handleDrawerOpen = () => {
        setOpen(true);
    };

    const handleDrawerClose = () => {
        setOpen(false);
    };

    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
        setAnchorElUser(null);
    };

    const handleLogout = () => {
        dispatch(logout());
        // navigate('/login', { replace: true }); // ProtectedRoute will handle redirect
        handleCloseUserMenu();
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard', roles: ['User', 'Analyst', 'IncidentResponder', 'Admin', 'SuperAdmin'] },
        { text: 'Alerts', icon: <NotificationsIcon />, path: '/alerts', roles: ['Analyst', 'IncidentResponder', 'Admin', 'SuperAdmin'] },
        { text: 'Policies', icon: <SecurityIcon />, path: '/policies', roles: ['Analyst', 'Admin', 'SuperAdmin'] },
        { text: 'Incidents', icon: <ReportProblemIcon />, path: '/incidents', roles: ['IncidentResponder', 'Analyst', 'Admin', 'SuperAdmin'] },
    ];

    const adminMenuItems = [
        { text: 'User Management', icon: <PeopleIcon />, path: '/admin/users', roles: ['Admin', 'SuperAdmin'] },
    ];

    const isUserAllowed = (itemRoles: string[]) => {
        if (!user?.role) return false;
        return itemRoles.includes(user.role);
    }


    return (
        <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <StyledAppBar position="fixed" open={open}>
            <Toolbar>
            <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                sx={{
                marginRight: 5,
                ...(open && { display: 'none' }),
                }}
            >
                <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                {process.env.REACT_APP_NAME || "DLP Analytics"}
            </Typography>

            <Box sx={{ flexGrow: 0 }}>
                <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar alt={user?.fullName || user?.username} src="/static/images/avatar/2.jpg" /> {/* Replace with actual avatar logic */}
                </IconButton>
                </Tooltip>
                <Menu
                sx={{ mt: '45px' }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                keepMounted
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
                >
                <MenuItem onClick={() => { /* navigate('/profile'); */ handleCloseUserMenu(); }}>
                    <Typography textAlign="center">Profile (WIP)</Typography>
                </MenuItem>
                <MenuItem onClick={() => { /* navigate('/settings'); */ handleCloseUserMenu(); }}>
                    <Typography textAlign="center">Settings (WIP)</Typography>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                    </ListItemIcon>
                    <Typography textAlign="center">Logout</Typography>
                </MenuItem>
                </Menu>
            </Box>
            </Toolbar>
        </StyledAppBar>
        <StyledDrawer variant="permanent" open={open}>
            <DrawerHeader>
            {/* Optional: Add Logo here */}
            <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', opacity: open ? 1 : 0, transition: 'opacity 0.3s' }}>
                {/* Your Logo or Short Name */}
            </Typography>
            <IconButton onClick={handleDrawerClose}>
                {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
            </DrawerHeader>
            <Divider />
            <List>
            {menuItems.filter(item => isUserAllowed(item.roles)).map((item) => (
                <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                <ListItemButton
                    component={RouterLink}
                    to={item.path}
                    sx={{
                    minHeight: 48,
                    justifyContent: open ? 'initial' : 'center',
                    px: 2.5,
                    }}
                >
                    <ListItemIcon
                    sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                    }}
                    >
                    {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
                </ListItem>
            ))}
            </List>
            <Divider />
            {adminMenuItems.filter(item => isUserAllowed(item.roles)).length > 0 && (
            <List>
                <Typography variant="caption" sx={{ pl: open? 2.5 : 1, display: 'block', color: 'text.secondary', opacity: open? 1 : 0}}>
                Admin
                </Typography>
                {adminMenuItems.filter(item => isUserAllowed(item.roles)).map((item) => (
                <ListItem key={item.text} disablePadding sx={{ display: 'block' }}>
                    <ListItemButton
                    component={RouterLink}
                    to={item.path}
                    sx={{
                        minHeight: 48,
                        justifyContent: open ? 'initial' : 'center',
                        px: 2.5,
                    }}
                    >
                    <ListItemIcon
                        sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        }}
                    >
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                    </ListItemButton>
                </ListItem>
                ))}
            </List>
            )}
        </StyledDrawer>
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: 'background.default', minHeight: '100vh' }}>
            <DrawerHeader /> {/* This is to offset content below AppBar */}
            <Outlet /> {/* Child routes will render here */}
        </Box>
        </Box>
    );
};

export default MainLayout;