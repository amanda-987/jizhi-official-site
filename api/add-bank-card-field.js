import sequelize from './src/config/database.js'

async function addBankCardField() {
  try {
    await sequelize.authenticate()
    console.log('数据库连接成功')
    
    const [results] = await sequelize.query(`
      SELECT COLUMN_NAME 
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = 'jizhi_db' 
      AND TABLE_NAME = 'flow_analysis' 
      AND COLUMN_NAME = 'user_bank_card_analysis'
    `)
    
    if (results.length === 0) {
      await sequelize.query(`
        ALTER TABLE flow_analysis 
        ADD COLUMN user_bank_card_analysis JSON NULL 
        COMMENT '用户银行卡分析数据'
      `)
      console.log('✅ 成功添加 user_bank_card_analysis 字段')
    } else {
      console.log('ℹ️  user_bank_card_analysis 字段已存在，跳过添加')
    }
    
  } catch (error) {
    console.error('❌ 添加字段失败:', error.message)
  } finally {
    await sequelize.close()
  }
}

addBankCardField()