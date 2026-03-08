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
  }
]

console.log('性能测试 - 优化后的酒店消费判断函数\n')

const iterations = 100000
console.log(`测试用例数量: ${testCases.length}`)
console.log(`每个测试用例执行次数: ${iterations}`)
console.log(`总执行次数: ${iterations * testCases.length}\n`)

const startTime = Date.now()

for (let i = 0; i < iterations; i++) {
  for (const testCase of testCases) {
    isHotelConsumption(testCase.counterparty, testCase.remark)
  }
}

const endTime = Date.now()
const totalTime = endTime - startTime
const avgTime = totalTime / (iterations * testCases.length)

console.log(`总执行时间: ${totalTime}ms`)
console.log(`平均每次执行时间: ${avgTime.toFixed(4)}ms`)
console.log(`每秒执行次数: ${Math.round(1000 / avgTime)}`)

let passCount = 0
testCases.forEach((testCase, index) => {
  const result = isHotelConsumption(testCase.counterparty, testCase.remark)
  if (result === testCase.expected) {
    passCount++
  } else {
    console.log(`测试用例 ${index + 1} 失败: 期望 ${testCase.expected}, 实际 ${result}`)
  }
})

console.log(`\n正确性测试: ${passCount}/${testCases.length} 通过`)
