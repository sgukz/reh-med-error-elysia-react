# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.9.0] - 2026-05-19

### Added — ReportSummary6 (สรุปอุบัติการณ์ที่ได้ RCA แล้ว)
- `ReportModel.getReportSummary6({ dateStart, dateEnd, errorType })` — ดึงเฉพาะ `is_rca = 'Y' AND app_new = 'Y'` ในช่วงวันที่ + filter ประเภท Error (0 = ทั้งหมด, 1-6)
- คำนวณ `rca_days` ฝั่ง SQL ด้วย `DATEDIFF(updated_rca, error_date)` — ไม่ต้องคำนวณซ้ำที่ frontend
- คอลัมน์ครบ 17 คอลัมน์ตาม spec: error_date/time, ward, event, level, type+detail (CASE WHEN), analysis, alert (HAD/Non-HAD), clear, doctor, rca_text/by + updated_rca, user_name + คอลัมน์คำนวณ rca_days
- Endpoint `GET /reports/summary6?dateStart=...&dateEnd=...&errorType=0` — return `{ statusCode, reportList, summary }`
- `summary` aggregate ใน route handler (ไม่ต้อง query เพิ่ม): `total`, `levelEPlus` (E-I), `hadCount`, `avgRcaDays` (2 ทศนิยม), `topErrorType`, `topWard`
- Interface ใหม่ `GetMedErrorSummary6Options`, `Summary6Row`, `Summary6Stats`

### Security — Summary6 Input Validation
- ตรวจ `dateStart`/`dateEnd` ต้องตรงรูปแบบ `^\d{4}-\d{2}-\d{2}$` ก่อนส่งเข้า knex (กัน parameter pollution / format inject)
- ตรวจ `dateStart <= dateEnd` (BAD_REQUEST ถ้าผิดลำดับ)
- `errorType` parsed ผ่าน `Number()` + clamp `1..6` — ไม่เข้า SQL ถ้านอกช่วง
- ตามลำดับ **origin gate → client-id gate → JWT verify → input validate → business logic** (เหมือน Summary10)

## [1.8.0] - 2026-05-19

### Added — ReportSummary10 (สถิติจำนวนใบสั่งยา/วันนอน)
- ตารางใหม่ `med_error_stat_volume` (stat_year, stat_month, ipd_patient_days, opd_prescriptions, updated_by/at + UNIQUE(year,month))
- `ReportModel.getStatVolume(fy)` / `upsertStatVolume(body)` / `getReportSummary10(opts)`
- Endpoints:
  - `GET /reports/summary10?fiscalYear=...` — รวม `statVolume + errorCounts` ใน response เดียว
  - `GET /reports/stat-volume?fiscalYear=...`
  - `POST /reports/stat-volume` — Admin only (`rule===9` จาก `med_error_access.active=1`)
- `med_error.error_ward` JOIN `med_error_dept` filter `med_error_dep_group_id IN (1,2,5,6)`, CASE → IPD/OPD ward group
- Migration: `migrations/2026-05-19_create_med_error_stat_volume.sql` + Bun script idempotent

### Security — Input Validation Layer สำหรับ Summary10
- `parseFiscalYear(v)` — reject non-integer / NaN / นอกช่วง พ.ศ. 2400-2700
- `validateStatVolumeRows(rows)` — reject ค่าลบ / `stat_month` นอก 1-12 / เดือนซ้ำ / array ว่าง / > 12 รายการ
- ทุก endpoint ของ summary10 ใช้ลำดับ: **auth → validate → business logic**

### Performance — Database Indexes
ก่อน v1.8.0 ตาราง `med_error` (≈15K rows) มี index แค่ PRIMARY (error_id) — ทุก report ที่ filter วันที่ทำ full table scan
- `med_error.idx_error_date` (error_date) — ครอบคลุมทุก report
- `med_error.idx_error_type_date` (error_type, error_date) — Summary 8/9/10
- `med_error.idx_error_ward` (error_ward) — Summary 1/10 (JOIN dept)
- `med_error_type_list.idx_etl_type_active` (error_type, is_active) — Summary 9 subtype filter
- EXPLAIN ยืนยัน optimizer ใช้ index → Summary10 11ms, Summary1 4ms
- Migration: `migrations/2026-05-19_add_report_indexes.sql` + Bun script idempotent

