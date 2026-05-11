-- เพิ่ม impact_score (1-5) ลงในตาราง med_error_type_list
-- ใช้ในรายงานรายละเอียด Error เพื่อคำนวณ risk score = Impact + Likelihood
-- nullable เพื่อให้ row เก่าใช้ต่อได้โดยไม่ต้อง backfill ทันที

ALTER TABLE med_error_type_list
  ADD COLUMN impact_score TINYINT NULL
  COMMENT 'คะแนน Impact 1-5; ใช้คำนวณ risk = impact + likelihood';
