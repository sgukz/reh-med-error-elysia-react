# Implementation Plan: รายงานแบบบันทึกสถิติจำนวนใบสั่งยา (OPD) และวันนอน (IPD)

> **Report**: ReportSummary10  
> **Version**: 1.0  
> **Date**: 2026-05-19  
> **Status**: 🔶 Pending Review

---

## 1. ภาพรวม

เพิ่มรายงานใหม่ **ReportSummary10** ในระบบ Medication Error ประกอบด้วย 4 ตาราง:

| ตาราง | แหล่งข้อมูล | คำอธิบาย |
|-------|------------|----------|
| **TABLE 0** | Admin กรอกเอง | จำนวนวันนอน (IPD) และจำนวนใบสั่งยา (OPD) รายเดือน |
| **TABLE A (IPD)** | ดึงจาก `med_error` | นับจำนวน Error แยก HAD/Non-HAD ตามเดือน สำหรับ ward กลุ่ม IPD |
| **TABLE B (OPD)** | ดึงจาก `med_error` | นับจำนวน Error แยก HAD/Non-HAD ตามเดือน สำหรับ ward กลุ่ม OPD |
| **TABLE C (Summary)** | คำนวณจาก TABLE 0 + A/B | อัตราความคลาดเคลื่อนต่อ 1,000 วันนอน/ใบสั่งยา |

---

## 2. Confirmed Requirements

| # | ข้อกำหนด | รายละเอียด |
|---|---------|-----------|
| 1 | **แยก OPD/IPD** | ใช้ `med_error_dep_group_id` จากตาราง `med_error_dept`: **IPD** = `2`, **OPD** = `1, 5, 6` |
| 2 | **สิทธิ์กรอก TABLE 0** | เฉพาะ Admin (`profile.rule === 9`) เท่านั้น |
| 3 | **ประเภท Error** | ครบ 6 ประเภท: 1=Prescription, 2=Dispensing, 3=Pre-Administration, 4=Administration, 5=Processing, 6=Transcribing |
| 4 | **ปีงบประมาณ** | ตค. (เดือน 10) → กย. (เดือน 9) ปีถัดไป เช่น ปีงบ 2567 = ตค.66 – กย.67 |

### 2.1 สูตร TABLE C

TABLE C แยก 4 sections โดยแต่ละ section มี **6 แถว** (6 error types) × **12 เดือน** (ปีงบ):

| Section | สูตร |
|---------|------|
| **IPD** | `(ผลรวม Non-HAD ของ error type นั้น ที่ ward เป็น IPD × 1000) / จำนวนวันนอน IPD ของเดือนนั้น` |
| **IPD-HAD** | `(ผลรวม HAD ของ error type นั้น ที่ ward เป็น IPD × 1000) / จำนวนวันนอน IPD ของเดือนนั้น` |
| **OPD** | `(ผลรวม Non-HAD ของ error type นั้น ที่ ward เป็น OPD × 1000) / จำนวนใบสั่งยา OPD ของเดือนนั้น` |
| **OPD-HAD** | `(ผลรวม HAD ของ error type นั้น ที่ ward เป็น OPD × 1000) / จำนวนใบสั่งยา OPD ของเดือนนั้น` |

**หมายเหตุ:**
- `HAD` = `error_alert = 'High Alert Drugs'`
- `Non-HAD` = `error_alert = 'ไม่ใช่ High Alert Drugs'`
- ถ้าตัวหาร (จำนวนวันนอน/ใบสั่งยา) = 0 จะแสดง `0.00`

---

## 3. Database Schema

### 3.1 [NEW] Table `med_error_stat_volume`

สร้างตารางใหม่ใน database `DBSec` เพื่อเก็บข้อมูลที่ admin กรอก:

```sql
CREATE TABLE IF NOT EXISTS med_error_stat_volume (
  stat_id           INT AUTO_INCREMENT PRIMARY KEY,
  stat_year         INT NOT NULL              COMMENT 'ปี ค.ศ.',
  stat_month        INT NOT NULL              COMMENT 'เดือน 1-12',
  ipd_patient_days  DECIMAL(12,2) DEFAULT 0   COMMENT 'จำนวนวันนอน IPD',
  opd_prescriptions DECIMAL(12,2) DEFAULT 0   COMMENT 'จำนวนใบสั่งยา OPD',
  updated_by        VARCHAR(100) DEFAULT NULL COMMENT 'ผู้อัปเดต',
  updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_year_month (stat_year, stat_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

> ⚠️ **ต้อง run SQL นี้บน database ก่อน deploy**

---

## 4. Backend Changes

### 4.1 [MODIFY] `backend/src/Interfaces/ReportInterface.ts`

เพิ่ม 3 interfaces:

```typescript
// params สำหรับ GET summary10
export interface GetMedErrorSummary10Options {
    fiscalYear: string | number; // ปี พ.ศ. (e.g. 2567)
}

