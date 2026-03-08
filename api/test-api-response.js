import http from 'http'

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/flow-analysis/20',
  method: 'GET'
}

console.log('测试API返回数据...\n')

const req = http.request(options, (res) => {
  let data = ''
  
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data)
      console.log('API响应状态码:', res.statusCode)
      console.log('API响应头:', res.headers)
      console.log('响应数据:')
      console.log('  code:', result.code)
      console.log('  message:', result.message)
      console.log('  data type:', typeof result.data)
      console.log('  data is array:', Array.isArray(result.data))
      console.log('  data length:', result.data?.length)
      
      if (result.data && result.data.length > 0) {
        console.log('\n第一个工作表数据:')
        const first = result.data[0]
        console.log('  user_identifier:', first.user_identifier)
        console.log('  user_phone_analysis length:', first.user_phone_analysis?.length)
        console.log('  user_bank_card_analysis length:', first.user_bank_card_analysis?.length)
        console.log('  vehicle_analysis length:', first.vehicle_analysis?.length)
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