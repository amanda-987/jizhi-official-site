import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const LegalDocument = sequelize.define('LegalDocument', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  document_type: {
    type: DataTypes.ENUM('investigation_order', 'seizure_freeze', 'detention_fine', 'police_transfer'),
    allowNull: false,
    comment: '文书类型：调查令申请书/查封冻结申请书/拘留罚款申请书/移送公安机关申请书'
  },
  case_number: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '案号'
  },
  plaintiff: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '申请人'
  },
  defendant: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '被执行人'
  },
  court: {
    type: DataTypes.STRING(100),
    allowNull: true,
    comment: '法院名称'
  },
  investigation_target: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: '调查对象：银行流水/微信'
  },
  document_content: {
    type: DataTypes.TEXT,
    allowNull: true,
    comment: '文书内容'
  },
  file_path: {
    type: DataTypes.STRING(500),
    allowNull: true,
    comment: '生成的文件路径'
  }
}, {
  tableName: 'legal_documents',
  comment: '法律文书表'
})

export default LegalDocument
