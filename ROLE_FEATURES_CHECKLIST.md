# Role-Based Features Checklist (vs Table)

Comparison of **System Overview – Role Based Features** table vs current implementation.

---

## ✅ Correct / Implemented

### All roles
- **Security:** JWT authentication, bcrypt password hashing, role-based API protection.

### Patient
- **Main:** Disease prediction (Diabetes, Heart, Kidney), health monitoring (dashboard), personal management (profile).
- **Disease predictions:** View Diabetes / Heart / Kidney risk predictions.
- **Prediction history:** View all past predictions, track risk levels and percentages; doctor review shown.
- **Profile:** Update personal info (name, email, phone).
- **Dashboard:** Recent predictions, stats (total, high risk, reviewed), quick actions, high-risk alert banner.
- **High-risk alerts:** Critical/high risk alerts on dashboard; doctor review notifications.

### Doctor
- **Main:** Patient supervision (patients list, all predictions), prediction analysis, medical review (review on predictions).
- **Disease predictions:** Review patient predictions, analyze risk levels.
- **Prediction history:** Access all predictions (`/predictions/all`), filter by risk/reviewed.
- **Dashboard:** Stats (patients, high-risk count, pending reviews), high-risk alerts (notifications), recent predictions.
- **Patient management:** View all patients, monitor risk via predictions.
- **High-risk alerts:** Notifications for high-risk patients, priority review (Reviews page).
- **Medical review:** Add comment on prediction and optionally notify patient.

### Admin
- **Main:** System control, user management, analytics (dashboard stats).
- **Disease predictions:** Monitor prediction statistics (total count on dashboard).
- **Prediction history:** View system-wide predictions (`/predictions/all`).
- **Profile management:** Manage users (list all users, list patients).
- **Dashboard:** System statistics (total users, doctors, patients, predictions).
- **Patient management:** View all patients (Manage Patients page with search).
- **User management:** Create doctor, list doctors, delete doctor; list all users with role filter; list patients.
- **System settings:** Settings page (system name, file size, session timeout, notifications, maintenance, registration) – UI only, not persisted in backend.

---

## ⚠️ Partial / Missing

### Patient
| Feature (from table) | Status |
|----------------------|--------|
| Add medical history, allergies, medications in profile | **Missing in UI.** Backend model (`PatientProfile`) has `medical_history`, `allergies`, `current_medications` but profile page only has name, email, phone. |
| Filter predictions by disease type | **Missing in UI.** Backend supports `disease_type` on history API; frontend has no filter dropdown. |

### Doctor
| Feature (from table) | Status |
|----------------------|--------|
| Access patient profiles and update medical remarks | **Partial.** Doctor can list patients and add “review” (comment) on a **prediction**, not a general “medical remarks” field on patient profile. No dedicated patient profile view for doctor. |
| Manage consultations | **Placeholder only.** Consultations page has “Schedule New Consultation” button but no backend or real flow. |

### Admin
| Feature (from table) | Status |
|----------------------|--------|
| Assign doctors to patients | **Not implemented.** No API or UI to link a doctor to specific patients. |
| Approve / deactivate user accounts | **Not implemented.** `is_active` exists in DB and is shown in Admin Patients table; no API to toggle (e.g. PATCH user deactivate) and no Approve/Deactivate buttons. |
| Manage ML models | **Not implemented.** No “manage models” (upload/version) in Admin; settings are generic only. |
| Generate reports and trends | **Not implemented.** No reports/analytics API or UI. |
| System settings | **UI only.** Settings page exists but values are not saved to backend. |

---

## Summary

- **Correct:** Most of the table is implemented: roles (patient/doctor/admin), 3 disease predictions, history, dashboards, high-risk alerts, doctor review, JWT/bcrypt, admin user/doctor/patient listing and doctor CRUD.
- **Gaps:**  
  - Patient: profile medical history/allergies/medications in UI; optional prediction filter by disease.  
  - Doctor: patient profile view + general “medical remarks”; real consultation flow.  
  - Admin: assign doctor to patient; approve/deactivate users (API + UI); ML model management; reports/trends; persist system settings in backend.

If you want to match the table 100%, the next steps are: (1) Patient profile UI for medical history/allergies/medications, (2) Admin API + UI for approve/deactivate and (optionally) assign doctor to patient, (3) Optional: prediction filter by disease, doctor medical remarks on profile, consultation backend, ML settings, reports.
