import express from 'express'
import xlsx from 'xlsx'
import fs from 'fs'
import path from 'path'
import FlowAnalysis from '../models/FlowAnalysis.js'
import FlowFile from '../models/FlowFile.js'

const router = express.Router()

router.post('/analyze/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params

    const flowFile = await FlowFile.findByPk(fileId)
    if (!flowFile) {
      return res.status(404).json({
        code: 404,
        message: '文件不存在',
        data: null
      })
    }

    await flowFile.update({ status: 'processing' })

    const filePath = flowFile.file_path
    if (!fs.existsSync(filePath)) {
      await flowFile.update({ status: 'failed', error_message: '文件不存在' })
      return res.status(404).json({
        code: 404,
        message: '文件不存在',
        data: null
      })
    }

    const workbook = xlsx.readFile(filePath)
    let allAnalysisResults = []
    let analyzedSheets = 0
    let bankCardMap = new Map()

    console.log(`开始分析文件: ${flowFile.file_name}`)
    console.log(`工作表总数: ${workbook.SheetNames.length}`)
    console.log(`工作表列表: ${workbook.SheetNames.join(', ')}`)

    for (const sheetName of workbook.SheetNames) {
      console.log(`\n========== 处理工作表: ${sheetName} ==========`)
      
      const worksheet = workbook.Sheets[sheetName]
      const data = xlsx.utils.sheet_to_json(worksheet, { defval: '', raw: false })

      console.log(`工作表 ${sheetName} 数据行数: ${data.length}`)

      if (data.length === 0) {
        console.log(`跳过工作表: ${sheetName} (没有数据)`)
        continue
      }

      const firstRowKeys = Object.keys(data[0])
      console.log(`工作表 ${sheetName} 的列名:`, firstRowKeys)

      const isValidTransactionSheet = firstRowKeys.some(key => 
        key.includes('用户ID') || key.includes('交易时间') || key.includes('交易金额') ||
        key.includes('金额') || key.includes('时间') || key.includes('对手') ||
        key.includes('借贷') || key.includes('摘要') || key.includes('收支') ||
        key.includes('交易类型') || key.includes('交易日期') || key.includes('发生额') ||
        key.includes('对方户名') || key.includes('对方账号') || key.includes('交易摘要') ||
        key.includes('用户银行卡号')
      )

      const isAccountBindingSheet = firstRowKeys.some(key => 
        key.includes('银行账号') && key.includes('开户行')
      ) || firstRowKeys.some(key => key.includes('开户行信息'))

      if (isAccountBindingSheet) {
        console.log(`发现账户绑定信息表: ${sheetName}`)
        data.forEach(row => {
          const bankAccount = row['银行账号']
          const bankName = row['开户行信息']
          if (bankAccount && bankName) {
            bankCardMap.set(bankAccount, bankName)
          }
        })
        console.log(`已加载 ${bankCardMap.size} 张银行卡信息`)
        continue
      }

      if (!isValidTransactionSheet) {
        console.log(`跳过工作表: ${sheetName} (不是交易明细表)`)
        continue
      }

      console.log(`开始分析工作表: ${sheetName}`)
      try {
        const analysis = analyzeFlowData(data, bankCardMap)
        allAnalysisResults.push({
          user_identifier: sheetName,
          ...analysis
        })
        analyzedSheets++

        console.log(`工作表 ${sheetName} 分析完成:`)
        console.log(`  - 用户手机: ${analysis.userPhoneAnalysis.length} 个`)
        console.log(`  - 银行卡: ${analysis.userBankCardAnalysis.length} 张`)
        console.log(`  - 车辆: ${analysis.vehicleAnalysis.length} 辆`)
        console.log(`  - 高频对手: ${analysis.highFrequencyCounterparties.length} 个`)
        console.log(`  - 限制消费: ${Object.keys(analysis.restrictedConsumption).length} 类`)

        await FlowAnalysis.create({
          flow_file_id: fileId,
          user_identifier: sheetName,
          user_phone_analysis: analysis.userPhoneAnalysis,
          user_bank_card_analysis: analysis.userBankCardAnalysis,
          vehicle_analysis: analysis.vehicleAnalysis,
          high_frequency_counterparties: analysis.highFrequencyCounterparties,
          restricted_consumption: analysis.restrictedConsumption,
          large_transactions: analysis.largeTransactions,
          top_merchants: analysis.topMerchants,
          summary: analysis.summary
        })
        console.log(`工作表 ${sheetName} 分析结果已保存`)
      } catch (error) {
        console.error(`工作表 ${sheetName} 分析失败:`, error)
        continue
      }
    }

    if (analyzedSheets === 0) {
      console.log('没有找到有效的交易明细表')
      await flowFile.update({ status: 'failed', error_message: '文件中没有找到有效的交易明细表' })
      return res.status(400).json({
        code: 400,
        message: '文件中没有找到有效的交易明细表，请上传包含交易明细的Excel文件',
        data: null
      })
    }

    await flowFile.update({ status: 'completed' })

    res.json({
      code: 200,
      message: '分析完成',
      data: allAnalysisResults
    })
  } catch (error) {
    console.error('流水分析失败:', error)
    await FlowFile.update(
      { status: 'failed', error_message: error.message },
      { where: { id: req.params.fileId } }
    )

    res.status(500).json({
      code: 500,
      message: error.message || '分析失败',
      data: null
    })
  }
})

