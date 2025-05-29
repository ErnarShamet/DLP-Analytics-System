// frontend/src/contexts/ThemeContext.tsx

import React, { createContext, useState, useMemo, ReactNode, useContext } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, PaletteMode } from '@mui/material';
import { deepmerge } from '@mui/utils'; // Для слияния тем

// Базовая тема, которую вы можете расширить
const baseThemeOptions = {
    typography: {
        fontFamily: 'Inter, sans-serif',
    },
    components: {
        MuiButton: {
            defaultProps: {
                disableElevation: true,
            }
        },
        MuiPaper: { // Apply base Tailwind classes to Paper
            styleOverrides: {
                root: {
                    backgroundColor: 'var(--mui-palette-background-paper)', // Use MUI theme variable
                }
            }
        }
    }
};

const lightThemeOptions = deepmerge(baseThemeOptions, {
    palette: {
        mode: 'light' as PaletteMode,
        primary: { main: '#06b6d4' }, // Example
        secondary: { main: '#ec4899' },
        background: { default: '#f9fafb', paper: '#ffffff' },
        text: { primary: '#1f2937', secondary: '#6b7280' },
    },
});

const darkThemeOptions = deepmerge(baseThemeOptions, {
    palette: {
        mode: 'dark' as PaletteMode,
        primary: { main: '#06b6d4' }, // Tailwind cyan-500
        secondary: { main: '#ec4899' }, // Tailwind pink-500
        background: { default: '#1a202c', paper: '#2d3748' }, // dlp-bg, dlp-surface
        text: { primary: '#e2e8f0', secondary: '#a0aec0' }, // dlp-text-primary, dlp-text-secondary
    },
});


interface ThemeContextType {
    toggleTheme: () => void;
    mode: PaletteMode;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const CustomThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<PaletteMode>('dark'); // Начальная тема

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    };

    const theme = useMemo(() => (mode === 'light' ? createTheme(lightThemeOptions) : createTheme(darkThemeOptions)), [mode]);
    
    // Update Tailwind dark mode based on MUI theme
    React.useEffect(() => {
        if (mode === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [mode]);


    return (
        <ThemeContext.Provider value={{ toggleTheme, mode }}>
            <MuiThemeProvider theme={theme}>
                {children}
            </MuiThemeProvider>
        </ThemeContext.Provider>
    );
};

export const useCustomTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useCustomTheme must be used within a CustomThemeProvider');
    }
    return context;
};
