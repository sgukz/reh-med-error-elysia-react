# Skill: Standard Commit Workflow

> วิธีทำงานมาตรฐานเวลา **commit ทุกครั้ง** ในโปรเจกต์ reh-med-error-elysia-react
> ต้องทำให้ครบทั้ง **ข้อ 1** (docs/version) + **ข้อ 2** (scan/fix/security/commit/push)
>
> **Stack**: Elysia + Knex + MariaDB (backend) / React 18 + MUI v5 + xlsx (frontend), Bun runtime

---

## 1. Docs — CHANGELOG + README + version bump

**บังคับทำทุกครั้งที่มี code change** (user ขอชัดเจน):

1. `backend/package.json` — bump version (minor ถ้าเพิ่ม feature, patch ถ้าแค่ fix/refactor)
2. `frontend/package.json` — bump version ตาม scope ของการแก้ (ถ้าแก้แค่ backend ก็ไม่ต้อง bump frontend)
3. `backend/CHANGELOG.md` — เพิ่ม entry ใหม่ด้านบน:
   ```
   ## [x.y.z] - YYYY-MM-DD

   ### Added — <feature ชื่อสั้น>
   - bullet action-oriented...

   ### Fixed
   - bug ที่แก้ + root cause สั้น ๆ

   ### Security
   - validation/sanitization ที่เพิ่ม

   ### Performance (ถ้ามี)
   - tuning ที่ทำ + ก่อน/หลัง
   ```
4. `frontend/CHANGELOG.md` — เพิ่ม entry ใหม่ — เน้น UX/UI changes (Summary cards, Table behavior, Excel export, etc.)
5. `README.md` (root) — อัพเดทเลข version ของ frontend/backend + endpoint list ถ้ามี endpoint ใหม่
6. `backend/README.md` — อัพเดท Features bullet + Endpoints list (ถ้ามี endpoint ใหม่)
7. `frontend/README.md` — อัพเดท Features bullet (ใส่เวอร์ชันที่เพิ่ม feature เข้า)

**Convention**:
- Date = วันนี้ (อ่านจาก system context, แปลง relative dates → absolute)
- Bullet ต้อง **action-oriented** ("เพิ่ม endpoint X — return Y", "แก้ bug Z ด้วยการ ...") ไม่ใช่ "Endpoint X added"
- มี Security section อย่างน้อย 2-3 บรรทัดอธิบาย validation/sanitization ที่ทำ
- ภาษาผสมไทย-อังกฤษ OK — ตามที่โปรเจกต์ใช้

---

## 2. Scan & Fix Bug + Security Check + Commit + Push

**ทำทุกครั้งก่อน commit** — ห้ามข้ามขั้นไหน

### 2.1 Scan & Fix bugs (รอบสุดท้ายก่อน commit)

```bash
# Backend — TypeScript type check (ไม่ต้องสน optional-driver errors ของ knex pg/sqlite/mssql)
cd backend && bunx tsc --noEmit --skipLibCheck 2>&1 | grep -v "knex/lib/dialects" | head -50

# Frontend — Lint เฉพาะไฟล์ที่แก้ + ตรวจ ESLint errors (warnings PropTypes รับได้)
cd frontend && npx eslint <files-ที่แก้>
```

**สิ่งที่ต้องตรวจ** (manual review จาก git diff):
- [ ] ไม่มี `console.log()` ค้าง — ใช้ `console.error('[Module] error')` แบบ tag-only ถ้าจำเป็น
- [ ] ไม่มี `TODO` / `FIXME` ที่ commit ไปด้วยโดยไม่ตั้งใจ
- [ ] ไม่มี hardcoded secrets / API keys / passwords
- [ ] Error handling ครบ — `try/catch` รอบ async ที่ติดต่อ DB / external API
- [ ] React: `useEffect` dep array ตรง (หรือ comment `eslint-disable-next-line` ถ้าตั้งใจ)
- [ ] React: `useMemo`/`useCallback` สำหรับ derived state ที่ค่าใช้คำนวณสูง
- [ ] Backend: ใช้ knex query builder / parameterized — ไม่ string-concat user input ใน raw SQL
- [ ] `formatDateEN(null)` / `null.field` — เช็ค null/undefined ก่อนเรียก
- [ ] Excel export ใช้ `sorted` (ทั้งหมดหลัง filter) ไม่ใช่ `paged` (แค่หน้าปัจจุบัน)

**ถ้าเจอ bug** → แก้ก่อน commit + เพิ่ม `### Fixed` ใน CHANGELOG ของ scope ที่แก้

### 2.2 Security Check

**Checklist บังคับสำหรับทุก commit ที่แตะ endpoint / DB / auth / input handling**:

