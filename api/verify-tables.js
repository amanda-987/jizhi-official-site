import mysql from 'mysql2/promise'

const checkTables = async () => {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '9s7K!8p2Q@7m9Z#5',
      database: 'jizhi_db'
    })
    
    console.log('检查数据库表...')
    
    const [tables] = await connection.query('SHOW TABLES')
    console.log('✅ 数据库中的表:', tables.map(t => Object.values(t)[0]))
    console.log(`✅ 共找到 ${tables.length} 个表`)
    
    await connection.end()
    
  } catch (error) {
    console.error('❌ 检查失败:', error.message)
  }
}

checkTables()
