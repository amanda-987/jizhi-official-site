import mysql from 'mysql2/promise'

const createDatabase = async () => {
  try {
    console.log('尝试创建数据库...')
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '9s7K!8p2Q@7m9Z#5'
    })
    
    await connection.query('CREATE DATABASE IF NOT EXISTS jizhi_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci')
    console.log('✅ 数据库创建成功')
    
    await connection.end()
    console.log('✅ 连接已关闭')
    
  } catch (error) {
    console.error('❌ 创建数据库失败:')
    console.error('错误代码:', error.code)
    console.error('错误信息:', error.message)
  }
}

createDatabase()
