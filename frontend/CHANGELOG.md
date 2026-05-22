# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.23.0] - 2026-05-22

### Added — หน้าจัดการเกณฑ์ Likelihood แยกตามประเภท Error (6 ตาราง)
- **LikelihoodCriteriaPage** ([frontend/src/pages/LikelihoodCriteriaPage.js](frontend/src/pages/LikelihoodCriteriaPage.js))
  - เปลี่ยนจาก 3 แท็บ (Group) เป็น **6 แท็บตามประเภท Error** (Prescription / Dispensing / Pre-Administration / Administration / Processing / Transcribing) — แต่ละประเภทมีเกณฑ์ความถี่ของตัวเอง
  - `ERROR_TYPE_CONFIG` (6 สี/gradient แยกประเภท) แทน `GROUP_CONFIG`; group ข้อมูลด้วย `error_type` แทน `group_id`
  - Tabs เป็น `variant="scrollable"` + scroll buttons รองรับ 6 แท็บบนจอแคบ; label กระชับ (ชื่อ EN + ประเภทที่ N + คำอธิบายไทย)
  - validation ช่วงคะแนน (gap/overlap/missing) + visual range bar + บันทึกรวมทุกประเภทในปุ่มเดียว ทำงานครบ 6 ประเภท

### Security
- A03:2021 Injection — render ผ่าน React (escape อัตโนมัติ) ไม่มี `dangerouslySetInnerHTML`
- ค่าที่กรอกผ่าน `Math.max(0, n)` กันค่าลบ/NaN ก่อนส่ง backend (เช็คซ้ำที่ backend อีกชั้น)

## [1.22.1] - 2026-05-21

### Fixed — Logout ไม่ล้าง HTTP-only cookie จริง
- **Header logout button** ([frontend/src/layouts/dashboard/header/index.js](frontend/src/layouts/dashboard/header/index.js))
- **NotificationsPopover logout button** ([frontend/src/layouts/dashboard/header/NotificationsPopover.js](frontend/src/layouts/dashboard/header/NotificationsPopover.js))
- Root cause: หลัง migrate มา HTTP-only cookie (v1.13.0+) ปุ่ม logout ทั้ง 2 จุดยังเรียก `localStorage.removeItem('access_token')` + `navigate('/login')` เท่านั้น — ไม่ได้ยิง `POST /auth/logout` ทำให้ cookie ฝั่ง backend ค้าง → กด back / เข้า URL dashboard ตรง ๆ ยังเข้าได้ → ผู้ใช้รายงานว่า "logout ไม่ออก"
- Fix: เปลี่ยน `handleConfirmLogout` ให้ `await useAuth().logout()` ก่อน navigate — context จะเรียก `apiLogout()` → backend `clearAuthCookie()` ล้าง cookie จริง พร้อมเคลียร์ `accessToken`/`user` ใน memory state

### Security
- A07:2021 Identification & Authentication Failures — `/auth/logout` ทำงาน effective แล้ว (`Max-Age=0` ที่ backend `clearAuthCookie` + reset client state)
- ไม่แก้ logic ฝั่ง backend (`AuthRoute.ts /logout`) — control ทำงานถูกอยู่แล้ว แค่ client ไม่ได้เรียก

## [1.22.0] - 2026-05-21

### Added — Filter + table UX (Department / Officer / ErrorType)
- **DepartmentPage** ([frontend/src/pages/DepartmentPage.js](frontend/src/pages/DepartmentPage.js))
  - Filter `ประเภท (Group)` derive จากข้อมูลจริง — option แสดงชื่อกลุ่ม OPD/IPD/งานคลัง/งานผลิต/OPD2/OPD-Primary/กลับบ้าน/TPN/เคมีบำบัด
  - Filter `สถานะ` (เปิดใช้งาน N รายการ / ปิดใช้งาน N รายการ) มี count ในตัวเลือก
  - Search รองรับชื่อหน่วยงาน + รหัส (`med_error_depcode`)
  - เพิ่มคอลัมน์ `รหัส` (monospace) ในตาราง
  - แสดง "แสดง X จากทั้งหมด Y รายการ" ทาง toolbar ขวา + ปุ่ม "ล้าง filter"
- **OfficerPage** ([frontend/src/pages/OfficerPage.js](frontend/src/pages/OfficerPage.js))
  - Filter `ประเภทตำแหน่ง` (เภสัชกร / พนักงานประจำห้องยา / เจ้าพนักงานเภสัชกรรม / อื่นๆ) — derive + count
  - เพิ่มคอลัมน์ `ลำดับ` ในตาราง (ตามหน้าปัจจุบัน)
  - Counter + ปุ่ม clear filter เหมือนกันทั้งระบบ
- **ErrorTypePage** ([frontend/src/pages/ErrorTypePage.js](frontend/src/pages/ErrorTypePage.js))
  - Filter `ประเภทหลัก` (Prescription / Processing / Dispensing / Pre-Admin / Administration) derive จากข้อมูล
  - Filter `Impact` (1-5 + "ยังไม่ระบุ") — แต่ละ option มี count
  - Filter `สถานะ` (เปิดใช้งาน / ปิดใช้งาน)
  - Search รองรับชื่อประเภท + รายละเอียด Error
  - แยกคอลัมน์ `#` (เลข error_type_list, monospace) ออกจาก `รายละเอียด Error`
  - เก็บ Alert "แสดงเฉพาะรายการที่ขาด Impact" เดิมไว้ + รวมเข้ากับ clear-filter handler
