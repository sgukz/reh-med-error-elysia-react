# Changelog

## [1.25.6] - 2026-10-01

### Added — Department Group Multi-Select Filter (UI & Export)
- ปรับเปลี่ยนตัวกรอง "กลุ่มหน่วยงาน" ในหน้ารายงานทั้งหมด (`ReportSummary8`, `ReportSummary9`, `ReportSummary6`, `ReportSummary11`) จาก Single Select เป็น **Autocomplete Multiselect** พร้อม Checkbox และ Chip เหมือนกับ "เลือกหน่วยงาน"
- ปรับปรุง Cascading Filter: รายการใน "เลือกหน่วยงาน" จะกรองเฉพาะหน่วยงานที่สังกัดในกลุ่มที่เลือก และทำการ Prune ล้างหน่วยงานที่หลุดออกจากกลุ่มที่เลือกใหม่อัตโนมัติ ป้องกันข้อมูลขัดแย้ง
- อัปเดต Subtitle บนการ์ดสรุปและส่วนหัวของ Excel Export ให้แสดงชื่อกลุ่มหน่วยงานที่เลือกทั้งหมด (เช่น `กลุ่มหน่วยงาน: OPD, OPD2` หรือ `กลุ่มหน่วยงาน: ทั้งหมด`)

### Security
- OWASP A03:2021 (XSS) — Escape ชื่อกลุ่มและหน่วยงานที่เลือกในทุกจุดของการแสดงผล JSX และ Text label
- OWASP A04:2021 (Input Validation) — มีการตรวจสอบชนิดข้อมูลและการ sanitize array ของ group id ก่อนส่งเข้า API

## [1.25.5] - 2026-09-30

### Added
- เพิ่มการแสดงผล Error Type 6 (Transcribing Error) ในตารางสถิติและ Donut chart ในหน้า Executive Summary (`DashboardAppPage`)
- ปรับปรุง Datepicker ทั้งหมดทั่วทั้งระบบ (Report 1-9, Report 11, MedErrorForm, MedErrorPage, UserListToolbar, DashboardAppPage) ให้เป็นรูปแบบเดียวกันตามหน้า Executive Summary:
  - แสดงผลปี พ.ศ. (ไทย เช่น "1 ตุลาคม 2569") ผ่าน `AdapterDateFnsTH` ทั้งในช่องกรอก (Input field) และปฏิทิน (Header & Year view)
  - Highlight วันเสาร์ (สีม่วง `#9333ea`) และวันอาทิตย์ (สีแดง `#ef4444`) พร้อม Soft Background และ Hover Effect ผ่าน `renderWeekendHighlightDay` ส่วนกลาง

### Changed
- ปรับฟอร์แมตตัวเลขในตาราง Medication Error ในหน้า Dashboard ให้ใส่เครื่องหมายจุลภาคคั่นหลักพัน (`formatCount`, เช่น `5,635`) อ่านง่ายขึ้น
- เพิ่มการรองรับการเลือกและกรองตามกลุ่มหน่วยงาน (Department Group) ในหน้ารายงานต่างๆ (Report 6, 8, 9, 11) และแสดงผลใน Excel Export
- ปรับแต่ง `docker-compose.yml` (network: `app-shared-net`, `restart: unless-stopped`, `security_opt: seccomp:unconfined`, async non-blocking logging) และเพิ่ม Version label ให้ `Dockerfile`

### Fixed
- แก้ไขปัญหาตัวเลขอุบัติการณ์ทั้งหมด (Total) ในการ์ดสรุปหน้า Dashboard ถูกนับเบิ้ล (จากเคสเปรียบเทียบ `TOTAL` case-sensitive)
- แก้ไขปัญหาการเปลี่ยน Dropdown "ปีงบประมาณ" ในหน้า Dashboard แล้ววันที่เริ่มต้น-สิ้นสุดใน Datepicker และข้อมูลในหน้าจอไม่อัปเดตตามปีงบประมาณที่เลือก

