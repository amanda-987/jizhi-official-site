import express from 'express'
import mammoth from 'mammoth'
import pdf from 'pdf-parse'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import LegalDocument from '../models/LegalDocument.js'

const router = express.Router()

router.post('/generate', async (req, res) => {
  try {
    const { documentType, caseNumber, plaintiff, defendant, court, investigationTarget, uploadedFile } = req.body

    let caseInfo = {
      caseNumber,
      plaintiff,
      defendant,
      court,
      investigationTarget
    }

    if (uploadedFile) {
      const parsedInfo = await parseUploadedFile(uploadedFile)
      caseInfo = { ...caseInfo, ...parsedInfo }
    }

    const documentContent = generateDocumentContent(documentType, caseInfo)
    const fileName = `${documentType}_${uuidv4()}.docx`
    const filePath = path.join(__dirname, '../../generated-docs', fileName)

    await generateWordDocument(documentContent, filePath)

    const legalDocument = await LegalDocument.create({
      document_type: documentType,
      case_number: caseInfo.caseNumber,
      plaintiff: caseInfo.plaintiff,
      defendant: caseInfo.defendant,
      court: caseInfo.court,
      investigation_target: caseInfo.investigationTarget,
      document_content: documentContent,
      file_path: filePath
    })

    res.json({
      code: 200,
      message: '文书生成成功',
      data: legalDocument
    })
  } catch (error) {
    console.error('文书生成失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '文书生成失败',
      data: null
    })
  }
})

router.get('/', async (req, res) => {
  try {
    const documents = await LegalDocument.findAll({
      order: [['created_at', 'DESC']]
    })

    res.json({
      code: 200,
      message: '获取成功',
      data: documents
    })
  } catch (error) {
    console.error('获取文书列表失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取失败',
      data: null
    })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const document = await LegalDocument.findByPk(id)

    if (!document) {
      return res.status(404).json({
        code: 404,
        message: '文书不存在',
        data: null
      })
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: document
    })
  } catch (error) {
    console.error('获取文书失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取失败',
      data: null
    })
  }
})

router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params
    const document = await LegalDocument.findByPk(id)

    if (!document || !document.file_path) {
      return res.status(404).json({
        code: 404,
        message: '文件不存在',
        data: null
      })
    }

    if (!fs.existsSync(document.file_path)) {
      return res.status(404).json({
        code: 404,
        message: '文件不存在',
        data: null
      })
    }

    res.download(document.file_path)
  } catch (error) {
    console.error('下载文书失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '下载失败',
      data: null
    })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const document = await LegalDocument.findByPk(id)

    if (document && document.file_path && fs.existsSync(document.file_path)) {
      fs.unlinkSync(document.file_path)
    }

    await LegalDocument.destroy({ where: { id } })

    res.json({
      code: 200,
      message: '删除成功',
      data: null
    })
  } catch (error) {
    console.error('删除文书失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '删除失败',
      data: null
    })
  }
})

async function parseUploadedFile(fileContent) {
  try {
    if (fileContent.endsWith('.pdf')) {
      const data = await pdf(fileContent)
      const text = data.text
      return extractCaseInfo(text)
    } else if (fileContent.endsWith('.docx')) {
      const result = await mammoth.extractRawText({ buffer: Buffer.from(fileContent) })
      const text = result.value
      return extractCaseInfo(text)
    }
    return {}
  } catch (error) {
    console.error('解析文件失败:', error)
    return {}
  }
}

function extractCaseInfo(text) {
  const caseNumberMatch = text.match(/案号[：:]\s*([^\s\n]+)/)
  const plaintiffMatch = text.match(/申请人[：:]\s*([^\s\n]+)/)
  const defendantMatch = text.match(/被执行人[：:]\s*([^\s\n]+)/)
  const courtMatch = text.match(/法院[：:]\s*([^\s\n]+)/)

  return {
    caseNumber: caseNumberMatch ? caseNumberMatch[1] : '',
    plaintiff: plaintiffMatch ? plaintiffMatch[1] : '',
    defendant: defendantMatch ? defendantMatch[1] : '',
    court: courtMatch ? courtMatch[1] : ''
  }
}

function generateDocumentContent(documentType, caseInfo) {
  const templates = {
    investigation_order: `调查令申请书

申请人：${caseInfo.plaintiff || '__________'}
被执行人：${caseInfo.defendant || '__________'}
案号：${caseInfo.caseNumber || '__________'}
法院：${caseInfo.court || '__________'}

申请事项：
请求法院向${caseInfo.investigationTarget || '__________'}调查被执行人的财产状况。

事实与理由：
申请人与被执行人因执行纠纷一案，贵院已立案受理。为查明被执行人的财产状况，特申请法院向${caseInfo.investigationTarget || '__________'}调查被执行人的银行流水、微信支付记录等财产信息。

此致
${caseInfo.court || '__________'}

申请人：${caseInfo.plaintiff || '__________'}
日期：${new Date().toLocaleDateString('zh-CN')}`,

    seizure_freeze: `查封、冻结申请书

申请人：${caseInfo.plaintiff || '__________'}
被执行人：${caseInfo.defendant || '__________'}
案号：${caseInfo.caseNumber || '__________'}
法院：${caseInfo.court || '__________'}

申请事项：
请求法院立即查封、冻结被执行人的银行账户、房产、车辆等财产。

事实与理由：
被执行人未履行生效法律文书确定的义务，为防止被执行人转移财产，特申请法院立即采取查封、冻结措施。

此致
${caseInfo.court || '__________'}

申请人：${caseInfo.plaintiff || '__________'}
日期：${new Date().toLocaleDateString('zh-CN')}`,

    detention_fine: `对被执行人予以司法拘留或罚款申请书

申请人：${caseInfo.plaintiff || '__________'}
被执行人：${caseInfo.defendant || '__________'}
案号：${caseInfo.caseNumber || '__________'}
法院：${caseInfo.court || '__________'}

申请事项：
请求法院对被执行人予以司法拘留或罚款。

事实与理由：
被执行人有能力履行而拒不履行生效法律文书确定的义务，情节严重，符合《民事诉讼法》第一百一十一条的规定，特申请法院对被执行人予以司法拘留或罚款。

此致
${caseInfo.court || '__________'}

申请人：${caseInfo.plaintiff || '__________'}
日期：${new Date().toLocaleDateString('zh-CN')}`,

    police_transfer: `请求移送公安机关立案侦查申请书

申请人：${caseInfo.plaintiff || '__________'}
被执行人：${caseInfo.defendant || '__________'}
案号：${caseInfo.caseNumber || '__________'}
法院：${caseInfo.court || '__________'}

申请事项：
请求法院将本案移送公安机关立案侦查。

事实与理由：
被执行人在执行过程中存在转移财产、虚构债务等行为，涉嫌拒不执行判决、裁定罪，特申请法院将本案移送公安机关立案侦查。

此致
${caseInfo.court || '__________'}

申请人：${caseInfo.plaintiff || '__________'}
日期：${new Date().toLocaleDateString('zh-CN')}`
  }

  return templates[documentType] || ''
}

async function generateWordDocument(content, filePath) {
  const template = `
    <w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
      <w:body>
        <w:p>
          <w:r>
            <w:t>${content.replace(/\n/g, '</w:t></w:r></w:p><w:p><w:r><w:t>')}</w:t>
          </w:r>
        </w:p>
      </w:body>
    </w:document>
  `

  const dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }

  fs.writeFileSync(filePath, template)
}

export default router
