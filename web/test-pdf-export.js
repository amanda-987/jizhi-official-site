import { jsPDF } from 'jspdf'

function formatCurrency(amount) {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency: 'CNY'
  }).format(amount)
}

function formatDateTime(time) {
  if (!time) return '-'
  
  let date
  if (typeof time === 'string') {
    date = new Date(time)
  } else {
    date = time
  }
  
  if (isNaN(date.getTime())) {
    return time
  }
  
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

const mockAnalysisResult = {
  summary: {
    totalTransactions: 814,
    totalAmount: -108671.02,
    rechargeCount: 14,
    vehicleCount: 1,
    largeTransactionCount: 5
  },
  userPhoneAnalysis: [
    { phone: '138****1234', userName: '张三', userId: 'user001', count: 3, amount: 500 },
    { phone: '139****5678', userName: '李四', userId: 'user002', count: 2, amount: 300 }
  ],
  vehicleAnalysis: [
    { plateNumber: '云A12345' }
  ],
  highFrequencyCounterparties: [
    { name: '财付通支付科技有限公司', id: '123456', bank: '建设银行', account: '6217****1234', count: 10, totalAmount: 50000, inAmount: 0, outAmount: 50000 }
  ],
  restrictedConsumption: {
    flights: [
      { time: '2025-01-15 10:30:00', amount: 1200, location: '中国南方航空', counterparty: '中国南方航空' }
    ],
    hotels: [
      { time: '2025-01-16 14:00:00', amount: 500, location: '如家酒店', counterparty: '如家酒店' }
    ],
    entertainment: [
      { time: '2025-01-17 20:00:00', amount: 800, location: 'KTV娱乐城', counterparty: 'KTV娱乐城' }
    ],
    travel: [],
    realEstate: [],
    insurance: [],
    luxury: []
  },
  largeTransactions: [
    { time: '2025-01-10 09:00:00', amount: 10000, counterparty: '中国银联', bank: '工商银行', account: '6222****5678' }
  ],
  topMerchants: [
    { name: '财付通支付科技有限公司', count: 50, totalAmount: 200000 }
  ]
}

const pdf = new jsPDF()
const pageWidth = pdf.internal.pageSize.getWidth()
const pageHeight = pdf.internal.pageSize.getHeight()
const margin = 20
const contentWidth = pageWidth - 2 * margin
let currentY = margin

const addTitle = (text, fontSize = 18) => {
  pdf.setFontSize(fontSize)
  pdf.setFont('helvetica', 'bold')
  pdf.text(text, margin, currentY)
  currentY += fontSize / 2 + 5
  pdf.setFont('helvetica', 'normal')
}

const addSectionTitle = (text) => {
  if (currentY > pageHeight - 30) {
    pdf.addPage()
    currentY = margin
  }
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.text(text, margin, currentY)
  currentY += 8
  pdf.setFont('helvetica', 'normal')
}

const addText = (text, fontSize = 10) => {
  if (currentY > pageHeight - 20) {
    pdf.addPage()
    currentY = margin
  }
  pdf.setFontSize(fontSize)
  const lines = pdf.splitTextToSize(text, contentWidth)
  pdf.text(lines, margin, currentY)
  currentY += lines.length * (fontSize / 2 + 2)
}

const addLine = () => {
  if (currentY > pageHeight - 20) {
    pdf.addPage()
    currentY = margin
  }
  pdf.setLineWidth(0.5)
  pdf.line(margin, currentY, pageWidth - margin, currentY)
  currentY += 8
}

const addTable = (headers, data, descriptions = []) => {
  if (data.length === 0) {
    addText('暂无数据')
    return
  }

  if (currentY > pageHeight - 50) {
    pdf.addPage()
    currentY = margin
  }

  const colWidth = contentWidth / headers.length
  const rowHeight = 8

  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')

  headers.forEach((header, index) => {
    pdf.rect(margin + index * colWidth, currentY, colWidth, rowHeight)
    pdf.text(header, margin + index * colWidth + 2, currentY + 6)
  })

  currentY += rowHeight
  pdf.setFont('helvetica', 'normal')

  data.forEach((row, rowIndex) => {
    if (currentY > pageHeight - 30) {
      pdf.addPage()
      currentY = margin
    }

    row.forEach((cell, cellIndex) => {
      pdf.rect(margin + cellIndex * colWidth, currentY, colWidth, rowHeight)
      const cellText = String(cell || '')
      const lines = pdf.splitTextToSize(cellText, colWidth - 4)
      if (lines.length > 0) {
        pdf.text(lines[0].substring(0, 15), margin + cellIndex * colWidth + 2, currentY + 6)
      }
    })

    if (descriptions[rowIndex]) {
      currentY += rowHeight
      pdf.setFontSize(8)
      pdf.setTextColor(100, 100, 100)
      const descLines = pdf.splitTextToSize(`说明：${descriptions[rowIndex]}`, contentWidth)
      pdf.text(descLines, margin, currentY + 5)
      currentY += descLines.length * 4 + 3
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(9)
    } else {
      currentY += rowHeight
    }
  })

  currentY += 5
}

pdf.setFont('helvetica', 'normal')

addTitle('流水智能分析报告', 20)
addLine()

addSectionTitle('一、汇总信息')
addText('说明：本部分汇总了流水文件的整体交易情况，包括总交易笔数、总金额、充值次数、车辆关联次数和大额交易次数，用于快速了解流水的基本概况。')
addText(`总交易笔数：${mockAnalysisResult.summary.totalTransactions} 笔`)
addText(`总金额：${formatCurrency(mockAnalysisResult.summary.totalAmount)}`)
addText(`充值次数：${mockAnalysisResult.summary.rechargeCount} 次`)
addText(`车辆关联次数：${mockAnalysisResult.summary.vehicleCount} 次`)
addText(`大额交易次数：${mockAnalysisResult.summary.largeTransactionCount} 次`)
addLine()

addSectionTitle('二、用户名下手机号码分析')
addText('说明：本部分分析了流水中出现的手机号码及其充值情况，包括手机号码、用户名、用户ID、充值次数和充值总金额，用于识别用户名下的手机号码使用情况。')

if (mockAnalysisResult.userPhoneAnalysis && mockAnalysisResult.userPhoneAnalysis.length > 0) {
  const phoneData = mockAnalysisResult.userPhoneAnalysis.map((item) => [
    item.phone || '无',
    item.userName || '无',
    item.userId || '无',
    `${item.count || 0} 次`,
    formatCurrency(item.amount || 0)
  ])
  addTable(['手机号码', '用户名', '用户ID', '充值次数', '充值总金额'], phoneData)
} else {
  addText('暂无手机号码数据')
}
addLine()

addSectionTitle('三、车辆信息关联分析')
addText('说明：本部分分析了流水中与车辆相关的交易记录，包括车牌号码，用于识别被执行人名下的车辆使用情况。')

if (mockAnalysisResult.vehicleAnalysis && mockAnalysisResult.vehicleAnalysis.length > 0) {
  const vehicleData = mockAnalysisResult.vehicleAnalysis.map((item) => [
    item.plateNumber || '无'
  ])
  addTable(['车牌号码'], vehicleData)
} else {
  addText('暂无车辆信息')
}
addLine()

addSectionTitle('四、高频交易对手分析')
addText('说明：本部分分析了流水中交易频率最高的对手方信息，包括对手方名称、对手方ID、对手方银行、对手方账号、交易笔数、交易总额、入账总额和出账总额，用于识别被执行人的主要交易对象。')

if (mockAnalysisResult.highFrequencyCounterparties && mockAnalysisResult.highFrequencyCounterparties.length > 0) {
  const counterpartyData = mockAnalysisResult.highFrequencyCounterparties.map((item) => [
    item.name || '无',
    item.id || '无',
    item.bank || '无',
    item.account || '无',
    `${item.count || 0} 笔`,
    formatCurrency(item.totalAmount || 0),
    formatCurrency(item.inAmount || 0),
    formatCurrency(item.outAmount || 0)
  ])
  addTable(
    ['对手方名称', '对手方ID', '对手方银行', '对手方账号', '交易笔数', '交易总额', '入账总额', '出账总额'],
    counterpartyData
  )
} else {
  addText('暂无高频交易对手数据')
}
addLine()

addSectionTitle('五、限制高消费行为分析')
addText('说明：本部分分析了流水中可能涉及限制高消费行为的交易记录，包括机票/高铁、宾馆/酒店、娱乐场所、旅行社、房地产/装修、保险/证券/基金、奢侈品/高端会员等消费类型，用于识别被执行人是否存在违反限制高消费令的行为。')

const flights = mockAnalysisResult.restrictedConsumption?.flights || []
if (flights.length > 0) {
  addSectionTitle('1. 机票/高铁')
  addText('说明：本部分列出了流水中的机票和高铁消费记录，用于识别被执行人是否存在乘坐飞机、高铁等高消费行为。')
  const flightData = flights.map((item) => [
    formatDateTime(item.time),
    formatCurrency(item.amount),
    item.location || '无',
    item.counterparty || '无'
  ])
  addTable(['时间', '金额', '消费场所', '对手方'], flightData)
}

const hotels = mockAnalysisResult.restrictedConsumption?.hotels || []
if (hotels.length > 0) {
  addSectionTitle('2. 宾馆/酒店')
  addText('说明：本部分列出了流水中的宾馆和酒店消费记录，用于识别被执行人是否存在入住星级酒店等高消费行为。')
  const hotelData = hotels.map((item) => [
    formatDateTime(item.time),
    formatCurrency(item.amount),
    item.location || '无'
  ])
  addTable(['时间', '金额', '消费场所'], hotelData)
}

const entertainment = mockAnalysisResult.restrictedConsumption?.entertainment || []
if (entertainment.length > 0) {
  addSectionTitle('3. 娱乐场所')
  addText('说明：本部分列出了流水中的娱乐场所消费记录，用于识别被执行人是否存在在娱乐场所进行高消费行为。')
  const entertainmentData = entertainment.map((item) => [
    formatDateTime(item.time),
    formatCurrency(item.amount),
    item.location || '无'
  ])
  addTable(['时间', '金额', '消费场所'], entertainmentData)
}

addSectionTitle('六、大额交易分析')
addText('说明：本部分分析了流水中的大额交易记录，包括时间、金额、对手方、银行和账号，用于识别被执行人的大额资金流动情况，为执行工作提供线索。')

if (mockAnalysisResult.largeTransactions && mockAnalysisResult.largeTransactions.length > 0) {
  const largeTransactionData = mockAnalysisResult.largeTransactions.map((item) => [
    formatDateTime(item.time),
    formatCurrency(item.amount),
    item.counterparty || '无',
    item.bank || '无',
    item.account || '无'
  ])
  addTable(['时间', '金额', '对手方', '银行', '账号'], largeTransactionData)
} else {
  addText('暂无大额交易数据')
}
addLine()

addSectionTitle('七、最常消费商家分析')
addText('说明：本部分分析了流水中最常消费的商家信息，包括商家名称、交易次数和总金额，用于识别被执行人的主要消费场所和消费习惯。')

if (mockAnalysisResult.topMerchants && mockAnalysisResult.topMerchants.length > 0) {
  const merchantData = mockAnalysisResult.topMerchants.map((item) => [
    item.name || '无',
    `${item.count || 0} 次`,
    formatCurrency(item.totalAmount || 0)
  ])
  addTable(['商家名称', '交易次数', '总金额'], merchantData)
} else {
  addText('暂无商家数据')
}
addLine()

addText(`报告生成时间：${new Date().toLocaleString('zh-CN')}`, 8)
addText('本报告由极执网智能分析系统自动生成，仅供参考，具体执行情况以法院认定为准。', 8)

pdf.save(`流水分析报告_${new Date().getTime()}.pdf`)

console.log('✅ PDF报告生成成功！')
console.log('报告已保存到当前目录')
