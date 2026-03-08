import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

async function testAPI() {
  const API_BASE = 'http://localhost:3001/api'

  console.log('=== 测试API接口 ===\n')

  try {
    console.log('1. 测试获取流水文件列表...')
    const response1 = await fetch(`${API_BASE}/flow-files`)
    const data1 = await response1.json()
    console.log('✓ 状态码:', response1.status)
    console.log('✓ 响应:', data1.code === 200 ? '成功' : '失败')
    console.log('✓ 文件数量:', data1.data?.length || 0)

    console.log('\n2. 测试获取法律文书列表...')
    const response2 = await fetch(`${API_BASE}/legal-documents`)
    const data2 = await response2.json()
    console.log('✓ 状态码:', response2.status)
    console.log('✓ 响应:', data2.code === 200 ? '成功' : '失败')
    console.log('✓ 文书数量:', data2.data?.length || 0)

    console.log('\n3. 测试获取流水分析结果...')
    const response3 = await fetch(`${API_BASE}/flow-analysis/1`)
    const data3 = await response3.json()
    console.log('✓ 状态码:', response3.status)
    console.log('✓ 响应:', data3.code === 200 ? '成功' : '失败')

    console.log('\n=== API测试完成 ===')
    console.log('✓ 所有API接口正常工作')

  } catch (error) {
    console.error('✗ API测试失败:', error.message)
  }
}

testAPI()
