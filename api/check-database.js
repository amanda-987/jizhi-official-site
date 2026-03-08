import FlowAnalysis from './src/models/FlowAnalysis.js'

async function checkAnalysisData() {
  try {
    console.log('查询文件ID 18的所有分析记录...')
    
    const results = await FlowAnalysis.findAll({
      where: { flow_file_id: 18 },
      raw: true
    })

    console.log(`\n文件ID 18的所有分析记录（共${results.length}条）:`)
    results.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id}, 用户: ${row.user_identifier}, 创建时间: ${row.created_at}`)
    })

    if (results.length > 2) {
      console.log(`\n警告：发现${results.length}条记录，应该只有2条`)
    }

    console.log('\n操作完成')
  } catch (error) {
    console.error('操作失败:', error)
    process.exit(1)
  }
}

checkAnalysisData()