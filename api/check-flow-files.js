import mysql from 'mysql2/promise'

async function checkFiles() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '9s7K!8p2Q@7m9Z#5',
      database: 'jizhi_db'
    })

    console.log('检查流水文件...\n')

    const [rows] = await connection.execute(`
      SELECT id, file_name, file_path, status
      FROM flow_files
      ORDER BY id DESC
      LIMIT 5
    `)

    console.log('找到记录数:', rows.length)

    rows.forEach((row, index) => {
      console.log(`\n文件 ${index + 1}:`)
      console.log(`  ID: ${row.id}`)
      console.log(`  文件名: ${row.file_name}`)
      console.log(`  文件路径: ${row.file_path}`)
      console.log(`  状态: ${row.status}`)
    })

    await connection.end()
  } catch (error) {
    console.error('检查失败:', error)
  }
}

checkFiles()