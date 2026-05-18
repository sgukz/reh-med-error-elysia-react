-- เพิ่ม likelihood_score (1-5) ลงในตาราง med_error_type_list
-- ใช้คู่กับ impact_score เพื่อคำนวณ Level = Impact + Likelihood ในรายงานแยกรายละเอียด Error
-- nullable เพื่อให้ row เก่าใช้ต่อได้โดยไม่ต้อง backfill ทันที

ALTER TABLE med_error_type_list
  ADD COLUMN likelihood_score TINYINT NULL
  COMMENT 'คะแนน Likelihood 1-5; ใช้คู่กับ impact_score คำนวณ Level = Impact + Likelihood';
