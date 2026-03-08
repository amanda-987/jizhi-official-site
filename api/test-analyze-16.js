import http from 'http'

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/flow-analysis/analyze/16',
  method: 'POST'
}

console.log('正在重新分析文件ID 16...')

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
        console.log(`\n返回的工作表数量: ${Array.isArray(result.data) ? result.data.length : 1}`)
        
        const results = Array.isArray(result.data) ? result.data : [result.data]
        results.forEach((analysis, index) => {
          console.log(`\n${index + 1}. 用户标识: ${analysis.user_identifier}`)
          console.log(`   车辆信息数量: ${analysis.vehicleAnalysis?.length || 0}`)
          console.log(`   银行卡数量: ${analysis.userBankCardAnalysis?.length || 0}`)
          console.log(`   奢侈品数量: ${analysis.restrictedConsumption?.luxury?.length || 0}`)
          console.log(`   总交易笔数: ${analysis.summary?.totalTransactions || 0}`)
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