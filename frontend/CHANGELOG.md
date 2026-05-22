# Changelog

## [1.23.4] - 2026-05-22

### Fixed
- แก้ไขปัญหา Warning ใน Console เกี่ยวกับ React Key prop spread (`<li {...props}>`) ใน component `Autocomplete` ที่ใช้งานในหน้าข้อมูล Medication error และหน้ารายงานต่างๆ (ReportSummary 2, 3, 8) โดยทำการแยก `key` ออกจาก `props` ก่อนส่งต่อ
- เพิ่ม `// eslint-disable-next-line react/prop-types` เพื่อข้ามการตรวจจับ prop types validation ของตัวแปร `key` ที่แยกออกมา

## [1.23.3] - 2026-05-22

### Added
- เพิ่มแถบเลื่อนแนวนอน (Scrollbar) ไว้ด้านบนของตารางข้อมูล Medication error เพื่อให้ผู้ใช้สามารถเลื่อนตารางซ้าย-ขวาได้สะดวกขึ้นเมื่อตารางแสดงจำนวนแถวแบบเต็มหน้าจอ (ไม่ต้องเลื่อนลงไปดูแถบเลื่อนด้านล่างสุด)

## [1.23.2] - 2026-05-22

### Fixed
- แก้ไขปัญหาตารางในหน้าข้อมูล Medication error ไม่ขยายความสูงตามจำนวน Rows per page ที่ผู้ใช้เลือก (เอา maxHeight ออกเพื่อให้แสดงครบทุกแถว)

## [1.23.1] - 2026-05-22

### Added
- เพิ่มระบบตัวกรองข้อมูล (Filter) ในหน้า ข้อมูล Medication error (สถานที่เกิดเหตุ, ประเภท Error, ระดับความรุนแรง, HAD)
- เพิ่ม minWidth ให้กับคอลัมน์ในตาราง Medication Error เพื่อป้องกันข้อความทับซ้อนและให้หัวตารางแสดงผลได้สมบูรณ์

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.23.0] - 2026-05-22

### Added โ€” เธซเธเนเธฒเธเธฑเธ”เธเธฒเธฃเน€เธเธ“เธ‘เน Likelihood เนเธขเธเธ•เธฒเธกเธเธฃเธฐเน€เธ เธ— Error (6 เธ•เธฒเธฃเธฒเธ)
- **LikelihoodCriteriaPage** ([frontend/src/pages/LikelihoodCriteriaPage.js](frontend/src/pages/LikelihoodCriteriaPage.js))
  - เน€เธเธฅเธตเนเธขเธเธเธฒเธ 3 เนเธ—เนเธ (Group) เน€เธเนเธ **6 เนเธ—เนเธเธ•เธฒเธกเธเธฃเธฐเน€เธ เธ— Error** (Prescription / Dispensing / Pre-Administration / Administration / Processing / Transcribing) โ€” เนเธ•เนเธฅเธฐเธเธฃเธฐเน€เธ เธ—เธกเธตเน€เธเธ“เธ‘เนเธเธงเธฒเธกเธ–เธตเนเธเธญเธเธ•เธฑเธงเน€เธญเธ
  - `ERROR_TYPE_CONFIG` (6 เธชเธต/gradient เนเธขเธเธเธฃเธฐเน€เธ เธ—) เนเธ—เธ `GROUP_CONFIG`; group เธเนเธญเธกเธนเธฅเธ”เนเธงเธข `error_type` เนเธ—เธ `group_id`
  - Tabs เน€เธเนเธ `variant="scrollable"` + scroll buttons เธฃเธญเธเธฃเธฑเธ 6 เนเธ—เนเธเธเธเธเธญเนเธเธ; label เธเธฃเธฐเธเธฑเธ (เธเธทเนเธญ EN + เธเธฃเธฐเน€เธ เธ—เธ—เธตเน N + เธเธณเธญเธเธดเธเธฒเธขเนเธ—เธข)
  - validation เธเนเธงเธเธเธฐเนเธเธ (gap/overlap/missing) + visual range bar + เธเธฑเธเธ—เธถเธเธฃเธงเธกเธ—เธธเธเธเธฃเธฐเน€เธ เธ—เนเธเธเธธเนเธกเน€เธ”เธตเธขเธง เธ—เธณเธเธฒเธเธเธฃเธ 6 เธเธฃเธฐเน€เธ เธ—

### Security
- A03:2021 Injection โ€” render เธเนเธฒเธ React (escape เธญเธฑเธ•เนเธเธกเธฑเธ•เธด) เนเธกเนเธกเธต `dangerouslySetInnerHTML`
- เธเนเธฒเธ—เธตเนเธเธฃเธญเธเธเนเธฒเธ `Math.max(0, n)` เธเธฑเธเธเนเธฒเธฅเธ/NaN เธเนเธญเธเธชเนเธ backend (เน€เธเนเธเธเนเธณเธ—เธตเน backend เธญเธตเธเธเธฑเนเธ)

## [1.22.1] - 2026-05-21

### Fixed โ€” Logout เนเธกเนเธฅเนเธฒเธ HTTP-only cookie เธเธฃเธดเธ
- **Header logout button** ([frontend/src/layouts/dashboard/header/index.js](frontend/src/layouts/dashboard/header/index.js))
- **NotificationsPopover logout button** ([frontend/src/layouts/dashboard/header/NotificationsPopover.js](frontend/src/layouts/dashboard/header/NotificationsPopover.js))
- Root cause: เธซเธฅเธฑเธ migrate เธกเธฒ HTTP-only cookie (v1.13.0+) เธเธธเนเธก logout เธ—เธฑเนเธ 2 เธเธธเธ”เธขเธฑเธเน€เธฃเธตเธขเธ `localStorage.removeItem('access_token')` + `navigate('/login')` เน€เธ—เนเธฒเธเธฑเนเธ โ€” เนเธกเนเนเธ”เนเธขเธดเธ `POST /auth/logout` เธ—เธณเนเธซเน cookie เธเธฑเนเธ backend เธเนเธฒเธ โ’ เธเธ” back / เน€เธเนเธฒ URL dashboard เธ•เธฃเธ เน เธขเธฑเธเน€เธเนเธฒเนเธ”เน โ’ เธเธนเนเนเธเนเธฃเธฒเธขเธเธฒเธเธงเนเธฒ "logout เนเธกเนเธญเธญเธ"
- Fix: เน€เธเธฅเธตเนเธขเธ `handleConfirmLogout` เนเธซเน `await useAuth().logout()` เธเนเธญเธ navigate โ€” context เธเธฐเน€เธฃเธตเธขเธ `apiLogout()` โ’ backend `clearAuthCookie()` เธฅเนเธฒเธ cookie เธเธฃเธดเธ เธเธฃเนเธญเธกเน€เธเธฅเธตเธขเธฃเน `accessToken`/`user` เนเธ memory state

### Security
- A07:2021 Identification & Authentication Failures โ€” `/auth/logout` เธ—เธณเธเธฒเธ effective เนเธฅเนเธง (`Max-Age=0` เธ—เธตเน backend `clearAuthCookie` + reset client state)
- เนเธกเนเนเธเน logic เธเธฑเนเธ backend (`AuthRoute.ts /logout`) โ€” control เธ—เธณเธเธฒเธเธ–เธนเธเธญเธขเธนเนเนเธฅเนเธง เนเธเน client เนเธกเนเนเธ”เนเน€เธฃเธตเธขเธ

## [1.22.0] - 2026-05-21

### Added โ€” Filter + table UX (Department / Officer / ErrorType)
- **DepartmentPage** ([frontend/src/pages/DepartmentPage.js](frontend/src/pages/DepartmentPage.js))
  - Filter `เธเธฃเธฐเน€เธ เธ— (Group)` derive เธเธฒเธเธเนเธญเธกเธนเธฅเธเธฃเธดเธ โ€” option เนเธชเธ”เธเธเธทเนเธญเธเธฅเธธเนเธก OPD/IPD/เธเธฒเธเธเธฅเธฑเธ/เธเธฒเธเธเธฅเธดเธ•/OPD2/OPD-Primary/เธเธฅเธฑเธเธเนเธฒเธ/TPN/เน€เธเธกเธตเธเธณเธเธฑเธ”
  - Filter `เธชเธ–เธฒเธเธฐ` (เน€เธเธดเธ”เนเธเนเธเธฒเธ N เธฃเธฒเธขเธเธฒเธฃ / เธเธดเธ”เนเธเนเธเธฒเธ N เธฃเธฒเธขเธเธฒเธฃ) เธกเธต count เนเธเธ•เธฑเธงเน€เธฅเธทเธญเธ
  - Search เธฃเธญเธเธฃเธฑเธเธเธทเนเธญเธซเธเนเธงเธขเธเธฒเธ + เธฃเธซเธฑเธช (`med_error_depcode`)
  - เน€เธเธดเนเธกเธเธญเธฅเธฑเธกเธเน `เธฃเธซเธฑเธช` (monospace) เนเธเธ•เธฒเธฃเธฒเธ
  - เนเธชเธ”เธ "เนเธชเธ”เธ X เธเธฒเธเธ—เธฑเนเธเธซเธกเธ” Y เธฃเธฒเธขเธเธฒเธฃ" เธ—เธฒเธ toolbar เธเธงเธฒ + เธเธธเนเธก "เธฅเนเธฒเธ filter"
- **OfficerPage** ([frontend/src/pages/OfficerPage.js](frontend/src/pages/OfficerPage.js))
  - Filter `เธเธฃเธฐเน€เธ เธ—เธ•เธณเนเธซเธเนเธ` (เน€เธ เธชเธฑเธเธเธฃ / เธเธเธฑเธเธเธฒเธเธเธฃเธฐเธเธณเธซเนเธญเธเธขเธฒ / เน€เธเนเธฒเธเธเธฑเธเธเธฒเธเน€เธ เธชเธฑเธเธเธฃเธฃเธก / เธญเธทเนเธเน) โ€” derive + count
  - เน€เธเธดเนเธกเธเธญเธฅเธฑเธกเธเน `เธฅเธณเธ”เธฑเธ` เนเธเธ•เธฒเธฃเธฒเธ (เธ•เธฒเธกเธซเธเนเธฒเธเธฑเธเธเธธเธเธฑเธ)
  - Counter + เธเธธเนเธก clear filter เน€เธซเธกเธทเธญเธเธเธฑเธเธ—เธฑเนเธเธฃเธฐเธเธ
