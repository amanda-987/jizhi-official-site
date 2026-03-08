import mysql from 'mysql2/promise'

const testConnection = async () => {
  try {
    console.log('尝试连接数据库...')
    console.log('用户: root')
    console.log('密码: 9s7K!8p2Q@7m9Z#5')
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '9s7K!8p2Q@7m9Z#5'
    })
    
    console.log('✅ 数据库连接成功！')
    
    await connection.end()
    console.log('✅ 连接已关闭')
    
  } catch (error) {
    console.error('❌ 数据库连接失败:')
    console.error('错误代码:', error.code)
    console.error('错误信息:', error.message)
    
    if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('\n🔧 可能的原因:')
      console.log('1. MySQL密码不正确')
      console.log('2. MySQL用户权限配置问题')
      console.log('3. MySQL服务需要重启')
    }
  }
}

testConnection()
