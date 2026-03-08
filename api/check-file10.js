import http from 'http'

const fileId = 10

const options = {
  hostname: 'localhost',
  port: 3001,
  path: `/api/flow-analysis/${fileId}`,
  method: 'GET'
}

const req = http.request(options, (res) => {
  let data = ''
  
  res.on('data', (chunk) => {
    data += chunk
  })
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data)
      console.log(`文件ID ${fileId} 分析结果:`)
      console.log(`状态码: ${result.code}`)
      console.log(`消息: ${result.message}`)
      
      if (result.code === 200 && result.data) {
        console.log(`\n完整数据:`)
        console.log(JSON.stringify(result.data, null, 2))
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