export function money(value) {
  const number = Number(value ?? 0);
  return `Bs ${Number.isFinite(number) ? number.toFixed(2) : '0.00'}`;
}

export function shortDate(value) {
  if (!value) return '-';
  const [year, month, day] = String(value).slice(0, 10).split('-');
  return day && month && year ? `${day}/${month}/${year}` : value;
}

export function isoDate(date) {
  if (!(date instanceof Date)) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function apiErrorMessage(error, fallback = 'Ocurrió un error.') {
  if (typeof error === 'string') return error;
  if (error?.detail) return Array.isArray(error.detail) ? error.detail.join(' ') : String(error.detail);
  if (error && typeof error === 'object') {
    const first = Object.entries(error)[0];
    if (first) {
      const [field, value] = first;
      const text = Array.isArray(value) ? value.join(' ') : String(value);
      return `${field}: ${text}`;
    }
  }
  return fallback;
}
