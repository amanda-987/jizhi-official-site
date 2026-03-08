import FlowAnalysis from './src/models/FlowAnalysis.js'

async function cleanDuplicateAnalysis() {
  try {
    console.log('查询文件ID 18的所有分析记录...')
    
    const results = await FlowAnalysis.findAll({
      where: { flow_file_id: 18 },
      raw: true
    })

    results.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

    console.log('\n文件ID 18的所有分析记录:')
    results.forEach((row, index) => {
      console.log(`${index + 1}. ID: ${row.id}, 用户: ${row.user_identifier}, 创建时间: ${row.created_at}`)
    })

    if (results.length > 2) {
      const idsToDelete = results.slice(2).map(row => row.id)
      console.log(`\n将删除 ${idsToDelete.length} 条旧记录，ID: ${idsToDelete.join(', ')}`)

      await FlowAnalysis.destroy({
        where: {
          id: idsToDelete
        }
      })

      console.log('删除成功')
    } else {
      console.log('\n没有需要删除的重复记录')
    }

    console.log('\n操作完成')
  } catch (error) {
    console.error('操作失败:', error)
    process.exit(1)
  }
}

cleanDuplicateAnalysis()