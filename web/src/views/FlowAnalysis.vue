<template>
  <div class="flow-analysis">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>流水智能分析</span>
          <el-button type="primary" @click="showUploadDialog = true">
            <el-icon><Upload /></el-icon>
            上传流水文件
          </el-button>
        </div>
      </template>

      <el-table :data="flowFiles" stripe v-loading="loading">
        <el-table-column prop="file_name" label="文件名" min-width="200">
          <template #default="{ row }">
            <span class="file-name-link" @click="openAnalysisResult(row)">
              {{ row.file_name }}
            </span>
          </template>
        </el-table-column>
        <el-table-column prop="file_type" label="类型" width="100" />
        <el-table-column prop="file_size" label="大小" width="120">
          <template #default="{ row }">{{ formatFileSize(row.file_size) }}</template>
        </el-table-column>
        <el-table-column prop="flow_source" label="来源" width="100" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{ getStatusText(row.status) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="上传时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="analyzeFlow(row.id)"
              :loading="analyzingFileId === row.id"
              :disabled="analyzingFileId === row.id"
            >
              {{ analyzingFileId === row.id ? '分析中...' : '分析' }}
            </el-button>
            <el-button type="danger" size="small" @click="deleteFlowFile(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 上传对话框 -->
    <el-dialog v-model="showUploadDialog" title="上传流水文件" width="600px">
      <el-form :model="uploadForm" label-width="100px">
        <el-form-item label="流水来源">
          <el-radio-group v-model="uploadForm.flowSource">
            <el-radio value="微信">微信</el-radio>
            <el-radio value="银行">银行</el-radio>
            <el-radio value="其他">其他</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="选择文件">
          <el-upload
            ref="uploadRef"
            :auto-upload="false"
            :on-change="handleFileChange"
            :limit="1"
            accept=".xlsx,.xls,.pdf,.doc,.docx,.txt"
          >
            <el-button type="primary">选择文件</el-button>
            <template #tip>
              <div class="el-upload__tip">支持 .xlsx, .xls, .pdf, .doc, .docx, .txt 格式，文件大小不超过 50MB</div>
            </template>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showUploadDialog = false">取消</el-button>
        <el-button type="primary" @click="handleUpload" :loading="uploading">上传</el-button>
      </template>
    </el-dialog>

    <!-- 分析结果对话框 -->
    <el-dialog v-model="showAnalysisDialog" title="分析结果" width="95%" top="3vh">
      <template #header>
        <div class="dialog-header">
          <span>极执网 - 流水分析结果</span>
          <el-button type="primary" size="small" @click="exportAnalysisReport">导出报告</el-button>
        </div>
      </template>
      
      <div v-if="hasAnalysisResults" class="analysis-content">
        <el-collapse v-model="activeCollapse" accordion>
          <el-collapse-item 
            v-for="(analysis, index) in analysisResults" 
            :key="analysis.id || index"
            :name="index"
          >
            <template #title>
              <div class="collapse-title">
                <span class="user-identifier">工作表 {{ index + 1 }}: {{ analysis.user_identifier || '未知用户' }}</span>
                <span class="analysis-summary">
                  车辆: {{ analysis.vehicle_analysis?.length || 0 }} | 
                  银行卡: {{ analysis.user_bank_card_analysis?.length || 0 }} | 
                  奢侈品: {{ analysis.restrictedConsumption?.luxury?.length || 0 }}
                </span>
              </div>
            </template>
            
            <el-tabs v-model="activeTabNames[index]" class="analysis-tabs">
              <!-- 汇总信息 -->
              <el-tab-pane label="汇总信息" name="summary">
                <div class="summary-section">
                  <h3 class="section-title">
                    🔍 汇总信息
                  </h3>
                  <div class="summary-grid">
                    <div class="summary-card">
                      <div class="summary-value">{{ analysis.summary?.totalTransactions || 0 }}</div>
                      <div class="summary-label">总交易笔数</div>
                    </div>
                    <div class="summary-card">
                      <div class="summary-value">{{ formatCurrency(analysis.summary?.totalAmount || 0) }}</div>
                      <div class="summary-label">总交易金额</div>
                    </div>
                    <div class="summary-card">
                      <div class="summary-value">{{ analysis.summary?.inTransactionCount || 0 }}</div>
                      <div class="summary-label">入账笔数</div>
                    </div>
                    <div class="summary-card">
                      <div class="summary-value">{{ formatCurrency(analysis.summary?.inTransactionAmount || 0) }}</div>
                      <div class="summary-label">入账金额</div>
                    </div>
                    <div class="summary-card">
                      <div class="summary-value">{{ analysis.summary?.outTransactionCount || 0 }}</div>
                      <div class="summary-label">出账笔数</div>
                    </div>
                    <div class="summary-card">
                      <div class="summary-value">{{ formatCurrency(analysis.summary?.outTransactionAmount || 0) }}</div>
                      <div class="summary-label">出账金额</div>
                    </div>
                    <div class="summary-card">
                      <div class="summary-value">{{ analysis.summary?.rechargeCount || 0 }}</div>
                      <div class="summary-label">充值笔数</div>
                    </div>
                    <div class="summary-card">
                      <div class="summary-value">{{ analysis.vehicle_analysis?.length || 0 }}</div>
                      <div class="summary-label">车辆数量</div>
                    </div>
                  </div>
                </div>
              </el-tab-pane>

              <!-- 用户名下手机号码 -->
              <el-tab-pane label="用户名下手机号码" name="recharge">
                <el-table :data="analysis.userPhoneAnalysis || []" stripe>
                  <el-table-column prop="phone" label="手机号码" />
                  <el-table-column prop="userName" label="用户名" />
                  <el-table-column prop="userId" label="用户ID" />
                  <el-table-column prop="amount" label="充值总金额">
                    <template #default="{ row }">
                      <span class="amount-text">{{ formatCurrency(row.amount) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="count" label="充值次数" />
                  <el-table-column prop="operator" label="运营商" />
                </el-table>
              </el-tab-pane>

              <!-- 用户名下银行卡 -->
              <el-tab-pane label="用户名下银行卡" name="bankCard">
                <div v-if="analysis.userBankCardAnalysis?.length > 0" class="stats-container">
                  <el-row :gutter="20">
                    <el-col :span="6">
                      <el-card shadow="hover">
                        <div class="stat-item">
                          <div class="stat-value">{{ analysis.userBankCardAnalysis.length }}</div>
                          <div class="stat-label">银行卡总数</div>
                        </div>
                      </el-card>
                    </el-col>
                    <el-col :span="6">
                      <el-card shadow="hover">
                        <div class="stat-item">
                          <div class="stat-value">{{ getTotalTransactionCount(analysis) }}</div>
                          <div class="stat-label">总交易次数</div>
                        </div>
                      </el-card>
                    </el-col>
                    <el-col :span="6">
                      <el-card shadow="hover">
                        <div class="stat-item">
                          <div class="stat-value in">{{ formatCurrency(getTotalInAmount(analysis)) }}</div>
                          <div class="stat-label">总入账金额</div>
                        </div>
                      </el-card>
                    </el-col>
                    <el-col :span="6">
                      <el-card shadow="hover">
                        <div class="stat-item">
                          <div class="stat-value out">{{ formatCurrency(getTotalOutAmount(analysis)) }}</div>
                          <div class="stat-label">总出账金额</div>
                        </div>
                      </el-card>
                    </el-col>
                  </el-row>
                </div>
                <el-table :data="analysis.userBankCardAnalysis || []" stripe>
                  <el-table-column prop="bank" label="银行" />
                  <el-table-column prop="account" label="账号" />
                  <el-table-column prop="userName" label="用户名" />
                  <el-table-column prop="userId" label="用户ID" />
                  <el-table-column prop="transactionCount" label="交易次数" />
                  <el-table-column prop="totalAmount" label="总金额">
                    <template #default="{ row }">
                      <span class="amount-text">{{ formatCurrency(row.totalAmount) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="inAmount" label="入账金额">
                    <template #default="{ row }">
                      <span class="amount-text in">{{ formatCurrency(row.inAmount) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="outAmount" label="出账金额">
                    <template #default="{ row }">
                      <span class="amount-text out">{{ formatCurrency(row.outAmount) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="firstTransactionTime" label="首次交易时间">
                    <template #default="{ row }">{{ formatDateTime(row.firstTransactionTime) }}</template>
                  </el-table-column>
                  <el-table-column prop="lastTransactionTime" label="最后交易时间">
                    <template #default="{ row }">{{ formatDateTime(row.lastTransactionTime) }}</template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <!-- 车辆信息关联 -->
              <el-tab-pane label="车辆信息关联" name="vehicle">
                <el-table :data="analysis.vehicleAnalysis || []" stripe>
                  <el-table-column prop="plateNumber" label="车牌号" />
                  <el-table-column prop="count" label="出现次数" />
                  <el-table-column prop="locations" label="关联地点">
                    <template #default="{ row }">{{ row.locations?.join(', ') || '无' }}</template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <!-- 高频交易对手 -->
              <el-tab-pane label="高频交易对手" name="counterparties">
                <el-table :data="analysis.highFrequencyCounterparties || []" stripe>
                  <el-table-column prop="name" label="对手方名称" />
                  <el-table-column prop="id" label="对手方ID" />
                  <el-table-column prop="bank" label="对手方银行" />
                  <el-table-column prop="account" label="对手方账号" />
                  <el-table-column prop="count" label="交易笔数" />
                  <el-table-column prop="totalAmount" label="交易总额">
                    <template #default="{ row }">
                      <span class="amount-text">{{ formatCurrency(row.totalAmount) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="inAmount" label="入账总额">
                    <template #default="{ row }">
                      <span class="amount-text in">{{ formatCurrency(row.inAmount) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="outAmount" label="出账总额">
                    <template #default="{ row }">
                      <span class="amount-text out">{{ formatCurrency(row.outAmount) }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>

              <!-- 限制消费行为 -->
              <el-tab-pane label="限制消费行为" name="consumption">
                <div class="restricted-consumption-section">
                  <h3 class="section-title danger">
                    ⚠️ 限制消费行为分析
                  </h3>
                  
                  <el-row :gutter="20">
                    <el-col :span="6" v-for="item in consumptionStats" :key="item.key">
                      <el-card shadow="hover" :style="{ background: item.gradient, color: 'white' }">
                        <div class="consumption-stat">
                          <div class="consumption-title">{{ item.title }}</div>
                          <div class="consumption-count">{{ getConsumptionCount(analysis, item.key) }}笔</div>
                          <div class="consumption-amount">{{ getConsumptionAmount(analysis, item.key) }}</div>
                        </div>
                      </el-card>
                    </el-col>
                  </el-row>
                  <el-row :gutter="20" style="margin-top: 20px;">
                    <el-col :span="8" v-for="item in secondaryConsumptionStats" :key="item.key">
                      <el-card shadow="hover" :style="{ background: item.gradient, color: 'white' }">
                        <div class="consumption-stat">
                          <div class="consumption-title">{{ item.title }}</div>
                          <div class="consumption-count">{{ getConsumptionCount(analysis, item.key) }}笔</div>
                          <div class="consumption-amount">{{ getConsumptionAmount(analysis, item.key) }}</div>
                        </div>
                      </el-card>
                    </el-col>
                  </el-row>
                  
                  <el-collapse v-model="consumptionActiveNames" style="margin-top: 20px;">
                    <el-collapse-item title="机票/高铁" name="flights" v-if="analysis.restrictedConsumption?.flights?.length > 0">
                      <h4 class="sub-section-title">
                        ✈️ 航班消费 ({{ analysis.restrictedConsumption.flights.length }}笔)
                      </h4>
                      <el-table :data="analysis.restrictedConsumption.flights" stripe class="restricted-table">
                        <el-table-column prop="time" label="时间" width="180">
                          <template #default="{ row }">{{ formatDateTime(row.time) }}</template>
                        </el-table-column>
                        <el-table-column prop="amount" label="金额" width="120">
                          <template #default="{ row }">
                            <span class="amount-text danger">{{ formatCurrency(row.amount) }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column prop="counterparty" label="对手方" />
                        <el-table-column prop="location" label="地点" />
                      </el-table>
                    </el-collapse-item>
                    <el-collapse-item title="宾馆/酒店" name="hotels" v-if="analysis.restrictedConsumption?.hotels?.length > 0">
                      <h4 class="sub-section-title">
                        🏨 宾馆/酒店 ({{ analysis.restrictedConsumption.hotels.length }}笔)
                      </h4>
                      <el-table :data="analysis.restrictedConsumption.hotels" stripe class="restricted-table">
                        <el-table-column prop="time" label="时间" width="180">
                          <template #default="{ row }">{{ formatDateTime(row.time) }}</template>
                        </el-table-column>
                        <el-table-column prop="amount" label="金额" width="120">
                          <template #default="{ row }">
                            <span class="amount-text danger">{{ formatCurrency(row.amount) }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column prop="location" label="酒店名称" />
                        <el-table-column prop="counterparty" label="对手方" />
                      </el-table>
                    </el-collapse-item>
                    <el-collapse-item title="娱乐场所" name="entertainment" v-if="analysis.restrictedConsumption?.entertainment?.length > 0">
                      <h4 class="sub-section-title">
                        🎬 娱乐场所 ({{ analysis.restrictedConsumption.entertainment.length }}笔)
                      </h4>
                      <el-table :data="analysis.restrictedConsumption.entertainment" stripe class="restricted-table">
                        <el-table-column prop="time" label="时间" width="180">
                          <template #default="{ row }">{{ formatDateTime(row.time) }}</template>
                        </el-table-column>
                        <el-table-column prop="amount" label="金额" width="120">
                          <template #default="{ row }">
                            <span class="amount-text danger">{{ formatCurrency(row.amount) }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column prop="location" label="消费场所" />
                        <el-table-column prop="counterparty" label="备注" />
                      </el-table>
                    </el-collapse-item>
                    <el-collapse-item title="旅行社/旅游" name="travel" v-if="analysis.restrictedConsumption?.travel?.length > 0">
                      <h4 class="sub-section-title">
                        📍 旅行社/旅游 ({{ analysis.restrictedConsumption.travel.length }}笔)
                      </h4>
                      <el-table :data="analysis.restrictedConsumption.travel" stripe class="restricted-table">
                        <el-table-column prop="time" label="时间" width="180">
                          <template #default="{ row }">{{ formatDateTime(row.time) }}</template>
                        </el-table-column>
                        <el-table-column prop="amount" label="金额" width="120">
                          <template #default="{ row }">
                            <span class="amount-text danger">{{ formatCurrency(row.amount) }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column prop="counterparty" label="对手方" />
                        <el-table-column prop="location" label="地点" />
                      </el-table>
                    </el-collapse-item>
                    <el-collapse-item title="房地产/装修" name="realEstate" v-if="analysis.restrictedConsumption?.realEstate?.length > 0">
                      <h4 class="sub-section-title">
                        🏠 房地产/装修 ({{ analysis.restrictedConsumption.realEstate.length }}笔)
                      </h4>
                      <el-table :data="analysis.restrictedConsumption.realEstate" stripe class="restricted-table">
                        <el-table-column prop="time" label="时间" width="180">
                          <template #default="{ row }">{{ formatDateTime(row.time) }}</template>
                        </el-table-column>
                        <el-table-column prop="amount" label="金额" width="120">
                          <template #default="{ row }">
                            <span class="amount-text danger">{{ formatCurrency(row.amount) }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column prop="location" label="消费场所" />
                        <el-table-column prop="counterparty" label="对手方" />
                      </el-table>
                    </el-collapse-item>
                    <el-collapse-item title="保险/证券/基金" name="insurance" v-if="analysis.restrictedConsumption?.insurance?.length > 0">
                      <h4 class="sub-section-title">
                        🛡️ 保险/证券/基金 ({{ analysis.restrictedConsumption.insurance.length }}笔)
                      </h4>
                      <el-table :data="analysis.restrictedConsumption.insurance" stripe class="restricted-table">
                        <el-table-column prop="time" label="时间" width="180">
                          <template #default="{ row }">{{ formatDateTime(row.time) }}</template>
                        </el-table-column>
                        <el-table-column prop="amount" label="金额" width="120">
                          <template #default="{ row }">
                            <span class="amount-text danger">{{ formatCurrency(row.amount) }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column prop="counterparty" label="对手方" />
                        <el-table-column prop="location" label="地点" />
                      </el-table>
                    </el-collapse-item>
                    <el-collapse-item title="奢侈品/高端会员" name="luxury" v-if="analysis.restrictedConsumption?.luxury?.length > 0">
                      <h4 class="sub-section-title">
                        ⭐ 奢侈品/高端会员 ({{ analysis.restrictedConsumption.luxury.length }}笔)
                      </h4>
                      <el-table :data="analysis.restrictedConsumption.luxury" stripe class="restricted-table">
                        <el-table-column prop="time" label="时间" width="180">
                          <template #default="{ row }">{{ formatDateTime(row.time) }}</template>
                        </el-table-column>
                        <el-table-column prop="amount" label="金额" width="120">
                          <template #default="{ row }">
                            <span class="amount-text danger">{{ formatCurrency(row.amount) }}</span>
                          </template>
                        </el-table-column>
                        <el-table-column prop="counterparty" label="对手方" />
                        <el-table-column prop="remark" label="备注" />
                      </el-table>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </el-tab-pane>

              <!-- 大额交易 -->
              <el-tab-pane label="大额交易" name="large">
                <el-table :data="analysis.largeTransactions || []" stripe>
                  <el-table-column prop="time" label="时间" width="180">
                    <template #default="{ row }">{{ formatDateTime(row.time) }}</template>
                  </el-table-column>
                  <el-table-column prop="amount" label="金额" width="120">
                    <template #default="{ row }">
                      <span class="amount-text danger">{{ formatCurrency(row.amount) }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column prop="counterparty" label="对手方" />
                  <el-table-column prop="bank" label="银行" />
                  <el-table-column prop="account" label="账号" />
                </el-table>
              </el-tab-pane>

              <!-- 最常消费商家 -->
              <el-tab-pane label="最常消费商家" name="merchants">
                <el-table :data="analysis.topMerchants || []" stripe>
                  <el-table-column prop="name" label="商家名称" />
                  <el-table-column prop="count" label="交易次数" />
                  <el-table-column prop="totalAmount" label="总金额" width="120">
                    <template #default="{ row }">
                      <span class="amount-text">{{ formatCurrency(row.totalAmount) }}</span>
                    </template>
                  </el-table-column>
                </el-table>
              </el-tab-pane>
            </el-tabs>
          </el-collapse-item>
        </el-collapse>
      </div>
      <el-empty v-else description="暂无分析结果" />
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { flowFileApi, flowAnalysisApi } from '@/api'
import { Upload, DataAnalysis, Warning } from '@element-plus/icons-vue'

// 工具函数
function formatFileSize(size: number): string {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(2)} ${units[index]}`
}

function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null) return '¥0.00'
  return `¥${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}

function formatDateTime(time: string | number): string {
  if (!time) return '-'
  const date = new Date(time)
  if (isNaN(date.getTime())) return String(time)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
}

function getStatusType(status: string): string {
  const statusMap: Record<string, string> = {
    'pending': 'info',
    'analyzing': 'warning',
    'completed': 'success',
    'failed': 'danger'
  }
  return statusMap[status] || 'info'
}

function getStatusText(status: string): string {
  const textMap: Record<string, string> = {
    'pending': '待分析',
    'analyzing': '分析中',
    'completed': '已完成',
    'failed': '失败'
  }
  return textMap[status] || status
}

// 消费统计数据
const consumptionStats = [
  { key: 'flights', title: '机票/高铁', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { key: 'hotels', title: '宾馆/酒店', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { key: 'entertainment', title: '娱乐场所', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { key: 'luxury', title: '奢侈品/高端会员', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
]

const secondaryConsumptionStats = [
  { key: 'travel', title: '旅行社/旅游', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { key: 'realEstate', title: '房地产/装修', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
  { key: 'insurance', title: '保险/证券/基金', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }
]

// 状态管理
const loading = ref(false)
const uploading = ref(false)
const showUploadDialog = ref(false)
const showAnalysisDialog = ref(false)
const activeCollapse = ref([0])
const activeTabNames = ref<Record<number, string>>({})
const consumptionActiveNames = ref<string[]>([])
const flowFiles = ref<any[]>([])
const analysisResults = ref<any[]>([])
const analyzingFileId = ref<number | null>(null)
const uploadForm = ref({ flowSource: '微信', file: null as File | null })

// 计算属性
const hasAnalysisResults = computed(() => analysisResults.value && analysisResults.value.length > 0)

// 初始化
onMounted(() => {
  loadFlowFiles()
})

// 加载流水文件列表
const loadFlowFiles = async () => {
  loading.value = true
  try {
    const res = await flowFileApi.getAll()
    if (res.code === 200) {
      flowFiles.value = res.data || []
    }
  } catch (error) {
    ElMessage.error('加载流水文件列表失败')
  } finally {
    loading.value = false
  }
}

// 文件上传处理
const handleFileChange = (file: any) => {
  uploadForm.value.file = file.raw
}

const handleUpload = async () => {
  if (!uploadForm.value.file) {
    ElMessage.warning('请选择文件')
    return
  }

  uploading.value = true
  try {
    const res = await flowFileApi.upload(uploadForm.value.file, uploadForm.value.flowSource)
    if (res.code === 200) {
      ElMessage.success('上传成功')
      showUploadDialog.value = false
      uploadForm.value.file = null
      await loadFlowFiles()
    }
  } catch (error) {
    ElMessage.error('上传失败')
  } finally {
    uploading.value = false
  }
}

// 分析流水
const analyzeFlow = async (fileId: number) => {
  analyzingFileId.value = fileId
  try {
    const res = await flowAnalysisApi.analyze(fileId)
    if (res.code === 200) {
      ElMessage.success('分析完成')
      analysisResults.value = Array.isArray(res.data) ? res.data : [res.data]
      showAnalysisDialog.value = true
      // 初始化每个分析结果的标签页
      analysisResults.value.forEach((_, index) => {
        activeTabNames.value[index] = 'summary'
      })
      await loadFlowFiles()
    }
  } catch (error) {
    ElMessage.error('分析失败')
  } finally {
    analyzingFileId.value = null
  }
}

// 删除流水文件
const deleteFlowFile = async (id: number) => {
  try {
    await flowFileApi.delete(id)
    ElMessage.success('删除成功')
    await loadFlowFiles()
  } catch (error) {
    ElMessage.error('删除失败')
  }
}

// 打开分析结果
const openAnalysisResult = async (row: any) => {
  if (row.analysis_result) {
    analysisResults.value = Array.isArray(row.analysis_result) ? row.analysis_result : [row.analysis_result]
    showAnalysisDialog.value = true
  } else {
    await analyzeFlow(row.id)
  }
}

// 导出分析报告
const exportAnalysisReport = async () => {
  ElMessage.info('导出功能开发中')
}

// 辅助函数
function getTotalTransactionCount(analysis: any): number {
  return analysis.user_bank_card_analysis?.reduce((sum: number, item: any) => sum + (item.transactionCount || 0), 0) || 0
}

function getTotalInAmount(analysis: any): number {
  return analysis.user_bank_card_analysis?.reduce((sum: number, item: any) => sum + (item.inAmount || 0), 0) || 0
}

function getTotalOutAmount(analysis: any): number {
  return analysis.user_bank_card_analysis?.reduce((sum: number, item: any) => sum + (item.outAmount || 0), 0) || 0
}

function getConsumptionCount(analysis: any, key: string): number {
  return analysis.restrictedConsumption?.[key]?.length || 0
}

function getConsumptionAmount(analysis: any, key: string): string {
  const items = analysis.restrictedConsumption?.[key] || []
  const total = items.reduce((sum: number, item: any) => sum + Math.abs(item.amount || 0), 0)
  return formatCurrency(total)
}
</script>

<style scoped>
.flow-analysis {
  padding: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.file-name-link {
  color: #409eff;
  cursor: pointer;
  text-decoration: underline;
}

.file-name-link:hover {
  color: #66b1ff;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.dialog-header span {
  font-size: 20px;
  font-weight: bold;
  color: #409eff;
}

.collapse-title {
  display: flex;
  align-items: center;
  gap: 20px;
}

.user-identifier {
  font-weight: bold;
  font-size: 16px;
  color: #409eff;
  text-decoration: underline;
}

.analysis-summary {
  color: #666;
  font-size: 14px;
}

.analysis-content {
  max-height: 80vh;
  overflow-y: auto;
}

/* 汇总信息样式 */
.summary-section {
  margin-bottom: 30px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #e4e7ed;
}

.section-title.danger {
  color: #f56c6c;
  border-bottom-color: #fde2e2;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}

.summary-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.summary-value {
  font-size: 32px;
  font-weight: bold;
  margin-bottom: 8px;
}

.summary-label {
  font-size: 14px;
  opacity: 0.9;
}

/* 统计容器样式 */
.stats-container {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 28px;
  font-weight: bold;
  color: #1a73e8;
}

.stat-value.in {
  color: #34a853;
}

.stat-value.out {
  color: #ea4335;
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 8px;
}

/* 消费统计样式 */
.consumption-stat {
  text-align: center;
}

.consumption-title {
  font-size: 14px;
  opacity: 0.9;
}

.consumption-count {
  font-size: 28px;
  font-weight: bold;
  margin: 10px 0;
}

.consumption-amount {
  font-size: 14px;
  opacity: 0.9;
}

/* 限制消费行为样式 */
.restricted-consumption-section {
  margin-top: 20px;
}

.sub-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 15px;
}

.restricted-table {
  border: 1px solid #e4e7ed;
  border-radius: 4px;
}

.restricted-table .el-table__header-wrapper th {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: bold;
}

/* 金额样式 */
.amount-text {
  font-weight: bold;
}

.amount-text.danger {
  color: #f56c6c;
}

.amount-text.in {
  color: #67c23a;
}

.amount-text.out {
  color: #f56c6c;
}

/* 响应式调整 */
@media (max-width: 1200px) {
  .summary-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .summary-grid {
    grid-template-columns: 1fr;
  }
}
</style>