router.get('/:fileId', async (req, res) => {
  try {
    const { fileId } = req.params
    
    const analyses = await FlowAnalysis.findAll({
      where: { flow_file_id: fileId },
      attributes: ['id', 'flow_file_id', 'user_identifier', 'user_phone_analysis', 'user_bank_card_analysis', 'vehicle_analysis', 'high_frequency_counterparties', 'restricted_consumption', 'large_transactions', 'top_merchants', 'summary', 'created_at', 'updated_at'],
      raw: true
    })

    if (!analyses || analyses.length === 0) {
      return res.json({
        code: 200,
        message: '暂无分析结果',
        data: []
      })
    }

    analyses.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // 递归转换函数，确保所有数据都可以序列化
    const convertToSerializable = (obj) => {
      if (obj === null || typeof obj !== 'object') {
        return obj
      }
      if (Array.isArray(obj)) {
        return obj.map(item => convertToSerializable(item))
      }
      const result = {}
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          result[key] = convertToSerializable(obj[key])
        }
      }
      return result
    }

    const parsedAnalyses = analyses.map(analysis => {
      const parseJSON = (value, defaultValue) => {
        if (!value) return defaultValue
        if (typeof value === 'string') {
          try {
            return JSON.parse(value)
          } catch (e) {
            console.error('JSON解析失败:', e)
            return defaultValue
          }
        }
        return value
      }

      const parsedAnalysis = {
        ...analysis,
        user_phone_analysis: parseJSON(analysis.user_phone_analysis, []),
        user_bank_card_analysis: parseJSON(analysis.user_bank_card_analysis, []),
        vehicle_analysis: parseJSON(analysis.vehicle_analysis, []),
        high_frequency_counterparties: parseJSON(analysis.high_frequency_counterparties, []),
        restricted_consumption: parseJSON(analysis.restricted_consumption, {}),
        large_transactions: parseJSON(analysis.large_transactions, []),
        top_merchants: parseJSON(analysis.top_merchants, []),
        summary: parseJSON(analysis.summary, {})
      }

      // 确保所有数据都可以序列化
      return convertToSerializable(parsedAnalysis)
    })

    res.json({
      code: 200,
      message: '获取成功',
      data: parsedAnalyses
    })
  } catch (error) {
    console.error('获取分析结果失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取失败',
      data: null
    })
  }
})

