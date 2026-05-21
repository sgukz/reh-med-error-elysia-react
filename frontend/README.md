# REH Medication Error Reporting System

ระบบรายงานความคลาดเคลื่อนทางยา (Medication Error Reporting System) สำหรับโรงพยาบาลร้อยเอ็ด (REH) พัฒนาด้วย React และ Material UI เพื่อช่วยในการบันทึก ติดตาม และวิเคราะห์ข้อมูลความคลาดเคลื่อนทางยา เพื่อนำไปสู่การปรับปรุงความปลอดภัยของผู้ป่วย

## ✨ Key Features (คุณสมบัติหลัก)

- **Medication Error Reporting**: บันทึกข้อมูลความคลาดเคลื่อนทางยาอย่างละเอียด (วันที่, เวลา, สถานที่, ประเภท Error, ระดับความรุนแรง)
- **Dashboard & Analytics**: แสดงผลข้อมูลสรุปสำหรับผู้บริหาร (Executive Summary) และกราฟแสดงแนวโน้ม
- **Drug Pair Reports (v1.13.0+)**: รายงานคู่ยาคลาดเคลื่อนแยก "จัดคลาดเคลื่อน" และ "คีย์คลาดเคลื่อน" พร้อมจำนวนอุบัติการณ์เรียงจากมาก → น้อย
- **Error Detail Report — Summary 9 (v1.15.0+, v1.20.0, v1.20.1)**: รายงานแยกรายละเอียด Error ตาม subtype พร้อม HAD/Non-HAD, **Impact (manual) + Likelihood (AUTO badge — Chip สีตามระดับ 0-5 + tooltip EN/TH) + Level color-coded**, รองรับ **เปรียบเทียบ 2 ช่วงเวลา (Δ%)** และ Export Excel
- **Prescription/IPD Statistics — Summary 10 (v1.16.0+)**: สถิติจำนวนใบสั่งยา (OPD) / วันนอน (IPD) — 4 ตาราง + อัตราต่อ 1,000, Admin (rule=9) กรอกข้อมูลปริมาณรายเดือนได้ใน TABLE 0, Export Excel 4 sheets
- **RCA Summary Report — Summary 6 (v1.18.0, v1.20.0 add quick presets)**: สรุปอุบัติการณ์ที่ได้ RCA แล้ว — glass header card (teal theme), subtitle แสดงช่วง+ประเภทปัจจุบัน, **Quick date presets** (7 วัน / 30 วัน / เดือนนี้ / เดือนก่อน / ปีงบประมาณ), 6 summary cards, ตาราง 17 คอลัมน์ มี sort/search/pagination, สีแถวตาม severity, Chip ระยะเวลา RCA, Tooltip บนคอลัมน์ยาว, Export Excel 2 sheets
- **Likelihood Criteria Manager (v1.19.0, v1.20.0 rewrite UX)**: หน้าจัดการเกณฑ์ความถี่ → Likelihood — **Tabs 3 กลุ่ม** (Prescription / Processing-Pre-Admin-Transcribing / Dispensing-Admin), **Visual Range Bar** color-coded ต่อ level, **ScorePill EN+TH** label (Frequent/Likely/Possible/Unlikely/Rare/Never), **Validation visual** (gap/overlap/missing/invalid) พร้อม badge นับ issue ที่ tab title — Admin (rule=9) เท่านั้น
- **Master Data Management**: จัดการข้อมูลพื้นฐาน เช่น หอผู้ป่วย (Ward), ประเภท Error พร้อม **คะแนน Impact (1-5 ต่อตัว)** สำหรับคำนวณ Risk Level — *Likelihood ไม่ต้องตั้งต่อรายการแล้ว (v1.20.0) ระบบคำนวณจาก "เกณฑ์ Likelihood"*, และการวิเคราะห์สาเหตุ (RCA)
- **Authentication & Authorization**: ระบบจัดการสิทธิ์ผู้ใช้งาน (User & Admin roles) — **HTTP-only cookie (v1.13.0+)** ลดความเสี่ยง XSS
- **LINE OA Integration**: รองรับการแจ้งเตือนและการตอบกลับผ่าน LINE Official Account
- **Export Data**: รองรับการส่งออกข้อมูลเพื่อนำไปวิเคราะห์ต่อ

## 🛠 Technologies Used (เทคโนโลยีที่ใช้)

- **Frontend Framework**: [React](https://reactjs.org/)
- **UI Component Library**: [Material UI (MUI)](https://mui.com/)
- **State Management & Logic**: React Hooks
- **Form Handling**: React Hook Form + Zod Validation
- **Charts & Visualization**: ApexCharts, React-ApexCharts
- **Date Handling**: Day.js, Moment.js, date-fns
- **HTTP Client**: Axios
- **Routing**: React Router DOM (v6)
- **Package Manager**: Bun
## ⚙️ Prerequisites (ข้อกำหนดเบื้องต้น)

- [Node.js](https://nodejs.org/) (Recommended: LTS version)
- [Bun](https://bun.sh/)

## 🚀 Installation (การติดตั้ง)

1. **Clone the repository**
   ```bash
   git clone <repository_url>
   cd reh-med-error
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

## 🌍 Environment Variables

สร้างไฟล์ `.env` ที่ root directory โดยอ้างอิงจากตัวอย่างด้านล่าง

```env
# .env.development / .env.production
NODE_ENV=development
REACT_APP_VERSION=$npm_package_version
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_BASE_URL=/med-error
```

## 📜 Available Scripts

ใน project directory คุณสามารถรันคำสั่งต่อไปนี้:

### `bun start`
รันโปรแกรมในโหมด Development ที่ [http://localhost:3000](http://localhost:3000)

### `bun run build`
Build โปรแกรมสำหรับการใช้งานจริง (Production) ไฟล์จะอยู่ที่โฟลเดอร์ `build`

### `bun run test`
รัน Test runner

### `bun run lint`
ตรวจสอบ Code ด้วย ESLint

### `bun run lint:fix`
ตรวจสอบและแก้ไข Code ด้วย ESLint อัตโนมัติ

## 📂 Project Structure

```
reh-med-error/
├── public/          # Static assets
├── src/
│   ├── components/  # Reusable components
│   ├── data/        # Static data & constants
│   ├── layouts/     # Layout components (Dashboard, Main)
│   ├── libs/        # API services & utilities
│   ├── pages/       # Application views/pages
│   ├── sections/    # Page-specific sections
│   ├── theme/       # MUI Theme configuration
│   ├── utils/       # Utility functions
│   └── App.js       # Root component
├── .env.*           # Environment configurations
├── package.json     # Project dependencies & scripts
└── README.md        # Project documentation
```
