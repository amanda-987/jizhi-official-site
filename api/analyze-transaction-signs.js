import xlsx from 'xlsx'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

async function analyzeTransactionSigns() {
  try {
    const FlowFile = (await import('./src/models/FlowFile.js')).default
    const files = await FlowFile.findAll()
    
    if (files.length === 0) {
      console.log('没有找到流水文件')
      return
    }
    
    const file = files[0]
    console.log(`分析文件: ${file.file_name}`)
    console.log(`文件路径: ${file.file_path}`)
    
    const workbook = xlsx.readFile(file.file_path)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(worksheet)
    
    console.log(`\n总记录数: ${data.length}`)
    console.log(`\n=== 分析金额符号 ===\n`)
    
    let positiveCount = 0
    let negativeCount = 0
    let zeroCount = 0
    
    const sampleSize = Math.min(20, data.length)
    
    console.log(`前${sampleSize}条记录的金额分析:\n`)
    
    for (let i = 0; i < sampleSize; i++) {
      const row = data[i]
      const keys = Object.keys(row)
      
      let amount = null
      let amountField = null
      
      for (const key of keys) {
        if (key.includes('交易金额(分)') || key.includes('交易金额(元)') || key.includes('金额')) {
          amount = parseFloat(row[key])
          amountField = key
          break
        }
      }
      
      if (amount !== null) {
        const sign = amount > 0 ? '+' : (amount < 0 ? '-' : '0')
        
        if (amount > 0) positiveCount++
        else if (amount < 0) negativeCount++
        else zeroCount++
        
        console.log(`第${i + 1}行:`)
        console.log(`  ${amountField}: ${amount} (${sign})`)
        console.log(`  对手方: ${row['对手侧账户名称'] || row['对手方'] || '无'}`)
        console.log(`  借贷类型: ${row['借贷类型'] || '无'}`)
        console.log()
      }
    }
    
    console.log(`\n=== 金额符号统计 ===`)
    console.log(`正数: ${positiveCount}`)
    console.log(`负数: ${negativeCount}`)
    console.log(`零: ${zeroCount}`)
    
    console.log(`\n=== 检查借贷类型字段 ===`)
    const debitCreditTypes = new Set()
    for (let i = 0; i < Math.min(50, data.length); i++) {
      const debitCreditType = data[i]['借贷类型']
      if (debitCreditType) {
        debitCreditTypes.add(debitCreditType)
      }
    }
    console.log(`借贷类型值: ${Array.from(debitCreditTypes).join(', ')}`)
    
  } catch (error) {
    console.error('分析失败:', error.message)
  }
}

analyzeTransactionSigns()
