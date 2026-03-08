import http from 'http'

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/flow-analysis/18',
  method: 'GET'
}

console.log('正在获取文件ID 18的分析结果...')

const req = http.request(options, (res) => {
  let data = ''
  
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data)
      console.log(`\n分析结果:`)
      console.log(`状态码: ${result.code}`)
      
      if (result.code === 200 && result.data) {
        console.log(`\n返回的工作表数量: ${result.data.length}`)
        
        result.data.forEach((analysis, index) => {
          console.log(`\n${index + 1}. 用户标识: ${analysis.user_identifier}`)
          console.log(`   所有字段键: ${Object.keys(analysis).join(', ')}`)
          console.log(`   restricted_consumption: ${analysis.restricted_consumption ? '存在' : '不存在'}`)
          console.log(`   restrictedConsumptionSummary: ${analysis.restrictedConsumptionSummary ? '存在' : '不存在'}`)
          console.log(`   restricted_consumption_summary: ${analysis.restricted_consumption_summary ? '存在' : '不存在'}`)
          
          if (analysis.restrictedConsumptionSummary) {
            console.log(`   restrictedConsumptionSummary内容:`, JSON.stringify(analysis.restrictedConsumptionSummary))
          }
          if (analysis.restricted_consumption_summary) {
            console.log(`   restricted_consumption_summary内容:`, JSON.stringify(analysis.restricted_consumption_summary))
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