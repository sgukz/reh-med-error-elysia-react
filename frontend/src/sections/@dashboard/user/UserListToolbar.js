import PropTypes from 'prop-types';
// @mui
import { styled, alpha } from '@mui/material/styles';
import Toolbar from '@mui/material/Toolbar';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';

// Form Filter
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { AdapterDateFnsTH } from '../../../utils/AdapterDateFnsTH';
// component
import Iconify from '../../../components/iconify';

// ----------------------------------------------------------------------
const StyledRoot = styled(Toolbar)(() => ({
  height: 96,
  display: 'flex',
  justifyContent: 'space-start',
}));

const StyledSearch = styled(OutlinedInput)(({ theme }) => ({
  width: 240,
  transition: theme.transitions.create(['box-shadow', 'width'], {
    easing: theme.transitions.easing.easeInOut,
    duration: theme.transitions.duration.shorter,
  }),
  '&.Mui-focused': {
    width: 320,
    boxShadow: theme.customShadows.z8,
  },
  '& fieldset': {
    borderWidth: `1px !important`,
    borderColor: `${alpha(theme.palette.grey[500], 0.32)} !important`,
  },
}));

UserListToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  dateStart: PropTypes.string,
  dateEnd: PropTypes.string,
  onFilterDate: PropTypes.func,
};

export default function UserListToolbar({ dateStart, dateEnd, filterName, onFilterName, onFilterDate }) {
  return (
    <StyledRoot sx={{ height: 'auto', py: 2, flexWrap: 'wrap', gap: 2 }}>
      <Stack direction="row" alignItems="center">
        <StyledSearch
          value={filterName}
          onChange={onFilterName}
          placeholder="ค้นหา (ภายในตาราง)"
          size="small"
          startAdornment={
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled', width: 20, height: 20 }} />
            </InputAdornment>
          }
        />
      </Stack>
      {dateStart && (
        <LocalizationProvider dateAdapter={AdapterDateFnsTH}>
          <Stack direction="row" alignItems="center" spacing={2} sx={{ flexWrap: 'wrap', useFlexGap: true }}>
            <DesktopDatePicker
              label="ตั้งแต่วันที่"
              inputFormat="d MMMM yyyy" disableMaskedInput
              value={dateStart}
              onChange={(e) => onFilterDate(e, 'dateStart')}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
            <DesktopDatePicker
              label="ถึงวันที่"
              inputFormat="d MMMM yyyy" disableMaskedInput
              value={dateEnd}
              onChange={(e) => onFilterDate(e, 'dateEnd')}
              renderInput={(params) => <TextField {...params} size="small" />}
            />
          </Stack>
        </LocalizationProvider>
      )}
    </StyledRoot>
  );
}
