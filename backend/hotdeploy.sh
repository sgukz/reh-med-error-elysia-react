#!/usr/bin/env bash
# ==============================================================================
# hotdeploy.sh — Hot Deployment & Rebuild Script for API Med Error
#
# Execution Directory: /home/sgdev/deploy-med-error
# Destination:        /data-docker/data-deploy/sgdev/api-med-error-node22-bun-elysia-prod
# ==============================================================================

set -Eeuo pipefail

# บันทึก Directory ที่ผู้ใช้สั่งรันคำสั่งไว้ เพื่อให้กลับมาที่เดิมเมื่อเสร็จ
ORIGINAL_CWD="$(pwd)"

# ------------------------------------------------------------------------------
# 1. Configuration & Paths
# ------------------------------------------------------------------------------
# ค่า Default ของ Source และ Destination
SOURCE_DIR="/home/sgdev/deploy-med-error"
DEST_DIR="/data-docker/data-deploy/sgdev/api-med-error-node22-bun-elysia-prod"

# หากรัน script จากภายในโฟลเดอร์ /home/sgdev/deploy-med-error หรือ subfolder
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -d "$ORIGINAL_CWD" ] && [[ "$ORIGINAL_CWD" == *"/deploy-med-error"* || "$ORIGINAL_CWD" == *"/deploy-mederror"* ]]; then
    SOURCE_DIR="$ORIGINAL_CWD"
elif [ -d "$SCRIPT_DIR" ] && [[ "$SCRIPT_DIR" == *"/deploy-med-error"* || "$SCRIPT_DIR" == *"/deploy-mederror"* ]]; then
    SOURCE_DIR="$SCRIPT_DIR"
fi

# ตรวจสอบโครงสร้างว่าไฟล์แอปพลิเคชัน (Dockerfile/docker-compose.yml) อยู่ที่ root หรือใน backend/
ACTUAL_SRC_DIR="$SOURCE_DIR"
if [ ! -f "$SOURCE_DIR/Dockerfile" ] && [ -f "$SOURCE_DIR/backend/Dockerfile" ]; then
    ACTUAL_SRC_DIR="$SOURCE_DIR/backend"
fi

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn()    { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error()   { echo -e "${RED}[ERROR]${NC} $1"; }

echo "=============================================================================="
echo -e "${CYAN}🚀 เริ่มต้น Hot Deployment & Rebuild (reh-med-error API)${NC}"
echo "   Working Dir: $ORIGINAL_CWD"
echo "   Source:      $ACTUAL_SRC_DIR"
echo "   Destination: $DEST_DIR"
echo "   Timestamp:   $(date '+%Y-%m-%d %H:%M:%S')"
echo "=============================================================================="

# ------------------------------------------------------------------------------
# 2. Pre-flight Validation
# ------------------------------------------------------------------------------
if [ ! -d "$ACTUAL_SRC_DIR" ]; then
    log_error "ไม่พบไดเรกทอรีต้นทาง: $ACTUAL_SRC_DIR"
    exit 1
fi

if [ ! -d "$DEST_DIR" ]; then
    log_warn "ไม่พบไดเรกทอรีปลายทาง: $DEST_DIR -> กำลังสร้างโฟลเดอร์..."
    mkdir -p "$DEST_DIR"
fi

# ตรวจสอบ Git Commit / Branch (ถ้ามี)
if git -C "$SOURCE_DIR" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
    CURRENT_BRANCH=$(git -C "$SOURCE_DIR" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")
    LAST_COMMIT=$(git -C "$SOURCE_DIR" log -1 --format="%h - %s (%cd)" --date=short 2>/dev/null || echo "unknown")
    log_info "📌 Git Branch: ${CYAN}${CURRENT_BRANCH}${NC} | Last Commit: ${LAST_COMMIT}"
fi

# ------------------------------------------------------------------------------
# 3. Rsync — ซิงก์ไฟล์จาก Source ไปยัง Destination
# ------------------------------------------------------------------------------
log_info "📂 [1/4] กำลัง Sync โค้ดจาก Source ไปยัง Destination..."

# ตรวจสอบ trailing slash เพื่อให้แน่ใจว่าคัดลอกไฟล์ข้างใน
SRC_PATH="${ACTUAL_SRC_DIR%/}/"
DEST_PATH="${DEST_DIR%/}/"

# Options:
# -a : archive mode (รักษาสิทธิ์, timestamps, symlinks)
# -v : verbose
# --update : ข้ามไฟล์ที่ปลายทางใหม่กว่า
# --filter='P .env' : Protect .env ใน destination ไม่ให้ถูกลบ/เขียนทับโดยไม่ตั้งใจ
# --exclude : ละเว้น git, node_modules, temp files
rsync -av --update \
  --filter='P .env' \
  --exclude='.git' \
  --exclude='node_modules' \
  --exclude='.cache' \
  --exclude='dist' \
  "$SRC_PATH" "$DEST_PATH"

log_success "Sync โค้ดไปยัง $DEST_DIR เรียบร้อยแล้ว"

# ------------------------------------------------------------------------------
# 4. Security & Environment Configuration
# ------------------------------------------------------------------------------
cd "$DEST_DIR" || { log_error "ไม่สามารถเข้าสู่โฟลเดอร์ $DEST_DIR"; exit 1; }

log_info "🔒 [2/4] ตรวจสอบสิทธิ์และความปลอดภัยของ .env..."
if [ -f ".env" ]; then
    chmod 600 .env
    log_success "ตั้งค่า chmod 600 ให้ไฟล์ .env เรียบร้อย"
else
    log_warn "ไม่พบไฟล์ .env ใน $DEST_DIR (ใช้ค่าตาม environment หรือ config เริ่มต้น)"
fi

# ------------------------------------------------------------------------------
# 5. Hot Rebuild — Build Image ล่วงหน้าเพื่อลด Downtime
# ------------------------------------------------------------------------------
log_info "🐳 [3/4] กำลัง Build Docker Image ใหม่ (Hot Rebuild ขณะ container เก่ายังให้บริการ)..."

# Build Image ใหม่ให้เสร็จก่อนสลับ Container เพื่อให้ Downtime ใกล้เคียงศูนย์ (Near Zero Downtime)
docker compose build --pull

log_success "Build Docker Image ใหม่เสร็จเรียบร้อย"

# ------------------------------------------------------------------------------
# 6. Seamless Restart Container
# ------------------------------------------------------------------------------
log_info "🔄 [4/4] สลับรัน Container ด้วย Image ตัวใหม่..."

# up -d --remove-orphans จะ recreate เฉพาะ container ที่ image หรือ config เปลี่ยน
# โดย Docker จะ stop ตัวเก่าและ start ตัวใหม่ทันที
docker compose up -d --build

# ------------------------------------------------------------------------------
# 7. Post-Deployment Check & Cleanup
# ------------------------------------------------------------------------------
sleep 2

echo ""
log_info "📊 สถานะการทำงานของ Container ปัจจุบัน:"
docker compose ps

# ล้าง dangling images เก่าเพื่อประหยัดพื้นที่ Disk บนเซิร์ฟเวอร์
log_info "🧹 เคลียร์ dangling images เก่า (ถ้ามี)..."
docker image prune -f >/dev/null 2>&1 || true

# กลับมายังโฟลเดอร์ต้นทางที่สั่งรันคำสั่ง
cd "$ORIGINAL_CWD"

echo ""
echo "=============================================================================="
log_success "🎉 Hot Deployment เสร็จสมบูรณ์แล้ว! (กลับสู่: $(pwd))"
echo "=============================================================================="
