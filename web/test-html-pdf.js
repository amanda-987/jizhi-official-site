import html2canvas from 'html2canvas'
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

const result = mockAnalysisResult
const summary = result.summary

const reportHTML = `
  <div style="font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif; padding: 40px; line-height: 1.6; max-width: 800px; margin: 0 auto;">
    <h1 style="text-align: center; color: #333; margin-bottom: 30px; font-size: 24px;">流水智能分析报告</h1>
    
    <div style="border-bottom: 2px solid #333; margin-bottom: 30px;"></div>
    
    <h2 style="color: #333; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">一、汇总信息</h2>
    <p style="color: #666; font-size: 12px; margin-bottom: 10px;">说明：本部分汇总了流水文件的整体交易情况，包括总交易笔数、总金额、充值次数、车辆关联次数和大额交易次数，用于快速了解流水的基本概况。</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
      <p style="margin: 5px 0; font-size: 14px;">总交易笔数：<strong>${summary.totalTransactions}</strong> 笔</p>
      <p style="margin: 5px 0; font-size: 14px;">总金额：<strong>${formatCurrency(summary.totalAmount)}</strong></p>
      <p style="margin: 5px 0; font-size: 14px;">充值次数：<strong>${summary.rechargeCount}</strong> 次</p>
      <p style="margin: 5px 0; font-size: 14px;">车辆关联次数：<strong>${summary.vehicleCount}</strong> 次</p>
      <p style="margin: 5px 0; font-size: 14px;">大额交易次数：<strong>${summary.largeTransactionCount}</strong> 次</p>
    </div>
    
    <h2 style="color: #333; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">二、用户名下手机号码分析</h2>
    <p style="color: #666; font-size: 12px; margin-bottom: 10px;">说明：本部分分析了流水中出现的手机号码及其充值情况，包括手机号码、用户名、用户ID、充值次数和充值总金额，用于识别用户名下的手机号码使用情况。</p>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background: #f0f0f0;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">手机号码</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">用户名</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">用户ID</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">充值次数</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">充值总金额</th>
        </tr>
      </thead>
      <tbody>
        ${result.userPhoneAnalysis.map((item) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${item.phone}</td>
            <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${item.userName}</td>
            <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${item.userId}</td>
            <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${item.count} 次</td>
            <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${formatCurrency(item.amount)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <h2 style="color: #333; font-size: 18px; margin-top: 30px; margin-bottom: 15px;">三、限制高消费行为分析</h2>
    <p style="color: #666; font-size: 12px; margin-bottom: 10px;">说明：本部分分析了流水中可能涉及限制高消费行为的交易记录，包括机票/高铁、宾馆/酒店、娱乐场所、旅行社、房地产/装修、保险/证券/基金、奢侈品/高端会员等消费类型，用于识别被执行人是否存在违反限制高消费令的行为。</p>
    
    <h3 style="color: #333; font-size: 16px; margin-top: 20px; margin-bottom: 10px;">1. 机票/高铁</h3>
    <p style="color: #666; font-size: 12px; margin-bottom: 10px;">说明：本部分列出了流水中的机票和高铁消费记录，用于识别被执行人是否存在乘坐飞机、高铁等高消费行为。</p>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background: #f0f0f0;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">时间</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">金额</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">消费场所</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">对手方</th>
        </tr>
      </thead>
      <tbody>
        ${result.restrictedConsumption.flights.map((item) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${formatDateTime(item.time)}</td>
            <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${formatCurrency(item.amount)}</td>
            <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${item.location}</td>
            <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${item.counterparty}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <h3 style="color: #333; font-size: 16px; margin-top: 20px; margin-bottom: 10px;">2. 宾馆/酒店</h3>
    <p style="color: #666; font-size: 12px; margin-bottom: 10px;">说明：本部分列出了流水中的宾馆和酒店消费记录，用于识别被执行人是否存在入住星级酒店等高消费行为。</p>
    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background: #f0f0f0;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">时间</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">金额</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px;">消费场所</th>
        </tr>
      </thead>
      <tbody>
        ${result.restrictedConsumption.hotels.map((item) => `
          <tr>
            <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${formatDateTime(item.time)}</td>
            <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${formatCurrency(item.amount)}</td>
            <td style="border: 1px solid #ddd; padding: 8px; font-size: 12px;">${item.location}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    
    <div style="border-top: 2px solid #333; margin-top: 40px; margin-bottom: 20px;"></div>
    
    <p style="color: #666; font-size: 12px; margin-bottom: 10px;">报告生成时间：${new Date().toLocaleString('zh-CN')}</p>
    <p style="color: #999; font-size: 11px; margin-bottom: 10px;">本报告由极执网智能分析系统自动生成，仅供参考，具体执行情况以法院认定为准。</p>
  </div>
`

console.log('开始生成PDF报告...')

const container = document.createElement('div')
container.style.position = 'fixed'
container.style.left = '-9999px'
container.style.top = '0'
container.style.width = '800px'
container.innerHTML = reportHTML
document.body.appendChild(container)

html2canvas(container, {
  scale: 2,
  useCORS: true,
  logging: false
}).then(canvas => {
  document.body.removeChild(container)
  
  const imgData = canvas.toDataURL('image/png')
  const pdf = new jsPDF('p', 'mm', 'a4')
  const pdfWidth = pdf.internal.pageSize.getWidth()
  const pdfHeight = pdf.internal.pageSize.getHeight()
  const imgWidth = pdfWidth
  const imgHeight = (canvas.height * pdfWidth) / canvas.width

  let heightLeft = imgHeight
  let position = 0

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
  heightLeft -= pdfHeight

  while (heightLeft > 0) {
    position = heightLeft - imgHeight
    pdf.addPage()
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
    heightLeft -= pdfHeight
  }

  pdf.save(`流水分析报告_${new Date().getTime()}.pdf`)
  console.log('✅ PDF报告生成成功！')
}).catch(error => {
  console.error('❌ PDF生成失败:', error)
  document.body.removeChild(container)
})
