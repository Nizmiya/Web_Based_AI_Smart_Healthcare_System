'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { showSuccess, showError } from '@/lib/alerts';

export default function ManagePatients() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDoctorId, setFilterDoctorId] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token || !userData) {
      router.push('/login');
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.role !== 'admin') {
      router.push('/login');
      return;
    }

    setUser(parsedUser);
    loadData();
  }, [router]);

  const loadData = async () => {
    try {
      const params: { search?: string; assigned_doctor_id?: string; risk_level?: string; sort_by?: string } = {};
      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (filterDoctorId) params.assigned_doctor_id = filterDoctorId;
      if (filterRisk) params.risk_level = filterRisk;
      if (sortBy) params.sort_by = sortBy;
      const [patientsRes, doctorsRes] = await Promise.all([
        api.users.getPatients(params),
        api.admin.getDoctors().catch(() => []),
      ]);
      setPatients(Array.isArray(patientsRes) ? patientsRes : []);
      setDoctors(Array.isArray(doctorsRes) ? doctorsRes : []);
    } catch (err) {
      console.error(err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (patient: any) => {
    const next = patient.is_active === false ? true : false;
    setUpdating(patient.id);
    try {
      await api.admin.updateUserActive(patient.id, next);
      await showSuccess('Status updated', `Patient ${next ? 'activated' : 'deactivated'} successfully.`);
      await loadData();
    } catch (err) {
      await showError('Update failed', 'Failed to update patient status. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const handleAssignDoctor = async (patientId: string, doctorId: string) => {
    if (!doctorId) {
      try {
        await api.admin.unassignDoctor(patientId);
        await showSuccess('Doctor unassigned', 'The patient has been unassigned from the doctor.');
        await loadData();
      } catch (err) {
        await showError('Update failed', 'Failed to unassign doctor. Please try again.');
      }
      return;
    }
    setUpdating(patientId);
    try {
      await api.admin.assignDoctor(patientId, doctorId);
      await showSuccess('Doctor assigned', 'The doctor has been assigned to this patient successfully.');
      await loadData();
    } catch (err) {
      await showError('Update failed', 'Failed to assign doctor. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const filterDeps = [searchTerm, filterDoctorId, filterRisk, sortBy];
  const isFirstMount = useRef(true);
  useEffect(() => {
    if (!user) return;
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    const t = setTimeout(loadData, 300);
    return () => clearTimeout(t);
  }, filterDeps);

  const filteredPatients = patients;

  if (!user || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Link href="/admin/dashboard" className="text-gray-600 hover:text-gray-800">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Manage Patients</h1>
                <p className="text-sm text-gray-500">View and manage all patient accounts</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right hidden md:block">
                <p className="text-sm text-gray-500">Welcome back,</p>
                <p className="font-semibold text-gray-800">{user.full_name}</p>
              </div>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  router.push('/login');
                }}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors shadow-md flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900"
              />
            </div>
            <select
              value={filterDoctorId}
              onChange={(e) => setFilterDoctorId(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 min-w-[160px]"
            >
              <option value="">All doctors</option>
              {doctors.map((d: any) => (
                <option key={d.id} value={d.id}>{d.full_name}</option>
              ))}
            </select>
            <select
              value={filterRisk}
              onChange={(e) => setFilterRisk(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 min-w-[140px]"
            >
              <option value="">All risk</option>
              <option value="High">High risk</option>
              <option value="Critical">Critical</option>
              <option value="High,Critical">High or Critical</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border-2 border-gray-200 rounded-xl px-4 py-3 text-gray-900 min-w-[120px]"
            >
              <option value="">Sort</option>
              <option value="name">By name</option>
              <option value="created_at">By date</option>
            </select>
            <div className="text-sm text-gray-600">
              Total: <span className="font-semibold text-gray-800">{filteredPatients.length}</span> patients
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-800">Patient Details</h2>
          </div>

          {filteredPatients.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <p className="text-gray-500 text-lg">No patients found</p>
              <p className="text-gray-400 text-sm mt-2">
                {searchTerm ? 'Try a different search term' : 'Patients will appear here once they register'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full table-fixed text-sm">
                <colgroup>
                  <col className="w-[72px]" />
                  <col className="w-[140px]" />
                  <col className="w-[160px]" />
                  <col className="w-[110px]" />
                  <col className="w-[72px]" />
                  <col className="w-[120px]" />
                  <col className="w-[80px]" />
                  <col className="w-[100px]" />
                </colgroup>
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Full Name</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Doctor</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Regd</th>
                    <th className="px-2 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-2 py-2 text-gray-600 truncate" title={patient.id}>
                        {patient.id?.substring(0, 8)}…
                      </td>
                      <td className="px-2 py-2">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <div className="flex-shrink-0 w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-xs">
                              {patient.full_name?.charAt(0).toUpperCase() || 'P'}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900 truncate">{patient.full_name || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="px-2 py-2 text-gray-600 truncate" title={patient.email}>{patient.email || 'N/A'}</td>
                      <td className="px-2 py-2 text-gray-600">{patient.phone || 'N/A'}</td>
                      <td className="px-2 py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          patient.is_active !== false
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {patient.is_active !== false ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-2 py-2">
                        <select
                          value={patient.assigned_doctor_id || ''}
                          onChange={(e) => handleAssignDoctor(patient.id, e.target.value)}
                          disabled={updating === patient.id}
                          className="border border-gray-300 rounded px-1.5 py-0.5 text-gray-900 text-xs w-full max-w-[110px]"
                        >
                          <option value="">— None —</option>
                          {doctors.map((d: any) => (
                            <option key={d.id} value={d.id}>{d.full_name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-2 py-2 text-gray-600 text-xs">
                        {patient.created_at 
                          ? new Date(patient.created_at).toLocaleDateString()
                          : 'N/A'}
                      </td>
                      <td className="px-2 py-2 font-medium space-x-1 text-xs">
                        <button
                          onClick={() => handleToggleActive(patient)}
                          disabled={updating === patient.id}
                          className={patient.is_active !== false ? 'text-orange-600 hover:text-orange-800 whitespace-nowrap' : 'text-green-600 hover:text-green-800 whitespace-nowrap'}
                        >
                          {patient.is_active !== false ? 'Deactivate' : 'Activate'}
                        </button>
                        <Link href={`/doctor/patients/${patient.id}`} className="text-blue-600 hover:text-blue-800 whitespace-nowrap">View</Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

