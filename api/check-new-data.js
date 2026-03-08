import mysql from 'mysql2/promise'

async function checkNewData() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '9s7K!8p2Q@7m9Z#5',
      database: 'jizhi_db'
    })

    console.log('检查新插入的数据...\n')

    const [rows] = await connection.execute(`
      SELECT id, flow_file_id, user_identifier, 
             user_phone_analysis,
             user_bank_card_analysis,
             vehicle_analysis
      FROM flow_analysis
      WHERE flow_file_id = 21
    `)

    console.log('找到记录数:', rows.length)

    rows.forEach((row, index) => {
      console.log(`\n记录 ${index + 1}:`)
      console.log(`  ID: ${row.id}`)
      console.log(`  用户标识: ${row.user_identifier}`)
      console.log(`  user_phone_analysis类型: ${typeof row.user_phone_analysis}`)
      console.log(`  user_phone_analysis是数组: ${Array.isArray(row.user_phone_analysis)}`)
      console.log(`  user_phone_analysis长度: ${row.user_phone_analysis?.length || 0}`)
      console.log(`  user_bank_card_analysis类型: ${typeof row.user_bank_card_analysis}`)
      console.log(`  user_bank_card_analysis是数组: ${Array.isArray(row.user_bank_card_analysis)}`)
      console.log(`  user_bank_card_analysis长度: ${row.user_bank_card_analysis?.length || 0}`)
    })

    await connection.end()
  } catch (error) {
    console.error('检查失败:', error)
  }
}

checkNewData()