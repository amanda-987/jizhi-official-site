<template>
  <div class="legal-documents">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>法律文书生成</span>
          <el-button type="primary" @click="showGenerateDialog = true">
            <el-icon><Document /></el-icon>
            生成文书
          </el-button>
        </div>
      </template>

      <el-table :data="documents" stripe v-loading="loading">
        <el-table-column prop="document_type" label="文书类型" width="180">
          <template #default="{ row }">
            {{ getDocumentTypeText(row.document_type) }}
          </template>
        </el-table-column>
        <el-table-column prop="case_number" label="案号" min-width="150" />
        <el-table-column prop="plaintiff" label="申请人" width="120" />
        <el-table-column prop="defendant" label="被执行人" width="120" />
        <el-table-column prop="court" label="法院" width="150" />
        <el-table-column prop="created_at" label="生成时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="viewDocument(row)">
              查看
            </el-button>
            <el-button type="success" size="small" @click="downloadDocument(row.id)">
              下载
            </el-button>
            <el-button type="danger" size="small" @click="deleteDocument(row.id)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="showGenerateDialog" title="生成法律文书" width="600px">
      <el-form :model="generateForm" label-width="120px">
        <el-form-item label="文书类型">
          <el-select v-model="generateForm.documentType" placeholder="请选择文书类型">
            <el-option label="调查令申请书" value="investigation_order" />
            <el-option label="查封、冻结申请书" value="seizure_freeze" />
            <el-option label="拘留、罚款申请书" value="detention_fine" />
            <el-option label="移送公安机关申请书" value="police_transfer" />
          </el-select>
        </el-form-item>

        <el-form-item label="上传裁判文书">
          <el-upload
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
            accept=".doc,.docx,.pdf"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持 .doc, .docx, .pdf 格式</div>
            </template>
          </el-upload>
        </el-form-item>

        <el-divider>或手动填写信息</el-divider>

        <el-form-item label="案号">
          <el-input v-model="generateForm.caseNumber" placeholder="请输入案号" />
        </el-form-item>

        <el-form-item label="申请人">
          <el-input v-model="generateForm.plaintiff" placeholder="请输入申请人" />
        </el-form-item>

        <el-form-item label="被执行人">
          <el-input v-model="generateForm.defendant" placeholder="请输入被执行人" />
        </el-form-item>

        <el-form-item label="法院">
          <el-input v-model="generateForm.court" placeholder="请输入法院名称" />
        </el-form-item>

        <el-form-item label="调查对象" v-if="generateForm.documentType === 'investigation_order'">
          <el-radio-group v-model="generateForm.investigationTarget">
            <el-radio label="银行流水">银行流水</el-radio>
            <el-radio label="微信">微信</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showGenerateDialog = false">取消</el-button>
        <el-button type="primary" @click="handleGenerate" :loading="generating">生成</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="showViewDialog" title="查看文书" width="80%" top="5vh">
      <div class="document-content" v-if="currentDocument">
        <pre>{{ currentDocument.document_content }}</pre>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { legalDocumentApi } from '@/api'

const loading = ref(false)
const generating = ref(false)
const showGenerateDialog = ref(false)
const showViewDialog = ref(false)

const documents = ref([])
const currentDocument = ref<any>(null)

const generateForm = ref({
  documentType: 'investigation_order',
  caseNumber: '',
  plaintiff: '',
  defendant: '',
  court: '',
  investigationTarget: '银行流水',
  uploadedFile: null as File | null
})

const loadDocuments = async () => {
  loading.value = true
  try {
    const res = await legalDocumentApi.getAll()
    if (res.code === 200) {
      documents.value = res.data
    }
  } catch (error) {
    ElMessage.error('加载文书列表失败')
  } finally {
    loading.value = false
  }
}

const handleFileChange = (file: any) => {
  generateForm.value.uploadedFile = file.raw
}

const handleGenerate = async () => {
  if (!generateForm.value.documentType) {
    ElMessage.warning('请选择文书类型')
    return
  }

  generating.value = true
  try {
    const data: any = {
      documentType: generateForm.value.documentType,
      caseNumber: generateForm.value.caseNumber,
      plaintiff: generateForm.value.plaintiff,
      defendant: generateForm.value.defendant,
      court: generateForm.value.court,
      investigationTarget: generateForm.value.investigationTarget
    }

    if (generateForm.value.uploadedFile) {
      const reader = new FileReader()
      reader.onload = async (e) => {
        data.uploadedFile = e.target?.result as string
        await generateDocument(data)
      }
      reader.readAsDataURL(generateForm.value.uploadedFile)
    } else {
      await generateDocument(data)
    }
  } catch (error) {
    ElMessage.error('生成失败')
  } finally {
    generating.value = false
  }
}

const generateDocument = async (data: any) => {
  try {
    const res = await legalDocumentApi.generate(data)
    if (res.code === 200) {
      ElMessage.success('生成成功')
      showGenerateDialog.value = false
      resetForm()
      loadDocuments()
    }
  } catch (error) {
    ElMessage.error('生成失败')
  }
}

const viewDocument = async (document: any) => {
  currentDocument.value = document
  showViewDialog.value = true
}

const downloadDocument = (id: number) => {
  const url = legalDocumentApi.download(id)
  window.open(url, '_blank')
}

const deleteDocument = async (id: number) => {
  try {
    await legalDocumentApi.delete(id)
    ElMessage.success('删除成功')
    loadDocuments()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

const resetForm = () => {
  generateForm.value = {
    documentType: 'investigation_order',
    caseNumber: '',
    plaintiff: '',
    defendant: '',
    court: '',
    investigationTarget: '银行流水',
    uploadedFile: null
  }
}

const getDocumentTypeText = (type: string) => {
  const texts: Record<string, string> = {
    investigation_order: '调查令申请书',
    seizure_freeze: '查封、冻结申请书',
    detention_fine: '拘留、罚款申请书',
    police_transfer: '移送公安机关申请书'
  }
  return texts[type] || type
}

onMounted(() => {
  loadDocuments()
})
</script>

<style scoped>
.legal-documents {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.document-content {
  max-height: 70vh;
  overflow-y: auto;
  padding: 20px;
  background: #f5f5f5;
  border-radius: 4px;
}

.document-content pre {
  white-space: pre-wrap;
  word-wrap: break-word;
  font-family: 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  line-height: 1.8;
}
</style>
