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
console.log('文件路径:', filePath)

const workbook = xlsx.readFile(filePath)

console.log('\n工作表列表:', workbook.SheetNames)

for (const sheetName of workbook.SheetNames) {
  console.log(`\n=== 工作表: ${sheetName} ===`)
  const worksheet = workbook.Sheets[sheetName]
  const data = xlsx.utils.sheet_to_json(worksheet, { header: 1 })
  
  console.log(`总行数: ${data.length}`)
  
  if (data.length > 0) {
    console.log('\n前5行数据:')
    for (let i = 0; i < Math.min(5, data.length); i++) {
      console.log(`第${i + 1}行:`, data[i])
    }
    
    console.log('\n使用默认列名解析的第一行数据:')
    const jsonData = xlsx.utils.sheet_to_json(worksheet)
    if (jsonData.length > 0) {
      console.log('列名:', Object.keys(jsonData[0]))
      console.log('第一行数据:', jsonData[0])
    }
  }
}
