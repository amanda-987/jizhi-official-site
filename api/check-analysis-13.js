import sequelize from './src/config/database.js'
import FlowAnalysis from './src/models/FlowAnalysis.js'

async function checkAnalysisResults() {
  try {
    await sequelize.authenticate()
    console.log('数据库连接成功')
    
    const analyses = await FlowAnalysis.findAll({
      where: { flow_file_id: 13 },
      order: [['created_at', 'DESC']]
    })
    
    console.log(`\n文件ID 13 的分析结果数量: ${analyses.length}`)
    analyses.forEach((analysis, index) => {
      console.log(`\n${index + 1}. 用户标识: ${analysis.user_identifier}`)
      console.log(`   车辆信息数量: ${analysis.vehicle_analysis?.length || 0}`)
      console.log(`   奢侈品数量: ${analysis.restricted_consumption?.luxury?.length || 0}`)
      console.log(`   银行卡数量: ${analysis.user_bank_card_analysis?.length || 0}`)
      
      if (analysis.vehicle_analysis && analysis.vehicle_analysis.length > 0) {
        console.log(`   车辆信息:`, JSON.stringify(analysis.vehicle_analysis, null, 2))
      }
      
      if (analysis.restricted_consumption && analysis.restricted_consumption.luxury && analysis.restricted_consumption.luxury.length > 0) {
        console.log(`   奢侈品信息:`, JSON.stringify(analysis.restricted_consumption.luxury, null, 2))
      }
    })
    
  } catch (error) {
    console.error('查询失败:', error.message)
  } finally {
    await sequelize.close()
  }
}

checkAnalysisResults()