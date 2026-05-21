-- สร้างตาราง med_error_likelihood_criteria
CREATE TABLE IF NOT EXISTS `med_error_likelihood_criteria` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `group_id` INT NOT NULL COMMENT '1=Prescription, 2=Processing/Pre-Admin/Transcribing, 3=Dispensing/Admin',
  `level_score` INT NOT NULL COMMENT '0-5',
  `min_freq` INT NOT NULL COMMENT 'ความถี่ขั้นต่ำ',
  `max_freq` INT NULL COMMENT 'ความถี่สูงสุด (NULL = ไม่จำกัด)',
  `updated_by` VARCHAR(255) NULL,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ลบข้อมูลเก่าถ้ามี
TRUNCATE TABLE `med_error_likelihood_criteria`;

-- Insert ข้อมูลตั้งต้น
-- Group 1: Prescription error
INSERT INTO `med_error_likelihood_criteria` (`group_id`, `level_score`, `min_freq`, `max_freq`) VALUES
(1, 5, 41, NULL),
(1, 4, 31, 40),
(1, 3, 21, 30),
(1, 2, 11, 20),
(1, 1, 1, 10),
(1, 0, 0, 0);

-- Group 2: Processing, Pre - Administration, Transcribing error
INSERT INTO `med_error_likelihood_criteria` (`group_id`, `level_score`, `min_freq`, `max_freq`) VALUES
(2, 5, 401, NULL),
(2, 4, 301, 400),
(2, 3, 201, 300),
(2, 2, 101, 200),
(2, 1, 1, 100),
(2, 0, 0, 0);

-- Group 3: Dispensing, Administration error
INSERT INTO `med_error_likelihood_criteria` (`group_id`, `level_score`, `min_freq`, `max_freq`) VALUES
(3, 5, 26, NULL),
(3, 4, 21, 25),
(3, 3, 11, 20),
(3, 2, 6, 10),
(3, 1, 1, 5),
(3, 0, 0, 0);
