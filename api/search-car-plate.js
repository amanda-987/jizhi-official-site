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
    
    const carPlatePattern = /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{4,5}[A-Z0-9挂学警港澳]/
    
    console.log(`\n搜索包含车牌号的记录:`)
    let count = 0
    data.forEach((row, index) => {
      const text = JSON.stringify(row)
      const hasCarPlate = carPlatePattern.test(text)
      if (hasCarPlate) {
        count++
        if (count <= 10) {
          console.log(`\n第${index + 1}行:`, row)
        }
      }
    })
    
    console.log(`\n共找到 ${count} 条包含车牌号的记录`)
    
    break
  }
}