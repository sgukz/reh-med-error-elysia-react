# API Med Error (Node 22 + Bun + Elysia)

API สำหรับระบบรายงานความคลาดเคลื่อนทางยา (Med Error) พัฒนาโดยใช้ **ElysiaJS** บน **Bun Runtime** (Node 22 compatible) เน้นประสิทธิภาพและความรวดเร็ว

## 🚀 Technology Stack

- **Runtime:** [Bun](https://bun.sh/) (v1.x)
- **Framework:** [ElysiaJS](https://elysiajs.com/)
- **Database:** MySQL (via `mysql2` & `knex`)
- **Language:** TypeScript
- **Authentication:** JWT
- **Utilities:** Lodash, Moment, Zod, HTTP Status Codes

## 📦 Features

- **Authentication:** ระบบ Login พร้อม JWT (verify ผ่าน opduser ของ HIS)
- **Med Error Management:** API สำหรับจัดการรายงานความคลาดเคลื่อนทางยา
- **Dashboard:** ข้อมูลสรุปสำหรับหน้า Dashboard
- **Reports:** ระบบรายงานผล (summary 1–8)
- **MOPH Alert:** แจ้งเตือนเหตุการณ์ระดับรุนแรง (ระดับ D–I) ผ่าน MOPH Notify

> **หมายเหตุ:** ตั้งแต่ v1.4.0 ตัด KPHIS integration และ Telegram/Line Notify ออก เนื่องจาก frontend ปัจจุบันไม่ได้ใช้งาน

## 🛠 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository_url>
   cd api-med-error-node22-bun-elysia
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Environment Setup**
   สร้างไฟล์ `.env` (ดูตัวอย่างจาก `.env.development`)

   ```env
   NODE_ENV=development
   PORT=9000
   API_NAME=mederror
   MODE=SIT
   API_DIR=/api
   API_VERSION=/v1

   # JWT
   JWT_SECRET=your_jwt_secret

   # HIS Database (อ่านอย่างเดียว: opduser, doctor, patient, drugitems)
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=secret
   DB_NAME=hos
   DB_CHARSET=tis620

   # Backoffice Database (เก็บ med_error และตาราง master)
   BACKOFFICE_DB_HOST=localhost
   BACKOFFICE_DB_USER=root
   BACKOFFICE_DB_PASSWORD=secret
   BACKOFFICE_DB_NAME=medication_error_db

   # Allowlist (intranet only)
   ALLOWED_ORIGINS=http://localhost:3000
   ALLOWED_CLIENTS=<uuid-of-frontend>

   # MOPH Alert (สำหรับ med-error level D–I)
   MOPH_APT_URL=https://morpromt2f.moph.go.th
   MOPH_CLIENT_ID=
   MOPH_SECRET_ID=
   ```

## ▶️ Usage

### Development Mode
รันในโหมด Development พร้อม Hot Reload
```bash
bun run dev
```

### Production Build
Build โปรเจกต์ไปยังโฟลเดอร์ `dist`
```bash
bun run build
```

### Run Production
รันไฟล์ที่ Build แล้ว
```bash
bun run prod
```

## 📂 Project Structure

- `src/configs` - การตั้งค่าระบบและ Environment Variables
- `src/routes` - กำหนด Route ของ API (Auth, MedError, Dashboard, etc.)
- `src/controllers` - Logic การทำงานของแต่ละ Route
- `src/plugins` - Plugins ของ Elysia และ Database Connection
- `src/helpers` - Utility functions ต่างๆ
- `src/index.ts` - Entry Point ของ Application

## 🔗 API Endpoints

- `/auth` - Authentication related endpoints
- `/med-error` - Medical Error operations
- `/dashboard` - Dashboard data
- `/report` - Report generation
- `/alive` - Health check endpoint

---
**Note:** Ensure Bun is installed on your machine. Visit [bun.sh](https://bun.sh) for installation instructions.

## 🐳 Docker Deployment

For detailed deployment instructions, including how to build, push to Docker Hub, and deploy on a production server, please refer to [DEPLOY.md](./DEPLOY.md).

