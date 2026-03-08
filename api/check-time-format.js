import xlsx from 'xlsx'
import fs from 'fs'
import path from 'path'

const uploadsDir = path.join(process.cwd(), 'uploads')
const files = fs.readdirSync(uploadsDir).filter(f => f.endsWith('.xlsx'))

if (files.length === 0) {
  console.log('没有找到Excel文件')
  process.exit(0)
}

const latestFile = files[files.length - 1]
const filePath = path.join(uploadsDir, latestFile)

console.log('检查文件:', latestFile)

const workbook = xlsx.readFile(filePath)

for (const sheetName of workbook.SheetNames) {
  const worksheet = workbook.Sheets[sheetName]
  const data = xlsx.utils.sheet_to_json(worksheet)

  if (data.length === 0) continue

  const firstRowKeys = Object.keys(data[0])
  const isValidTransactionSheet = firstRowKeys.some(key => 
    key.includes('用户ID') || key.includes('交易时间') || key.includes('交易金额') ||
    key.includes('金额') || key.includes('时间') || key.includes('对手')
  )

  if (!isValidTransactionSheet) continue

  console.log(`\n=== 工作表: ${sheetName} ===`)
  console.log('列名:', firstRowKeys)

  const timeKey = firstRowKeys.find(key => 
    key.includes('交易时间') || key.includes('时间') || key.includes('日期') || 
    key.includes('Time') || key.includes('Date') || key.includes('time') || key.includes('date')
  )

  if (timeKey) {
    console.log(`\n时间字段: ${timeKey}`)
    console.log('前10行时间数据:')
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const timeValue = data[i][timeKey]
      console.log(`  第${i + 1}行:`, timeValue, `类型: ${typeof timeValue}`)
    }
  }
}
