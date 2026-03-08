# Test Case Screenshot Guide – Order and Sections

**Use this guide** when taking screenshots for **Test Case Specifications** or report **Section 7.0 Testing and Validation**. Follow the order below: section by section, then TC order. Each row says **which screen** to open, **what to do**, and **what to capture**.

---

## How to Use

- **Order:** Do sections **7.1 → 7.2 → 7.3 → 7.4 → 7.5** in this order.
- Within each section, do **TC01, TC02, …** in number order.
- For each TC, take **1–3 screenshots** as given in the table (Before / Action / Result).
- Save files as: `TC01_1_RegisterForm.png`, `TC01_2_AfterSubmit.png`, etc., or as per your report naming.

---

## Section 7.1 – Authentication and Authorization (TC01 – TC10)

| Order | TC-ID | Screen / Page to Open | What to Do | What Screenshot to Take |
|-------|-------|------------------------|------------|--------------------------|
| 1 | TC01 | Login page → click **Register** | Show full registration form (empty) | **Screenshot 1:** Register form with all fields visible (Full Name, Email, Phone, Address, Role, Password) |
| 2 | TC01 | Same form | Fill valid data (name, email, phone, address, password); do NOT submit yet | **Screenshot 2:** Form filled with valid data |
| 3 | TC01 | Same form | Click **Create Account** | **Screenshot 3:** Success message or redirect to Login / Dashboard |
| 4 | TC02 | Register (if UI allows Doctor) or Admin creates doctor | Register as Doctor or use Admin → Doctors → Create | **Screenshot:** Doctor account creation or message (as per your system – patients only register in UI) |
| 5 | TC03 | Register form | Enter **same email** as existing user; Submit | **Screenshot:** Error message "Email already registered" (400) |
| 6 | TC04 | Login page | Enter **correct** email and password; Submit | **Screenshot 1:** Login form filled (optional). **Screenshot 2:** Redirected dashboard (Patient/Doctor/Admin) |
| 7 | TC05 | Login page | Enter correct email, **wrong password**; Submit | **Screenshot:** Error message (401 / invalid credentials) |
| 8 | TC06 | Postman or browser dev tools | GET `/api/v1/auth/me` or `/users/profile` **without** Authorization header | **Screenshot:** Response 401 Unauthorized (Postman/network response) |
| 9 | TC07 | Logged in as **Patient** | Open Admin page (e.g. /admin/doctors or /admin/reports) or call admin API with Patient token | **Screenshot:** 403 Forbidden or "Access denied" / redirect to login |
| 10 | TC08 | Logged in as **Doctor** | Try admin action (e.g. create doctor, patch user) or open admin-only page | **Screenshot:** 403 Forbidden or access denied message |
| 11 | TC09 | Logged in as any user | Open Profile page or call GET /users/profile (with token) | **Screenshot:** Profile page / response showing user data (no password) |
| 12 | TC10 | Profile page | Edit name/phone (and address if shown); Save. Then reopen profile | **Screenshot 1:** Profile form after edit. **Screenshot 2:** Profile after save showing updated values |

---

## Section 7.2 – Patient – Predictions and History (TC11 – TC20)

