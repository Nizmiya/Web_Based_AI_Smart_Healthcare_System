# TC-033 – Test Case Table (உங்க System-க்கு)

**Testing:** **Postman (API) only** – no frontend testing.

**System:** Web-based AI-Powered Smart Healthcare System  
**Backend:** FastAPI; **Admin API:** PATCH `/api/v1/admin/users/{user_id}` with body `{"is_active": false}`  
**Login check:** Deactivated user login (POST /auth/login) returns **403** with detail "User account is inactive".

---

## Test Case Table (English) – Report-ல போட

| Field | Detail |
|-------|--------|
| **Test Case ID** | TC-033 |
| **Test Description** | Verify that an admin can deactivate a user (patient or doctor). The deactivated user must not be able to log in. |
| **Prerequisites** | Backend server running (e.g. http://localhost:8000 or 8080). MongoDB running. An **admin** user account exists and is logged in (or admin JWT available). At least one **patient** or **doctor** user exists and is currently **active** (is_active: true). |
| **Test Steps** | 1. **Postman:** Log in as admin: POST http://localhost:8000/api/v1/auth/login (body: x-www-form-urlencoded, username=admin email, password=admin password). Copy **access_token**. 2. **Postman:** Send **PATCH** to http://localhost:8000/api/v1/admin/users/{user_id} (replace {user_id} with target user’s MongoDB _id). **Headers:** Authorization: Bearer \<admin_token\>. **Body** (raw, JSON): {"is_active": false}. Send. 3. Verify API returns 200 with "message": "User updated successfully", "is_active": false. 4. **Postman:** Login as deactivated user: POST /api/v1/auth/login with that user’s email and password. Verify 403 with "User account is inactive". |
| **Expected Result** | The PATCH request returns **200 OK** and the user’s **is_active** is set to **false** in the database. The deactivated user cannot log in: login attempt returns **403 Forbidden** with detail "User account is inactive". |
| **Actual Result** | *(After test run:* e.g. "Admin deactivated user via PATCH /api/v1/admin/users/{user_id} with is_active: false. Received 200; user status showed Inactive. Deactivated user login attempt returned 403 with 'User account is inactive'. As expected.") |
| **Status** | *(Pass / Fail)* |

---

## Actual Result (2 lines – English, copy-paste when test passes)

```
Admin sent PATCH /api/v1/admin/users/{user_id} with body {"is_active": false}. Received 200 OK; user is_active set to false in database.
Deactivated user login attempt returned 403 Forbidden with detail "User account is inactive". Test passed.
```

---

## Test Case – Tamil (தமிழ்) – விவரம்

| Field | Detail (தமிழ்) |
|-------|------------------|
| **Test Case ID** | TC-033 |
| **Test Description** | நிர்வாகி ஒரு பயனாளியை (நோயாளி அல்லது மருத்துவர்) செயல்நீக்க முடியும் என்பதை சரிபார்க்க. செயல்நீக்கப்பட்ட பயனாளி உள்நுழைய முடியாது. |
| **Prerequisites** | Backend மற்றும் MongoDB இயங்கிக்கொண்டிருக்கும். நிர்வாகி கணக்கு உள்ளது. குறைந்தது ஒரு **active** பயனாளி (நோயாளி/மருத்துவர்) உள்ளது. |
| **Test Steps** | 1. Postman: நிர்வாகியாக login (POST /auth/login); access_token copy பண்ணுங்க. 2. Postman: PATCH /api/v1/admin/users/{user_id}, body {"is_active": false}, Authorization: Bearer \<admin token\>. 3. API 200 தருவதை சரிபார்க்க. 4. Postman: செயல்நீக்கப்பட்ட பயனாளியாக login முயற்சி (POST /auth/login); 403 / "User account is inactive" வருவதை சரிபார்க்க. |
| **Expected Result** | PATCH 200 தரும்; DB-ல is_active false ஆகும். செயல்நீக்கப்பட்ட பயனாளி login செய்ய முடியாமல் 403 மற்றும் "User account is inactive" கிடைக்கும். |
| **Actual Result** | *(சோதனை பிறகு:* நிர்வாகி பயனாளியை deactivate பண்ணினார்; 200 கிடைத்தது. அந்த பயனாளி login செய்ய முயன்றபோது 403 கிடைத்தது. எதிர்பார்த்ததுபோல்.) |
| **Status** | Pass / Fail |

---

## System details used (for reference)

- **Deactivate API:** `PATCH /api/v1/admin/users/{user_id}`  
  **Body:** `{"is_active": false}`  
  **Auth:** Admin JWT required.  
  **Response:** 200, `{"message": "User updated successfully", "is_active": false}`

- **Login (deactivated user):** Backend checks `user.is_active`; if false, returns **403** with `"detail": "User account is inactive"`.
