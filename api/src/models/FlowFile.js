import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const FlowFile = sequelize.define('FlowFile', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  file_name: {
    type: DataTypes.STRING(255),
    allowNull: false,
    comment: '原始文件名'
  },
  file_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '文件类型：xlsx/pdf/doc/docx/txt'
  },
  file_size: {
    type: DataTypes.BIGINT,
    allowNull: false,
    comment: '文件大小（字节）'
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: false,
    comment: '文件存储路径'
  },
  flow_source: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '流水来源：微信/银行/其他'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending',
    comment: '处理状态'
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '错误信息'
  }
}, {
  tableName: 'flow_files',
  comment: '流水文件表'
})

export default FlowFile
