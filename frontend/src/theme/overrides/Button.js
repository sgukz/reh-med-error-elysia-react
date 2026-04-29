import { alpha } from '@mui/material/styles';

// ----------------------------------------------------------------------

export default function Button(theme) {
  return {
    MuiButton: {
      styleOverrides: {
        root: {
          '&:hover': {
            boxShadow: 'none',
          },
        },
        sizeLarge: {
          height: 48,
        },
        containedInherit: {
          color: theme.palette.grey[800],
          boxShadow: theme.customShadows.z8,
          '&:hover': {
            backgroundColor: theme.palette.grey[400],
          },
        },
        containedPrimary: {
          background: 'linear-gradient(135deg, #14b8a6, #0d9488)',
          boxShadow: '0 8px 16px -4px rgba(20, 184, 166, 0.3)',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease, background 0.25s ease',
          fontFamily: '"Prompt", sans-serif',
          fontWeight: 600,
          '&:hover': {
            transform: 'translateY(-2px)',
            background: 'linear-gradient(135deg, #0d9488, #115e59)',
            boxShadow: '0 12px 20px -4px rgba(20, 184, 166, 0.45)',
          },
        },
        containedSecondary: {
          boxShadow: theme.customShadows.secondary,
        },
        outlinedInherit: {
          border: `1px solid ${alpha(theme.palette.grey[500], 0.32)}`,
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        },
        textInherit: {
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        },
      },
    },
  };
}
