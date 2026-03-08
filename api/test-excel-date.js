function convertExcelDate(excelDate) {
  const date = new Date((excelDate - 25569) * 86400 * 1000)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  const seconds = String(date.getSeconds()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`
}

console.log('测试Excel日期转换:')
console.log('46023.8779513889 ->', convertExcelDate(46023.8779513889))
console.log('46036.7774421296 ->', convertExcelDate(46036.7774421296))
console.log('44562.123456789 ->', convertExcelDate(44562.123456789))
