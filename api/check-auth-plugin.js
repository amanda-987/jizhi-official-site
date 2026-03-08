import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

async function checkAuthPlugin() {
  try {
    const sequelize = new Sequelize({
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      dialect: 'mysql',
      logging: false
    })

    console.log('=== 检查MySQL认证插件 ===\n')

    const [users] = await sequelize.query(`
      SELECT user, host, plugin 
      FROM mysql.user 
      WHERE user = 'root'
    `)

    console.log('当前root用户认证插件:')
    users.forEach(user => {
      console.log(`  用户: ${user.user}@${user.host}`)
      console.log(`  认证插件: ${user.plugin}`)
    })

    const [variables] = await sequelize.query('SHOW VARIABLES LIKE "default_authentication_plugin"')
    if (variables.length > 0) {
      console.log(`\n默认认证插件: ${variables[0].Value}`)
    }

    await sequelize.close()

  } catch (error) {
    console.error('检查失败:', error.message)
  }
}

checkAuthPlugin()
