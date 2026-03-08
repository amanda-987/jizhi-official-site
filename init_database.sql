-- 极执网数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS jizhi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE jizhi_db;

-- 流水文件表
CREATE TABLE IF NOT EXISTS flow_files (
  id INT AUTO_INCREMENT PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL COMMENT '原始文件名',
  file_type VARCHAR(50) NOT NULL COMMENT '文件类型：xlsx/pdf/doc/docx/txt',
  file_size BIGINT NOT NULL COMMENT '文件大小（字节）',
  file_path VARCHAR(500) NOT NULL COMMENT '文件存储路径',
  flow_source VARCHAR(50) COMMENT '流水来源：微信/银行/其他',
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending' COMMENT '处理状态',
  error_message TEXT COMMENT '错误信息',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='流水文件表';

-- 流水分析结果表
CREATE TABLE IF NOT EXISTS flow_analysis (
  id INT AUTO_INCREMENT PRIMARY KEY,
  flow_file_id INT NOT NULL COMMENT '流水文件ID',
  user_identifier VARCHAR(100) COMMENT '用户标识（电话号码/户主等）',
  recharge_analysis JSON COMMENT '充值分析数据',
  vehicle_analysis JSON COMMENT '车辆信息关联分析数据',
  high_frequency_counterparties JSON COMMENT '高频交易对手分析数据',
  restricted_consumption JSON COMMENT '限制消费行为分析数据',
  large_transactions JSON COMMENT '大额交易分析数据',
  top_merchants JSON COMMENT '最常消费的10个商家数据',
  summary JSON COMMENT '汇总统计数据',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (flow_file_id) REFERENCES flow_files(id) ON DELETE CASCADE,
  INDEX idx_flow_file_id (flow_file_id),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='流水分析结果表';

-- 法律文书表
CREATE TABLE IF NOT EXISTS legal_documents (
  id INT AUTO_INCREMENT PRIMARY KEY,
  document_type ENUM('investigation_order', 'seizure_freeze', 'detention_fine', 'police_transfer') NOT NULL COMMENT '文书类型',
  case_number VARCHAR(100) COMMENT '案号',
  plaintiff VARCHAR(100) COMMENT '申请人',
  defendant VARCHAR(100) COMMENT '被执行人',
  court VARCHAR(100) COMMENT '法院名称',
  investigation_target VARCHAR(50) COMMENT '调查对象：银行流水/微信',
  document_content TEXT COMMENT '文书内容',
  file_path VARCHAR(500) COMMENT '生成的文件路径',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_document_type (document_type),
  INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='法律文书表';

-- 创建上传目录
-- 注意：需要在服务器上手动创建以下目录
-- d:\jizhi\api\uploads
-- d:\jizhi\api\generated-docs