- **ErrorTypePage** ([frontend/src/pages/ErrorTypePage.js](frontend/src/pages/ErrorTypePage.js))
  - Filter `เธเธฃเธฐเน€เธ เธ—เธซเธฅเธฑเธ` (Prescription / Processing / Dispensing / Pre-Admin / Administration) derive เธเธฒเธเธเนเธญเธกเธนเธฅ
  - Filter `Impact` (1-5 + "เธขเธฑเธเนเธกเนเธฃเธฐเธเธธ") โ€” เนเธ•เนเธฅเธฐ option เธกเธต count
  - Filter `เธชเธ–เธฒเธเธฐ` (เน€เธเธดเธ”เนเธเนเธเธฒเธ / เธเธดเธ”เนเธเนเธเธฒเธ)
  - Search เธฃเธญเธเธฃเธฑเธเธเธทเนเธญเธเธฃเธฐเน€เธ เธ— + เธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ” Error
  - เนเธขเธเธเธญเธฅเธฑเธกเธเน `#` (เน€เธฅเธ error_type_list, monospace) เธญเธญเธเธเธฒเธ `เธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ” Error`
  - เน€เธเนเธ Alert "เนเธชเธ”เธเน€เธเธเธฒเธฐเธฃเธฒเธขเธเธฒเธฃเธ—เธตเนเธเธฒเธ” Impact" เน€เธ”เธดเธกเนเธงเน + เธฃเธงเธกเน€เธเนเธฒเธเธฑเธ clear-filter handler
- เธ—เธธเธเธซเธเนเธฒ: TablePagination เธเธฃเธฑเธ label เน€เธเนเธเธ เธฒเธฉเธฒเนเธ—เธข (`เนเธ–เธงเธ•เนเธญเธซเธเนเธฒ:` / `X-Y เธเธฒเธ Z เธฃเธฒเธขเธเธฒเธฃ`), `count` เนเธเน `filteredXxx.length` เนเธ—เธ `medErrorXxx.length` เน€เธเธทเนเธญเนเธซเนเนเธชเธ”เธเธเธณเธเธงเธเธซเธฅเธฑเธ filter เธ–เธนเธเธ•เนเธญเธ
- เน€เธฅเธดเธเนเธเน `UserListToolbar` เนเธเธ—เธฑเนเธ 3 เธซเธเนเธฒ (toolbar shared) เนเธ—เธเธ”เนเธงเธข inline toolbar เธเธญเธเนเธ•เนเธฅเธฐเธซเธเนเธฒเนเธซเนเธเธขเธฒเธข filter เนเธ”เนเธญเธดเธชเธฃเธฐ

### Security
- Filter เน€เธเนเธ client-side เน€เธ—เนเธฒเธเธฑเนเธ โ€” เนเธกเนเธเธฃเธฐเธ—เธ data fetching / authorization
- Input เธเนเธฒเธ React default escape (A03:2021 Injection) โ€” search query เนเธเน `.toLowerCase().indexOf()` เธเธฅเธญเธ”เธ เธฑเธข
- Filter state เน€เธเนเธ primitive (`'all' | number | 'Y' | 'N'`) โ€” เนเธกเนเธกเธต user-controlled key injection

## [1.21.0] - 2026-05-21

### Added โ€” Glass header card propagation (UI consistency)
- **DepartmentPage** โ€” เธเธฃเธฑเธ header เน€เธเนเธ glass card + gradient teal text + icon (`eva:home-fill`) + sub-description เนเธซเนเน€เธซเธกเธทเธญเธเธซเธเนเธฒ Report
- **OfficerPage** โ€” เธเธฃเธฑเธ header เน€เธเนเธ glass card + icon (`eva:people-fill`) + sub-description
- **AnalysisPage** โ€” เธเธฃเธฑเธ header เน€เธเนเธ glass card + icon (`eva:search-fill`) + sub-description
- **ErrorTypePage** โ€” เธเธฃเธฑเธ header เน€เธเนเธ glass card + icon (`eva:layers-fill`) + sub-description
- **MedErrorPage** โ€” เธเธฃเธฑเธ header เน€เธเนเธ glass card เธชเธณเธซเธฃเธฑเธเธ—เธฑเนเธ 2 mode (เธฃเธฒเธขเธเธฒเธฃ / เธเธญเธฃเนเธก):
  - mode เธฃเธฒเธขเธเธฒเธฃ: icon `eva:file-text-fill` + เธเธธเนเธก "เธเธฑเธเธ—เธถเธเธเนเธญเธกเธนเธฅ Med Error"
  - mode เธเธญเธฃเนเธก: icon `eva:edit-fill` + title เธชเธฅเธฑเธเธ•เธฒเธก `error_section` (เนเธฃเธเธเธขเธฒเธเธฒเธฅเธฃเนเธญเธขเน€เธญเนเธ” / เธเธฅเธธเนเธกเธเธฒเธเน€เธ เธชเธฑเธเธเธฃเธฃเธก)
- responsive: column เธเธ xs, row เธเธ md เธเธถเนเธเนเธ (`xs: 'column', md: 'row'`)
- เธ—เธธเธเธซเธเนเธฒเนเธเน `guk-glass`, `guk-anim-fade-up`, `guk-gradient-text-teal` เธ•เธฃเธเธเธฑเธ ReportPage/LikelihoodCriteriaPage/DashboardAppPage

### Security
- UI presentation layer เน€เธ—เนเธฒเธเธฑเนเธ โ€” เนเธกเนเธเธฃเธฐเธ—เธ data fetching / authorization / business rule
- XSS-safe: เธ—เธธเธ text rendering เธเนเธฒเธ React default escape (A03:2021 Injection)

## [1.20.1] - 2026-05-21

### Added โ€” ReportSummary9: Likelihood chip color-coded
- **LikelihoodChip** component เนเธ "เธฃเธฒเธขเธเธฒเธเนเธขเธเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ” Error" โ€” เนเธชเธ”เธเธเธฐเนเธเธ Likelihood เน€เธเนเธ Chip เธชเธตเธ•เธฒเธกเธฃเธฐเธ”เธฑเธเธเธงเธฒเธกเธฃเธธเธเนเธฃเธ:
  - 5 = เนเธ”เธ (Frequent / เน€เธเธดเธ”เธเนเธญเธขเธกเธฒเธ)
  - 4 = เธชเนเธก (Likely / เน€เธเธดเธ”เธเนเธญเธข)
  - 3 = เน€เธซเธฅเธทเธญเธเธญเธณเธเธฑเธ (Possible / เธญเธฒเธเน€เธเธดเธ”)
  - 2 = เน€เธเธตเธขเธงเธญเนเธญเธ (Unlikely / เนเธกเนเธเนเธญเธขเน€เธเธดเธ”)
  - 1 = เน€เธเธตเธขเธง (Rare / เน€เธเธดเธ”เธเนเธญเธข)
  - 0 = เน€เธ—เธฒ (Never / เนเธกเนเน€เธเธดเธ”เน€เธฅเธข)
- Tooltip เธ—เธตเน Chip เนเธชเธ”เธ label EN + เนเธ—เธข เน€เธกเธทเนเธญ hover
- เธชเธตเธ•เธฃเธเธเธฑเธ LikelihoodCriteriaPage เน€เธเธทเนเธญเธเธงเธฒเธกเธชเธญเธ”เธเธฅเนเธญเธ (เน€เธฅเธเน€เธ”เธตเธขเธงเธเธฑเธ เธชเธตเน€เธ”เธตเธขเธงเธเธฑเธ)
- null/undefined โ’ เนเธชเธ”เธ Chip "โ€”" เนเธเธ outlined เธชเธตเน€เธ—เธฒ

### Security
- เนเธกเนเธเธฃเธฐเธ—เธ logic data fetching / business rule โ€” UI presentation layer เน€เธ—เนเธฒเธเธฑเนเธ
- XSS-safe rendering (React default escape)

## [1.20.0] - 2026-05-21

### Added โ€” UX/UI Likelihood criteria + propagate auto-likelihood เธ—เธธเธเธซเธเนเธฒ
- **LikelihoodCriteriaPage**: rewrite เนเธซเธกเนเธ—เธฑเนเธเธซเธเนเธฒ
  - Header glass card + gradient teal + เธเธณเธเธงเธ issue badge + เธเธธเนเธก Save gradient
  - เน€เธเธฅเธตเนเธขเธ layout เธเธฒเธ 3 cards เน€เธเนเธ **Tabs 3 เธเธฅเธธเนเธก** (Prescription / Processing-Pre-Admin-Transcribing / Dispensing-Admin) โ€” เธซเธเนเธฒเธชเธฐเธญเธฒเธ” เธชเธฅเธฑเธเธเธฅเธธเนเธกเนเธง เนเธกเนเธ•เนเธญเธ scroll เธขเธฒเธง
  - เนเธ•เนเธฅเธฐ tab เธกเธต **Visual Range Bar** เนเธชเธ”เธเธเนเธงเธ minโ€“max เธเธญเธเนเธ•เนเธฅเธฐ level (color-coded เธ•เธฒเธกเธเธฐเนเธเธ) + tooltip เธเธตเนเธเนเธงเธ
  - **ScorePill** เนเธชเธ”เธเธเธฐเนเธเธ + label EN (Frequent/Likely/Possible/Unlikely/Rare/Never) + label เนเธ—เธข โ€” เธเธนเนเนเธเนเน€เธเนเธฒเนเธเธฃเธฐเธ”เธฑเธเนเธ”เนเธ—เธฑเธเธ—เธต
  - **Validation visual feedback** โ€” เธ•เธฃเธงเธ gap (เธเนเธงเธเธซเธฒเธข), overlap (เธเนเธงเธเธ—เธฑเธ), missing (เธขเธฑเธเนเธกเนเธเธฃเธญเธ), invalid (min > max เธซเธฃเธทเธญ Level 5 เธกเธต max) โ’ เนเธชเธ”เธ Alert เธเธฃเนเธญเธกเธฃเธฒเธขเธเธฒเธฃ issue + Chip เธ•เธดเธ”เธ—เธตเนเนเธ–เธงเธ—เธตเนเน€เธเธดเธ”เธเธฑเธเธซเธฒ + เธเธดเธ”เธเธธเนเธก save เธ–เนเธฒเธกเธต issue
  - เธเนเธญเธ min/max เธกเธต endAdornment "เธเธฃเธฑเนเธ" + Level 0 เธฅเนเธญเธเน€เธเนเธ disabled + Level 5 เนเธชเธ”เธ chip "โ เนเธกเนเธเธณเธเธฑเธ”" เนเธ—เธ input
  - Tab title เธกเธต badge เนเธ”เธเธเธฑเธเธเธณเธเธงเธ issue เธเธญเธเธเธฅเธธเนเธกเธเธฑเนเธ เธ–เนเธฒเธกเธต
