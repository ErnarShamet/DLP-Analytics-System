// frontend/src/components/common/Button.tsx

import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps, CircularProgress } from '@mui/material';

interface ButtonProps extends MuiButtonProps {
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    variant = 'contained', 
    color = 'primary',    
    isLoading = false,
    disabled,
    sx,
    ...rest
}) => {
    return (
        <MuiButton
            variant={variant}
            color={color}
            disabled={disabled || isLoading}
            sx={{
                ...sx,
            }}
            {...rest}
        >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : children}
        </MuiButton>
    );
};

export default Button;
