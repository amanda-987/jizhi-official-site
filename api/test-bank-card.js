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
        const userBankCardAnalysis = result.data.userBankCardAnalysis
        console.log(`\n用户名下银行卡分析:`)
        console.log(`=`.repeat(100))
        
        if (userBankCardAnalysis && userBankCardAnalysis.length > 0) {
          userBankCardAnalysis.forEach((card, index) => {
            console.log(`\n${index + 1}. 银行: ${card.bank}`)
            console.log(`   账号: ${card.account}`)
            console.log(`   用户名: ${card.userName}`)
            console.log(`   用户ID: ${card.userId}`)
            console.log(`   交易次数: ${card.transactionCount}`)
            console.log(`   总金额: ${card.totalAmount.toFixed(2)}`)
            console.log(`   入账金额: ${card.inAmount.toFixed(2)}`)
            console.log(`   出账金额: ${card.outAmount.toFixed(2)}`)
            console.log(`   首次交易时间: ${card.firstTransactionTime}`)
            console.log(`   最后交易时间: ${card.lastTransactionTime}`)
          })
          
          console.log(`\n✅ 银行卡分析功能已正常工作！`)
          console.log(`共找到 ${userBankCardAnalysis.length} 张银行卡`)
        } else {
          console.log(`\n❌ 未找到银行卡信息`)
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