// row จาก med_error_stat_volume
export interface StatVolumeRow {
    stat_id?: number;
    stat_year: number;
    stat_month: number;
    ipd_patient_days: number;
    opd_prescriptions: number;
    updated_by?: string;
    updated_at?: string;
}

// body สำหรับ POST stat-volume
export interface StatVolumeUpsertBody {
    fiscalYear: number;  // ปี พ.ศ.
    rows: Array<{
        stat_month: number;
        ipd_patient_days: number;
        opd_prescriptions: number;
    }>;
    updated_by?: string;
}
```

---

### 4.2 [MODIFY] `backend/src/models/ReportModel.ts`

เพิ่ม 3 methods ใน class `ReportModel`:

#### 4.2.1 `getStatVolume(fiscalYear: number)`
- แปลงปี พ.ศ. → ค.ศ. (ปีงบ 2567: ตค.2023 – กย.2024)
- Query `med_error_stat_volume` WHERE `(stat_year, stat_month)` ตรงกับ 12 เดือนในปีงบ
- Return: array ของ 12 rows (เดือน ตค. - กย.)

#### 4.2.2 `upsertStatVolume(body: StatVolumeUpsertBody)`
- แปลงปี พ.ศ. → ค.ศ.
- Loop ผ่าน `rows` แล้ว `INSERT ... ON DUPLICATE KEY UPDATE` ทีละเดือน
- Return: จำนวน rows ที่ affected

#### 4.2.3 `getReportSummary10(options: GetMedErrorSummary10Options)`
- แปลงปีงบ → ช่วงวันที่ (`firstDate` = YYYY-10-01, `lastDate` = YYYY+1-09-30)
- Query `med_error` JOIN `med_error_dept` เพื่อ filter ตาม `med_error_dep_group_id`
- GROUP BY `error_type`, `MONTH(error_date)`, `YEAR(error_date)`, `ward_group` (IPD/OPD)
- นับแยก HAD / Non-HAD ด้วย CASE WHEN

**ตัวอย่าง query concept:**
```sql
SELECT
    m.error_type,
    MONTH(m.error_date) as error_month,
    YEAR(m.error_date) as error_year,
    CASE
        WHEN d.med_error_dep_group_id = 2 THEN 'IPD'
        WHEN d.med_error_dep_group_id IN (1,5,6) THEN 'OPD'
    END as ward_group,
    COUNT(CASE WHEN m.error_alert = 'High Alert Drugs' THEN 1 END) as had_count,
    COUNT(CASE WHEN m.error_alert = 'ไม่ใช่ High Alert Drugs' THEN 1 END) as non_had_count,
    COUNT(*) as total_count
FROM med_error m
JOIN med_error_dept d ON m.error_ward = d.med_error_depcode
WHERE m.error_date BETWEEN '2023-10-01' AND '2024-09-30'
  AND d.med_error_dep_group_id IN (1, 2, 5, 6)
