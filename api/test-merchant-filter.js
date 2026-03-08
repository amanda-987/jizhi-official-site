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
        const topMerchants = result.data.topMerchants
        console.log(`\n最常消费商家 (前10名):`)
        console.log(`=`.repeat(80))
        
        topMerchants.forEach((merchant, index) => {
          console.log(`${index + 1}. ${merchant.name}`)
          console.log(`   交易次数: ${merchant.count}`)
          console.log(`   总金额: ${merchant.totalAmount.toFixed(2)}`)
          console.log()
        })
        
        console.log(`\n过滤说明:`)
        console.log(`- 已排除: 中国银联股份有限公司、财付通支付科技有限公司、网联清算有限公司`)
        console.log(`- 已排除: 自然人姓名 (2-4个汉字)`)
        console.log(`- 仅保留: 真正的商家消费`)
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