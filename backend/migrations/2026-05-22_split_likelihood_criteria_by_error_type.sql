-- แยกเกณฑ์ Likelihood จาก 3 กลุ่ม (group_id) -> 6 ตารางตามประเภท Error (error_type 1-6)
-- Mapping เดิม (สืบทอดค่าที่ตั้งไว้): group1->type1, group3->type2&4, group2->type3&5&6
-- Idempotent: ADD COLUMN/KEY IF NOT EXISTS + UPDATE เฉพาะแถวที่ยังไม่มี error_type + INSERT IGNORE
-- คง group_id ไว้ (NOT NULL) เพื่อ rollback ได้ และให้แถวที่ duplicate มี group_id ตรงกับต้นทาง

-- 1) เพิ่มคอลัมน์ error_type (1-6)
ALTER TABLE `med_error_likelihood_criteria`
  ADD COLUMN IF NOT EXISTS `error_type` INT NULL COMMENT '1=Prescription 2=Dispensing 3=PreAdmin 4=Admin 5=Processing 6=Transcribing' AFTER `id`;

-- 2) บังคับ 1 แถวต่อ (error_type, level_score) — ทำให้ INSERT IGNORE ด้านล่าง idempotent
ALTER TABLE `med_error_likelihood_criteria`
  ADD UNIQUE KEY IF NOT EXISTS `uniq_error_type_level` (`error_type`, `level_score`);

-- 3) กำหนด error_type หลักจาก group_id (เฉพาะแถวที่ยังเป็น NULL)
UPDATE `med_error_likelihood_criteria` SET `error_type` = 1 WHERE `group_id` = 1 AND `error_type` IS NULL;
UPDATE `med_error_likelihood_criteria` SET `error_type` = 3 WHERE `group_id` = 2 AND `error_type` IS NULL;
UPDATE `med_error_likelihood_criteria` SET `error_type` = 2 WHERE `group_id` = 3 AND `error_type` IS NULL;

-- 4) ขยายแถวที่หนึ่ง group มีหลายประเภท (derived table กัน error 1093, INSERT IGNORE กันซ้ำ)
INSERT IGNORE INTO `med_error_likelihood_criteria` (`error_type`, `group_id`, `level_score`, `min_freq`, `max_freq`, `updated_by`)
SELECT 4, `group_id`, `level_score`, `min_freq`, `max_freq`, `updated_by`
FROM (SELECT * FROM `med_error_likelihood_criteria` WHERE `error_type` = 2) AS src;

INSERT IGNORE INTO `med_error_likelihood_criteria` (`error_type`, `group_id`, `level_score`, `min_freq`, `max_freq`, `updated_by`)
SELECT 5, `group_id`, `level_score`, `min_freq`, `max_freq`, `updated_by`
FROM (SELECT * FROM `med_error_likelihood_criteria` WHERE `error_type` = 3) AS src;

INSERT IGNORE INTO `med_error_likelihood_criteria` (`error_type`, `group_id`, `level_score`, `min_freq`, `max_freq`, `updated_by`)
SELECT 6, `group_id`, `level_score`, `min_freq`, `max_freq`, `updated_by`
FROM (SELECT * FROM `med_error_likelihood_criteria` WHERE `error_type` = 3) AS src;