### Ops scripts
- `scripts/run-stat-volume-migration.ts` / `run-report-indexes-migration.ts` — migration runners
- `scripts/audit-report-indexes.ts` / `benchmark-report-queries.ts` — diagnostic toolbox

## [1.7.1] - 2026-05-19

### Fixed
- **`/auth/profile`**: ตอบ **200 + `{profile: null}`** เมื่อยังไม่ได้ login / token หมดอายุ แทนการตอบ 401 — ลดการขึ้น error สีแดงใน browser console ตอนเปิดหน้า Login ครั้งแรก (frontend เช็ค `if (profile)` อยู่แล้ว ทำงานต่อได้)
- ยังคง 403 สำหรับ Origin / Client-ID ไม่ผ่าน (เป็น config error ที่ต้องเห็น) และ protected routes อื่น ๆ ยังตอบ 401 ตามเดิม (axios response interceptor ใช้ redirect ปกติ)

## [1.7.0] - 2026-05-12

### Added — Likelihood Score + รื้อรายงาน Summary9
- เพิ่ม column `likelihood_score TINYINT NULL` ใน `med_error_type_list` (migration: `migrations/2026-05-12_add_likelihood_score_to_med_error_type_list.sql`) + Bun script idempotent
- `TypeErrorListCreate` interface เพิ่ม `likelihood_score: number | null`
- `POST /med-error/create-error-type-list` validate `likelihood_score` ต้องเป็น null หรือ integer 1-5
- `MedErrorModel.getErrorTypeByTypeList` SELECT `likelihood_score` ด้วย

### Changed — รื้อ `/reports/summary9` (รายงานแยกรายละเอียด Error)
ก่อนหน้านี้รายงานเป็น ward × type matrix; v1.7.0 เปลี่ยนเป็น subtype detail report ตามต้นแบบจากผู้ใช้:
- Query params ใหม่: `firstDateA`, `lastDateA` (required), `firstDateB`, `lastDateB` (optional), `errorType` (required, 1-6)
- `ReportModel.getReportSummary9` รื้อใหม่:
  - SELECT subtype จาก `med_error_type_list` (is_active='Y') ของประเภท Error ที่เลือก
  - LEFT JOIN `med_error` ด้วย `m.<error_field> LIKE CONCAT(etl.error_type_list, ' %')` แยก field ตามประเภท (1=prescription, 2=dispensing, 3=pre_administration, 4=adminstration, 5=processing, 6=transcribing)
  - COUNT แยก HAD vs Non-HAD ตาม `error_alert` ในแต่ละช่วง (Period A และ Period B ถ้ามี)
  - SELECT `impact_score`, `likelihood_score` คู่ด้วย (Level = Impact + Likelihood คำนวณฝั่ง frontend)
- Response รวม `errorType`, `errorTypeName`, `compare` (boolean), `reportList`

## [1.6.0] - 2026-05-12

### Backend Database Migration & Fixes
- เพิ่ม Column `impact_score` ลงในตาราง `med_error_type_list` และรัน Knex migration script
- แก้ปัญหา 500 Internal Server Error ตอนเรียก API `GET /med-error/get-error-type-list?id=0` จากการไม่ได้ส่ง cookie

## [1.5.0] - 2026-05-11

### Added — Cookie-based Authentication (เปลี่ยนกลไก auth ไปใช้ HTTP-only cookie)
- เพิ่ม `src/plugins/auth.ts` รวม helper:
  - `readAuthTokenFromHeaders(headers)` — อ่าน token จาก Authorization header → fallback Cookie header
  - `setAuthCookie(cookie, token)` — set cookie พร้อม options ครบ (HttpOnly + Secure + SameSite + Path + MaxAge)
  - `clearAuthCookie(cookie)` — เคลียร์ cookie ตอน logout
- `/auth/login`: หลัง sign JWT สำเร็จ set HTTP-only cookie ชื่อ `access_token` ให้ browser อัตโนมัติ (ยัง return `access_token` ใน body ระหว่าง transition)
- `/auth/refresh`: อ่าน token จาก cookie/header → sign ใหม่ → set cookie ใหม่
- `/auth/profile`: อ่าน token จาก cookie/header (สอดคล้องกับ login flow)
- **เพิ่ม `/auth/logout`** — POST endpoint สำหรับเคลียร์ HTTP-only cookie
- ทุก protected route (`MedErrorRoute`, `ReportRoute`, `DashboardRoute`) เปลี่ยนจาก `headers.get('authorization')?.split(" ")[1]` เป็น `readAuthTokenFromHeaders(headers)` รองรับทั้ง cookie + header

