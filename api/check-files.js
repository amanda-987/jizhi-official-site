import sequelize from './src/config/database.js'
import FlowFile from './src/models/FlowFile.js'

async function checkFiles() {
  try {
    await sequelize.authenticate()
    console.log('数据库连接成功')
    
    const files = await FlowFile.findAll({
      attributes: ['id', 'file_name', 'status', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 10
    })
    
    console.log(`\n最近的文件:`)
    files.forEach((file, index) => {
      console.log(`${index + 1}. ID: ${file.id}, 文件名: ${file.file_name}, 状态: ${file.status}`)
    })
    
  } catch (error) {
    console.error('查询失败:', error.message)
  } finally {
    await sequelize.close()
  }
}

checkFiles()