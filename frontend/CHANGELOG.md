# Changelog

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




