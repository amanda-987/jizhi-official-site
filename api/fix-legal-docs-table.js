import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

async function fixLegalDocumentsTable() {
  try {
    const sequelize = new Sequelize({
      database: process.env.DB_NAME,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      dialect: 'mysql',
      logging: false
    })

    console.log('=== 修复legal_documents表结构 ===\n')

    console.log('1. 检查当前表结构...')
    const [columns] = await sequelize.query('DESCRIBE legal_documents')
    const currentFields = columns.map(col => col.Field)
    console.log('当前字段:', currentFields)

    console.log('\n2. 删除旧字段...')
    const fieldsToRemove = ['document_name', 'document_path', 'status', 'error_message']
    for (const field of fieldsToRemove) {
      if (currentFields.includes(field)) {
        try {
          await sequelize.query(`ALTER TABLE legal_documents DROP COLUMN ${field}`)
          console.log(`  ✓ 删除字段: ${field}`)
        } catch (error) {
          console.log(`  - 字段 ${field} 不存在或删除失败`)
        }
      }
    }

    console.log('\n3. 添加新字段...')
    const fieldsToAdd = [
      { name: 'case_number', sql: 'VARCHAR(100)' },
      { name: 'plaintiff', sql: 'VARCHAR(100)' },
      { name: 'defendant', sql: 'VARCHAR(100)' },
      { name: 'court', sql: 'VARCHAR(100)' },
      { name: 'investigation_target', sql: 'VARCHAR(50)' },
      { name: 'file_path', sql: 'VARCHAR(500)' }
    ]

    const [newColumns] = await sequelize.query('DESCRIBE legal_documents')
    const newFields = newColumns.map(col => col.Field)

    for (const field of fieldsToAdd) {
      if (!newFields.includes(field.name)) {
        try {
          await sequelize.query(`ALTER TABLE legal_documents ADD COLUMN ${field.name} ${field.sql}`)
          console.log(`  ✓ 添加字段: ${field.name}`)
        } catch (error) {
          console.log(`  - 字段 ${field.name} 已存在或添加失败`)
        }
      } else {
        console.log(`  - 字段 ${field.name} 已存在`)
      }
    }

    console.log('\n4. 更新document_type字段类型...')
    try {
      await sequelize.query(`
        ALTER TABLE legal_documents 
        MODIFY COLUMN document_type ENUM('investigation_order', 'seizure_freeze', 'detention_fine', 'police_transfer') NOT NULL
      `)
      console.log('  ✓ document_type字段类型更新成功')
    } catch (error) {
      console.log('  - document_type字段类型更新失败:', error.message)
    }

    console.log('\n5. 验证最终表结构...')
    const [finalColumns] = await sequelize.query('DESCRIBE legal_documents')
    console.log('最终字段:')
    finalColumns.forEach(col => {
      console.log(`  ${col.Field} - ${col.Type} - ${col.Null} - ${col.Key}`)
    })

    await sequelize.close()

    console.log('\n=== 表结构修复完成 ===')

  } catch (error) {
    console.error('修复失败:', error.message)
  }
}

fixLegalDocumentsTable()
