import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, 'api/.env') })

async function testAnalysisData() {
  const API_BASE = 'http://localhost:3001/api'

  console.log('=== 测试分析数据结构 ===\n')

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

    console.log('\n2. 获取已保存的分析结果...')
    const response2 = await fetch(`${API_BASE}/flow-analysis/${fileId}`)
    const data2 = await response2.json()
    
    console.log(`✓ 状态码: ${response2.status}`)
    console.log(`✓ 响应消息: ${data2.message}`)
    
    if (data2.code === 200) {
      if (data2.data.length > 0) {
        const analysis = data2.data[0]
        console.log(`✓ 找到分析结果 (ID: ${analysis.id})`)
        console.log(`✓ 数据类型: ${typeof analysis}`)
        console.log(`✓ 数据键: ${Object.keys(analysis)}`)
        
        console.log('\n3. 检查各个字段:')
        console.log(`  - userPhoneAnalysis: ${analysis.userPhoneAnalysis ? '存在' : '不存在'}`)
        console.log(`  - user_phone_analysis: ${analysis.user_phone_analysis ? '存在' : '不存在'}`)
        console.log(`  - vehicleAnalysis: ${analysis.vehicleAnalysis ? '存在' : '不存在'}`)
        console.log(`  - vehicle_analysis: ${analysis.vehicle_analysis ? '存在' : '不存在'}`)
        console.log(`  - highFrequencyCounterparties: ${analysis.highFrequencyCounterparties ? '存在' : '不存在'}`)
        console.log(`  - high_frequency_counterparties: ${analysis.high_frequency_counterparties ? '存在' : '不存在'}`)
        console.log(`  - restrictedConsumption: ${analysis.restrictedConsumption ? '存在' : '不存在'}`)
        console.log(`  - restricted_consumption: ${analysis.restricted_consumption ? '存在' : '不存在'}`)
        console.log(`  - largeTransactions: ${analysis.largeTransactions ? '存在' : '不存在'}`)
        console.log(`  - large_transactions: ${analysis.large_transactions ? '存在' : '不存在'}`)
        console.log(`  - topMerchants: ${analysis.topMerchants ? '存在' : '不存在'}`)
        console.log(`  - top_merchants: ${analysis.top_merchants ? '存在' : '不存在'}`)
        console.log(`  - summary: ${analysis.summary ? '存在' : '不存在'}`)
        
        if (analysis.user_phone_analysis) {
          console.log(`\n4. user_phone_analysis 数据:`)
          console.log(`   类型: ${typeof analysis.user_phone_analysis}`)
          console.log(`   长度: ${Array.isArray(analysis.user_phone_analysis) ? analysis.user_phone_analysis.length : '非数组'}`)
          if (Array.isArray(analysis.user_phone_analysis) && analysis.user_phone_analysis.length > 0) {
            console.log(`   第一项:`, JSON.stringify(analysis.user_phone_analysis[0], null, 2))
          }
        }
        
        if (analysis.restricted_consumption) {
          console.log(`\n5. restricted_consumption 数据:`)
          console.log(`   类型: ${typeof analysis.restricted_consumption}`)
          console.log(`   键: ${Object.keys(analysis.restricted_consumption)}`)
          Object.keys(analysis.restricted_consumption).forEach(key => {
            const value = analysis.restricted_consumption[key]
            console.log(`   - ${key}: ${Array.isArray(value) ? `数组(${value.length}项)` : typeof value}`)
          })
        }
      } else {
        console.log('✓ 暂无分析结果')
      }
    }

    console.log('\n=== 测试完成 ===')
  } catch (error) {
    console.error('✗ 测试失败:', error.message)
    if (error.cause) {
      console.error('✗ 错误原因:', error.cause)
    }
  }
}

testAnalysisData()