- **ErrorTypePage**: เธเธณ Likelihood เธญเธญเธ (Impact เธเธเธญเธขเธนเน)
  - เธฅเธ column "Likelihood" + popover เนเธเน score + FormControl เนเธ dialog + field เนเธ schema/defaultValues
  - alert "เธขเธฑเธเนเธกเนเนเธ”เนเธเธณเธซเธเธ”" เน€เธเธฅเธตเนเธขเธเน€เธเนเธเธเธนเธ”เธ–เธถเธ Impact เธญเธขเนเธฒเธเน€เธ”เธตเธขเธง + เนเธเนเธเธงเนเธฒ Likelihood เธเธณเธเธงเธ“เธญเธฑเธ•เนเธเธกเธฑเธ•เธดเธเธฒเธเธเธงเธฒเธกเธ–เธตเนเนเธเธฃเธฒเธขเธเธฒเธ
  - FormHelperText เธญเธเธดเธเธฒเธขเธงเนเธฒ Likelihood = auto-computed เธเธฒเธเธซเธเนเธฒ "เน€เธเธ“เธ‘เน Likelihood"
  - colSpan empty/notfound TableCell เธฅเธ”เธเธฒเธ 6 โ’ 5
- **ReportSummary9**: เธเธฃเธฑเธ messaging เนเธซเนเธชเธทเนเธญเธงเนเธฒ Likelihood เน€เธเนเธ auto
  - alert เน€เธ•เธทเธญเธเน€เธเธเธฒเธฐเนเธ–เธงเธ—เธตเนเธเธฒเธ” **Impact** (เนเธกเนเนเธเน Likelihood) โ€” เธเธญเธเนเธซเนเนเธเธซเธเนเธฒ "เธเนเธญเธกเธนเธฅเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธเธฃเธฐเน€เธ เธ— Error"
  - เธซเธฑเธงเธเธญเธฅเธฑเธกเธเน Likelihood เน€เธเธดเนเธก badge "AUTO" (เธชเธทเนเธญเธงเนเธฒเธฃเธฐเธเธเธเธณเธเธงเธ“เนเธซเน)
  - Subtitle เธญเธเธดเธเธฒเธขเธงเนเธฒ Likelihood Auto + เธฅเธดเธเธเนเนเธขเธเนเธเธซเธเนเธฒ "เน€เธเธ“เธ‘เน Likelihood"
- **ReportSummary6 (RCA)**: เน€เธเธดเนเธก Quick date presets + restore subtitle
  - Subtitle เนเธ•เนเธซเธฑเธงเธเนเธญเนเธชเธ”เธเธเนเธงเธเน€เธงเธฅเธฒเธ—เธตเนเธเธณเธฅเธฑเธเธ”เธน + เธเธฃเธฐเน€เธ เธ— Error (เน€เธเธขเน€เธเนเธ comment เธงเนเธฒเธ)
  - เนเธ–เธเธเธธเนเธกเธฅเธฑเธ” "เธเนเธงเธเน€เธงเธฅเธฒเธขเธญเธ”เธเธดเธขเธก": 7 เธงเธฑเธ / 30 เธงเธฑเธ / เน€เธ”เธทเธญเธเธเธตเน / เน€เธ”เธทเธญเธเธเนเธญเธ / เธเธตเธเธเธเธฃเธฐเธกเธฒเธ“ โ€” เธเธ”เธเธฃเธฑเนเธเน€เธ”เธตเธขเธงเธขเธดเธ filter เธ—เธฑเธเธ—เธต
  - เธเธธเนเธกเธชเธต teal palette + hover lift + border subtle เธ•เธฒเธก theme เธซเธฅเธฑเธ

### Changed
- เธซเธเนเธฒ "เธเนเธญเธกเธนเธฅเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธเธฃเธฐเน€เธ เธ— Error" Admin เนเธกเนเธ•เนเธญเธเธ•เธฑเนเธ Likelihood เธ•เนเธญเธฃเธฒเธขเธเธฒเธฃเธญเธตเธเนเธฅเนเธง โ€” เนเธเนเธ•เธฑเนเธเธเธฃเธฑเนเธเน€เธ”เธตเธขเธงเธ—เธตเน "เน€เธเธ“เธ‘เน Likelihood" เนเธฅเนเธงเธฃเธฐเธเธเธเธณเธเธงเธ“เนเธซเนเธ—เธธเธเธฃเธฒเธขเธเธฒเธ

### Security
- XSS-safe rendering (React default escape) โ€” input min/max sanitize เธ”เนเธงเธข `parseInt + Math.max(0, ...)` เธเนเธญเธ setState (เธเธฑเธ NaN/negative เธเนเธญเธเธชเนเธ backend)
- Backend `normalizeScore(undefined) === null` เธ—เธณเนเธซเนเธเธฒเธฃเนเธกเนเธชเนเธ likelihood_score เธเธฒเธ frontend เนเธกเนเธ—เธณ validation fail
- Tag-only console.error (`[LikelihoodCriteria] load error`) โ€” เนเธกเน leak error object/SQL
- เธซเนเธฒเธก admin role !== 9 เน€เธเนเธฒเธซเธเนเธฒ โ’ redirect /dashboard

## [1.19.1] - 2026-05-21

### Changed
- เธญเธฑเธเน€เธ”เธ• API_ROUTE.LIKELIHOOD เนเธ `constants.js` เน€เธเธทเนเธญเนเธซเนเธเธตเนเนเธเธขเธฑเธ Endpoint เนเธซเธกเนเธ—เธตเนเธญเธขเธนเนเธ เธฒเธขเนเธ•เน `/api/med-error/likelihood` เนเธซเนเธชเธญเธ”เธเธฅเนเธญเธเธเธฑเธ Backend Refactor

## [1.19.0] - 2026-05-21

### Added โ€” UI เธเธฑเธ”เธเธฒเธฃเน€เธเธ“เธ‘เน Likelihood เนเธฅเธฐเธเธนเธเธเธฑเธ Report 9
- เน€เธเธดเนเธกเธซเธเนเธฒเธเธญ Master Data "เน€เธเธ“เธ‘เน Likelihood" เธชเธณเธซเธฃเธฑเธเธเธณเธซเธเธ”เน€เธเธ“เธ‘เนเธเธงเธฒเธกเธ–เธตเนเธเธญเธเนเธ•เนเธฅเธฐเธเธฅเธธเนเธกเธเธฃเธฐเน€เธ เธ— Error
- เธเธฃเธฑเธเธเธฃเธธเธ ReportSummary9 เนเธซเนเธฃเธญเธเธฃเธฑเธเธเธฒเธฃเนเธชเธ”เธเธเธฅเธเธฐเนเธเธ Likelihood เธ—เธตเนเธชเนเธเธกเธฒเธเธฒเธเธเธฒเธฃเธเธณเธเธงเธ“เธญเธฑเธ•เนเธเธกเธฑเธ•เธดเนเธ Backend (เนเธ—เธเธเนเธฒเธเธเธ—เธตเน)
- เน€เธเธดเนเธกเน€เธกเธเธน "เน€เธเธ“เธ‘เน Likelihood" เนเธเนเธ–เธเธเธณเธ—เธฒเธ (nav) เธชเธณเธซเธฃเธฑเธ Admin (Rule 9)

## [1.18.0] - 2026-05-21

### Changed โ€” ReportSummary6 UX/UI เธเธฃเธฑเธเธเธตเธกเนเธฅเธฐเธเธงเธฒเธกเธชเธฐเธ”เธงเธ
- **Header card** เน€เธเธฅเธตเนเธขเธเน€เธเนเธ glass card (เธ•เธฒเธก Dashboard) + gradient text teal + icon badge เธ—เธฃเธเน€เธ”เธตเธขเธงเธเธฑเธ Executive Summary
- **Filter bar** เนเธขเธ row เธเธฑเธ”เน€เธเธ โ€” Title/Export เธญเธขเธนเนเนเธ–เธงเธเธ, DatePicker + Error Type Dropdown เธญเธขเธนเนเนเธ–เธงเธฅเนเธฒเธ + เธเธฑเนเธเธ”เนเธงเธข Divider เธชเธต teal
- **StatCard 6 เนเธ** เธเธฃเธฑเธเนเธซเธกเน โ€” icon Avatar เน€เธเนเธ rounded 14px + เธชเธต gradient เธ•เธฒเธก palette, เธเธญเธ card เธกเธต border/shadow เธ•เธฒเธก palette, hover lift effect, label เน€เธเนเธ uppercase caption เธชเธต secondary, เธเนเธฒเนเธชเธ”เธเน€เธเนเธ bold เธชเธตเธ•เธฒเธก category
- **Export Button** เน€เธเธฅเธตเนเธขเธเน€เธเนเธ gradient teal เธ•เธฒเธกเธเธตเธกเธซเธฅเธฑเธ + shadow glow
- **Search bar** เธเธฃเธฑเธ border radius 12px + focus border เธชเธต teal + icon เธชเธต teal + Chip badge เนเธชเธ”เธเธเธณเธเธงเธเธฃเธฒเธขเธเธฒเธฃเนเธ—เธเธเนเธญเธเธงเธฒเธก plain
- **Table** เธเธฃเธฑเธ: header gradient teal (darkโ’main), body cell padding เน€เธเธดเนเธกเธเธถเนเธ, border-bottom เธชเธต softer, severity row bg เน€เธเธฅเธตเนเธขเธเน€เธเนเธ alpha เน€เธเธฒ เน, hover row เน€เธเนเธ teal lighter, Chip เธ—เธธเธเธ•เธฑเธงเน€เธเธฅเธตเนเธขเธเน€เธเนเธ borderRadius 8px
- **Loading/Empty state** เน€เธเธดเนเธก icon inbox + center layout เธชเธงเธขเธเธถเนเธ
- **Paper wrapper** เธเธฃเธฑเธเน€เธเนเธ borderRadius 16px + subtle shadow เธ•เธฒเธกเธกเธฒเธ•เธฃเธเธฒเธ MUI v5
- **Pagination** เน€เธเธดเนเธก border-top separator + font-size เธเธฃเธฑเธเนเธซเนเธญเนเธฒเธเธเนเธฒเธข
- **Tab เนเธ ReportPage** เธขเนเธฒเธข "เธชเธฃเธธเธเธญเธธเธเธฑเธ•เธดเธเธฒเธฃเธ“เนเธ—เธตเนเนเธ”เน RCA เนเธฅเนเธง" เนเธเธญเธขเธนเนเธ—เนเธฒเธขเธชเธธเธ” (tab เธชเธธเธ”เธ—เนเธฒเธข) เธ•เธฒเธกเธ—เธตเน user เธเธฃเธฑเธเน€เธญเธ

### Security
- เนเธกเนเน€เธเธฅเธตเนเธขเธ logic เธเธฒเธฃเธ”เธถเธเธเนเธญเธกเธนเธฅ / validate / filter โ€” เธเธฃเธฑเธเน€เธเธเธฒเธฐ UI presentation layer
- เธขเธฑเธเธเธ XSS-safe rendering (React default escape, เนเธกเนเนเธเน dangerouslySetInnerHTML)

