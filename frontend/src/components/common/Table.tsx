// frontend/src/components/common/Table.tsx

import React from 'react';
import { DataGrid, GridColDef, DataGridProps, GridSlotsComponent, GridSlots } from '@mui/x-data-grid';
import { Paper, Box, Typography } from '@mui/material';

interface CustomTableProps<R extends { id: any }> extends Omit<DataGridProps<R>, 'rows' | 'columns'> {
    rows: R[];
    columns: GridColDef<R>[];
    tableTitle?: string;
    customToolbar?: React.ReactNode | (() => React.ReactNode);
    noRowsOverlayMessage?: string;
}

const CustomNoRowsOverlay = ({ message }: { message?: string }) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }} className="text-dlp-text-secondary">
        <Typography variant="body2">{message || 'No data available'}</Typography>
    </Box>
);


function Table<R extends { id: any },>(/* eslint-disable-line @typescript-eslint/no-unused-vars */ { 
    rows,
    columns,
    tableTitle,
    loading,
    customToolbar,
    noRowsOverlayMessage,
    sx,
    ...rest
}: CustomTableProps<R>) {

    const slots: Partial<GridSlotsComponent> = {
        toolbar: customToolbar ? (typeof customToolbar === 'function' ? customToolbar : () => <>{customToolbar}</>) : undefined,
        noRowsOverlay: () => <CustomNoRowsOverlay message={noRowsOverlayMessage} />,
    };


    return (
        <Paper
            sx={{
                height: rest.autoHeight ? undefined : '70vh', 
                width: '100%',
                backgroundColor: 'transparent', // Use Tailwind for bg
                boxShadow: 0, // Use Tailwind for shadow
                ...sx
            }}
            className="bg-dlp-surface shadow-xl"
        >
            {tableTitle && (
                <Typography variant="h6" sx={{ p: 2, borderBottom: 1, borderColor: 'rgba(255,255,255,0.1)' }} className="text-dlp-text-primary">
                    {tableTitle}
                </Typography>
            )}
            <DataGrid<R>
                rows={rows}
                columns={columns}
                loading={loading}
                disableRowSelectionOnClick
                sx={{
                    border: 'none',
                    color: 'dlp-text-primary',
                    '& .MuiDataGrid-columnHeaders': { backgroundColor: 'rgba(255,255,255,0.05)', color: 'dlp-text-secondary' },
                    '& .MuiDataGrid-cell': { borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'dlp-text-primary' },
                    '& .MuiTablePagination-root': { color: 'dlp-text-secondary' },
                    '& .MuiIconButton-root': { color: 'dlp-text-secondary' },
                    '& .MuiDataGrid-selectedRowCount': {color: 'dlp-text-secondary'},
                    '& .MuiCheckbox-root': {color: 'dlp-text-secondary'}
                }}
                slots={slots as GridSlots}
                {...rest}
            />
        </Paper>
    );
}

export default Table;
