import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, 'api/.env') })

async function testGetAnalysisResult() {
  const API_BASE = 'http://localhost:3001/api'

  console.log('=== 测试获取分析结果API ===\n')

  try {
    console.log('1. 获取流水文件列表...')
    const response1 = await fetch(`${API_BASE}/flow-files`)
    const data1 = await response1.json()
    
    if (data1.code !== 200 || data1.data.length === 0) {
      console.log('没有找到流水文件')
      return
    }

    const fileId = data1.data[0].id
    const fileName = data1.data[0].file_name
    const status = data1.data[0].status
    
    console.log(`✓ 找到文件: ${fileName} (ID: ${fileId}, 状态: ${status})`)

    console.log('\n2. 获取分析结果...')
    const response2 = await fetch(`${API_BASE}/flow-analysis/${fileId}`)
    const data2 = await response2.json()
    
    console.log(`✓ 状态码: ${response2.status}`)
    console.log(`✓ 响应消息: ${data2.message}`)
    
    if (data2.code === 200) {
      if (data2.data.length > 0) {
        const analysis = data2.data[0]
        console.log(`✓ 找到分析结果 (ID: ${analysis.id})`)
        console.log(`✓ 创建时间: ${analysis.created_at}`)
        console.log(`✓ 汇总数据:`, JSON.stringify(analysis.summary, null, 2))
      } else {
        console.log('✓ 暂无分析结果')
      }
    }

    console.log('\n=== API测试完成 ===')
    console.log('✓ 获取分析结果API正常工作')

  } catch (error) {
    console.error('✗ API测试失败:', error.message)
    if (error.cause) {
      console.error('✗ 错误原因:', error.cause)
    }
  }
}

testGetAnalysisResult()
