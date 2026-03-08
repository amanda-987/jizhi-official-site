import xlsx from 'xlsx'
import fs from 'fs'

const filePath = 'D:\\jizhi\\api\\uploads\\177f9ec5-df52-40ef-85d1-ab106994cf82.xlsx'

if (!fs.existsSync(filePath)) {
  console.log('文件不存在')
  process.exit(1)
}

const workbook = xlsx.readFile(filePath)
const sheetNames = workbook.SheetNames

console.log('工作表列表:', sheetNames)

for (const sheetName of sheetNames) {
  if (sheetName === 'JHKJ99999999') {
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
    console.log(`\n包含"车"的列:`, keys.filter(k => k.includes('车')))
    console.log(`包含"地"的列:`, keys.filter(k => k.includes('地')))
    console.log(`包含"奢侈"的列:`, keys.filter(k => k.includes('奢侈')))
    console.log(`包含"会员"的列:`, keys.filter(k => k.includes('会员')))
    
    console.log(`\n前10行数据:`)
    data.slice(0, 10).forEach((row, index) => {
      console.log(`\n第${index + 1}行:`)
      console.log('  车辆相关:', Object.entries(row).filter(([k, v]) => k.includes('车')))
      console.log('  地点相关:', Object.entries(row).filter(([k, v]) => k.includes('地')))
      console.log('  奢侈相关:', Object.entries(row).filter(([k, v]) => k.includes('奢侈') || k.includes('会员')))
      console.log('  备注信息:', Object.entries(row).filter(([k, v]) => k.includes('备注')))
    })
    
    break
  }
}