/**
 * SweetAlert2 helpers for success and error popups.
 * Use for creations, updates, and validation failures.
 */

import Swal from 'sweetalert2';

export async function showSuccess(title: string, text?: string) {
  return Swal.fire({
    icon: 'success',
    title,
    text: text || '',
    confirmButtonColor: '#2563eb',
    timer: 2500,
    timerProgressBar: true,
  });
}

export async function showError(title: string, text?: string) {
  return Swal.fire({
    icon: 'error',
    title,
    text: text || 'Please try again.',
    confirmButtonColor: '#dc2626',
  });
}

export async function showValidationError(message: string) {
  return showError('Validation Failed', message);
}

export async function showConfirm(title: string, text: string, confirmText = 'Yes, proceed', cancelText = 'Cancel') {
  const result = await Swal.fire({
    icon: 'warning',
    title,
    text,
    showCancelButton: true,
    confirmButtonColor: '#2563eb',
    cancelButtonColor: '#6b7280',
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
  });
  return result.isConfirmed;
}