- ทุกหน้า: TablePagination ปรับ label เป็นภาษาไทย (`แถวต่อหน้า:` / `X-Y จาก Z รายการ`), `count` ใช้ `filteredXxx.length` แทน `medErrorXxx.length` เพื่อให้แสดงจำนวนหลัง filter ถูกต้อง
- เลิกใช้ `UserListToolbar` ในทั้ง 3 หน้า (toolbar shared) แทนด้วย inline toolbar ของแต่ละหน้าให้ขยาย filter ได้อิสระ

### Security
- Filter เป็น client-side เท่านั้น — ไม่กระทบ data fetching / authorization
- Input ผ่าน React default escape (A03:2021 Injection) — search query ใช้ `.toLowerCase().indexOf()` ปลอดภัย
- Filter state เป็น primitive (`'all' | number | 'Y' | 'N'`) — ไม่มี user-controlled key injection

## [1.21.0] - 2026-05-21

### Added — Glass header card propagation (UI consistency)
- **DepartmentPage** — ปรับ header เป็น glass card + gradient teal text + icon (`eva:home-fill`) + sub-description ให้เหมือนหน้า Report
- **OfficerPage** — ปรับ header เป็น glass card + icon (`eva:people-fill`) + sub-description
- **AnalysisPage** — ปรับ header เป็น glass card + icon (`eva:search-fill`) + sub-description
- **ErrorTypePage** — ปรับ header เป็น glass card + icon (`eva:layers-fill`) + sub-description
- **MedErrorPage** — ปรับ header เป็น glass card สำหรับทั้ง 2 mode (รายการ / ฟอร์ม):
  - mode รายการ: icon `eva:file-text-fill` + ปุ่ม "บันทึกข้อมูล Med Error"
  - mode ฟอร์ม: icon `eva:edit-fill` + title สลับตาม `error_section` (โรงพยาบาลร้อยเอ็ด / กลุ่มงานเภสัชกรรม)
- responsive: column บน xs, row บน md ขึ้นไป (`xs: 'column', md: 'row'`)
- ทุกหน้าใช้ `guk-glass`, `guk-anim-fade-up`, `guk-gradient-text-teal` ตรงกับ ReportPage/LikelihoodCriteriaPage/DashboardAppPage

### Security
- UI presentation layer เท่านั้น — ไม่กระทบ data fetching / authorization / business rule
- XSS-safe: ทุก text rendering ผ่าน React default escape (A03:2021 Injection)

## [1.20.1] - 2026-05-21

### Added — ReportSummary9: Likelihood chip color-coded
- **LikelihoodChip** component ใน "รายงานแยกรายละเอียด Error" — แสดงคะแนน Likelihood เป็น Chip สีตามระดับความรุนแรง:
  - 5 = แดง (Frequent / เกิดบ่อยมาก)
  - 4 = ส้ม (Likely / เกิดบ่อย)
  - 3 = เหลืองอำพัน (Possible / อาจเกิด)
  - 2 = เขียวอ่อน (Unlikely / ไม่ค่อยเกิด)
  - 1 = เขียว (Rare / เกิดน้อย)
  - 0 = เทา (Never / ไม่เกิดเลย)
- Tooltip ที่ Chip แสดง label EN + ไทย เมื่อ hover
- สีตรงกับ LikelihoodCriteriaPage เพื่อความสอดคล้อง (เลขเดียวกัน สีเดียวกัน)
- null/undefined → แสดง Chip "—" แบบ outlined สีเทา

### Security
- ไม่กระทบ logic data fetching / business rule — UI presentation layer เท่านั้น
- XSS-safe rendering (React default escape)

## [1.20.0] - 2026-05-21

### Added — UX/UI Likelihood criteria + propagate auto-likelihood ทุกหน้า
- **LikelihoodCriteriaPage**: rewrite ใหม่ทั้งหน้า
  - Header glass card + gradient teal + จำนวน issue badge + ปุ่ม Save gradient
  - เปลี่ยน layout จาก 3 cards เป็น **Tabs 3 กลุ่ม** (Prescription / Processing-Pre-Admin-Transcribing / Dispensing-Admin) — หน้าสะอาด สลับกลุ่มไว ไม่ต้อง scroll ยาว
  - แต่ละ tab มี **Visual Range Bar** แสดงช่วง min–max ของแต่ละ level (color-coded ตามคะแนน) + tooltip ชี้ช่วง
  - **ScorePill** แสดงคะแนน + label EN (Frequent/Likely/Possible/Unlikely/Rare/Never) + label ไทย — ผู้ใช้เข้าใจระดับได้ทันที
  - **Validation visual feedback** — ตรวจ gap (ช่วงหาย), overlap (ช่วงทับ), missing (ยังไม่กรอก), invalid (min > max หรือ Level 5 มี max) → แสดง Alert พร้อมรายการ issue + Chip ติดที่แถวที่เกิดปัญหา + ปิดปุ่ม save ถ้ามี issue
  - ช่อง min/max มี endAdornment "ครั้ง" + Level 0 ล็อกเป็น disabled + Level 5 แสดง chip "∞ ไม่จำกัด" แทน input
  - Tab title มี badge แดงนับจำนวน issue ของกลุ่มนั้น ถ้ามี
- **ErrorTypePage**: นำ Likelihood ออก (Impact คงอยู่)
  - ลบ column "Likelihood" + popover แก้ score + FormControl ใน dialog + field ใน schema/defaultValues
  - alert "ยังไม่ได้กำหนด" เปลี่ยนเป็นพูดถึง Impact อย่างเดียว + แจ้งว่า Likelihood คำนวณอัตโนมัติจากความถี่ในรายงาน
  - FormHelperText อธิบายว่า Likelihood = auto-computed จากหน้า "เกณฑ์ Likelihood"
  - colSpan empty/notfound TableCell ลดจาก 6 → 5
