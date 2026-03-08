import xlsx from 'xlsx'
import sequelize from './src/config/database.js'
import FlowFile from './src/models/FlowFile.js'

async function testExtraction() {
  try {
    await sequelize.authenticate()
    console.log('数据库连接成功')
    
    const flowFile = await FlowFile.findByPk(16)
    if (!flowFile) {
      console.log('文件不存在')
      return
    }
    
    const filePath = flowFile.file_path
    console.log('文件路径:', filePath)
    
    const workbook = xlsx.readFile(filePath)
    console.log('工作表数量:', workbook.SheetNames.length)
    console.log('工作表名称:', workbook.SheetNames)
    
    for (const sheetName of workbook.SheetNames) {
      console.log(`\n==================== 工作表: ${sheetName} ====================`)
      const worksheet = workbook.Sheets[sheetName]
      const data = xlsx.utils.sheet_to_json(worksheet)
      
      console.log('数据行数:', data.length)
      
      if (data.length === 0) {
        console.log('无数据')
        continue
      }
      
      const firstRowKeys = Object.keys(data[0])
      console.log('列名:', firstRowKeys)
      
      console.log('\n前5行数据:')
      data.slice(0, 5).forEach((row, index) => {
        console.log(`第${index + 1}行:`, JSON.stringify(row, null, 2))
      })
      
      let extractedCount = 0
      let counterpartyCount = 0
      let amountCount = 0
      let phoneCount = 0
      let vehicleCount = 0
      let luxuryCount = 0
      
      data.forEach((row, index) => {
        const keys = Object.keys(row)
        
        let amount = 0
        for (const key of keys) {
          if (key.includes('交易金额(分)')) {
            const value = parseFloat(row[key])
            if (!isNaN(value)) {
              amount = value / 100
              break
            }
          }
        }
        
        if (amount === 0) {
          for (const key of keys) {
            if (key.includes('交易金额(元)') || key.includes('金额')) {
              const value = parseFloat(row[key])
              if (!isNaN(value)) {
                amount = value
                break
              }
            }
          }
        }
        
        if (amount !== 0) amountCount++
        
        for (const key of keys) {
          if (key.includes('对手侧账户名称') || key.includes('对手') && key.includes('名称')) {
            if (row[key]) counterpartyCount++
            break
          }
        }
        
        for (const key of keys) {
          if (key.includes('备注1') || key.includes('备注2') || key.includes('备注')) {
            const value = row[key] || ''
            if (value.includes('充值') || value.includes('话费')) {
              const phoneMatch = value.match(/1[3-9]\d{9}/)
              if (phoneMatch) phoneCount++
            }
            break
          }
        }
        
        const text = JSON.stringify(row).toLowerCase()
        const patterns = [
          /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{5,6}/i,
          /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z]{3}[A-Z0-9]{3}/i
        ]
        
        for (const pattern of patterns) {
          if (text.match(pattern)) {
            vehicleCount++
            break
          }
        }
        
        const luxuryKeywords = ['路易威登', '爱马仕', '香奈儿', '古驰', '迪奥', '普拉达', '芬迪', '圣罗兰', '葆蝶家', '巴黎世家', '罗意威', '纪梵希', '范思哲', '阿玛尼', '华伦天奴', '杜嘉班纳', '博柏利', '蔻驰', '盟可睐', '卡地亚', '劳力士', '欧米茄', '宝格丽', '蒂芙尼', '梵克雅宝', '百达翡丽', '江诗丹顿', '爱彼', '伯爵', '积家', '万国', '萧邦', '酩悦香槟', '轩尼诗', '马爹利', '拉菲', '娇兰', 'SK-II', 'CPB', '万宝龙', '会员', 'VIP', '汇图会员', '昵图会员', '乙方宝会员', '天眼查VIP', '高尔夫', '游艇', '私人飞机', '会所', '俱乐部', '钻石', '珠宝', '黄金', '铂金']
        for (const keyword of luxuryKeywords) {
          if (text.includes(keyword.toLowerCase())) {
            luxuryCount++
            break
          }
        }
        
        extractedCount++
      })
      
      console.log(`\n数据提取统计:`)
      console.log(`总行数: ${data.length}`)
      console.log(`已提取行数: ${extractedCount}`)
      console.log(`有金额的行数: ${amountCount}`)
      console.log(`有对手方的行数: ${counterpartyCount}`)
      console.log(`有手机号的行数: ${phoneCount}`)
      console.log(`有车牌的行数: ${vehicleCount}`)
      console.log(`有奢侈品的行数: ${luxuryCount}`)
    }
    
  } catch (error) {
    console.error('测试失败:', error)
  } finally {
    await sequelize.close()
  }
}

testExtraction()