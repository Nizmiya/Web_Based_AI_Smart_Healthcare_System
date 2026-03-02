export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function apiRequest(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || 'Request failed');
  }

  return response.json();
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      apiRequest('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({ username: email, password }),
      }),
    register: (data: any) =>
      apiRequest('/api/v1/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    me: () => apiRequest('/api/v1/auth/me'),
    forgotPassword: async (email: string) => {
      const res = await fetch(`${API_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(err.detail || 'Failed to send OTP');
      }
      return res.json();
    },
    verifyOtp: async (email: string, otp_code: string) => {
      const res = await fetch(`${API_URL}/api/v1/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp_code }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(err.detail || 'Invalid OTP');
      }
      return res.json();
    },
    resetPassword: async (email: string, new_password: string, reset_token?: string, otp_code?: string) => {
      const body: Record<string, string> = { email, new_password };
      if (reset_token) body.reset_token = reset_token;
      if (otp_code) body.otp_code = otp_code;
      const res = await fetch(`${API_URL}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: 'Request failed' }));
        throw new Error(err.detail || 'Failed to reset password');
      }
      return res.json();
    },
  },
  predictions: {
    diabetes: (data: any) =>
      apiRequest('/api/v1/predictions/diabetes', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    heartDisease: (data: any) =>
      apiRequest('/api/v1/predictions/heart-disease', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    kidneyDisease: (data: any) =>
      apiRequest('/api/v1/predictions/kidney-disease', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    history: (diseaseType?: string) => {
      const url = diseaseType
        ? `/api/v1/predictions/history?disease_type=${encodeURIComponent(diseaseType)}`
        : '/api/v1/predictions/history';
      return apiRequest(url);
    },
  },
  notifications: {
    list: () => apiRequest('/api/v1/notifications/'),
    markRead: (id: string) =>
      apiRequest(`/api/v1/notifications/${id}/read`, { method: 'PUT' }),
  },
  patientRecords: {
    store: (patientId: string, diseaseType: string, parameters: any) =>
      apiRequest('/api/v1/patient-records/store', {
        method: 'POST',
        body: JSON.stringify({
          patient_id: patientId,
          disease_type: diseaseType,
          parameters: parameters,
        }),
      }),
    getMyRecords: (diseaseType?: string) => {
      const url = diseaseType 
        ? `/api/v1/patient-records/my-records?disease_type=${diseaseType}`
        : '/api/v1/patient-records/my-records';
      return apiRequest(url);
    },
    getPatientRecords: (patientId: string, diseaseType?: string) => {
      const url = diseaseType 
        ? `/api/v1/patient-records/patient/${patientId}?disease_type=${diseaseType}`
        : `/api/v1/patient-records/patient/${patientId}`;
      return apiRequest(url);
    },
    update: (recordId: string, parameters: any) =>
      apiRequest(`/api/v1/patient-records/update/${recordId}`, {
        method: 'PUT',
        body: JSON.stringify({ parameters }),
      }),
    delete: (recordId: string) =>
      apiRequest(`/api/v1/patient-records/delete/${recordId}`, {
        method: 'DELETE',
      }),
  },
  users: {
    profile: () => apiRequest('/api/v1/users/profile'),
    updateProfile: (data: any) =>
      apiRequest('/api/v1/users/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getPatients: () => apiRequest('/api/v1/users/patients'),
    getPatientProfile: (patientId: string) =>
      apiRequest(`/api/v1/users/patients/${patientId}/profile`),
    addPatientRemark: (patientId: string, remark: string) =>
      apiRequest(`/api/v1/users/patients/${patientId}/remarks`, {
        method: 'POST',
        body: JSON.stringify({ remark }),
      }),
  },
  admin: {
    getDoctors: () => apiRequest('/api/v1/admin/doctors'),
    updateUserActive: (userId: string, isActive: boolean) =>
      apiRequest(`/api/v1/admin/users/${userId}`, {
        method: 'PATCH',
        body: JSON.stringify({ is_active: isActive }),
      }),
    assignDoctor: (patientId: string, doctorId: string) =>
      apiRequest(`/api/v1/admin/patients/${patientId}/assign-doctor`, {
        method: 'POST',
        body: JSON.stringify({ doctor_id: doctorId }),
      }),
    unassignDoctor: (patientId: string) =>
      apiRequest(`/api/v1/admin/patients/${patientId}/assign-doctor`, {
        method: 'DELETE',
      }),
    getSettings: () => apiRequest('/api/v1/admin/settings'),
    updateSettings: (data: any) =>
      apiRequest('/api/v1/admin/settings', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    getReportsSummary: () => apiRequest('/api/v1/admin/reports/summary'),
    getModels: () => apiRequest('/api/v1/admin/models'),
  },
  consultations: {
    list: (params?: { patient_id?: string; status?: string }) => {
      const search = new URLSearchParams();
      if (params?.patient_id) search.set('patient_id', params.patient_id);
      if (params?.status) search.set('status_filter', params.status);
      const q = search.toString();
      return apiRequest(`/api/v1/consultations${q ? `?${q}` : ''}`);
    },
    create: (data: { patient_id: string; scheduled_at: string; notes?: string }) =>
      apiRequest('/api/v1/consultations', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: { scheduled_at?: string; status?: string; notes?: string }) =>
      apiRequest(`/api/v1/consultations/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    get: (id: string) => apiRequest(`/api/v1/consultations/${id}`),
  },
};

