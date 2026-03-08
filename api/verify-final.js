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
          
          const companyKeywords = ['公司', '有限', '股份', '集团', '银行', '银联', '证券', '基金', '保险', '投资', '科技', '网络', '信息', '数据', '服务', '娱乐', '文化', '传媒', '酒店', '餐饮', '酒吧', 'KTV', 'ktv', '量贩', '俱乐部', '会所', '中心', '广场', '商城', '超市', '市场', '经营', '企业', '实业', '发展', '建设', '管理', '控股']
          
          console.log(`   过滤后的娱乐场所（排除自然人）:`)
          const filtered = entertainment.filter(item => {
            if (!item.location) return false
            const location = item.location.trim()
            
            const hasCompanyKeyword = companyKeywords.some(keyword => location.includes(keyword))
            
            if (hasCompanyKeyword) return true
            
            const isIndividual = /^[\u4e00-\u9fa5]{2,4}$/.test(location)
            return !isIndividual
          })
          
          filtered.forEach((item, i) => {
            console.log(`     ${i + 1}. 时间: ${item.time}, 金额: ${item.amount}, 消费场所: ${item.location}, 对手方: ${item.counterparty}`)
          })
          
          console.log(`   被过滤的自然人:`)
          const individuals = entertainment.filter(item => {
            if (!item.location) return false
            const location = item.location.trim()
            
            const hasCompanyKeyword = companyKeywords.some(keyword => location.includes(keyword))
            
            if (hasCompanyKeyword) return false
            
            const isIndividual = /^[\u4e00-\u9fa5]{2,4}$/.test(location)
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