GROUP BY m.error_type, MONTH(m.error_date), YEAR(m.error_date), ward_group
ORDER BY m.error_type, error_year, error_month
```

---

### 4.3 [MODIFY] `backend/src/routes/ReportRoute.ts`

เพิ่ม 3 endpoints:

| Method | Path | คำอธิบาย | Auth |
|--------|------|---------|------|
| `GET` | `/reports/summary10?fiscalYear=2567` | ดึงข้อมูล TABLE A+B (med_error counts) + TABLE 0 (stat_volume) รวมใน response เดียว | Token required |
| `GET` | `/reports/stat-volume?fiscalYear=2567` | ดึงเฉพาะ TABLE 0 | Token required |
| `POST` | `/reports/stat-volume` | save/update TABLE 0 | Token + **Admin only** (rule=9) |

#### Response format ของ GET /reports/summary10:

```json
{
  "statusCode": 200,
  "fiscalYear": 2567,
  "statVolume": [
    { "stat_month": 10, "stat_year": 2023, "ipd_patient_days": 30211, "opd_prescriptions": 39881 },
    { "stat_month": 11, "stat_year": 2023, "ipd_patient_days": 27189, "opd_prescriptions": 38426 },
    "... (12 rows)"
  ],
  "errorCounts": [
    { "error_type": 1, "error_month": 10, "error_year": 2023, "ward_group": "IPD", "had_count": 7, "non_had_count": 4, "total_count": 11 },
    { "error_type": 1, "error_month": 10, "error_year": 2023, "ward_group": "OPD", "had_count": 2, "non_had_count": 0, "total_count": 2 },
    "... (up to 6 types × 12 months × 2 groups = 144 rows max)"
  ]
}
```

#### Admin check สำหรับ POST stat-volume:
```typescript
const payload = await jwt.verify(token);
const access = await mederror.getMedErrorAccess(payload.loginname);
if (!access || !access.length || access[0]?.rule !== 9) {
    set.status = StatusCodes.FORBIDDEN;
    return { statusCode: 403, statusMessage: 'Admin access required' };
}
```

---

## 5. Frontend Changes

### 5.1 [MODIFY] `frontend/src/libs/MedError.js`

เพิ่ม 3 functions:

```javascript
// ดึงข้อมูลทั้งหมดสำหรับ ReportSummary10
export const getReportSummary10 = buildReportSummary('summary10');

// ดึง TABLE 0 (stat volume)
export function getStatVolume(token, { fiscalYear }) {
  return axios({
    method: 'GET',
    url: `${API_ROUTE.REPORT_MEDERROR}/stat-volume?fiscalYear=${fiscalYear}`,
    headers: authHeader(token),
  });
}

// save/update TABLE 0 (admin only)
export function saveStatVolume(token, data) {
  return axios({
    method: 'POST',
    url: `${API_ROUTE.REPORT_MEDERROR}/stat-volume`,
    headers: authHeader(token),
    data,
  });
}
```

---

### 5.2 [NEW] `frontend/src/sections/reports/ReportSummary10.js`

Component ใหม่ (~800 lines) ประกอบด้วย:

#### 5.2.1 Filter Section
- Dropdown เลือก **ปีงบประมาณ** (ปี พ.ศ.) — default = ปีปัจจุบัน
- ปุ่ม **Export Excel**

#### 5.2.2 TABLE 0 — ข้อมูลแอดมินกรอก
- **12 คอลัมน์** ตามลำดับเดือนปีงบ: ตค., พย., ธค., มค., กพ., มีค., เมย., พค., มิย., กค., สค., กย. + คอลัมน์ **รวม**
- **2 แถว**: จำนวนวันนอน (IPD) วันนอน, จำนวนใบสั่งยา (OPD) ใบ
- เซลล์ = `<TextField type="number">` สำหรับ admin / ตัวเลข read-only สำหรับ user ปกติ
- ปุ่ม **"บันทึก"** (แสดงเฉพาะ admin rule=9)
- คอลัมน์รวม auto-sum (คำนวณ client-side)

#### 5.2.3 TABLE A — IPD
- **หัวตาราง**: เดือน 1-12 (มค.-ธค.) แต่ละเดือนมีคอลัมน์ย่อย: **HAD**, **Non-HAD**, **รวม** + คอลัมน์ **รวมทั้งหมด** (HAD, Non-HAD)
- **6 แถว** (error types): Prescription, Dispensing, Pre-Administration, Administration, Processing, Transcribing
- **1 แถวผลรวม** (ผลรวม)
- ข้อมูลมาจาก `errorCounts` filter `ward_group = 'IPD'`

#### 5.2.4 TABLE B — OPD
- โครงสร้างเหมือน TABLE A ทุกประการ
- ข้อมูลมาจาก `errorCounts` filter `ward_group = 'OPD'`

#### 5.2.5 TABLE C — Summary (คำนวณ client-side)
- **4 sections** แสดงต่อกัน (IPD → IPD-HAD → OPD → OPD-HAD)
- แต่ละ section: 6 แถว (error types) × 12 เดือน (ตามลำดับปีงบ: ตค.-กย.)
- ค่าแต่ละเซลล์ = `(count × 1000 / volume).toFixed(2)`
- ถ้า volume = 0 → แสดง `0.00`

#### 5.2.6 Export Excel
- ใช้ `xlsx` library (เดียวกับ reports อื่น)
- สร้าง workbook ที่มี 4 sheets:
  - Sheet 1: TABLE 0 (ข้อมูลปริมาณ)
  - Sheet 2: TABLE A (IPD errors)
  - Sheet 3: TABLE B (OPD errors)
  - Sheet 4: TABLE C (Summary rates)

#### 5.2.7 Styling
- ใช้ `StyledTableCell` แบบเดียวกับ ReportSummary9
- สี header แยกตาม section:
  - TABLE 0 = `primary.main` (น้ำเงิน)
  - TABLE A (IPD) = `#4f46e5` (indigo)
  - TABLE B (OPD) = `#0d9488` (teal)
  - TABLE C = `#ed6c02` (orange)
