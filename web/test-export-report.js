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
    vehicleCount: 0,
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
    entertainment: [],
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

const reportContent = `
流水智能分析报告
=====================================

一、汇总信息
-------------------------------------
总交易笔数：${mockAnalysisResult.summary.totalTransactions} 笔
总金额：${formatCurrency(mockAnalysisResult.summary.totalAmount)}
充值次数：${mockAnalysisResult.summary.rechargeCount} 次
车辆关联次数：${mockAnalysisResult.summary.vehicleCount} 次
大额交易次数：${mockAnalysisResult.summary.largeTransactionCount} 次

二、用户名下手机号码分析
-------------------------------------
${mockAnalysisResult.userPhoneAnalysis.map((item, index) => 
  `${index + 1}. 手机号码：${item.phone}
   用户名：${item.userName}
   用户ID：${item.userId}
   充值次数：${item.count} 次
   充值总金额：${formatCurrency(item.amount)}`
).join('\n\n')}

三、车辆信息关联分析
-------------------------------------
${mockAnalysisResult.vehicleAnalysis.map((item, index) => 
  `${index + 1}. 车牌号码：${item.plateNumber}`
).join('\n')}

四、高频交易对手分析
-------------------------------------
${mockAnalysisResult.highFrequencyCounterparties.map((item, index) => 
  `${index + 1}. 对手方名称：${item.name}
   对手方ID：${item.id}
   对手方银行：${item.bank}
   对手方账号：${item.account}
   交易笔数：${item.count} 笔
   交易总额：${formatCurrency(item.totalAmount)}
   入账总额：${formatCurrency(item.inAmount)}
   出账总额：${formatCurrency(item.outAmount)}`
).join('\n\n')}

五、限制高消费行为分析
-------------------------------------

1. 机票/高铁
${mockAnalysisResult.restrictedConsumption.flights.map((item, index) => 
  `  ${index + 1}. 时间：${formatDateTime(item.time)}
     金额：${formatCurrency(item.amount)}
     消费场所：${item.location}
     对手方：${item.counterparty}`
).join('\n')}

2. 宾馆/酒店
${mockAnalysisResult.restrictedConsumption.hotels.map((item, index) => 
  `  ${index + 1}. 时间：${formatDateTime(item.time)}
     金额：${formatCurrency(item.amount)}
     消费场所：${item.location}`
).join('\n')}

六、大额交易分析
-------------------------------------
${mockAnalysisResult.largeTransactions.map((item, index) => 
  `${index + 1}. 时间：${formatDateTime(item.time)}
   金额：${formatCurrency(item.amount)}
   对手方：${item.counterparty}
   银行：${item.bank}
   账号：${item.account}`
).join('\n\n')}

七、最常消费商家分析
-------------------------------------
${mockAnalysisResult.topMerchants.map((item, index) => 
  `${index + 1}. 商家名称：${item.name}
   交易次数：${item.count} 次
   总金额：${formatCurrency(item.totalAmount)}`
).join('\n\n')}

=====================================
报告生成时间：${new Date().toLocaleString('zh-CN')}
=====================================
`

console.log('流水智能分析报告测试\n')
console.log(reportContent)
console.log('\n✅ 报告生成成功！')
