import http from 'http'

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/flow-analysis/18',
  method: 'GET'
}

console.log('获取文件ID 18的分析结果...')

const req = http.request(options, (res) => {
  let data = ''
  
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data)
      console.log(`\nAPI响应:`)
      console.log(`状态码: ${result.code}`)
      console.log(`数据类型: ${typeof result.data}`)
      console.log(`是否为数组: ${Array.isArray(result.data)}`)
      console.log(`数据长度: ${result.data?.length}`)
      
      if (result.code === 200 && result.data) {
        console.log(`\n第一个工作表数据:`)
        const firstAnalysis = result.data[0]
        console.log(`用户标识: ${firstAnalysis.user_identifier}`)
        console.log(`restricted_consumption存在: ${!!firstAnalysis.restricted_consumption}`)
        console.log(`restricted_consumption类型: ${typeof firstAnalysis.restricted_consumption}`)
        
        if (firstAnalysis.restricted_consumption) {
          console.log(`\n限制消费行为数据:`)
          console.log(`flights: ${(firstAnalysis.restricted_consumption.flights || []).length}`)
          console.log(`hotels: ${(firstAnalysis.restricted_consumption.hotels || []).length}`)
          console.log(`entertainment: ${(firstAnalysis.restricted_consumption.entertainment || []).length}`)
          console.log(`luxury: ${(firstAnalysis.restricted_consumption.luxury || []).length}`)
          console.log(`travel: ${(firstAnalysis.restricted_consumption.travel || []).length}`)
          console.log(`realEstate: ${(firstAnalysis.restricted_consumption.realEstate || []).length}`)
          console.log(`insurance: ${(firstAnalysis.restricted_consumption.insurance || []).length}`)
        }
        
        console.log(`\n第一个工作表的所有字段:`)
        console.log(Object.keys(firstAnalysis).join(', '))
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