# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.7] - 2026-02-03
### Changed
- **Docker Deployment Optimization**: ปรับปรุงไฟล์ `docker-compose.yml` (ทั้ง Development และ Production) ให้รองรับการโหลด Environment Variables ผ่านไฟล์ `.env` โดยตรง (`env_file`) ลดความซับซ้อนของการกำหนดค่า
- **Port Mapping**: ปรับปรุง Port Mapping ให้มีความยืดหยุ่นมากขึ้น (`${PORT}:${PORT}`)
- **Documentation**: อัปเดตคู่มือการ Deploy (`DEPLOY.md`) เพิ่มขั้นตอนการ Build, Push Docker Image และการตั้งค่า Environment Variables แบบใหม่

## [1.3.6] - 2026-02-03
### Changed
- **Docker Build Fix**: แก้ไขปัญหา Permission Error (`EACCES`) ใน Dockerfile โดยเพิ่ม `--chown=bun:bun` ในขั้นตอน Copy ไฟล์
- **Production Config**: ปรับปรุงไฟล์ `docker-compose-prod.yml` ให้ใช้งานได้จริง

## [1.3.5] - 2026-02-03
### Changed
- **Origin Check Logic Refactor**: ปรับปรุงการตรวจสอบ Origin ในทุก Route (`Auth`, `Dashboard`, `Kphis`, `MedError`, `Report`) ให้รองรับการ Fallback ไปใช้ `Referer` header กรณีที่ `Origin` header ไม่มี
- **HTTP Status Codes**: ปรับการตอบกลับ HTTP Status Code ให้เป็น `200 OK` เสมอสำหรับ cases error ต่างๆ (400, 401, 403, 404) แต่ยังคงส่ง status code จริงกลับใน body
- **Docker Optimization**: ปรับปรุง Dockerfile ไปใช้ Multi-stage build และใช้ `oven/bun:1.1.26-alpine` เพื่อลดขนาด Image (เหลือประมาณ ~130MB จากเดิม ~422MB)
- **Production Deployment**: เพิ่มโฟลเดอร์ `production_deploy` และไฟล์ `docker-compose.yml`, `env.example`, `README.md` สำหรับการ Deploy บน Server จริง

## [1.3.4] - 2026-01-29
### Added
- เพิ่ม endpoint ใหม่สำหรับการจัดการ report (`ReportRoute`)
- เพิ่ม configuration สำหรับ KPHIS database ใน `config.ts`

### Changed
- ปรับปรุง endpoint `/login`
- อัปเดต dependencies ใน `package.json`
- ปรับปรุง Database connection checking log ใน `index.ts`

## [1.3.3] - 2025-12-09
### Changed
- แก้ไข API `GET /get-error-type` เพิ่มเงื่อนไข CASE 3 All type

## [1.3.2] - 2025-12-05
### Added
- เพิ่มการแจ้งเตือนผ่าน **LINE OA (MOPH Notify API)**
  - สร้างฟังก์ชัน `sendReplyLineMessaging` เพื่อส่งข้อความตอบกลับ
  - รองรับการส่ง Headers: `client-key`, `secret-key`
- เตรียมระบบเพื่อทดแทน LINE Notify

## [1.0.2] - Initial Release
- เริ่มต้นโปรเจกต์ API Med Error
- โครงสร้างโปรเจกต์พื้นฐานด้วย ElysiaJS + Bun
- ระบบ Authentication (JWT)
- เชื่อมต่อฐานข้อมูล MySQL
