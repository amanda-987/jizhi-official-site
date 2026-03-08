// 清理重复的分析记录
import mysql from 'mysql2/promise'

async function cleanDuplicateRecords() {
  let connection
  
  try {
    connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'jizhi_db'
    })

    console.log('连接数据库成功')

    // 找出重复记录
    const [duplicates] = await connection.execute(`
      SELECT flow_file_id, user_identifier, COUNT(*) as count
      FROM flow_analysis
      GROUP BY flow_file_id, user_identifier
      HAVING COUNT(*) > 1
    `)

    if (duplicates.length === 0) {
      console.log('没有发现重复记录')
      return
    }

    console.log(`发现 ${duplicates.length} 组重复记录`)

    // 清理每组重复记录，保留最新的一条
    for (const duplicate of duplicates) {
      const { flow_file_id, user_identifier } = duplicate
      
      // 获取该组的所有记录ID，按ID降序排列
      const [records] = await connection.execute(`
        SELECT id FROM flow_analysis
        WHERE flow_file_id = ? AND user_identifier = ?
        ORDER BY id DESC
      `, [flow_file_id, user_identifier])

      // 保留第一条，删除其余的
      if (records.length > 1) {
        const idsToDelete = records.slice(1).map(record => record.id)
        
        if (idsToDelete.length > 0) {
          await connection.execute(`
            DELETE FROM flow_analysis WHERE id IN (?)
          `, [idsToDelete])
          
          console.log(`清理了 ${idsToDelete.length} 条重复记录: ${user_identifier} (文件ID: ${flow_file_id})`)
        }
      }
    }

    console.log('清理完成')

  } catch (error) {
    console.error('清理失败:', error)
  } finally {
    if (connection) {
      await connection.end()
    }
  }
}

cleanDuplicateRecords()