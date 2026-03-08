import xlsx from 'xlsx'
import fs from 'fs'
import mysql from 'mysql2/promise'

async function debugExcelFile() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '9s7K!8p2Q@7m9Z#5',
      database: 'jizhi_db'
    })

    const [rows] = await connection.execute('SELECT * FROM flow_files WHERE id = ?', [20])
    
    if (rows.length === 0) {
      console.log('文件不存在')
      await connection.end()
      return
    }

    const flowFile = rows[0]
    const filePath = flowFile.file_path
    console.log('文件路径:', filePath)
    console.log('文件名:', flowFile.file_name)

    if (!fs.existsSync(filePath)) {
      console.log('文件不存在于文件系统')
      await connection.end()
      return
    }

    const workbook = xlsx.readFile(filePath)
    console.log('\n工作表数量:', workbook.SheetNames.length)
    console.log('工作表名称:', workbook.SheetNames)

    for (const sheetName of workbook.SheetNames) {
      console.log(`\n${'='.repeat(80)}`)
      console.log(`工作表: ${sheetName}`)
      console.log(`${'='.repeat(80)}`)

      const worksheet = workbook.Sheets[sheetName]
      const data = xlsx.utils.sheet_to_json(worksheet)

      console.log(`数据行数: ${data.length}`)

      if (data.length > 0) {
        console.log(`\n第一行数据:`)
        console.log(data[0])

        console.log(`\n所有列名:`)
        const keys = Object.keys(data[0])
        keys.forEach((key, index) => {
          console.log(`  ${index + 1}. ${key}: ${data[0][key]}`)
        })

        console.log(`\n前5行数据:`)
        data.slice(0, 5).forEach((row, index) => {
          console.log(`\n第${index + 1}行:`)
          keys.forEach(key => {
            console.log(`  ${key}: ${row[key]}`)
          })
        })

        console.log(`\n检查关键字段:`)
        console.log(`  包含'用户ID': ${keys.some(k => k.includes('用户ID'))}`)
        console.log(`  包含'交易时间': ${keys.some(k => k.includes('交易时间'))}`)
        console.log(`  包含'交易金额': ${keys.some(k => k.includes('交易金额'))}`)
        console.log(`  包含'金额': ${keys.some(k => k.includes('金额'))}`)
        console.log(`  包含'对手': ${keys.some(k => k.includes('对手'))}`)
        console.log(`  包含'备注': ${keys.some(k => k.includes('备注'))}`)
        console.log(`  包含'用户银行卡号': ${keys.some(k => k.includes('用户银行卡号'))}`)
        console.log(`  包含'用户侧账号名称': ${keys.some(k => k.includes('用户侧账号名称'))}`)
      }
    }

    await connection.end()
  } catch (error) {
    console.error('调试失败:', error)
  }
}

debugExcelFile()