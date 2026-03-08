import http from 'http'

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/flow-analysis/21',
  method: 'GET'
}

console.log('测试所有字段...\n')

const req = http.request(options, (res) => {
  let data = ''
  
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data)
      
      if (result.data && result.data.length > 0) {
        const first = result.data[0]
        
        console.log('工作表:', first.user_identifier)
        console.log('\n用户手机号码:')
        console.log(`  类型: ${typeof first.user_phone_analysis}`)
        console.log(`  长度: ${first.user_phone_analysis?.length}`)
        console.log(`  第一个:`, first.user_phone_analysis?.[0])
        
        console.log('\n名下银行卡:')
        console.log(`  类型: ${typeof first.user_bank_card_analysis}`)
        console.log(`  长度: ${first.user_bank_card_analysis?.length}`)
        console.log(`  第一个:`, first.user_bank_card_analysis?.[0])
        
        console.log('\n车辆信息:')
        console.log(`  类型: ${typeof first.vehicle_analysis}`)
        console.log(`  长度: ${first.vehicle_analysis?.length}`)
        console.log(`  第一个:`, first.vehicle_analysis?.[0])
        
        console.log('\n高频交易对手:')
        console.log(`  类型: ${typeof first.high_frequency_counterparties}`)
        console.log(`  长度: ${first.high_frequency_counterparties?.length}`)
        console.log(`  第一个:`, first.high_frequency_counterparties?.[0])
        
        console.log('\n限制消费:')
        console.log(`  类型: ${typeof first.restricted_consumption}`)
        console.log(`  Keys:`, Object.keys(first.restricted_consumption || {}))
        
        console.log('\n大额交易:')
        console.log(`  类型: ${typeof first.large_transactions}`)
        console.log(`  长度: ${first.large_transactions?.length}`)
        console.log(`  第一个:`, first.large_transactions?.[0])
        
        console.log('\n顶级商户:')
        console.log(`  类型: ${typeof first.top_merchants}`)
        console.log(`  长度: ${first.top_merchants?.length}`)
        console.log(`  第一个:`, first.top_merchants?.[0])
        
        console.log('\n汇总信息:')
        console.log(`  类型: ${typeof first.summary}`)
        console.log(`  Keys:`, Object.keys(first.summary || {}))
        console.log(`  内容:`, first.summary)
      }
    } catch (e) {
      console.error('解析响应失败:', e.message)
    }
  })
})

req.on('error', (e) => {
  console.error('请求失败:', e.message)
})

req.end()