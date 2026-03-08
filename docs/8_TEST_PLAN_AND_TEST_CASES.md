# 7.0 Testing and Validation

**Project:** Web-based AI-Powered Smart Healthcare System for Multi-Disease Prediction, Risk Assessment, and Personalized Health Recommendations

This document provides the **Test Plan** and **50 Test Cases** in table format for the academic report.

---

## Test Plan

Testing is organized into the following levels:

| Level | Scope | Approach |
|-------|--------|----------|
| **Unit Testing** | ML models (Diabetes, Heart, Kidney) | Confusion matrix, F1-score, ROC-AUC in Jupyter; validation of scalers/encoders and threshold mapping. |
| **API Integration Testing** | Backend (FastAPI) | Postman/automated scripts; Pydantic validation, JWT auth, RBAC (Patient/Doctor/Admin); status codes and response schema. |
| **End-to-End Testing** | Frontend → Backend → DB | Manual/automated flows as Patient, Doctor, Admin; login, predictions, history, profile, consultations, admin operations. |
| **Security & RBAC** | All protected routes | Unauthenticated access (401); wrong-role access (403); invalid/expired token handling. |
| **Edge & Resilience** | Predictions, LLM, file I/O | Missing/invalid inputs; missing model files; Gemini timeout/fallback; extreme/outlier input values. |

**Entry criteria:** Build deployable; backend and frontend running; MongoDB and ml_models available.  
**Exit criteria:** All 50 test cases executed; critical/blocker issues resolved; report documented.

---

## 
| TC50 | Consultations | Patient only own list | High |Test Cases (50)

### 7.1 Authentication and Authorization (TC01 – TC10)

| TC-ID | Module | Test Case Description | Precondition | Test Steps | Expected Result | Priority |
|-------|--------|------------------------|--------------|------------|-----------------|----------|
| TC01 | Auth | Patient registration with valid data | App running, unique email | 1. Open /register. 2. Enter name, email, password, role Patient. 3. Submit. | Account created; password hashed; redirect to login or dashboard. | High |
| TC02 | Auth | Doctor registration (account created) | App running | 1. Register with role Doctor. 2. Submit. | Account created; access as per admin approval flow. | High |
| TC03 | Auth | Duplicate email rejection | User with same email exists | 1. Register again with same email. 2. Submit. | 400 Bad Request; message "Email already registered"; no duplicate. | High |
| TC04 | Auth | Login with valid credentials | Valid account exists | 1. Open /login. 2. Enter correct email and password. 3. Submit. | 200; JWT returned; redirect to role-based dashboard. | High |
| TC05 | Auth | Login with wrong password | Valid email exists | 1. Enter correct email, wrong password. 2. Submit. | 401 Unauthorized; generic invalid-credentials message. | High |
| TC06 | Auth | Access protected route without token | No JWT in request | 1. GET /api/v1/users/me (or /auth/me) without Authorization header. | 401 Unauthorized. | High |
| TC07 | Auth | Patient accessing admin-only endpoint | Logged in as Patient | 1. Call GET /api/v1/admin/doctors or /admin/reports/summary with Patient JWT. | 403 Forbidden. | High |
| TC08 | Auth | Doctor accessing admin-only endpoint | Logged in as Doctor | 1. Call POST /api/v1/admin/doctors or PATCH admin/users with Doctor JWT. | 403 Forbidden. | High |
| TC09 | Auth | Get current user profile (authenticated) | Valid JWT | 1. GET /api/v1/auth/me or /users/profile with valid token. | 200; user object returned; password not in response. | Medium |
| TC10 | Auth | Update own profile (name, phone) | Authenticated user | 1. PUT /api/v1/users/profile with updated name/phone. 2. GET profile again. | 200; DB updated; GET returns new values. | Medium |

---

### 7.2 Patient – Predictions and History (TC11 – TC20)

