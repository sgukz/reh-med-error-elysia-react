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

- **Authentication:** ระบบ Login พร้อม JWT + **HTTP-only cookie** (verify ผ่าน opduser ของ HIS) — รองรับทั้ง intranet HTTP และ HTTPS ผ่าน env flags
- **Med Error Management:** API สำหรับจัดการรายงานความคลาดเคลื่อนทางยา
- **Master Data:** ประเภท Error พร้อม **Impact + Likelihood Score (1-5 ต่อตัว)** สำหรับคำนวณ Level = Impact + Likelihood
- **Dashboard:** ข้อมูลสรุปสำหรับหน้า Dashboard
- **Reports:** ระบบรายงานผล (summary 1–9 + drug pair) — Summary 9 รองรับเปรียบเทียบ 2 ช่วงเวลา + Δ%
- **MOPH Alert:** แจ้งเตือนเหตุการณ์ระดับรุนแรง (ระดับ D–I) ผ่าน MOPH Notify

> **หมายเหตุ v1.5.0:** เปลี่ยนกลไก authentication ไปใช้ **HTTP-only cookie** ลด attack surface ของ XSS (ฝั่ง browser อ่าน token ไม่ได้) — backend ยังรองรับ Authorization Bearer header เป็น fallback เพื่อความสะดวกระหว่าง transition
>
> **หมายเหตุ v1.4.0:** ตัด KPHIS integration และ Telegram/Line Notify ออก เนื่องจาก frontend ปัจจุบันไม่ได้ใช้งาน

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

   # Cookie Auth (v1.5.0+) — intranet HTTP ใช้ค่านี้, online HTTPS ตั้ง COOKIE_SECURE=true และ COOKIE_SAMESITE=none
   COOKIE_SECURE=false
   COOKIE_SAMESITE=lax
   COOKIE_MAX_AGE_SEC=86400
   COOKIE_NAME=access_token

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

- `/auth/login` - Login (set HTTP-only cookie + return token in body)
- `/auth/refresh` - Refresh JWT (อ่านจาก cookie/header → set cookie ใหม่)
- `/auth/profile` - Get user profile (verify cookie/header)
- `/auth/logout` - Clear HTTP-only cookie (v1.5.0+)
- `/med-error` - Medical Error operations
- `/med-error/reports/drug-pair-summary` - คู่ยาคลาดเคลื่อน (v1.5.0+)
- `/dashboard` - Dashboard data
- `/alive` - Health check endpoint

## 🗄️ Database Migrations

โปรเจกต์ใช้ Knex + raw SQL migration ใน `migrations/`:

```bash
# รัน migration แบบ idempotent ผ่าน Bun script (ตัวอย่าง v1.5.0):
bun run scripts/run-impact-score-migration.ts
```

หรือรัน SQL ตรงๆ ผ่าน MySQL client ตามไฟล์ใน `migrations/` (เรียงตามวันที่)

---
**Note:** Ensure Bun is installed on your machine. Visit [bun.sh](https://bun.sh) for installation instructions.

## 🐳 Docker Deployment

For detailed deployment instructions, including how to build, push to Docker Hub, and deploy on a production server, please refer to [DEPLOY.md](./DEPLOY.md).