- **ReportSummary9**: ปรับ messaging ให้สื่อว่า Likelihood เป็น auto
  - alert เตือนเฉพาะแถวที่ขาด **Impact** (ไม่ใช่ Likelihood) — บอกให้ไปหน้า "ข้อมูลรายละเอียดประเภท Error"
  - หัวคอลัมน์ Likelihood เพิ่ม badge "AUTO" (สื่อว่าระบบคำนวณให้)
  - Subtitle อธิบายว่า Likelihood Auto + ลิงก์โยงไปหน้า "เกณฑ์ Likelihood"
- **ReportSummary6 (RCA)**: เพิ่ม Quick date presets + restore subtitle
  - Subtitle ใต้หัวข้อแสดงช่วงเวลาที่กำลังดู + ประเภท Error (เคยเป็น comment ว่าง)
  - แถบปุ่มลัด "ช่วงเวลายอดนิยม": 7 วัน / 30 วัน / เดือนนี้ / เดือนก่อน / ปีงบประมาณ — กดครั้งเดียวยิง filter ทันที
  - ปุ่มสี teal palette + hover lift + border subtle ตาม theme หลัก

### Changed
- หน้า "ข้อมูลรายละเอียดประเภท Error" Admin ไม่ต้องตั้ง Likelihood ต่อรายการอีกแล้ว — ใช้ตั้งครั้งเดียวที่ "เกณฑ์ Likelihood" แล้วระบบคำนวณให้ทุกรายงาน

### Security
- XSS-safe rendering (React default escape) — input min/max sanitize ด้วย `parseInt + Math.max(0, ...)` ก่อน setState (กัน NaN/negative ก่อนส่ง backend)
- Backend `normalizeScore(undefined) === null` ทำให้การไม่ส่ง likelihood_score จาก frontend ไม่ทำ validation fail
- Tag-only console.error (`[LikelihoodCriteria] load error`) — ไม่ leak error object/SQL
- ห้าม admin role !== 9 เข้าหน้า → redirect /dashboard

## [1.19.1] - 2026-05-21

### Changed
- อัปเดต API_ROUTE.LIKELIHOOD ใน `constants.js` เพื่อให้ชี้ไปยัง Endpoint ใหม่ที่อยู่ภายใต้ `/api/med-error/likelihood` ให้สอดคล้องกับ Backend Refactor

## [1.19.0] - 2026-05-21

### Added — UI จัดการเกณฑ์ Likelihood และผูกกับ Report 9
- เพิ่มหน้าจอ Master Data "เกณฑ์ Likelihood" สำหรับกำหนดเกณฑ์ความถี่ของแต่ละกลุ่มประเภท Error
- ปรับปรุง ReportSummary9 ให้รองรับการแสดงผลคะแนน Likelihood ที่ส่งมาจากการคำนวณอัตโนมัติใน Backend (แทนค่าคงที่)
- เพิ่มเมนู "เกณฑ์ Likelihood" ในแถบนำทาง (nav) สำหรับ Admin (Rule 9)

## [1.18.0] - 2026-05-21

### Changed — ReportSummary6 UX/UI ปรับธีมและความสะดวก
- **Header card** เปลี่ยนเป็น glass card (ตาม Dashboard) + gradient text teal + icon badge ทรงเดียวกับ Executive Summary
- **Filter bar** แยก row ชัดเจน — Title/Export อยู่แถวบน, DatePicker + Error Type Dropdown อยู่แถวล่าง + คั่นด้วย Divider สี teal
- **StatCard 6 ใบ** ปรับใหม่ — icon Avatar เป็น rounded 14px + สี gradient ตาม palette, ขอบ card มี border/shadow ตาม palette, hover lift effect, label เป็น uppercase caption สี secondary, ค่าแสดงเป็น bold สีตาม category
- **Export Button** เปลี่ยนเป็น gradient teal ตามธีมหลัก + shadow glow
- **Search bar** ปรับ border radius 12px + focus border สี teal + icon สี teal + Chip badge แสดงจำนวนรายการแทนข้อความ plain
- **Table** ปรับ: header gradient teal (dark→main), body cell padding เพิ่มขึ้น, border-bottom สี softer, severity row bg เปลี่ยนเป็น alpha เบา ๆ, hover row เป็น teal lighter, Chip ทุกตัวเปลี่ยนเป็น borderRadius 8px
- **Loading/Empty state** เพิ่ม icon inbox + center layout สวยขึ้น
- **Paper wrapper** ปรับเป็น borderRadius 16px + subtle shadow ตามมาตรฐาน MUI v5
- **Pagination** เพิ่ม border-top separator + font-size ปรับให้อ่านง่าย
- **Tab ใน ReportPage** ย้าย "สรุปอุบัติการณ์ที่ได้ RCA แล้ว" ไปอยู่ท้ายสุด (tab สุดท้าย) ตามที่ user ปรับเอง

### Security
- ไม่เปลี่ยน logic การดึงข้อมูล / validate / filter — ปรับเฉพาะ UI presentation layer
- ยังคง XSS-safe rendering (React default escape, ไม่ใช้ dangerouslySetInnerHTML)

## [1.17.1] - 2026-05-21

### Fixed
- แก้ไขปัญหา ESLint warning ใน `ReportSummary6` เรื่อง missing prop types validation โดยการนำเข้า `prop-types` และเพิ่ม validation ให้กับ `StatCard` และ `RcaDaysChip`

### Security
- เพิ่ม Type validation ของ props สำหรับ React components เพื่อป้องกัน runtime/rendering errors (OWASP A08:2021)

## [1.17.0] - 2026-05-19

