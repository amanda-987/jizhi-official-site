const text = '停车支付2.00元(云PVN217)'

const patterns = [
  /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z][A-Z0-9]{5,6}/,
  /[京津沪渝冀豫云辽黑湘皖鲁新苏浙赣鄂桂甘晋蒙陕吉闽贵粤青藏川宁琼使领][A-Z]{3}[A-Z0-9]{3}/,
  /云[A-Z]{3}[0-9]{3}/,
  /云[A-Z]{3}[0-9]{4}/
]

console.log('测试文本:', text)
console.log('\n测试正则匹配:')

patterns.forEach((pattern, index) => {
  const match = text.match(pattern)
  console.log(`模式${index + 1}: ${pattern}`)
  console.log(`  匹配结果: ${match ? match[0] : '无'}`)
})

console.log('\n尝试更简单的模式:')
const simplePattern = /云[A-Z0-9]+/
const simpleMatch = text.match(simplePattern)
console.log(`简单模式: ${simplePattern}`)
console.log(`  匹配结果: ${simpleMatch ? simpleMatch[0] : '无'}`)