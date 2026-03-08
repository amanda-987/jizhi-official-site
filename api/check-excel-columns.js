import xlsx from 'xlsx'
import fs from 'fs'

const filePath = 'D:\\jizhi\\api\\uploads\\0f639ffe-e6d0-4a7e-8935-ed7408980d00.xlsx'

if (!fs.existsSync(filePath)) {
  console.log('文件不存在')
  process.exit(1)
}

const workbook = xlsx.readFile(filePath)
const sheetNames = workbook.SheetNames

console.log('工作表列表:', sheetNames)

for (const sheetName of sheetNames) {
  console.log(`\n分析工作表: ${sheetName}`)
  const worksheet = workbook.Sheets[sheetName]
  const data = xlsx.utils.sheet_to_json(worksheet)
  
  if (data.length === 0) {
    console.log('工作表为空，跳过')
    continue
  }
  
  console.log(`数据行数: ${data.length}`)
  console.log(`\n第一行数据:`, data[0])
  console.log(`\n所有列名:`, Object.keys(data[0]))
  
  const keys = Object.keys(data[0])
  console.log(`\n包含"银行"的列:`, keys.filter(k => k.includes('银行') || k.includes('Bank') || k.includes('bank')))
  console.log(`包含"账号"的列:`, keys.filter(k => k.includes('账号') || k.includes('Account') || k.includes('account')))
  console.log(`包含"卡号"的列:`, keys.filter(k => k.includes('卡号')))
  console.log(`包含"用户"的列:`, keys.filter(k => k.includes('用户')))
  console.log(`包含"对手"的列:`, keys.filter(k => k.includes('对手')))
  
  console.log(`\n前3行数据:`)
  data.slice(0, 3).forEach((row, index) => {
    console.log(`\n第${index + 1}行:`)
    console.log('  银行相关:', Object.entries(row).filter(([k, v]) => k.includes('银行') || k.includes('Bank') || k.includes('bank')))
    console.log('  账号相关:', Object.entries(row).filter(([k, v]) => k.includes('账号') || k.includes('Account') || k.includes('account') || k.includes('卡号')))
    console.log('  用户相关:', Object.entries(row).filter(([k, v]) => k.includes('用户')))
    console.log('  对手相关:', Object.entries(row).filter(([k, v]) => k.includes('对手')))
  })
  
  break
}