### Added — ReportSummary6 (สรุปอุบัติการณ์ที่ได้ RCA แล้ว)
- หน้ารายงานใหม่: Tab "สรุปอุบัติการณ์ที่ได้ RCA แล้ว" + Chip "New" ใน `ReportPage` (value="6")
- **Filter bar**: DatePicker (default = ต้นปีงบ พ.ย./ตค.-กย. จนถึงวันนี้) + Dropdown ประเภท Error (ทั้งหมด + 6 ประเภท) + Export Excel
- **Summary Cards 6 ใบ**: จำนวน RCA / ระดับ E+ / HAD / เวลาตอบสนองเฉลี่ย (วัน) / ประเภทพบบ่อยสุด / หน่วยงานพบบ่อยสุด — แสดง icon + label + ค่า จาก `summary` ที่ backend คำนวณให้
- **ตาราง 17 คอลัมน์** พร้อม:
  - **Sort** ได้ทุกคอลัมน์หลัก (numeric สำหรับ rca_days, string สำหรับอื่น ๆ) — default `error_date DESC`
  - **Search** client-side: เหตุการณ์ / หน่วยงาน / rca_text / ผู้บันทึก / แพทย์ / ประเภท / detail
  - **TablePagination** (10/25/50/100 — default 25)
  - **สีแถวตาม severity**: A-D เขียวอ่อน, E-F เหลืองอ่อน, G-I แดงอ่อน
  - **Chip ระดับความรุนแรง**: สีตาม level (success/warning/error)
  - **Chip HAD**: ส้มถ้า "High Alert Drugs" / เทา outline ถ้า Non-HAD
  - **Chip ระยะเวลา RCA**: success ≤7 วัน, warning ≤30 วัน, error >30 วัน
  - **Tooltip** บนคอลัมน์ที่อาจยาว (event, type_detail, analysis, clear, rca_text) — show ตัวเต็มเมื่อ hover
- **Export Excel 2 sheets**: "สรุป RCA" (สถิติจาก summary) + "รายละเอียด RCA" (ตารางทั้งหมดที่ผ่าน filter, ไม่ใช่แค่ page ปัจจุบัน)
- `libs/MedError.js`: เพิ่ม `getReportSummary6` (ใช้ `buildReportSummary` factory ที่มีอยู่)

### Security
- ส่ง `errorType` เป็นตัวเลขเสมอ (0 = ไม่ filter; 1-6 = filter) — backend clamp อีกชั้น
- ค้นหา client-side ใช้ `String(v).toLowerCase().includes(q)` ปลอดภัยจาก XSS (ไม่ render HTML จาก user)
- ปรับค่า `errorType` / `firstDate` / `lastDate` แล้วรีเซ็ต page เป็น 0 ทุกครั้ง — กัน edge case แสดงหน้าว่างเปล่าหลัง filter

## [1.16.0] - 2026-05-19

### Added — ReportSummary10 (สถิติจำนวนใบสั่งยา/วันนอน)
- หน้ารายงานใหม่ 4 ตาราง — TABLE 0 (admin กรอกข้อมูลปริมาณ IPD/OPD), A (IPD errors), B (OPD errors), C (อัตรา/1,000)
- ใช้ปีงบประมาณ พ.ศ. (ตค.-กย.) — เลือกได้ย้อนหลัง 5 ปี + ปีหน้า
- TABLE 0: TextField สำหรับ admin (`rule===9`), read-only สำหรับ user — Switch โหมดเห็นได้ใน UI
- TABLE A/B: 6 error types × 12 เดือน × HAD/Non-HAD/รวม + แถวผลรวม + คอลัมน์รวมทั้งหมด
- TABLE C: 4 sections (IPD / IPD-HAD / OPD / OPD-HAD) — สูตร `count × 1000 / volume` (2 ทศนิยม)
- **Export Excel 4 sheets** — TABLE 0 / A / B / C
- Tab "สถิติจำนวนใบสั่งยา/วันนอน" + Chip "New" ใน ReportPage (value="10")
- `libs/MedError.js`: `getReportSummary10`, `getStatVolume`, `saveStatVolume`

### Security
- Client-side sanitize ค่า input ใน TABLE 0 — ป้องกันค่าลบ / NaN / string (ผ่าน `handleEditCell` + `Math.max(0, ...)` ก่อนส่ง)
- เคลียร์ state เก่าก่อน fetch ปีใหม่ — กัน flash ของข้อมูลปีก่อนระหว่าง loading

### Performance — Map O(1) lookup + useMemo
ก่อนหน้านี้ render ของ ReportSummary10 ใช้ `.find()` ใน `errorCounts` array ทุก cell (~500 cells × O(n))
- เพิ่ม `countsMap` + `volumeMap` (Map keyed by `${type}-${year}-${month}-${ward}`) — สร้างครั้งเดียวต่อ data change ด้วย `useMemo`
- `aggregates` pre-compute `perCell` / `perMonth` / `perType` / `grand` ของ IPD + OPD ในรอบเดียว
- ลบ inner-loop sums ใน totals row → render ใช้ Map.get() O(1)
- `getCellValue` ห่อด้วย `useCallback`
- Excel export ใช้ `aggregates` เดียวกัน — ไม่ซ้ำคำนวณ
- Complexity: O(n²) → O(n + cells)

## [1.15.1] - 2026-05-19

### Fixed
- **MedErrorPage**: ย้าย `<Backdrop>` ออกจาก `<TableBody>` เป็น sibling ของ `<Scrollbar>` แก้ DOM validation warning `<div> cannot appear as a child of <tbody>` (Backdrop เป็น overlay เต็มหน้าอยู่แล้ว ไม่ต้องอยู่ใน table)

