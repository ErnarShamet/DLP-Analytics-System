// frontend/src/components/common/PageHeader.tsx

import React from 'react';
import { Typography, Box, Breadcrumbs, Link as MuiLink, Button } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface PageHeaderProps {
    title: string;
    breadcrumbs?: BreadcrumbItem[];
    actionButton?: {
        label: string;
        onClick: () => void;
        icon?: React.ReactElement;
        color?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
    };
}

const PageHeader: React.FC<PageHeaderProps> = ({ title, breadcrumbs, actionButton }) => {
    return (
        <Box className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center">
        <Box>
            {breadcrumbs && breadcrumbs.length > 0 && (
            <Breadcrumbs aria-label="breadcrumb" className="mb-1">
                {breadcrumbs.map((crumb, index) =>
                crumb.href ? (
                    <MuiLink
                    component={RouterLink}
                    underline="hover"
                    color="inherit"
                    to={crumb.href}
                    key={index}
                    className="text-dlp-text-secondary hover:text-dlp-accent"
                    >
                    {crumb.label}
                    </MuiLink>
                ) : (
                    <Typography key={index} className="text-dlp-text-primary">
                    {crumb.label}
                    </Typography>
                )
                )}
            </Breadcrumbs>
            )}
            <Typography variant="h4" component="h1" className="font-semibold text-dlp-text-primary">
            {title}
            </Typography>
        </Box>
        {actionButton && (
            <Button
            variant="contained"
            color={actionButton.color || "primary"}
            startIcon={actionButton.icon}
            onClick={actionButton.onClick}
            className="mt-4 sm:mt-0 bg-primary hover:bg-primary-dark text-white"
            >
            {actionButton.label}
            </Button>
        )}
        </Box>
    );
};

export default PageHeader;
