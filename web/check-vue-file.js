import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const vueFilePath = join(__dirname, 'src/views/FlowAnalysis.vue')

try {
  const content = readFileSync(vueFilePath, 'utf-8')
  console.log('Vue文件检查:')
  console.log('✓ 文件读取成功')
  console.log('✓ 文件大小:', content.length, '字符')
  
  const templateMatch = content.match(/<template>/)
  const scriptMatch = content.match(/<script/)
  const styleMatch = content.match(/<style/)
  
  console.log('✓ 模板标签:', templateMatch ? '存在' : '缺失')
  console.log('✓ 脚本标签:', scriptMatch ? '存在' : '缺失')
  console.log('✓ 样式标签:', styleMatch ? '存在' : '缺失')
  
  const bracketCount = (content.match(/\{/g) || []).length
  const closeBracketCount = (content.match(/\}/g) || []).length
  
  console.log('✓ 花括号: {', bracketCount, '} ', closeBracketCount)
  if (bracketCount !== closeBracketCount) {
    console.log('✗ 警告: 花括号不匹配')
  }
  
  const templateStart = content.indexOf('<template>')
  const templateEnd = content.indexOf('</template>')
  const scriptStart = content.indexOf('<script')
  const scriptEnd = content.indexOf('</script>')
  
  if (templateStart !== -1 && templateEnd !== -1) {
    console.log('✓ 模板内容长度:', templateEnd - templateStart, '字符')
  }
  
  if (scriptStart !== -1 && scriptEnd !== -1) {
    console.log('✓ 脚本内容长度:', scriptEnd - scriptStart, '字符')
  }
  
} catch (error) {
  console.error('✗ 文件检查失败:', error.message)
}
