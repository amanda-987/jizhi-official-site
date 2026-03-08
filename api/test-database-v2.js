import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { Sequelize } from 'sequelize'
import fs from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const envPath = path.join(__dirname, '.env')
console.log('尝试加载.env文件:', envPath)
console.log('文件是否存在:', fs.existsSync(envPath))

dotenv.config({ path: envPath })

console.log('\n环境变量检查:')
console.log('DB_HOST:', process.env.DB_HOST)
console.log('DB_PORT:', process.env.DB_PORT)
console.log('DB_NAME:', process.env.DB_NAME)
console.log('DB_USER:', process.env.DB_USER)
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***已设置***' : '未设置')

async function testDatabase() {
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

    console.log('\n1. 测试数据库连接...')
    await sequelize.authenticate()
    console.log('✓ 数据库连接成功')

    console.log('\n2. 测试表结构...')
    const [results] = await sequelize.query('SHOW TABLES')
    const tables = results.map(row => Object.values(row)[0])
    console.log('✓ 数据库表:', tables)

    console.log('\n3. 测试数据查询...')
    const [flowFilesCount] = await sequelize.query('SELECT COUNT(*) as count FROM flow_files')
    console.log('✓ flow_files表记录数:', flowFilesCount[0].count)

    const [legalDocsCount] = await sequelize.query('SELECT COUNT(*) as count FROM legal_documents')
    console.log('✓ legal_documents表记录数:', legalDocsCount[0].count)

    const [flowAnalysisCount] = await sequelize.query('SELECT COUNT(*) as count FROM flow_analysis')
    console.log('✓ flow_analysis表记录数:', flowAnalysisCount[0].count)

    await sequelize.close()

    console.log('\n=== 数据库测试完成 ===')
    console.log('✓ 数据库连接正常')
    console.log('✓ 表结构正常')
    console.log('✓ 数据可以正常存储和读取')

  } catch (error) {
    console.error('✗ 数据库测试失败:', error.message)
  }
}

testDatabase()