| Order | TC-ID | Screen / Page to Open | What to Do | What Screenshot to Take |
|-------|-------|------------------------|------------|--------------------------|
| 13 | TC11 | Patient dashboard → **Predict Diabetes** (or /patient/predict/diabetes) | Fill valid diabetes form; Submit | **Screenshot 1:** Form filled. **Screenshot 2:** Result (prediction, risk %, risk level, recommendation, videos) |
| 14 | TC12 | Patient → **Predict Heart Disease** | Fill valid heart disease form; Submit | **Screenshot:** Result screen with prediction and risk |
| 15 | TC13 | Patient → **Predict Kidney Disease** | Fill valid kidney form; Submit | **Screenshot:** Result screen with prediction and risk |
| 16 | TC14 | Patient → Diabetes prediction | Submit with **one required field missing** (e.g. leave Glucose empty) | **Screenshot:** Validation error (422 or frontend error message) |
| 17 | TC15 | Patient → Diabetes (or use Postman) | Send invalid type (e.g. glucose: "high" or text in numeric field) | **Screenshot:** 422 / validation error message |
| 18 | TC16 | Patient → **Predictions / History** | Open history after doing a prediction | **Screenshot:** History list showing latest prediction (disease, date, risk level) |
| 19 | TC17 | Patient → Predictions / History | Use **filter by disease** (e.g. Diabetes only) | **Screenshot:** Filtered list showing only selected disease type |
| 20 | TC18 | Patient → Do a prediction that gives **High/Critical** risk | Then open **Alerts / Notifications** | **Screenshot:** Notifications list with high-risk alert for patient |
| 21 | TC19 | (Backend/API or mock) | Trigger prediction when Gemini fails or timeout | **Screenshot:** Result still 200 with fallback recommendation (no crash) |
| 22 | TC20 | Patient → Any prediction | Submit with **extreme values** (e.g. very high glucose) | **Screenshot:** Result showing High or Critical risk level |

---

## Section 7.3 – Doctor – Patients, Reviews, Consultations (TC21 – TC30)

| Order | TC-ID | Screen / Page to Open | What to Do | What Screenshot to Take |
|-------|-------|------------------------|------------|--------------------------|
| 23 | TC21 | **Doctor** login → **Patients** list | Open /doctor/patients | **Screenshot:** Patients list (id, name, email, etc.) |
| 24 | TC22 | Doctor → Patients → click one patient | Open patient profile (View Profile) | **Screenshot:** Patient profile (medical history, allergies, doctor remarks) |
| 25 | TC23 | Same patient profile | Add a **medical remark**; Submit | **Screenshot 1:** Remark form/field. **Screenshot 2:** Profile after save showing new remark |
| 26 | TC24 | Doctor → **Reviews** or Predictions (all) | Open /doctor/reviews or list all predictions | **Screenshot:** List of all predictions (with filters if any) |
| 27 | TC25 | Doctor → Reviews | Select a prediction; add **review comment**; optionally notify patient; Submit | **Screenshot:** Review saved (success message or updated row with doctor_review) |
| 28 | TC26 | Doctor → **Consultations** | Click create/schedule; fill patient, date, notes; Submit | **Screenshot:** New consultation created (list or success message) |
| 29 | TC27 | Doctor → Consultations | Open consultations list | **Screenshot:** List showing only current doctor’s consultations |
| 30 | TC28 | Doctor → Consultations | Open one consultation; change **status** to Completed or Cancelled; Save | **Screenshot:** Updated status in list or detail view |
| 31 | TC29 | Doctor A logged in | Try to update a consultation that belongs to **Doctor B** (if you have data) | **Screenshot:** 403 or 404 response / error message |
| 32 | TC30 | Doctor → **Alerts / Notifications** | Open notifications | **Screenshot:** Notifications list with high-risk patient alerts |

---

## Section 7.4 – Admin – User and System Management (TC31 – TC42)

| Order | TC-ID | Screen / Page to Open | What to Do | What Screenshot to Take |
|-------|-------|------------------------|------------|--------------------------|
| 33 | TC31 | **Admin** login → **Dashboard / Reports** | Open /admin/dashboard or /admin/reports | **Screenshot:** Report summary (total patients, doctors, predictions, high risk, by disease) |
| 34 | TC32 | Admin → **Patients** | Open /admin/patients | **Screenshot:** Full patient list |
| 35 | TC33 | Admin → Patients | **Deactivate** a user (toggle or action) | **Screenshot:** Status changed to inactive / success message |
| 36 | TC34 | Admin → Patients | **Activate** the same (or another) user | **Screenshot:** Status active / success message |
| 37 | TC35 | Admin → Patients | Select a patient; **Assign doctor** (dropdown + Save) | **Screenshot:** Assigned doctor shown for that patient |
| 38 | TC36 | Admin → Patients | Select patient with assigned doctor; **Unassign** | **Screenshot:** Assigned doctor cleared |
| 39 | TC37 | Admin → **Doctors** | Click Create doctor; fill name, email, password; Submit | **Screenshot:** New doctor in list or success message |
| 40 | TC38 | Admin → Doctors | **Delete** (or deactivate) a doctor | **Screenshot:** Doctor removed from list or deactivated message |
| 41 | TC39 | Admin → **Settings** | Open /admin/settings | **Screenshot:** Settings form (systemName, maxFileSize, sessionTimeout, etc.) |
| 42 | TC40 | Admin → Settings | Change one or more values; **Save** | **Screenshot:** Success message or updated settings display |
| 43 | TC41 | Admin → **ML Models** | Open /admin/models | **Screenshot:** List of model files (e.g. diabetes_model.pkl, threshold.json) |
| 44 | TC42 | Admin → **Consultations** (if page exists) or API | View all consultations | **Screenshot:** List of all consultations in system |

