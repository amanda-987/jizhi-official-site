import http from 'http'

const testFileId = 10

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
        const summary = result.data.summary
        console.log(`\n汇总数据:`)
        console.log(`  totalTransactions: ${summary?.totalTransactions}`)
        console.log(`  totalAmount: ${summary?.totalAmount}`)
        console.log(`  inTransactionCount: ${summary?.inTransactionCount}`)
        console.log(`  inTransactionAmount: ${summary?.inTransactionAmount}`)
        console.log(`  outTransactionCount: ${summary?.outTransactionCount}`)
        console.log(`  outTransactionAmount: ${summary?.outTransactionAmount}`)
        console.log(`  rechargeCount: ${summary?.rechargeCount}`)
        console.log(`  vehicleCount: ${summary?.vehicleCount}`)
        console.log(`  largeTransactionCount: ${summary?.largeTransactionCount}`)
        
        if (summary?.inTransactionCount !== undefined) {
          console.log(`\n✅ 新字段已正确生成！`)
        } else {
          console.log(`\n❌ 新字段未生成，可能后端未重启`)
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