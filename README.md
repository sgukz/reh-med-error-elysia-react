# REH Medication Error Reporting System

ระบบรายงานความคลาดเคลื่อนทางยา (Medication Error Reporting System) สำหรับโรงพยาบาลร้อยเอ็ด (REH)

โปรเจกต์นี้พัฒนาขึ้นเพื่อช่วยในการบันทึก ติดตาม และวิเคราะห์ข้อมูลความคลาดเคลื่อนทางยา เพื่อนำไปสู่การปรับปรุงความปลอดภัยของผู้ป่วย

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

โปรเจกต์นี้แบ่งออกเป็น 2 ส่วนหลัก (Monorepo):

1. **[Frontend](./frontend)**: ระบบหน้าบ้านสำหรับผู้ใช้งานและผู้ดูแลระบบ
   - **Tech Stack**: React, Material UI (MUI), React Hook Form, Zod, ApexCharts
   - **Package Manager**: [Bun](https://bun.sh/)

2. **[Backend](./backend)**: ระบบ API สำหรับจัดการข้อมูล
   - **Tech Stack**: [ElysiaJS](https://elysiajs.com/), TypeScript, MySQL (Knex)
   - **Runtime/Package Manager**: [Bun](https://bun.sh/)

---

## 🚀 วิธีการติดตั้งและเริ่มต้นใช้งาน (Getting Started)

### ข้อกำหนดเบื้องต้น (Prerequisites)
- ติดตั้ง [Bun](https://bun.sh/) บนเครื่องของคุณ

### การติดตั้ง (Installation)

1. Clone โปรเจกต์นี้ลงเครื่อง:
   ```bash
   git clone <repository_url>
   cd reh-med-error
   ```

2. ติดตั้ง Dependencies ทั้ง Frontend และ Backend:
   ```bash
   # สำหรับ Frontend
   cd frontend
   bun install
   
   # สำหรับ Backend
   cd ../backend
   bun install
   ```

### การรันระบบในโหมดพัฒนา (Development)

**รัน Backend API:**
```bash
cd backend
bun run dev
```
*API จะทำงานที่ [http://localhost:9000](http://localhost:9000)*

**รัน Frontend:**
```bash
cd frontend
bun start
```
*Frontend จะทำงานที่ [http://localhost:3000](http://localhost:3000)*

---

## 🐳 การ Deploy ด้วย Docker

ทั้ง Frontend และ Backend รองรับการทำงานผ่าน Docker Container สำหรับการนำไปใช้งานจริง (Production) สามารถดูคู่มือและไฟล์การตั้งค่าได้จาก:
- [Backend Deployment Guide](./backend/DEPLOY.md)
- `docker-compose.yml` ในแต่ละโฟลเดอร์
