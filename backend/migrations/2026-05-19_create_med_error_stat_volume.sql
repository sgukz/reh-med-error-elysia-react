-- ตารางเก็บข้อมูลปริมาณ IPD วันนอน + OPD ใบสั่งยา รายเดือน — admin กรอกเอง
-- ใช้ใน ReportSummary10 (TABLE 0) คำนวณอัตราความคลาดเคลื่อนต่อ 1,000 วันนอน/ใบสั่งยา (TABLE C)
-- UNIQUE (stat_year, stat_month) เพื่อให้ INSERT ... ON DUPLICATE KEY UPDATE ทำงานได้

CREATE TABLE IF NOT EXISTS med_error_stat_volume (
    stat_id           INT AUTO_INCREMENT PRIMARY KEY,
    stat_year         INT NOT NULL              COMMENT 'ปี ค.ศ.',
    stat_month        INT NOT NULL              COMMENT 'เดือน 1-12',
    ipd_patient_days  DECIMAL(12,2) DEFAULT 0   COMMENT 'จำนวนวันนอน IPD',
    opd_prescriptions DECIMAL(12,2) DEFAULT 0   COMMENT 'จำนวนใบสั่งยา OPD',
    updated_by        VARCHAR(100) DEFAULT NULL COMMENT 'ผู้อัปเดต (loginname)',
    updated_at        DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_year_month (stat_year, stat_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='ข้อมูลปริมาณ IPD/OPD รายเดือนสำหรับ ReportSummary10';
