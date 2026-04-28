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
