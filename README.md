# REH Medication Error Reporting System

ระบบรายงานความคลาดเคลื่อนทางยา (Medication Error Reporting System) สำหรับโรงพยาบาลร้อยเอ็ด (REH)

โปรเจกต์นี้พัฒนาขึ้นเพื่อช่วยในการบันทึก ติดตาม และวิเคราะห์ข้อมูลความคลาดเคลื่อนทางยา เพื่อนำไปสู่การปรับปรุงความปลอดภัยของผู้ป่วย

> **ใช้งานภายใน intranet ของโรงพยาบาลเท่านั้น** (ในระยะแรก)

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

โปรเจกต์นี้แบ่งออกเป็น 2 ส่วนหลัก (Monorepo):

1. **[Frontend](./frontend)** (`v1.20.1`): ระบบหน้าบ้านสำหรับผู้ใช้งานและผู้ดูแลระบบ
   - **Tech Stack**: React 18, Material UI (MUI v5), React Hook Form, Zod, ApexCharts
   - **Package Manager**: [Bun](https://bun.sh/)

2. **[Backend](./backend)** (`v1.9.0`): ระบบ API สำหรับจัดการข้อมูล
   - **Tech Stack**: [ElysiaJS](https://elysiajs.com/), TypeScript, MariaDB/MySQL (Knex)
   - **Runtime/Package Manager**: [Bun](https://bun.sh/)

---

## 🔌 ภาพรวม API (ใช้งานจริงโดย frontend)

| หมวด | Endpoint | Method | คำอธิบาย |
|---|---|---|---|
| Auth | `/auth/login` | POST | เข้าสู่ระบบ (ตรวจ origin + client-id + ผู้ใช้ HIS) |
| Auth | `/auth/refresh` | POST | ออก access token ใหม่จาก refresh token |
| Auth | `/auth/profile` | POST | ตรวจสอบ token + คืน profile ปัจจุบัน |
| HIS | `/med-error/doctor` | GET | รายชื่อแพทย์ |
| HIS | `/med-error/drugitems` | GET | รายการยา |
| HIS | `/med-error/get-patient-info` | GET | ข้อมูลผู้ป่วยจาก HN |
| Master | `/med-error/get-dept` / `/create-dept` / `/delete-dept` | GET/POST/DELETE | จัดการหอผู้ป่วย |
| Master | `/med-error/person` / `/create-person` / `/delete-person` | GET/POST/DELETE | จัดการผู้รับผิดชอบ |
| Master | `/med-error/get-error-type` / `/get-error-type-list` / ... | GET/POST/DELETE | จัดการประเภท error |
| Master | `/med-error/get-analysis` / `/create-analysis` / `/delete-analysis` | GET/POST/DELETE | จัดการการวิเคราะห์สาเหตุ |
| Form | `/med-error/med-error` | GET/POST/PUT/DELETE | ฟอร์มรายงาน + RCA |
| Dashboard | `/med-error/dashboard/mederror` | GET | สรุป Executive |
| Reports | `/med-error/reports/summary[1,2,3,5,6,7,8,9,10]` | GET | รายงานต่าง ๆ (รวม Summary6 = สรุปอุบัติการณ์ที่ RCA แล้ว, Summary10 = สถิติใบสั่งยา/วันนอน) |
| Reports | `/med-error/reports/stat-volume` | GET/POST | TABLE 0 ของ Summary10 (POST = Admin only) |
| Reports | `/med-error/reports/drug-pair-summary` | GET | คู่ยาคลาดเคลื่อน (dispensing / processing) |

ทุก endpoint ตรวจ `Origin/Referer` กับ allowlist + `client-id` + JWT token

---

## 🚀 วิธีการติดตั้งและเริ่มต้นใช้งาน (Getting Started)

### ข้อกำหนดเบื้องต้น (Prerequisites)
- [Bun](https://bun.sh/) v1.1+ (Frontend และ Backend ใช้ runtime เดียวกัน)
- MariaDB / MySQL ที่เข้าถึงได้จาก intranet โรงพยาบาล (HIS DB และ medication_error_db)

### การติดตั้ง (Installation)

```bash
# Clone โปรเจกต์
git clone <repository_url>
cd reh-med-error

# ติดตั้ง dependencies
cd frontend && bun install && cd ..
cd backend && bun install && cd ..
```

### ตั้งค่า environment

- คัดลอก `backend/.env.development` ตั้งค่า DB host/user/password ของ HIS และ medication_error_db
- คัดลอก `frontend/.env.development` ตั้ง `REACT_APP_API_URL` ชี้ไปที่ backend

> 💡 **หมายเหตุด้านความปลอดภัย**: Secret ใน `.env.development` ที่อยู่ใน repo ปัจจุบันถูก commit ไปแล้ว ให้ทีม operations **rotate** secret ทุกตัว (JWT, DB password, MOPH client/secret) ก่อน deploy เข้า production จริง

### การรันระบบในโหมดพัฒนา (Development)

**Backend API:**
```bash
cd backend
bun run dev
```
*API จะทำงานที่ [http://localhost:9000](http://localhost:9000)*

**Frontend:**
```bash
cd frontend
bun start
```
*Frontend จะทำงานที่ [http://localhost:3000](http://localhost:3000)*

---

## 🔒 หลักความปลอดภัยที่ใช้

ระบบใช้ **defense-in-depth** หลายชั้น:

1. **Origin allowlist** – ตรวจ `Origin` header (fallback `Referer`) เทียบกับ `ALLOWED_ORIGINS`
2. **Client allowlist** – ทุก request ต้องส่ง `client-id` ที่ตรงกับ `ALLOWED_CLIENTS`
3. **JWT** – ทุก endpoint (ยกเว้น `/auth/login`) ต้องมี `Authorization: Bearer <token>` ที่ valid
4. **Parameterized SQL** – Knex query builder + `whereRaw(?, [...])` ป้องกัน SQL Injection
5. **Generic error response** – ไม่ส่ง `error.message` ออก, log เฉพาะฝั่ง server
6. **Connection pool** – จำกัด max connections (`min:2 max:20`) ป้องกัน DB exhaustion
7. **Frontend axios interceptor** – ตรวจจับ 401/403 → clear token + redirect

---

## 🐳 การ Deploy ด้วย Docker

ทั้ง Frontend และ Backend รองรับการทำงานผ่าน Docker Container สำหรับการนำไปใช้งานจริง (Production) สามารถดูคู่มือและไฟล์การตั้งค่าได้จาก:
- [Backend Deployment Guide](./backend/DEPLOY.md)
- `docker-compose.yml` ในแต่ละโฟลเดอร์

---

## 🤖 Claude Code Skills

โปรเจกต์นี้ติดตั้ง **Anthropic Agent Skills** (จาก [anthropics/skills](https://github.com/anthropics/skills)) เพื่อให้ Claude Code ทำงานกับ stack นี้ได้แม่นยำขึ้น:

- **Project-level** (`.claude/skills/`): `frontend-design` + `webapp-testing` — ตามไปด้วยเมื่อ clone repo
- **User-level** (`~/.claude/skills/`): `skill-creator` + `claude-api` — reuse ได้ทุกโปรเจกต์

วิธีนำไปใช้กับโปรเจกต์อื่นที่คล้ายกัน (React + REST API): ดู [`.claude/skills/README.md`](./.claude/skills/README.md)

Workflow มาตรฐานสำหรับ scan / fix bug / OWASP Top 10 security check / commit / push: ดู [`AGENTS.md`](./AGENTS.md) — auto-loaded โดย Claude Code, Cursor, Aider, Codex และ AI agent อื่น ๆ ที่รองรับมาตรฐาน [agents.md](https://agents.md/)

---

## 📝 Changelog

ดู [`backend/CHANGELOG.md`](./backend/CHANGELOG.md) และ [`frontend/CHANGELOG.md`](./frontend/CHANGELOG.md) สำหรับรายละเอียดการเปลี่ยนแปลงในแต่ละเวอร์ชัน
