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
    
    const vehicleKeywords = ['车', '车牌', '车牌号', 'WYN', '云A', '云D', '云E', '云F', '云G', '云H', '云J', '云K', '云L', '云M', '云N', '云P', '云Q', '云R', '云S', '云T', '云U', '云V', '云W', '云X', '云Y', '云Z']
    const luxuryKeywords = ['奢侈', '会员', '高尔夫', '游艇', '私人飞机', '会所', '俱乐部', '钻石', '珠宝', '黄金', '铂金', '蒂芙尼', '卡地亚', '宝格丽', '梵克雅宝', '爱马仕', '路易威登', '香奈儿', '古驰', '普拉达', '迪奥', '范思哲', '阿玛尼', '巴宝莉', '芬迪', '宝缇嘉', '巴黎世家', '纪梵希', '圣罗兰', '华伦天奴', '汤姆·布朗', '麦昆', '亚历山大·王', '纪梵希', '华伦天奴', '汤姆·布朗', '麦昆', '亚历山大·王', '积家', '万国', '萧邦', '酩悦香槟', '轩尼诗', '马爹利', '拉菲', '娇兰', 'SK-II', 'CPB', '万宝龙']
    
    console.log(`\n搜索包含车辆相关的记录:`)
    data.forEach((row, index) => {
      const text = JSON.stringify(row).toLowerCase()
      const hasVehicle = vehicleKeywords.some(keyword => text.includes(keyword.toLowerCase()))
      if (hasVehicle) {
        console.log(`\n第${index + 1}行:`, row)
      }
    })
    
    console.log(`\n\n搜索包含奢侈品相关的记录:`)
    data.forEach((row, index) => {
      const text = JSON.stringify(row).toLowerCase()
      const hasLuxury = luxuryKeywords.some(keyword => text.includes(keyword.toLowerCase()))
      if (hasLuxury) {
        console.log(`\n第${index + 1}行:`, row)
      }
    })
    
    break
  }
}