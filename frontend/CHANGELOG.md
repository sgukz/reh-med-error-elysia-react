# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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