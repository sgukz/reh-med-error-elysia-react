# Version: 1.11.7
# ใช้ official Bun image ตรงตามเวอร์ชันที่พัฒนา (1.3.0)
FROM oven/bun:1.3.0-alpine AS base
LABEL version="1.11.7"

# ติดตั้ง tzdata สำหรับ timezone Asia/Bangkok ตั้งแต่ base stage เพื่อให้ cache ถาวร
ENV TZ=Asia/Bangkok
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/$TZ /etc/localtime && \
    echo $TZ > /etc/timezone

WORKDIR /usr/src/app

# ติดตั้ง dependencies เฉพาะ production (exclude devDependencies)
FROM base AS install
RUN mkdir -p /temp/prod
COPY package.json bun.lock* /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# Final Production Image
FROM base AS release
LABEL version="1.11.7"

# Copy เฉพาะ node_modules สำหรับ production
COPY --from=install --chown=bun:bun /temp/prod/node_modules node_modules

# Copy ซอร์สโค้ดของแอปพลิเคชัน
COPY --chown=bun:bun . .

ENV NODE_ENV=production

# รันด้วย User bun เพื่อความปลอดภัย (Non-root user)
USER bun
EXPOSE 8003/tcp

# รันแอปพลิเคชันโดยตรงในโหมด production
CMD [ "bun", "run", "src/index.ts" ]