| TC-ID | Module | Test Case Description | Precondition | Test Steps | Expected Result | Priority |
|-------|--------|------------------------|--------------|------------|-----------------|----------|
| TC11 | Predictions | Diabetes prediction – valid input | Patient logged in, models loaded | 1. POST /api/v1/predictions/diabetes with valid body (e.g. Pregnancies, Glucose, BP, etc.). | 200; prediction (0/1), risk_percentage, risk_level, recommendation, video_recommendations. | High |
| TC12 | Predictions | Heart disease prediction – valid input | Patient logged in | 1. POST /api/v1/predictions/heart-disease with valid body. | 200; prediction, risk_percentage, risk_level, recommendation. | High |
| TC13 | Predictions | Kidney disease prediction – valid input | Patient logged in | 1. POST /api/v1/predictions/kidney-disease with valid body. | 200; prediction, risk_percentage, risk_level, recommendation. | High |
| TC14 | Predictions | Diabetes – missing required field | Patient logged in | 1. POST diabetes with body missing e.g. glucose. | 422 Unprocessable Entity; validation error for missing field. | High |
| TC15 | Predictions | Diabetes – invalid type (string in numeric field) | Patient logged in | 1. POST diabetes with e.g. glucose: "high". | 422; Pydantic validation error. | High |
| TC16 | Predictions | Prediction saved to history | Successful prediction done | 1. GET /api/v1/predictions/history. | 200; list includes latest prediction with user_id, disease_type, risk_level. | High |
| TC17 | Predictions | Filter history by disease type | Patient has multiple predictions | 1. GET /api/v1/predictions/history?disease_type=diabetes. | 200; only diabetes predictions returned. | Medium |
| TC18 | Predictions | High/Critical risk triggers notification | Prediction returns High/Critical | 1. Run prediction that yields High/Critical. 2. GET /api/v1/notifications for patient. | Notification created for patient (and doctors as per design). | High |
| TC19 | Predictions | LLM fallback when Gemini fails | Gemini unavailable or timeout | 1. Trigger prediction (or mock Gemini error). | 200; recommendation from FALLBACK_RECOMMENDATIONS; no crash. | Medium |
| TC20 | Predictions | Extreme input – Critical risk mapping | Patient logged in | 1. Submit diabetes/heart/kidney inputs with extreme values. | Risk level maps to High or Critical as per threshold logic. | Medium |

---

### 7.3 Doctor – Patients, Reviews, Consultations (TC21 – TC30)

| TC-ID | Module | Test Case Description | Precondition | Test Steps | Expected Result | Priority |
|-------|--------|------------------------|--------------|------------|-----------------|----------|
| TC21 | Users | Doctor lists all patients | Doctor logged in | 1. GET /api/v1/users/patients. | 200; list of patients (id, name, email, etc.). | High |
| TC22 | Users | Doctor views patient profile | Doctor logged in, patient exists | 1. GET /api/v1/users/patients/{patient_id}/profile. | 200; profile + medical_history, allergies, doctor_remarks. | High |
| TC23 | Users | Doctor adds medical remark to patient | Doctor logged in | 1. POST /api/v1/users/patients/{patient_id}/remarks with remark text. | 201/200; remark appended; GET profile shows new remark. | High |
| TC24 | Predictions | Doctor lists all predictions | Doctor logged in | 1. GET /api/v1/predictions/all. | 200; list of predictions (with filters if supported). | High |
| TC25 | Predictions | Doctor adds review to prediction | Doctor logged in, prediction exists | 1. POST /api/v1/predictions/{id}/review with comment, optional notify. | 200; prediction has doctor_review; optional notification to patient. | High |
| TC26 | Consultations | Doctor creates consultation | Doctor logged in | 1. POST /api/v1/consultations with patient_id, scheduled_at, notes. | 201; consultation created; doctor_id from JWT. | High |
| TC27 | Consultations | Doctor lists own consultations | Doctor logged in | 1. GET /api/v1/consultations. | 200; only consultations where doctor_id = current user. | High |
| TC28 | Consultations | Doctor updates consultation status | Doctor owns consultation | 1. PATCH /api/v1/consultations/{id} with status completed/cancelled. | 200; status updated in DB. | High |
| TC29 | Consultations | Doctor cannot update another doctor’s consultation | Doctor A logged in, consultation by Doctor B | 1. PATCH /consultations/{id} for other doctor’s consultation. | 403 or 404. | Medium |
| TC30 | Notifications | Doctor receives high-risk alerts | High-risk prediction exists | 1. GET /api/v1/notifications as Doctor. | Notifications for high-risk patients visible. | Medium |

