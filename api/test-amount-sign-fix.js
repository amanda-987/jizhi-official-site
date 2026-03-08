function getAmount(row) {
  const keys = Object.keys(row)
  let amount = 0
  let amountField = null
  
  for (const key of keys) {
    if (key.includes('交易金额(分)')) {
      const value = parseFloat(row[key])
      if (!isNaN(value)) {
        amount = value / 100
        amountField = key
        break
      }
    }
  }
  
  if (amount === 0) {
    for (const key of keys) {
      if (key.includes('交易金额(元)') || key.includes('金额') || key.includes('Amount') || key.includes('amount')) {
        const value = parseFloat(row[key])
        if (!isNaN(value)) {
          amount = value
          amountField = key
          break
        }
      }
    }
  }
  
  if (amount === 0) return 0
  
  const debitCreditType = row['借贷类型'] || row['借贷'] || ''
  
  if (debitCreditType === '出' || debitCreditType === '支出' || debitCreditType === '借') {
    return -Math.abs(amount)
  } else if (debitCreditType === '入' || debitCreditType === '收入' || debitCreditType === '贷') {
    return Math.abs(amount)
  }
  
  return amount
}

const testCases = [
  {
    description: '测试出账 - 1000分',
    row: {
      '交易金额(分)': 1000,
      '借贷类型': '出',
      '对手侧账户名称': '陈良云'
    },
    expected: -10.00
  },
  {
    description: '测试入账 - 37分',
    row: {
      '交易金额(分)': 37,
      '借贷类型': '入',
      '对手侧账户名称': '和智贤'
    },
    expected: 0.37
  },
  {
    description: '测试出账 - 271810分',
    row: {
      '交易金额(分)': 271810,
      '借贷类型': '出',
      '对手侧账户名称': '财付通支付科技有限公司'
    },
    expected: -2718.10
  },
  {
    description: '测试入账 - 3分',
    row: {
      '交易金额(分)': 3,
      '借贷类型': '入',
      '对手侧账户名称': '上海寻梦信息技术有限公司'
    },
    expected: 0.03
  },
  {
    description: '测试出账 - 17000分',
    row: {
      '交易金额(分)': 17000,
      '借贷类型': '出',
      '对手侧账户名称': '中国银联股份有限公司'
    },
    expected: -170.00
  }
]

console.log('=== 金额符号修复测试 ===\n')

let passCount = 0
let failCount = 0

testCases.forEach((testCase, index) => {
  const result = getAmount(testCase.row)
  const passed = Math.abs(result - testCase.expected) < 0.01
  
  if (passed) {
    passCount++
    console.log(`✓ 测试 ${index + 1}: ${testCase.description}`)
    console.log(`  借贷类型: ${testCase.row['借贷类型']}`)
    console.log(`  结果: ${result.toFixed(2)}元 (期望: ${testCase.expected.toFixed(2)}元)`)
  } else {
    failCount++
    console.log(`✗ 测试 ${index + 1}: ${testCase.description}`)
    console.log(`  借贷类型: ${testCase.row['借贷类型']}`)
    console.log(`  结果: ${result.toFixed(2)}元 (期望: ${testCase.expected.toFixed(2)}元)`)
  }
  console.log()
})

console.log(`=== 测试结果 ===`)
console.log(`通过: ${passCount}/${testCases.length}`)
console.log(`失败: ${failCount}/${testCases.length}`)

if (failCount === 0) {
  console.log('\n✅ 所有测试通过！金额符号修复正确。')
} else {
  console.log('\n❌ 存在失败的测试，请检查金额符号逻辑。')
}

console.log('\n=== 模拟高频交易对手统计 ===\n')

const transactions = [
  { counterparty: '陈良云', amount: -10.00, id: '123', bank: '工商银行', account: '6222****1234' },
  { counterparty: '陈良云', amount: -5.00, id: '123', bank: '工商银行', account: '6222****1234' },
  { counterparty: '陈良云', amount: 100.00, id: '123', bank: '工商银行', account: '6222****1234' },
  { counterparty: '财付通支付科技有限公司', amount: -2718.10, id: '456', bank: '建设银行', account: '6217****5678' },
  { counterparty: '财付通支付科技有限公司', amount: -1000.00, id: '456', bank: '建设银行', account: '6217****5678' },
  { counterparty: '和智贤', amount: 0.37, id: '789', bank: '农业银行', account: '6228****9012' },
  { counterparty: '和智贤', amount: 0.03, id: '789', bank: '农业银行', account: '6228****9012' }
]

const counterpartyMap = new Map()

transactions.forEach(tx => {
  if (!counterpartyMap.has(tx.counterparty)) {
    counterpartyMap.set(tx.counterparty, {
      name: tx.counterparty,
      id: tx.id,
      bank: tx.bank,
      account: tx.account,
      count: 0,
      totalAmount: 0,
      inAmount: 0,
      outAmount: 0
    })
  }
  
  const cp = counterpartyMap.get(tx.counterparty)
  cp.count++
  cp.totalAmount += tx.amount
  if (tx.amount > 0) cp.inAmount += tx.amount
  else cp.outAmount += Math.abs(tx.amount)
})

const counterparties = Array.from(counterpartyMap.values())
  .sort((a, b) => b.count - a.count)

console.log('高频交易对手统计结果:\n')
counterparties.forEach((cp, index) => {
  console.log(`${index + 1}. ${cp.name}`)
  console.log(`   对手方ID: ${cp.id}`)
  console.log(`   对手方银行: ${cp.bank}`)
  console.log(`   对手方账号: ${cp.account}`)
  console.log(`   交易笔数: ${cp.count}`)
  console.log(`   交易总额: ${cp.totalAmount.toFixed(2)}元`)
  console.log(`   入账总额: ${cp.inAmount.toFixed(2)}元`)
  console.log(`   出账总额: ${cp.outAmount.toFixed(2)}元`)
  console.log()
})
