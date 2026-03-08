import http from 'http'

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/flow-analysis/20',
  method: 'GET'
}

console.log('检查API返回的数据格式...\n')

const req = http.request(options, (res) => {
  let data = ''
  
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data)
      console.log('API响应:')
      console.log(`状态码: ${result.code}`)
      console.log(`数据类型: ${typeof result.data}`)
      console.log(`是否为数组: ${Array.isArray(result.data)}`)
      console.log(`数据长度: ${result.data?.length}\n`)
      
      if (result.code === 200 && result.data) {
        result.data.forEach((analysis, index) => {
          console.log(`${'='.repeat(60)}`)
          console.log(`工作表 ${index + 1}: ${analysis.user_identifier}`)
          console.log(`${'='.repeat(60)}`)
          
          console.log(`\n数据结构:`)
          console.log(`  user_phone_analysis: ${typeof analysis.user_phone_analysis}, 长度: ${analysis.user_phone_analysis?.length || 0}`)
          console.log(`  user_bank_card_analysis: ${typeof analysis.user_bank_card_analysis}, 长度: ${analysis.user_bank_card_analysis?.length || 0}`)
          console.log(`  vehicle_analysis: ${typeof analysis.vehicle_analysis}, 长度: ${analysis.vehicle_analysis?.length || 0}`)
          console.log(`  high_frequency_counterparties: ${typeof analysis.high_frequency_counterparties}, 长度: ${analysis.high_frequency_counterparties?.length || 0}`)
          console.log(`  restricted_consumption: ${typeof analysis.restricted_consumption}`)
          console.log(`  large_transactions: ${typeof analysis.large_transactions}, 长度: ${analysis.large_transactions?.length || 0}`)
          console.log(`  top_merchants: ${typeof analysis.top_merchants}, 长度: ${analysis.top_merchants?.length || 0}`)
          console.log(`  summary: ${typeof analysis.summary}`)
          
          if (analysis.restricted_consumption) {
            console.log(`\n限制消费详情:`)
            console.log(`  flights: ${analysis.restricted_consumption.flights?.length || 0}`)
            console.log(`  hotels: ${analysis.restricted_consumption.hotels?.length || 0}`)
            console.log(`  entertainment: ${analysis.restricted_consumption.entertainment?.length || 0}`)
            console.log(`  luxury: ${analysis.restricted_consumption.luxury?.length || 0}`)
            console.log(`  travel: ${analysis.restricted_consumption.travel?.length || 0}`)
            console.log(`  realEstate: ${analysis.restricted_consumption.realEstate?.length || 0}`)
            console.log(`  insurance: ${analysis.restricted_consumption.insurance?.length || 0}`)
          }
        })
      }
    } catch (e) {
      console.error('解析响应失败:', e.message)
      console.log('原始响应:', data)
    }
  })
})

req.on('error', (e) => {
  console.error('请求失败:', e.message)
})

req.end()