#### Backend endpoint
- [ ] **Origin allowlist** — ตรวจ `Origin` header (fallback `Referer`) เทียบ `ALLOWED_ORIGINS` ก่อน business
- [ ] **Client allowlist** — ตรวจ `client-id` header เทียบ `ALLOWED_CLIENTS`
- [ ] **JWT verify** — `jwt.verify(token)` ก่อน access protected resource
- [ ] **Admin gate** (ถ้า endpoint เป็น admin only) — เช็ค `rule === 9` จาก `med_error_access`
- [ ] **Input validation ก่อนเข้า DB** — regex date `^\d{4}-\d{2}-\d{2}$`, integer range/enum, array length cap
- [ ] **SQL safety** — knex query builder + `this.db.raw('?', [bindings])` (ห้าม template string ใส่ user input)
- [ ] **Error response generic** — return `getReasonPhrase(500)` ไม่ใช่ `error.message` (กัน leak stack/DB schema)
- [ ] **Console log แบบ tag** — `console.error('[Module] action error')` ไม่ log `error` object (กัน leak)
- [ ] **ลำดับ Gate**: `origin → client-id → token → JWT verify → input validate → admin (ถ้ามี) → business logic`

#### Frontend
- [ ] **XSS-safe** — `String(v).toLowerCase().includes(q)` ปลอดภัย, ห้าม `dangerouslySetInnerHTML` กับ user content
- [ ] **Sanitize ค่า input** — `Math.max(0, Number(v) || 0)` กันค่าลบ/NaN ก่อนส่งให้ backend
- [ ] **axios `withCredentials: true`** — ใช้ cookie-based auth (ตั้งใน `MedError.js` global default แล้ว)
- [ ] **ไม่ commit `.env*`** — ตรวจ git status ให้ดี

**ถ้าพบช่องโหว่** → แก้ก่อน commit + เพิ่ม `### Security` ใน CHANGELOG

### 2.3 Commit

```bash
# 1. ดูสถานะ + diff + ประวัติ commit message
git status
git diff
git log -5 --oneline

# 2. Stage เฉพาะไฟล์ที่แก้ — อย่าใช้ git add -A หรือ git add .
git add <file1> <file2> ...
# ตรวจ staged อีกที
git status

# 3. Commit ด้วย HEREDOC + Co-Authored-By
git commit -m "$(cat <<'EOF'
<type>: <subject สั้น ๆ ภาษาไทย/อังกฤษได้>

Backend (vX.Y.Z) — (ถ้ามี backend change):
- bullet สิ่งที่ทำ

Frontend (vX.Y.Z) — (ถ้ามี frontend change):
- bullet สิ่งที่ทำ

Fixed:
- bug + root cause (ถ้ามี)

Security:
- validation/sanitization ที่เพิ่ม (ถ้ามี)

Docs:
- CHANGELOG + README + version bump

Co-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>
EOF
)"

# 4. ตรวจ commit สำเร็จ
git log -1
```

**Commit message types**:
- `feat:` — feature ใหม่
- `fix:` — แก้ bug
- `refactor:` — restructure code ไม่เปลี่ยน behavior
- `perf:` — performance tuning
- `docs:` — docs only
- `chore:` — config/deps/build script

**ห้ามใช้**:
- `--no-verify` (ข้าม pre-commit hook) — ถ้า hook fail ให้แก้ root cause แทน
- `git add .` / `git add -A` (เสี่ยง commit `.env` / `.key` / cache)
- `--amend` กับ commit ที่ push ไปแล้ว
- skip hooks/signing flags อื่น ๆ

### 2.4 Push

```bash
git push origin main
```

**ห้าม**:
- `--force` / `--force-with-lease` ไป main (ถ้าจำเป็นจริง ๆ ต้องถาม user)
- Push ไป branch อื่นที่ user ไม่ได้สั่ง

ถ้า hook block หรือ push reject → diagnose root cause + แก้ + commit ใหม่ ไม่ใช่ bypass

---

## Quick checklist (สรุปรวบยอด)

ก่อน commit ทุกครั้ง:

```
[ ] 1.1 backend/package.json bumped (ถ้าแก้ backend)
[ ] 1.2 frontend/package.json bumped (ถ้าแก้ frontend)
[ ] 1.3 backend/CHANGELOG.md ใส่ entry ใหม่
[ ] 1.4 frontend/CHANGELOG.md ใส่ entry ใหม่
[ ] 1.5 README.md (root) version updated
[ ] 1.6 backend/README.md features/endpoints updated
[ ] 1.7 frontend/README.md features updated

[ ] 2.1 tsc / eslint ผ่าน
[ ] 2.1 manual scan: ไม่มี console.log / TODO / secrets / null deref
[ ] 2.2 Security: origin/client/JWT/validate/raw SQL safe/generic error
[ ] 2.3 git add เฉพาะไฟล์ที่ต้องการ + commit ด้วย HEREDOC + Co-Authored-By
[ ] 2.4 git push origin main
```
