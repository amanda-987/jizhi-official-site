import http from 'http'

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/flow-analysis/analyze/21',
  method: 'POST'
}

console.log('测试分析过程...\n')

const req = http.request(options, (res) => {
  let data = ''
  
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data)
      console.log('分析结果:')
      console.log(`状态码: ${result.code}`)
      console.log(`消息: ${result.message}`)
      
      if (result.code === 200) {
        console.log(`\n分析完成，共 ${result.data?.length || 0} 个工作表`)
        console.log('\n请查看后端控制台日志，确认所有工作表都被正确遍历和分析')
      } else {
        console.log(`\n错误: ${result.message}`)
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