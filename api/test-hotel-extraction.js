function isHotelConsumption(counterparty, remark) {
  const text = (counterparty + ' ' + remark).toLowerCase()
  
  const hotelKeywords = [
    '酒店', '宾馆', '旅馆', '招待所', '度假村', '民宿', '旅店',
    'hotel', 'inn', 'motel', 'resort', 'lodge'
  ]
  
  const nonHotelKeywords = [
    '停车场', '停车缴费', '停车费', '零钱通支付', '零钱通支付退款',
    '微众代销', '转账', '退款'
  ]
  
  const hasHotelKeyword = hotelKeywords.some(keyword => text.includes(keyword))
  const hasNonHotelKeyword = nonHotelKeywords.some(keyword => text.includes(keyword))
  
  return hasHotelKeyword && !hasNonHotelKeyword
}

function extractHotelName(counterparty, remark) {
  const text = (counterparty + ' ' + remark)
  
  const hotelPatterns = [
    /([^(\s]+(?:酒店|宾馆|旅馆|招待所|度假村|民宿|旅店))/,
    /([^(\s]+(?:Hotel|Inn|Motel|Resort|Lodge))/i
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
      hotelName = hotelName.trim()
      
      if (hotelName.length > 0) {
        return hotelName
      }
    }
  }
  
  if (counterparty && counterparty.length > 0) {
    let cleanCounterparty = counterparty.replace(/\([^)]*\)/g, '')
    cleanCounterparty = cleanCounterparty.replace(/有限公司|股份有限公司|集团|公司/g, '')
    cleanCounterparty = cleanCounterparty.trim()
    
    if (cleanCounterparty.length > 0 && cleanCounterparty.length < 50) {
      return cleanCounterparty
    }
  }
  
  return ''
}

const testCases = [
  {
    counterparty: '亚太世纪(维西)酒店有限公司(1601735432)',
    remark: '维西县亚太世纪大酒店停车场-停车缴费-云A1TS60',
    expected: false
  },
  {
    counterparty: '艺龙网信息技术（北京）有限公司(1357607902)',
    remark: '同程旅行酒店(酒店订单ID：1517196782)',
    expected: true
  },
  {
    counterparty: '华住酒店管理有限公司(1321526901)',
    remark: '',
    expected: true
  },
  {
    counterparty: '宁洱南希大酒店(1608521049)',
    remark: '零钱通支付/转账（微众代销）',
    expected: false
  },
  {
    counterparty: '中国银联股份有限公司(1500947831)',
    remark: '云南泊隅酒店管理有限公司-消费',
    expected: true
  },
  {
    counterparty: '艺龙网信息技术（北京）有限公司(1357607902)',
    remark: '3066351379泊隅智能酒店',
    expected: true
  },
  {
    counterparty: '中国银联股份有限公司(1500947831)',
    remark: '弥渡县恒中源泉酒店',
    expected: true
  },
  {
    counterparty: '昆明万富酒店管理有限公司西山分公司(1705069754)',
    remark: '',
    expected: true
  }
]

console.log('测试酒店消费提取功能:\n')

let passCount = 0
let failCount = 0

testCases.forEach((testCase, index) => {
  const isHotel = isHotelConsumption(testCase.counterparty, testCase.remark)
  const hotelName = extractHotelName(testCase.counterparty, testCase.remark)
  
  const passed = isHotel === testCase.expected
  if (passed) {
    passCount++
  } else {
    failCount++
  }
  
  console.log(`测试用例 ${index + 1}:`)
  console.log(`  对手方: ${testCase.counterparty}`)
  console.log(`  备注: ${testCase.remark}`)
  console.log(`  是否酒店消费: ${isHotel} (期望: ${testCase.expected}) ${passed ? '✓' : '✗'}`)
  console.log(`  提取的酒店名称: ${hotelName || '无'}`)
  console.log()
})

console.log(`测试结果: ${passCount} 通过, ${failCount} 失败`)