### Added — รายงานคู่ยาคลาดเคลื่อน (Drug Pair Reports)
- เพิ่ม `GetDrugPairReportOptions` + `DrugPairRow` ใน `ReportInterface.ts`
- เพิ่ม `ReportModel.getDrugPairSummary({ firstDate, lastDate, pairType })` — group by (ยาที่ถูก, ยาที่คลาดเคลื่อน) → COUNT(*) → ORDER BY count DESC
- เพิ่ม endpoint `GET /reports/drug-pair-summary` รับ `pairType=dispensing` (error_type=2, ใช้ field `error_prescription_right/wrong`) หรือ `pairType=processing` (error_type=5, ใช้ `error_processing_right/wrong`)

### Added — Impact Score ในประเภท Error
- เพิ่ม column `impact_score TINYINT NULL` ใน `med_error_type_list` (migration: `migrations/2026-05-11_add_impact_score_to_med_error_type_list.sql`)
- `TypeErrorListCreate` interface เพิ่ม `impact_score: number | null`
- `MedErrorModel.getErrorTypeByTypeList` (branch จัดการข้อมูล) SELECT `impact_score` ด้วย
- `POST /med-error/create-error-type-list` validate `impact_score` ต้องเป็น `null` หรือ integer 1-5 (คืน 400 ถ้าผิดรูปแบบ)
- เพิ่ม `scripts/run-impact-score-migration.ts` — Bun script รัน ALTER TABLE แบบ idempotent (เช็ค column ก่อน), พิมพ์ schema verify หลัง migrate

### Configuration
- เพิ่ม env flags สำหรับ cookie ใน `config.ts`:
  - `COOKIE_SECURE` (default `false` สำหรับ intranet HTTP, ตั้ง `true` เมื่อขึ้น HTTPS)
  - `COOKIE_SAMESITE` (default `lax`, เปลี่ยนเป็น `none` สำหรับ cross-origin)
  - `COOKIE_MAX_AGE_SEC` (default `86400` ตรงกับ JWT exp)
  - `COOKIE_NAME` (default `access_token`)
- อัปเดต `.env.development` เพิ่มตัวอย่างค่า cookie (ค่าทั้งหมดอยู่ใน `.env*` ไม่ commit)

## [1.4.0] - 2026-04-28

### ความปลอดภัย (Security – OWASP Top 10)
- **A03 Injection**: แก้ SQL Injection ใน `HISModel.login()` และ `HISModel.getPatientInfo()` โดยเปลี่ยนจาก template string ไปใช้ parameterized query
- **A01 Broken Access Control**: แก้ logic บั๊ก `if (!origin && !ALLOWED_ORIGINS.has(origin))` (เดิมเป็น `&&` ทำให้ bypass ได้เมื่อไม่ส่ง origin) เป็น `||` ในทุก route
- **A05 Security Misconfiguration**:
  - ลบการส่ง `error.message` ออกใน response เพื่อไม่ให้ leak โครงสร้าง DB/internal stack
  - แก้ HTTP Status Code ให้ตรงกับสถานการณ์ (เดิมตอบ 200 OK สำหรับเคส error)
  - กำหนด CORS origin ตาม `ALLOWED_ORIGINS` (allowlist) ไม่ใช่ pass-through
- **A07 Authentication Failures**:
  - แก้บั๊กใน `/auth/login` ที่ sanitize username/password แล้วแต่ส่งค่าดั้งเดิมไป query
  - แก้เงื่อนไข `if (!loginname && !loginpwd)` (ควรเป็น `||`)
  - `/auth/refresh` ลบ `exp/iat` เก่าก่อน sign ใหม่ ป้องกัน timing เพี้ยน
- **A09 Logging**: ลบ `console.log` ที่บันทึกข้อมูล payload (ผู้ป่วย/HN) ใน MedErrorRoute

### โครงสร้าง (Refactor / Cleanup)
- ลบ route และไฟล์ที่ frontend ไม่ใช้: `KphisRoute`, `KphisModel`, `KphisMentalModel`, `KphisInterface`, `NotifyTelegram`, `lineMessaging`, `MOPHAlert`, `HandleError`
- ลบการเชื่อมต่อ DB Kphis และ env ที่ไม่ใช้ (`DB_KPHIS_*`, `TELEGRAM_*`, `LINE_CHANNEL_ACCESS_TOKEN`)
- เพิ่ม `helpers/AuthGuard.ts` สำหรับการตรวจ origin/clientId/JWT แบบรวมศูนย์
- ตั้งค่า Knex connection pool (`min:2 max:20`) และ `acquireConnectionTimeout: 30s`

