import http from 'http'

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/flow-analysis/18',
  method: 'GET'
}

console.log('检查数据类型...\n')

const req = http.request(options, (res) => {
  let data = ''
  
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data)
      
      if (result.code === 200 && result.data) {
        result.data.forEach((analysis, index) => {
          console.log(`工作表 ${index + 1}: ${analysis.user_identifier}`)
          console.log(`user_bank_card_analysis:`)
          console.log(`  存在: ${!!analysis.user_bank_card_analysis}`)
          console.log(`  类型: ${typeof analysis.user_bank_card_analysis}`)
          console.log(`  是否为数组: ${Array.isArray(analysis.user_bank_card_analysis)}`)
          console.log(`  长度: ${analysis.user_bank_card_analysis?.length || 0}`)
          
          if (analysis.user_bank_card_analysis) {
            console.log(`  内容: ${JSON.stringify(analysis.user_bank_card_analysis).substring(0, 200)}...`)
          }
        })
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