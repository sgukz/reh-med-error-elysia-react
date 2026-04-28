import React, { useState } from 'react';
import {
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  Typography
} from '@mui/material';

const months = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน',
  'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม',
  'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

const buddhistYears = Array.from({ length: 11 }, (_, i) => 2563 + i); // 2563 - 2573

export default function MonthYearDropdown() {
  const today = new Date();
  const currentMonth = today.getMonth(); // 0 - 11
  const currentYear = today.getFullYear() + 543; // Convert to พ.ศ.

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const handleMonthChange = (event) => {
    setSelectedMonth(event.target.value);
  };

  const handleYearChange = (event) => {
    setSelectedYear(event.target.value);
  };

  return (
    <Box display="flex" gap={2} alignItems="center">
      <FormControl>
        <InputLabel id="month-select-label">เดือน</InputLabel>
        <Select
          labelId="month-select-label"
          value={selectedMonth}
          label="เดือน"
          onChange={handleMonthChange}
          sx={{ minWidth: 120 }}
        >
          {months.map((month, index) => (
            <MenuItem key={month} value={index}>
              {month}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl>
        <InputLabel id="year-select-label">ปี พ.ศ.</InputLabel>
        <Select
          labelId="year-select-label"
          value={selectedYear}
          label="ปี พ.ศ."
          onChange={handleYearChange}
          sx={{ minWidth: 120 }}
        >
          {buddhistYears.map((year) => (
            <MenuItem key={year} value={year}>
              {year}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Box ml={2}>
        <Typography variant="body1">
          เลือก: {months[selectedMonth]} {selectedYear}
        </Typography>
      </Box>
    </Box>
  );
}
