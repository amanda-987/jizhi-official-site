import sequelize from './src/config/database.js'
import FlowFile from './src/models/FlowFile.js'

async function checkFilePath() {
  try {
    await sequelize.authenticate()
    console.log('数据库连接成功')
    
    const flowFile = await FlowFile.findByPk(16)
    if (!flowFile) {
      console.log('文件ID 16不存在')
      return
    }
    
    console.log('文件ID:', flowFile.id)
    console.log('文件名:', flowFile.file_name)
    console.log('文件路径:', flowFile.file_path)
    console.log('文件类型:', flowFile.file_type)
    console.log('文件大小:', flowFile.file_size)
    console.log('流水来源:', flowFile.flow_source)
    console.log('状态:', flowFile.status)
    console.log('创建时间:', flowFile.created_at)
    
  } catch (error) {
    console.error('查询失败:', error)
  } finally {
    await sequelize.close()
  }
}

checkFilePath()