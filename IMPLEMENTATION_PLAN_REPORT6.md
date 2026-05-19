# Implementation Plan: รายงานสรุปอุบัติการณ์ที่ได้ RCA แล้ว

> **Report**: ReportSummary6  
> **Tab value**: `"6"` (uncomment จาก ReportPage.js)  
> **Version**: 1.1  
> **Date**: 2026-05-19  
> **Status**: 🔶 Pending Review

---

## 1. ภาพรวม

สร้างรายงานใหม่ **ReportSummary6** — สรุปอุบัติการณ์ Medication Error **เฉพาะที่ได้รับการ RCA แล้ว** (`is_rca = 'Y'`)

ออกแบบให้แสดงข้อมูลที่ **นำไปวิเคราะห์ต่อได้** เช่น แนวโน้มเวลาจากเกิดเหตุ → RCA สำเร็จ, สรุปตามประเภท Error, ระดับความรุนแรง, HAD vs Non-HAD, สาเหตุ (root cause)

---

## 2. ข้อมูล RCA ในระบบ

| Field | Type | คำอธิบาย |
|-------|------|---------|
| `is_rca` | `'Y' \| 'N'` | สถานะ RCA |
| `rca_text` | `string` | รายละเอียด Root Cause Analysis |
| `rca_by` | `string` | ชื่อผู้ทำ RCA |
| `updated_rca` | `datetime` | วันเวลาที่ทำ RCA |

---

## 3. ReportSummary6 — การออกแบบ

### 3.1 Filter Section

| ตัวกรอง | รายละเอียด |
|---------|-----------|
| **ช่วงวันที่** | `error_date` — DatePicker เริ่มต้น/สิ้นสุด (default = ต้นปีงบ – วันนี้) |
| **ประเภท Error** | Dropdown: "ทั้งหมด" + 6 ประเภท (Prescription, Dispensing, Pre-Admin, Admin, Processing, Transcribing) |
| **ปุ่ม Export Excel** | Export ทั้ง summary + ตาราง |

> **หมายเหตุ**: ไม่มี filter สถานะ RCA เพราะรายงานนี้แสดงเฉพาะ `is_rca = 'Y'` เท่านั้น

---

### 3.2 Dashboard Analytics (Summary Section)

แถบสรุปข้อมูลเชิงวิเคราะห์ แสดง **6 cards** ด้านบน:

| # | Card | ข้อมูล | สี | Icon |
|---|------|-------|-----|------|
| 1 | **จำนวน RCA ทั้งหมด** | จำนวน records ที่ `is_rca = 'Y'` ในช่วงวันที่ | primary (teal) | 📋 clipboard |
| 2 | **ระดับ E ขึ้นไป (ถึงตัวผู้ป่วย)** | จำนวนที่ `error_level IN ('E','F','G','H','I')` | error (แดง) | ⚠️ alert |
| 3 | **High Alert Drugs (HAD)** | จำนวนที่ `error_alert = 'High Alert Drugs'` | warning (ส้ม) | 💊 pill |
| 4 | **เวลาตอบสนอง RCA เฉลี่ย** | ค่าเฉลี่ย (วัน) ระหว่าง `error_date` → `updated_rca` | info (ฟ้า) | ⏱️ clock |
| 5 | **ประเภท Error ที่พบบ่อยสุด** | error_type_name ที่มี count สูงสุด | secondary (ม่วง) | 📊 chart |
| 6 | **หน่วยงานที่พบบ่อยสุด** | error_ward_name ที่มี count สูงสุด | default (เทา) | 🏥 building |

---

### 3.3 ตารางรายละเอียด (เฉพาะ `is_rca = 'Y'`)

ตาราง MUI พร้อม pagination, sorting, search:

