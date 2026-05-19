# Skill: ReportSummary Implementation Workflow

> วิธีทำงานมาตรฐานเวลาเพิ่ม / ปรับปรุงรายงาน (Report Summary*) ของโปรเจกต์นี้
> ใช้ทุกครั้งเมื่อ user สั่ง: "ทำตาม IMPLEMENTATION_PLAN_REPORT*.md"
>
> **Stack**: Elysia + Knex + MariaDB (backend) / React 18 + MUI v5 + xlsx (frontend), Bun runtime

---

## 0. Pre-flight (ก่อนเริ่มเขียนโค้ด)

1. อ่าน **IMPLEMENTATION_PLAN_REPORT*.md** ทั้งไฟล์ — ดู spec data fields, summary cards, table columns, filter, export
2. ใช้ `TodoWrite` แตกงานเป็น step-by-step ตามลำดับ 1→7 ด้านล่าง
3. ตรวจไฟล์ที่จะแก้: `ReportInterface.ts`, `ReportModel.ts`, `ReportRoute.ts`, `MedError.js`, `ReportSummary{N}.js`, `ReportPage.js`, `CHANGELOG.md` × 2, `README.md` × 3, `package.json` × 2
4. อ่าน **report ที่ใกล้เคียงล่าสุด** (เช่น ReportSummary10) เป็น reference pattern — อย่าคิดใหม่ตั้งแต่ต้น

---

## 1. Backend — Interface

ไฟล์: `backend/src/Interfaces/ReportInterface.ts`

เพิ่ม:
- `GetMedErrorSummary{N}Options` — query params (dateStart/dateEnd/errorType/etc., ใช้ `string | number` ถ้ามาจาก URL)
- `Summary{N}Row` — shape ของ row ที่ return (optional, ช่วย IDE)
- `Summary{N}Stats` — shape ของ aggregate summary (ถ้ามี dashboard cards)

---

## 2. Backend — Model

ไฟล์: `backend/src/models/ReportModel.ts`

- เพิ่ม method `getReportSummary{N}(options)`
- **ใช้ knex query builder ทั้งหมด** — `this.db.raw(...)` เฉพาะกรณี SQL pattern (CONCAT, DATEDIFF, CASE WHEN) ที่ knex ไม่รองรับ
- **อย่า string-concat user input ใน raw SQL** — ถ้าต้องใช้ ให้ส่ง `[bindings]` แทน (`this.db.raw('? AND ?', [a, b])`)
- ใช้ `whereBetween('me.error_date', [dateStart, dateEnd])` — knex bind ให้อัตโนมัติ
- ใช้ `CASE me.error_type WHEN 1 THEN me.error_prescription ... ELSE '' END AS error_type_detail` สำหรับ field ที่ขึ้นกับ type
- ใช้ `DATEDIFF(updated_rca, error_date) AS rca_days` ถ้าต้องคำนวณช่วงวันที่ — ทำที่ SQL เร็วกว่า JS
- เพิ่ม `import { GetMedErrorSummary{N}Options } from '../Interfaces/ReportInterface'`

---

## 3. Backend — Route

ไฟล์: `backend/src/routes/ReportRoute.ts`

**Standard endpoint template** (ใส่ก่อน `/summary{N+1}` หรือใช้ `authGate` helper สำหรับ Summary 10+):

```ts
ReportRoute.get('/summary{N}', async ({ jwt, set, request, query }) => {
  try {
    const headers = request.headers;
    const { dateStart, dateEnd, errorType } = query as GetMedErrorSummary{N}Options;
    const token = readAuthTokenFromHeaders(headers);
    const clientId = headers.get('client-id');
    let originAllow = headers.get('origin');
    if (!originAllow) {
      const referer = headers.get('referer');
      if (referer) { try { originAllow = new URL(referer).origin; } catch {} }
    }

    // ลำดับ Gate: origin → client-id → token → JWT verify → input validate → business
    if (!originAllow || !ALLOWED_ORIGINS.has(originAllow)) return forbid(set, 'origin');
    if (!clientId || !ALLOWED_CLIENTS.has(clientId)) return forbid(set, 'client');
    if (!token) return unauth(set, 'missing token');
    const payload = await jwt.verify(token);
    if (!payload) return unauth(set, 'verify failed');

    // Input validation — regex/range/enum, ก่อนเข้า model
    const isYMD = (s: any) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
    if (!isYMD(dateStart) || !isYMD(dateEnd)) return badRequest(set, 'dateStart/dateEnd must be YYYY-MM-DD');
    if (dateStart > dateEnd) return badRequest(set, 'dateStart must be <= dateEnd');

    const reportList = await reports.getReportSummary{N}({ dateStart, dateEnd, errorType });

    // Aggregate summary (ถ้ามี) — ทำใน route ไม่ query เพิ่ม
    const summary = buildSummary(reportList);

    set.status = StatusCodes.OK;
    return { statusCode: StatusCodes.OK, reportList, summary };
  } catch (error) {
    console.error('[Report] summary{N} error');  // อย่า log error.message — กัน leak
    set.status = StatusCodes.INTERNAL_SERVER_ERROR;
    return { statusCode: StatusCodes.INTERNAL_SERVER_ERROR, statusMessage: getReasonPhrase(StatusCodes.INTERNAL_SERVER_ERROR) };
  }
});
```

