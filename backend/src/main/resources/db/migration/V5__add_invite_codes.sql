-- 创建邀请码表
CREATE TABLE IF NOT EXISTS invite_codes (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  code VARCHAR(20) UNIQUE NOT NULL,
  created_by BIGINT NOT NULL,
  used_by BIGINT,
  used_at TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id),
  FOREIGN KEY (used_by) REFERENCES users(id),
  INDEX idx_code (code),
  INDEX idx_created_by (created_by),
  INDEX idx_used_by (used_by)
);

