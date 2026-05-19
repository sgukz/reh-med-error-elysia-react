-- สร้างตาราง med_error_stat_volume
-- เก็บข้อมูลจำนวนวันนอน (IPD) และจำนวนใบสั่งยา (OPD) ที่แอดมินกรอกรายเดือน
-- ใช้ปี ค.ศ. (Gregorian year) เป็นหลัก, frontend จะ convert ปี พ.ศ. ↔ ค.ศ.

CREATE TABLE IF NOT EXISTS med_error_stat_volume (
  stat_id INT AUTO_INCREMENT PRIMARY KEY,
  stat_year INT NOT NULL COMMENT 'ปี ค.ศ. (Gregorian year)',
  stat_month INT NOT NULL COMMENT 'เดือน 1-12',
  ipd_patient_days DECIMAL(12,2) DEFAULT 0 COMMENT 'จำนวนวันนอน IPD',
  opd_prescriptions DECIMAL(12,2) DEFAULT 0 COMMENT 'จำนวนใบสั่งยา OPD',
  updated_by VARCHAR(100) DEFAULT NULL COMMENT 'ผู้อัปเดตข้อมูล',
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_year_month (stat_year, stat_month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
COMMENT='ข้อมูลสถิติจำนวนวันนอน/ใบสั่งยา สำหรับคำนวณอัตราความคลาดเคลื่อน';
