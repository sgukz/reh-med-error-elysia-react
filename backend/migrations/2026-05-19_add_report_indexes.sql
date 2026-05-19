-- เพิ่ม indexes ที่จำเป็นสำหรับ Report queries — ลดเวลา query รายงานหลายเท่าตัว
-- ตาราง med_error ตอนนี้มีแค่ PRIMARY KEY (error_id) → WHERE error_date BETWEEN ทำ full scan ทุกครั้ง

-- 1. index หลักของทุก report — date range filter
ALTER TABLE med_error ADD INDEX idx_error_date (error_date);

-- 2. composite สำหรับ report ที่ filter ทั้ง type + date (summary8, summary9, summary10)
ALTER TABLE med_error ADD INDEX idx_error_type_date (error_type, error_date);

-- 3. JOIN key สำหรับ summary1, summary10
ALTER TABLE med_error ADD INDEX idx_error_ward (error_ward);

-- 4. summary9 filter master subtype — is_active='Y' AND error_type = N
ALTER TABLE med_error_type_list ADD INDEX idx_etl_type_active (error_type, is_active);