| # | คอลัมน์ | Field | คำอธิบาย | จุดเด่นเชิงวิเคราะห์ |
|---|---------|-------|---------|---------------------|
| 1 | ลำดับ | — | running number | — |
| 2 | วันที่เกิดเหตุ | `error_date` | วัน/เดือน/ปี พ.ศ. | **เวลาเกิดเหตุ** |
| 3 | เวลา | `error_time` | เวลา HH:MM | **ช่วงเวลาที่เกิดปัญหาบ่อย** |
| 4 | สถานที่เกิดเหตุ | `error_ward_name` | หน่วยงาน | **หน่วยงานที่ต้องเฝ้าระวัง** |
| 5 | เหตุการณ์ | `error_event` | เหตุการณ์ที่พบ | **เหตุการณ์ที่เกิดซ้ำ** |
| 6 | ระดับความรุนแรง | `error_level` | A–I + สีตาม severity | **ระดับที่ต้องเฝ้าระวัง** |
| 7 | ประเภท Error | `error_type_name` | ชื่อประเภท | **แยกกลุ่มปัญหา** |
| 8 | รายละเอียด Error | `error_type_detail` | รายละเอียดย่อย | **ระบุปัญหาเจาะจง** |
| 9 | วิเคราะห์สาเหตุ | `error_analysis` | สาเหตุเบื้องต้น | **Root Cause Pattern** |
| 10 | HAD | `error_alert` | HAD / Non-HAD | **ยาเสี่ยงสูง** |
| 11 | การแก้ไขเบื้องต้น | `error_clear` | มาตรการแก้ไข | **แนวทางแก้ปัญหา** |
| 12 | แพทย์ผู้สั่ง | `error_doctor` | ชื่อแพทย์ | — |
| 13 | **รายละเอียด RCA** | `rca_text` | ข้อความ RCA | **ข้อสรุป Root Cause** |
| 14 | **RCA โดย** | `rca_by` | ชื่อผู้ทำ RCA | — |
| 15 | **วันที่ RCA** | `updated_rca` | วัน/เดือน/ปี เวลา | **ติดตามความเร็ว RCA** |
| 16 | **ระยะเวลา (วัน)** | คำนวณ | `updated_rca - error_date` | **KPI ความเร็วตอบสนอง** |
| 17 | ผู้บันทึก | `error_user_name` | ชื่อผู้รายงาน | — |

#### Styling ตาราง
- **แถว**: severity สีตาม error_level
  - A–D = พื้นเขียวอ่อน `#e8f5e9` (ไม่ถึงผู้ป่วย / ไม่รุนแรง)
  - E–F = พื้นเหลืองอ่อน `#fff8e1` (อันตรายชั่วคราว)
  - G–I = พื้นแดงอ่อน `#ffebee` (อันตรายถาวร / เสียชีวิต)
- **คอลัมน์ ระดับความรุนแรง**: Chip สีตาม level
- **คอลัมน์ HAD**: HAD = Chip สีส้ม, Non-HAD = Chip สีเทา
- **คอลัมน์ ระยะเวลา**: สีเขียวถ้า ≤ 7 วัน, เหลืองถ้า ≤ 30 วัน, แดงถ้า > 30 วัน
- **คอลัมน์ รายละเอียด RCA**: แสดง tooltip เมื่อ hover (เพราะอาจยาว)

---

### 3.4 คุณค่าเชิงวิเคราะห์ของรายงานนี้

| มิติการวิเคราะห์ | ข้อมูลที่ใช้ | ผลลัพธ์ |
|----------------|------------|--------|
| **แนวโน้มเวลา** | error_date + error_time | ดูว่าช่วงเวลาไหน/เดือนไหนเกิดบ่อย |
| **หน่วยงานเสี่ยง** | error_ward_name | ระบุหน่วยงานที่ต้อง intervention |
| **ประเภทปัญหาหลัก** | error_type + error_type_detail | จัดลำดับปัญหาเพื่อวางแผนป้องกัน |
| **Root Cause Pattern** | error_analysis + rca_text | ดูว่า root cause ซ้ำกันไหม → systemic issue |
| **ยาเสี่ยงสูง** | error_alert (HAD) | ติดตาม HAD ที่เกิดปัญหาบ่อย |
| **ความเร็ว RCA** | ระยะเวลา (error_date → updated_rca) | KPI: RCA เสร็จภายในกี่วัน |
| **ความรุนแรง** | error_level | ดูสัดส่วน E+ (ถึงผู้ป่วย) vs ต่ำกว่า |
| **มาตรการแก้ไข** | error_clear | ดู pattern การแก้ปัญหาที่ใช้ |

---

## 4. Backend Changes

### 4.1 [MODIFY] `backend/src/models/ReportModel.ts`

