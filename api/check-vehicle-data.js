import http from 'http'

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/flow-analysis/20',
  method: 'GET'
}

console.log('检查车辆分析数据...\n')

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
          
          console.log(`\n车辆分析数据:`)
          console.log(`  存在: ${!!analysis.vehicle_analysis}`)
          console.log(`  类型: ${typeof analysis.vehicle_analysis}`)
          console.log(`  长度: ${analysis.vehicle_analysis?.length || 0}`)
          
          if (analysis.vehicle_analysis && analysis.vehicle_analysis.length > 0) {
            console.log(`\n车辆详情:`)
            analysis.vehicle_analysis.forEach((vehicle, i) => {
              console.log(`  ${i + 1}. 车牌号: ${vehicle.plateNumber}`)
              console.log(`     出现次数: ${vehicle.count}`)
              console.log(`     关联地点: ${vehicle.locations?.join(', ') || '无'}`)
            })
          } else {
            console.log('  无车辆数据')
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