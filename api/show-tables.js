import mysql from 'mysql2/promise'

async function showTables() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '9s7K!8p2Q@7m9Z#5',
      database: 'jizhi_db'
    })

    const [rows] = await connection.execute('SHOW TABLES')
    
    console.log('数据库表:')
    console.log(`${'='.repeat(80)}`)
    rows.forEach((row) => {
      const tableName = Object.values(row)[0]
      console.log(`  ${tableName}`)
    })

    await connection.end()
  } catch (error) {
    console.error('查询失败:', error)
  }
}

showTables()