เพิ่ม 1 method:

#### `getReportSummary6(options)`

```typescript
async getReportSummary6(options: {
    dateStart: string;
    dateEnd: string;
    errorType?: number;  // 0 = ทั้งหมด
}) {
    let query = this.db('med_error as me')
        .select(
            'me.error_id', 'me.error_section',
            this.db.raw("CONCAT(me.error_date, '') as error_date"),
            'me.error_time',
            'me.error_ward_name', 'me.error_event',
            'me.error_level', 'me.error_level_detail',
            'me.error_clear',
            'me.error_analysis',
            'me.error_type', 'me.error_type_name',
            'me.error_alert',
            'me.error_doctor',
            'me.error_user_name',
            'me.is_rca', 'me.rca_text', 'me.rca_by',
            this.db.raw('CONCAT(me.updated_rca) as updated_rca'),
            // error_type_detail (CASE WHEN)
            this.db.raw(`
                CASE me.error_type
                    WHEN 1 THEN me.error_prescription
                    WHEN 2 THEN me.error_dispensing
                    WHEN 3 THEN me.error_pre_administration
                    WHEN 4 THEN me.error_adminstration
                    WHEN 5 THEN me.error_processing
                    WHEN 6 THEN me.error_transcribing
                    ELSE ''
                END AS error_type_detail
            `),
            // ระยะเวลา RCA (วัน)
            this.db.raw('DATEDIFF(me.updated_rca, me.error_date) as rca_days')
        )
        .where('me.is_rca', 'Y')
        .where('me.app_new', 'Y')
        .whereBetween('me.error_date', [options.dateStart, options.dateEnd])
        .orderBy('me.error_date', 'desc');

    if (options.errorType && options.errorType > 0) {
        query = query.where('me.error_type', options.errorType);
    }

    return query;
}
```

**หมายเหตุ**: `DATEDIFF(updated_rca, error_date)` คำนวณระยะเวลา RCA เป็นวัน ที่ฝั่ง SQL เลย

---

### 4.2 [MODIFY] `backend/src/routes/ReportRoute.ts`

เพิ่ม 1 endpoint:

| Method | Path | คำอธิบาย |
|--------|------|---------|
| `GET` | `/reports/summary6?dateStart=...&dateEnd=...&errorType=0` | ดึงข้อมูลอุบัติการณ์ที่ RCA แล้ว |

#### Response format:

```json
{
    "statusCode": 200,
    "data": [
        {
            "error_id": 123,
            "error_date": "2026-01-15",
            "error_time": "14:30",
            "error_ward_name": "จุด screening IPD",
            "error_event": "จ่ายยาผิดขนาด",
            "error_level": "C",
            "error_type": 2,
            "error_type_name": "Dispensing Error",
            "error_type_detail": "2.3 จ่ายยาผิดความแรง",
            "error_analysis": "Human error",
            "error_alert": "ไม่ใช่ High Alert Drugs",
            "error_clear": "แจ้งเภสัชกรแก้ไข",
            "error_doctor": "นพ.xxx",
            "error_user_name": "ปัสร หวานอารมย์",
            "is_rca": "Y",
            "rca_text": "สาเหตุจากยาชื่อคล้ายกัน...",
            "rca_by": "ปัสร หวานอารมย์",
            "updated_rca": "2026-01-20 10:00:00",
            "rca_days": 5
        }
    ],
    "summary": {
        "total": 85,
        "levelEPlus": 12,
        "hadCount": 8,
        "avgRcaDays": 4.5,
        "topErrorType": "Dispensing Error",
        "topWard": "จุด screening IPD"
    }
}
```

> `summary` คำนวณจาก data ใน route handler ก่อน return (ไม่ต้อง query เพิ่ม)

---

## 5. Frontend Changes

### 5.1 [MODIFY] `frontend/src/libs/MedError.js`

เพิ่ม 1 function:

```javascript
export function getReportSummary6(token, params) {
    const { dateStart, dateEnd, errorType = 0 } = params;
    return axios({
        method: 'GET',
        url: `${API_ROUTE.REPORT_MEDERROR}/summary6?dateStart=${dateStart}&dateEnd=${dateEnd}&errorType=${errorType}`,
        headers: authHeader(token),
    });
}
```

---

