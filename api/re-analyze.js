import http from 'http'

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/flow-analysis/analyze/20',
  method: 'POST'
}

console.log('开始重新分析数据...\n')

const req = http.request(options, (res) => {
  let data = ''
  
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data)
      console.log('分析结果:')
      console.log(`状态码: ${result.code}`)
      console.log(`消息: ${result.message}`)
      
      if (result.code === 200) {
        console.log(`\n分析完成，共 ${result.data?.length || 0} 个工作表`)
        result.data?.forEach((analysis, index) => {
          console.log(`\n工作表 ${index + 1}: ${analysis.user_identifier}`)
          console.log(`  用户手机: ${analysis.userPhoneAnalysis?.length || 0} 个`)
          console.log(`  银行卡: ${analysis.userBankCardAnalysis?.length || 0} 张`)
          console.log(`  车辆: ${analysis.vehicleAnalysis?.length || 0} 辆`)
          console.log(`  高频对手: ${analysis.highFrequencyCounterparties?.length || 0} 个`)
          console.log(`  限制消费: ${analysis.restrictedConsumption?.flights?.length || 0} 机票, ${analysis.restrictedConsumption?.hotels?.length || 0} 酒店, ${analysis.restrictedConsumption?.entertainment?.length || 0} 娱乐`)
        })
      } else {
        console.log(`错误: ${result.message}`)
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