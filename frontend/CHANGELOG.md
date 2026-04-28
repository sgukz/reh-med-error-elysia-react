# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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