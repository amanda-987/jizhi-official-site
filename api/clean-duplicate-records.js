// 清理重复的分析记录
import { sequelize } from './src/config/database.js'
import FlowAnalysis from './src/models/FlowAnalysis.js'

async function cleanDuplicateRecords() {
  try {
    console.log('清理重复的分析记录...')

    // 按flow_file_id和user_identifier分组，找出重复的记录
    const duplicateRecords = await sequelize.query(`
      SELECT flow_file_id, user_identifier, COUNT(*) as count
      FROM flow_analysis
      GROUP BY flow_file_id, user_identifier
      HAVING COUNT(*) > 1
    `, { type: sequelize.QueryTypes.SELECT })

    if (duplicateRecords.length === 0) {
      console.log('没有发现重复记录')
      return
    }

    console.log(`发现 ${duplicateRecords.length} 组重复记录`)

    // 对于每组重复记录，保留最新的一条，删除其余的
    for (const record of duplicateRecords) {
      const { flow_file_id, user_identifier } = record
      
      // 获取该组的所有记录，按id降序排列
      const records = await FlowAnalysis.findAll({
        where: {
          flow_file_id,
          user_identifier
        },
        order: [['id', 'DESC']]
      })

      // 保留第一条（最新的），删除其余的
      if (records.length > 1) {
        const recordsToDelete = records.slice(1)
        for (const recordToDelete of recordsToDelete) {
          await recordToDelete.destroy()
        }
        console.log(`清理了 ${recordsToDelete.length} 条重复记录: ${user_identifier} (文件ID: ${flow_file_id})`)
      }
    }

    console.log('清理完成')
  } catch (error) {
    console.error('清理失败:', error)
  } finally {
    await sequelize.close()
  }
}

cleanDuplicateRecords()