## [1.17.1] - 2026-05-21

### Fixed
- เนเธเนเนเธเธเธฑเธเธซเธฒ ESLint warning เนเธ `ReportSummary6` เน€เธฃเธทเนเธญเธ missing prop types validation เนเธ”เธขเธเธฒเธฃเธเธณเน€เธเนเธฒ `prop-types` เนเธฅเธฐเน€เธเธดเนเธก validation เนเธซเนเธเธฑเธ `StatCard` เนเธฅเธฐ `RcaDaysChip`

### Security
- เน€เธเธดเนเธก Type validation เธเธญเธ props เธชเธณเธซเธฃเธฑเธ React components เน€เธเธทเนเธญเธเนเธญเธเธเธฑเธ runtime/rendering errors (OWASP A08:2021)

## [1.17.0] - 2026-05-19

### Added โ€” ReportSummary6 (เธชเธฃเธธเธเธญเธธเธเธฑเธ•เธดเธเธฒเธฃเธ“เนเธ—เธตเนเนเธ”เน RCA เนเธฅเนเธง)
- เธซเธเนเธฒเธฃเธฒเธขเธเธฒเธเนเธซเธกเน: Tab "เธชเธฃเธธเธเธญเธธเธเธฑเธ•เธดเธเธฒเธฃเธ“เนเธ—เธตเนเนเธ”เน RCA เนเธฅเนเธง" + Chip "New" เนเธ `ReportPage` (value="6")
- **Filter bar**: DatePicker (default = เธ•เนเธเธเธตเธเธ เธ.เธข./เธ•เธ.-เธเธข. เธเธเธ–เธถเธเธงเธฑเธเธเธตเน) + Dropdown เธเธฃเธฐเน€เธ เธ— Error (เธ—เธฑเนเธเธซเธกเธ” + 6 เธเธฃเธฐเน€เธ เธ—) + Export Excel
- **Summary Cards 6 เนเธ**: เธเธณเธเธงเธ RCA / เธฃเธฐเธ”เธฑเธ E+ / HAD / เน€เธงเธฅเธฒเธ•เธญเธเธชเธเธญเธเน€เธเธฅเธตเนเธข (เธงเธฑเธ) / เธเธฃเธฐเน€เธ เธ—เธเธเธเนเธญเธขเธชเธธเธ” / เธซเธเนเธงเธขเธเธฒเธเธเธเธเนเธญเธขเธชเธธเธ” โ€” เนเธชเธ”เธ icon + label + เธเนเธฒ เธเธฒเธ `summary` เธ—เธตเน backend เธเธณเธเธงเธ“เนเธซเน
- **เธ•เธฒเธฃเธฒเธ 17 เธเธญเธฅเธฑเธกเธเน** เธเธฃเนเธญเธก:
  - **Sort** เนเธ”เนเธ—เธธเธเธเธญเธฅเธฑเธกเธเนเธซเธฅเธฑเธ (numeric เธชเธณเธซเธฃเธฑเธ rca_days, string เธชเธณเธซเธฃเธฑเธเธญเธทเนเธ เน) โ€” default `error_date DESC`
  - **Search** client-side: เน€เธซเธ•เธธเธเธฒเธฃเธ“เน / เธซเธเนเธงเธขเธเธฒเธ / rca_text / เธเธนเนเธเธฑเธเธ—เธถเธ / เนเธเธ—เธขเน / เธเธฃเธฐเน€เธ เธ— / detail
  - **TablePagination** (10/25/50/100 โ€” default 25)
  - **เธชเธตเนเธ–เธงเธ•เธฒเธก severity**: A-D เน€เธเธตเธขเธงเธญเนเธญเธ, E-F เน€เธซเธฅเธทเธญเธเธญเนเธญเธ, G-I เนเธ”เธเธญเนเธญเธ
  - **Chip เธฃเธฐเธ”เธฑเธเธเธงเธฒเธกเธฃเธธเธเนเธฃเธ**: เธชเธตเธ•เธฒเธก level (success/warning/error)
  - **Chip HAD**: เธชเนเธกเธ–เนเธฒ "High Alert Drugs" / เน€เธ—เธฒ outline เธ–เนเธฒ Non-HAD
  - **Chip เธฃเธฐเธขเธฐเน€เธงเธฅเธฒ RCA**: success โค7 เธงเธฑเธ, warning โค30 เธงเธฑเธ, error >30 เธงเธฑเธ
  - **Tooltip** เธเธเธเธญเธฅเธฑเธกเธเนเธ—เธตเนเธญเธฒเธเธขเธฒเธง (event, type_detail, analysis, clear, rca_text) โ€” show เธ•เธฑเธงเน€เธ•เนเธกเน€เธกเธทเนเธญ hover
- **Export Excel 2 sheets**: "เธชเธฃเธธเธ RCA" (เธชเธ–เธดเธ•เธดเธเธฒเธ summary) + "เธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ” RCA" (เธ•เธฒเธฃเธฒเธเธ—เธฑเนเธเธซเธกเธ”เธ—เธตเนเธเนเธฒเธ filter, เนเธกเนเนเธเนเนเธเน page เธเธฑเธเธเธธเธเธฑเธ)
- `libs/MedError.js`: เน€เธเธดเนเธก `getReportSummary6` (เนเธเน `buildReportSummary` factory เธ—เธตเนเธกเธตเธญเธขเธนเน)

### Security
- เธชเนเธ `errorType` เน€เธเนเธเธ•เธฑเธงเน€เธฅเธเน€เธชเธกเธญ (0 = เนเธกเน filter; 1-6 = filter) โ€” backend clamp เธญเธตเธเธเธฑเนเธ
- เธเนเธเธซเธฒ client-side เนเธเน `String(v).toLowerCase().includes(q)` เธเธฅเธญเธ”เธ เธฑเธขเธเธฒเธ XSS (เนเธกเน render HTML เธเธฒเธ user)
- เธเธฃเธฑเธเธเนเธฒ `errorType` / `firstDate` / `lastDate` เนเธฅเนเธงเธฃเธตเน€เธเนเธ• page เน€เธเนเธ 0 เธ—เธธเธเธเธฃเธฑเนเธ โ€” เธเธฑเธ edge case เนเธชเธ”เธเธซเธเนเธฒเธงเนเธฒเธเน€เธเธฅเนเธฒเธซเธฅเธฑเธ filter

## [1.16.0] - 2026-05-19

### Added โ€” ReportSummary10 (เธชเธ–เธดเธ•เธดเธเธณเธเธงเธเนเธเธชเธฑเนเธเธขเธฒ/เธงเธฑเธเธเธญเธ)
- เธซเธเนเธฒเธฃเธฒเธขเธเธฒเธเนเธซเธกเน 4 เธ•เธฒเธฃเธฒเธ โ€” TABLE 0 (admin เธเธฃเธญเธเธเนเธญเธกเธนเธฅเธเธฃเธดเธกเธฒเธ“ IPD/OPD), A (IPD errors), B (OPD errors), C (เธญเธฑเธ•เธฃเธฒ/1,000)
- เนเธเนเธเธตเธเธเธเธฃเธฐเธกเธฒเธ“ เธ.เธจ. (เธ•เธ.-เธเธข.) โ€” เน€เธฅเธทเธญเธเนเธ”เนเธขเนเธญเธเธซเธฅเธฑเธ 5 เธเธต + เธเธตเธซเธเนเธฒ
- TABLE 0: TextField เธชเธณเธซเธฃเธฑเธ admin (`rule===9`), read-only เธชเธณเธซเธฃเธฑเธ user โ€” Switch เนเธซเธกเธ”เน€เธซเนเธเนเธ”เนเนเธ UI
- TABLE A/B: 6 error types ร— 12 เน€เธ”เธทเธญเธ ร— HAD/Non-HAD/เธฃเธงเธก + เนเธ–เธงเธเธฅเธฃเธงเธก + เธเธญเธฅเธฑเธกเธเนเธฃเธงเธกเธ—เธฑเนเธเธซเธกเธ”
- TABLE C: 4 sections (IPD / IPD-HAD / OPD / OPD-HAD) โ€” เธชเธนเธ•เธฃ `count ร— 1000 / volume` (2 เธ—เธจเธเธดเธขเธก)
- **Export Excel 4 sheets** โ€” TABLE 0 / A / B / C
- Tab "เธชเธ–เธดเธ•เธดเธเธณเธเธงเธเนเธเธชเธฑเนเธเธขเธฒ/เธงเธฑเธเธเธญเธ" + Chip "New" เนเธ ReportPage (value="10")
- `libs/MedError.js`: `getReportSummary10`, `getStatVolume`, `saveStatVolume`

### Security
- Client-side sanitize เธเนเธฒ input เนเธ TABLE 0 โ€” เธเนเธญเธเธเธฑเธเธเนเธฒเธฅเธ / NaN / string (เธเนเธฒเธ `handleEditCell` + `Math.max(0, ...)` เธเนเธญเธเธชเนเธ)
- เน€เธเธฅเธตเธขเธฃเน state เน€เธเนเธฒเธเนเธญเธ fetch เธเธตเนเธซเธกเน โ€” เธเธฑเธ flash เธเธญเธเธเนเธญเธกเธนเธฅเธเธตเธเนเธญเธเธฃเธฐเธซเธงเนเธฒเธ loading

### Performance โ€” Map O(1) lookup + useMemo
เธเนเธญเธเธซเธเนเธฒเธเธตเน render เธเธญเธ ReportSummary10 เนเธเน `.find()` เนเธ `errorCounts` array เธ—เธธเธ cell (~500 cells ร— O(n))
- เน€เธเธดเนเธก `countsMap` + `volumeMap` (Map keyed by `${type}-${year}-${month}-${ward}`) โ€” เธชเธฃเนเธฒเธเธเธฃเธฑเนเธเน€เธ”เธตเธขเธงเธ•เนเธญ data change เธ”เนเธงเธข `useMemo`
- `aggregates` pre-compute `perCell` / `perMonth` / `perType` / `grand` เธเธญเธ IPD + OPD เนเธเธฃเธญเธเน€เธ”เธตเธขเธง
- เธฅเธ inner-loop sums เนเธ totals row โ’ render เนเธเน Map.get() O(1)
- `getCellValue` เธซเนเธญเธ”เนเธงเธข `useCallback`
- Excel export เนเธเน `aggregates` เน€เธ”เธตเธขเธงเธเธฑเธ โ€” เนเธกเนเธเนเธณเธเธณเธเธงเธ“
- Complexity: O(nยฒ) โ’ O(n + cells)

## [1.15.1] - 2026-05-19

