export function formatDateTime(datetimeCurrent: string, format: number): string {
    const toTwoDigits = (num: number): string => num.toString().padStart(2, "0");

    // Handle edge case where Date parsing fails
    const safeDate = new Date(datetimeCurrent.replace(/-/g, "/"));
    const dateTime = isNaN(safeDate.getTime()) ? new Date(datetimeCurrent) : safeDate;

    const year = dateTime.getFullYear() + 543;
    const month = dateTime.getMonth();
    const day = dateTime.getDate();
    const weekday = dateTime.getDay();
    const hour = toTwoDigits(dateTime.getHours());
    const minute = toTwoDigits(dateTime.getMinutes());

    const dayOfWeekTH = ["อาทิตย์", "จันทร์", "อังคาร", "พุธ", "พฤหัสบดี", "ศุกร์", "เสาร์"];
    const monthShortTH = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
    const monthFullTH = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];

    const dayName = dayOfWeekTH[weekday];
    const shortMonth = monthShortTH[month];
    const fullMonth = monthFullTH[month];

    switch (format) {
        case 1:
            return `${day}/${month + 1}/${year} ${hour}:${minute} น.`;
        case 2:
            return `${dayName}, ${day} ${fullMonth} ${year} ${hour}:${minute} น.`;
        case 3:
            return `${day} ${fullMonth} ${year}, ${hour}:${minute} น.`;
        case 4:
            return `${dayName}, ${day} ${fullMonth} ${year}`;
        case 5:
            return `${day} ${shortMonth} ${year} ${hour}:${minute} น.`;
        case 6:
            return `${dayName}, ${day} ${shortMonth} ${year}`;
        case 7:
            return `${day}/${month + 1}/${year}`;
        default:
            return `${day} ${fullMonth} ${year}`;
    }
}