import http from 'http'

const options = {
  hostname: 'localhost',
  port: 3001,
  path: '/api/flow-files',
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
      console.log('=== 流水文件列表 ===\n')
      
      if (result.code === 200 && result.data) {
        const completedFiles = result.data.filter(f => f.status === 'completed').slice(0, 3)
        
        console.log(`找到 ${completedFiles.length} 个已完成的流水文件:\n`)
        
        completedFiles.forEach(file => {
          console.log(`文件ID: ${file.id}`)
          console.log(`文件名: ${file.file_name}`)
          console.log(`状态: ${file.status}`)
          console.log(`创建时间: ${file.created_at}`)
          console.log()
        })
        
        if (completedFiles.length > 0) {
          const fileId = completedFiles[0].id
          console.log(`\n正在获取文件ID ${fileId} 的分析结果...`)
          
          const analysisOptions = {
            hostname: 'localhost',
            port: 3001,
            path: `/api/flow-analysis/${fileId}`,
            method: 'GET'
          }
          
          const analysisReq = http.request(analysisOptions, (analysisRes) => {
            let analysisData = ''
            
            analysisRes.on('data', (chunk) => {
              analysisData += chunk
            })
            
            analysisRes.on('end', () => {
              try {
                const analysisResult = JSON.parse(analysisData)
                console.log(`\n分析结果状态码: ${analysisResult.code}`)
                console.log(`分析结果消息: ${analysisResult.message}`)
                
                if (analysisResult.code === 200 && analysisResult.data) {
                  const summary = analysisResult.data.summary
                  console.log(`\n汇总数据:`)
                  console.log(`  totalTransactions: ${summary?.totalTransactions}`)
                  console.log(`  totalAmount: ${summary?.totalAmount}`)
                  console.log(`  inTransactionCount: ${summary?.inTransactionCount}`)
                  console.log(`  inTransactionAmount: ${summary?.inTransactionAmount}`)
                  console.log(`  outTransactionCount: ${summary?.outTransactionCount}`)
                  console.log(`  outTransactionAmount: ${summary?.outTransactionAmount}`)
                  console.log(`  rechargeCount: ${summary?.rechargeCount}`)
                  console.log(`  vehicleCount: ${summary?.vehicleCount}`)
                  console.log(`  largeTransactionCount: ${summary?.largeTransactionCount}`)
                }
              } catch (e) {
                console.error('解析分析结果失败:', e.message)
              }
            })
          })
          
          analysisReq.on('error', (e) => {
            console.error('获取分析结果失败:', e.message)
          })
          
          analysisReq.end()
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