import mysql from 'mysql2/promise'

async function checkDatabaseData() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '9s7K!8p2Q@7m9Z#5',
      database: 'jizhi_db'
    })

    console.log('检查数据库中的数据...\n')

    const [rows] = await connection.execute(`
      SELECT id, flow_file_id, user_identifier, 
             LEFT(user_phone_analysis, 100) as user_phone_analysis_sample,
             LEFT(user_bank_card_analysis, 100) as user_bank_card_analysis_sample,
             LEFT(vehicle_analysis, 100) as vehicle_analysis_sample
      FROM flow_analysis
      WHERE flow_file_id = 20
      LIMIT 2
    `)

    console.log('找到记录数:', rows.length)

    rows.forEach((row, index) => {
      console.log(`\n记录 ${index + 1}:`)
      console.log(`  ID: ${row.id}`)
      console.log(`  用户标识: ${row.user_identifier}`)
      console.log(`  user_phone_analysis样本: ${row.user_phone_analysis_sample}`)
      console.log(`  user_bank_card_analysis样本: ${row.user_bank_card_analysis_sample}`)
      console.log(`  vehicle_analysis样本: ${row.vehicle_analysis_sample}`)
    })

    await connection.end()
  } catch (error) {
    console.error('检查失败:', error)
  }
}

checkDatabaseData()