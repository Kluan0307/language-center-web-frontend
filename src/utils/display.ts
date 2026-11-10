import dayjs from 'dayjs';
export function displayDate(value: string | null | undefined, withTime = true): string {
  return value && dayjs(value).isValid() ? dayjs(value).format(withTime ? 'DD/MM/YYYY HH:mm' : 'DD/MM/YYYY') : '—';
}
