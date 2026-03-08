import http from 'http'

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/flow-analysis/21',
  method: 'GET'
}

console.log('测试限制消费行为...\n')

const req = http.request(options, (res) => {
  let data = ''
  
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data)
      
      if (result.data && result.data.length > 0) {
        const first = result.data[0]
        const restricted = first.restricted_consumption
        
        console.log('限制消费行为分析:')
        console.log(`  航班消费: ${restricted.flights?.length || 0} 笔`)
        console.log(`  酒店消费: ${restricted.hotels?.length || 0} 笔`)
        console.log(`  餐厅消费: ${restricted.restaurants?.length || 0} 笔`)
        console.log(`  娱乐消费: ${restricted.entertainment?.length || 0} 笔`)
        console.log(`  旅游消费: ${restricted.travel?.length || 0} 笔`)
        console.log(`  保险消费: ${restricted.insurance?.length || 0} 笔`)
        console.log(`  奢侈品消费: ${restricted.luxury?.length || 0} 笔`)
        console.log(`  房地产消费: ${restricted.realEstate?.length || 0} 笔 (应该为0)`)
        
        if (restricted.luxury && restricted.luxury.length > 0) {
          console.log('\n奢侈品消费示例 (前5个):')
          restricted.luxury.slice(0, 5).forEach((lux, index) => {
            console.log(`  ${index + 1}. ${lux.counterparty} - ${lux.amount} - 备注: ${lux.remark || '无'}`)
          })
        } else {
          console.log('\n✅ 奢侈品消费识别正确，没有误识别')
        }
      }
    } catch (e) {
      console.error('解析响应失败:', e.message)
    }
  })
})

req.on('error', (e) => {
  console.error('请求失败:', e.message)
})

req.end()