- ตาราง scroll horizontally (Scrollbar component)

---

### 5.3 [MODIFY] `frontend/src/pages/ReportPage.js`

- เพิ่ม `import ReportSummary10 from '../sections/reports/ReportSummary10'`
- เพิ่ม Tab ใหม่ value=`"10"`:
  ```jsx
  <Tab
    label={
      <Stack direction="row" alignItems="center" spacing={1}>
        <span>สถิติจำนวนใบสั่งยา/วันนอน</span>
        <Chip label="New" color="error" size="small" ... />
      </Stack>
    }
    value="10"
  />
  ```
- เพิ่ม `<TabPanel value="10"><ReportSummary10 /></TabPanel>`

---

## 6. Data Flow

```
User เลือกปีงบ 2567
       ↓
Frontend: GET /reports/summary10?fiscalYear=2567
       ↓
Backend: แปลง 2567 → ค.ศ. → ช่วง 2023-10-01 ถึง 2024-09-30
       ↓
  ┌──────────────────────────────────────────────────┐
  │  Query 1: med_error_stat_volume (TABLE 0)        │
  │  → 12 rows (ตค.23 – กย.24)                       │
  │                                                  │
  │  Query 2: med_error JOIN med_error_dept           │
  │  → GROUP BY error_type, month, year, ward_group  │
  │  → แยก had_count, non_had_count                  │
  └──────────────────────────────────────────────────┘
       ↓
Frontend: ได้ { statVolume: [...], errorCounts: [...] }
       ↓
  ┌──────────────────────────────┐
  │  TABLE 0: แสดง statVolume    │ ← admin กรอก/แก้ไขได้
  │  TABLE A: filter IPD         │ ← จาก errorCounts
  │  TABLE B: filter OPD         │ ← จาก errorCounts
  │  TABLE C: คำนวณ client-side  │ ← จาก TABLE 0 + A/B
  └──────────────────────────────┘
```

---

## 7. File Change Summary

| ไฟล์ | เปลี่ยนแปลง | ขนาด |
|------|------------|------|
| `backend/sql/create_med_error_stat_volume.sql` | **NEW** | ~15 lines |
| `backend/src/Interfaces/ReportInterface.ts` | **MODIFY** | +30 lines |
| `backend/src/models/ReportModel.ts` | **MODIFY** | +80 lines |
| `backend/src/routes/ReportRoute.ts` | **MODIFY** | +150 lines |
| `frontend/src/libs/MedError.js` | **MODIFY** | +20 lines |
| `frontend/src/sections/reports/ReportSummary10.js` | **NEW** | ~800 lines |
| `frontend/src/pages/ReportPage.js` | **MODIFY** | +15 lines |

**รวม**: ~1,100 lines เพิ่ม, 7 ไฟล์

---

## 8. Verification Plan

### 8.1 Automated
- TypeScript compile: `cd backend && npx tsc --noEmit`
- Frontend build: `cd frontend && npm run build`

### 8.2 Manual
1. ✅ สร้างตาราง `med_error_stat_volume` ใน database
2. ✅ รัน dev server → ไปหน้ารายงาน → เห็น Tab ใหม่
3. ✅ Login admin (rule=9) → กรอก TABLE 0 → บันทึก → refresh → ข้อมูลยังอยู่
4. ✅ Login user ปกติ → TABLE 0 เป็น read-only, ไม่มีปุ่มบันทึก
5. ✅ ตรวจ TABLE A (IPD) / TABLE B (OPD) ว่าข้อมูลตรงกับ med_error
6. ✅ ตรวจ TABLE C ว่าสูตรคำนวณถูกต้อง (ลองเทียบกับ Excel ต้นฉบับ)
7. ✅ Export Excel ได้ครบ 4 sheets