### 5.2 [NEW] `frontend/src/sections/reports/ReportSummary6.js`

Component ใหม่ (~600 lines):

#### 5.2.1 Filter Section
- **DatePicker ×2**: เริ่มต้น / สิ้นสุด (default = ต้นปีงบ – วันนี้)
- **Dropdown ประเภท Error**: "ทั้งหมด" + 6 ประเภท
- **ปุ่ม Export Excel**

#### 5.2.2 Summary Cards (6 cards ใน Grid 2×3)
- คำนวณ client-side จาก data ที่ได้จาก API
- แต่ละ card แสดง: icon + label + ค่า + สี accent

#### 5.2.3 ตาราง 17 คอลัมน์ (ตาม 3.3)
- Pagination (25 rows/page default)
- Sort ได้ทุกคอลัมน์ (default = error_date DESC)
- Search text (ค้นหาตามเหตุการณ์, หน่วยงาน, rca_text, ผู้บันทึก)
- Scrollbar horizontal
- สีแถวตาม severity level (เขียว/เหลือง/แดง)
- RCA text แสดง tooltip (Tooltip component) เมื่อ hover

#### 5.2.4 Excel Export
- Sheet 1: "สรุป RCA" — Summary cards data
- Sheet 2: "รายละเอียด RCA" — ตารางทั้งหมด (17 คอลัมน์)

---

### 5.3 [MODIFY] `frontend/src/pages/ReportPage.js`

- เพิ่ม `import ReportSummary6`
- Uncomment Tab `value="6"`:
  ```jsx
  <Tab label="สรุปอุบัติการณ์ที่ได้ RCA แล้ว" value="6" />
  ```
- เพิ่ม `<TabPanel value="6"><ReportSummary6 /></TabPanel>`

---

## 6. File Change Summary

| ไฟล์ | เปลี่ยนแปลง | ขนาด |
|------|------------|------|
| `backend/src/models/ReportModel.ts` | **MODIFY** — เพิ่ม 1 method | +40 lines |
| `backend/src/routes/ReportRoute.ts` | **MODIFY** — เพิ่ม 1 endpoint | +80 lines |
| `frontend/src/libs/MedError.js` | **MODIFY** — เพิ่ม 1 function | +10 lines |
| `frontend/src/sections/reports/ReportSummary6.js` | **NEW** — Component หลัก | ~600 lines |
| `frontend/src/pages/ReportPage.js` | **MODIFY** — Uncomment tab + import | +10 lines |

**รวม**: ~740 lines เพิ่ม, 5 ไฟล์

---

## 7. Verification Plan

### 7.1 Automated
- TypeScript compile: `cd backend && npx tsc --noEmit`
- Frontend build: `cd frontend && npm run build`

### 7.2 Manual
1. ✅ เห็น Tab "สรุปอุบัติการณ์ที่ได้ RCA แล้ว" ในหน้ารายงาน
2. ✅ เลือกช่วงวันที่ → แสดงเฉพาะรายการที่ `is_rca = 'Y'`
3. ✅ กรองประเภท Error → ตารางแสดงเฉพาะ type ที่เลือก
4. ✅ Summary Cards 6 ใบแสดงค่าถูกต้อง
5. ✅ สีแถวตาม severity (เขียว=A-D, เหลือง=E-F, แดง=G-I)
6. ✅ คอลัมน์ "ระยะเวลา" แสดงจำนวนวัน + สีตามเกณฑ์
7. ✅ Tooltip แสดง rca_text เต็มเมื่อ hover
8. ✅ Export Excel ครบ 2 sheets (สรุป + รายละเอียด)
9. ✅ Sort, Search, Pagination ทำงานถูกต้อง

---

## 8. Open Questions

> ต้องการ feedback:

1. **คอลัมน์** — ครบตามที่ต้องการหรือต้องเพิ่ม/ตัดอะไร?
2. **Summary Cards** — 6 cards เพียงพอหรือไม่?
3. **เกณฑ์ระยะเวลา RCA** — ≤7 วัน (เขียว), ≤30 วัน (เหลือง), >30 วัน (แดง) เหมาะสมไหม?
4. **สิทธิ์** — ทุก user เห็นรายงาน RCA ได้ หรือเฉพาะ admin?
