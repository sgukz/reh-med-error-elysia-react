# แผนการพัฒนา Report "รายงานแยกรายละเอียด Error"

## ข้อมูลเบื้องต้น
สร้างรายงานสรุปอุบัติการณ์ความคลาดเคลื่อนทางยา โดยแยกรายละเอียดตาม "สถานที่เกิดเหตุการณ์" และประเภทของ Error (Prescription, Dispensing, Pre-Administration, Administration, Processing, Transcribing) พร้อมรองรับการ Filter ตาม "ประเภท Error"

## สิ่งที่ได้ดำเนินการ (Implementation Plan)

### 1. Backend (API & Model)
- **เพิ่ม Interface Option:** เพิ่ม `GetMedErrorSummary9Options` ใน `backend/src/Interfaces/ReportInterface.ts` สำหรับรับพารามิเตอร์ `firstDate`, `lastDate` และ `errorType`
- **สร้าง Model Query:** สร้างฟังก์ชัน `getReportSummary9` ใน `backend/src/models/ReportModel.ts` เพื่อ:
  - `select` ข้อมูลโดยนับจำนวนแยกตาม `error_type` (1 ถึง 6) ในแต่ละคอลัมน์ (เช่น `error_prescription` ถึง `error_transcribing`)
  - จัดกลุ่ม (`group by`) ด้วยชื่อหอผู้ป่วย (`error_ward_name`)
  - รองรับการ Filter ตาม `errorType` (หากมีการเลือก)
- **สร้าง Route Endpoint:** เพิ่ม API Endpoint `GET /reports/summary9` ใน `backend/src/routes/ReportRoute.ts` เพื่อรับ Request จาก Frontend และส่งข้อมูลรายงานที่จัดกลุ่มแล้วกลับไป

### 2. Frontend (UI & Data Fetching)
- **เพิ่ม API Service:** ส่งออกฟังก์ชัน `getReportSummary9` ผ่านการใช้ `buildReportSummary('summary9')` ใน `frontend/src/libs/MedError.js`
- **เพิ่มเมนูย่อย (Tab):** เข้าไปแก้ไข `frontend/src/pages/ReportPage.js` เพื่อเพิ่ม Tab ที่ 9 สำหรับ "รายงานแยกรายละเอียด Error"
- **สร้าง Component รายงานใหม่ (`ReportSummary9.js`):**
  - สร้างไฟล์ `frontend/src/sections/reports/ReportSummary9.js`
  - นำเข้าคอมโพเนนต์ต่างๆ จาก MUI (เช่น Table, Autocomplete, DatePicker)
  - นำข้อมูลประเภท Error (`MedErrorTypeAll`) มาใช้ทำ Dropdown สำหรับตัวกรอง "ประเภท Error"
  - สร้างตารางแสดงผลประกอบไปด้วย 8 คอลัมน์ ได้แก่ สถานที่เกิดเหตุการณ์, Error Type ทั้ง 6 ชนิด และยอดรวมทั้งหมด (Total)

### 3. ผลลัพธ์ (Outcome)
- ผู้ใช้งานสามารถเข้าดูรายงานที่ Tab ใหม่ "รายงานแยกรายละเอียด Error"
- สามารถเลือกช่วงวันที่และฟิลเตอร์เฉพาะ **ประเภท Error (1-6)** ที่สนใจได้
- โครงสร้างและหน้าตาของรายงานตรงตามภาพ `รายงานแยกรายละเอียด Error.png` ที่ต้องการ
