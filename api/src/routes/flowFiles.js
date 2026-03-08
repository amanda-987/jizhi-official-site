import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import { v4 as uuidv4 } from 'uuid'
import FlowFile from '../models/FlowFile.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads')
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const filename = `${uuidv4()}${ext}`
    cb(null, filename)
  }
})

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.xls', '.pdf', '.doc', '.docx', '.txt']
    const ext = path.extname(file.originalname).toLowerCase()
    if (allowedTypes.includes(ext)) {
      cb(null, true)
    } else {
      cb(new Error('不支持的文件格式'))
    }
  }
})

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        code: 400,
        message: '请上传文件',
        data: null
      })
    }

    const { flowSource } = req.body

    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8')

    const flowFile = await FlowFile.create({
      file_name: originalName,
      file_type: path.extname(originalName).substring(1),
      file_size: req.file.size,
      file_path: req.file.path,
      flow_source: flowSource || '其他',
      status: 'pending'
    })

    res.json({
      code: 200,
      message: '文件上传成功',
      data: flowFile
    })
  } catch (error) {
    console.error('文件上传失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '文件上传失败',
      data: null
    })
  }
})

router.get('/', async (req, res) => {
  try {
    const flowFiles = await FlowFile.findAll({
      order: [['created_at', 'DESC']]
    })

    res.json({
      code: 200,
      message: '获取成功',
      data: flowFiles
    })
  } catch (error) {
    console.error('获取流水文件列表失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '获取失败',
      data: null
    })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    await FlowFile.destroy({ where: { id } })

    res.json({
      code: 200,
      message: '删除成功',
      data: null
    })
  } catch (error) {
    console.error('删除流水文件失败:', error)
    res.status(500).json({
      code: 500,
      message: error.message || '删除失败',
      data: null
    })
  }
})

export default router
