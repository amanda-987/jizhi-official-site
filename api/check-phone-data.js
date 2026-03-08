import http from 'http'

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/flow-analysis/20',
  method: 'GET'
}

console.log('检查用户手机分析数据...\n')

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
          
          console.log(`\n用户手机分析数据:`)
          console.log(`  存在: ${!!analysis.user_phone_analysis}`)
          console.log(`  类型: ${typeof analysis.user_phone_analysis}`)
          console.log(`  长度: ${analysis.user_phone_analysis?.length || 0}`)
          
          if (analysis.user_phone_analysis && analysis.user_phone_analysis.length > 0) {
            console.log(`\n手机号详情:`)
            analysis.user_phone_analysis.forEach((phone, i) => {
              console.log(`  ${i + 1}. 手机号: ${phone.phone}`)
              console.log(`     用户名: ${phone.userName}`)
              console.log(`     用户ID: ${phone.userId}`)
              console.log(`     充值金额: ${phone.amount}`)
              console.log(`     充值次数: ${phone.count}`)
              console.log(`     运营商: ${phone.operator}`)
            })
          } else {
            console.log('  无手机号数据')
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