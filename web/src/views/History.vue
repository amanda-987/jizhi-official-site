<template>
  <div class="history">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>历史记录</span>
          <el-radio-group v-model="filterType" @change="loadHistory">
            <el-radio-button label="all">全部</el-radio-button>
            <el-radio-button label="flow_analysis">流水分析</el-radio-button>
            <el-radio-button label="legal_document">法律文书</el-radio-button>
          </el-radio-group>
        </div>
      </template>

      <el-timeline v-loading="loading">
        <el-timeline-item
          v-for="item in filteredHistory"
          :key="item.id"
          :timestamp="item.created_at"
          placement="top"
          :type="item.type === 'flow_analysis' ? 'primary' : 'success'"
        >
          <el-card>
            <div class="history-item">
              <div class="item-header">
                <el-tag :type="item.type === 'flow_analysis' ? 'primary' : 'success'">
                  {{ item.type === 'flow_analysis' ? '流水分析' : '法律文书' }}
                </el-tag>
                <span class="item-title">{{ item.title }}</span>
              </div>
              <div class="item-description">{{ item.description }}</div>
              <div class="item-actions">
                <el-button type="primary" size="small" @click="viewItem(item)">
                  查看
                </el-button>
                <el-button type="success" size="small" @click="downloadItem(item)" v-if="item.file_path">
                  下载
                </el-button>
              </div>
            </div>
          </el-card>
        </el-timeline-item>
      </el-timeline>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { flowFileApi, legalDocumentApi } from '@/api'

const loading = ref(false)
const filterType = ref('all')

const flowFiles = ref([])
const legalDocuments = ref([])

const allHistory = computed(() => {
  const items: any[] = []

  flowFiles.value.forEach((file: any) => {
    items.push({
      id: `flow_${file.id}`,
      type: 'flow_analysis',
      title: file.file_name,
      description: `流水来源：${file.flow_source} | 状态：${getStatusText(file.status)}`,
      file_path: file.file_path,
      created_at: file.created_at,
      data: file
    })
  })

  legalDocuments.value.forEach((doc: any) => {
    items.push({
      id: `legal_${doc.id}`,
      type: 'legal_document',
      title: getDocumentTypeText(doc.document_type),
      description: `案号：${doc.case_number || '未填写'} | 申请人：${doc.plaintiff || '未填写'}`,
      file_path: doc.file_path,
      created_at: doc.created_at,
      data: doc
    })
  })

  return items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
})

const filteredHistory = computed(() => {
  if (filterType.value === 'all') {
    return allHistory.value
  }
  return allHistory.value.filter(item => item.type === filterType.value)
})

const loadHistory = async () => {
  loading.value = true
  try {
    const [flowRes, legalRes] = await Promise.all([
      flowFileApi.getAll(),
      legalDocumentApi.getAll()
    ])

    if (flowRes.code === 200) {
      flowFiles.value = flowRes.data
    }

    if (legalRes.code === 200) {
      legalDocuments.value = legalRes.data
    }
  } catch (error) {
    ElMessage.error('加载历史记录失败')
  } finally {
    loading.value = false
  }
}

const viewItem = (item: any) => {
  if (item.type === 'flow_analysis') {
    ElMessage.info('请在流水分析页面查看详细信息')
  } else {
    ElMessage.info('请在法律文书页面查看详细信息')
  }
}

const downloadItem = (item: any) => {
  if (item.type === 'flow_analysis') {
    ElMessage.info('请在流水分析页面下载分析报告')
  } else {
    const url = legalDocumentApi.download(item.data.id)
    window.open(url, '_blank')
  }
}

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    completed: '已完成',
    failed: '失败'
  }
  return texts[status] || status
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
  loadHistory()
})
</script>

<style scoped>
.history {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.history-item {
  padding: 10px;
}

.item-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.item-title {
  font-weight: bold;
  font-size: 16px;
}

.item-description {
  color: #606266;
  margin-bottom: 10px;
  line-height: 1.6;
}

.item-actions {
  display: flex;
  gap: 10px;
}
</style>