### Fixed
- **MedErrorPage**: เธขเนเธฒเธข `<Backdrop>` เธญเธญเธเธเธฒเธ `<TableBody>` เน€เธเนเธ sibling เธเธญเธ `<Scrollbar>` เนเธเน DOM validation warning `<div> cannot appear as a child of <tbody>` (Backdrop เน€เธเนเธ overlay เน€เธ•เนเธกเธซเธเนเธฒเธญเธขเธนเนเนเธฅเนเธง เนเธกเนเธ•เนเธญเธเธญเธขเธนเนเนเธ table)

### Changed โ€” ReportPage / ReportSummary9
- เน€เธเธดเนเธก **Chip "New"** เธ—เธตเนเนเธ—เนเธ "เธฃเธฒเธขเธเธฒเธเนเธขเธเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ” Error" (เนเธเน pattern เน€เธ”เธตเธขเธงเธเธฑเธ "เธเธนเนเธขเธฒเธเธฅเธฒเธ”เน€เธเธฅเธทเนเธญเธ")
- **Export Excel เธเธญเธ Report 9 เธเธฃเธฑเธเนเธซเนเน€เธซเธกเธทเธญเธ Report 4**:
  - Button: `variant="contained"` + icon `eva:file-text-fill` + dynamic color เน€เธกเธทเนเธญ disabled
  - เธ•เธณเนเธซเธเนเธ: เธขเนเธฒเธขเนเธเธญเธขเธนเน row เธซเธฑเธงเธเนเธญ (justify-between) เนเธ—เธ filter row
  - Code: เนเธเน `XLSX.utils.json_to_sheet(data)` เธ•เธฃเธ เน (เนเธกเนเธกเธต header rows เธเธดเน€เธจเธฉ) โ€” header เน€เธเนเธ column เธ เธฒเธฉเธฒเนเธ—เธข, sheet name `'เนเธขเธเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ” Error'`, file name `เธฃเธฒเธขเธเธฒเธเนเธขเธเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”_Error_{type}_{YYYYMMDD_HHmmss}.xlsx`

## [1.15.0] - 2026-05-12

### เธฃเธทเนเธญเธฃเธฒเธขเธเธฒเธ "เนเธขเธเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ” Error" (ReportSummary9) เนเธซเธกเนเธ—เธฑเนเธเนเธเธฅเนเธ•เธฒเธกเธ•เนเธเนเธเธ
- เน€เธเธฅเธตเนเธขเธ layout เธเธฒเธ ward ร— type matrix โ’ **subtype detail report**:
  - เธเธญเธฅเธฑเธกเธเน: เธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ” Error (subtype) | HAD | Non-HAD | เธฃเธงเธก | Impact | Likelihood | **Level** (Impact + Likelihood)
  - เนเธ–เธงเธชเธธเธ”เธ—เนเธฒเธข "เธเธฅเธฃเธงเธก" เธฃเธงเธก HAD/Non-HAD/Total เธ—เธฑเนเธ period
  - Cell เธเธญเธ Level color-coded: โค3 cyan, 4-6 green, 7 yellow, โฅ8 red
