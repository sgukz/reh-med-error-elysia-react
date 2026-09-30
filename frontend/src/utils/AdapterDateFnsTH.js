// utils/AdapterDateFnsTH.js
import React from 'react';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import thLocale from 'date-fns/locale/th';

const toNativeDate = (date) => {
  if (!date) return null;
  if (typeof date.toDate === 'function') return date.toDate();
  if (date instanceof Date) return date;
  const parsed = new Date(date);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export class AdapterDateFnsTH extends AdapterDateFns {
  constructor(...args) {
    super(...args);
    this.locale = thLocale;

    const originalFormatByString = this.formatByString.bind(this);
    this.formatByString = (date, formatString) => {
      let formatted = originalFormatByString(date, formatString);
      const d = toNativeDate(date);
      if (d && (formatString.includes('yyyy') || formatString.includes('yy'))) {
        const ceYear = d.getFullYear().toString();
        if (formatted.includes(ceYear)) {
          const beYear = (d.getFullYear() + 543).toString();
          formatted = formatted.replace(new RegExp(ceYear, 'g'), beYear);
        }
      }
      return formatted;
    };

    const originalFormat = this.format.bind(this);
    this.format = (date, formatKey) => {
      let formatted = originalFormat(date, formatKey);
      const d = toNativeDate(date);
      if (d && typeof formatted === 'string') {
        const ceYear = d.getFullYear().toString();
        if (formatted.includes(ceYear)) {
          const beYear = (d.getFullYear() + 543).toString();
          formatted = formatted.replace(new RegExp(ceYear, 'g'), beYear);
        }
      }
      return formatted;
    };
  }
}

export const renderWeekendHighlightDay = (day, _selectedDays, pickersDayProps) => {
  const dateObj = toNativeDate(day);
  const dayOfWeek = dateObj?.getDay ? dateObj.getDay() : null; // 0 = Sunday, 6 = Saturday
  const isSunday = dayOfWeek === 0;
  const isSaturday = dayOfWeek === 6;
  const isWeekend = isSunday || isSaturday;

  return (
    <PickersDay
      {...pickersDayProps}
      sx={{
        ...(isWeekend && !pickersDayProps.selected && {
          color: isSunday ? '#ef4444' : '#9333ea',
          bgcolor: isSunday ? 'rgba(239, 68, 68, 0.08)' : 'rgba(147, 51, 234, 0.08)',
          fontWeight: 700,
          '&:hover': {
            bgcolor: isSunday ? 'rgba(239, 68, 68, 0.16)' : 'rgba(147, 51, 234, 0.16)',
          },
        }),
        ...pickersDayProps.sx,
      }}
    />
  );
};

export default AdapterDateFnsTH;
