import mysql from 'mysql2/promise'

async function checkAnalysisData() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '9s7K!8p2Q@7m9Z#5',
      database: 'jizhi_db'
    })

    console.log('检查分析数据...\n')

    const [rows] = await connection.execute(`
      SELECT id, flow_file_id, user_identifier,
             user_phone_analysis,
             user_bank_card_analysis,
             vehicle_analysis,
             high_frequency_counterparties,
             restricted_consumption,
             large_transactions,
             top_merchants,
             summary
      FROM flow_analysis
      WHERE flow_file_id = 21
      ORDER BY id DESC
      LIMIT 2
    `)

    console.log('找到记录数:', rows.length)

    rows.forEach((row, index) => {
      console.log(`\n记录 ${index + 1}:`)
      console.log(`  ID: ${row.id}`)
      console.log(`  用户标识: ${row.user_identifier}`)
      console.log(`  user_phone_analysis类型: ${typeof row.user_phone_analysis}`)
      console.log(`  user_phone_analysis长度: ${row.user_phone_analysis?.length || 0}`)
      console.log(`  user_bank_card_analysis类型: ${typeof row.user_bank_card_analysis}`)
      console.log(`  user_bank_card_analysis长度: ${row.user_bank_card_analysis?.length || 0}`)
      console.log(`  vehicle_analysis类型: ${typeof row.vehicle_analysis}`)
      console.log(`  vehicle_analysis长度: ${row.vehicle_analysis?.length || 0}`)
      console.log(`  high_frequency_counterparties类型: ${typeof row.high_frequency_counterparties}`)
      console.log(`  high_frequency_counterparties长度: ${row.high_frequency_counterparties?.length || 0}`)
      console.log(`  restricted_consumption类型: ${typeof row.restricted_consumption}`)
      console.log(`  restricted_consumption keys: ${row.restricted_consumption ? Object.keys(row.restricted_consumption).join(', ') : 'none'}`)
      console.log(`  large_transactions类型: ${typeof row.large_transactions}`)
      console.log(`  large_transactions长度: ${row.large_transactions?.length || 0}`)
      console.log(`  top_merchants类型: ${typeof row.top_merchants}`)
      console.log(`  top_merchants长度: ${row.top_merchants?.length || 0}`)
      console.log(`  summary类型: ${typeof row.summary}`)
      console.log(`  summary keys: ${row.summary ? Object.keys(row.summary).join(', ') : 'none'}`)
    })

    await connection.end()
  } catch (error) {
    console.error('检查失败:', error)
  }
}

checkAnalysisData()