- **เน€เธเธดเนเธก "เน€เธเธฃเธตเธขเธเน€เธ—เธตเธขเธ 2 เธเนเธงเธเน€เธงเธฅเธฒ" (Compare 2 periods)**:
  - Toggle เน€เธเธดเธ”-เธเธดเธ”เนเธ”เน
  - เน€เธฅเธทเธญเธ Period A + Period B โ’ เนเธชเธ”เธ HAD/Non-HAD/เธฃเธงเธก เธเธญเธเธ—เธฑเนเธ 2 เธเนเธงเธเธเธฃเนเธญเธกเธเธญเธฅเธฑเธกเธเน ฮ”% (เน€เธเธตเธขเธง=เธฅเธ”, เนเธ”เธ=เน€เธเธดเนเธก)
  - เธชเธตเธเธทเนเธ Period B เนเธเนเนเธ—เธเธชเนเธก (#fff8e1) เนเธขเธเธเธฒเธ Period A
- เธเธฃเธฐเน€เธ เธ— Error เน€เธฅเธทเธญเธเธเนเธฒเธ Autocomplete required (1 เธเธฃเธฐเน€เธ เธ—: Prescription / Dispensing / Pre-Admin / Admin / Processing / Transcribing)
- **Export Excel** โ€” เธฃเธงเธกเธซเธฑเธง, เธเนเธงเธเธงเธฑเธเธ—เธตเน, เธเนเธญเธกเธนเธฅเธ—เธธเธเนเธ–เธง + เธเธฅเธฃเธงเธก

### ErrorTypePage โ€” เน€เธเธดเนเธก Likelihood + เธเธฃเธฑเธ UI เธ•เธฃเธงเธเธชเธญเธเธเธงเธฒเธกเธชเธกเธเธนเธฃเธ“เนเธเธญเธเธเธฐเนเธเธ
- เน€เธเธดเนเธกเธเธญเธฅเธฑเธกเธเน **Likelihood** (Chip เธเธฅเธดเธเนเธ”เน inline editor เน€เธซเธกเธทเธญเธ Impact)
- เน€เธเธดเนเธก Select "เธเธฐเนเธเธ Likelihood (1-5)" เนเธเธเธญเธฃเนเธก Add/Edit
- เน€เธเธฅเธตเนเธขเธ Chip เธเธญเธเธฃเธฒเธขเธเธฒเธฃเธ—เธตเนเธขเธฑเธเนเธกเนเธฃเธฐเธเธธ Impact/Likelihood เน€เธเนเธ **`เธขเธฑเธเนเธกเนเธฃเธฐเธเธธ` (warning + icon)** เนเธซเนเธชเธฑเธเน€เธเธ•เน€เธซเนเธเธเนเธฒเธข
- เน€เธเธดเนเธก **Alert banner** เธ”เนเธฒเธเธเธเธ•เธฒเธฃเธฒเธ: เนเธเนเธเธเธณเธเธงเธเธฃเธฒเธขเธเธฒเธฃเธ—เธตเนเนเธเนเธเธฒเธเธญเธขเธนเนเนเธฅเธฐเธขเธฑเธเนเธกเนเนเธ”เนเธเธณเธซเธเธ” Impact/Likelihood เธเธฃเธ เธเธฃเนเธญเธก **Switch "เนเธชเธ”เธเน€เธเธเธฒเธฐเธฃเธฒเธขเธเธฒเธฃเธ—เธตเนเธเธฒเธ”"** เนเธซเน filter เนเธ”เนเธ—เธฑเธเธ—เธต
- Inline Impact/Likelihood handlers เนเธเน helper เธฃเนเธงเธกเธเธฑเธ (`saveScoreField`) โ€” preserve field เธญเธตเธเธเธดเธฅเธ”เนเน€เธชเธกเธญเธ•เธญเธ save

## [1.14.0] - 2026-05-12

### Inline Impact Score Editor
- เน€เธเธดเนเธก Popover เธชเธณเธซเธฃเธฑเธเนเธเนเนเธเธเธฐเนเธเธ Impact (Impact Score) เนเธ”เธขเธ•เธฃเธเนเธเธ•เธฒเธฃเธฒเธเธซเธเนเธฒ "เธเนเธญเธกเธนเธฅเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธเธฃเธฐเน€เธ เธ— Error" เนเธ”เธขเนเธกเนเธ•เนเธญเธเน€เธเธดเธ”เธเธญเธฃเนเธกเนเธเนเนเธ
- เธฃเธญเธเธฃเธฑเธเธเธฒเธฃเนเธเนเนเธเธเนเธฒ 1-5 เนเธฅเธฐเธฅเนเธฒเธเธเนเธฒ (null) เธเธฃเนเธญเธกเธเธฑเธเธ—เธถเธเธ—เธฑเธเธ—เธต

### เธเธฃเธฑเธเธเธฃเธธเธเธฃเธฐเธเธ Authentication เนเธฅเธฐเนเธเนเธเธฑเนเธ
- เนเธเนเนเธเธเธฑเธเธซเธฒเธซเธเนเธฒ Login เธงเธเธฅเธนเธ (Infinite Redirect Loop) เนเธ”เธขเธเธฃเธฑเธเนเธเธฃเธเธชเธฃเนเธฒเธ Route
- เน€เธเธฅเธตเนเธขเธเธ—เธธเธเธเธธเธ”เธ—เธตเนเธกเธตเธเธฒเธฃเน€เธฃเธตเธขเธ `getTokenFromLocalStorage` เน€เธเนเธเธเธฒเธฃเนเธเน Cookie (`verifyToken(null)`)
- เน€เธเธดเนเธก Safe Destructuring (`|| {}`) เธ•เธญเธเน€เธฃเธตเธขเธ `verifyToken` เธเนเธญเธเธเธฑเธเนเธญเธเธเธฑเธเธเธฃเธ“เธตเธเธทเธเธเนเธฒ null
- เน€เธเธดเนเธก `axios.defaults.withCredentials = true` เนเธ `libs/MedError.js` เนเธซเนเธ—เธธเธ API เธเธญ Cookie เธญเธฑเธ•เนเธเธกเธฑเธ•เธด เธเนเธญเธเธเธฑเธ backend error 500
- เธฅเธ Import `getTokenFromLocalStorage` เธ—เธตเนเนเธกเนเนเธเนเธญเธญเธเธ—เธฑเนเธเธซเธกเธ” 15 เนเธเธฅเน

## [1.13.0] - 2026-05-11

### เน€เธเธฅเธตเนเธขเธเธเธฅเนเธ Authentication เน€เธเนเธ HTTP-only Cookie
- `libs/Auth.js`:
  - `storeTokenInLocalStorage` / `getTokenFromLocalStorage` / `removeTokenFromLocalStorage` เธเธฅเธฒเธขเน€เธเนเธ **no-op** (token เธญเธขเธนเนเนเธ HTTP-only cookie เธเธฑเนเธ browser เธญเนเธฒเธเนเธกเนเนเธ”เน)
  - `verifyToken(token)` เนเธกเน bail เน€เธกเธทเนเธญ token=null เธญเธตเธเธ•เนเธญเนเธ โ€” เน€เธฃเธตเธขเธ `/auth/profile` เธเธฃเนเธญเธก cookie (browser เธชเนเธเนเธซเนเธญเธฑเธ•เนเธเธกเธฑเธ•เธด)
  - เน€เธเธดเนเธก `logout()` เน€เธฃเธตเธขเธ `POST /auth/logout` เนเธซเน backend เน€เธเธฅเธตเธขเธฃเน cookie
  - เธ—เธธเธ request เนเธชเน `withCredentials: true` เนเธซเน axios เธชเนเธ cookie เธญเธฑเธ•เนเธเธกเธฑเธ•เธด
- `AuthContext`:
  - เน€เธฅเธดเธเน€เธเนเธ token เนเธ `localStorage` เธ•เธญเธ login (cookie เน€เธเนเธ source of truth)
  - `logout()` เน€เธฃเธตเธขเธ backend เนเธฅเนเธงเธฅเนเธฒเธ state เธเธฑเนเธ client
  - `useEffect` initial profile call เนเธเน cookie เนเธกเนเธ•เนเธญเธเธญเนเธฒเธ localStorage
- `LoginForm`: auto-verify session เธ•เธญเธ mount เนเธ”เธขเนเธเน cookie เนเธ”เธขเธ•เธฃเธ โ€” เธ–เนเธฒเธกเธต session valid โ’ redirect; เธ–เนเธฒเนเธกเนเธกเธต โ’ เนเธชเธ”เธเธเธญเธฃเนเธก
- เน€เธเธดเนเธก `API_ROUTE.LOGOUT` เนเธ `utils/constants.js`
- 17 เนเธเธฅเน pages/sections เธ—เธตเนเน€เธฃเธตเธขเธ `getTokenFromLocalStorage` เธ—เธณเธเธฒเธเธ•เนเธญเนเธ”เนเนเธ”เธขเนเธกเนเธ•เนเธญเธเนเธเน โ€” เธเธฑเธเธเนเธเธฑเธเธเธทเธ `null` เธ—เธณเนเธซเน component path เธ—เธตเนเธชเนเธ token เนเธ API เธเนเนเธเนเนเธ”เน, cookie auth เธ—เธณเธซเธเนเธฒเธ—เธตเนเธเธฃเธดเธ

### เน€เธเธดเนเธกเธฃเธฒเธขเธเธฒเธเธเธนเนเธขเธฒเธเธฅเธฒเธ”เน€เธเธฅเธทเนเธญเธ (ReportSummary4)
- เน€เธเธดเธ”เนเธเนเธเธฒเธเนเธ—เนเธ "เธเธนเนเธขเธฒเธเธฅเธฒเธ”เน€เธเธฅเธทเนเธญเธ" เนเธเธซเธเนเธฒเธฃเธฒเธขเธเธฒเธ (เน€เธ”เธดเธก comment เธ—เธดเนเธเนเธงเน)
- เน€เธเธตเธขเธ `sections/reports/ReportSummary4.js` เนเธซเธกเนเธ—เธฑเนเธเนเธเธฅเน:
  - 2 sub-tabs: **เธเธนเนเธขเธฒเธ—เธตเนเธเธฑเธ”เธเธฅเธฒเธ”เน€เธเธฅเธทเนเธญเธ** (Dispensing) / **เธเธนเนเธขเธฒเธ—เธตเนเธเธตเธขเนเธเธฅเธฒเธ”เน€เธเธฅเธทเนเธญเธ** (Processing)
  - 3 เธเธญเธฅเธฑเธกเธเน: เธเธทเนเธญเธขเธฒเธ—เธตเนเธ–เธนเธ / เธเธทเนเธญเธขเธฒเธ—เธตเนเธเธฅเธฒเธ”เน€เธเธฅเธทเนเธญเธ / เธเธณเธเธงเธเธญเธธเธเธฑเธ•เธดเธเธฒเธฃเธ“เน
  - เน€เธฃเธตเธขเธเธเธฒเธเธเธณเธเธงเธเธกเธฒเธ โ’ เธเนเธญเธข, เธฃเธญเธเธฃเธฑเธเธเนเธงเธเธงเธฑเธเธ—เธตเน + เธเนเธเธซเธฒเธเธทเนเธญเธขเธฒ + pagination
  - เธชเธ–เธฒเธเธฐ loading / empty state เธเธฃเธ
- เน€เธเธดเนเธก `getDrugPairSummary(token, { firstDate, lastDate, pairType })` เนเธ `libs/MedError.js`

### Impact Score เนเธเธซเธเนเธฒ "เธเนเธญเธกเธนเธฅเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธเธฃเธฐเน€เธ เธ— Error"
- `pages/ErrorTypePage.js`:
  - เน€เธเธดเนเธกเธเธญเธฅเธฑเธกเธเน **Impact** เนเธเธ•เธฒเธฃเธฒเธ เนเธชเธ”เธ Chip เธชเธตเธ•เธฒเธกเธฃเธฐเธ”เธฑเธ (1-2 เน€เธเธตเธขเธง, 3 เน€เธซเธฅเธทเธญเธ, 4 เธชเนเธก, 5 เนเธ”เธ) โ€” `null` เนเธชเธ”เธ "โ€”"
  - เน€เธเธดเนเธก `<Select>` "เธเธฐเนเธเธ Impact (1-5)" เนเธเธเธญเธฃเนเธก เธเธฃเนเธญเธก MenuItem เธฃเธฐเธเธธเธฃเธฐเธ”เธฑเธ (เธ•เนเธณเธกเธฒเธ/เธ•เนเธณ/เธเธฒเธเธเธฅเธฒเธ/เธชเธนเธ/เธชเธนเธเธกเธฒเธ) + เธ•เธฑเธงเน€เธฅเธทเธญเธ "เนเธกเนเธฃเธฐเธเธธ"
  - Zod schema เธ•เธฃเธงเธเธเนเธฒเนเธซเนเน€เธเนเธ integer 1-5 เธซเธฃเธทเธญ null
  - `handleEdit` เธฃเธงเธก `impact_score` เนเธ formEditData

## [1.12.1] - 2026-04-29

### เธเธฃเธฑเธเนเธ—เธเธชเธต + Animate UI Layout
- เน€เธเธฅเธตเนเธขเธเนเธ—เธเธชเธตเธซเธฅเธฑเธเธเธฒเธ blue/violet/cyan โ’ **teal/mint/emerald** (เธญเธดเธเธชเธตเน€เธ”เธดเธกเนเธฃเธเธเธขเธฒเธเธฒเธฅ `#8fd2c7`) เนเธซเนเธ•เนเธฒเธเธเธฒเธเน€เธ—เธกเน€เธเธฅเธ•เธญเนเธฒเธเธญเธดเธ
  - เน€เธเธดเนเธก `guk-bg-mesh-teal` / `guk-bg-mesh-teal-soft`
  - เน€เธเธดเนเธก `guk-blob-teal-1/2/3`, `guk-glass-teal`, `guk-gradient-text-teal`
- **LoginPage**: เน€เธเธดเนเธกเธซเธฑเธงเธเนเธญ `Medication error` (gradient text เน€เธเธฅเธทเนเธญเธเนเธซเธง) + `Login with your account` เธ”เนเธฒเธเธเธ pill badge "เธฃเธฐเธเธเธฃเธฒเธขเธเธฒเธเธเธงเธฒเธกเธเธฅเธฒเธ”เน€เธเธฅเธทเนเธญเธเธ—เธฒเธเธขเธฒ" เธ•เธฒเธกเธ—เธตเนเธเธญ
- **Layout (Header + Nav)**: เน€เธเธดเนเธก Animate UI เธ—เธฑเนเธเนเธเธ
  - **Header**: glass background (blur 20px), เธเธธเนเธก menu เธกเธต hover rotate + scale, เนเธ–เธเธซเธฑเธงเน€เธฃเธทเนเธญเธ "เธฃเธฐเธเธเธฃเธฒเธขเธเธฒเธเธเธงเธฒเธกเธเธฅเธฒเธ”เน€เธเธฅเธทเนเธญเธเธ—เธฒเธเธขเธฒ" + เธเธธเธ”เธชเธ–เธฒเธเธฐเธฅเธญเธข (float animation)
  - **Nav drawer**: panel เนเธ—เธ teal glass, เนเธฅเนเธเนเธฅเธญเธข (float) + glow pulse, เธเธฒเธฃเนเธ”เธเธนเนเนเธเน (StyledAccount) เน€เธเนเธ gradient mint + hover lift
  - **NavSection items**: hover translate-x + gradient teal, active state เน€เธเนเธ gradient teal เน€เธเนเธก + shadow glow เนเธ—เธ `#103996` เน€เธ”เธดเธก
  - เน€เธเธดเนเธก stagger animation (delay 0.05/0.15/0.25s) เนเธซเนเนเธฅเนเธเน โ’ เธเธนเนเนเธเน โ’ เน€เธกเธเธน เธเนเธญเธข เน fade-up

### เนเธกเนเน€เธเธฅเธตเนเธขเธ Layout
- เนเธเธฃเธเธชเธฃเนเธฒเธ `StyledRoot` / `Container` / `Drawer` / Element เธ—เธฑเนเธเธซเธกเธ”เธขเธฑเธเน€เธซเธกเธทเธญเธเน€เธ”เธดเธก
- เนเธกเนเน€เธเธดเนเธก dependency

## [1.12.0] - 2026-04-29

### เธเธฃเธฑเธเธเธตเธกเนเธซเธกเน (Style refresh โ€” เนเธ—เธเน€เธ”เธตเธขเธงเธเธฑเธ vite-opd-schedule)
- เน€เธเธดเนเธกเนเธเธฅเน `src/theme/effects.css` เธฃเธงเธก utility classes (glass / mesh background / blob animations / gradient text) เธ—เธตเน import เธเธฃเธฑเนเธเน€เธ”เธตเธขเธงเนเธ `index.js` เนเธกเนเธเธฃเธฐเธ—เธ MUI theme เน€เธ”เธดเธก
- **LoginPage**: เน€เธเธฅเธตเนเธขเธเธเธทเนเธเธซเธฅเธฑเธเน€เธเนเธ mesh gradient + animated blobs, เธซเนเธญ form เธ”เนเธงเธขเธเธฒเธฃเนเธ”เนเธ—เธ glass-strong (backdrop-filter blur), เธซเธฑเธงเธเนเธญ "เน€เธเนเธฒเธชเธนเนเธฃเธฐเธเธ" เนเธเน gradient text เน€เธเธฅเธทเนเธญเธเนเธซเธง, เนเธเนเธเธญเธเธ•เน Prompt, badge เธฃเธฐเธเธธเธเธทเนเธญเธฃเธฐเธเธ + เนเธญเธเธญเธ lucide (sparkles, shield-check, external-link, pill), เน€เธเธดเนเธกเธฅเธดเธเธเน "เน€เธงเนเธเนเธเธ•เนเนเธฃเธเธเธขเธฒเธเธฒเธฅเธฃเนเธญเธขเน€เธญเนเธ”" เนเธฅเธฐเธเนเธญเธเธงเธฒเธก "เน€เธเธทเนเธญเธกเธ•เนเธญเธเธฅเธญเธ”เธ เธฑเธข" + เน€เธฅเธเน€เธงเธญเธฃเนเธเธฑเธ โ€” **เธเธเนเธเธฃเธเธชเธฃเนเธฒเธ layout `StyledRoot` / `Container` / `StyledContent` / `<LoginForm />` เน€เธ”เธดเธกเนเธงเนเธ—เธธเธเธ•เธฑเธง**
- **DashboardAppPage**: เน€เธเธดเนเธกเธเธทเนเธเธซเธฅเธฑเธ mesh เนเธเธ soft + blob animations, เธซเนเธญเนเธ–เธเธซเธฑเธง (Executive Summary + DatePicker + Select เธเธตเธเธเธเธฃเธฐเธกเธฒเธ“) เธ”เนเธงเธขเธเธฒเธฃเนเธ” glass เธกเธต gradient text + เธเธณเธเธฃเธฃเธขเธฒเธข โ€” เธชเนเธงเธ Grid / Card / Table เธเธญเธเธเธฃเธฒเธเนเธฅเธฐเธ•เธฒเธฃเธฒเธเธเธเน€เธ”เธดเธกเนเธกเนเน€เธเธฅเธตเนเธขเธ

### เนเธกเนเน€เธเธฅเธตเนเธขเธ
- เนเธกเนเน€เธเธดเนเธก dependency เนเธซเธกเน (เนเธเน pure CSS + class names)
- เนเธกเนเธเธฃเธฑเธ MUI theme palette / overrides
- เนเธกเนเธขเนเธฒเธข element / เนเธกเนเธฅเธ feature เนเธ” เน

## [1.11.2] - 2026-04-28

### เธเธฃเธฑเธเธเธฃเธธเธ (Cleanup)
- เน€เธเธฅเธตเธขเธฃเน ESLint warnings เธ—เธตเนเน€เธซเธฅเธทเธญเธ—เธฑเนเธเธซเธกเธ” (11 โ’ 0)
- เน€เธเธดเนเธก `PropTypes` validation เธ—เธตเนเธเธฒเธ”:
  - `AuthContext.AuthProvider`: `children: PropTypes.node`
  - `NotificationsPopover`: `users: PropTypes.array`
  - `Nav`: `user: PropTypes.array`
  - `MedErrorForm`: `userLogin: PropTypes.array`
- `MedErrorPage`: เนเธเน object destructuring `const { error_analysis } = ...` เนเธ—เธ `let error_analysis = ....error_analysis`
- `MedErrorPage`: เน€เธเธดเนเธก `// eslint-disable-next-line react/prop-types` เธชเธณเธซเธฃเธฑเธ `key` เนเธ MUI Autocomplete `renderOption` (props เน€เธเนเธ MUI internal เนเธกเนเธ•เนเธญเธ validate)
- `AppWebsiteVisits`: เน€เธเธฅเธตเนเธขเธ `click: function () {}` เน€เธเนเธ `click() {}` (ES2015 method shorthand) เนเธเน `func-names`

## [1.11.1] - 2026-04-28

### เธเธฃเธฑเธเธเธฃเธธเธ (Cleanup)
- เธฅเธ ESLint warnings เธ—เธฑเนเธเธซเธกเธ”เธเธฃเธฐเน€เธ เธ— `is defined but never used`, `is assigned a value but never used`, `PropType is defined but prop is never used` (108 warnings โ’ 0)
- เธฅเธ unused imports: `Cookies`, `Iconify`, `_`, `Fragment`, `useRef`, `useAuth`, MUI components เธ—เธตเนเนเธกเนเนเธเน, `Scrollbar`, เธฏเธฅเธฏ
- เธฅเธ unused state hooks: `[isOpen, setIsOpen]`, `[isShowModal, setIsShowModal]`, `[currentDate, setCurrentDate]`, `[months]`, `[yearSelected]` (เนเธเน destructuring placeholder `[, setX]` เธซเธฃเธทเธญเธ–เธญเธ”เธ—เธดเนเธเธ—เธฑเนเธเธเธนเนเธ•เธฒเธกเธเธฒเธฃเนเธเนเธเธฒเธเธเธฃเธดเธ)
- เธฅเธ unused PropTypes: `page`, `rowCount`, `numSelected`, `onSelectAllClick`
- เธฅเธ unused functions: `popKeys` (เธ—เธตเนเนเธกเนเธกเธตเธเธเน€เธฃเธตเธขเธ), `loadEditData` (commented out body)
- เธฅเธ unused parameters เนเธ callbacks: `event` เนเธ `handleLogout`, `sec` เนเธ `handleCatchAxios`, `value` เนเธ `isOptionEqualToValue` (เธ—เธตเน body เนเธกเนเนเธ”เนเนเธเน)
- เธฅเธเนเธเนเธ” commented-out เธ—เธตเนเธญเนเธฒเธเธ–เธถเธ state เธ—เธตเนเธฅเธเธ—เธดเนเธเนเธฅเนเธง (`isShowModal` block, MUI Select เน€เธ”เธทเธญเธ, etc.)

## [1.11.0] - 2026-04-28

### เธเธงเธฒเธกเธเธฅเธญเธ”เธ เธฑเธข (Security)
- เน€เธเธดเนเธก **axios response interceptor** เธเธฑเธ”เธเธฒเธฃ 401/403 เธญเธฑเธ•เนเธเธกเธฑเธ•เธด (เธฅเนเธฒเธ token เนเธฅเธฐเธเธฒเธเธฅเธฑเธเนเธเธซเธเนเธฒ login)
- เน€เธเธดเนเธก **timeout 30s** เนเธซเนเธ—เธธเธ API request เธเนเธญเธเธเธฑเธ request เธเนเธฒเธ
- เธฅเธ catch block เธ—เธตเน swallow error เน€เธเธตเธขเธ เน (`return JSON.stringify(error)`) เธญเธญเธเธเธฒเธเธ—เธธเธ API helper โ€“ throw เธ•เธฒเธกเธเธฃเธดเธเนเธซเน caller เธเธฑเธ”เธเธฒเธฃ

### เธเธฃเธฑเธเธเธฃเธธเธเธเธฃเธฐเธชเธดเธ—เธเธดเธ เธฒเธ (Performance)
- `AuthContext` เนเธเน `useCallback`/`useMemo` เธซเนเธญ value เธฅเธ” re-render เธฅเธนเธ เน เนเธ Provider
- `axiosConfig.useAxios()` เธซเธขเธธเธ”เธชเธฃเนเธฒเธ axios instance เนเธซเธกเนเธ—เธธเธเธเธฃเธฑเนเธเธ—เธตเน token เน€เธเธฅเธตเนเธขเธ (เนเธเน instance เน€เธ”เธตเธขเธง, เธญเธฑเธเน€เธ”เธ•เน€เธเธเธฒเธฐ interceptor)
- `DashboardAppPage` เธซเนเธญ handler เธ—เธฑเนเธเธซเธกเธ”เธ”เนเธงเธข `useCallback`, memoize `chartColors` เนเธฅเธฐเนเธเน key เธเธญเธ TableRow เธเธฒเธ index เน€เธเนเธ `error_level`
- เธเธฃเธฑเธ `libs/MedError.js` เน€เธเนเธ functional เนเธเธเธชเธฑเนเธเธฅเธ เธฅเธ” helper เธเนเธณ เน เธเธญเธ report endpoints (`buildReportSummary` factory)

### เนเธเนเธเธฑเนเธ (Fixed)
- `LoginForm`: เนเธชเน cleanup เธเธญเธ `setTimeout` chain เนเธฅเธฐ flag `isMountedRef` เธเนเธญเธเธเธฑเธ setState เธซเธฅเธฑเธ unmount
- `LoginForm`: เนเธเน zod schema เธ—เธตเนเธเธฑเธเธเธฑเธ username **เธ•เธฃเธเน€เธเนเธฐ 6 เธ•เธฑเธงเธญเธฑเธเธฉเธฃ** (`max(6)`) เธญเธญเธเน€เธเนเธ `max(64)` เน€เธเธทเนเธญเธฃเธญเธเธฃเธฑเธเธเธทเนเธญเธเธนเนเนเธเนเธเธฃเธดเธ
- `LoginForm`: เนเธชเธ”เธเธเนเธญเธเธงเธฒเธก error เธ•เธฒเธกเธชเธ–เธฒเธเธฐเธเธฃเธดเธเธเธญเธ HTTP (network error vs auth error) เนเธ—เธเธเนเธญเธเธงเธฒเธกเน€เธ”เธตเธขเธงเธชเธณเธซเธฃเธฑเธเธ—เธธเธเธเธฃเธ“เธต
- `AuthContext`: เนเธเน `cancelled` flag เนเธ `useEffect` เธเธฑเธ setState เธซเธฅเธฑเธ unmount

### เนเธเธฃเธเธชเธฃเนเธฒเธ / UX
- เธฅเธ dead code:
  - เนเธเธฅเน `*copy.js` เธ—เธฑเนเธเธซเธกเธ” (`AuthContext copy`, `LoginForm copy`, `config copy`, `MedErrorPage copy`, `UserPage copy`)
  - เธซเธเนเธฒเนเธกเนเนเธ”เนเนเธเน: `BlogPage`, `ProductsPage`, `FormMedErrorPage`
  - sections เนเธกเนเนเธ”เนเนเธเน: `@dashboard/blog/`, `@dashboard/products/`, `med-error/MedErrorPharmForm`
  - mock data: `_mock/` (account, blog, products, user)
  - header components เธ—เธตเน comment เธ—เธดเนเธเนเธงเน: `AccountPopover`, `LanguagePopover`, `Searchbar`
- เธฅเธ `API_ROUTE` เธ—เธตเน frontend เนเธกเนเนเธเน (`VERIFY`, `DEPARTMENT_AND_WARD_ALL`, `ERROR_TYPE_LIST_UPDATE`)
- เธเธฃเธฑเธ `LoginForm`: เน€เธเธดเนเธก `autocomplete` attribute เธ—เธตเน input + `aria-label` เธ—เธตเนเธเธธเนเธกเนเธชเธ”เธ/เธเนเธญเธเธฃเธซเธฑเธชเธเนเธฒเธ

## [1.10.16] - 2026-02-03

### เธเธฃเธฑเธเธเธฃเธธเธ (Changed)

- **Medication Error Update Logic**:
  - เธเธฃเธฑเธเธเธฃเธธเธเน€เธเธทเนเธญเธเนเธเธเธฒเธฃเธญเธฑเธเน€เธ”เธ—เธเนเธญเธกเธนเธฅเธชเธณเธซเธฃเธฑเธ Admin (`rule === 9`) เนเธ”เธขเธเธฐเนเธกเนเธ—เธณเธเธฒเธฃเธญเธฑเธเน€เธ”เธ— `error_user` เนเธฅเธฐ `error_user_name` เน€เธเธทเนเธญเธเธเธเธทเนเธญเธเธนเนเธฃเธฒเธขเธเธฒเธเธเธเน€เธ”เธดเธกเนเธงเน
- **ReportSummary8**:
  - เน€เธเธดเนเธกเธเธญเธฅเธฑเธกเธเน "เธซเธเนเธงเธขเธเธฒเธเธ—เธตเนเน€เธเธตเนเธขเธงเธเนเธญเธ" เนเธเธ•เธฒเธฃเธฒเธเนเธชเธ”เธเธเธฅเนเธฅเธฐเนเธเธฅเน Excel (Export)
- **UI/UX**:
  - **Navbar Toggle**: เน€เธเธดเนเธกเธเธธเนเธกเธชเธณเธซเธฃเธฑเธเธเธดเธ”/เน€เธเธดเธ”เนเธ–เธเน€เธกเธเธนเธ”เนเธฒเธเธเนเธฒเธ (Navbar) เธเธเธซเธเนเธฒเธเธญ Desktop เน€เธเธทเนเธญเน€เธเธดเนเธกเธเธทเนเธเธ—เธตเนเนเธเธเธฒเธฃเนเธชเธ”เธเธเธฅเน€เธเธทเนเธญเธซเธฒ
  - **ReportSummary8 UI**: เธเธฃเธฑเธเธเธฃเธธเธเธซเธเนเธฒเนเธชเธ”เธเธเธฅเธชเนเธงเธเธ•เธฑเธงเธเธฃเธญเธ (Filter) เนเธฅเธฐเธชเนเธงเธเธซเธฑเธงเธฃเธฒเธขเธเธฒเธเธ”เนเธงเธข Card เนเธฅเธฐ Grid Layout เน€เธเธทเนเธญเธเธงเธฒเธกเธชเธงเธขเธเธฒเธกเนเธฅเธฐเนเธเนเธเธฒเธเธเนเธฒเธข

## [1.10.14] - 2026-01-28

### เธเธฃเธฑเธเธเธฃเธธเธ (Changed)

- **เธเธฃเธฑเธเธเธฃเธธเธเนเธเธฃเธเธชเธฃเนเธฒเธเนเธเนเธ” (Refactor)**
  - เนเธเนเนเธเธ•เธฃเธฃเธเธฐเธเธฒเธฃเธ•เธฃเธงเธเธชเธญเธเธเนเธญเธกเธนเธฅ (Validation Logic) เนเธเธเธญเธฃเนเธกเธเธฑเธเธ—เธถเธเธเธงเธฒเธกเธเธฅเธฒเธ”เน€เธเธฅเธทเนเธญเธเธ—เธฒเธเธขเธฒ
  - เน€เธเธฅเธตเนเธขเธเธเธฒเธฃเธ•เธฃเธงเธเธชเธญเธเธฃเธซเธฑเธชเธซเธญเธเธนเนเธเนเธงเธข (Ward Code) เธ•เธฒเธกเธเธฃเธฐเน€เธ เธ— Error Type เธเธฒเธเธเธฒเธฃเนเธเน `if-else` เธซเธฅเธฒเธขเธเธฑเนเธ เธกเธฒเนเธเนเน€เธ—เธเธเธดเธ Object Mapping เธฅเธ”เธเธงเธฒเธกเธเนเธณเธเนเธญเธเธเธญเธเนเธเนเธ”
- **เน€เธเธดเนเธกเธเธธเธ“เธ เธฒเธเนเธเนเธ”**
  - เธเธฃเธฑเธเนเธเนเธ”เนเธซเนเธญเนเธฒเธเธเนเธฒเธขเธเธถเนเธ (Readability) เนเธฅเธฐเนเธเนเนเธเนเธ”เนเธเนเธฒเธขเนเธเธญเธเธฒเธเธ• (Maintainability) เนเธ”เธขเนเธกเนเธกเธตเธเธฅเธเธฃเธฐเธ—เธเธ•เนเธญเธเธฒเธฃเธ—เธณเธเธฒเธเน€เธ”เธดเธกเธเธญเธเธซเธเนเธฒเธเนเธฒเธ

## [1.10.13] - 2025-12-09

### เธเธฃเธฑเธเธเธฃเธธเธ (Changed)

- เธเธฃเธฑเธเนเธเนเธเธฒเธฃเธ•เธฃเธงเธเธชเธญเธเธชเธ–เธฒเธเธฐเนเธญเธ”เธกเธดเธเน€เธเธทเนเธญเธ”เธถเธเธเนเธญเธกเธนเธฅเธเธฃเธฐเน€เธ เธ—เธเธญเธ Error
  - เธ–เนเธฒ `role === 9` (Admin) เนเธซเนเธ”เธถเธเธเนเธญเธกเธนเธฅเธ—เธฑเนเธเธซเธกเธ” (All types)
  - เธ–เนเธฒเนเธกเนเนเธเน Admin เนเธซเนเธ”เธถเธเธ•เธฒเธกเธชเธดเธ—เธเธดเน
- เธเธฃเธฑเธเธเธฑเธเธเนเธเธฑเธ `loadErrorType` เนเธซเนเธฃเธญเธเธฃเธฑเธเธชเธดเธ—เธเธดเนเธเธนเนเธ”เธนเนเธฅเธฃเธฐเธเธ (Admin)
  - เน€เธเธดเนเธกเน€เธเธทเนเธญเธเนเธเธ•เธฃเธงเธเธชเธญเธเธชเธดเธ—เธเธดเนเธเธฒเธ `user[0].rule`
  - เธซเธฒเธเน€เธเนเธ Admin (`rule === 9`) เธเธฑเธเธเธฑเธเนเธซเนเน€เธฃเธตเธขเธ `getErrorTypeByType(auth_token, 3)` (เธ”เธถเธเธ—เธฑเนเธเธซเธกเธ”)
  - เธซเธฒเธเนเธกเนเนเธเน Admin เนเธเนเธเนเธฒเธเธฒเธฃเธฒเธกเธดเน€เธ•เธญเธฃเน `pages` เธ•เธฒเธกเน€เธ”เธดเธก

## [1.10.12] - 2025-12-05

### เน€เธเธดเนเธกเนเธซเธกเน (Added)

- **Dashboard Executive Summary**
  - เน€เธเธดเนเธกเธเธฒเธฃเน€เธฅเธทเธญเธเธเนเธงเธเธงเธฑเธเธ—เธตเนเธ”เนเธงเธข DatePicker (เน€เธฃเธดเนเธกเธ•เนเธ / เธชเธดเนเธเธชเธธเธ”)
  - เนเธชเธ”เธเธ•เธฒเธฃเธฒเธเธชเธฃเธธเธเธเธณเธเธงเธ Medication Error เนเธขเธเธ•เธฒเธกเธเธงเธฒเธกเธฃเธธเธเนเธฃเธ (`summaryErrorTypeList`)
- **เน€เธเธทเนเธญเธเนเธเธชเธดเธ—เธเธดเน RCA**
  - เธเธธเนเธก โ€เธขเธทเธเธขเธฑเธเธเนเธญเธกเธนเธฅเนเธ”เนเธฃเธฑเธเธเธฒเธฃ RCAโ€ เนเธชเธ”เธเน€เธเธเธฒเธฐเธเธนเนเนเธเนเธ—เธตเนเธกเธต `rule === 9`
  - เน€เธเธดเนเธก TextArea เธชเธณเธซเธฃเธฑเธเธเธฃเธญเธ **เธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ” RCA**
- **Master Data Pages**
  - **Department**: เน€เธเธดเนเธก/เนเธเนเนเธ/เธฅเธ เธซเธญเธเธนเนเธเนเธงเธข เธเธฃเนเธญเธกเธชเธ–เธฒเธเธฐเธเธฒเธฃเนเธเนเธเธฒเธ (Active/Inactive)
  - **Error Type Detail**: เธเธฑเธ”เธเธฒเธฃเธฃเธฒเธขเธฅเธฐเน€เธญเธตเธขเธ”เธเธฃเธฐเน€เธ เธ— Error
  - **Error Analysis**: เธเธฑเธ”เธเธฒเธฃเธฃเธฒเธขเธเธฒเธฃเธงเธดเน€เธเธฃเธฒเธฐเธซเนเธชเธฒเน€เธซเธ•เธธ
- **LINE OA Integration**
  - เธชเธฃเนเธฒเธเธเธฑเธเธเนเธเธฑเธ `sendReplyLineMessaging` เธชเธณเธซเธฃเธฑเธเธชเนเธเธเธฒเธฃเนเธเนเธเน€เธ•เธทเธญเธเธเนเธฒเธ MOPH Notify API เนเธ—เธ LINE Notify เน€เธ”เธดเธก
- **Database Schema**
  - เน€เธเธดเนเธก field เนเธซเธกเนเนเธเธ•เธฒเธฃเธฒเธ `med_error`: `error_transcribing_right_icode`, `error_transcribing_right`, `error_transcribing_wrong`, etc.

### เธเธฃเธฑเธเธเธฃเธธเธ (Changed)

- **Medication Error Loading**
  - เธเธฃเธฑเธ `loadMedError` เนเธซเนเธฃเธญเธเธฃเธฑเธเธเธฒเธฃเธเธฃเธญเธเธ”เนเธงเธข `dateStart`/`dateEnd` เธเนเธฒเธ Parameter
- **Form Validation**
  - เธเธฃเธฑเธเนเธเน **React Hook Form + Zod** เนเธซเนเธชเธญเธ”เธเธฅเนเธญเธเธเธฑเธเธ—เธธเธเธซเธเนเธฒ (Master Data)
  - เนเธเนเนเธเธเนเธฒ Default เนเธฅเธฐ Reset form เนเธซเนเธ–เธนเธเธ•เนเธญเธ
- **UI/UX**
  - เธเธฃเธฑเธ `Dialog` เนเธฅเธฐ `Popover` เนเธซเนเธ—เธณเธเธฒเธเธ–เธนเธเธ•เนเธญเธ (State management)

### เนเธเนเนเธเธเนเธญเธเธดเธ”เธเธฅเธฒเธ” (Fixed)

- **Dashboard**: เนเธเน `rowLabels.map is not a function` เนเธ”เธขเธ•เธฃเธงเธเธชเธญเธ `Array.isArray` เธเนเธญเธ
- **Autocomplete**: เนเธเนเธเธฑเธเธซเธฒ `getOptionLabel` return null เนเธฅเธฐเธเธฃเธฑเธ `isOptionEqualToValue`
- **React Hook Form**: เนเธเนเธเธฑเธเธซเธฒ Binding value เธเธฑเธ Select input เนเธซเนเธ–เธนเธเธ•เนเธญเธ
- **Axios Error Handling**: เธเธฃเธฑเธเธเธฃเธธเธเธเธฒเธฃเธ”เธฑเธเธเธฑเธ Error เนเธฅเธฐเนเธเนเธเน€เธ•เธทเธญเธเนเธซเนเธเธฑเธ”เน€เธเธเธเธถเนเธ


