import { format, getTime, formatDistanceToNow } from 'date-fns';

// ----------------------------------------------------------------------

export function fDate(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy';

  return date ? format(new Date(date), fm) : '';
}

export function fDateTime(date, newFormat) {
  const fm = newFormat || 'dd MMM yyyy p';

  return date ? format(new Date(date), fm) : '';
}

export function fTimestamp(date) {
  return date ? getTime(new Date(date)) : '';
}

export function fToNow(date) {
  return date
    ? formatDistanceToNow(new Date(date), {
        addSuffix: true,
      })
    : '';
}

export function formatDateTime(datetime, format) {
  if (!datetime) return '';

  // พยายาม parse วันที่ให้ดีที่สุด
  const parsedDate = new Date(datetime.includes('-') ? datetime.replace(/-/g, '/') : datetime);

  if (Number.isNaN(parsedDate.getTime())) return "";

  const toTwoDigits = (num) => (num < 10 ? `0${num}` : `${num}`);

  const year = parsedDate.getFullYear() + 543;
  const month = parsedDate.getMonth();
  const day = parsedDate.getDate();
  const dayWeek = parsedDate.getDay();
  const hour = toTwoDigits(parsedDate.getHours());
  const minute = toTwoDigits(parsedDate.getMinutes());

  const dayOfWeekTH = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

  const monthShortTH = [
    'ม.ค.',
    'ก.พ.',
    'มี.ค.',
    'เม.ย.',
    'พ.ค.',
    'มิ.ย.',
    'ก.ค.',
    'ส.ค.',
    'ก.ย.',
    'ต.ค.',
    'พ.ย.',
    'ธ.ค.',
  ];

  const monthFullTH = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ];

  switch (format) {
    case 1:
      return `${toTwoDigits(day)}/${toTwoDigits(month + 1)}/${year}`;
    case 2:
      return `${dayOfWeekTH[dayWeek]}, ${day} ${monthFullTH[month]} ${year} ${hour}:${minute} น.`;
    case 3:
      return `${day} ${monthFullTH[month]} ${year}, ${hour}:${minute} น.`;
    case 4:
      return `${dayOfWeekTH[dayWeek]}, ${day} ${monthFullTH[month]} ${year}`;
    case 5:
      return `${day} ${monthShortTH[month]} ${year} ${hour}:${minute} น.`;
    case 6:
      return `${dayOfWeekTH[dayWeek]}, ${day} ${monthShortTH[month]} ${year}`;
    default:
      return `${day} ${monthFullTH[month]} ${year}`;
  }
}

export function formatDateEN(date) {
  const formatDate = new Date(date);
  const toTwoDigits = (num) => (num < 10 ? `0${num}` : num);
  return `${formatDate.getFullYear()}-${toTwoDigits(formatDate.getMonth() + 1)}-${toTwoDigits(formatDate.getDate())}`;
}

export function formatDateRange(firstDate, lastDate) {
  if (!firstDate && !lastDate) return '';
  
  const parseDate = (d) => {
    if (!d) return null;
    let parsed = new Date(d);
    if (Number.isNaN(parsed.getTime()) && typeof d === 'string' && d.includes('-')) {
      parsed = new Date(d.replace(/-/g, '/'));
    }
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  };

  const f = parseDate(firstDate);
  const l = parseDate(lastDate);

  if (!f && !l) return '';
  
  const monthFullTH = [
    'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
    'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
  ];

  const formatSingle = (dateObj) => {
    return `วันที่ ${dateObj.getDate()} ${monthFullTH[dateObj.getMonth()]} ${dateObj.getFullYear() + 543}`;
  };

  if (!f) return `ถึง${formatSingle(l)}`;
  if (!l) return `ตั้งแต่${formatSingle(f)}`;

  const fD = f.getDate();
  const fM = f.getMonth();
  const fY = f.getFullYear() + 543;

  const lD = l.getDate();
  const lM = l.getMonth();
  const lY = l.getFullYear() + 543;

  // หากเป็นวันเดียวกันเป๊ะๆ
  if (fY === lY && fM === lM && fD === lD) {
    return `วันที่ ${fD} ${monthFullTH[fM]} ${fY}`;
  }

  if (fY === lY) {
    if (fM === lM) {
      return `ระหว่างวันที่ ${fD} - ${lD} ${monthFullTH[fM]} ${fY}`;
    }
    return `ระหว่างวันที่ ${fD} ${monthFullTH[fM]} - ${lD} ${monthFullTH[lM]} ${fY}`;
  }
  return `ระหว่างวันที่ ${fD} ${monthFullTH[fM]} ${fY} - ${lD} ${monthFullTH[lM]} ${lY}`;
}