function analyzeFlowData(data, bankCardMap = new Map()) {
  console.log('开始分析数据，数据行数:', data.length)
  console.log('第一行数据:', data[0])

  const vehicleMap = new Map()
  const counterpartyMap = new Map()
  const restrictedConsumption = {
    flights: [],
    hotels: [],
    restaurants: [],
    entertainment: [],
    travel: [],
    insurance: [],
    luxury: [],
    realEstate: []
  }

  const isPersonalMerchant = (counterparty) => {
    if (!counterparty) return false
    
    const personalKeywords = [
      '个人', '个体', '小店', '摊位', '小卖部', '便利店',
      '超市', '商店', '店铺', '门市', '门店',
      '工作室', '工作室', '工作室'
    ]
    
    const counterpartyLower = counterparty.toLowerCase()
    
    if (counterpartyLower.length <= 4) return true
    
    return personalKeywords.some(keyword => counterpartyLower.includes(keyword))
  }
  const largeTransactions = []
  const merchantMap = new Map()

  const luxuryKeywords = [
    '路易威登', '爱马仕', '香奈儿', '古驰', '迪奥', '普拉达', '芬迪', '圣罗兰',
    '葆蝶家', '巴黎世家', '罗意威', '纪梵希', '范思哲', '阿玛尼', '华伦天奴',
    '杜嘉班纳', '博柏利', '蔻驰', '盟可睐', '卡地亚', '劳力士', '欧米茄',
    '宝格丽', '蒂芙尼', '梵克雅宝', '百达翡丽', '江诗丹顿', '爱彼', '伯爵',
    '积家', '万国', '萧邦', '酩悦香槟', '轩尼诗', '马爹利', '拉菲', '娇兰',
    'SK-II', 'CPB', '万宝龙', '钻石', '珠宝', '黄金', '铂金'
  ]

  const luxuryBrands = [
    '路易威登', '爱马仕', '香奈儿', '古驰', '迪奥', '普拉达', '芬迪', '圣罗兰',
    '葆蝶家', '巴黎世家', '罗意威', '纪梵希', '范思哲', '阿玛尼', '华伦天奴',
    '杜嘉班纳', '博柏利', '蔻驰', '盟可睐', '卡地亚', '劳力士', '欧米茄',
    '宝格丽', '蒂芙尼', '梵克雅宝', '百达翡丽', '江诗丹顿', '爱彼', '伯爵',
    '积家', '万国', '萧邦', '酩悦香槟', '轩尼诗', '马爹利', '拉菲', '娇兰',
    'SK-II', 'CPB', '万宝龙'
  ]

  const isLuxuryBrand = (text) => {
    return luxuryBrands.some(brand => text.includes(brand))
  }

  const userPhoneMap = new Map()
  const userBankCardMap = new Map()

  console.log(`开始分析数据，数据行数: ${data.length}`)

  data.forEach((row, index) => {
    const keys = Object.keys(row)
    
    const amount = getAmount(row)
    const counterparty = getCounterparty(row)
    const counterpartyId = getCounterpartyId(row)
    const counterpartyBank = getCounterpartyBank(row)
    const counterpartyAccount = getCounterpartyAccount(row)
    const remark = getRemark(row)
    const time = getTime(row)
    const location = getLocation(row)
    const userName = getUserName(row)
    const userId = getUserId(row)

    if (index === 0) {
      console.log(`第一行数据列名:`, keys)
      console.log(`第一行数据解析结果:`, { amount, counterparty, counterpartyId, counterpartyBank, counterpartyAccount, remark, time, location, userName, userId })
    }

    if (Math.abs(amount) >= 5000) {
      largeTransactions.push({
        time,
        amount,
        counterparty,
        counterpartyId,
        counterpartyBank,
        counterpartyAccount,
        bank: getBank(row, bankCardMap),
        account: getAccount(row)
      })
    }

    if (counterparty) {
      if (!counterpartyMap.has(counterparty)) {
        counterpartyMap.set(counterparty, {
          name: counterparty,
          id: counterpartyId,
          bank: counterpartyBank,
          account: counterpartyAccount,
          count: 0,
          totalAmount: 0,
          inAmount: 0,
          outAmount: 0
        })
      }
      const cp = counterpartyMap.get(counterparty)
      cp.count++
      cp.totalAmount += amount
      if (amount > 0) cp.inAmount += amount
      else cp.outAmount += Math.abs(amount)
      
      if (!cp.id && counterpartyId) cp.id = counterpartyId
      if (!cp.bank && counterpartyBank) cp.bank = counterpartyBank
      if (!cp.account && counterpartyAccount) cp.account = counterpartyAccount
    }

    if (location || counterparty) {
      const merchant = location || counterparty
      
      const excludedKeywords = ['中国银联股份有限公司', '财付通支付科技有限公司', '网联清算有限公司', '银联', '财付通', '网联']
      const isExcluded = excludedKeywords.some(keyword => merchant.includes(keyword))
      
      const isIndividual = /^[\u4e00-\u9fa5]{2,4}$/.test(merchant)
      
      if (!isExcluded && !isIndividual) {
        if (!merchantMap.has(merchant)) {
          merchantMap.set(merchant, {
            name: merchant,
            count: 0,
            totalAmount: 0
          })
        }
        const m = merchantMap.get(merchant)
        m.count++
        m.totalAmount += amount
      }
    }

    const text = (counterparty + ' ' + remark + ' ' + location).toLowerCase()

    if (text.includes('充值') || text.includes('话费') || text.includes('流量')) {
      const phone = extractPhone(remark)
      if (phone) {
        if (!userPhoneMap.has(phone)) {
          userPhoneMap.set(phone, {
            phone,
            userName,
            userId,
            amount: 0,
            count: 0,
            operator: extractOperator(remark),
            rechargeRecords: []
          })
        }
        const phoneData = userPhoneMap.get(phone)
        phoneData.amount += amount
        phoneData.count++
        phoneData.rechargeRecords.push({
          time,
          amount,
          remark
        })
      }
    }

    const bank = getBank(row, bankCardMap)
    const account = getAccount(row)
    
    if (bank && account) {
      const bankCardKey = `${bank}_${account}`
      if (!userBankCardMap.has(bankCardKey)) {
        userBankCardMap.set(bankCardKey, {
          bank,
          account,
          userName,
          userId,
          transactionCount: 0,
          totalAmount: 0,
          inAmount: 0,
          outAmount: 0,
          firstTransactionTime: time,
          lastTransactionTime: time
        })
      }
      const bankCardData = userBankCardMap.get(bankCardKey)
      bankCardData.transactionCount++
      bankCardData.totalAmount += amount
      if (amount > 0) {
        bankCardData.inAmount += amount
      } else {
        bankCardData.outAmount += Math.abs(amount)
      }
      if (time < bankCardData.firstTransactionTime) {
        bankCardData.firstTransactionTime = time
      }
      if (time > bankCardData.lastTransactionTime) {
        bankCardData.lastTransactionTime = time
      }
    }

    const plateNumber = extractPlateNumber(counterparty + ' ' + remark + ' ' + location)
    if (plateNumber || text.includes('车牌')) {
      const vehiclePlate = plateNumber || '无车牌'
      if (!vehicleMap.has(vehiclePlate)) {
        vehicleMap.set(vehiclePlate, {
          plateNumber: vehiclePlate,
          count: 0,
          locations: new Set()
        })
      }
      const vehicleData = vehicleMap.get(vehiclePlate)
      vehicleData.count++
      if (location || counterparty) {
        vehicleData.locations.add(location || counterparty)
      }
    }
    
    if (text.includes('机票') || text.includes('高铁') || text.includes('航空')) {
      restrictedConsumption.flights.push({ time, amount, counterparty, location: counterparty })
    }
    
    if (isHotelConsumption(counterparty, remark)) {
      const hotelName = extractHotelName(counterparty, remark)
      restrictedConsumption.hotels.push({ time, amount, location: hotelName || counterparty })
    }
    
    // 餐饮消费
    if (text.includes('餐饮') || text.includes('饭店') || text.includes('餐厅') || 
        text.includes('火锅') || text.includes('烧烤') || text.includes('美食')) {
      restrictedConsumption.restaurants.push({ time, amount, counterparty, location: counterparty })
    }
    
    if (text.includes('ktv') || text.includes('酒吧') || text.includes('娱乐')) {
      const venueName = extractEntertainmentVenue(counterparty, remark)
      if (venueName) {
        restrictedConsumption.entertainment.push({ time, amount, counterparty, location: venueName })
      }
    }
    
    if (text.includes('旅行社') || text.includes('携程') || text.includes('去哪儿')) {
      restrictedConsumption.travel.push({ time, amount, counterparty, location: counterparty })
    }
    
    if (text.includes('保险') || text.includes('证券') || text.includes('基金')) {
      restrictedConsumption.insurance.push({ time, amount, counterparty, location: counterparty })
    }

    // 房地产/装修
    if (text.includes('房地产') || text.includes('装修') || text.includes('建材') || 
        text.includes('家居') || text.includes('房产') || text.includes('物业')) {
      restrictedConsumption.realEstate.push({ time, amount, counterparty, location: counterparty })
    }

    const counterpartyText = (counterparty || '').toLowerCase()
    const remarkText = (remark || '').toLowerCase()
    
    if (isLuxuryBrand(counterpartyText) || isLuxuryBrand(remarkText)) {
      if (!isPersonalMerchant(counterparty)) {
        restrictedConsumption.luxury.push({ time, amount, counterparty, remark })
      }
    }
  })

  const highFrequencyCounterparties = Array.from(counterpartyMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 15)

  const topMerchants = Array.from(merchantMap.values())
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)

  const userPhoneAnalysis = Array.from(userPhoneMap.values())
    .sort((a, b) => b.amount - a.amount)

  const userBankCardAnalysis = Array.from(userBankCardMap.values())
    .sort((a, b) => b.transactionCount - a.transactionCount)

  const vehicleAnalysis = Array.from(vehicleMap.values())
    .map(v => ({
      plateNumber: v.plateNumber,
      count: v.count,
      locations: Array.from(v.locations)
    }))
    .sort((a, b) => b.count - a.count)

  let inTransactionCount = 0
  let inTransactionAmount = 0
  let outTransactionCount = 0
  let outTransactionAmount = 0

  data.forEach(row => {
    const amount = getAmount(row)
    if (amount > 0) {
      inTransactionCount++
      inTransactionAmount += amount
    } else if (amount < 0) {
      outTransactionCount++
      outTransactionAmount += Math.abs(amount)
    }
  })

  const summary = {
    totalTransactions: data.length,
    totalAmount: data.reduce((sum, row) => sum + Math.abs(getAmount(row)), 0),
    inTransactionCount,
    inTransactionAmount,
    outTransactionCount,
    outTransactionAmount,
    rechargeCount: userPhoneAnalysis.reduce((sum, item) => sum + item.count, 0),
    vehicleCount: vehicleAnalysis.length,
    largeTransactionCount: largeTransactions.length
  }

  console.log('分析完成，汇总:', summary)

  const restrictedConsumptionSummary = {
    flights: {
      count: restrictedConsumption.flights.length,
      totalAmount: restrictedConsumption.flights.reduce((sum, item) => sum + Math.abs(item.amount), 0)
    },
    hotels: {
      count: restrictedConsumption.hotels.length,
      totalAmount: restrictedConsumption.hotels.reduce((sum, item) => sum + Math.abs(item.amount), 0)
    },
    entertainment: {
      count: restrictedConsumption.entertainment.length,
      totalAmount: restrictedConsumption.entertainment.reduce((sum, item) => sum + Math.abs(item.amount), 0)
    },
    travel: {
      count: restrictedConsumption.travel.length,
      totalAmount: restrictedConsumption.travel.reduce((sum, item) => sum + Math.abs(item.amount), 0)
    },
    insurance: {
      count: restrictedConsumption.insurance.length,
      totalAmount: restrictedConsumption.insurance.reduce((sum, item) => sum + Math.abs(item.amount), 0)
    },
    luxury: {
      count: restrictedConsumption.luxury.length,
      totalAmount: restrictedConsumption.luxury.reduce((sum, item) => sum + Math.abs(item.amount), 0)
    },
    realEstate: {
      count: restrictedConsumption.realEstate.length,
      totalAmount: restrictedConsumption.realEstate.reduce((sum, item) => sum + Math.abs(item.amount), 0)
    },
    restaurants: {
      count: restrictedConsumption.restaurants.length,
      totalAmount: restrictedConsumption.restaurants.reduce((sum, item) => sum + Math.abs(item.amount), 0)
    }
  }

  return {
    userPhoneAnalysis,
    userBankCardAnalysis,
    vehicleAnalysis,
    highFrequencyCounterparties,
    restrictedConsumption,
    restrictedConsumptionSummary,
    largeTransactions,
    topMerchants,
    summary
  }
}

