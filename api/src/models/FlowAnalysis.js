import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const FlowAnalysis = sequelize.define('FlowAnalysis', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  flow_file_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    comment: '流水文件ID'
  },
  user_identifier: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '用户标识（电话号码/户主等）'
  },
  user_phone_analysis: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '用户手机号码分析数据'
  },
  user_bank_card_analysis: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '用户银行卡分析数据'
  },
  vehicle_analysis: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '车辆信息关联分析数据'
  },
  high_frequency_counterparties: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '高频交易对手分析数据'
  },
  restricted_consumption: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '限制消费行为分析数据'
  },
  large_transactions: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '大额交易分析数据'
  },
  top_merchants: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '最常消费的10个商家数据'
  },
  summary: {
    type: DataTypes.JSON,
    allowNull: true,
    comment: '汇总统计数据'
  }
}, {
  tableName: 'flow_analysis',
  comment: '流水分析结果表'
})

export default FlowAnalysis
