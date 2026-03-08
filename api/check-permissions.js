import mysql from 'mysql2/promise'

const checkPermissions = async () => {
  try {
    console.log('检查MySQL用户权限...')
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '9s7K!8p2Q@7m9Z#5'
    })
    
    console.log('✅ MySQL连接成功')
    
    const [rows] = await connection.query('SELECT USER(), CURRENT_USER()')
    console.log('当前用户信息:', rows)
    
    const [databases] = await connection.query('SHOW DATABASES')
    console.log('可用数据库:', databases.map(db => db.Database))
    
    await connection.query('USE jizhi_db')
    console.log('✅ 成功切换到jizhi_db数据库')
    
    await connection.end()
    console.log('✅ 连接已关闭')
    
  } catch (error) {
    console.error('❌ 检查失败:')
    console.error('错误代码:', error.code)
    console.error('错误信息:', error.message)
  }
}

checkPermissions()
