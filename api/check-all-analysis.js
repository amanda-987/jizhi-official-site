import sequelize from './src/config/database.js'
import FlowAnalysis from './src/models/FlowAnalysis.js'

async function checkAllAnalysis() {
  try {
    await sequelize.authenticate()
    console.log('数据库连接成功')
    
    const analyses = await FlowAnalysis.findAll({
      where: { flow_file_id: 14 },
      attributes: ['id', 'user_identifier', 'created_at'],
      order: [['created_at', 'DESC']]
    })
    
    console.log(`\n文件ID 14 的所有分析结果:`)
    console.log(`分析结果数量: ${analyses.length}`)
    
    analyses.forEach((analysis, index) => {
      console.log(`\n${index + 1}. ID: ${analysis.id}`)
      console.log(`   用户标识: ${analysis.user_identifier}`)
      console.log(`   创建时间: ${analysis.created_at}`)
    })
    
  } catch (error) {
    console.error('查询失败:', error.message)
  } finally {
    await sequelize.close()
  }
}

checkAllAnalysis()