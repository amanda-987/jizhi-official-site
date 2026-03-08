import http from 'http'

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/flow-analysis/20',
  method: 'GET'
}

console.log('检查银行卡数据结构...\n')

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
      console.log(`数据长度: ${result.data?.length}\n`)
      
      if (result.code === 200 && result.data) {
        result.data.forEach((analysis, index) => {
          console.log(`${'='.repeat(60)}`)
          console.log(`工作表 ${index + 1}: ${analysis.user_identifier}`)
          console.log(`${'='.repeat(60)}`)
          
          console.log(`\n银行卡数据:`)
          console.log(`  存在: ${!!analysis.user_bank_card_analysis}`)
          console.log(`  类型: ${typeof analysis.user_bank_card_analysis}`)
          console.log(`  长度: ${analysis.user_bank_card_analysis?.length || 0}`)
          
          if (analysis.user_bank_card_analysis && analysis.user_bank_card_analysis.length > 0) {
            console.log(`\n第一张银行卡详情:`)
            const firstCard = analysis.user_bank_card_analysis[0]
            console.log(`  字段: ${Object.keys(firstCard).join(', ')}`)
            console.log(`  数据:`, firstCard)
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