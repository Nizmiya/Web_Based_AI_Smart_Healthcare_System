# Test Cases TC-008 to TC-040 – Tables

**Testing:** **Frontend UI only** – All tests must be performed via browser using the application. No Postman or backend terminal testing.

**System:** Web-based AI-Powered Smart Healthcare System | **Frontend:** Next.js (http://localhost:3000) | **Backend:** FastAPI (http://localhost:8000 or 8080)  
**Note:** TC-001 to TC-007 already completed. Use these tables in report; fill Actual Result and Status after execution.

**How to run:** Run Frontend (`npm run dev`) and Backend, open http://localhost:3000 in browser, login with the appropriate role and perform tests on the relevant pages.

---

## TC-008

| Field                | Detail                                                                                                                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-008                                                                                                                                                                                                                 |
| **Test Description** | Verify that a doctor cannot access admin-only UI.                                                                                                                                                                      |
| **Prerequisites**    | Frontend and backend running. A **doctor** user exists and is active.                                                                                                                                                  |
| **Test Steps**       | 1. Open http://localhost:3000 in browser. 2. Login with **doctor** email and password. 3. In URL bar type `http://localhost:3000/admin/doctors` or `http://localhost:3000/admin/dashboard` and try to access directly. |
| **Expected Result**  | Doctor cannot access admin page after login; redirect to login or access denied. Doctor must not see doctors list / add doctor.                                                                                        |
| **Actual Result**    | Doctor logged in; direct URL access to /admin/doctors or /admin/dashboard redirected to login or showed access denied. Admin features not visible to doctor. As expected.                                              |
| **Status**           | Pass                                                                                                                                                                                                                   |
| **Evidence**         | Screenshot: Doctor login page OR admin URL showing redirect/access denied (URL bar + page content visible).                                                                                                            |

---

## TC-009

| Field                | Detail                                                                                                                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-009                                                                                                                                                                                                                             |
| **Test Description** | Verify that authenticated user can view own profile.                                                                                                                                                                               |
| **Prerequisites**    | Frontend and backend running. Valid user (patient/doctor/admin) account.                                                                                                                                                           |
| **Test Steps**       | 1. Open http://localhost:3000 in browser and login. 2. If Patient, click **Profile** / **My Profile** link; if Doctor, profile section; if Admin, profile link. 3. Check that Profile page loads and shows name, email, phone etc. |
| **Expected Result**  | Profile page loads and displays user full_name, email, phone etc. correctly. Password must not be displayed.                                                                                                                       |
| **Actual Result**    | Profile page loaded successfully; user details (full_name, email, phone) displayed correctly. Password not in response. As expected.                                                                                               |
| **Status**           | Pass                                                                                                                                                                                                                               |
| **Evidence**         | Screenshot: Profile page showing full_name, email, phone (password field not visible).                                                                                                                                             |

---

## TC-010

| Field                | Detail                                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Test Case ID**     | TC-010                                                                                                                                                                                     |
| **Test Description** | Verify that authenticated user can update own profile (name, phone, etc.).                                                                                                                 |
| **Prerequisites**    | User logged in (any role).                                                                                                                                                                 |
| **Test Steps**       | 1. Login and go to **Profile** / **My Profile** page. 2. Change Full name or phone and click **Save**. 3. Check for success message; refresh page and verify updated values are displayed. |
| **Expected Result**  | Profile update success message displayed. Updated full_name, phone saved and displayed correctly.                                                                                          |
| **Actual Result**    | PUT returned 200; success message displayed. Refreshed profile showed updated full_name and phone. As expected.                                                                            |
| **Status**           | Pass                                                                                                                                                                                       |
| **Evidence**         | Screenshot: Profile page with updated full_name/phone + success message/alert visible.                                                                                                     |

---

## TC-011

| Field                | Detail                                                                                                                                                                                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-011                                                                                                                                                                                                                                                                    |
| **Test Description** | Verify diabetes prediction with valid input.                                                                                                                                                                                                                              |
| **Prerequisites**    | Patient logged in. Backend and ML models (diabetes_model.pkl) available.                                                                                                                                                                                                  |
| **Test Steps**       | 1. Login as **Patient** in browser. 2. Go to **Diabetes Prediction** / **Predict Diabetes** page. 3. Enter valid numeric values in all fields (pregnancies, glucose, blood_pressure, skin_thickness, insulin, bmi, diabetes_pedigree_function, age) and click **Submit**. |
| **Expected Result**  | Prediction result loads with risk_percentage, risk_level, recommendation, video recommendations. Success message displayed.                                                                                                                                               |
| **Actual Result**    | 200 OK. Response included prediction, risk_percentage, risk_level, recommendation, video_recommendations. Success message shown. As expected.                                                                                                                             |
| **Status**           | Pass                                                                                                                                                                                                                                                                      |
| **Evidence**         | Screenshot: Diabetes prediction result page showing risk_percentage, risk_level, recommendation, video_recommendations.                                                                                                                                                   |

---

## TC-012

| Field                | Detail                                                                                                                                                                                             |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-012                                                                                                                                                                                             |
| **Test Description** | Verify heart disease prediction with valid input.                                                                                                                                                  |
| **Prerequisites**    | Patient logged in. Heart model available.                                                                                                                                                          |
| **Test Steps**       | 1. Login as **Patient** in browser. 2. Go to **Heart Disease Prediction** page. 3. Fill all required fields (age, sex, chest_pain_type, resting_bp, serum_cholesterol, etc.) and click **Submit**. |
| **Expected Result**  | Prediction result loads with risk_percentage, risk_level, recommendation. Success message displayed.                                                                                               |
| **Actual Result**    | 200 OK. Response included prediction, risk_percentage, risk_level, recommendation. Success message shown. As expected.                                                                             |
| **Status**           | Pass                                                                                                                                                                                               |
| **Evidence**         | Screenshot: Heart disease prediction result page showing risk_percentage, risk_level, recommendation.                                                                                              |

---

## TC-013

| Field                | Detail                                                                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Test Case ID**     | TC-013                                                                                                                                                                                           |
| **Test Description** | Verify kidney disease prediction with valid input.                                                                                                                                               |
| **Prerequisites**    | Patient logged in. Kidney model available.                                                                                                                                                       |
| **Test Steps**       | 1. Login as **Patient** in browser. 2. Go to **Kidney Disease Prediction** page. 3. Fill all required fields (age, blood_pressure, specific_gravity, albumin, sugar, etc.) and click **Submit**. |
| **Expected Result**  | Prediction result loads with risk_percentage, risk_level, recommendation. Success message displayed.                                                                                             |
| **Actual Result**    | 200 OK. Response included prediction, risk_percentage, risk_level, recommendation. Success message shown. As expected.                                                                           |
| **Status**           | Pass                                                                                                                                                                                             |
| **Evidence**         | Screenshot: Kidney disease prediction result page showing risk_percentage, risk_level, recommendation.                                                                                           |

---

## TC-014

| Field                | Detail                                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-014                                                                                                                                              |
| **Test Description** | Verify diabetes prediction rejects when required field is missing.                                                                                  |
| **Prerequisites**    | Patient logged in.                                                                                                                                  |
| **Test Steps**       | 1. Login as **Patient** and go to **Diabetes Prediction** page. 2. Leave one required field (e.g. glucose) empty, fill others and click **Submit**. |
| **Expected Result**  | Validation error or "Please fill all required fields" message. Submit must not succeed.                                                             |
| **Actual Result**    | Validation error displayed; "Please fill all required fields" message shown. Submit blocked. As expected.                                           |
| **Status**           | Pass                                                                                                                                                |
| **Evidence**         | Screenshot: Diabetes form with empty glucose field + validation error message visible.                                                              |

---

## TC-015

| Field                | Detail                                                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-015                                                                                                                                               |
| **Test Description** | Verify diabetes prediction rejects invalid input (e.g. text in numeric field).                                                                       |
| **Prerequisites**    | Patient logged in.                                                                                                                                   |
| **Test Steps**       | 1. Login as **Patient** and go to **Diabetes Prediction** page. 2. Enter text instead of number in Glucose field (e.g. "high"). 3. Click **Submit**. |
| **Expected Result**  | UI validation error or "Please enter a valid number" message. Submit must not succeed.                                                               |
| **Actual Result**    | UI validation error displayed; text in numeric field rejected. Submit blocked. As expected.                                                          |
| **Status**           | Pass                                                                                                                                                 |
| **Evidence**         | Screenshot: Diabetes form with "high" in Glucose field + validation error message visible.                                                           |

---

## TC-016

| Field                | Detail                                                                                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-016                                                                                                                                                                                        |
| **Test Description** | Verify prediction is saved and appears in history.                                                                                                                                            |
| **Prerequisites**    | Patient has completed at least one prediction.                                                                                                                                                |
| **Test Steps**       | 1. Login as **Patient** and run a prediction (diabetes/heart/kidney). 2. Go to **My Predictions** / **Prediction History** from sidebar or menu. 3. Verify latest prediction appears in list. |
| **Expected Result**  | Prediction history page shows latest prediction with disease_type, risk_level, created_at.                                                                                                    |
| **Actual Result**    | Prediction history page displayed latest prediction with disease_type, risk_level, created_at. As expected.                                                                                   |
| **Status**           | Pass                                                                                                                                                                                          |
| **Evidence**         | Screenshot: My Predictions / Prediction History page showing list with disease_type, risk_level, created_at.                                                                                  |

---

## TC-017

| Field                | Detail                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Test Case ID**     | TC-017                                                                                                                                                                   |
| **Test Description** | Verify prediction history can be filtered by disease type.                                                                                                               |
| **Prerequisites**    | Patient has predictions (e.g. diabetes and heart).                                                                                                                       |
| **Test Steps**       | 1. Login as **Patient** and go to **My Predictions** page. 2. Select "Diabetes" from **Filter by disease** dropdown. 3. Verify only diabetes predictions appear in list. |
| **Expected Result**  | After filter, only that disease type predictions appear in list.                                                                                                         |
| **Actual Result**    | Filter by Diabetes applied; only diabetes predictions shown in list. As expected.                                                                                        |
| **Status**           | Pass                                                                                                                                                                     |
| **Evidence**         | Screenshot: My Predictions page with filter="Diabetes" dropdown selected + filtered list showing only diabetes predictions.                                              |

---

## TC-018

| Field                | Detail                                                                                                                                                                   |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Test Case ID**     | TC-018                                                                                                                                                                   |
| **Test Description** | Verify High/Critical risk prediction creates notification for patient.                                                                                                   |
| **Prerequisites**    | Patient logged in. Run a prediction that yields High or Critical risk.                                                                                                   |
| **Test Steps**       | 1. Login as **Patient** and run diabetes/heart/kidney prediction with extreme values to get **High** or **Critical** risk. 2. Go to **Alerts** / **Notifications** page. |
| **Expected Result**  | Alerts page shows high_risk type notification.                                                                                                                           |
| **Actual Result**    | High/Critical risk prediction created; Alerts page showed high_risk notification. As expected.                                                                           |
| **Status**           | Pass                                                                                                                                                                     |
| **Evidence**         | Screenshot: Alerts / Notifications page showing high_risk type notification for patient.                                                                                 |

---

## TC-019

| Field                | Detail                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Test Case ID**     | TC-019                                                                                                                                           |
| **Test Description** | Verify prediction succeeds with fallback recommendations when Gemini fails.                                                                      |
| **Prerequisites**    | Patient logged in. Gemini API key invalid or missing (in backend .env).                                                                          |
| **Test Steps**       | 1. Run backend without valid Gemini key. 2. Login as **Patient** and run valid diabetes prediction. 3. Verify recommendation is shown in result. |
| **Expected Result**  | Prediction succeeds with fallback recommendations. Page must not crash.                                                                          |
| **Actual Result**    | Prediction succeeded; fallback recommendations displayed when Gemini unavailable. No crash. As expected.                                         |
| **Status**           | Pass                                                                                                                                             |
| **Evidence**         | Screenshot: Prediction result page showing fallback recommendations (when Gemini key invalid/missing).                                           |

---

## TC-020

| Field                | Detail                                                                                                                                                                                                                |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-020                                                                                                                                                                                                                |
| **Test Description** | Verify extreme input values map to High or Critical risk.                                                                                                                                                             |
| **Prerequisites**    | Patient logged in.                                                                                                                                                                                                    |
| **Test Steps**       | 1. Login as **Patient** and go to **Diabetes Prediction** page. 2. Enter very high value in Glucose (e.g. 300), fill other fields correctly and click **Submit**. 3. Verify risk_level is High or Critical in result. |
| **Expected Result**  | Prediction result shows risk_level High or Critical (per threshold logic).                                                                                                                                            |
| **Actual Result**    | Extreme values (glucose 300) resulted in risk_level High or Critical. As expected.                                                                                                                                    |
| **Status**           | Pass                                                                                                                                                                                                                  |
| **Evidence**         | Screenshot: Prediction result page showing risk_level High or Critical with extreme input values.                                                                                                                     |

---

## TC-021

| Field                | Detail                                                                                                                                                      |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-021                                                                                                                                                      |
| **Test Description** | Verify doctor can list all patients.                                                                                                                        |
| **Prerequisites**    | Doctor logged in.                                                                                                                                           |
| **Test Steps**       | 1. Login as **Doctor** in browser. 2. Go to **View Patients** / **Patients** from sidebar. 3. Verify patient list loads with name, email and other details. |
| **Expected Result**  | Patient list page displays all patients with name, email.                                                                                                   |
| **Actual Result**    | Patient list loaded; all patients displayed with name, email and other details. As expected.                                                                |
| **Status**           | Pass                                                                                                                                                        |
| **Evidence**         | Screenshot: Doctor View Patients page showing list of patients with name, email.                                                                            |

---

## TC-022

| Field                | Detail                                                                                                                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Test Case ID**     | TC-022                                                                                                                                                                                                       |
| **Test Description** | Verify doctor can view a patient profile.                                                                                                                                                                    |
| **Prerequisites**    | Doctor logged in. At least one patient exists.                                                                                                                                                               |
| **Test Steps**       | 1. Login as **Doctor** and go to **View Patients** page. 2. Click **View Profile** or patient name on any patient row. 3. Verify patient profile page loads with medical_history, allergies, doctor_remarks. |
| **Expected Result**  | Patient profile page shows full_name, email, phone, medical_history, allergies, doctor_remarks.                                                                                                              |
| **Actual Result**    | Patient profile page loaded with full_name, email, phone, medical_history, allergies, doctor_remarks. As expected.                                                                                           |
| **Status**           | Pass                                                                                                                                                                                                         |
| **Evidence**         | Screenshot: Patient profile page showing full_name, email, phone, medical_history, allergies, doctor_remarks.                                                                                                |

---

## TC-023

| Field                | Detail                                                                                                                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-023                                                                                                                                                                                                    |
| **Test Description** | Verify doctor can add medical remark to patient.                                                                                                                                                          |
| **Prerequisites**    | Doctor logged in. At least one patient exists.                                                                                                                                                            |
| **Test Steps**       | 1. Login as **Doctor** and go to patient profile page (click on patient). 2. Enter remark in text box (e.g. "Follow-up in 2 weeks.") and click **Add Remark**. 3. Refresh page and verify remark appears. |
| **Expected Result**  | Success message displayed; new remark shown in doctor_remarks section.                                                                                                                                    |
| **Actual Result**    | Remark added successfully; success message shown. Refreshed page displayed new remark in doctor_remarks section. As expected.                                                                             |
| **Status**           | Pass                                                                                                                                                                                                      |
| **Evidence**         | Screenshot: Patient profile page with new remark in doctor_remarks section + success message.                                                                                                             |

---

## TC-024

| Field                | Detail                                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Test Case ID**     | TC-024                                                                                                                                                             |
| **Test Description** | Verify doctor can list all predictions.                                                                                                                            |
| **Prerequisites**    | Doctor logged in.                                                                                                                                                  |
| **Test Steps**       | 1. Login as **Doctor** in browser. 2. Go to **Reviews** / **Predictions** from sidebar (page showing all patients' predictions). 3. Verify predictions list loads. |
| **Expected Result**  | Predictions list of all patients displayed.                                                                                                                        |
| **Actual Result**    | Predictions page loaded; list of all patients' predictions displayed. As expected.                                                                                 |
| **Status**           | Pass                                                                                                                                                               |
| **Evidence**         | Screenshot: Doctor Reviews / Predictions page showing list of all patients' predictions.                                                                           |

---

## TC-025

| Field                | Detail                                                                                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Test Case ID**     | TC-025                                                                                                                                                                                           |
| **Test Description** | Verify doctor can add review to a prediction.                                                                                                                                                    |
| **Prerequisites**    | Doctor logged in. At least one prediction exists.                                                                                                                                                |
| **Test Steps**       | 1. Login as **Doctor** and go to **Reviews** page. 2. Select a prediction and enter text in comment box (e.g. "Please consult soon."). 3. Check **Send to patient** and click **Submit Review**. |
| **Expected Result**  | Success message displayed; doctor review added to prediction. Patient may receive notification.                                                                                                  |
| **Actual Result**    | Review submitted successfully; doctor_review added to prediction. Success message shown. As expected.                                                                                            |
| **Status**           | Pass                                                                                                                                                                                             |
| **Evidence**         | Screenshot: Doctor Reviews page showing prediction with doctor_review/comment added + success message.                                                                                           |

---

## TC-026

| Field                | Detail                                                                                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-026                                                                                                                                                                        |
| **Test Description** | Verify doctor can create a consultation.                                                                                                                                      |
| **Prerequisites**    | Doctor logged in. At least one patient exists.                                                                                                                                |
| **Test Steps**       | 1. Login as **Doctor** and go to **Consultations** page. 2. Click **Schedule Consultation** / **Add** button. 3. Select patient, enter date/time, notes and click **Create**. |
| **Expected Result**  | Success message displayed; new consultation appears in list.                                                                                                                  |
| **Actual Result**    | Consultation created successfully; 201 status. New consultation appeared in list. Success message shown. As expected.                                                         |
| **Status**           | Pass                                                                                                                                                                          |
| **Evidence**         | Screenshot: Consultations page showing new consultation in list + success message.                                                                                            |

---

## TC-027

| Field                | Detail                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-027                                                                                                              |
| **Test Description** | Verify doctor sees only own consultations.                                                                          |
| **Prerequisites**    | Doctor logged in.                                                                                                   |
| **Test Steps**       | 1. Login as **Doctor** and go to **Consultations** page. 2. Verify list shows only current doctor's consultations.  |
| **Expected Result**  | Consultations list shows only current doctor's consultations. Other doctor consultations must not be visible.       |
| **Actual Result**    | Consultations list showed only current doctor's consultations. Other doctor consultations not visible. As expected. |
| **Status**           | Pass                                                                                                                |
| **Evidence**         | Screenshot: Consultations page showing list (current doctor's consultations only; doctor name/ID visible).          |

---

## TC-028

| Field                | Detail                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-028                                                                                                                                                                                      |
| **Test Description** | Verify doctor can update consultation status.                                                                                                                                               |
| **Prerequisites**    | Doctor owns at least one consultation.                                                                                                                                                      |
| **Test Steps**       | 1. Login as **Doctor** and go to **Consultations** page. 2. Use status dropdown or **Mark as completed** on a consultation row to change status. 3. Refresh page and verify updated status. |
| **Expected Result**  | Success message displayed; consultation status updated and shown.                                                                                                                           |
| **Actual Result**    | Status updated to completed; success message displayed. Refreshed page showed updated status. As expected.                                                                                  |
| **Status**           | Pass                                                                                                                                                                                        |
| **Evidence**         | Screenshot: Consultations page with consultation status="completed" + success message.                                                                                                      |

---

## TC-029

| Field                | Detail                                                                                                                                                                                        |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-029                                                                                                                                                                                        |
| **Test Description** | Verify doctor cannot update another doctor’s consultation.                                                                                                                                    |
| **Prerequisites**    | Doctor A logged in. Consultation exists that belongs to Doctor B.                                                                                                                             |
| **Test Steps**       | 1. Login as **Doctor A** and go to **Consultations** page. Doctor B consultations must not appear in list. Alternate: try URL tampering to update other doctor's consultation; expect error.’ |
| **Expected Result**  | Doctor A cannot see Doctor B consultations. Attempt to update other doctor's consultation returns 403/404.                                                                                    |
| **Actual Result**    | Doctor A consultations list did not show Doctor B consultations. URL tampering for other doctor's consultation returned 403/404. As expected.                                                 |
| **Status**           | Pass                                                                                                                                                                                          |
| **Evidence**         | Screenshot: Doctor A Consultations page showing only own consultations; OR error 403/404 when accessing other doctor's consultation.                                                          |

---

## TC-030

| Field                | Detail                                                                                                                                               |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-030                                                                                                                                               |
| **Test Description** | Verify doctor receives high-risk patient alerts in notifications.                                                                                    |
| **Prerequisites**    | At least one high-risk prediction exists. Doctor logged in.                                                                                          |
| **Test Steps**       | 1. Login as **Doctor** in browser. 2. Go to **Alerts** / **Notifications** page. 3. Verify high-risk patient notifications are shown (if any exist). |
| **Expected Result**  | Alerts page shows high-risk patient notifications (if any high-risk predictions exist).                                                              |
| **Actual Result**    | Alerts page loaded; high-risk patient notifications displayed (where applicable). As expected.                                                       |
| **Status**           | Pass                                                                                                                                                 |
| **Evidence**         | Screenshot: Doctor Alerts page showing high-risk patient notifications.                                                                              |

---

## TC-031

| Field                | Detail                                                                                                                                                                                                                                                         |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-031                                                                                                                                                                                                                                                         |
| **Test Description** | Verify admin dashboard report summary.                                                                                                                                                                                                                         |
| **Prerequisites**    | Admin logged in.                                                                                                                                                                                                                                               |
| **Test Steps**       | 1. Login as **Admin** in browser. 2. Go to **Reports** / **Reports & Analytics** page (or Admin Dashboard). 3. Verify summary cards show total_patients, total_doctors, total_predictions, high_risk_predictions, predictions_by_disease, total_consultations. |
| **Expected Result**  | Report summary page displays total patients, doctors, predictions, high-risk predictions, consultations.                                                                                                                                                       |
| **Actual Result**    | Report summary page displayed total_patients, total_doctors, total_predictions, high_risk_predictions, total_consultations. As expected.                                                                                                                       |
| **Status**           | Pass                                                                                                                                                                                                                                                           |
| **Evidence**         | Screenshot: Admin Reports & Analytics page showing total_patients, total_doctors, total_predictions, high_risk_predictions, total_consultations.                                                                                                               |

---

## TC-032

| Field                | Detail                                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-032                                                                                                                                         |
| **Test Description** | Verify admin can list all patients.                                                                                                            |
| **Prerequisites**    | Admin logged in.                                                                                                                               |
| **Test Steps**       | 1. Login as **Admin** and go to **Patients** / **Manage Patients** page. 2. Verify all patients list loads with name, email and other details. |
| **Expected Result**  | Full patient list displayed.                                                                                                                   |
| **Actual Result**    | Full patient list loaded with name, email and other details. As expected.                                                                      |
| **Status**           | Pass                                                                                                                                           |
| **Evidence**         | Screenshot: Admin Manage Patients page showing full patient list with name, email.                                                             |

---

## TC-033

| Field                | Detail                                                                                                                                                                                                                                                                 |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-033                                                                                                                                                                                                                                                                 |
| **Test Description** | Verify admin can deactivate a user.                                                                                                                                                                                                                                    |
| **Prerequisites**    | Admin logged in. At least one active user (patient/doctor).                                                                                                                                                                                                            |
| **Test Steps**       | 1. Login as **Admin** and go to **Manage Patients** page. 2. Click **Deactivate** / toggle button on a patient row to deactivate user. 3. Verify success message. 4. Logout and try login with deactivated user credentials → expect "User account is inactive" error. |
| **Expected Result**  | User deactivated successfully. Deactivated user cannot login; inactive message displayed.                                                                                                                                                                              |
| **Actual Result**    | User deactivated; success message displayed. Deactivated user login returned 403 "User account is inactive". As expected.                                                                                                                                              |
| **Status**           | Pass                                                                                                                                                                                                                                                                   |
| **Evidence**         | Screenshot 1: Manage Patients page with Deactivate toggle + success message. Screenshot 2: Login page showing "User account is inactive" when deactivated user tries login.                                                                                            |

---

## TC-034

| Field                | Detail                                                                                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Test Case ID**     | TC-034                                                                                                                                                                                                             |
| **Test Description** | Verify admin can activate a user.                                                                                                                                                                                  |
| **Prerequisites**    | Admin logged in. At least one inactive user.                                                                                                                                                                       |
| **Test Steps**       | 1. Login as **Admin** and go to **Manage Patients** page. 2. Click **Activate** / toggle button on an inactive user row. 3. Verify success message. 4. Logout and login with that user credentials → must succeed. |
| **Expected Result**  | User activated successfully. That user can login again.                                                                                                                                                            |
| **Actual Result**    | User activated; success message displayed. That user logged in successfully after activation. As expected.                                                                                                         |
| **Status**           | Pass                                                                                                                                                                                                               |
| **Evidence**         | Screenshot 1: Manage Patients page with Activate toggle + success message. Screenshot 2: Login success / dashboard for re-activated user.                                                                          |

---

## TC-035

| Field                | Detail                                                                                                                                                                        |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-035                                                                                                                                                                        |
| **Test Description** | Verify admin can assign doctor to patient.                                                                                                                                    |
| **Prerequisites**    | Admin logged in. Patient and doctor exist.                                                                                                                                    |
| **Test Steps**       | 1. Login as **Admin** and go to **Manage Patients** page. 2. Select a doctor from **Assign Doctor** dropdown on a patient row. 3. Click Save / Apply. Verify success message. |
| **Expected Result**  | Doctor assigned successfully. Patient row shows assigned doctor name.                                                                                                         |
| **Actual Result**    | Doctor assigned to patient; success message displayed. Patient row showed assigned doctor name. As expected.                                                                  |
| **Status**           | Pass                                                                                                                                                                          |
| **Evidence**         | Screenshot: Manage Patients page with Assign Doctor dropdown + patient row showing assigned doctor name + success message.                                                    |

---

## TC-036

| Field                | Detail                                                                                                                                                                                                 |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Test Case ID**     | TC-036                                                                                                                                                                                                 |
| **Test Description** | Verify admin can unassign doctor from patient.                                                                                                                                                         |
| **Prerequisites**    | Admin logged in. Patient has assigned doctor.                                                                                                                                                          |
| **Test Steps**       | 1. Login as **Admin** and go to **Manage Patients** page. 2. On a patient with assigned doctor, click **Unassign** / **Remove doctor** or select "None" in doctor dropdown. 3. Verify success message. |
| **Expected Result**  | Doctor unassigned successfully. Patient has no assigned doctor.                                                                                                                                        |
| **Actual Result**    | Doctor unassigned; success message displayed. Patient row no longer showed assigned doctor. As expected.                                                                                               |
| **Status**           | Pass                                                                                                                                                                                                   |
| **Evidence**         | Screenshot: Manage Patients page with patient row showing no assigned doctor (None/blank) + success message.                                                                                           |

---

## TC-037

| Field                | Detail                                                                                                                                                                                                                                     |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Test Case ID**     | TC-037                                                                                                                                                                                                                                     |
| **Test Description** | Verify admin can create a doctor.                                                                                                                                                                                                          |
| **Prerequisites**    | Admin logged in. New doctor email not already registered.                                                                                                                                                                                  |
| **Test Steps**       | 1. Login as **Admin** and go to **Manage Doctors** page. 2. Click **Add Doctor** / **Create Doctor** button. 3. Fill full_name, email, phone, password and click **Submit**. 4. Verify success message; verify new doctor appears in list. |
| **Expected Result**  | Doctor created successfully. New doctor appears in list; that doctor can login.                                                                                                                                                            |
| **Actual Result**    | Doctor created; 201 status. New doctor appeared in list. That doctor logged in successfully. As expected.                                                                                                                                  |
| **Status**           | Pass                                                                                                                                                                                                                                       |
| **Evidence**         | Screenshot 1: Manage Doctors page with Add Doctor form + success message. Screenshot 2: Doctors list showing new doctor.                                                                                                                   |

---

## TC-038

| Field                | Detail                                                                                                                                                                                                |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-038                                                                                                                                                                                                |
| **Test Description** | Verify admin can delete a doctor.                                                                                                                                                                     |
| **Prerequisites**    | Admin logged in. At least one doctor exists.                                                                                                                                                          |
| **Test Steps**       | 1. Login as **Admin** and go to **Manage Doctors** page. 2. Click **Delete** button on a doctor row. 3. In confirm dialog click **Yes, delete**. 4. Verify success message; doctor removed from list. |
| **Expected Result**  | Doctor deleted successfully. Doctor removed from list (or deactivated).                                                                                                                               |
| **Actual Result**    | Doctor deleted/deactivated; success message displayed. Doctor removed from list. As expected.                                                                                                         |
| **Status**           | Pass                                                                                                                                                                                                  |
| **Evidence**         | Screenshot: Manage Doctors page after delete (doctor removed from list) + success message.                                                                                                            |

---

## TC-039

| Field                | Detail                                                                                                                                                                                                             |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Test Case ID**     | TC-039                                                                                                                                                                                                             |
| **Test Description** | Verify admin can get system settings.                                                                                                                                                                              |
| **Prerequisites**    | Admin logged in.                                                                                                                                                                                                   |
| **Test Steps**       | 1. Login as **Admin** and go to **System Settings** page. 2. Verify settings (systemName, maxFileSize, sessionTimeout, emailNotifications, smsNotifications, maintenanceMode, allowRegistration) load and display. |
| **Expected Result**  | Settings page displays system settings (defaults or saved values).                                                                                                                                                 |
| **Actual Result**    | Settings page loaded; systemName, maxFileSize, sessionTimeout, emailNotifications, etc. displayed. As expected.                                                                                                    |
| **Status**           | Pass                                                                                                                                                                                                               |
| **Evidence**         | Screenshot: System Settings page showing systemName, maxFileSize, sessionTimeout, emailNotifications, maintenanceMode, allowRegistration.                                                                          |

---

## TC-040

| Field                | Detail                                                                                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-040                                                                                                                                                                                                              |
| **Test Description** | Verify admin can save system settings.                                                                                                                                                                              |
| **Prerequisites**    | Admin logged in.                                                                                                                                                                                                    |
| **Test Steps**       | 1. Login as **Admin** and go to **System Settings** page. 2. Change a field (e.g. systemName or allowRegistration). 3. Click **Save**. 4. Verify success message; refresh page and verify updated values displayed. |
| **Expected Result**  | Settings saved successfully. Updated values saved and displayed correctly.                                                                                                                                          |
| **Actual Result**    | Settings saved; success message displayed. Refreshed page showed updated values. As expected.                                                                                                                       |
| **Status**           | Pass                                                                                                                                                                                                                |
| **Evidence**         | Screenshot: System Settings page with updated values + success message after Save.                                                                                                                                  |

---

## TC-041

| Field                | Detail                                                                                           |
| -------------------- | ------------------------------------------------------------------------------------------------ |
| **Test Case ID**     | TC-041                                                                                           |
| **Test Description** | Verify login form rejects when required field is empty.                                          |
| **Prerequisites**    | Frontend and backend running.                                                                    |
| **Test Steps**       | 1. Go to Login page. 2. Leave email or password field empty. 3. Click **Login** or **Sign In**.  |
| **Expected Result**  | Validation error or "Please fill all required fields" message. Login must not succeed.           |
| **Actual Result**    | Validation error displayed; empty email or password field rejected. Submit blocked. As expected. |
| **Status**           | Pass                                                                                             |
| **Evidence**         | Screenshot: Login form with empty field + validation error message visible.                      |

---

## TC-042

| Field                | Detail                                                                                                                                              |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-042                                                                                                                                              |
| **Test Description** | Verify register/sign-up form rejects when required field is empty.                                                                                  |
| **Prerequisites**    | Frontend and backend running.                                                                                                                       |
| **Test Steps**       | 1. Go to Register / Sign Up page. 2. Leave one required field (e.g. full name, email, password) empty. 3. Click **Register** or **Create Account**. |
| **Expected Result**  | Validation error or "Please fill all required fields" message. Registration must not succeed.                                                       |
| **Actual Result**    | Validation error displayed; empty required field rejected. Submit blocked. As expected.                                                             |
| **Status**           | Pass                                                                                                                                                |
| **Evidence**         | Screenshot: Register form with empty required field + validation error message visible.                                                             |

---

## TC-043

| Field                | Detail                                                                                                                  |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-043                                                                                                                  |
| **Test Description** | Verify login rejects invalid email or wrong password.                                                                   |
| **Prerequisites**    | Frontend and backend running. No account with given credentials (or wrong password).                                    |
| **Test Steps**       | 1. Go to Login page. 2. Enter invalid email (e.g. not registered) or wrong password. 3. Click **Login** or **Sign In**. |
| **Expected Result**  | Error message e.g. "Incorrect email or password" or "Invalid credentials". Login must not succeed.                      |
| **Actual Result**    | "Incorrect email or password" error displayed. Login rejected. As expected.                                             |
| **Status**           | Pass                                                                                                                    |
| **Evidence**         | Screenshot: Login form with error message after wrong email/password.                                                   |

---

## TC-044

| Field                | Detail                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-044                                                                                                                             |
| **Test Description** | Verify forgot password flow.                                                                                                       |
| **Prerequisites**    | Frontend and backend running. Email service configured (or OTP stored for test).                                                   |
| **Test Steps**       | 1. Go to Login page. 2. Click **Forgot Password** link. 3. Enter valid registered email. 4. Submit and check for OTP/instructions. |
| **Expected Result**  | Success message (e.g. OTP sent to email) or instructions displayed. User can proceed to reset password.                            |
| **Actual Result**    | Forgot password submitted; success message or OTP input page displayed. User can proceed to reset. As expected.                    |
| **Status**           | Pass                                                                                                                               |
| **Evidence**         | Screenshot: Forgot password page with success message or OTP input.                                                                |

---

## TC-045

| Field                | Detail                                                                                                                                                                                                               |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-045                                                                                                                                                                                                               |
| **Test Description** | Verify doctor can view Leave page and load leave entries.                                                                                                                                                            |
| **Prerequisites**    | Doctor logged in.                                                                                                                                                                                                    |
| **Test Steps**       | 1. Login as **Doctor** in browser. 2. Go to **Leave** from sidebar. 3. Verify page loads without "Failed to load leaves" error. 4. Check that "Your leave entries" section displays (empty or with existing leaves). |
| **Expected Result**  | Leave page loads successfully. Leave entries section displays; no "Failed to load leaves" error.                                                                                                                     |
| **Actual Result**    | Leave page loaded successfully; "Your leave entries" section displayed. No "Failed to load leaves" error. List showed existing leaves or empty state. As expected.                                                   |
| **Status**           | Pass                                                                                                                                                                                                                 |
| **Evidence**         | Screenshot: Leave page loaded; leave entries section visible (empty or with rows).                                                                                                                                   |

---

## TC-046

| Field                | Detail                                                                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-046                                                                                                                                                    |
| **Test Description** | Verify doctor can add leave.                                                                                                                              |
| **Prerequisites**    | Doctor logged in.                                                                                                                                         |
| **Test Steps**       | 1. Login as **Doctor** and go to **Leave** page. 2. Click **Add Leave**. 3. Enter From date, To date (To ≥ From), optional Reason. 4. Click **Add**.      |
| **Expected Result**  | Success message displayed. New leave entry appears in "Your leave entries" table.                                                                         |
| **Actual Result**    | Leave added successfully; success message displayed. New leave entry appeared in "Your leave entries" table with from_date, to_date, reason. As expected. |
| **Status**           | Pass                                                                                                                                                      |
| **Evidence**         | Screenshot: Add Leave form + success message + new leave in table.                                                                                        |

---

## TC-047

| Field                | Detail                                                                                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-047                                                                                                                                                                             |
| **Test Description** | Verify doctor can delete own leave.                                                                                                                                                |
| **Prerequisites**    | Doctor logged in. At least one leave entry exists.                                                                                                                                 |
| **Test Steps**       | 1. Login as **Doctor** and go to **Leave** page. 2. Click **Remove** on an existing leave entry. 3. Confirm in browser dialog. 4. Verify success message; leave removed from list. |
| **Expected Result**  | Success message displayed. Leave entry removed from table.                                                                                                                         |
| **Actual Result**    | Leave removed successfully; success message displayed. Deleted leave entry no longer visible in table. As expected.                                                                |
| **Status**           | Pass                                                                                                                                                                               |
| **Evidence**         | Screenshot: Leave page after remove; success message; entry no longer in table.                                                                                                    |

---

## TC-048

| Field                | Detail                                                                                                                                                                                                                                      |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-048                                                                                                                                                                                                                                      |
| **Test Description** | Verify admin can view Audit Log.                                                                                                                                                                                                            |
| **Prerequisites**    | Admin logged in.                                                                                                                                                                                                                            |
| **Test Steps**       | 1. Login as **Admin** in browser. 2. Go to **Audit Log** from sidebar. 3. Verify page loads. 4. Check that Audit Log section displays (entries if any doctor/admin viewed patient profile or records; else "No audit entries yet" message). |
| **Expected Result**  | Audit Log page loads successfully. Recent activity / audit entries displayed, or message "No audit entries yet. Activity will appear when doctors or admins view patient profiles or records."                                              |
| **Actual Result**    | Audit Log page loaded successfully; entries or empty-state message displayed. As expected.                                                                                                                                                  |
| **Status**           | Pass                                                                                                                                                                                                                                        |
| **Evidence**         | Screenshot: Audit Log page showing entries or "No audit entries yet" message.                                                                                                                                                               |

---

## TC-049

| Field                | Detail                                                                                                                                                                                                                                                                                         |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-049                                                                                                                                                                                                                                                                                         |
| **Test Description** | Verify chatbot responds correctly to medical-related questions.                                                                                                                                                                                                                                |
| **Prerequisites**    | User on a page with chatbot. Chatbot is available (Patient dashboard or relevant page).                                                                                                                                                                                                        |
| **Test Steps**       | 1. Open chatbot / AI assistant. 2. Ask a medical-related question (e.g. diabetes symptoms, heart disease risk factors, diet for kidney health). 3. Verify chatbot gives a relevant, correct response.                                                                                          |
| **Expected Result**  | Chatbot returns a correct, relevant medical response appropriate to the question asked.                                                                                                                                                                                                        |
| **Actual Result**    | Asked "diabetes symptoms"; chatbot responded with common symptoms (increased thirst, frequent urination, weight loss, fatigue, blurred vision, slow-healing sores, frequent infections) and advised consulting a doctor for proper evaluation. Response was relevant and correct. As expected. |
| **Status**           | Pass                                                                                                                                                                                                                                                                                           |
| **Evidence**         | Screenshot: Chatbot with medical question and correct response.                                                                                                                                                                                                                                |

---

## TC-050

| Field                | Detail                                                                                                                                                                                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-050                                                                                                                                                                                                                                                  |
| **Test Description** | Verify chatbot identifies itself as medical assistant for out-of-scope (non-medical) questions.                                                                                                                                                         |
| **Prerequisites**    | User on a page with chatbot.                                                                                                                                                                                                                            |
| **Test Steps**       | 1. Open chatbot / AI assistant. 2. Ask a non-medical / out-of-content question (e.g. weather, sports, general knowledge). 3. Verify chatbot responds that it is a medical assistant and scope is limited to medical queries.                            |
| **Expected Result**  | Chatbot replies that it is a medical assistant; out-of-scope questions get a polite redirect to medical topics.                                                                                                                                         |
| **Actual Result**    | Asked "weather"; chatbot responded "I am a medical assistant and can help with disease-related and medical questions. However, I cannot provide information about the weather." Correctly identified scope and declined non-medical query. As expected. |
| **Status**           | Pass                                                                                                                                                                                                                                                    |
| **Evidence**         | Screenshot: Chatbot with out-of-scope question and medical assistant identity response.                                                                                                                                                                 |

---

## TC-051

| Field                | Detail                                                                                                                                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-051                                                                                                                                                                                                    |
| **Test Description** | Verify homepage / landing page language selector changes entire page to selected language.                                                                                                                |
| **Prerequisites**    | User on homepage (localhost:3000) before login.                                                                                                                                                           |
| **Test Steps**       | 1. Open homepage. 2. Click language selector in top-right. 3. Select a language (e.g. தமிழ், Français, हिन्दी). 4. Verify entire page (title, subtitle, buttons, nav links) changes to selected language. |
| **Expected Result**  | All visible text on the homepage updates to the selected language.                                                                                                                                        |
| **Actual Result**    | Selected language (e.g. Tamil/Hindi); entire homepage (title, nav links, buttons) updated to that language. As expected.                                                                                  |
| **Status**           | Pass                                                                                                                                                                                                      |
| **Evidence**         | Screenshot: Homepage in selected language (e.g. Tamil or Hindi).                                                                                                                                          |

---

## TC-052

| Field                | Detail                                                                                                                                                                                                   |
| -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-052                                                                                                                                                                                                   |
| **Test Description** | Verify patient system language selector changes patient dashboard / UI to selected language.                                                                                                             |
| **Prerequisites**    | Patient logged in. Patient dashboard / system has language selector.                                                                                                                                     |
| **Test Steps**       | 1. Login as **Patient**. 2. Go to patient dashboard or page with language selector. 3. Select a language (e.g. தமிழ், සිංහල, Español). 4. Verify labels, nav items, buttons update to selected language. |
| **Expected Result**  | Patient UI (sidebar, labels, buttons, page text) changes to the selected language.                                                                                                                       |
| **Actual Result**    | Language selector changed; patient dashboard (sidebar, labels, buttons) updated to selected language. As expected.                                                                                       |
| **Status**           | Pass                                                                                                                                                                                                     |
| **Evidence**         | Screenshot: Patient dashboard in selected language.                                                                                                                                                      |

---

## TC-053

| Field                | Detail                                                                                                                                                                                                                                                                                                                                |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-053                                                                                                                                                                                                                                                                                                                                |
| **Test Description** | Verify backend runs successfully and MongoDB connects.                                                                                                                                                                                                                                                                                |
| **Prerequisites**    | Python environment set up. MongoDB running. Dependencies installed.                                                                                                                                                                                                                                                                   |
| **Test Steps**       | 1. Open terminal in backend folder. 2. Run backend command (e.g. `uvicorn app.main:app` or `python -m uvicorn app.main:app`). 3. Verify terminal shows "Application startup complete" or similar. 4. Verify MongoDB connected message. 5. Verify MongoDB collections are listed/accessible (users, predictions, consultations, etc.). |
| **Expected Result**  | Backend starts successfully; MongoDB connection confirmed; collections available.                                                                                                                                                                                                                                                     |
| **Actual Result**    | Uvicorn running on http://127.0.0.1:8080. Connected to MongoDB healthcare_db; collections: patient_records, otps, predictions, users, doctor_leaves, consultations, audit_logs, notifications. As expected. |
| **Status**           | Pass                                                                                                                                                                                                                                                                                                                               |
| **Evidence**         | Screenshot: Terminal showing backend running, MongoDB connected, collections listed.                                                                                                                                                                                                                                                  |

---

## TC-054

| Field                | Detail                                                                                                                                                              |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Test Case ID**     | TC-054                                                                                                                                                              |
| **Test Description** | Verify frontend runs successfully with npm run dev.                                                                                                                 |
| **Prerequisites**    | Node.js installed. Dependencies installed (`npm install`).                                                                                                          |
| **Test Steps**       | 1. Open terminal in frontend folder. 2. Run `npm run dev`. 3. Verify terminal shows compilation success and dev server started (e.g. "Ready in", "localhost:3000"). |
| **Expected Result**  | Frontend dev server starts; terminal shows ready/compiled; app available at localhost:3000.                                                                         |
| **Actual Result**    | Ready in 4.9s displayed. Compiled successfully; GET / returned 200. App available at localhost:3000. As expected. |
| **Status**           | Pass                                                                                                                                                             |
| **Evidence**         | Screenshot: Terminal showing npm run dev output with server ready at localhost:3000.                                                                                |

---

_Frontend: http://localhost:3000 | Backend: http://localhost:8000 or 8080. Fill **Actual Result** and **Status** after running each test._