function getAmount(row) {
  const keys = Object.keys(row)
  let amount = 0
  
  const parseAmount = (val) => {
    if (typeof val === 'number') return val
    if (typeof val === 'string') {
      const cleaned = val.replace(/,/g, '').replace(/，/g, '').trim()
      const num = parseFloat(cleaned)
      return isNaN(num) ? 0 : num
    }
    return 0
  }
  
  for (const key of keys) {
    if (key.includes('交易金额(分)')) {
      const value = parseAmount(row[key])
      if (value !== 0) {
        amount = value / 100
        break
      }
    }
  }
  
  if (amount === 0) {
    for (const key of keys) {
      if (key.includes('交易金额(元)') || key.includes('金额') || key.includes('Amount') || key.includes('amount') || key.includes('发生额')) {
        const value = parseAmount(row[key])
        if (value !== 0) {
          amount = value
          break
        }
      }
    }
  }
  
  if (amount === 0) return 0
  
  const debitCreditType = row['借贷类型'] || row['借贷'] || row['收支'] || row['收支类型'] || ''
  
  if (debitCreditType === '出' || debitCreditType === '支出' || debitCreditType === '借' || debitCreditType === '支') {
    return -Math.abs(amount)
  } else if (debitCreditType === '入' || debitCreditType === '收入' || debitCreditType === '贷' || debitCreditType === '收') {
    return Math.abs(amount)
  }
  
  return amount
}

