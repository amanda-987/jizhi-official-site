import express from 'express'
import flowFilesRouter from './flowFiles.js'
import flowAnalysisRouter from './flowAnalysis.js'
import legalDocumentsRouter from './legalDocuments.js'

const router = express.Router()

router.use('/flow-files', flowFilesRouter)
router.use('/flow-analysis', flowAnalysisRouter)
router.use('/legal-documents', legalDocumentsRouter)

export default router
