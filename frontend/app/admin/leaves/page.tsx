'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { markNotificationsReadOnView } from '@/lib/notificationRead';
import { showConfirm, showError, showSuccess } from '@/lib/alerts';

type LeaveDetails = {
  leave: { id: string; from_date: string; to_date: string; reason: string; is_active: boolean };
  doctor: {
    id: string;
    full_name: string;
    email: string;
    specialization?: string;
    specialization_label: string;
  };
  assigned_patients: { id: string; full_name: string; email: string }[];
  available_substitutes: {
    id: string;
    full_name: string;
    email: string;
    specialization?: string;
    specialization_label: string;
  }[];
};

export default function AdminLeavesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [doctors, setDoctors] = useState<any[]>([]);
  const [leaveAlerts, setLeaveAlerts] = useState<any[]>([]);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [reassigning, setReassigning] = useState(false);
  const [leaveDetails, setLeaveDetails] = useState<LeaveDetails | null>(null);
  const [selectedSubstitute, setSelectedSubstitute] = useState('');
  const [selectedPatients, setSelectedPatients] = useState<string[]>([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    if (!token || !userData) {
      router.push('/login');
      return;
    }
    const parsed = JSON.parse(userData);
    if (parsed.role !== 'admin') {
      router.push('/login');
      return;
    }
    loadData();
  }, [router]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [leaveRes, notifRes] = await Promise.all([
        api.doctorAvailability.listDoctorsWithLeaves(),
        api.notifications.list(),
      ]);
      setDoctors(leaveRes.doctors || []);
      const alerts = (notifRes.notifications || []).filter(
        (n: any) => n.type === 'doctor_leave'
      );
      setLeaveAlerts(await markNotificationsReadOnView(alerts, () => true));
    } catch {
      setError('Failed to load doctor leave data.');
    } finally {
      setLoading(false);
    }
  };

  const openReassignModal = async (leaveId: string) => {
    setModalOpen(true);
    setDetailsLoading(true);
    setLeaveDetails(null);
    setSelectedSubstitute('');
    setSelectedPatients([]);
    try {
      const details = await api.doctorAvailability.getLeaveDetails(leaveId);
      setLeaveDetails(details);
      setSelectedPatients((details.assigned_patients || []).map((p: any) => p.id));
      if (details.available_substitutes?.length === 1) {
        setSelectedSubstitute(details.available_substitutes[0].id);
      }
    } catch {
      await showError('Load failed', 'Could not load leave details.');
      setModalOpen(false);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setLeaveDetails(null);
    setSelectedSubstitute('');
    setSelectedPatients([]);
  };

  const togglePatient = (patientId: string) => {
    setSelectedPatients((prev) =>
      prev.includes(patientId)
        ? prev.filter((id) => id !== patientId)
        : [...prev, patientId]
    );
  };

  const handleReassign = async () => {
    if (!leaveDetails) return;
    if (!selectedSubstitute) {
      await showError('Select doctor', 'Please choose an available substitute doctor.');
      return;
    }
    if (selectedPatients.length === 0) {
      await showError('Select patients', 'Select at least one patient to reassign.');
      return;
    }

    const sub = leaveDetails.available_substitutes.find((d) => d.id === selectedSubstitute);
    const confirmed = await showConfirm(
      'Reassign patients?',
      `Move ${selectedPatients.length} patient(s) to ${sub?.full_name || 'selected doctor'} for this leave period? Risk alerts will go to the substitute doctor, not the doctor on leave.`,
      'Reassign',
      'Cancel'
    );
    if (!confirmed) return;

    setReassigning(true);
    try {
      const result = await api.doctorAvailability.reassignPatients({
        from_doctor_id: leaveDetails.doctor.id,
        to_doctor_id: selectedSubstitute,
        patient_ids: selectedPatients,
        leave_id: leaveDetails.leave.id,
      });
      await showSuccess(
        'Reassigned',
        `${result.reassigned_count} patient(s) assigned to ${result.to_doctor_name}.`
      );
      closeModal();
      loadData();
    } catch (err: any) {
      await showError('Reassign failed', err?.message || 'Could not reassign patients.');
    } finally {
      setReassigning(false);
    }
  };

  const handleDeleteLeave = async (leaveId: string) => {
    const confirmed = await showConfirm(
      'Remove leave?',
      'Are you sure you want to remove this leave entry?',
      'Yes',
      'No'
    );
    if (!confirmed) return;
    try {
      await api.doctorAvailability.deleteLeave(leaveId);
      await showSuccess('Leave removed', 'The leave entry has been deleted.');
      loadData();
    } catch {
      await showError('Delete failed', 'Could not delete leave entry.');
    }
  };

  const markAlertRead = async (id: string) => {
    try {
      await api.notifications.markRead(id);
      setLeaveAlerts((prev) =>
        prev.map((a) => (a.id === id ? { ...a, is_read: true } : a))
      );
    } catch {
      console.error('Failed to mark notification as read');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  const unreadAlerts = leaveAlerts.filter((a) => !a.is_read);
  const totalLeaves = doctors.reduce((sum, d) => sum + (d.leaves?.length || 0), 0);
  const doctorsOnLeaveToday = doctors.filter((d) => d.is_on_leave_today).length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Doctor Leave Management</h1>
        <p className="text-sm text-gray-600 mt-1">
          Review leave, reassign patients to available doctors, and ensure risk alerts reach
          substitutes while a doctor is on leave.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {unreadAlerts.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-amber-900">
              New leave alerts ({unreadAlerts.length})
            </h2>
            <Link href="/admin/alerts" className="text-sm text-amber-800 hover:underline">
              All alerts
            </Link>
          </div>
          {unreadAlerts.map((alert) => (
            <div
              key={alert.id}
              className="bg-white border border-amber-100 rounded-lg p-3 flex justify-between gap-3"
            >
              <div>
                <p className="font-medium text-gray-900">{alert.title}</p>
                <p className="text-sm text-gray-600 mt-1">{alert.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {alert.created_at ? new Date(alert.created_at).toLocaleString() : ''}
                </p>
              </div>
              <button
                onClick={() => markAlertRead(alert.id)}
                className="text-sm text-amber-700 hover:text-amber-900 shrink-0"
              >
                Mark read
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Doctors</p>
          <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">On leave today</p>
          <p className="text-2xl font-bold text-amber-700">{doctorsOnLeaveToday}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Total leave entries</p>
          <p className="text-2xl font-bold text-gray-900">{totalLeaves}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-500">Unread leave alerts</p>
          <p className="text-2xl font-bold text-amber-700">{unreadAlerts.length}</p>
        </div>
      </div>

      <div className="space-y-4">
        {doctors.map((doctor) => (
          <div
            key={doctor.id}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-semibold text-gray-900">{doctor.full_name}</h2>
                  {doctor.is_on_leave_today && (
                    <span className="text-xs font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                      On leave today
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500">{doctor.email}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {doctor.specialization_label} · {doctor.assigned_patient_count} assigned patient(s)
                </p>
              </div>
              <span className="text-sm text-gray-500">
                {(doctor.leaves || []).length} leave record(s)
              </span>
            </div>
            {(doctor.leaves || []).length === 0 ? (
              <div className="p-6 text-gray-500 text-sm">No leave submitted.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">
                        From
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">
                        To
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">
                        Reason
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">
                        Status
                      </th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-gray-700 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {doctor.leaves.map((leave: any) => (
                      <tr key={leave.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 text-gray-900">{leave.from_date}</td>
                        <td className="py-3 px-4 text-gray-900">{leave.to_date}</td>
                        <td className="py-3 px-4 text-gray-600">{leave.reason || '—'}</td>
                        <td className="py-3 px-4">
                          {leave.is_active ? (
                            <span className="text-xs font-medium bg-red-100 text-red-700 px-2 py-0.5 rounded-full">
                              Active leave
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500">Scheduled / past</span>
                          )}
                        </td>
                        <td className="py-3 px-4 space-x-3">
                          <button
                            onClick={() => openReassignModal(leave.id)}
                            className="text-purple-700 hover:underline text-sm font-medium"
                          >
                            Manage &amp; Reassign
                          </button>
                          <button
                            onClick={() => handleDeleteLeave(leave.id)}
                            className="text-red-600 hover:underline text-sm"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Leave Details &amp; Reassign</h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-800 text-xl leading-none"
                aria-label="Close"
              >
                ×
              </button>
            </div>

            {detailsLoading ? (
              <div className="p-12 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600"></div>
              </div>
            ) : leaveDetails ? (
              <div className="p-6 space-y-6">
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <p className="font-medium text-gray-900">
                    Dr. {leaveDetails.doctor.full_name}
                  </p>
                  <p className="text-sm text-gray-600">{leaveDetails.doctor.specialization_label}</p>
                  <p className="text-sm text-gray-700">
                    Leave: {leaveDetails.leave.from_date} → {leaveDetails.leave.to_date}
                  </p>
                  {leaveDetails.leave.reason && (
                    <p className="text-sm text-gray-600">Reason: {leaveDetails.leave.reason}</p>
                  )}
                  {leaveDetails.leave.is_active && (
                    <p className="text-sm text-amber-700 font-medium">
                      Active leave — high-risk alerts will not go to this doctor.
                    </p>
                  )}
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">
                    Assigned patients ({leaveDetails.assigned_patients.length})
                  </h3>
                  {leaveDetails.assigned_patients.length === 0 ? (
                    <p className="text-sm text-gray-500">No patients assigned to this doctor.</p>
                  ) : (
                    <div className="border border-gray-200 rounded-lg divide-y divide-gray-200 max-h-40 overflow-y-auto">
                      {leaveDetails.assigned_patients.map((patient) => (
                        <label
                          key={patient.id}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedPatients.includes(patient.id)}
                            onChange={() => togglePatient(patient.id)}
                            className="rounded border-gray-300 text-purple-600"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{patient.full_name}</p>
                            <p className="text-xs text-gray-500">{patient.email}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block font-medium text-gray-900 mb-2">
                    Available substitute doctor
                  </label>
                  {leaveDetails.available_substitutes.length === 0 ? (
                    <p className="text-sm text-red-600">
                      No available doctors for this leave period. Add another doctor or adjust
                      leave dates.
                    </p>
                  ) : (
                    <select
                      value={selectedSubstitute}
                      onChange={(e) => setSelectedSubstitute(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    >
                      <option value="">Select substitute doctor</option>
                      {leaveDetails.available_substitutes.map((sub) => (
                        <option key={sub.id} value={sub.id}>
                          {sub.full_name} — {sub.specialization_label}
                        </option>
                      ))}
                    </select>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Only doctors not on leave during this period are shown.
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={closeModal}
                    className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleReassign}
                    disabled={
                      reassigning ||
                      !selectedSubstitute ||
                      selectedPatients.length === 0 ||
                      leaveDetails.available_substitutes.length === 0
                    }
                    className="px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                  >
                    {reassigning ? 'Reassigning…' : 'Reassign selected patients'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