function getCounterparty(row) {
  const keys = Object.keys(row)
  for (const key of keys) {
    if (key.includes('对手侧账户名称') || (key.includes('对手') && key.includes('名称')) || (key.includes('对方') && key.includes('名称')) || (key.includes('Counterparty') && key.includes('Name'))) {
      return row[key] || ''
    }
  }
  return ''
}

function getCounterpartyId(row) {
  const keys = Object.keys(row)
  for (const key of keys) {
    if (key.includes('对手方ID') || key.includes('对方ID') || (key.includes('对手') && key.includes('ID')) || (key.includes('Counterparty') && key.includes('ID'))) {
      return row[key] || ''
    }
  }
  return ''
}

function getCounterpartyBank(row) {
  const keys = Object.keys(row)
  for (const key of keys) {
    if (key.includes('对手方银行') || key.includes('对方银行') || (key.includes('对手') && key.includes('银行')) || (key.includes('Counterparty') && key.includes('Bank'))) {
      return row[key] || ''
    }
  }
  return ''
}

function getCounterpartyAccount(row) {
  const keys = Object.keys(row)
  for (const key of keys) {
    if (key.includes('对手方账号') || key.includes('对方账号') || (key.includes('对手') && key.includes('账号')) || (key.includes('Counterparty') && key.includes('Account'))) {
      return row[key] || ''
    }
  }
  return ''
}

