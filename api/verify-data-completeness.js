import http from 'http'

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/flow-analysis/18',
  method: 'GET'
}

console.log('验证数据遍历完整性...\n')

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
      console.log(`数据类型: ${typeof result.data}`)
      console.log(`是否为数组: ${Array.isArray(result.data)}`)
      console.log(`数据长度: ${result.data?.length}\n`)
      
      if (result.code === 200 && result.data) {
        console.log('详细分析结果:')
        result.data.forEach((analysis, index) => {
          console.log(`\n${'='.repeat(60)}`)
          console.log(`工作表 ${index + 1}: ${analysis.user_identifier}`)
          console.log(`${'='.repeat(60)}`)
          
          console.log(`\n1. 汇总信息:`)
          console.log(`   总交易笔数: ${analysis.summary?.totalTransactions || 0}`)
          console.log(`   总交易金额: ${analysis.summary?.totalAmount || 0}`)
          
          console.log(`\n2. 用户银行卡分析:`)
          console.log(`   银行卡数量: ${analysis.user_bank_card_analysis?.length || 0}`)
          
          console.log(`\n3. 车辆分析:`)
          console.log(`   车辆数量: ${analysis.vehicle_analysis?.length || 0}`)
          
          console.log(`\n4. 限制消费行为:`)
          if (analysis.restricted_consumption) {
            console.log(`   机票/高铁: ${analysis.restricted_consumption.flights?.length || 0} 笔`)
            console.log(`   宾馆/酒店: ${analysis.restricted_consumption.hotels?.length || 0} 笔`)
            console.log(`   娱乐场所: ${analysis.restricted_consumption.entertainment?.length || 0} 笔`)
            console.log(`   奢侈品/高端会员: ${analysis.restricted_consumption.luxury?.length || 0} 笔`)
            console.log(`   旅行社/旅游: ${analysis.restricted_consumption.travel?.length || 0} 笔`)
            console.log(`   房地产/装修: ${analysis.restricted_consumption.realEstate?.length || 0} 笔`)
            console.log(`   保险/证券/基金: ${analysis.restricted_consumption.insurance?.length || 0} 笔`)
          } else {
            console.log('   无限制消费行为数据')
          }
          
          console.log(`\n5. 高频对手方:`)
          console.log(`   数量: ${analysis.high_frequency_counterparties?.length || 0}`)
          
          console.log(`\n6. 大额交易:`)
          console.log(`   数量: ${analysis.large_transactions?.length || 0}`)
          
          console.log(`\n7. 顶级商户:`)
          console.log(`   数量: ${analysis.top_merchants?.length || 0}`)
        })
        
        console.log(`\n${'='.repeat(60)}`)
        console.log(`验证完成，共 ${result.data.length} 个工作表`)
        console.log(`${'='.repeat(60)}`)
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