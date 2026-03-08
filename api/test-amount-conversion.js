function getAmount(row) {
  const keys = Object.keys(row)
  for (const key of keys) {
    if (key.includes('交易金额(分)')) {
      const value = parseFloat(row[key])
      if (!isNaN(value)) return value / 100
    }
    if (key.includes('交易金额(元)') || key.includes('金额') || key.includes('Amount') || key.includes('amount')) {
      const value = parseFloat(row[key])
      if (!isNaN(value)) return value
    }
  }
  return 0
}

const testCases = [
  {
    description: '测试分转元 - 100分',
    row: {
      '交易金额(分)': 100,
      '交易金额(元)': 1.00
    },
    expected: 1.00
  },
  {
    description: '测试分转元 - 3260分',
    row: {
      '交易金额(分)': 3260,
      '交易金额(元)': 32.60
    },
    expected: 32.60
  },
  {
    description: '测试分转元 - 500000分',
    row: {
      '交易金额(分)': 500000,
      '交易金额(元)': 5000.00
    },
    expected: 5000.00
  },
  {
    description: '测试分转元 - 30000分',
    row: {
      '交易金额(分)': 30000,
      '交易金额(元)': 300.00
    },
    expected: 300.00
  },
  {
    description: '测试元直接使用 - 100元',
    row: {
      '交易金额(元)': 100
    },
    expected: 100.00
  },
  {
    description: '测试元直接使用 - 32.6元',
    row: {
      '交易金额(元)': 32.6
    },
    expected: 32.60
  },
  {
    description: '测试零金额',
    row: {
      '交易金额(分)': 0
    },
    expected: 0.00
  }
]

console.log('=== 金额单位换算测试 ===\n')

let passCount = 0
let failCount = 0

testCases.forEach((testCase, index) => {
  const result = getAmount(testCase.row)
  const passed = Math.abs(result - testCase.expected) < 0.01
  
  if (passed) {
    passCount++
    console.log(`✓ 测试 ${index + 1}: ${testCase.description}`)
    console.log(`  输入: ${JSON.stringify(testCase.row)}`)
    console.log(`  结果: ${result.toFixed(2)}元 (期望: ${testCase.expected.toFixed(2)}元)`)
  } else {
    failCount++
    console.log(`✗ 测试 ${index + 1}: ${testCase.description}`)
    console.log(`  输入: ${JSON.stringify(testCase.row)}`)
    console.log(`  结果: ${result.toFixed(2)}元 (期望: ${testCase.expected.toFixed(2)}元)`)
  }
  console.log()
})

console.log(`=== 测试结果 ===`)
console.log(`通过: ${passCount}/${testCases.length}`)
console.log(`失败: ${failCount}/${testCases.length}`)

if (failCount === 0) {
  console.log('\n✅ 所有测试通过！金额单位换算正确。')
} else {
  console.log('\n❌ 存在失败的测试，请检查金额换算逻辑。')
}
