const entertainment = [
  { time: '2021-08-30 21:30:26', amount: -1550, location: '大理市帕缇奈酒吧 (酒吧)', counterparty: '中国银联股份有限公司' },
  { time: '2021-09-09 20:27:12', amount: -1000, location: '扫二维码付款-给维西欢畅量贩 (KTV)', counterparty: '李志贤' },
  { time: '2024-02-19 11:51:25', amount: -39.8, location: '中国银联', counterparty: '中国银联股份有限公司' },
  { time: '2023-12-17 18:42:24', amount: -60, location: '经营者_杨元庆', counterparty: '经营者_杨元庆' },
  { time: '2021-09-10 20:48:31', amount: -200, location: '张三', counterparty: '李志贤' },
  { time: '2021-12-09 22:41:51', amount: -2780, location: '大理市帕缇奈酒吧 (酒吧)', counterparty: '中国银联股份有限公司' }
]

console.log('测试娱乐场所过滤逻辑:\n')

const filtered = entertainment.filter(item => {
  if (!item.location) return false
  const location = item.location.trim()
  
  const companyKeywords = ['公司', '有限', '股份', '集团', '银行', '银联', '证券', '基金', '保险', '投资', '科技', '网络', '信息', '数据', '服务', '娱乐', '文化', '传媒', '酒店', '餐饮', '酒吧', 'KTV', 'ktv', '量贩', '俱乐部', '会所', '中心', '广场', '商城', '超市', '市场', '经营', '企业', '实业', '发展', '建设', '管理', '控股']
  
  const hasCompanyKeyword = companyKeywords.some(keyword => location.includes(keyword))
  
  if (hasCompanyKeyword) return true
  
  const isIndividual = /^[\u4e00-\u9fa5]{2,4}$/.test(location)
  return !isIndividual
})

console.log('过滤后的娱乐场所（保留）:')
filtered.forEach((item, i) => {
  console.log(`${i + 1}. ${item.location} - ${item.counterparty}`)
})

console.log('\n被过滤的记录:')
const filteredOut = entertainment.filter(item => !filtered.includes(item))
filteredOut.forEach((item, i) => {
  console.log(`${i + 1}. ${item.location} - ${item.counterparty}`)
})