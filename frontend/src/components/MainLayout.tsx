// frontend/src/components/MainLayout.tsx

import React, { useState } from 'react';
import { Outlet, Link as RouterLink } from 'react-router-dom'; // useNavigate removed as not used directly here
import {
    AppBar, Toolbar, Typography, Drawer, List, ListItem, ListItemButton,
    ListItemIcon, ListItemText, IconButton, Box, CssBaseline, Tooltip, Avatar, Menu, MenuItem, Divider
} from '@mui/material';
import { styled, useTheme, Theme, CSSObject } from '@mui/material/styles';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NotificationsIcon from '@mui/icons-material/Notifications'; 
import SecurityIcon from '@mui/icons-material/Security'; 
import ReportProblemIcon from '@mui/icons-material/ReportProblem'; 
import PeopleIcon from '@mui/icons-material/People'; 
// import SettingsIcon from '@mui/icons-material/Settings'; // Not used in menu items
import LogoutIcon from '@mui/icons-material/Logout';

import { useAppDispatch, useAppSelector } from '../store/hooks'; 
import { logout, selectUser } from '../store/slices/authSlice'; 

const drawerWidth = 240;

const openedMixin = (theme: Theme): CSSObject => ({
    width: drawerWidth,
    transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
    }),
    overflowX: 'hidden',
    backgroundColor: theme.palette.background.paper, // Use theme color
    borderRight: `1px solid ${theme.palette.divider}`, // Use theme color
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
    backgroundColor: theme.palette.background.paper, // Use theme color
    borderRight: `1px solid ${theme.palette.divider}`, // Use theme color
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
    backgroundColor: theme.palette.background.paper, // Use theme color
    color: theme.palette.text.primary, // Use theme color for text
    boxShadow: theme.shadows[1],
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
    // const navigate = useNavigate(); // Not directly used for navigation actions here
    const dispatch = useAppDispatch();
    const user = useAppSelector(selectUser); 

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
        <Box sx={{ display: 'flex' }} className="bg-dlp-bg min-h-screen">
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
                    <Avatar alt={user?.fullName || user?.username} src={`https://i.pravatar.cc/150?u=${user?.email || 'default'}`} />
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
                PaperProps={{className: "bg-dlp-surface text-dlp-text-primary"}}
                >
                <MenuItem onClick={() => { handleCloseUserMenu(); }}>
                    <Typography textAlign="center">Profile (WIP)</Typography>
                </MenuItem>
                <MenuItem onClick={() => { handleCloseUserMenu(); }}>
                    <Typography textAlign="center">Settings (WIP)</Typography>
                </MenuItem>
                <Divider sx={{borderColor: "rgba(255,255,255,0.1)"}}/>
                <MenuItem onClick={handleLogout}>
                    <ListItemIcon sx={{color: "inherit"}}>
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
            <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center', opacity: open ? 1 : 0, transition: 'opacity 0.3s', color: theme.palette.text.primary }}>
                 DLP
            </Typography>
            <IconButton onClick={handleDrawerClose} sx={{color: theme.palette.text.secondary}}>
                {theme.direction === 'rtl' ? <ChevronRightIcon /> : <ChevronLeftIcon />}
            </IconButton>
            </DrawerHeader>
            <Divider sx={{borderColor: "rgba(255,255,255,0.1)"}}/>
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
                    color: theme.palette.text.secondary,
                    '&.Mui-selected': {
                        backgroundColor: theme.palette.action.selected,
                        color: theme.palette.primary.main,
                        '& .MuiListItemIcon-root': {
                            color: theme.palette.primary.main,
                        }
                    },
                    '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                    }
                    }}
                >
                    <ListItemIcon
                    sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        color: 'inherit'
                    }}
                    >
                    {item.icon}
                    </ListItemIcon>
                    <ListItemText primary={item.text} sx={{ opacity: open ? 1 : 0 }} />
                </ListItemButton>
                </ListItem>
            ))}
            </List>
            <Divider sx={{borderColor: "rgba(255,255,255,0.1)"}}/>
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
                        color: theme.palette.text.secondary,
                         '&.Mui-selected': {
                            backgroundColor: theme.palette.action.selected,
                            color: theme.palette.primary.main,
                            '& .MuiListItemIcon-root': {
                                color: theme.palette.primary.main,
                            }
                        },
                        '&:hover': {
                            backgroundColor: theme.palette.action.hover,
                        }
                        }}
                    >
                    <ListItemIcon
                        sx={{
                        minWidth: 0,
                        mr: open ? 3 : 'auto',
                        justifyContent: 'center',
                        color: 'inherit'
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
        <Box component="main" sx={{ flexGrow: 1, p: 3, backgroundColor: 'dlp-bg', minHeight: '100vh' }}>
            <DrawerHeader /> 
            <Outlet /> 
        </Box>
        </Box>
    );
};

export default MainLayout;