### Security
- OWASP A03:2021 (XSS) — การแสดงผลข้อมูลตัวเลขและชื่อกลุ่มหน่วยงานผ่าน React JSX มีการ auto-escape ปลอดภัยจากการ inject สคริปต์
- OWASP A04:2021 (Input Validation) — มีการตรวจสอบค่าก่อนแปลงตัวเลข (`formatCount`) และทำ validation ช่วงวันที่ก่อนส่งเข้า API

## [1.25.4] - 2026-07-22

### Changed
- ขยายขนาดตัวอักษรและขนาดของ Chip ทั้ง SeverityChip (ระดับ A-I) และ StatChip (HAD, Non-HAD, รวม) ในหน้ารายงาน Report 11 เพื่อให้ตัวเลขอ่านได้ง่ายและชัดเจนมากยิ่งขึ้น

## [1.25.3] - 2026-07-22

### Changed
- เพิ่มการแสดงผลสีเป็น Chip แยกสี สำหรับคอลัมน์ HAD (สีแดง), Non-HAD (สีน้ำเงิน), และ รวม (สีเขียวอมฟ้า) ในตารางของหน้ารายงานวิเคราะห์สาเหตุ (Report 11) เพื่อให้อ่านข้อมูลสถิติได้ง่ายและชัดเจนขึ้น

## [1.25.2] - 2026-07-22

### Changed
- ปรับการแสดงผลตารางในหน้ารายงานวิเคราะห์สาเหตุ (Report 11) ให้แสดงข้อมูลแบบเต็มโดยไม่จำกัดความสูง (นำ maxHeight ออก) เพื่อลดแถบเลื่อน (Scrollbar) ภายในตาราง

## [1.25.1] - 2026-07-22

### Added
- เพิ่มคอลัมน์แยกตามระดับความรุนแรง (Level A-I) ในตารางของหน้ารายงานแยกรายละเอียด Error (Report 9) ทั้งตารางบนเว็บและในไฟล์ Excel Export
- เพิ่มการแสดงผลสีแยกตามความรุนแรงด้วย `SeverityChip` ในหัวตารางและแถวผลรวมเพื่อให้อ่านง่ายและสวยงาม


## [1.25.0] - 2026-06-17

### Added
- เพิ่มส่วนแสดงผลภาพรวมระดับผู้บริหาร (Executive Summary) ในหน้า Dashboard โดยประกอบด้วย Summary Cards แสดงจำนวนอุบัติการณ์ทั้งหมด, กลุ่มยา High Alert Drugs (HAD) และความรุนแรงระดับ E-I
- ปรับปรุงรูปแบบและ Style ของตาราง Medication Error ในหน้า Dashboard โดยใช้ Design แบบ Glassmorphism และใส่สีระดับความรุนแรง (Level) ตามมาตรฐานเดียวกับหน้ารายงานอื่นๆ

## [1.24.2] - 2026-06-17

### Changed
- ปรับปรุงรูปแบบการแสดงผลช่วงวันที่ให้เป็นมาตรฐานเดียวกันทั้งหมด (เช่น "ข้อมูลวันที่ 1 - 17 มิถุนายน 2569" หรือ "ระหว่างวันที่ 1 พฤษภาคม - 17 มิถุนายน 2569") ในทุกหน้ารายงาน (Report 1-9) และหน้า Dashboard เพื่อความสวยงามและอ่านง่าย
- จัดการลบโค้ดและการนำเข้าโมดูล (imports) ของ `formatDateTime` ที่ไม่ได้ใช้งานแล้วทิ้ง เพื่อให้ผ่านการตรวจ ESLint อย่างถูกต้องตามมาตรฐาน

## [1.24.1] - 2026-06-17

