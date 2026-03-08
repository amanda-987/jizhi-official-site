import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const vueFilePath = join(__dirname, 'web/src/views/FlowAnalysis.vue')

try {
  const content = readFileSync(vueFilePath, 'utf-8')
  console.log('Vue文件语法检查:\n')

  const templateStart = content.indexOf('<template>')
  const templateEnd = content.indexOf('</template>')
  const scriptStart = content.indexOf('<script')
  const scriptEnd = content.indexOf('</script>')
  const styleStart = content.indexOf('<style')
  const styleEnd = content.indexOf('</style>')

  console.log('✓ 模板标签:', templateStart !== -1 && templateEnd !== -1 ? '存在' : '缺失')
  console.log('✓ 脚本标签:', scriptStart !== -1 && scriptEnd !== -1 ? '存在' : '缺失')
  console.log('✓ 样式标签:', styleStart !== -1 && styleEnd !== -1 ? '存在' : '缺失')

  if (templateStart !== -1 && templateEnd !== -1) {
    const templateContent = content.substring(templateStart, templateEnd + 10)
    console.log('✓ 模板内容长度:', templateContent.length, '字符')
  }

  if (scriptStart !== -1 && scriptEnd !== -1) {
    const scriptContent = content.substring(scriptStart, scriptEnd + 9)
    console.log('✓ 脚本内容长度:', scriptContent.length, '字符')
  }

  if (styleStart !== -1 && styleEnd !== -1) {
    const styleContent = content.substring(styleStart, styleEnd + 8)
    console.log('✓ 样式内容长度:', styleContent.length, '字符')
  }

  const bracketCount = (content.match(/\{/g) || []).length
  const closeBracketCount = (content.match(/\}/g) || []).length

  console.log('✓ 花括号: {', bracketCount, '} ', closeBracketCount)
  if (bracketCount !== closeBracketCount) {
    console.log('✗ 警告: 花括号不匹配')
  }

  const templateBrackets = (content.substring(templateStart, templateEnd).match(/\{\{/g) || []).length
  const templateCloseBrackets = (content.substring(templateStart, templateEnd).match(/\}\}/g) || []).length

  console.log('✓ 模板插值: {{', templateBrackets, '}} ', templateCloseBrackets)
  if (templateBrackets !== templateCloseBrackets) {
    console.log('✗ 警告: 模板插值不匹配')
  }

  console.log('\n✓ 文件结构完整')

} catch (error) {
  console.error('✗ 文件检查失败:', error.message)
}
