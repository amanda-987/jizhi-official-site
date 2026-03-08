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
          
          const restrictedConsumption = analysis.restricted_consumption
          console.log(`   restricted_consumption存在: ${!!restrictedConsumption}`)
          
          if (restrictedConsumption) {
            console.log(`   restricted_consumption的键: ${Object.keys(restrictedConsumption).join(', ')}`)
            console.log(`   flights数量: ${(restrictedConsumption.flights || []).length}`)
            console.log(`   hotels数量: ${(restrictedConsumption.hotels || []).length}`)
            console.log(`   entertainment数量: ${(restrictedConsumption.entertainment || []).length}`)
            console.log(`   luxury数量: ${(restrictedConsumption.luxury || []).length}`)
            console.log(`   travel数量: ${(restrictedConsumption.travel || []).length}`)
            console.log(`   realEstate数量: ${(restrictedConsumption.realEstate || []).length}`)
            console.log(`   insurance数量: ${(restrictedConsumption.insurance || []).length}`)
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