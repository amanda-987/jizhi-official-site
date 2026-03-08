import { Sequelize, DataTypes } from 'sequelize'

const sequelize = new Sequelize({
  database: 'jizhi_db',
  username: 'root',
  password: '9s7K!8p2Q@7m9Z#5',
  host: 'localhost',
  port: 3306,
  dialect: 'mysql',
  logging: false,
  timezone: '+08:00',
  define: {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    freezeTableName: true
  }
})

const createTables = async () => {
  try {
    await sequelize.authenticate()
    console.log('✅ 数据库连接成功')
    
    const FlowFile = sequelize.define('FlowFile', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      file_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      file_type: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      file_size: {
        type: DataTypes.BIGINT,
        allowNull: false
      },
      file_path: {
        type: DataTypes.STRING(500),
        allowNull: false
      },
      flow_source: {
        type: DataTypes.STRING(50),
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
        defaultValue: 'pending'
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, { tableName: 'flow_files' })

    const LegalDocument = sequelize.define('LegalDocument', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      document_name: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      document_type: {
        type: DataTypes.STRING(50),
        allowNull: false
      },
      document_content: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      document_path: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
        defaultValue: 'pending'
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, { tableName: 'legal_documents' })

    const FlowAnalysis = sequelize.define('FlowAnalysis', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      flow_file_id: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      user_identifier: {
        type: DataTypes.STRING(100),
        allowNull: true
      },
      recharge_analysis: {
        type: DataTypes.JSON,
        allowNull: true
      },
      vehicle_analysis: {
        type: DataTypes.JSON,
        allowNull: true
      },
      high_frequency_counterparties: {
        type: DataTypes.JSON,
        allowNull: true
      },
      restricted_consumption: {
        type: DataTypes.JSON,
        allowNull: true
      },
      large_transactions: {
        type: DataTypes.JSON,
        allowNull: true
      },
      top_merchants: {
        type: DataTypes.JSON,
        allowNull: true
      },
      summary: {
        type: DataTypes.JSON,
        allowNull: true
      }
    }, { tableName: 'flow_analysis' })

    const AnalysisHistory = sequelize.define('AnalysisHistory', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      flow_file_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      legal_document_id: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      analysis_type: {
        type: DataTypes.ENUM('flow', 'legal', 'both'),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
        defaultValue: 'pending'
      },
      result: {
        type: DataTypes.JSON,
        allowNull: true
      },
      error_message: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, { tableName: 'analysis_history' })

    await sequelize.sync({ force: true })
    console.log('✅ 数据库表创建成功')
    
    await sequelize.close()
    console.log('✅ 连接已关闭')
    
  } catch (error) {
    console.error('❌ 创建表失败:', error.message)
  }
}

createTables()