### Added
- เพิ่มการแสดงผลสี (Coloring) และการแทรกรูปภาพ (Image) ในไฟล์ Excel ที่ส่งออกจากหน้ารายงานแยกรายละเอียด Error (Report 9) โดยใช้ไลบรารี `exceljs`

## [1.24.0] - 2026-06-17

### Added
- เพิ่มการแสดงผลตาราง "รวม IPD" และ "รวม OPD" ใน TABLE C บนหน้ารายงานสถิติจำนวนใบสั่งยา/วันนอน (Report 10) รวมถึงใน Excel Export
- เพิ่มตาราง Risk Assessment Matrix ท้ายตารางบนหน้ารายงานแยกรายละเอียด Error (Report 9) รวมถึงใน Excel Export

### Changed
- ปรับสูตรคำนวณ Level ความเสี่ยงบนหน้ารายงานแยกรายละเอียด Error (Report 9) จากบวกเป็นคูณ (Impact × Likelihood) 
- ปรับปรุงสีของ Level ให้สอดคล้องกับพิกัดในตาราง Risk Assessment Matrix (Low=เขียว, Medium=เหลือง, High=แดง)

## [1.23.6] - 2026-06-17

### Fixed
- แก้ไข React Warning "Each child in a list should have a unique 'key' prop" ในหน้า ReportSummary3 โดยเปลี่ยนจากการใช้ Fragment เปล่า (`<>`) เป็น `<Fragment key={index}>`

## [1.23.5] - 2026-06-17

### Fixed
- แก้ไขปัญหาหน้า ReportSummary1, ReportSummary5, ReportSummary7 แสดงผลกำลังโหลดข้อมูลค้างอยู่เมื่อไม่มีข้อมูล โดยปรับให้ isLoading เป็น false ทันทีและแสดงข้อความ "ไม่พบข้อมูล" (หรือ "ไม่มีข้อมูล") เมื่อ API คืนค่า statusCode 404 หรือรายการว่างเปล่า (หน้ารายงานอื่นๆ รองรับการแสดงผลกรณีไม่มีข้อมูลแล้ว)

## [1.23.4] - 2026-05-22

### Fixed
- แก้ไขปัญหา Warning ใน Console เกี่ยวกับ React Key prop spread (`<li {...props}>`) ใน component `Autocomplete` ที่ใช้งานในหน้าข้อมูล Medication error และหน้ารายงานต่างๆ (ReportSummary 2, 3, 8) โดยทำการแยก `key` ออกจาก `props` ก่อนส่งต่อ
- เพิ่ม `// eslint-disable-next-line react/prop-types` เพื่อข้ามการตรวจจับ prop types validation ของตัวแปร `key` ที่แยกออกมา

## [1.23.3] - 2026-05-22

### Added
- เพิ่มแถบเลื่อนแนวนอน (Scrollbar) ไว้ด้านบนของตารางข้อมูล Medication error เพื่อให้ผู้ใช้สามารถเลื่อนตารางซ้าย-ขวาได้สะดวกขึ้นเมื่อตารางแสดงจำนวนแถวแบบเต็มหน้าจอ (ไม่ต้องเลื่อนลงไปดูแถบเลื่อนด้านล่างสุด)

## [1.23.2] - 2026-05-22

### Fixed
- แก้ไขปัญหาตารางในหน้าข้อมูล Medication error ไม่ขยายความสูงตามจำนวน Rows per page ที่ผู้ใช้เลือก (เอา maxHeight ออกเพื่อให้แสดงครบทุกแถว)

## [1.23.1] - 2026-05-22

### Added
- เพิ่มระบบตัวกรองข้อมูล (Filter) ในหน้า ข้อมูล Medication error (สถานที่เกิดเหตุ, ประเภท Error, ระดับความรุนแรง, HAD)
- เพิ่ม minWidth ให้กับคอลัมน์ในตาราง Medication Error เพื่อป้องกันข้อความทับซ้อนและให้หัวตารางแสดงผลได้สมบูรณ์

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).




