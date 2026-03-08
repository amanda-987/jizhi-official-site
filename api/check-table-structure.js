import mysql from 'mysql2/promise'

async function checkTableStructure() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '9s7K!8p2Q@7m9Z#5',
      database: 'jizhi_db'
    })

    console.log('检查表结构...\n')

    const [rows] = await connection.execute('DESCRIBE flow_analysis')

    rows.forEach(row => {
      console.log(`字段: ${row.Field}`)
      console.log(`  类型: ${row.Type}`)
      console.log(`  是否为空: ${row.Null}`)
      console.log(`  键: ${row.Key}`)
      console.log(`  默认值: ${row.Default}`)
      console.log(`  额外: ${row.Extra}`)
      console.log('')
    })

    await connection.end()
  } catch (error) {
    console.error('检查失败:', error)
  }
}

checkTableStructure()