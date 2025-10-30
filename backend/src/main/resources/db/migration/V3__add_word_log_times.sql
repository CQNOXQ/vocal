-- 为 word_logs 表添加 start_time 和 end_time 字段
ALTER TABLE word_logs ADD COLUMN start_time DATETIME NULL;
ALTER TABLE word_logs ADD COLUMN end_time DATETIME NULL;
