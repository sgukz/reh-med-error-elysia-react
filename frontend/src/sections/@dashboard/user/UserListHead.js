import PropTypes from 'prop-types';
// @mui
import { Box, TableRow, TableHead, TableSortLabel } from '@mui/material';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import { styled } from '@mui/material/styles';
// ----------------------------------------------------------------------

const StyledTableCell = styled(TableCell)(() => ({
  [`&.${tableCellClasses.head}`]: {
    background: 'linear-gradient(135deg, #14b8a6, #10b981)', // Active Nav Item Gradient
    color: '#ffffff',
    fontFamily: '"Prompt", sans-serif',
    fontWeight: 600,
    fontSize: '15px',
  },
  [`&.${tableCellClasses.body}`]: {
    fontFamily: '"Prompt", sans-serif',
    fontSize: '14px',
  },
}));


const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
};

UserListHead.propTypes = {
  order: PropTypes.oneOf(['asc', 'desc']),
  orderBy: PropTypes.string,
  headLabel: PropTypes.array,
  onRequestSort: PropTypes.func,
};

export default function UserListHead({
  order,
  orderBy,
  headLabel,
  onRequestSort,
}) {
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        {headLabel.map((headCell) => (
          <StyledTableCell
            key={headCell.id}
            align={headCell.alignHead !== undefined ? headCell.alignHead : "center"}
            sortDirection={orderBy === headCell.id ? order : false}
            width='auto'
          >
            <TableSortLabel
              hideSortIcon
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}

            >
              <span style={{ color: '#ffffff' }}>{headCell.label}</span>
              {orderBy === headCell.id ? (
                <Box sx={{ ...visuallyHidden }}>{order === 'desc' ? 'sorted descending' : 'sorted ascending'}</Box>
              ) : null}
            </TableSortLabel>
          </StyledTableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}
