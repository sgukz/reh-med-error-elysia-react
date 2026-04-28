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

- **Authentication:** ระบบ Login/Register พร้อม JWT
- **Med Error Management:** API สำหรับจัดการรายงานความคลาดเคลื่อนทางยา
- **Dashboard:** ข้อมูลสรุปสำหรับหน้า Dashboard
- **Reports:** ระบบรายงานผล
- **KPHIS Integration:** เชื่อมต่อข้อมูลกับระบบ KPHIS
- **Notifications:** รองรับการแจ้งเตือนผ่าน **LINE OA (MOPH Notify)** และ **Telegram**

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
   สร้างไฟล์ `.env` (ดูตัวอย่างจาก `.env.development` หรือ `.env.production`)

   ```env
   NODE_ENV=development
   PORT=9000
   
   # Database Configuration
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=secret
   DB_NAME=mederror_db
   
   # Backoffice Database
   BACKOFFICE_DB_HOST=localhost
   BACKOFFICE_DB_USER=root
   BACKOFFICE_DB_PASSWORD=secret
   BACKOFFICE_DB_NAME=backoffice_db
   
   # JWT
   JWT_SECRET=your_jwt_secret
   
   # External APIs & Notifications
   TELEGRAM_BOT_TOKEN=
   TELEGRAM_CHAT_ID=
   LINE_CHANNEL_ACCESS_TOKEN=
   MOPH_APT_URL=
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