### แก้บั๊กอื่น (Fixed)
- แก้ typo `verion` เป็น `version` ใน `config.ts` และ `index.ts`
- เปลี่ยน `reply()` (MOPH alert) ให้ไม่ throw ออกไปทำลาย request หลัก, เพิ่ม `timeout: 5000ms`
- เพิ่ม `.filter(Boolean)` ตอน parse `ALLOWED_CLIENTS`/`ALLOWED_ORIGINS` ป้องกัน Set มี string ว่างค้าง

## [1.3.7] - 2026-02-03
### Changed
- **Docker Deployment Optimization**: ปรับปรุงไฟล์ `docker-compose.yml` (ทั้ง Development และ Production) ให้รองรับการโหลด Environment Variables ผ่านไฟล์ `.env` โดยตรง (`env_file`) ลดความซับซ้อนของการกำหนดค่า
- **Port Mapping**: ปรับปรุง Port Mapping ให้มีความยืดหยุ่นมากขึ้น (`${PORT}:${PORT}`)
- **Documentation**: อัปเดตคู่มือการ Deploy (`DEPLOY.md`) เพิ่มขั้นตอนการ Build, Push Docker Image และการตั้งค่า Environment Variables แบบใหม่

## [1.3.6] - 2026-02-03
### Changed
- **Docker Build Fix**: แก้ไขปัญหา Permission Error (`EACCES`) ใน Dockerfile โดยเพิ่ม `--chown=bun:bun` ในขั้นตอน Copy ไฟล์
- **Production Config**: ปรับปรุงไฟล์ `docker-compose-prod.yml` ให้ใช้งานได้จริง

## [1.3.5] - 2026-02-03
### Changed
- **Origin Check Logic Refactor**: ปรับปรุงการตรวจสอบ Origin ในทุก Route (`Auth`, `Dashboard`, `Kphis`, `MedError`, `Report`) ให้รองรับการ Fallback ไปใช้ `Referer` header กรณีที่ `Origin` header ไม่มี
- **HTTP Status Codes**: ปรับการตอบกลับ HTTP Status Code ให้เป็น `200 OK` เสมอสำหรับ cases error ต่างๆ (400, 401, 403, 404) แต่ยังคงส่ง status code จริงกลับใน body
- **Docker Optimization**: ปรับปรุง Dockerfile ไปใช้ Multi-stage build และใช้ `oven/bun:1.1.26-alpine` เพื่อลดขนาด Image (เหลือประมาณ ~130MB จากเดิม ~422MB)
- **Production Deployment**: เพิ่มโฟลเดอร์ `production_deploy` และไฟล์ `docker-compose.yml`, `env.example`, `README.md` สำหรับการ Deploy บน Server จริง

## [1.3.4] - 2026-01-29
### Added
- เพิ่ม endpoint ใหม่สำหรับการจัดการ report (`ReportRoute`)
- เพิ่ม configuration สำหรับ KPHIS database ใน `config.ts`

### Changed
- ปรับปรุง endpoint `/login`
- อัปเดต dependencies ใน `package.json`
- ปรับปรุง Database connection checking log ใน `index.ts`

## [1.3.3] - 2025-12-09
### Changed
- แก้ไข API `GET /get-error-type` เพิ่มเงื่อนไข CASE 3 All type

## [1.3.2] - 2025-12-05
### Added
- เพิ่มการแจ้งเตือนผ่าน **LINE OA (MOPH Notify API)**
  - สร้างฟังก์ชัน `sendReplyLineMessaging` เพื่อส่งข้อความตอบกลับ
  - รองรับการส่ง Headers: `client-key`, `secret-key`
- เตรียมระบบเพื่อทดแทน LINE Notify

## [1.0.2] - Initial Release
- เริ่มต้นโปรเจกต์ API Med Error
- โครงสร้างโปรเจกต์พื้นฐานด้วย ElysiaJS + Bun
- ระบบ Authentication (JWT)
- เชื่อมต่อฐานข้อมูล MySQL
