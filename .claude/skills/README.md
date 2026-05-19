# Claude Code Skills — Project Setup

## What's installed here

ติดตั้ง Agent Skills จาก [anthropics/skills](https://github.com/anthropics/skills) (official) เพื่อให้ Claude Code ทำงานกับโปรเจกต์นี้ได้แม่นยำขึ้น:

| Skill | Path | Source | ใช้ตอนไหน |
|-------|------|--------|----------|
| **frontend-design** | `.claude/skills/frontend-design/` | [official](https://github.com/anthropics/skills/tree/main/skills/frontend-design) | สร้าง/ปรับ component React + MUI ที่มีคุณภาพระดับ production (ไม่ generic) |
| **webapp-testing** | `.claude/skills/webapp-testing/` | [official](https://github.com/anthropics/skills/tree/main/skills/webapp-testing) | E2E test ด้วย Playwright — รองรับทั้ง React frontend + Elysia backend |

## How skills get invoked

Claude Code อ่าน YAML frontmatter ของแต่ละ SKILL.md อัตโนมัติ:

- **Auto-invoke**: Claude สแกน `description:` ก่อนเริ่มงาน — ถ้าตรงกับสิ่งที่ user ขอ จะ load skill มาใช้เอง
- **Manual invoke**: `/frontend-design` หรือ `/webapp-testing` ใน Claude Code chat
- **Project-level**: ทุก skill ในโฟลเดอร์นี้ load อัตโนมัติเมื่อเปิด session ในโปรเจกต์นี้

## User-level skills (สำหรับโปรเจกต์อื่นที่คล้ายกัน)

ติดตั้งที่ `~/.claude/skills/` (Windows: `C:\Users\<username>\.claude\skills\`) แล้ว Claude Code จะใช้ได้ทุกโปรเจกต์:

| Skill | Path | ใช้ตอนไหน |
|-------|------|----------|
| **skill-creator** | `~/.claude/skills/skill-creator/` | สร้าง / แก้ / ปรับ skill ใหม่ — meta-skill |
| **claude-api** | `~/.claude/skills/claude-api/` | สำหรับโปรเจกต์ที่ใช้ `@anthropic-ai/sdk` (Claude API integration) |

## วิธีนำไปใช้กับโปรเจกต์อื่นที่คล้ายกัน (React + REST API)

### Option A: Copy โฟลเดอร์นี้ทั้งก้อน
```bash
cp -r /path/to/this-repo/.claude/skills /path/to/other-project/.claude/skills
```

### Option B: ติดตั้งเป็น user-level (ทุกโปรเจกต์ใช้ได้)
```bash
# Windows PowerShell
mkdir -Force "$env:USERPROFILE\.claude\skills\frontend-design"
mkdir -Force "$env:USERPROFILE\.claude\skills\webapp-testing\scripts"
Copy-Item ".claude/skills/frontend-design/SKILL.md" "$env:USERPROFILE\.claude\skills\frontend-design\"
Copy-Item ".claude/skills/webapp-testing/SKILL.md" "$env:USERPROFILE\.claude\skills\webapp-testing\"
Copy-Item ".claude/skills/webapp-testing/scripts/*" "$env:USERPROFILE\.claude\skills\webapp-testing\scripts\"
```

### Option C: Clone แล้วเลือก
```bash
git clone https://github.com/anthropics/skills /tmp/anthropic-skills
# Copy เฉพาะที่ต้องการ
cp -r /tmp/anthropic-skills/skills/<skill-name> .claude/skills/
```

## เพิ่ม skill ใหม่

1. สร้างโฟลเดอร์ `.claude/skills/<my-skill>/`
2. เขียน `SKILL.md` พร้อม YAML frontmatter:
   ```yaml
   ---
   name: my-skill
   description: <สิ่งที่ทำ + ใช้ตอนไหน> — รวม trigger keywords ให้ Claude match ได้
   ---
   ```
3. (Optional) ใส่ supporting files ใน subdirectory เช่น `scripts/`, `templates/`, `references/`
4. Reload Claude Code session — skill auto-load

ใช้ `/skill-creator` (user-level) ถ้าต้องการเทมเพลตเริ่มต้น + best practices

## References

- [Anthropic Skills Repo](https://github.com/anthropics/skills) — official 17 skills
- [Claude Code Skills Docs](https://code.claude.com/docs/en/skills) — frontmatter spec
- `../../AGENTS.md` — project commit workflow (docs/version/scan/OWASP security/commit) — auto-loaded โดย AI agents ที่รองรับมาตรฐาน [agents.md](https://agents.md/)
