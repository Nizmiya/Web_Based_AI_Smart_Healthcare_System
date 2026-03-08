# Database Full Analysis – Web-based AI-Powered Smart Healthcare System

**Database:** MongoDB (NoSQL)  
**Database name:** `healthcare_db` (from `DATABASE_NAME` in backend config)

---

## Summary: Collections (Tables)

| # | Collection Name     | Purpose |
|---|---------------------|---------|
| 1 | **users**           | All users: patients, doctors, admins (role-based) |
| 2 | **predictions**     | Disease prediction results (diabetes, heart, kidney) |
| 3 | **notifications**   | In-app alerts (high-risk, doctor review, etc.) |
| 4 | **otps**            | One-time passwords for forgot-password flow |
| 5 | **consultations**   | Doctor–patient appointments/sessions |
| 6 | **patient_records**| Per-disease parameter snapshots (from predictions + manual) |
| 7 | **system_settings** | Single-document app config (admin only) |
| 8 | **audit_logs**      | Who (doctor/admin) accessed what and when |
| 9 | **doctor_leaves**   | Doctor leave/availability (from_date, to_date) |

**Note:** `simple_db_create.py` creates only 6 collections (users, predictions, notifications, otps, consultations, patient_records). The rest (**system_settings**, **audit_logs**, **doctor_leaves**) are created on first insert when the app runs.

---

## 1. users

**என்ன சேமிக்கிறது:** எல்லா users-உம் (patient, doctor, admin). Login, profile, role, assigned doctor (patient only), doctor remarks (patient only).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes (PK) | Auto-generated |
| email | string | Yes | Unique; login identifier |
| full_name | string | Yes | Display name |
| phone | string | Yes | Contact |
| password | string | Yes | Hashed (bcrypt) |
| role | string | Yes | `"patient"` \| `"doctor"` \| `"admin"` |
| is_active | boolean | Yes | Account active/deactivated by admin |
| created_at | datetime | Yes | Registration time |
| created_by | string (user id) | No | Only for doctors (admin who created) |
| age | number | No | Patient profile |
| gender | string | No | Patient profile |
| address | string | No | Patient profile |
| emergency_contact | string | No | Patient profile |
| medical_history | array | No | Patient – list of strings |
| allergies | array | No | Patient – list of strings |
| current_medications | array | No | Patient – list of strings |
| assigned_doctor_id | ObjectId → users | No | Patient only; FK to doctor |
| doctor_remarks | array | No | Patient only; `[{ doctor_id, doctor_name, remark, created_at }]` |

**Indexes:** `email` (unique), `role`

**எங்கே use:** Auth (login/register), profile get/put, admin doctors CRUD, admin users patch (is_active), assign doctor, patient profile + remarks.

---

## 2. predictions

**என்ன சேமிக்கிறது:** ஒவ்வொரு disease prediction-உம் (diabetes / heart_disease / kidney_disease). Input, result, risk, recommendation, doctor review.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes (PK) | Auto-generated |
| user_id | string | Yes | FK → users (patient) |
| disease_type | string | Yes | `"diabetes"` \| `"heart_disease"` \| `"kidney_disease"` |
| input_data | object | Yes | Form fields (e.g. glucose, bmi, age …) |
| prediction | int | Yes | 0 = Negative, 1 = Positive |
| risk_percentage | float | Yes | 0–100 |
| risk_level | string | Yes | e.g. Low, Medium, High, Critical |
| recommendation | string/array | Yes | AI (Gemini) recommendation for patient |
| doctor_recommendation | string | No | AI recommendation for doctor |
| video_recommendations | array | No | Links/titles for recommendation videos |
| reviewed | boolean | Yes | Doctor reviewed or not |
| doctor_review | object | No | `{ doctor_id, doctor_name, comment, reviewed_at }` |
| created_at | datetime | Yes | When prediction was run |

**Indexes:** `user_id`, `disease_type`, `created_at`

**எங்கே use:** POST /predictions/diabetes|heart|kidney, history, all (doctor/admin), review (doctor).

---

## 3. notifications

**என்ன சேமிக்கிறது:** In-app notifications – high-risk alerts, doctor review available, etc. User-wise list.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes (PK) | Auto-generated |
| user_id | string/ObjectId | Yes | FK → users (recipient) |
| type | string | Yes | e.g. `"high_risk"`, `"doctor_review"` |
| title | string | Yes | Short title |
| message | string | Yes | Body text |
| is_read | boolean | Yes | Read/unread |
| created_at | datetime | Yes | When created |
| prediction_id | string | No | FK → predictions (if from prediction) |
| patient_id | string | No | For doctor notifications – which patient |

**Indexes:** `user_id`, `is_read`

**எங்கே use:** GET notifications list, PUT mark as read; created when high-risk prediction or doctor review.

---

## 4. otps

**என்ன சேமிக்கிறது:** Forgot-password OTP. Email-க்கு அனுப்பின OTP code, expiry, use ஆனதா.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes (PK) | Auto-generated |
| otp_id | string (UUID) | Yes | Unique OTP record id |
| email | string | Yes | User email |
| otp_code | string | Yes | 4-digit OTP |
| createdAt | string (ISO) | Yes | When OTP created |
| expiresAt | string (ISO) | Yes | Expiry (e.g. +10 min) |
| is_used | boolean | Yes | Used in verify/reset or not |

