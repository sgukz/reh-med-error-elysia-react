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

### 2.2 Security Check — OWASP Top 10 (2025 / 2021 ratified)

**Checklist บังคับสำหรับทุก commit ที่แตะ endpoint / DB / auth / input handling / session / config**

แต่ละหัวข้อแม็พกับ **OWASP Top 10** อย่างชัดเจน — ถ้ายังไม่มี control ในข้อใด ให้แก้ก่อน commit + เพิ่ม `### Security` ใน CHANGELOG อ้างหมายเลข OWASP ที่ครอบคลุม

#### A01:2021 — Broken Access Control
- [ ] **Origin allowlist** — ตรวจ `Origin` header (fallback `Referer`) เทียบ `ALLOWED_ORIGINS` ก่อน business
- [ ] **Client allowlist** — ตรวจ `client-id` header เทียบ `ALLOWED_CLIENTS`
- [ ] **JWT verify** — `jwt.verify(token)` ก่อน access protected resource (return 401 ถ้า fail)
- [ ] **Role/Admin gate** — endpoint ที่ต้องการ admin ตรวจ `rule === 9` จาก `med_error_access` (return 403 ถ้า fail)
- [ ] **Object-level authorization** — ตรวจว่า user เข้าถึง resource ที่เป็นของตนเอง (ห้าม IDOR — ส่ง `error_id` แล้วเข้าถึง record ของ user อื่นได้)
- [ ] **Method gate** — endpoint POST/PUT/DELETE ต้องไม่รับ GET; verb tampering ถูกบล็อก

#### A02:2021 — Cryptographic Failures
- [ ] **TLS** — production ใช้ HTTPS (env flag `https`); ห้ามส่ง JWT/credentials ผ่าน HTTP plain
- [ ] **HTTP-only cookie** — token เก็บใน HTTP-only cookie (JS อ่านไม่ได้) → ลด XSS exfiltration
- [ ] **Secret rotation** — ไม่ commit secret จริงใน `.env.development`; rotate ก่อน production deploy (ระบุใน README แล้ว)
- [ ] **Password storage** — ไม่ store plaintext; auth ผ่าน HIS opduser (external) ไม่เก็บใน app DB

#### A03:2021 — Injection
- [ ] **SQL** — knex query builder + `this.db.raw('?', [bindings])` เท่านั้น; ห้าม template string ใส่ user input ใน raw SQL
- [ ] **NoSQL/Command** — ไม่ใช้ `exec()`, `eval()`, `child_process.exec` กับ user input
- [ ] **LDAP/XML/XSS** — escape ทุก user-rendered content ใน React (default safe); ห้าม `dangerouslySetInnerHTML` กับ user content
- [ ] **Header injection** — ไม่ปล่อย `\r\n` จาก user เข้า response header

#### A04:2021 — Insecure Design
- [ ] **Rate limiting** — endpoint ที่เปิดเปิด (login, search) ควรมี rate limit ใน reverse-proxy/CDN
- [ ] **Business logic guard** — ตรวจ pre-condition ก่อน mutate (เช่น `is_rca='Y'` ก่อนแสดง RCA report; `app_new='Y'` ก่อนนับสถิติ)
- [ ] **Threat model** — สำหรับ feature ใหม่ ระบุใน CHANGELOG ว่า attacker model อะไรที่ blocked
- [ ] **Default-deny** — endpoint ใหม่ default 403/401 ก่อน whitelist เงื่อนไขที่ผ่าน

#### A05:2021 — Security Misconfiguration
- [ ] **CORS** — `ALLOWED_ORIGINS` ต้องเป็น exact match (no `*`, no `null`)
- [ ] **Generic error response** — return `getReasonPhrase(500)` ไม่ใช่ `error.message` (กัน leak stack/DB schema/file path)
- [ ] **Debug routes** — ไม่ commit `/debug`, `/test`, swagger ฯลฯ ไป production
- [ ] **Headers** — `Content-Type: application/json`; ตั้ง `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY` ที่ reverse-proxy
- [ ] **DB pool** — `min:2 max:20` กัน connection exhaustion (DoS)

#### A06:2021 — Vulnerable and Outdated Components
- [ ] **Dependency check** — ก่อน commit ที่แก้ `package.json` รัน `bun audit` หรือ `npm audit` — เช็ค HIGH/CRITICAL
- [ ] **Lock file** — commit `bun.lockb` / `package-lock.json` คู่กับ `package.json` (กัน version drift)
- [ ] **เลิกใช้ลายเซ็นที่ deprecated** — เช่น md5, SHA-1 สำหรับ integrity

