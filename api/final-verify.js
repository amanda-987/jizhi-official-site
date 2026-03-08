import http from 'http'

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/flow-analysis/18',
  method: 'GET'
}

console.log('正在获取文件ID 18的最新分析结果...')

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
          
          const entertainment = analysis.restricted_consumption?.entertainment || []
          console.log(`   娱乐场所总数: ${entertainment.length}`)
          
          console.log(`   过滤后的娱乐场所（排除自然人）:`)
          const filtered = entertainment.filter(item => {
            if (!item.location) return false
            const isIndividual = /^[\u4e00-\u9fa5]{2,4}$/.test(item.location.trim())
            return !isIndividual
          })
          
          filtered.forEach((item, i) => {
            console.log(`     ${i + 1}. 时间: ${item.time}, 金额: ${item.amount}, 消费场所: ${item.location}, 对手方: ${item.counterparty}`)
          })
          
          console.log(`   被过滤的自然人:`)
          const individuals = entertainment.filter(item => {
            if (!item.location) return false
            const isIndividual = /^[\u4e00-\u9fa5]{2,4}$/.test(item.location.trim())
            return isIndividual
          })
          
          individuals.forEach((item, i) => {
            console.log(`     ${i + 1}. 时间: ${item.time}, 金额: ${item.amount}, 消费场所: ${item.location}, 对手方: ${item.counterparty}`)
          })
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