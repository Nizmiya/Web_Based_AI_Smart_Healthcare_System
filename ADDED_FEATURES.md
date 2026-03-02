# Added Features (Role-Based Gaps Filled)

## Backend

### Database (MongoDB collections used)
- **users**: Existing. Now also stores: `medical_history`, `allergies`, `current_medications` (arrays), `doctor_remarks` (array of `{ doctor_id, doctor_name, remark, created_at }`), `assigned_doctor_id` (ObjectId, for patients).
- **consultations**: New. Fields: `patient_id`, `doctor_id`, `scheduled_at`, `status` (scheduled/completed/cancelled), `notes`, `created_at`.
- **system_settings**: New. Single document `_id: "global"` with keys: `systemName`, `maxFileSize`, `sessionTimeout`, `emailNotifications`, `smsNotifications`, `maintenanceMode`, `allowRegistration`.

### New/Updated API Endpoints

| Method | Endpoint | Description | Role |
|--------|----------|-------------|------|
| GET | `/api/v1/users/patients/{patient_id}/profile` | Get patient profile (incl. doctor_remarks) | Doctor, Admin |
| POST | `/api/v1/users/patients/{patient_id}/remarks` | Add medical remark to patient | Doctor, Admin |
| GET | `/api/v1/users/patients` | List all patients | Doctor, Admin (was Admin only) |
| PUT | `/api/v1/users/profile` | Update profile; allowed fields include `medical_history`, `allergies`, `current_medications` | Any (own profile) |
| PATCH | `/api/v1/admin/users/{user_id}` | Set `is_active` (activate/deactivate) | Admin |
| POST | `/api/v1/admin/patients/{patient_id}/assign-doctor` | Assign doctor to patient | Admin |
| DELETE | `/api/v1/admin/patients/{patient_id}/assign-doctor` | Unassign doctor | Admin |
| GET | `/api/v1/admin/settings` | Get system settings from DB | Admin |
| PUT | `/api/v1/admin/settings` | Save system settings to DB | Admin |
| GET | `/api/v1/admin/reports/summary` | Stats: total_patients, total_doctors, total_predictions, high_risk_predictions, predictions_by_disease | Admin |
| GET | `/api/v1/admin/models` | List ML model files in `ml_models` folder | Admin |
| POST | `/api/v1/consultations` | Create consultation | Doctor, Admin |
| GET | `/api/v1/consultations` | List consultations (patient: own, doctor: own, admin: all) | All |
| GET | `/api/v1/consultations/{id}` | Get one consultation | All (by role) |
| PATCH | `/api/v1/consultations/{id}` | Update status/notes/scheduled_at | Doctor, Admin |

### Existing endpoint used
- `GET /api/v1/predictions/history?disease_type=...` — already supported `disease_type` filter.

---

## Frontend

### Patient
- **Profile** (`/patient/profile`): Added fields: Age, Gender, Address, Emergency Contact, Medical History (one per line), Allergies (one per line), Current Medications (one per line). Load/save via profile API.
- **Predictions** (`/patient/predictions`): Added dropdown **Filter by disease** (All, Diabetes, Heart Disease, Kidney Disease). Calls history API with `disease_type` when filter selected.

### Doctor
- **Patients** (`/doctor/patients`): Uses `api.users.getPatients()`. Link "View Profile & Remarks" goes to `/doctor/patients/[patientId]`.
- **Patient profile** (`/doctor/patients/[patientId]`): New page. Shows patient personal + medical info and doctor_remarks; form to **Add Medical Remark** (calls `POST /users/patients/:id/remarks`).
- **Consultations** (`/doctor/consultations`): Full flow: list consultations, **Schedule New Consultation** (select patient, date/time, notes), Mark completed / Cancel (PATCH status).

### Admin
- **Patients** (`/admin/patients`): **Deactivate / Activate** button per patient (PATCH admin users). **Assigned Doctor** dropdown per patient (POST/DELETE assign-doctor). **View** link to patient profile page.
- **Settings** (`/admin/settings`): Load settings from `GET /admin/settings` on mount; save with `PUT /admin/settings` (persisted in DB).
- **Reports** (`/admin/reports`): New page. Shows total patients, doctors, predictions, high-risk count, and predictions by disease (from `GET /admin/reports/summary`).
- **ML Models** (`/admin/models`): New page. Lists model files from `GET /admin/models`.
- **Layout**: Nav updated with "Reports" and "ML Models".

---

## Summary

- **Patient:** Profile medical history/allergies/medications + prediction filter by disease.
- **Doctor:** Patient profile view + medical remarks + consultations (list, create, update status).
- **Admin:** Activate/deactivate users, assign/unassign doctor to patient, persist system settings, reports/analytics, ML models list.

All of the above use the new endpoints and DB usage described. Login already rejects inactive users (`is_active` check in auth).
