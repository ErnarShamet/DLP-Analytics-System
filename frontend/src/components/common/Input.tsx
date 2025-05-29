// frontend/src/components/common/Input.tsx
import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

// Можно расширить TextFieldProps, если нужны кастомные пропы
interface InputProps extends Omit<TextFieldProps, 'variant'> {
    variant?: 'outlined' | 'filled' | 'standard'; // Переопределяем для более строгого типа, если нужно
}

const Input: React.FC<InputProps> = ({
    variant = 'outlined', // Default variant
    margin = 'normal',    // Default margin
    fullWidth = true,     // Default fullWidth
    ...rest
}) => {
    return (
        <TextField
            variant={variant}
            margin={margin}
            fullWidth={fullWidth}
            {...rest}
        />
    );
};

export default Input;