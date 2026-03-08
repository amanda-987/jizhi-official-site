import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const AnalysisHistory = sequelize.define('AnalysisHistory', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  flow_file_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '流水文件ID'
  },
  legal_document_id: {
    type: DataTypes.INTEGER,
    allowNull: true,
    comment: '法律文书ID'
  },
  analysis_type: {
    type: DataTypes.ENUM('flow', 'legal', 'both'),
    allowNull: false,
    comment: '分析类型'
  },
  status: {
    type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
    defaultValue: 'pending',
    comment: '处理状态'
  },
  result: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '分析结果数据'
  },
  error_message: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '错误信息'
  }
}, {
  tableName: 'analysis_history',
  comment: '分析历史记录表'
})

export default AnalysisHistory