**Security checklist** ของ route ทุกตัว:
- [x] Origin allowlist
- [x] client-id allowlist
- [x] JWT verify
- [x] Validate รูปแบบ input ก่อนเข้า DB (regex YYYY-MM-DD, integer range, enum)
- [x] Error response ไม่มี `error.message` / stack trace

---

## 4. Frontend — API client

ไฟล์: `frontend/src/libs/MedError.js`

- เพิ่ม 1 บรรทัดด้วย factory ที่มีอยู่:
  ```js
  export const getReportSummary{N} = buildReportSummary('summary{N}');
  ```
- ถ้ามี extra params ที่ต้องส่งแม้ว่าค่าว่าง → เขียน function แบบ summary8 (ใช้ `URLSearchParams`)

---

## 5. Frontend — Section component

ไฟล์ใหม่: `frontend/src/sections/reports/ReportSummary{N}.js`

**Standard structure** (ดู ReportSummary10 / ReportSummary6 เป็น reference):

```js
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
// MUI imports...
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { th } from 'date-fns/locale';
import Iconify from '../../components/iconify';
import Scrollbar from '../../components/scrollbar';
import { getReportSummary{N} } from '../../libs/MedError';
import { verifyToken } from '../../libs/Auth';
import { formatDateTime, formatDateEN } from '../../utils/formatTime';

// 1. Constants — ERROR_TYPES, SEVERITY_COLORS, COLUMNS
// 2. Styled cells (StyledHeadCell, BodyCell)
// 3. Sub-components (StatCard, RcaDaysChip, etc.)
// 4. Main component:
//    - filter state (firstDate / lastDate / errorType)
//    - data + summary state
//    - search / orderBy / order / page / rowsPerPage
//    - loadReport = useCallback — fetch + setData/setSummary
//    - useEffect: verifyToken → setToken → loadReport
//    - triggerLoad(nextFirst, nextLast, nextType) — call เมื่อ filter เปลี่ยน
//    - useMemo: filtered (search) → sorted → paged
//    - handleSort / handleExportExcel
//    - render: <Card filter> + <Grid summary cards> + <TableContainer>
```

**Best practices**:
- ใช้ `useMemo` สำหรับ filter/sort/paginate — re-render ฟรีเมื่อ filter เปลี่ยน
- ใช้ `useCallback` สำหรับ async functions ที่ส่งให้ child
- **เรียก triggerLoad ทันทีเมื่อ user เปลี่ยน DatePicker / Dropdown** — debounce ไม่จำเป็นสำหรับ click-level interactions
- Reset `page = 0` ทุกครั้งที่ filter เปลี่ยน — กัน edge case แสดงหน้าเปล่า
- Excel export ใช้ `sorted` (หลัง filter, ก่อน paginate) ไม่ใช่ `paged` — user คาด export ทั้งหมด
- Severity bg color: A-D = `#e8f5e9`, E-F = `#fff8e1`, G-I = `#ffebee`
- Chip: A-D = `success`, E-F = `warning`, G-I = `error`
- HAD = `Chip color="warning"`, Non-HAD = `Chip variant="outlined"`
- Long text columns ห่อด้วย `<Tooltip arrow placement="top">` + `noWrap` ellipsis

---

## 6. Frontend — Page wire-up

ไฟล์: `frontend/src/pages/ReportPage.js`

- `import ReportSummary{N} from '../sections/reports/ReportSummary{N}'`
- เพิ่ม `<Tab>` (พร้อม Chip "New" ถ้าเป็น report ใหม่) ใน `<TabList>`
- เพิ่ม `<TabPanel value="{N}"><ReportSummary{N} /></TabPanel>`

---

## 7. Verification — Type check, Lint, Build

```bash
# Backend type check (ไม่ต้องสน optional-driver errors ของ knex pg/sqlite/mssql)
cd backend && bunx tsc --noEmit --skipLibCheck

# Frontend lint เฉพาะไฟล์ที่แก้ — warnings PropTypes ถือว่ารับได้ (codebase ทั้งหมดเป็นแบบนี้)
cd frontend && npx eslint src/sections/reports/ReportSummary{N}.js src/pages/ReportPage.js src/libs/MedError.js
```