### Changed — ReportPage / ReportSummary9
- เพิ่ม **Chip "New"** ที่แท็บ "รายงานแยกรายละเอียด Error" (ใช้ pattern เดียวกับ "คู่ยาคลาดเคลื่อน")
- **Export Excel ของ Report 9 ปรับให้เหมือน Report 4**:
  - Button: `variant="contained"` + icon `eva:file-text-fill` + dynamic color เมื่อ disabled
  - ตำแหน่ง: ย้ายไปอยู่ row หัวข้อ (justify-between) แทน filter row
  - Code: ใช้ `XLSX.utils.json_to_sheet(data)` ตรง ๆ (ไม่มี header rows พิเศษ) — header เป็น column ภาษาไทย, sheet name `'แยกรายละเอียด Error'`, file name `รายงานแยกรายละเอียด_Error_{type}_{YYYYMMDD_HHmmss}.xlsx`

## [1.15.0] - 2026-05-12

### รื้อรายงาน "แยกรายละเอียด Error" (ReportSummary9) ใหม่ทั้งไฟล์ตามต้นแบบ
- เปลี่ยน layout จาก ward × type matrix → **subtype detail report**:
  - คอลัมน์: รายละเอียด Error (subtype) | HAD | Non-HAD | รวม | Impact | Likelihood | **Level** (Impact + Likelihood)
  - แถวสุดท้าย "ผลรวม" รวม HAD/Non-HAD/Total ทั้ง period
  - Cell ของ Level color-coded: ≤3 cyan, 4-6 green, 7 yellow, ≥8 red
