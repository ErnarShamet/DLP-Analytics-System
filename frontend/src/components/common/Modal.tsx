// frontend/src/components/common/Modal.tsx
import React, { ReactNode } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Typography,
    Button as MuiButton, // Используем MuiButton, чтобы не конфликтовать с нашим кастомным Button
    Box,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    actions?: ReactNode; // Для кнопок действий (Ok, Cancel и т.д.)
    maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
    fullWidth?: boolean;
    hideCloseButton?: boolean;
}

const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    actions,
    maxWidth = 'sm',
    fullWidth = true,
    hideCloseButton = false,
}) => {
    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            aria-labelledby="customized-dialog-title"
            maxWidth={maxWidth}
            fullWidth={fullWidth}
            PaperProps={{
                className: 'bg-dlp-surface text-dlp-text-primary shadow-xl rounded-lg' // Tailwind классы
            }}
        >
            <DialogTitle sx={{ m: 0, p: 2, borderBottom: 1, borderColor: 'divider' }} id="customized-dialog-title">
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6" component="div" className="font-semibold">
                        {title}
                    </Typography>
                    {!hideCloseButton && (
                        <IconButton
                            aria-label="close"
                            onClick={onClose}
                            sx={{
                                color: (theme) => theme.palette.grey[500],
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                    )}
                </Box>
            </DialogTitle>
            <DialogContent dividers sx={{ p: 3 }}> {/* Добавляем padding к контенту */}
                {children}
            </DialogContent>
            {actions && (
                <DialogActions sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
                    {actions}
                </DialogActions>
            )}
        </Dialog>
    );
};

// Пример использования actions:
/*
<Modal
    ...
    actions={
        <>
            <MuiButton onClick={onClose}>Cancel</MuiButton>
            <MuiButton onClick={handleConfirm} variant="contained">Confirm</MuiButton>
        </>
    }
>
    ...
</Modal>
*/

export default Modal;