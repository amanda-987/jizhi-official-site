import mysql from 'mysql2/promise'

async function cleanOldData() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '9s7K!8p2Q@7m9Z#5',
      database: 'jizhi_db'
    })

    console.log('清理旧的分析记录...\n')

    const [result] = await connection.execute('DELETE FROM flow_analysis WHERE flow_file_id = 20')
    
    console.log(`已删除 ${result.affectedRows} 条旧的分析记录`)

    await connection.end()
  } catch (error) {
    console.error('清理失败:', error)
  }
}

cleanOldData()