function getRemark(row) {
  const keys = Object.keys(row)
  let remarks = []
  for (const key of keys) {
    if (key.includes('备注1') || key.includes('备注2') || key.includes('备注') || key.includes('Remark') || key.includes('remark') || key.includes('说明')) {
      const value = row[key]
      if (value) {
        remarks.push(value)
      }
    }
  }
  return remarks.join(' ')
}

function getTime(row) {
  const keys = Object.keys(row)
  for (const key of keys) {
    if (key.includes('交易时间') || key.includes('时间') || key.includes('日期') || key.includes('Time') || key.includes('Date') || key.includes('time') || key.includes('date')) {
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

function getLocation(row) {
  const keys = Object.keys(row)
  for (const key of keys) {
    if (key.includes('地点') || key.includes('Location') || key.includes('location') || key.includes('商户')) {
      return row[key] || ''
    }
  }
  return ''
}

function getBank(row, bankCardMap) {
  const keys = Object.keys(row)
  for (const key of keys) {
    if (key.includes('用户银行卡号')) {
      const bankAccount = row[key]
      if (bankAccount) {
        if (bankCardMap.has(bankAccount)) {
          return bankCardMap.get(bankAccount)
        }
        return '未知银行'
      }
      return ''
    }
  }
  return ''
}

function getAccount(row) {
  const keys = Object.keys(row)
  for (const key of keys) {
    if (key.includes('用户银行卡号')) {
      return row[key] || ''
    }
  }
  return ''
}

function getUserName(row) {
  const keys = Object.keys(row)
  for (const key of keys) {
    if (key.includes('用户侧账号名称') || (key.includes('用户') && key.includes('名称')) || key.includes('用户名') || key.includes('userName') || key.includes('username') || (key.includes('User') && key.includes('Name'))) {
      return row[key] || ''
    }
  }
  return ''
}

function getUserId(row) {
  const keys = Object.keys(row)
  for (const key of keys) {
    if (key.includes('用户ID') || (key.includes('用户') && key.includes('ID')) || key.includes('userId') || key.includes('userid') || (key.includes('User') && key.includes('ID'))) {
      return row[key] || ''
    }
  }
  return ''
}

function extractPhone(text) {
  const match = text.match(/1[3-9]\d{9}/)
  return match ? match[0] : ''
}

function extractOperator(text) {
  if (text.includes('移动')) return '移动'
  if (text.includes('联通')) return '联通'
  if (text.includes('电信')) return '电信'
  return '未知'
}

function extractPlateNumber(text) {
  const patterns = [
    /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{5,6}/i,
    /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z]{3}[A-Z0-9]{3}/i,
    /云[A-Z]{3}[0-9]{3}/i,
    /云[A-Z]{3}[0-9]{4}/i
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      return match[0].toUpperCase()
    }
  }
  
  return ''
}

function isHotelConsumption(counterparty, remark) {
  const text = (counterparty + ' ' + remark).toLowerCase()
  
  if (text.includes('停车场') || text.includes('停车缴费') || text.includes('停车费') || 
      text.includes('零钱通支付') || text.includes('零钱通支付退款') ||
      text.includes('微众代销') || text.includes('转账') || text.includes('退款')) {
    return false
  }
  
  return text.includes('酒店') || text.includes('宾馆') || text.includes('旅馆') || 
         text.includes('招待所') || text.includes('度假村') || text.includes('民宿') || 
         text.includes('旅店') || text.includes('hotel') || text.includes('inn') || 
         text.includes('motel') || text.includes('resort') || text.includes('lodge')
}

function extractHotelName(counterparty, remark) {
  const text = (counterparty + ' ' + remark)
  
  const hotelPatterns = [
    /([^(\s]*?(?:酒店|宾馆|旅馆|招待所|度假村|民宿|旅店))/,
    /([^(\s]*?(?:Hotel|Inn|Motel|Resort|Lodge))/i
  ]
  
  for (const pattern of hotelPatterns) {
    const match = text.match(pattern)
    if (match) {
      let hotelName = match[1].trim()
      
      hotelName = hotelName.replace(/\([^)]*\)/g, '')
      hotelName = hotelName.replace(/【[^】]*】/g, '')
      hotelName = hotelName.replace(/酒店订单ID[:：]\d+/g, '')
      hotelName = hotelName.replace(/订单ID[:：]\d+/g, '')
      hotelName = hotelName.replace(/\d+/g, '')
      hotelName = hotelName.replace(/有限公司|股份有限公司|集团|公司/g, '')
      hotelName = hotelName.replace(/停车场|停车缴费|停车费/g, '')
      hotelName = hotelName.replace(/零钱通支付|零钱通支付退款|微众代销/g, '')
      hotelName = hotelName.replace(/转账|退款/g, '')
      hotelName = hotelName.replace(/[()（）\[\]【】]/g, '')
      hotelName = hotelName.trim()
      
      if (hotelName.length > 0 && hotelName.length < 50) {
        return hotelName
      }
    }
  }
  
  if (counterparty && counterparty.length > 0) {
    let cleanCounterparty = counterparty.replace(/\([^)]*\)/g, '')
    cleanCounterparty = cleanCounterparty.replace(/有限公司|股份有限公司|集团|公司/g, '')
    cleanCounterparty = cleanCounterparty.replace(/[()（）\[\]【】]/g, '')
    cleanCounterparty = cleanCounterparty.trim()
    
    if (cleanCounterparty.length > 0 && cleanCounterparty.length < 50) {
      return cleanCounterparty
    }
  }
  
  return ''
}

function extractEntertainmentVenue(counterparty, remark) {
  const text = (counterparty + ' ' + remark)
  
  const ktvPatterns = [
    /([^(\s]*?(?:KTV|ktv|量贩|娱乐城|欢唱|歌厅|夜总会|俱乐部))/i,
    /([^(\s]*?(?:KTV|ktv))/i
  ]
  
  const barPatterns = [
    /([^(\s]*?(?:酒吧|Bar|bar|酒馆|酒廊|夜店|Pub|pub))/i
  ]
  
  const entertainmentPatterns = [
    /([^(\s]*?(?:KTV|ktv|量贩|娱乐城|欢唱|歌厅|夜总会|俱乐部|酒吧|Bar|bar|酒馆|酒廊|夜店|Pub|pub))/i
  ]
  
  for (const pattern of ktvPatterns) {
    const match = text.match(pattern)
    if (match) {
      let venueName = match[1].trim()
      
      venueName = venueName.replace(/\([^)]*\)/g, '')
      venueName = venueName.replace(/【[^】]*】/g, '')
      venueName = venueName.replace(/\d+/g, '')
      venueName = venueName.replace(/有限公司|股份有限公司|集团|公司/g, '')
      venueName = venueName.replace(/[()（）\[\]【】]/g, '')
      venueName = venueName.trim()
      
      if (venueName.length > 0 && venueName.length < 50) {
        return venueName + ' (KTV)'
      }
    }
  }
  
  for (const pattern of barPatterns) {
    const match = text.match(pattern)
    if (match) {
      let venueName = match[1].trim()
      
      venueName = venueName.replace(/\([^)]*\)/g, '')
      venueName = venueName.replace(/【[^】]*】/g, '')
      venueName = venueName.replace(/\d+/g, '')
      venueName = venueName.replace(/有限公司|股份有限公司|集团|公司/g, '')
      venueName = venueName.replace(/[()（）\[\]【】]/g, '')
      venueName = venueName.trim()
      
      if (venueName.length > 0 && venueName.length < 50) {
        return venueName + ' (酒吧)'
      }
    }
  }
  
  for (const pattern of entertainmentPatterns) {
    const match = text.match(pattern)
    if (match) {
      let venueName = match[1].trim()
      
      venueName = venueName.replace(/\([^)]*\)/g, '')
      venueName = venueName.replace(/【[^】]*】/g, '')
      venueName = venueName.replace(/\d+/g, '')
      venueName = venueName.replace(/有限公司|股份有限公司|集团|公司/g, '')
      venueName = venueName.replace(/[()（）\[\]【】]/g, '')
      venueName = venueName.trim()
      
      if (venueName.length > 0 && venueName.length < 50) {
        return venueName
      }
    }
  }
  
  if (counterparty && counterparty.length > 0) {
    const isIndividual = /^[\u4e00-\u9fa5]{2,4}$/.test(counterparty)
    if (!isIndividual) {
      let cleanCounterparty = counterparty.replace(/\([^)]*\)/g, '')
      cleanCounterparty = cleanCounterparty.replace(/有限公司|股份有限公司|集团|公司/g, '')
      cleanCounterparty = cleanCounterparty.replace(/[()（）\[\]【】]/g, '')
      cleanCounterparty = cleanCounterparty.trim()
      
      if (cleanCounterparty.length > 0 && cleanCounterparty.length < 50) {
        return cleanCounterparty
      }
    }
  }
  
  return ''
}

export default router