**Indexes:** (script-ல explicit index இல்லை; query by email + is_used)

**எங்கே use:** Forgot password → send OTP → verify-otp → reset-password.

---

## 5. consultations

**என்ன சேமிக்கிறது:** Doctor–patient consultations (appointments). Scheduled time, status, notes.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes (PK) | Auto-generated |
| patient_id | ObjectId | Yes | FK → users (patient) |
| doctor_id | ObjectId | Yes | FK → users (doctor) |
| scheduled_at | datetime | Yes | Appointment time |
| status | string | Yes | `"scheduled"` \| `"completed"` \| `"cancelled"` |
| notes | string | No | General notes (patient-visible) |
| doctor_private_notes | string | No | Doctor-only notes |
| created_at | datetime | Yes | When record created |

**Indexes:** `patient_id`, `doctor_id`, `scheduled_at`

**எங்கே use:** POST consultation, GET list (by role), GET one, PATCH (status, notes).

---

## 6. patient_records

**என்ன சேமிக்கிறது:** Disease-wise parameter records – prediction run பண்ணும்போது auto save + manual “store parameters” API. History/analytics use.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| _id | ObjectId | Yes (PK) | Auto-generated |
| patient_id | ObjectId | Yes | FK → users (patient) |
| disease_type | string | Yes | `"diabetes"` \| `"heart_disease"` \| `"kidney_disease"` |
| parameters | object | Yes | Input parameters (disease-specific keys) |
| prediction_result | object | No | From prediction flow: prediction, risk_percentage, risk_level, recommendation, etc. |
| created_by | ObjectId | No | Who created (usually patient) |
| created_at | datetime | Yes | |
| updated_at | datetime | Yes | |

**Indexes:** `patient_id`, `disease_type`

**எங்கே use:** Prediction APIs (insert after each prediction), patient records API (create/get/update/delete/list).

---

## 7. system_settings

**என்ன சேமிக்கிறது:** Single document – global app settings. Admin only get/put.

| Field | Type | Description |
|-------|------|-------------|
| _id | string | Always `"global"` (single doc) |
| systemName | string | App name |
| maxFileSize | number | Max upload size etc. |
| sessionTimeout | number | Session timeout (e.g. minutes) |
| emailNotifications | boolean | |
| smsNotifications | boolean | |
| maintenanceMode | boolean | |
| allowRegistration | boolean | New patient signup on/off |

**எங்கே use:** GET/PUT /admin/settings. Upsert by _id = "global".

---

## 8. audit_logs

**என்ன சேமிக்கிறது:** Doctor/Admin எப்போது எந்த patient data-ஐ access பண்ணினோம் (view profile, etc.) – compliance/audit.

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | PK |
| user_id | string | Doctor or admin who did the action |
| role | string | "doctor" \| "admin" |
| action | string | e.g. "view_patient_profile" |
| resource_type | string | e.g. "patient" |
| resource_id | string | Optional |
| patient_id | string | Optional – which patient |
| details | object | Optional extra |
| created_at | datetime | When |

**எங்கே use:** When doctor/admin views patient profile (log_audit); GET /admin/audit-logs.

---

## 9. doctor_leaves

**என்ன சேமிக்கிறது:** Doctor leave dates – unavailable period.

| Field | Type | Description |
|-------|------|-------------|
| _id | ObjectId | PK |
| doctor_id | ObjectId | FK → users (doctor) |
| from_date | string (ISO date) | Start date |
| to_date | string (ISO date) | End date |
| reason | string | Optional |
| created_at | datetime | When record created |

**எங்கே use:** Doctor availability/leave API – add leave, list, delete.

---

## Relationships (சுருக்கம்)

| From | To | Relation |
|------|-----|----------|
| users | users | patient.assigned_doctor_id → doctor |
| users | predictions | 1 user (patient) : N predictions |
| users | notifications | 1 user : N notifications |
| users | consultations | 1 patient : N consultations; 1 doctor : N consultations |
| users | patient_records | 1 patient : N patient_records |
| users | doctor_leaves | 1 doctor : N doctor_leaves |
| predictions | notifications | 1 prediction can create N notifications (high-risk, review) |

---

## Indexes Summary

| Collection | Indexes |
|------------|---------|
| users | email (unique), role |
| predictions | user_id, disease_type, created_at |
| notifications | user_id, is_read |
| consultations | patient_id, doctor_id, scheduled_at |
| patient_records | patient_id, disease_type |
| otps | (none in script; created on first use) |
| system_settings | (single doc by _id) |
| audit_logs | (none in code) |
| doctor_leaves | (none in code) |

---

## எங்கே எந்த table use ஆகுது (Quick ref)

- **Login/Register/Forgot password:** users, otps  
- **Profile:** users (profile fields, doctor_remarks, assigned_doctor_id)  
- **Predictions:** predictions, patient_records, notifications  
- **Doctor review:** predictions (doctor_review, reviewed), notifications  
- **Consultations:** consultations  
- **Admin:** users (CRUD doctors, is_active, assign doctor), system_settings, audit_logs, reports from users/predictions/consultations  
- **Doctor leave:** doctor_leaves  

இது தான் உங்க system-ல இருக்கும் **முழு database (tables/collections) analysis**.