---

### 7.4 Admin – User and System Management (TC31 – TC42)

| TC-ID | Module | Test Case Description | Precondition | Test Steps | Expected Result | Priority |
|-------|--------|------------------------|--------------|------------|-----------------|----------|
| TC31 | Admin | Admin dashboard – report summary | Admin logged in | 1. GET /api/v1/admin/reports/summary. | 200; total_patients, total_doctors, total_predictions, high_risk, by disease. | High |
| TC32 | Admin | Admin lists all patients | Admin logged in | 1. GET /api/v1/users/patients or /admin equivalent. | 200; full patient list. | High |
| TC33 | Admin | Admin deactivates user | Admin logged in, user exists | 1. PATCH /api/v1/admin/users/{user_id} with is_active: false. | 200; user is_active = false; login later returns 401. | High |
| TC34 | Admin | Admin activates user | Admin logged in, user inactive | 1. PATCH /api/v1/admin/users/{user_id} with is_active: true. | 200; user can login again. | High |
| TC35 | Admin | Admin assigns doctor to patient | Admin logged in | 1. POST /api/v1/admin/patients/{patient_id}/assign-doctor with doctor_id. | 200; patient.assigned_doctor_id set. | High |
| TC36 | Admin | Admin unassigns doctor from patient | Admin logged in, patient has assigned doctor | 1. DELETE /api/v1/admin/patients/{patient_id}/assign-doctor. | 200; assigned_doctor_id cleared. | Medium |
| TC37 | Admin | Admin creates doctor | Admin logged in | 1. POST /api/v1/admin/doctors with name, email, password. | 201; new user with role doctor. | High |
| TC38 | Admin | Admin deletes doctor | Admin logged in, doctor exists | 1. DELETE /api/v1/admin/doctors/{doctor_id}. | 200/204; doctor removed or deactivated. | High |
| TC39 | Admin | Admin gets system settings | Admin logged in | 1. GET /api/v1/admin/settings. | 200; systemName, maxFileSize, sessionTimeout, etc. | Medium |
| TC40 | Admin | Admin saves system settings | Admin logged in | 1. PUT /api/v1/admin/settings with updated values. | 200; system_settings document updated in DB. | High |
| TC41 | Admin | Admin lists ML models | Admin logged in | 1. GET /api/v1/admin/models. | 200; list of files (e.g. diabetes_model.pkl, threshold.json). | Medium |
| TC42 | Admin | Admin views all consultations | Admin logged in | 1. GET /api/v1/consultations as Admin. | 200; all consultations in system. | Medium |

---

### 7.5 Notifications, Chatbot, and Edge Cases (TC43 – TC50)

