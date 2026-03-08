# TC-007 – Test Case (உங்க System-க்கு) + எப்படி Test பண்ணுவது

---

## Test Case Table (உங்க System-க்கு மாற்றி வைத்தது)

| Field | Detail |
|-------|--------|
| **Test Case ID** | TC-007 |
| **Test Description** | Verify that a patient cannot access an admin-only endpoint. |
| **Prerequisites** | Backend server is running (e.g. http://localhost:8000 or http://localhost:8080). A **patient** user account exists and is active. |
| **Test Steps** | 1. Log in as a **patient** user (via Postman: POST /api/v1/auth/login with patient email and password). Copy the **access_token** from the response. 2. In Postman, send a GET request to an admin-only endpoint: **GET http://localhost:8080/api/v1/admin/reports/summary** (or use port 8000 if that is your backend port). 3. In the **Headers** tab, add: **Authorization** = **Bearer \<paste patient access_token here\>**. 4. Click **Send**. |
| **Expected Result** | The request is rejected (e.g. **401 Unauthorized** or **403 Forbidden**). The patient must not access admin data. |
| **Actual Result** | *(Test run பிறகு இங்கே எழுதுங்க: e.g. "Request rejected with **401 Unauthorized**. Response detail: 'Not authenticated' or 'Could not validate credentials'. Patient could not access admin endpoint. As expected.")* |
| **Status** | *(Pass / Fail)* |

---

## Test Case – Tamil (தமிழ்) – விவரம் மட்டும் தமிழில்

*(Report-ல வைக்க **test case table ஆங்கிலத்திலே** இருக்கணும். கீழே உள்ளது அதே test case-ன் தமிழ் விவரம் – புரிந்துகொள்ள அல்லது தமிழ் section-க்கு பயன்படுத்தலாம்.)*

| Field | Detail (தமிழ்) |
|-------|------------------|
| **Test Case ID** | TC-007 |
| **Test Description** | நோயாளி (patient) நிர்வாகி மட்டுமே பயன்படுத்தும் endpoint-ஐ அணுக முடியாது என்பதை சரிபார்க்க. |
| **Prerequisites** | Backend server இயங்கிக்கொண்டிருக்கும் (http://localhost:8000 அல்லது 8080). **நோயாளி** கணக்கு ஒன்று உள்ளது மற்றும் active. |
| **Test Steps** | 1. **நோயாளி** உள்நுழைவு செய்து JWT token வாங்குங்க (Postman: POST /api/v1/auth/login – patient email, password). Response-ல **access_token** copy பண்ணுங்க. 2. Admin endpoint-க்கு GET அனுப்புங்க: **GET** /api/v1/admin/reports/summary. 3. **Headers**-ல **Authorization** = **Bearer \<patient token\>** போடுங்க. 4. **Send** அழுத்துங்க. |
| **Expected Result** | Request நிராகரிக்கப்படும் (401 Unauthorized அல்லது 403 Forbidden). நோயாளி admin தரவைப் பார்க்கக் கூடாது. |
| **Actual Result** | *(சோதனை பிறகு:* நோயாளி token வைத்து admin endpoint அழைத்தபோது **401 Unauthorized** கிடைத்தது. எதிர்பார்த்ததுபோல்.) |
| **Status** | Pass / Fail |

---

## உங்க System-ல எப்படி Test பண்ணுவது (Step-by-step)

### Step 1: Patient Login பண்ணி JWT Token வாங்குங்க (Postman-ல)

1. Postman-ல **புதிய request** create பண்ணுங்க.
2. **Method:** **POST**
3. **URL:** `http://localhost:8080/api/v1/auth/login`  
   (உங்க backend **8000**-ல run பண்ணினா: `http://localhost:8000/api/v1/auth/login`)
4. **Body** tab:
   - **x-www-form-urlencoded** select பண்ணுங்க.
   - Key-Value இப்படி போடுங்க:
     - **username** = patient-ன் **email** (e.g. `patient@example.com`)
     - **password** = patient-ன் **password**
5. **Send** அழுத்துங்க.
6. Response-ல **200** வந்தா, **Body**-ல இருந்து **access_token** copy பண்ணுங்க.  
   (e.g. `"access_token": "eyJhbGciOiJIUzI1NiIs...` – முழு value-உம் copy பண்ணுங்க.)

---

### Step 2: Admin Endpoint-க்கு Patient Token வைத்து Request அனுப்புங்க

1. Postman-ல **புதிய request** (அல்லது மற்ற tab) create பண்ணுங்க.
2. **Method:** **GET**
3. **URL:** `http://localhost:8080/api/v1/admin/reports/summary`  
   (backend 8000-ல இருந்தால்: `http://localhost:8000/api/v1/admin/reports/summary`)
4. **Headers** tab:
   - Key: **Authorization**  
   - Value: **Bearer \<paste_here\>**  
     (இங்கே Step 1-ல copy பண்ணின **access_token**-ஐ paste பண்ணுங்க. Space between "Bearer" and token இருக்கணும்.)
5. **Send** அழுத்துங்க.

---

### Step 3: Response பாருங்க

- **Status:** **401 Unauthorized** அல்லது **403 Forbidden** வரலாம்.  
  *(உங்க system-ல பெரும்பாலும் **401 Unauthorized** தான் வரும்.)*
- **Body:** உதாரணம்: `{"detail":"Not authenticated"}` அல்லது `{"detail":"Could not validate credentials"}` (401) அல்லது "Forbidden" (403).

இது வந்தால் **Test Pass** – நோயாளி admin endpoint-ஐ அணுக முடியவில்லை. Actual Result மற்றும் Status table-ல fill பண்ணுங்க.

---

## Optional – மற்ற Admin Endpoints (இதே Test-க்கு)

இதே patient token வைத்து இவற்றையும் try பண்ணலாம்; எல்லாமே **403** தான் வரணும்:

- `GET http://localhost:8080/api/v1/admin/doctors`
- `GET http://localhost:8080/api/v1/admin/settings`
- `GET http://localhost:8080/api/v1/admin/audit-logs`

---

## Report-ல Actual Result & Status (Pass ஆனா)

*(உங்க system-ல **401 Unauthorized** வந்தால் இதைப் பயன்படுத்துங்க.)*

| Field | Detail |
|-------|--------|
| **Actual Result** | Sent GET request to /api/v1/admin/reports/summary with patient JWT in Authorization header. Received **401 Unauthorized**. Response detail: "Not authenticated" (or "Could not validate credentials"). Patient was correctly denied access to admin-only endpoint. Test passed. |
| **Status** | **Pass** |

---

## சுருக்கம்

1. Patient-ஆ login பண்ணி **access_token** வாங்கு (Postman: POST /api/v1/auth/login).
2. **GET** /api/v1/admin/reports/summary அனுப்பு; **Header:** `Authorization: Bearer <patient_token>`.
3. **401 Unauthorized** (அல்லது 403) வருது பாரு → Actual Result + Status (Pass) போடு.
