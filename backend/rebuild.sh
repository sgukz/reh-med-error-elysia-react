#!/bin/bash

# ==========================================
# ตั้งค่าตัวแปร Path
# ==========================================
SOURCE_DIR="/home/sgdev/deploy-med-error/" # ใส่ / ต่อท้ายเพื่อให้ rsync คัดลอกเนื้อหาข้างใน
DEST_DIR="/data-docker/data-deploy/sgdev/api-med-error-node22-bun-elysia-prod"

echo "🚀 เริ่มต้นกระบวนการ Deploy..."

# ==========================================
# 1. Rsync ซิงก์โค้ดเฉพาะไฟล์ที่อัปเดต
# ==========================================
echo "📂 [1/3] กำลัง Sync โค้ดจาก Source ไปยัง Destination..."
# -a : รักษาโครงสร้างไฟล์ สิทธิ์ และ Timestamp (Archive)
# -v : แสดงรายละเอียดการทำงาน (Verbose)
# --update : ข้ามไฟล์ที่ปลายทางมีอัปเดตใหม่กว่า
# --exclude : ละเว้นโฟลเดอร์ที่ไม่จำเป็นต้องคัดลอก (ปรับแก้ได้ตามต้องการ)
rsync -av --update \
  --exclude='.git' \
  --exclude='node_modules' \
  "$SOURCE_DIR" "$DEST_DIR"

# ==========================================
# 2. ปรับสิทธิ์การอ่านไฟล์ .env
# ==========================================
echo "🔒 [2/3] ตั้งค่าความปลอดภัยให้ไฟล์ .env..."
ENV_FILE="$DEST_DIR/.env"

if [ -f "$ENV_FILE" ]; then
    # chmod 600: ให้เฉพาะ Owner ที่อ่านและเขียนได้ (ป้องกัน User อื่นหรือ Group เข้าถึง)
    chmod 600 "$ENV_FILE"
    echo "   ✅ ปรับสิทธิ์ $ENV_FILE เป็น 600 เรียบร้อยแล้ว"
else
    echo "   ⚠️ คำเตือน: ไม่พบไฟล์ .env ในโฟลเดอร์ปลายทาง"
fi

# ==========================================
# 3. รัน Docker Compose Build
# ==========================================
echo "🐳 [3/3] กำลังรัน Docker Compose Build..."
# ย้ายเข้าไปที่โฟลเดอร์ปลายทางก่อนรันคำสั่ง Docker
cd "$DEST_DIR" || { echo "❌ ไม่สามารถเข้าไปที่โฟลเดอร์ $DEST_DIR ได้"; exit 1; }

# โหลดค่าตัวแปรสภาวะแวดล้อมจาก .env เพื่อหาค่า PORT ที่ใช้งาน
if [ -f ".env" ]; then
    export $(grep -v '^#' .env | xargs)
fi

# ตรวจสอบและแก้ไขปัญหาพอร์ตชนกัน (Port Already Allocated)
PORT_TO_CHECK=${PORT:-8003}
echo "🔍 ตรวจสอบพอร์ต $PORT_TO_CHECK..."

# 3.1 ตรวจสอบและจัดการ Docker Container ที่ใช้พอร์ตนี้
CONFLICTING_CONTAINERS=$(docker ps -a --filter "publish=$PORT_TO_CHECK" -q)
if [ -n "$CONFLICTING_CONTAINERS" ]; then
    echo "⚠️ พบ Docker container ที่ใช้งานพอร์ต $PORT_TO_CHECK (ID: $CONFLICTING_CONTAINERS)"
    echo "🛑 กำลังหยุดและลบคอนเทนเนอร์เพื่อเคลียร์พอร์ต..."
    docker stop $CONFLICTING_CONTAINERS 2>/dev/null || true
    docker rm -f $CONFLICTING_CONTAINERS 2>/dev/null || true
    sleep 2 # รอให้ระบบเครือข่ายเคลียร์พอร์ต
fi

# 3.2 ตรวจสอบโปรเซสบน Host เครื่องหลัก
if command -v ss >/dev/null 2>&1; then
    HOST_PID=$(ss -lptn "sport = :$PORT_TO_CHECK" | grep -o 'pid=[0-9]*' | cut -d= -f2)
    if [ -n "$HOST_PID" ]; then
        echo "⚠️ พบโปรเซสบน Host (PID: $HOST_PID) กำลังใช้งานพอร์ต $PORT_TO_CHECK"
        ps -fp "$HOST_PID" 2>/dev/null || true
        PROCESS_NAME=$(ps -p "$HOST_PID" -o comm= 2>/dev/null)
        if [[ "$PROCESS_NAME" == *"node"* || "$PROCESS_NAME" == *"bun"* ]]; then
            echo "🛑 กำลังหยุดโปรเซส $PROCESS_NAME (PID: $HOST_PID) บน Host เพื่อป้องกันการแย่งพอร์ต..."
            kill -9 "$HOST_PID" 2>/dev/null || true
            sleep 1
        fi
    fi
fi

docker compose down

docker compose up -d --build

echo "🎉 กระบวนการ Deploy เสร็จสมบูรณ์!"

docker compose ps