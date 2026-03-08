import xlsx from 'xlsx'
import fs from 'fs'

function getAmount(row) {
  const keys = Object.keys(row)
  let amount = 0
  let amountField = null
  
  for (const key of keys) {
    if (key.includes('交易金额(分)')) {
      const value = parseFloat(row[key])
      if (!isNaN(value)) {
        amount = value / 100
        amountField = key
        break
      }
    }
  }
  
  if (amount === 0) {
    for (const key of keys) {
      if (key.includes('交易金额(元)') || key.includes('金额') || key.includes('Amount') || key.includes('amount')) {
        const value = parseFloat(row[key])
        if (!isNaN(value)) {
          amount = value
          amountField = key
          break
        }
      }
    }
  }
  
  if (amount === 0) return 0
  
  const debitCreditType = row['借贷类型'] || row['借贷'] || ''
  
  if (debitCreditType === '出' || debitCreditType === '支出' || debitCreditType === '借') {
    return -Math.abs(amount)
  } else if (debitCreditType === '入' || debitCreditType === '收入' || debitCreditType === '贷') {
    return Math.abs(amount)
  }
  
  return amount
}

async function testAnalysis() {
  console.log('=== 测试入账出账统计 ===\n')
  
  const files = [
    'D:\\jizhi\\api\\uploads\\0f639ffe-e6d0-4a7e-8935-ed7408980d00.xlsx',
    'D:\\jizhi\\api\\uploads\\177f9ec5-df52-40ef-85d1-ab106994cf82.xlsx',
    'D:\\jizhi\\api\\uploads\\1fba2b26-4b38-4cdd-adf7-d6463f0b5861.xlsx'
  ]
  
  for (const filePath of files) {
    if (!fs.existsSync(filePath)) {
      console.log('文件不存在:', filePath)
      continue
    }
    
    console.log(`\n测试文件: ${filePath}`)
    const workbook = xlsx.readFile(filePath)
    const sheetNames = workbook.SheetNames
    
    console.log('工作表列表:', sheetNames)
    
    for (const sheetName of sheetNames) {
      console.log(`\n分析工作表: ${sheetName}`)
      const worksheet = workbook.Sheets[sheetName]
      const data = xlsx.utils.sheet_to_json(worksheet)
      
      console.log(`数据行数: ${data.length}`)
      
      if (data.length === 0) {
        console.log('工作表为空，跳过')
        continue
      }
      
      let inTransactionCount = 0
      let inTransactionAmount = 0
      let outTransactionCount = 0
      let outTransactionAmount = 0
      let totalTransactions = 0
      let totalAmount = 0
      
      data.forEach((row, index) => {
        const amount = getAmount(row)
        totalTransactions++
        totalAmount += amount
        
        if (amount > 0) {
          inTransactionCount++
          inTransactionAmount += amount
        } else if (amount < 0) {
          outTransactionCount++
          outTransactionAmount += Math.abs(amount)
        }
        
        if (index < 3) {
          console.log(`  第${index + 1}行: 金额=${amount}, 借贷类型=${row['借贷类型'] || row['借贷'] || '无'}`)
        }
      })
      
      console.log(`\n统计结果:`)
      console.log(`  总交易笔数: ${totalTransactions}`)
      console.log(`  总交易金额: ${totalAmount.toFixed(2)}`)
      console.log(`  入账笔数: ${inTransactionCount}`)
      console.log(`  入账金额: ${inTransactionAmount.toFixed(2)}`)
      console.log(`  出账笔数: ${outTransactionCount}`)
      console.log(`  出账金额: ${outTransactionAmount.toFixed(2)}`)
      
      break
    }
  }
  
  console.log('\n=== 测试完成 ===')
}

testAnalysis().catch(console.error)