#### A07:2021 — Identification and Authentication Failures
- [ ] **JWT expiry** — มี `exp` claim; refresh token rotation
- [ ] **Logout effective** — `/auth/logout` ล้าง cookie จริง (`Max-Age=0`)
- [ ] **Brute force** — login retry มี delay / lockout (ถ้ายังไม่มี → ต้องอยู่ใน roadmap)
- [ ] **Session fixation** — ออก token ใหม่หลัง login (ไม่ reuse pre-login session id)

#### A08:2021 — Software and Data Integrity Failures
- [ ] **Migration safety** — SQL migration idempotent (`IF NOT EXISTS`, `IF EXISTS`); ทดสอบ rollback ได้
- [ ] **Input validation ก่อนเข้า DB** — regex date `^\d{4}-\d{2}-\d{2}$`, integer range/enum, array length cap, normalized
- [ ] **Deserialization** — ไม่ใช้ `eval(JSON)` หรือ `vm.runInNewContext` กับ user input
- [ ] **CI/CD trust** — ไม่ `npm install <untrusted-url>`; pin SHA สำหรับ third-party actions/scripts

#### A09:2021 — Security Logging and Monitoring Failures
- [ ] **Tag-only log** — `console.error('[Module] action error')` ห้าม log `error` object/SQL string/credentials
- [ ] **Audit trail** — write operation บันทึก `updated_by` + timestamp (มีใน schema แล้ว)
- [ ] **PII redaction** — ไม่ log HN/AN/รหัสประจำตัว/รหัสผ่านใน console/file
- [ ] **No verbose stack to client** — stack trace อยู่ฝั่ง server เท่านั้น

#### A10:2021 — Server-Side Request Forgery (SSRF)
- [ ] **No user-controlled fetch URL** — backend ไม่ทำ HTTP request ไป URL จาก user input
- [ ] **MOPH/HIS callouts** — host hard-coded ใน env ไม่ใช่ user query
- [ ] **PDF/image rendering** — ถ้ามี image proxy ต้อง whitelist domain

#### LLM-Specific (OWASP Top 10 for LLM Applications 2025)
ถ้า feature เกี่ยวกับ Claude/AI integration (ไม่ใช่ feature ปัจจุบัน — แต่อยู่ใน roadmap):
- [ ] **LLM01 Prompt Injection** — sanitize user input ที่ใส่ลง prompt; ใช้ structured input
- [ ] **LLM02 Insecure Output Handling** — treat LLM output as untrusted; escape ก่อน render
- [ ] **LLM06 Sensitive Information Disclosure** — ไม่ส่ง PII (HN/AN) เข้า prompt
- [ ] **LLM08 Excessive Agency** — LLM tool ต้อง human-in-the-loop สำหรับ destructive actions

#### Frontend-only checks
- [ ] **XSS-safe rendering** — React default escape; ห้าม `dangerouslySetInnerHTML` กับ user content
- [ ] **Client sanitize** — `Math.max(0, Number(v) || 0)` กันค่าลบ/NaN ก่อนส่งให้ backend (เช็คซ้ำที่ backend อีกชั้น)
- [ ] **withCredentials** — axios `withCredentials: true` (ตั้งใน `MedError.js` global default แล้ว)
- [ ] **ไม่ commit `.env*`** — ตรวจ `git status` ทุกครั้ง
- [ ] **Source map ใน production** — ปิด `GENERATE_SOURCEMAP=false` ตอน build production

**Severity classification**: ถ้าพบช่องโหว่ระดับ HIGH/CRITICAL ห้าม commit จนกว่าจะแก้ — สำหรับ MEDIUM/LOW เพิ่มเข้า issue tracker + แก้รอบถัดไป

**Reference**: [OWASP Top 10:2021](https://owasp.org/Top10/) (current ratified) • [OWASP Top 10 for LLM Apps 2025](https://genai.owasp.org/llm-top-10/)

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
[ ] 2.2 Security: OWASP Top 10 (2025/2021) — A01-A10 + LLM Top 10 ทุก control ที่เกี่ยวข้อง
[ ] 2.3 git add เฉพาะไฟล์ที่ต้องการ + commit ด้วย HEREDOC + Co-Authored-By
[ ] 2.4 git push origin main
```
