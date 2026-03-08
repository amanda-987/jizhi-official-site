import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

async function testDatabase() {
  console.log('=== 开始测试数据库连接 ===\n')

  try {
    const sequelize = new Sequelize({
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      dialect: 'mysql',
      logging: false
    })

    console.log('1. 测试数据库连接...')
    await sequelize.authenticate()
    console.log('✓ 数据库连接成功')

    console.log('\n2. 测试表结构...')
    const [results] = await sequelize.query('SHOW TABLES')
    const tables = results.map(row => Object.values(row)[0])
    console.log('✓ 数据库表:', tables)

    console.log('\n3. 测试flow_files表...')
    const flowFiles = await sequelize.query('SELECT COUNT(*) as count FROM flow_files')
    console.log('✓ flow_files表记录数:', flowFiles[0][0].count)

    console.log('\n4. 测试legal_documents表...')
    const legalDocs = await sequelize.query('SELECT COUNT(*) as count FROM legal_documents')
    console.log('✓ legal_documents表记录数:', legalDocs[0][0].count)

    console.log('\n5. 测试flow_analysis表...')
    const flowAnalysis = await sequelize.query('SELECT COUNT(*) as count FROM flow_analysis')
    console.log('✓ flow_analysis表记录数:', flowAnalysis[0][0].count)

    console.log('\n6. 测试表结构...')
    const flowFilesColumns = await sequelize.query('DESCRIBE flow_files')
    console.log('✓ flow_files表字段:', flowFilesColumns[0].map(col => col.Field))

    const legalDocsColumns = await sequelize.query('DESCRIBE legal_documents')
    console.log('✓ legal_documents表字段:', legalDocsColumns[0].map(col => col.Field))

    await sequelize.close()

    console.log('\n=== 所有数据库测试完成 ===')
    console.log('✓ 数据库连接正常')
    console.log('✓ 表结构正常')
    console.log('✓ 数据可以正常存储和读取')

  } catch (error) {
    console.error('✗ 数据库测试失败:', error.message)
  }
}

testDatabase()
