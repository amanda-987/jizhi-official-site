import http from 'http'

const testFileId = 13

const options = {
  hostname: 'localhost',
  port: 3001,
  path: `/api/flow-analysis/${testFileId}`,
  method: 'GET'
}

console.log(`正在获取文件ID ${testFileId} 的分析结果...`)

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
        console.log(`\n分析结果数量: ${result.data.length}`)
        result.data.forEach((analysis, index) => {
          console.log(`\n${index + 1}. 用户标识: ${analysis.user_identifier}`)
          console.log(`   车辆信息数量: ${analysis.vehicle_analysis?.length || 0}`)
          console.log(`   奢侈品数量: ${analysis.restricted_consumption?.luxury?.length || 0}`)
          console.log(`   银行卡数量: ${analysis.user_bank_card_analysis?.length || 0}`)
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