// utils/AdapterDateFnsTH.js
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns'
import { format } from 'date-fns'
import thLocale from 'date-fns/locale/th'

export class AdapterDateFnsTH extends AdapterDateFns {
  constructor(...args) {
    super(...args)
    this.locale = thLocale
  }

  formatByString(date, formatString) {
    let formatted = format(date, formatString, { locale: this.locale })

    if (formatString.includes('yyyy')) {
      const buddhistYear = date.getFullYear() + 543
      // แทน year ค.ศ. ด้วย พ.ศ.
      formatted = formatted.replace(/\d{4}/, buddhistYear.toString())
    }

    return formatted
  }
}
