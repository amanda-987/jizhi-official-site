import http from 'http'

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/flow-analysis/analyze/17',
  method: 'POST'
}

console.log('正在重新分析文件ID 17...')

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
      console.log(`消息: ${result.message}`)
      
      if (result.code === 200 && result.data) {
        console.log(`\n返回的工作表数量: ${result.data.length}`)
        
        const results = Array.isArray(result.data) ? result.data : [result.data]
        results.forEach((analysis, index) => {
          console.log(`\n${index + 1}. 用户标识: ${analysis.user_identifier}`)
          console.log(`   娱乐场所数量: ${analysis.restrictedConsumption?.entertainment?.length || 0}`)
          console.log(`   娱乐场所详情: ${JSON.stringify(analysis.restrictedConsumption?.entertainment || [])}`)
          console.log(`   限制消费行为总结: ${JSON.stringify(analysis.restrictedConsumptionSummary || {})}`)
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