---

## Section 7.5 – Notifications, Chatbot, Edge Cases (TC43 – TC50)

| Order | TC-ID | Screen / Page to Open | What to Do | What Screenshot to Take |
|-------|-------|------------------------|------------|--------------------------|
| 45 | TC43 | **Patient** login → **Alerts / Notifications** | Open /patient/alerts | **Screenshot:** Notifications list (only current user’s) |
| 46 | TC44 | Patient/Doctor → Notifications | Click **Mark as read** on one notification | **Screenshot:** Notification marked read (visual or list update) |
| 47 | TC45 | Patient/User → **Chatbot** | Send a **valid message** | **Screenshot:** Chat screen with user message and AI reply |
| 48 | TC46 | Chatbot | Send **empty** or too-short message | **Screenshot:** 400/422 or "Message cannot be empty" error |
| 49 | TC47 | Doctor/Admin or Patient records page | **Store** patient record (if UI exists); then **GET** patient records | **Screenshot:** Stored record and list/detail showing correct patient_id |
| 50 | TC48 | (Optional: rename/move model file) | Trigger prediction when model file missing | **Screenshot:** 503/500 with clear error message (no crash) |
| 51 | TC49 | Login page | Login with user who is **deactivated** (is_active: false) | **Screenshot:** 401 Unauthorized / cannot login message |
| 52 | TC50 | **Patient** login → **Consultations** | Open /patient/consultations | **Screenshot:** List showing only that patient’s consultations |

---

## Summary – Section to Screenshot Mapping

| Report Section | TCs | Main Screens / Pages for Screenshots |
|----------------|-----|--------------------------------------|
| **7.1** Authentication and Authorization | TC01–TC10 | Register form, Login form, Dashboard, Profile, Postman/API (401/403), Profile edit |
| **7.2** Patient – Predictions and History | TC11–TC20 | Diabetes/Heart/Kidney predict forms, Result screens, History, Filter, Notifications, Validation errors |
| **7.3** Doctor – Patients, Reviews, Consultations | TC21–TC30 | Doctor Patients list, Patient profile, Remarks, Reviews list, Consultations list/create/update, Doctor Alerts |
| **7.4** Admin – User and System Management | TC31–TC42 | Admin Dashboard/Reports, Patients list, Activate/Deactivate, Assign/Unassign doctor, Doctors CRUD, Settings, ML Models, Consultations |
| **7.5** Notifications, Chatbot, Edge | TC43–TC50 | Notifications list, Mark read, Chatbot chat, Patient Records, Login (inactive user), Patient Consultations list |

---

## Quick Checklist (Order)

1. **7.1** – TC01 (Register 3 shots) → TC02 → TC03 → … → TC10  
2. **7.2** – TC11 (Diabetes) → TC12 (Heart) → TC13 (Kidney) → TC14–TC20  
3. **7.3** – TC21 (Patients list) → TC22 (Profile) → TC23 (Remark) → TC24–TC30  
4. **7.4** – TC31 (Reports) → TC32 (Patients) → TC33–TC42  
5. **7.5** – TC43 (Notifications) → TC44–TC50  

Use this order when taking screenshots for **docs/Test_Case_Specifications.pdf** or for the report’s **Section 7.0 Testing and Validation**. Each section in the report can use the screenshots listed for that section in the tables above.
