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
  
  console.log('\n前10行原始数据:')
  const range = xlsx.utils.decode_range(worksheet['!ref'])
  for (let row = 0; row < Math.min(10, range.e.r + 1); row++) {
    const rowData = []
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = xlsx.utils.encode_cell({ r: row, c: col })
      const cell = worksheet[cellAddress]
      rowData.push(cell ? cell.v : '')
    }
    console.log(`第${row + 1}行:`, rowData)
  }
  
  console.log('\n使用默认列名解析:')
  const jsonData = xlsx.utils.sheet_to_json(worksheet)
  if (jsonData.length > 0) {
    console.log('列名:', Object.keys(jsonData[0]))
    console.log('第一行数据:', jsonData[0])
    console.log('第二行数据:', jsonData[1])
  }
}
