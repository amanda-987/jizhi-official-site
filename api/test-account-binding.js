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

let bankCardMap = new Map()

for (const sheetName of sheetNames) {
  console.log(`\n检查工作表: ${sheetName}`)
  const worksheet = workbook.Sheets[sheetName]
  const data = xlsx.utils.sheet_to_json(worksheet)
  
  if (data.length === 0) {
    console.log('工作表为空，跳过')
    continue
  }
  
  const firstRowKeys = Object.keys(data[0])
  console.log(`列名:`, firstRowKeys)
  
  const isAccountBindingSheet = firstRowKeys.some(key => 
    key.includes('银行账号') && key.includes('开户行')
  )
  
  console.log(`是否为账户绑定表: ${isAccountBindingSheet}`)
  
  if (isAccountBindingSheet) {
    console.log(`发现账户绑定信息表: ${sheetName}`)
    data.forEach((row, index) => {
      const bankAccount = row['银行账号']
      const bankName = row['开户行信息']
      console.log(`第${index + 1}行: 银行账号=${bankAccount}, 开户行=${bankName}`)
      if (bankAccount && bankName) {
        bankCardMap.set(bankAccount, bankName)
      }
    })
    console.log(`已加载 ${bankCardMap.size} 张银行卡信息`)
    console.log('银行卡映射:', Array.from(bankCardMap.entries()))
  }
}

console.log(`\n最终银行卡映射数量: ${bankCardMap.size}`)
console.log('银行卡映射:', Array.from(bankCardMap.entries()))