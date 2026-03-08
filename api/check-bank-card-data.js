import http from 'http'

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/flow-analysis/18',
  method: 'GET'
}

console.log('检查银行卡分析数据...\n')

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
          
          console.log(`\n用户银行卡分析数据:`)
          console.log(`user_bank_card_analysis存在: ${!!analysis.user_bank_card_analysis}`)
          console.log(`user_bank_card_analysis类型: ${typeof analysis.user_bank_card_analysis}`)
          console.log(`user_bank_card_analysis长度: ${analysis.user_bank_card_analysis?.length || 0}`)
          
          if (analysis.user_bank_card_analysis && analysis.user_bank_card_analysis.length > 0) {
            console.log(`\n银行卡详情:`)
            analysis.user_bank_card_analysis.forEach((card, i) => {
              console.log(`  ${i + 1}. 银行: ${card.bank || '未知'}`)
              console.log(`     账号: ${card.account || '未知'}`)
              console.log(`     交易笔数: ${card.transactionCount || 0}`)
              console.log(`     入账金额: ${card.inAmount || 0}`)
              console.log(`     出账金额: ${card.outAmount || 0}`)
            })
          } else {
            console.log('  无银行卡数据')
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