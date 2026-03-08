// 测试API数据格式
import http from 'http'

const fileId = 21
const options = {
  hostname: 'localhost',
  port: 3001,
  path: `/api/flow-analysis/${fileId}`,
  method: 'GET'
}

console.log('测试API数据格式...\n')

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
      console.log(`消息: ${result.message}`)
      
      if (result.code === 200 && result.data && Array.isArray(result.data)) {
        console.log(`\n获取到 ${result.data.length} 个工作表的数据`)
        
        result.data.forEach((analysis, index) => {
          console.log(`\n工作表 ${index + 1}: ${analysis.user_identifier}`)
          console.log(`  - summary: ${!!analysis.summary}`)
          console.log(`  - user_phone_analysis: ${!!analysis.user_phone_analysis}, 长度: ${analysis.user_phone_analysis?.length || 0}`)
          console.log(`  - user_bank_card_analysis: ${!!analysis.user_bank_card_analysis}, 长度: ${analysis.user_bank_card_analysis?.length || 0}`)
          console.log(`  - vehicle_analysis: ${!!analysis.vehicle_analysis}, 长度: ${analysis.vehicle_analysis?.length || 0}`)
          console.log(`  - high_frequency_counterparties: ${!!analysis.high_frequency_counterparties}, 长度: ${analysis.high_frequency_counterparties?.length || 0}`)
          console.log(`  - restricted_consumption: ${!!analysis.restricted_consumption}`)
          if (analysis.restricted_consumption) {
            console.log(`    - flights: ${analysis.restricted_consumption.flights?.length || 0}`)
            console.log(`    - hotels: ${analysis.restricted_consumption.hotels?.length || 0}`)
            console.log(`    - entertainment: ${analysis.restricted_consumption.entertainment?.length || 0}`)
            console.log(`    - travel: ${analysis.restricted_consumption.travel?.length || 0}`)
            console.log(`    - insurance: ${analysis.restricted_consumption.insurance?.length || 0}`)
            console.log(`    - luxury: ${analysis.restricted_consumption.luxury?.length || 0}`)
          }
          console.log(`  - large_transactions: ${!!analysis.large_transactions}, 长度: ${analysis.large_transactions?.length || 0}`)
          console.log(`  - top_merchants: ${!!analysis.top_merchants}, 长度: ${analysis.top_merchants?.length || 0}`)
        })
        
        console.log('\n✅ 数据格式正常')
      } else {
        console.log('\n❌ 没有数据')
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