**Acceptable**: warnings `react/prop-types` / `no-unused-vars`
**Not acceptable**: errors เกี่ยวกับ syntax, missing imports, undefined variables

---

## 8. Docs — CHANGELOG + README + version bump

**บังคับทำทุกครั้ง** (user ขอชัดเจน):

1. `backend/package.json` — bump version (minor)
2. `frontend/package.json` — bump version (minor)
3. `backend/CHANGELOG.md` — เพิ่ม entry ใหม่ด้านบน: `## [x.y.z] - YYYY-MM-DD` พร้อม `### Added`, `### Security`, `### Performance` (ถ้ามี)
4. `frontend/CHANGELOG.md` — เพิ่ม entry ใหม่ — เน้น UX/UI features (Summary cards, Table behavior, Excel export)
5. `README.md` (root) — อัพเดทเลข version + endpoint list
6. `backend/README.md` — อัพเดท Features bullet + Endpoints list
7. `frontend/README.md` — อัพเดท Features bullet (ใส่เวอร์ชันที่เพิ่ม feature เข้า)

**Convention**:
- Date = วันนี้ (เช็คจาก env / system context)
- Summary bullet ต้อง action-oriented ("เพิ่ม endpoint X — return Y") ไม่ใช่ "Endpoint X added"
- รวม security section อย่างน้อย 2-3 บรรทัดอธิบาย validation/sanitization ที่ทำ

---

## 9. Commit + Push

```bash
git status              # ดู untracked + modified
git diff                # ดู changes
git log -3              # ดู style ของ commit message ในโปรเจกต์
git add <specific files>  # อย่าใช้ git add -A (กัน .env / .key)
git commit -m "..."     # ใช้ HEREDOC, รวม Co-Authored-By
git push                # ถาม user ก่อนถ้าไม่มี durable instruction ว่าให้ push ได้
```

**Commit message pattern** (ดูประวัติ):
- `feat: ReportSummary{N} (สรุปอุบัติการณ์ที่ได้ RCA แล้ว) + analytics summary + 17-col table`
- `feat: add SQL migration and backend interfaces for ReportSummary{N}` (ถ้าแยก commit)
- ภาษาผสมไทย-อังกฤษ OK — ตามที่โปรเจกต์ใช้

**ห้าม**:
- `--no-verify` (ข้าม hook)
- `git add .` หรือ `git add -A`
- amend commit ที่ push ไปแล้ว
- push --force ไป main

---

## 10. Common pitfalls

| Pitfall | วิธีหลีกเลี่ยง |
|---------|---------------|
| ใช้ `useEffect` ที่ลืม dep array → infinite loop | ใส่ `// eslint-disable-next-line react-hooks/exhaustive-deps` ถ้าตั้งใจ run ครั้งเดียว |
| `formatDateEN(null)` คืน `'NaN-NaN-NaN'` | เช็ค `if (!firstDate \|\| !lastDate) return;` ก่อนเรียก |
| Excel export ใช้ `paged` แทน `sorted` | ใช้ `sorted` เสมอ — user คาดได้ทั้งหมดหลัง filter |
| Backend route ลืม validate format ก่อน knex | regex check ทุก date param `^\d{4}-\d{2}-\d{2}$` |
| `error.message` หลุดออก response | catch แล้ว return generic message + log แค่ tag (`[Report] summary{N} error`) |
| ลืม bump version หลังเพิ่ม feature | ทำ step 8 เสมอ — user สั่งแล้ว |
| ลืม uncomment Tab ใน ReportPage หลังสร้าง section | step 6 — เช็ค `<Tab value="{N}" />` + `<TabPanel value="{N}" />` |

---

## 11. Files cheat-sheet

```
backend/
├─ src/
│  ├─ Interfaces/ReportInterface.ts        ← เพิ่ม interface
│  ├─ models/ReportModel.ts                 ← เพิ่ม method
│  └─ routes/ReportRoute.ts                 ← เพิ่ม endpoint
├─ CHANGELOG.md                              ← เพิ่ม entry
├─ README.md                                 ← อัพเดท features + endpoints
└─ package.json                              ← bump version

frontend/
├─ src/
│  ├─ libs/MedError.js                       ← เพิ่ม export
│  ├─ sections/reports/ReportSummary{N}.js   ← สร้างไฟล์
│  └─ pages/ReportPage.js                    ← เพิ่ม Tab + TabPanel
├─ CHANGELOG.md                              ← เพิ่ม entry
├─ README.md                                 ← อัพเดท features
└─ package.json                              ← bump version

(root)
└─ README.md                                 ← อัพเดทเลข version + endpoints
```
