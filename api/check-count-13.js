import sequelize from './src/config/database.js'
import FlowAnalysis from './src/models/FlowAnalysis.js'

async function checkAnalysisCount() {
  try {
    await sequelize.authenticate()
    console.log('数据库连接成功')
    
    const count = await FlowAnalysis.count({
      where: { flow_file_id: 13 }
    })
    
    console.log(`\n文件ID 13 的分析结果数量: ${count}`)
    
    const analyses = await FlowAnalysis.findAll({
      where: { flow_file_id: 13 },
      attributes: ['id', 'user_identifier', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: 10
    })
    
    console.log(`\n前10条分析结果:`)
    analyses.forEach((analysis, index) => {
      console.log(`${index + 1}. ID: ${analysis.id}, 用户标识: ${analysis.user_identifier}, 创建时间: ${analysis.created_at}`)
    })
    
  } catch (error) {
    console.error('查询失败:', error.message)
  } finally {
    await sequelize.close()
  }
}

checkAnalysisCount()