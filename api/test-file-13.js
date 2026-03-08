import http from 'http'

const testFileId = 13

const options = {
  hostname: 'localhost',
  port: 3001,
  path: `/api/flow-analysis/analyze/${testFileId}`,
  method: 'POST'
}

console.log(`正在重新分析文件ID ${testFileId}...`)

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
        console.log(`\n车辆信息数量: ${result.data.vehicleAnalysis?.length || 0}`)
        console.log(`奢侈品数量: ${result.data.restrictedConsumption?.luxury?.length || 0}`)
        console.log(`银行卡数量: ${result.data.userBankCardAnalysis?.length || 0}`)
        
        if (result.data.vehicleAnalysis && result.data.vehicleAnalysis.length > 0) {
          console.log(`\n车辆信息:`)
          result.data.vehicleAnalysis.forEach((vehicle, index) => {
            console.log(`${index + 1}. 车牌号: ${vehicle.plateNumber}, 出现次数: ${vehicle.count}, 关联地点: ${vehicle.locations?.join(', ') || '无'}`)
          })
        }
        
        if (result.data.restrictedConsumption && result.data.restrictedConsumption.luxury && result.data.restrictedConsumption.luxury.length > 0) {
          console.log(`\n奢侈品信息:`)
          result.data.restrictedConsumption.luxury.forEach((luxury, index) => {
            console.log(`${index + 1}. 时间: ${luxury.time}, 金额: ${luxury.amount}, 对手方: ${luxury.counterparty}`)
          })
        }
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