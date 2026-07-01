export const DOCTOR_SPECIALIZATIONS = [
  { value: 'cardiologist', label: 'Cardiologist (Heart Disease)' },
  { value: 'endocrinologist', label: 'Endocrinologist (Diabetes)' },
  { value: 'nephrologist', label: 'Nephrologist (Kidney Disease)' },
] as const;

export type DoctorSpecialization = (typeof DOCTOR_SPECIALIZATIONS)[number]['value'];

export function getSpecializationLabel(value?: string | null): string {
  if (!value) return 'Not assigned';
  return DOCTOR_SPECIALIZATIONS.find((s) => s.value === value)?.label ?? value;
}