- **เพิ่ม "เปรียบเทียบ 2 ช่วงเวลา" (Compare 2 periods)**:
  - Toggle เปิด-ปิดได้
  - เลือก Period A + Period B → แสดง HAD/Non-HAD/รวม ของทั้ง 2 ช่วงพร้อมคอลัมน์ Δ% (เขียว=ลด, แดง=เพิ่ม)
  - สีพื้น Period B ใช้โทนส้ม (#fff8e1) แยกจาก Period A
- ประเภท Error เลือกผ่าน Autocomplete required (1 ประเภท: Prescription / Dispensing / Pre-Admin / Admin / Processing / Transcribing)
- **Export Excel** — รวมหัว, ช่วงวันที่, ข้อมูลทุกแถว + ผลรวม

### ErrorTypePage — เพิ่ม Likelihood + ปรับ UI ตรวจสอบความสมบูรณ์ของคะแนน
- เพิ่มคอลัมน์ **Likelihood** (Chip คลิกได้ inline editor เหมือน Impact)
- เพิ่ม Select "คะแนน Likelihood (1-5)" ในฟอร์ม Add/Edit
- เปลี่ยน Chip ของรายการที่ยังไม่ระบุ Impact/Likelihood เป็น **`ยังไม่ระบุ` (warning + icon)** ให้สังเกตเห็นง่าย
- เพิ่ม **Alert banner** ด้านบนตาราง: แจ้งจำนวนรายการที่ใช้งานอยู่และยังไม่ได้กำหนด Impact/Likelihood ครบ พร้อม **Switch "แสดงเฉพาะรายการที่ขาด"** ให้ filter ได้ทันที
- Inline Impact/Likelihood handlers ใช้ helper ร่วมกัน (`saveScoreField`) — preserve field อีกฟิลด์เสมอตอน save

## [1.14.0] - 2026-05-12

### Inline Impact Score Editor
- เพิ่ม Popover สำหรับแก้ไขคะแนน Impact (Impact Score) โดยตรงในตารางหน้า "ข้อมูลรายละเอียดประเภท Error" โดยไม่ต้องเปิดฟอร์มแก้ไข
- รองรับการแก้ไขค่า 1-5 และล้างค่า (null) พร้อมบันทึกทันที

### ปรับปรุงระบบ Authentication และแก้บั๊ก
- แก้ไขปัญหาหน้า Login วนลูป (Infinite Redirect Loop) โดยปรับโครงสร้าง Route
- เปลี่ยนทุกจุดที่มีการเรียก `getTokenFromLocalStorage` เป็นการใช้ Cookie (`verifyToken(null)`)
- เพิ่ม Safe Destructuring (`|| {}`) ตอนเรียก `verifyToken` ป้องกันแอปพังกรณีคืนค่า null
- เพิ่ม `axios.defaults.withCredentials = true` ใน `libs/MedError.js` ให้ทุก API ขอ Cookie อัตโนมัติ ป้องกัน backend error 500
- ลบ Import `getTokenFromLocalStorage` ที่ไม่ใช้ออกทั้งหมด 15 ไฟล์

## [1.13.0] - 2026-05-11

### เปลี่ยนกลไก Authentication เป็น HTTP-only Cookie
- `libs/Auth.js`:
  - `storeTokenInLocalStorage` / `getTokenFromLocalStorage` / `removeTokenFromLocalStorage` กลายเป็น **no-op** (token อยู่ใน HTTP-only cookie ฝั่ง browser อ่านไม่ได้)
  - `verifyToken(token)` ไม่ bail เมื่อ token=null อีกต่อไป — เรียก `/auth/profile` พร้อม cookie (browser ส่งให้อัตโนมัติ)
  - เพิ่ม `logout()` เรียก `POST /auth/logout` ให้ backend เคลียร์ cookie
  - ทุก request ใส่ `withCredentials: true` ให้ axios ส่ง cookie อัตโนมัติ
- `AuthContext`:
  - เลิกเก็บ token ใน `localStorage` ตอน login (cookie เป็น source of truth)
  - `logout()` เรียก backend แล้วล้าง state ฝั่ง client
  - `useEffect` initial profile call ใช้ cookie ไม่ต้องอ่าน localStorage
- `LoginForm`: auto-verify session ตอน mount โดยใช้ cookie โดยตรง — ถ้ามี session valid → redirect; ถ้าไม่มี → แสดงฟอร์ม
- เพิ่ม `API_ROUTE.LOGOUT` ใน `utils/constants.js`
- 17 ไฟล์ pages/sections ที่เรียก `getTokenFromLocalStorage` ทำงานต่อได้โดยไม่ต้องแก้ — ฟังก์ชันคืน `null` ทำให้ component path ที่ส่ง token ไป API ก็ใช้ได้, cookie auth ทำหน้าที่จริง

### เพิ่มรายงานคู่ยาคลาดเคลื่อน (ReportSummary4)
- เปิดใช้งานแท็บ "คู่ยาคลาดเคลื่อน" ในหน้ารายงาน (เดิม comment ทิ้งไว้)
- เขียน `sections/reports/ReportSummary4.js` ใหม่ทั้งไฟล์:
  - 2 sub-tabs: **คู่ยาที่จัดคลาดเคลื่อน** (Dispensing) / **คู่ยาที่คีย์คลาดเคลื่อน** (Processing)
  - 3 คอลัมน์: ชื่อยาที่ถูก / ชื่อยาที่คลาดเคลื่อน / จำนวนอุบัติการณ์
  - เรียงจากจำนวนมาก → น้อย, รองรับช่วงวันที่ + ค้นหาชื่อยา + pagination
  - สถานะ loading / empty state ครบ
- เพิ่ม `getDrugPairSummary(token, { firstDate, lastDate, pairType })` ใน `libs/MedError.js`

### Impact Score ในหน้า "ข้อมูลรายละเอียดประเภท Error"
- `pages/ErrorTypePage.js`:
  - เพิ่มคอลัมน์ **Impact** ในตาราง แสดง Chip สีตามระดับ (1-2 เขียว, 3 เหลือง, 4 ส้ม, 5 แดง) — `null` แสดง "—"
  - เพิ่ม `<Select>` "คะแนน Impact (1-5)" ในฟอร์ม พร้อม MenuItem ระบุระดับ (ต่ำมาก/ต่ำ/ปานกลาง/สูง/สูงมาก) + ตัวเลือก "ไม่ระบุ"
  - Zod schema ตรวจค่าให้เป็น integer 1-5 หรือ null
  - `handleEdit` รวม `impact_score` ใน formEditData

## [1.12.1] - 2026-04-29

### ปรับโทนสี + Animate UI Layout
- เปลี่ยนโทนสีหลักจาก blue/violet/cyan → **teal/mint/emerald** (อิงสีเดิมโรงพยาบาล `#8fd2c7`) ให้ต่างจากเทมเพลตอ้างอิง
  - เพิ่ม `guk-bg-mesh-teal` / `guk-bg-mesh-teal-soft`
  - เพิ่ม `guk-blob-teal-1/2/3`, `guk-glass-teal`, `guk-gradient-text-teal`
- **LoginPage**: เพิ่มหัวข้อ `Medication error` (gradient text เคลื่อนไหว) + `Login with your account` ด้านบน pill badge "ระบบรายงานความคลาดเคลื่อนทางยา" ตามที่ขอ
- **Layout (Header + Nav)**: เพิ่ม Animate UI ทั้งโซน
  - **Header**: glass background (blur 20px), ปุ่ม menu มี hover rotate + scale, แถบหัวเรื่อง "ระบบรายงานความคลาดเคลื่อนทางยา" + จุดสถานะลอย (float animation)
  - **Nav drawer**: panel โทน teal glass, โลโก้ลอย (float) + glow pulse, การ์ดผู้ใช้ (StyledAccount) เป็น gradient mint + hover lift
  - **NavSection items**: hover translate-x + gradient teal, active state เป็น gradient teal เข้ม + shadow glow แทน `#103996` เดิม
  - เพิ่ม stagger animation (delay 0.05/0.15/0.25s) ให้โลโก้ → ผู้ใช้ → เมนู ค่อย ๆ fade-up

### ไม่เปลี่ยน Layout
- โครงสร้าง `StyledRoot` / `Container` / `Drawer` / Element ทั้งหมดยังเหมือนเดิม
- ไม่เพิ่ม dependency

## [1.12.0] - 2026-04-29

### ปรับธีมใหม่ (Style refresh — โทนเดียวกับ vite-opd-schedule)
- เพิ่มไฟล์ `src/theme/effects.css` รวม utility classes (glass / mesh background / blob animations / gradient text) ที่ import ครั้งเดียวใน `index.js` ไม่กระทบ MUI theme เดิม
- **LoginPage**: เปลี่ยนพื้นหลังเป็น mesh gradient + animated blobs, ห่อ form ด้วยการ์ดโทน glass-strong (backdrop-filter blur), หัวข้อ "เข้าสู่ระบบ" ใช้ gradient text เคลื่อนไหว, ใช้ฟอนต์ Prompt, badge ระบุชื่อระบบ + ไอคอน lucide (sparkles, shield-check, external-link, pill), เพิ่มลิงก์ "เว็บไซต์โรงพยาบาลร้อยเอ็ด" และข้อความ "เชื่อมต่อปลอดภัย" + เลขเวอร์ชัน — **คงโครงสร้าง layout `StyledRoot` / `Container` / `StyledContent` / `<LoginForm />` เดิมไว้ทุกตัว**
- **DashboardAppPage**: เพิ่มพื้นหลัง mesh แบบ soft + blob animations, ห่อแถบหัว (Executive Summary + DatePicker + Select ปีงบประมาณ) ด้วยการ์ด glass มี gradient text + คำบรรยาย — ส่วน Grid / Card / Table ของกราฟและตารางคงเดิมไม่เปลี่ยน

### ไม่เปลี่ยน
- ไม่เพิ่ม dependency ใหม่ (ใช้ pure CSS + class names)
- ไม่ปรับ MUI theme palette / overrides
- ไม่ย้าย element / ไม่ลบ feature ใด ๆ

## [1.11.2] - 2026-04-28

### ปรับปรุง (Cleanup)
- เคลียร์ ESLint warnings ที่เหลือทั้งหมด (11 → 0)
- เพิ่ม `PropTypes` validation ที่ขาด:
  - `AuthContext.AuthProvider`: `children: PropTypes.node`
  - `NotificationsPopover`: `users: PropTypes.array`
  - `Nav`: `user: PropTypes.array`
  - `MedErrorForm`: `userLogin: PropTypes.array`
- `MedErrorPage`: ใช้ object destructuring `const { error_analysis } = ...` แทน `let error_analysis = ....error_analysis`
- `MedErrorPage`: เพิ่ม `// eslint-disable-next-line react/prop-types` สำหรับ `key` ใน MUI Autocomplete `renderOption` (props เป็น MUI internal ไม่ต้อง validate)
- `AppWebsiteVisits`: เปลี่ยน `click: function () {}` เป็น `click() {}` (ES2015 method shorthand) แก้ `func-names`

## [1.11.1] - 2026-04-28

### ปรับปรุง (Cleanup)
- ลบ ESLint warnings ทั้งหมดประเภท `is defined but never used`, `is assigned a value but never used`, `PropType is defined but prop is never used` (108 warnings → 0)
- ลบ unused imports: `Cookies`, `Iconify`, `_`, `Fragment`, `useRef`, `useAuth`, MUI components ที่ไม่ใช้, `Scrollbar`, ฯลฯ
- ลบ unused state hooks: `[isOpen, setIsOpen]`, `[isShowModal, setIsShowModal]`, `[currentDate, setCurrentDate]`, `[months]`, `[yearSelected]` (ใช้ destructuring placeholder `[, setX]` หรือถอดทิ้งทั้งคู่ตามการใช้งานจริง)
- ลบ unused PropTypes: `page`, `rowCount`, `numSelected`, `onSelectAllClick`
- ลบ unused functions: `popKeys` (ที่ไม่มีคนเรียก), `loadEditData` (commented out body)
- ลบ unused parameters ใน callbacks: `event` ใน `handleLogout`, `sec` ใน `handleCatchAxios`, `value` ใน `isOptionEqualToValue` (ที่ body ไม่ได้ใช้)
- ลบโค้ด commented-out ที่อ้างถึง state ที่ลบทิ้งแล้ว (`isShowModal` block, MUI Select เดือน, etc.)

## [1.11.0] - 2026-04-28

### ความปลอดภัย (Security)
- เพิ่ม **axios response interceptor** จัดการ 401/403 อัตโนมัติ (ล้าง token และพากลับไปหน้า login)
- เพิ่ม **timeout 30s** ให้ทุก API request ป้องกัน request ค้าง
- ลบ catch block ที่ swallow error เงียบ ๆ (`return JSON.stringify(error)`) ออกจากทุก API helper – throw ตามจริงให้ caller จัดการ

### ปรับปรุงประสิทธิภาพ (Performance)
- `AuthContext` ใช้ `useCallback`/`useMemo` ห่อ value ลด re-render ลูก ๆ ใน Provider
- `axiosConfig.useAxios()` หยุดสร้าง axios instance ใหม่ทุกครั้งที่ token เปลี่ยน (ใช้ instance เดียว, อัปเดตเฉพาะ interceptor)
- `DashboardAppPage` ห่อ handler ทั้งหมดด้วย `useCallback`, memoize `chartColors` และแก้ key ของ TableRow จาก index เป็น `error_level`
- ปรับ `libs/MedError.js` เป็น functional แบบสั้นลง ลด helper ซ้ำ ๆ ของ report endpoints (`buildReportSummary` factory)

### แก้บั๊ก (Fixed)
- `LoginForm`: ใส่ cleanup ของ `setTimeout` chain และ flag `isMountedRef` ป้องกัน setState หลัง unmount
- `LoginForm`: แก้ zod schema ที่บังคับ username **ตรงเป๊ะ 6 ตัวอักษร** (`max(6)`) ออกเป็น `max(64)` เพื่อรองรับชื่อผู้ใช้จริง
- `LoginForm`: แสดงข้อความ error ตามสถานะจริงของ HTTP (network error vs auth error) แทนข้อความเดียวสำหรับทุกกรณี
- `AuthContext`: ใช้ `cancelled` flag ใน `useEffect` กัน setState หลัง unmount

### โครงสร้าง / UX
- ลบ dead code:
  - ไฟล์ `*copy.js` ทั้งหมด (`AuthContext copy`, `LoginForm copy`, `config copy`, `MedErrorPage copy`, `UserPage copy`)
  - หน้าไม่ได้ใช้: `BlogPage`, `ProductsPage`, `FormMedErrorPage`
  - sections ไม่ได้ใช้: `@dashboard/blog/`, `@dashboard/products/`, `med-error/MedErrorPharmForm`
  - mock data: `_mock/` (account, blog, products, user)
  - header components ที่ comment ทิ้งไว้: `AccountPopover`, `LanguagePopover`, `Searchbar`
- ลบ `API_ROUTE` ที่ frontend ไม่ใช้ (`VERIFY`, `DEPARTMENT_AND_WARD_ALL`, `ERROR_TYPE_LIST_UPDATE`)
- ปรับ `LoginForm`: เพิ่ม `autocomplete` attribute ที่ input + `aria-label` ที่ปุ่มแสดง/ซ่อนรหัสผ่าน

## [1.10.16] - 2026-02-03

### ปรับปรุง (Changed)

- **Medication Error Update Logic**:
  - ปรับปรุงเงื่อนไขการอัพเดทข้อมูลสำหรับ Admin (`rule === 9`) โดยจะไม่ทำการอัพเดท `error_user` และ `error_user_name` เพื่อคงชื่อผู้รายงานคนเดิมไว้
- **ReportSummary8**:
  - เพิ่มคอลัมน์ "หน่วยงานที่เกี่ยวข้อง" ในตารางแสดงผลและไฟล์ Excel (Export)
- **UI/UX**:
  - **Navbar Toggle**: เพิ่มปุ่มสำหรับปิด/เปิดแถบเมนูด้านข้าง (Navbar) บนหน้าจอ Desktop เพื่อเพิ่มพื้นที่ในการแสดงผลเนื้อหา
  - **ReportSummary8 UI**: ปรับปรุงหน้าแสดงผลส่วนตัวกรอง (Filter) และส่วนหัวรายงานด้วย Card และ Grid Layout เพื่อความสวยงามและใช้งานง่าย

## [1.10.14] - 2026-01-28

### ปรับปรุง (Changed)

- **ปรับปรุงโครงสร้างโค้ด (Refactor)**
  - แก้ไขตรรกะการตรวจสอบข้อมูล (Validation Logic) ในฟอร์มบันทึกความคลาดเคลื่อนทางยา
  - เปลี่ยนการตรวจสอบรหัสหอผู้ป่วย (Ward Code) ตามประเภท Error Type จากการใช้ `if-else` หลายชั้น มาใช้เทคนิค Object Mapping ลดความซ้ำซ้อนของโค้ด
- **เพิ่มคุณภาพโค้ด**
  - ปรับโค้ดให้อ่านง่ายขึ้น (Readability) และแก้ไขได้ง่ายในอนาคต (Maintainability) โดยไม่มีผลกระทบต่อการทำงานเดิมของหน้าบ้าน

## [1.10.13] - 2025-12-09

### ปรับปรุง (Changed)

- ปรับแก้การตรวจสอบสถานะแอดมินเพื่อดึงข้อมูลประเภทของ Error
  - ถ้า `role === 9` (Admin) ให้ดึงข้อมูลทั้งหมด (All types)
  - ถ้าไม่ใช่ Admin ให้ดึงตามสิทธิ์
- ปรับฟังก์ชัน `loadErrorType` ให้รองรับสิทธิ์ผู้ดูแลระบบ (Admin)
  - เพิ่มเงื่อนไขตรวจสอบสิทธิ์จาก `user[0].rule`
  - หากเป็น Admin (`rule === 9`) บังคับให้เรียก `getErrorTypeByType(auth_token, 3)` (ดึงทั้งหมด)
  - หากไม่ใช่ Admin ใช้ค่าพารามิเตอร์ `pages` ตามเดิม

## [1.10.12] - 2025-12-05

### เพิ่มใหม่ (Added)

- **Dashboard Executive Summary**
  - เพิ่มการเลือกช่วงวันที่ด้วย DatePicker (เริ่มต้น / สิ้นสุด)
  - แสดงตารางสรุปจำนวน Medication Error แยกตามความรุนแรง (`summaryErrorTypeList`)
- **เงื่อนไขสิทธิ์ RCA**
  - ปุ่ม “ยืนยันข้อมูลได้รับการ RCA” แสดงเฉพาะผู้ใช้ที่มี `rule === 9`
  - เพิ่ม TextArea สำหรับกรอก **รายละเอียด RCA**
- **Master Data Pages**
  - **Department**: เพิ่ม/แก้ไข/ลบ หอผู้ป่วย พร้อมสถานะการใช้งาน (Active/Inactive)
  - **Error Type Detail**: จัดการรายละเอียดประเภท Error
  - **Error Analysis**: จัดการรายการวิเคราะห์สาเหตุ
- **LINE OA Integration**
  - สร้างฟังก์ชัน `sendReplyLineMessaging` สำหรับส่งการแจ้งเตือนผ่าน MOPH Notify API แทน LINE Notify เดิม
- **Database Schema**
  - เพิ่ม field ใหม่ในตาราง `med_error`: `error_transcribing_right_icode`, `error_transcribing_right`, `error_transcribing_wrong`, etc.

### ปรับปรุง (Changed)

- **Medication Error Loading**
  - ปรับ `loadMedError` ให้รองรับการกรองด้วย `dateStart`/`dateEnd` ผ่าน Parameter
- **Form Validation**
  - ปรับใช้ **React Hook Form + Zod** ให้สอดคล้องกันทุกหน้า (Master Data)
  - แก้ไขค่า Default และ Reset form ให้ถูกต้อง
- **UI/UX**
  - ปรับ `Dialog` และ `Popover` ให้ทำงานถูกต้อง (State management)

### แก้ไขข้อผิดพลาด (Fixed)

- **Dashboard**: แก้ `rowLabels.map is not a function` โดยตรวจสอบ `Array.isArray` ก่อน
- **Autocomplete**: แก้ปัญหา `getOptionLabel` return null และปรับ `isOptionEqualToValue`
- **React Hook Form**: แก้ปัญหา Binding value กับ Select input ให้ถูกต้อง
- **Axios Error Handling**: ปรับปรุงการดักจับ Error และแจ้งเตือนให้ชัดเจนขึ้น