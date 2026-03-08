import xlsx from 'xlsx'
import sequelize from './src/config/database.js'
import FlowFile from './src/models/FlowFile.js'

async function checkDataContent() {
  try {
    await sequelize.authenticate()
    console.log('数据库连接成功')
    
    const flowFile = await FlowFile.findByPk(17)
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
      
      console.log('\n前10行数据:')
      data.slice(0, 10).forEach((row, index) => {
        console.log(`\n第${index + 1}行:`)
        console.log('  用户ID:', row['用户ID'])
        console.log('  用户侧账号名称:', row['用户侧账号名称'])
        console.log('  用户银行卡号:', row['用户银行卡号'])
        console.log('  交易金额(分):', row['交易金额(分)'])
        console.log('  交易金额(元):', row['交易金额(元)'])
        console.log('  借贷类型:', row['借贷类型'])
        console.log('  交易时间:', row['交易时间'])
        console.log('  对手侧账户名称:', row['对手侧账户名称'])
        console.log('  对手方ID:', row['对手方ID'])
        console.log('  对手方银行:', row['对手方银行'])
        console.log('  对手方账号:', row['对手方账号'])
        console.log('  备注1:', row['备注1'])
        console.log('  备注2:', row['备注2'])
      })
      
      console.log('\n查找包含关键词的数据:')
      
      let vehicleCount = 0
      let phoneCount = 0
      let luxuryCount = 0
      
      data.forEach((row, index) => {
        const remark1 = row['备注1'] || ''
        const remark2 = row['备注2'] || ''
        const counterparty = row['对手侧账户名称'] || ''
        
        const text = (counterparty + ' ' + remark1 + ' ' + remark2).toLowerCase()
        
        const patterns = [
          /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{5,6}/i,
          /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z]{3}[A-Z0-9]{3}/i
        ]
        
        for (const pattern of patterns) {
          if (text.match(pattern)) {
            vehicleCount++
            if (vehicleCount <= 5) {
              console.log(`\n车辆信息第${vehicleCount}个 (第${index + 1}行):`)
              console.log('  对手方:', counterparty)
              console.log('  备注1:', remark1)
              console.log('  备注2:', remark2)
            }
            break
          }
        }
        
        if (remark1.includes('充值') || remark1.includes('话费') || remark2.includes('充值') || remark2.includes('话费')) {
          const phoneMatch = (remark1 + ' ' + remark2).match(/1[3-9]\d{9}/)
          if (phoneMatch) {
            phoneCount++
            if (phoneCount <= 5) {
              console.log(`\n手机号第${phoneCount}个 (第${index + 1}行):`)
              console.log('  手机号:', phoneMatch[0])
              console.log('  备注1:', remark1)
              console.log('  备注2:', remark2)
            }
          }
        }
        
        const luxuryKeywords = ['路易威登', '爱马仕', '香奈儿', '古驰', '迪奥', '普拉达', '芬迪', '圣罗兰', '葆蝶家', '巴黎世家', '罗意威', '纪梵希', '范思哲', '阿玛尼', '华伦天奴', '杜嘉班纳', '博柏利', '蔻驰', '盟可睐', '卡地亚', '劳力士', '欧米茄', '宝格丽', '蒂芙尼', '梵克雅宝', '百达翡丽', '江诗丹顿', '爱彼', '伯爵', '积家', '万国', '萧邦', '酩悦香槟', '轩尼诗', '马爹利', '拉菲', '娇兰', 'SK-II', 'CPB', '万宝龙', '会员', 'VIP', '汇图会员', '昵图会员', '乙方宝会员', '天眼查VIP', '高尔夫', '游艇', '私人飞机', '会所', '俱乐部', '钻石', '珠宝', '黄金', '铂金']
        for (const keyword of luxuryKeywords) {
          if (text.includes(keyword.toLowerCase())) {
            luxuryCount++
            if (luxuryCount <= 5) {
              console.log(`\n奢侈品第${luxuryCount}个 (第${index + 1}行):`)
              console.log('  对手方:', counterparty)
              console.log('  备注1:', remark1)
              console.log('  备注2:', remark2)
            }
            break
          }
        }
      })
      
      console.log(`\n统计结果:`)
      console.log(`车辆信息数量: ${vehicleCount}`)
      console.log(`手机号数量: ${phoneCount}`)
      console.log(`奢侈品数量: ${luxuryCount}`)
    }
    
  } catch (error) {
    console.error('测试失败:', error)
  } finally {
    await sequelize.close()
  }
}

checkDataContent()