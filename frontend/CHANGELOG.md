# Changelog

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




