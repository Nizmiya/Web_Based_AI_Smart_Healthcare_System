/** Send datetime-local value to API without UTC conversion (wall-clock time). */
export function toApiLocalDateTime(datetimeLocal: string): string {
  if (!datetimeLocal) return '';
  return datetimeLocal.length === 16 ? `${datetimeLocal}:00` : datetimeLocal;
}

/** Display appointment time — handles legacy UTC (Z) and naive local datetimes. */
export function formatAppointmentDateTime(value?: string | null): string {
  if (!value) return '—';

  const trimmed = value.trim();
  const isUtc = /Z$|[+-]\d{2}:\d{2}$/.test(trimmed);
  const parsed = new Date(isUtc ? trimmed : trimmed.length === 16 ? `${trimmed}:00` : trimmed);

  if (Number.isNaN(parsed.getTime())) return trimmed;

  return parsed.toLocaleString(undefined, {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}
