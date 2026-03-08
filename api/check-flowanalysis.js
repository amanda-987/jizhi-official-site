import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const jsFilePath = join(__dirname, 'api/src/routes/flowAnalysis.js')

try {
  const content = readFileSync(jsFilePath, 'utf-8')
  console.log('检查flowAnalysis.js文件:')
  console.log('✓ 文件读取成功')
  console.log('✓ 文件大小:', content.length, '字符')
  
  const functionMatches = content.match(/function\s+\w+/g) || []
  console.log('✓ 函数数量:', functionMatches.length)
  
  const constMatches = content.match(/const\s+\w+/g) || []
  console.log('✓ 常量数量:', constMatches.length)
  
  const isHotelConsumptionMatch = content.match(/function\s+isHotelConsumption/g)
  const extractHotelNameMatch = content.match(/function\s+extractHotelName/g)
  
  console.log('✓ isHotelConsumption函数:', isHotelConsumptionMatch ? '存在' : '缺失')
  console.log('✓ extractHotelName函数:', extractHotelNameMatch ? '存在' : '缺失')
  
  if (isHotelConsumptionMatch && extractHotelNameMatch) {
    console.log('✓ 酒店消费相关函数已正确添加')
  } else {
    console.log('✗ 警告: 酒店消费相关函数可能缺失')
  }
  
} catch (error) {
  console.error('✗ 文件检查失败:', error.message)
}
