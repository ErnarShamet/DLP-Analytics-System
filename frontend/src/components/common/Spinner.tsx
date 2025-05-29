// frontend/src/components/common/Spinner.tsx
import React from 'react';
import { Box, CircularProgress, CircularProgressProps, Typography } from '@mui/material';

interface SpinnerProps extends CircularProgressProps {
    message?: string;
    fullScreen?: boolean; // Если true, центрирует спиннер на весь экран
    height?: string | number; // Для центрирования в родительском блоке определенной высоты
}

const Spinner: React.FC<SpinnerProps> = ({ message, fullScreen, height, size = 40, ...rest }) => {
    const spinnerComponent = (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            sx={ fullScreen ?
                { position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.1)', zIndex: 9999 } :
                height ? { height: height } : {}
            }
        >
            <CircularProgress size={size} {...rest} />
            {message && (
                <Typography variant="body2" sx={{ mt: 2, color: 'text.secondary' }}>
                    {message}
                </Typography>
            )}
        </Box>
    );

    if (fullScreen || height) {
        return spinnerComponent;
    }

    return <CircularProgress size={size} {...rest} />;
};

export default Spinner;