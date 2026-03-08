import mysql from 'mysql2/promise'

const connection = await mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '9s7K!8p2Q@7m9Z#5',
  database: 'jizhi_db'
})

try {
  await connection.execute(`
    ALTER TABLE flow_analysis 
    CHANGE COLUMN recharge_analysis user_phone_analysis 
    JSON COMMENT '用户手机号码分析数据'
  `)
  console.log('数据库表结构更新成功')
} catch (error) {
  console.error('更新失败:', error.message)
} finally {
  await connection.end()
}
