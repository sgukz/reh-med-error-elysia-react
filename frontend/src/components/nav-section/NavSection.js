import PropTypes from 'prop-types';
import { NavLink as RouterLink } from 'react-router-dom';
// @mui
import { Box, List, ListItemText } from '@mui/material';
//
import { StyledNavItem, StyledNavItemIcon } from './styles';

// ----------------------------------------------------------------------

NavSection.propTypes = {
  data: PropTypes.array,
  page: PropTypes.number
};

export default function NavSection({ data = [], page, ...other }) {
  return (
    <Box {...other}>
      <List disablePadding sx={{ p: 1 }}>
        {data.map((item) => (
          <NavItem key={item.title} item={item} page={page} />
        ))}
      </List>
    </Box>
  );
}

// ----------------------------------------------------------------------

NavItem.propTypes = {
  item: PropTypes.object,
};

function NavItem({ item }) {
  const { title, path, icon, info } = item;

  return (
    <StyledNavItem
      component={RouterLink}
      to={`${path}`}
      sx={{
        fontFamily: '"Prompt", sans-serif',
        fontWeight: 500,
        mx: 0.5,
        my: 0.25,
        px: 1.5,
        transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), background 0.25s ease, color 0.25s ease, box-shadow 0.25s ease',
        '&:hover': {
          transform: 'translateX(4px)',
          background: 'linear-gradient(135deg, rgba(94,234,212,0.18), rgba(110,231,183,0.14))',
          color: '#0d9488',
        },
        '&.active': {
          color: '#fff',
          background: 'linear-gradient(135deg, #14b8a6, #10b981)',
          fontWeight: 700,
          boxShadow: '0 8px 20px -8px rgba(20, 184, 166, 0.55)',
          '&:hover': {
            transform: 'translateX(4px)',
            background: 'linear-gradient(135deg, #0d9488, #059669)',
            color: '#fff',
          },
        },
      }}
    >
      <StyledNavItemIcon>
        {icon && icon}
      </StyledNavItemIcon>

      <ListItemText disableTypography primary={title} />

      {info && info}
    </StyledNavItem>
  );
}