| TC-ID | Module | Test Case Description | Precondition | Test Steps | Expected Result | Priority |
|-------|--------|------------------------|--------------|------------|-----------------|----------|
| TC43 | Notifications | Patient gets own notifications | Patient logged in | 1. GET /api/v1/notifications/. | 200; only current user’s notifications. | Medium |
| TC44 | Notifications | Mark notification as read | User has unread notification | 1. PUT /api/v1/notifications/{id}/read. | 200; is_read = true. | Low |
| TC45 | Chatbot | Chatbot message – valid input | User logged in | 1. POST /api/v1/chatbot/message with message text. | 200; AI response in body. | Medium |
| TC46 | Chatbot | Chatbot – empty message rejected | User logged in | 1. POST /chatbot/message with empty or too-short message. | 400 Bad Request or 422. | Low |
| TC47 | Patient Records | Patient records – store and retrieve | Doctor/Admin or as per API | 1. POST /api/v1/patient-records/store. 2. GET patient records. | Record stored; GET returns it with correct patient_id. | Medium |
| TC48 | Predictions | Missing model file – graceful error | Model .pkl removed or path wrong | 1. Trigger prediction. | 503 or 500 with clear message; no unhandled crash. | High |
| TC49 | Auth | Inactive user cannot login | User exists with is_active: false | 1. POST login with that user’s credentials. | 401 Unauthorized. | High |
| TC50 | Consultations | Patient views only own consultations | Patient logged in | 1. GET /api/v1/consultations. | 200; only consultations where patient_id = current user. | High |

---

## Summary Table (All 50 Test Cases)

| TC-ID | Module | Brief Description | Priority |
|-------|--------|-------------------|----------|
| TC01 | Auth | Patient registration valid | High |
| TC02 | Auth | Doctor registration | High |
| TC03 | Auth | Duplicate email rejection | High |
| TC04 | Auth | Login valid | High |
| TC05 | Auth | Login wrong password | High |
| TC06 | Auth | Protected route no token | High |
| TC07 | Auth | Patient → Admin RBAC | High |
| TC08 | Auth | Doctor → Admin RBAC | High |
| TC09 | Auth | Get profile | Medium |
| TC10 | Auth | Update profile | Medium |
| TC11 | Predictions | Diabetes prediction valid | High |
| TC12 | Predictions | Heart prediction valid | High |
| TC13 | Predictions | Kidney prediction valid | High |
| TC14 | Predictions | Missing field validation | High |
| TC15 | Predictions | Invalid type validation | High |
| TC16 | Predictions | History saved | High |
| TC17 | Predictions | History filter by disease | Medium |
| TC18 | Predictions | High-risk notification | High |
| TC19 | Predictions | LLM fallback | Medium |
| TC20 | Predictions | Extreme input → Critical | Medium |
| TC21 | Users | Doctor list patients | High |
| TC22 | Users | Doctor view patient profile | High |
| TC23 | Users | Doctor add remark | High |
| TC24 | Predictions | Doctor list all predictions | High |
| TC25 | Predictions | Doctor add review | High |
| TC26 | Consultations | Doctor create consultation | High |
| TC27 | Consultations | Doctor list own | High |
| TC28 | Consultations | Doctor update status | High |
| TC29 | Consultations | Doctor cannot update other’s | Medium |
| TC30 | Notifications | Doctor high-risk alerts | Medium |
| TC31 | Admin | Reports summary | High |
| TC32 | Admin | List patients | High |
| TC33 | Admin | Deactivate user | High |
| TC34 | Admin | Activate user | High |
| TC35 | Admin | Assign doctor to patient | High |
| TC36 | Admin | Unassign doctor | Medium |
| TC37 | Admin | Create doctor | High |
| TC38 | Admin | Delete doctor | High |
| TC39 | Admin | Get settings | Medium |
| TC40 | Admin | Save settings | High |
| TC41 | Admin | List ML models | Medium |
| TC42 | Admin | View all consultations | Medium |
| TC43 | Notifications | Patient get notifications | Medium |
| TC44 | Notifications | Mark read | Low |
| TC45 | Chatbot | Valid message | Medium |
| TC46 | Chatbot | Empty message rejected | Low |
| TC47 | Patient Records | Store and retrieve | Medium |
| TC48 | Predictions | Missing model handling | High |
| TC49 | Auth | Inactive user login blocked | High |

---

*Use this document in **Section 7.0 Testing and Validation** of your final academic report. Copy the Test Plan table and the Test Case tables (7.1–7.5) into your report; add a Pass/Fail column after execution and optionally a column for Actual Result or Remarks.*
