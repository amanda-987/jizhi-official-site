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

function getTime(row) {
  const keys = Object.keys(row)
  for (const key of keys) {
    if (key.includes('交易时间') || key.includes('时间') || key.includes('日期') || 
        key.includes('Time') || key.includes('Date') || key.includes('time') || key.includes('date')) {
      let timeValue = row[key]
      
      if (!timeValue) return ''
      
      if (typeof timeValue === 'string') {
        return timeValue
      }
      
      if (timeValue instanceof Date) {
        const year = timeValue.getFullYear()
        const month = String(timeValue.getMonth() + 1).padStart(2, '0')
        const day = String(timeValue.getDate()).padStart(2, '0')
        const hours = String(timeValue.getHours()).padStart(2, '0')
        const minutes = String(timeValue.getMinutes()).padStart(2, '0')
        const seconds = String(timeValue.getSeconds()).padStart(2, '0')
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
      }
      
      if (typeof timeValue === 'number') {
        if (timeValue > 25569 && timeValue < 60000) {
          const excelDate = new Date((timeValue - 25569) * 86400 * 1000)
          const year = excelDate.getFullYear()
          const month = String(excelDate.getMonth() + 1).padStart(2, '0')
          const day = String(excelDate.getDate()).padStart(2, '0')
          const hours = String(excelDate.getHours()).padStart(2, '0')
          const minutes = String(excelDate.getMinutes()).padStart(2, '0')
          const seconds = String(excelDate.getSeconds()).padStart(2, '0')
          return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
        } else {
          const date = new Date(timeValue)
          if (!isNaN(date.getTime())) {
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            const hours = String(date.getHours()).padStart(2, '0')
            const minutes = String(date.getMinutes()).padStart(2, '0')
            const seconds = String(date.getSeconds()).padStart(2, '0')
            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
          }
        }
      }
      
      return String(timeValue)
    }
  }
  return ''
}

function getAmount(row) {
  const keys = Object.keys(row)
  for (const key of keys) {
    if (key.includes('交易金额(分)') || key.includes('交易金额(元)') || key.includes('金额') || key.includes('Amount') || key.includes('amount')) {
      const value = parseFloat(row[key])
      if (!isNaN(value)) return value
    }
  }
  return 0
}

function getCounterparty(row) {
  const keys = Object.keys(row)
  for (const key of keys) {
    if (key.includes('对手侧账户名称') || key.includes('对手') || key.includes('对方') || key.includes('Counterparty') || key.includes('counterparty')) {
      return row[key] || ''
    }
  }
  return ''
}

function getRemark(row) {
  const keys = Object.keys(row)
  for (const key of keys) {
    if (key.includes('备注1') || key.includes('备注2') || key.includes('备注') || key.includes('Remark') || key.includes('remark') || key.includes('说明')) {
      const value = row[key] || ''
      if (value) return value
    }
  }
  return ''
}

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
  console.log('检查包含"酒店"或"宾馆"的交易记录:\n')

  let hotelCount = 0
  let totalHotelAmount = 0

  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const amount = getAmount(row)
    const counterparty = getCounterparty(row)
    const remark = getRemark(row)
    const time = getTime(row)
    
    const text = (counterparty + ' ' + remark).toLowerCase()
    
    if (text.includes('酒店') || text.includes('宾馆')) {
      hotelCount++
      totalHotelAmount += amount
      console.log(`第${i + 1}行:`)
      console.log(`  时间: ${time}`)
      console.log(`  金额: ${amount}`)
      console.log(`  对手方: ${counterparty}`)
      console.log(`  备注: ${remark}`)
      console.log(`  匹配文本: ${text}`)
      console.log()
    }
  }

  console.log(`总计: ${hotelCount}条记录，总金额: ${totalHotelAmount}`)
}
