import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { Sequelize } from 'sequelize'
import apiRoutes from './routes/index.js'
import path from 'path'
import { fileURLToPath } from 'url'
import FlowFile from './models/FlowFile.js'
import LegalDocument from './models/LegalDocument.js'
import AnalysisHistory from './models/AnalysisHistory.js'
import FlowAnalysis from './models/FlowAnalysis.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '../.env') })

console.log('环境变量加载:')
console.log('DB_NAME:', process.env.DB_NAME)
console.log('DB_USER:', process.env.DB_USER)
console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '***已设置***' : '未设置')
console.log('DB_HOST:', process.env.DB_HOST)
console.log('DB_PORT:', process.env.DB_PORT)

const sequelize = new Sequelize({
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  dialect: 'mysql',
  logging: false,
  timezone: '+08:00',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  retry: {
    max: 3,
    match: [
      /ETIMEDOUT/,
      /EHOSTUNREACH/,
      /ECONNRESET/,
      /EPIPE/
    ]
  },
  define: {
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    freezeTableName: true
  }
})

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))

app.use('/api', apiRoutes)

app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({
    code: 500,
    message: err.message || '服务器内部错误',
    data: null
  })
})

const startServer = async () => {
  try {
    await sequelize.authenticate()
    console.log('数据库连接成功')

    await sequelize.sync({ alter: true })
    console.log('数据库表同步完成')
  } catch (error) {
    console.error('数据库连接失败，服务器将在无数据库模式下运行:', error.message)
    console.log('注意：部分功能可能无法正常使用')
  }

  app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`)
  })
}

startServer()
