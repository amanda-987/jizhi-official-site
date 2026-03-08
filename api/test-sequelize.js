import { Sequelize } from 'sequelize'

const testSequelize = async () => {
  try {
    console.log('测试Sequelize连接...')
    console.log('尝试方式1: 使用连接字符串')
    
    const sequelize1 = new Sequelize(
      'mysql://root:9s7K!8p2Q@7m9Z#5@localhost:3306/jizhi_db',
      {
        dialect: 'mysql',
        logging: false
      }
    )
    
    await sequelize1.authenticate()
    console.log('✅ 方式1成功')
    await sequelize1.close()
    
  } catch (error) {
    console.log('❌ 方式1失败:', error.message)
    
    try {
      console.log('\n尝试方式2: 使用参数对象')
      
      const sequelize2 = new Sequelize({
        database: 'jizhi_db',
        username: 'root',
        password: '9s7K!8p2Q@7m9Z#5',
        host: 'localhost',
        port: 3306,
        dialect: 'mysql',
        logging: false
      })
      
      await sequelize2.authenticate()
      console.log('✅ 方式2成功')
      await sequelize2.close()
      
    } catch (error2) {
      console.log('❌ 方式2失败:', error2.message)
      
      try {
        console.log('\n尝试方式3: 使用编码密码')
        
        const sequelize3 = new Sequelize({
          database: 'jizhi_db',
          username: 'root',
          password: encodeURIComponent('9s7K!8p2Q@7m9Z#5'),
          host: 'localhost',
          port: 3306,
          dialect: 'mysql',
          logging: false
        })
        
        await sequelize3.authenticate()
        console.log('✅ 方式3成功')
        await sequelize3.close()
        
      } catch (error3) {
        console.log('❌ 方式3失败:', error3.message)
        console.log('\n所有方式都失败了，可能是Sequelize版本兼容性问题')
      }
    }
  }
}

testSequelize()
