import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

async function checkFlowFilesTable() {
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

    console.log('=== 检查flow_files表结构 ===\n')

    const [columns] = await sequelize.query('DESCRIBE flow_files')
    console.log('当前表字段:')
    columns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key}`)
    })

    await sequelize.close()

  } catch (error) {
    console.error('检查失败:', error.message)
  }
}

checkFlowFilesTable()
