import mysql from 'mysql2/promise'

async function listFiles() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '9s7K!8p2Q@7m9Z#5',
      database: 'jizhi_db'
    })

    const [rows] = await connection.execute('SELECT id, file_name, file_path, status FROM flow_files ORDER BY id DESC LIMIT 10')
    
    console.log('流水文件列表:')
    console.log(`${'='.repeat(80)}`)
    rows.forEach((row) => {
      console.log(`ID: ${row.id}`)
      console.log(`文件名: ${row.file_name}`)
      console.log(`路径: ${row.file_path}`)
      console.log(`状态: ${row.status}`)
      console.log(`${'='.repeat(80)}`)
    })

    await connection.end()
  } catch (error) {
    console.error('查询失败:', error)
  }
}

listFiles()