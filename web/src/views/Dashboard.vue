<template>
  <div class="dashboard">
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #409EFF">
              <el-icon :size="32" color="#fff"><DataAnalysis /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.flowAnalysisCount }}</div>
              <div class="stat-label">流水分析</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #67C23A">
              <el-icon :size="32" color="#fff"><Document /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.legalDocCount }}</div>
              <div class="stat-label">法律文书</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="stat-card">
          <div class="stat-content">
            <div class="stat-icon" style="background: #E6A23C">
              <el-icon :size="32" color="#fff"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-value">{{ stats.totalHistoryCount }}</div>
              <div class="stat-label">历史记录</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" size="large" @click="goToFlowAnalysis">
              <el-icon><Upload /></el-icon>
              上传流水文件
            </el-button>
            <el-button type="success" size="large" @click="goToLegalDocuments">
              <el-icon><Document /></el-icon>
              生成法律文书
            </el-button>
          </div>
        </el-card>
      </el-col>
      <el-col :span="12">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近操作</span>
            </div>
          </template>
          <el-timeline>
            <el-timeline-item
              v-for="item in recentActivities"
              :key="item.id"
              :timestamp="item.time"
              placement="top"
            >
              {{ item.description }}
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { flowFileApi, legalDocumentApi } from '@/api'

const router = useRouter()

const stats = ref({
  flowAnalysisCount: 0,
  legalDocCount: 0,
  totalHistoryCount: 0
})

const recentActivities = ref([
  {
    id: 1,
    time: '2024-01-15 10:30',
    description: '上传了流水文件：和智贤微信流水.xlsx'
  },
  {
    id: 2,
    time: '2024-01-15 09:15',
    description: '生成了调查令申请书'
  },
  {
    id: 3,
    time: '2024-01-14 16:45',
    description: '完成了流水分析报告'
  }
])

const loadStats = async () => {
  try {
    const [flowFilesRes, legalDocsRes] = await Promise.all([
      flowFileApi.getAll(),
      legalDocumentApi.getAll()
    ])

    if (flowFilesRes.code === 200) {
      stats.value.flowAnalysisCount = flowFilesRes.data.length
    }

    if (legalDocsRes.code === 200) {
      stats.value.legalDocCount = legalDocsRes.data.length
    }

    stats.value.totalHistoryCount = stats.value.flowAnalysisCount + stats.value.legalDocCount
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const goToFlowAnalysis = () => {
  router.push('/flow-analysis')
}

const goToLegalDocuments = () => {
  router.push('/legal-documents')
}

onMounted(() => {
  loadStats()
})
</script>

<style scoped>
.dashboard {
  padding: 20px;
}

.stat-card {
  cursor: pointer;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-content {
  display: flex;
  align-items: center;
  gap: 20px;
}

.stat-icon {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #303133;
  line-height: 1;
}

.stat-label {
  font-size: 14px;
  color: #909399;
  margin-top: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: bold;
}

.quick-actions {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.quick-actions .el-button {
  height: 50px;
  font-size: 16px;
}
</style>
