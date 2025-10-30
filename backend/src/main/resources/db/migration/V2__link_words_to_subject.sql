-- 修改 word_logs 表，添加 subject_id 关联（逻辑外键）
-- 列已存在，只创建索引
-- ALTER TABLE word_logs ADD COLUMN subject_id BIGINT;
-- CREATE INDEX idx_subject_id ON word_logs(subject_id);




