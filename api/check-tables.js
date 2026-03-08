import mysql from 'mysql2/promise'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

const checkTables = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    })
    
    console.log('检查数据库表...')
    
    const [tables] = await connection.query('SHOW TABLES')
    console.log('✅ 数据库中的表:', tables.map(t => Object.values(t)[0]))
    
    if (tables.length === 0) {
      console.log('❌ 没有找到任何表')
    } else {
      console.log(`✅ 共找到 ${tables.length} 个表`)
    }
    
    await connection.end()
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message)
  }
}

checkTables()
