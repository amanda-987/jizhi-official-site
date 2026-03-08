import mysql from 'mysql2/promise'

async function checkAnalysisResults() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '9s7K!8p2Q@7m9Z#5',
      database: 'jizhi_db'
    })

    const [rows] = await connection.execute('SELECT * FROM flow_analysis WHERE flow_file_id = 20')
    
    console.log('分析结果数量:', rows.length)
    
    rows.forEach((row, index) => {
      console.log(`\n${'='.repeat(80)}`)
      console.log(`分析结果 ${index + 1}: ${row.user_identifier}`)
      console.log(`${'='.repeat(80)}`)
      
      console.log(`\n用户手机分析:`)
      console.log(`  存在: ${!!row.user_phone_analysis}`)
      console.log(`  类型: ${typeof row.user_phone_analysis}`)
      if (row.user_phone_analysis) {
        try {
          const phoneData = JSON.parse(row.user_phone_analysis)
          console.log(`  长度: ${phoneData?.length || 0}`)
          if (phoneData && phoneData.length > 0) {
            console.log(`  第一个手机号: ${phoneData[0].phone}`)
          }
        } catch (e) {
          console.log(`  解析失败: ${e.message}`)
        }
      }
      
      console.log(`\n用户银行卡分析:`)
      console.log(`  存在: ${!!row.user_bank_card_analysis}`)
      console.log(`  类型: ${typeof row.user_bank_card_analysis}`)
      if (row.user_bank_card_analysis) {
        try {
          const cardData = JSON.parse(row.user_bank_card_analysis)
          console.log(`  长度: ${cardData?.length || 0}`)
          if (cardData && cardData.length > 0) {
            console.log(`  第一张卡: ${cardData[0].account}`)
          }
        } catch (e) {
          console.log(`  解析失败: ${e.message}`)
        }
      }
      
      console.log(`\n车辆分析:`)
      console.log(`  存在: ${!!row.vehicle_analysis}`)
      console.log(`  类型: ${typeof row.vehicle_analysis}`)
      if (row.vehicle_analysis) {
        try {
          const vehicleData = JSON.parse(row.vehicle_analysis)
          console.log(`  长度: ${vehicleData?.length || 0}`)
          if (vehicleData && vehicleData.length > 0) {
            console.log(`  第一辆车: ${vehicleData[0].plateNumber}`)
          }
        } catch (e) {
          console.log(`  解析失败: ${e.message}`)
        }
      }
      
      console.log(`\n高频对手方:`)
      console.log(`  存在: ${!!row.high_frequency_counterparties}`)
      console.log(`  类型: ${typeof row.high_frequency_counterparties}`)
      if (row.high_frequency_counterparties) {
        try {
          const cpData = JSON.parse(row.high_frequency_counterparties)
          console.log(`  长度: ${cpData?.length || 0}`)
          if (cpData && cpData.length > 0) {
            console.log(`  第一个对手: ${cpData[0].name}`)
          }
        } catch (e) {
          console.log(`  解析失败: ${e.message}`)
        }
      }
      
      console.log(`\n限制消费行为:`)
      console.log(`  存在: ${!!row.restricted_consumption}`)
      console.log(`  类型: ${typeof row.restricted_consumption}`)
      if (row.restricted_consumption) {
        try {
          const consumption = JSON.parse(row.restricted_consumption)
          console.log(`  机票/高铁: ${consumption.flights?.length || 0}`)
          console.log(`  宾馆/酒店: ${consumption.hotels?.length || 0}`)
          console.log(`  娱乐场所: ${consumption.entertainment?.length || 0}`)
          console.log(`  奢侈品: ${consumption.luxury?.length || 0}`)
        } catch (e) {
          console.log(`  解析失败: ${e.message}`)
        }
      }
    })

    await connection.end()
  } catch (error) {
    console.error('查询失败:', error)
  }
}

checkAnalysisResults()