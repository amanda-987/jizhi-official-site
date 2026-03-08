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
          <el-button type="primary" size="small" @click="generatePDFReport" :loading="generatingPDF">
            {{ generatingPDF ? '生成中...' : '生成 PDF 报告' }}
          </el-button>
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
                  车辆: {{ analysis.vehicleAnalysis?.length || 0 }} | 
                  银行卡: {{ analysis.userBankCardAnalysis?.length || 0 }} | 
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
                      <div class="summary-value">{{ analysis.vehicleAnalysis?.length || 0 }}</div>
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
const generatingPDF = ref(false)

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

// 生成 PDF 报告
const generatePDFReport = async () => {
  if (!analysisResults.value || analysisResults.value.length === 0) {
    ElMessage.warning('暂无分析结果')
    return
  }

  generatingPDF.value = true
  try {
    // 获取所有用户名
    const userNames = analysisResults.value.map((analysis, index) => {
      let userName = '未知用户'
      if (analysis.userPhoneAnalysis && analysis.userPhoneAnalysis.length > 0) {
        userName = analysis.userPhoneAnalysis[0].userName || analysis.user_identifier || `用户${index + 1}`
      } else {
        userName = analysis.user_identifier || `用户${index + 1}`
      }
      return userName
    })

    // 生成报告标题
    const reportTitle = userNames.length === 1 
      ? `${userNames[0]}流水报告` 
      : `${userNames.join('、')}流水报告`

    // 使用纯 HTML 方式导出 PDF
    exportPDFWithHTML(analysisResults.value, reportTitle)
    
    ElMessage.success('报告已在新窗口打开，请点击"打印/保存为PDF"按钮导出')
  } catch (error: any) {
    console.error('PDF 生成失败:', error)
    console.error('错误详情:', error.message, error.stack)
    ElMessage.error(`PDF 报告生成失败: ${error.message || '未知错误'}`)
  } finally {
    generatingPDF.value = false
  }
}

// 使用纯 HTML 方式导出 PDF（在新窗口中打开，用户可选择保存为 PDF）
const exportPDFWithHTML = (analysisResults: any[], reportTitle: string) => {
  // 生成 HTML 内容
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${reportTitle}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        @page { size: A4; margin: 25mm; }
        @media print {
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .page-break { page-break-before: always; }
        }
        body {
          font-family: "Microsoft YaHei", "SimHei", Arial, sans-serif;
          color: #333;
          line-height: 1.6;
          background: white;
          padding: 20px;
        }
        h1 { text-align: center; color: #667eea; margin-bottom: 20px; font-size: 22px; }
        h2 { color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; font-size: 16px; margin-top: 25px; margin-bottom: 15px; }
        h3 { color: #667eea; margin-top: 18px; margin-bottom: 10px; font-size: 13px; }
        h4 { color: #333; margin-top: 12px; margin-bottom: 8px; font-size: 11px; }
        hr { border: none; border-top: 2px solid #667eea; margin-bottom: 25px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 18px; font-size: 10px; }
        th { background-color: #667eea !important; color: white !important; padding: 7px 6px; border: 1px solid #ddd; text-align: left; }
        td { padding: 5px 6px; border: 1px solid #ddd; }
        tr:nth-child(even) td { background-color: #f9f9f9 !important; }
        .section { margin-bottom: 30px; }
        .toolbar { position: fixed; top: 10px; right: 10px; z-index: 1000; }
        .toolbar button { padding: 10px 20px; font-size: 14px; cursor: pointer; background: #667eea; color: white; border: none; border-radius: 4px; margin-left: 10px; }
        .toolbar button:hover { background: #5a6fd6; }
        @media print { .toolbar { display: none; } }
      </style>
    </head>
    <body>
      <div class="toolbar">
        <button onclick="window.print()">打印/保存为PDF</button>
        <button onclick="window.close()">关闭窗口</button>
      </div>
      <h1>${reportTitle}</h1>
      <hr>
      ${analysisResults.map((analysis, index) => {
        const userName = analysis.userPhoneAnalysis && analysis.userPhoneAnalysis.length > 0 
          ? analysis.userPhoneAnalysis[0].userName || analysis.user_identifier || `用户${index + 1}`
          : analysis.user_identifier || `用户${index + 1}`
        
        let sectionHtml = `
          <div class="section ${index > 0 ? 'page-break' : ''}">
            <h2>${userName} - 流水分析</h2>
            <h3>汇总信息</h3>
            <table>
              <tr><th>指标</th><th>数值</th></tr>
              <tr><td>总交易笔数</td><td>${analysis.summary?.totalTransactions || 0}</td></tr>
              <tr><td>总交易金额</td><td>¥${(analysis.summary?.totalAmount || 0).toFixed(2)}</td></tr>
              <tr><td>入账笔数</td><td>${analysis.summary?.inTransactionCount || 0}</td></tr>
              <tr><td>入账金额</td><td>¥${(analysis.summary?.inTransactionAmount || 0).toFixed(2)}</td></tr>
              <tr><td>出账笔数</td><td>${analysis.summary?.outTransactionCount || 0}</td></tr>
              <tr><td>出账金额</td><td>¥${(analysis.summary?.outTransactionAmount || 0).toFixed(2)}</td></tr>
              <tr><td>充值笔数</td><td>${analysis.summary?.rechargeCount || 0}</td></tr>
              <tr><td>车辆数量</td><td>${analysis.vehicleAnalysis?.length || 0}</td></tr>
            </table>
        `
        
        if (analysis.userPhoneAnalysis && analysis.userPhoneAnalysis.length > 0) {
          sectionHtml += `
            <h3>用户名下手机号码</h3>
            <table>
              <tr><th>手机号码</th><th>用户名</th><th>充值金额</th><th>充值次数</th><th>运营商</th></tr>
              ${analysis.userPhoneAnalysis.map((phone: any) => `
                <tr><td>${phone.phone || '-'}</td><td>${phone.userName || '-'}</td><td>¥${(phone.amount || 0).toFixed(2)}</td><td>${phone.count || 0}</td><td>${phone.operator || '-'}</td></tr>
              `).join('')}
            </table>
          `
        }
        
        if (analysis.userBankCardAnalysis && analysis.userBankCardAnalysis.length > 0) {
          sectionHtml += `
            <h3>用户名下银行卡</h3>
            <table>
              <tr><th>银行</th><th>账号</th><th>用户名</th><th>交易次数</th><th>总金额</th></tr>
              ${analysis.userBankCardAnalysis.map((card: any) => `
                <tr><td>${card.bank || '-'}</td><td>${card.account || '-'}</td><td>${card.userName || '-'}</td><td>${card.transactionCount || 0}</td><td>¥${(card.totalAmount || 0).toFixed(2)}</td></tr>
              `).join('')}
            </table>
          `
        }
        
        if (analysis.vehicleAnalysis && analysis.vehicleAnalysis.length > 0) {
          sectionHtml += `
            <h3>车辆信息关联</h3>
            <table>
              <tr><th>车牌号</th><th>出现次数</th><th>关联地点</th></tr>
              ${analysis.vehicleAnalysis.map((vehicle: any) => `
                <tr><td>${vehicle.plateNumber || '-'}</td><td>${vehicle.count || 0}</td><td>${vehicle.locations?.join(', ') || '无'}</td></tr>
              `).join('')}
            </table>
          `
        }
        
        if (analysis.highFrequencyCounterparties && analysis.highFrequencyCounterparties.length > 0) {
          sectionHtml += `
            <h3>高频交易对手</h3>
            <table>
              <tr><th>对手方名称</th><th>交易笔数</th><th>交易总额</th><th>入账总额</th><th>出账总额</th></tr>
              ${analysis.highFrequencyCounterparties.map((cp: any) => `
                <tr><td>${cp.name || '-'}</td><td>${cp.count || 0}</td><td>¥${(cp.totalAmount || 0).toFixed(2)}</td><td>¥${(cp.inAmount || 0).toFixed(2)}</td><td>¥${(cp.outAmount || 0).toFixed(2)}</td></tr>
              `).join('')}
            </table>
          `
        }
        
        if (analysis.restrictedConsumption) {
          const rc = analysis.restrictedConsumption
          
          if (rc.flights?.length > 0) {
            sectionHtml += `
              <h3>机票/高铁 (${rc.flights.length}笔)</h3>
              <table>
                <tr><th>时间</th><th>金额</th><th>对手方</th></tr>
                ${rc.flights.map((item: any) => `
                  <tr><td>${item.time || '-'}</td><td>¥${(item.amount || 0).toFixed(2)}</td><td>${item.counterparty || '-'}</td></tr>
                `).join('')}
              </table>
            `
          }
          
          if (rc.hotels?.length > 0) {
            sectionHtml += `
              <h3>宾馆/酒店 (${rc.hotels.length}笔)</h3>
              <table>
                <tr><th>时间</th><th>金额</th><th>酒店名称</th></tr>
                ${rc.hotels.map((item: any) => `
                  <tr><td>${item.time || '-'}</td><td>¥${(item.amount || 0).toFixed(2)}</td><td>${item.location || '-'}</td></tr>
                `).join('')}
              </table>
            `
          }
          
          if (rc.entertainment?.length > 0) {
            sectionHtml += `
              <h3>娱乐场所 (${rc.entertainment.length}笔)</h3>
              <table>
                <tr><th>时间</th><th>金额</th><th>消费场所</th></tr>
                ${rc.entertainment.map((item: any) => `
                  <tr><td>${item.time || '-'}</td><td>¥${(item.amount || 0).toFixed(2)}</td><td>${item.location || '-'}</td></tr>
                `).join('')}
              </table>
            `
          }
          
          if (rc.luxury?.length > 0) {
            sectionHtml += `
              <h3>奢侈品/高端会员 (${rc.luxury.length}笔)</h3>
              <table>
                <tr><th>时间</th><th>金额</th><th>对手方</th><th>备注</th></tr>
                ${rc.luxury.map((item: any) => `
                  <tr><td>${item.time || '-'}</td><td>¥${(item.amount || 0).toFixed(2)}</td><td>${item.counterparty || '-'}</td><td>${item.remark || '-'}</td></tr>
                `).join('')}
              </table>
            `
          }
        }
        
        if (analysis.largeTransactions && analysis.largeTransactions.length > 0) {
          sectionHtml += `
            <h3>大额交易</h3>
            <table>
              <tr><th>时间</th><th>金额</th><th>对手方</th><th>银行</th></tr>
              ${analysis.largeTransactions.map((tx: any) => `
                <tr><td>${tx.time || '-'}</td><td>¥${(tx.amount || 0).toFixed(2)}</td><td>${tx.counterparty || '-'}</td><td>${tx.bank || '-'}</td></tr>
              `).join('')}
            </table>
          `
        }
        
        if (analysis.topMerchants && analysis.topMerchants.length > 0) {
          sectionHtml += `
            <h3>最常消费商家</h3>
            <table>
              <tr><th>商家名称</th><th>交易次数</th><th>总金额</th></tr>
              ${analysis.topMerchants.map((merchant: any) => `
                <tr><td>${merchant.name || '-'}</td><td>${merchant.count || 0}</td><td>¥${(merchant.totalAmount || 0).toFixed(2)}</td></tr>
              `).join('')}
            </table>
          `
        }
        
        sectionHtml += '</div>'
        return sectionHtml
      }).join('')}
    </body>
    </html>
  `
  
  // 创建新窗口
  const newWindow = window.open('', '_blank', 'width=900,height=650')
  if (!newWindow) {
    ElMessage.error('无法打开新窗口，请检查浏览器弹窗设置')
    return
  }
  
  // 写入内容
  newWindow.document.write(htmlContent)
  newWindow.document.close()
  newWindow.focus()
}

// 使用新窗口打印方式生成 PDF
const generatePDFWithNewWindow = (analysisResults: any[], reportTitle: string) => {
  // 生成 HTML 内容
  let htmlContent = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${reportTitle}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        @page {
          size: A4;
          margin: 25mm 25.4mm 25mm 25.4mm;
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .page-break {
            page-break-before: always;
          }
        }
        body {
          font-family: "Microsoft YaHei", "SimHei", Arial, sans-serif;
          color: #333;
          line-height: 1.6;
          background: white;
        }
        h1 {
          text-align: center;
          color: #667eea;
          margin-bottom: 20px;
          font-size: 22px;
          font-weight: bold;
        }
        h2 {
          color: #667eea;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
          font-size: 16px;
          margin-top: 25px;
          margin-bottom: 15px;
          font-weight: bold;
        }
        h3 {
          color: #667eea;
          margin-top: 18px;
          margin-bottom: 10px;
          font-size: 13px;
          font-weight: bold;
        }
        h4 {
          color: #333;
          margin-top: 12px;
          margin-bottom: 8px;
          font-size: 11px;
          font-weight: bold;
        }
        hr {
          border: none;
          border-top: 2px solid #667eea;
          margin-bottom: 25px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 18px;
          font-size: 10px;
        }
        th {
          background-color: #667eea !important;
          color: white !important;
          padding: 7px 6px;
          border: 1px solid #ddd;
          text-align: left;
          font-weight: bold;
        }
        td {
          padding: 5px 6px;
          border: 1px solid #ddd;
        }
        tr:nth-child(even) td {
          background-color: #f9f9f9 !important;
        }
        .section {
          margin-bottom: 30px;
        }
      </style>
    </head>
    <body>
      <h1>${reportTitle}</h1>
      <hr>
  `
  
  analysisResults.forEach((analysis, index) => {
    const userName = analysis.userPhoneAnalysis && analysis.userPhoneAnalysis.length > 0 
      ? analysis.userPhoneAnalysis[0].userName || analysis.user_identifier || `用户${index + 1}`
      : analysis.user_identifier || `用户${index + 1}`
    
    htmlContent += `
      <div class="section ${index > 0 ? 'page-break' : ''}">
        <h2>${userName} - 流水分析</h2>
        
        <h3>汇总信息</h3>
        <table>
          <tr><th>指标</th><th>数值</th></tr>
          <tr><td>总交易笔数</td><td>${analysis.summary?.totalTransactions || 0}</td></tr>
          <tr><td>总交易金额</td><td>¥${(analysis.summary?.totalAmount || 0).toFixed(2)}</td></tr>
          <tr><td>入账笔数</td><td>${analysis.summary?.inTransactionCount || 0}</td></tr>
          <tr><td>入账金额</td><td>¥${(analysis.summary?.inTransactionAmount || 0).toFixed(2)}</td></tr>
          <tr><td>出账笔数</td><td>${analysis.summary?.outTransactionCount || 0}</td></tr>
          <tr><td>出账金额</td><td>¥${(analysis.summary?.outTransactionAmount || 0).toFixed(2)}</td></tr>
          <tr><td>充值笔数</td><td>${analysis.summary?.rechargeCount || 0}</td></tr>
          <tr><td>车辆数量</td><td>${analysis.vehicleAnalysis?.length || 0}</td></tr>
        </table>
    `
    
    // 用户名下手机号码
    if (analysis.userPhoneAnalysis && analysis.userPhoneAnalysis.length > 0) {
      htmlContent += `
        <h3>用户名下手机号码</h3>
        <table>
          <tr><th>手机号码</th><th>用户名</th><th>充值金额</th><th>充值次数</th><th>运营商</th></tr>
      `
      analysis.userPhoneAnalysis.forEach((phone: any) => {
        htmlContent += `
          <tr>
            <td>${phone.phone || '-'}</td>
            <td>${phone.userName || '-'}</td>
            <td>¥${(phone.amount || 0).toFixed(2)}</td>
            <td>${phone.count || 0}</td>
            <td>${phone.operator || '-'}</td>
          </tr>
        `
      })
      htmlContent += '</table>'
    }
    
    // 用户名下银行卡
    if (analysis.userBankCardAnalysis && analysis.userBankCardAnalysis.length > 0) {
      htmlContent += `
        <h3>用户名下银行卡</h3>
        <table>
          <tr><th>银行</th><th>账号</th><th>用户名</th><th>交易次数</th><th>总金额</th></tr>
      `
      analysis.userBankCardAnalysis.forEach((card: any) => {
        htmlContent += `
          <tr>
            <td>${card.bank || '-'}</td>
            <td>${card.account || '-'}</td>
            <td>${card.userName || '-'}</td>
            <td>${card.transactionCount || 0}</td>
            <td>¥${(card.totalAmount || 0).toFixed(2)}</td>
          </tr>
        `
      })
      htmlContent += '</table>'
    }
    
    // 车辆信息关联
    if (analysis.vehicleAnalysis && analysis.vehicleAnalysis.length > 0) {
      htmlContent += `
        <h3>车辆信息关联</h3>
        <table>
          <tr><th>车牌号</th><th>出现次数</th><th>关联地点</th></tr>
      `
      analysis.vehicleAnalysis.forEach((vehicle: any) => {
        htmlContent += `
          <tr>
            <td>${vehicle.plateNumber || '-'}</td>
            <td>${vehicle.count || 0}</td>
            <td>${vehicle.locations?.join(', ') || '无'}</td>
          </tr>
        `
      })
      htmlContent += '</table>'
    }
    
    // 高频交易对手
    if (analysis.highFrequencyCounterparties && analysis.highFrequencyCounterparties.length > 0) {
      htmlContent += `
        <h3>高频交易对手</h3>
        <table>
          <tr><th>对手方名称</th><th>交易笔数</th><th>交易总额</th><th>入账总额</th><th>出账总额</th></tr>
      `
      analysis.highFrequencyCounterparties.forEach((cp: any) => {
        htmlContent += `
          <tr>
            <td>${cp.name || '-'}</td>
            <td>${cp.count || 0}</td>
            <td>¥${(cp.totalAmount || 0).toFixed(2)}</td>
            <td>¥${(cp.inAmount || 0).toFixed(2)}</td>
            <td>¥${(cp.outAmount || 0).toFixed(2)}</td>
          </tr>
        `
      })
      htmlContent += '</table>'
    }
    
    // 限制消费行为
    if (analysis.restrictedConsumption) {
      const rc = analysis.restrictedConsumption
      const hasConsumption = rc.flights?.length > 0 || rc.hotels?.length > 0 || rc.entertainment?.length > 0 || 
                            rc.travel?.length > 0 || rc.insurance?.length > 0 || rc.luxury?.length > 0
      
      if (hasConsumption) {
        htmlContent += '<h3>限制消费行为</h3>'
        
        // 机票/高铁
        if (rc.flights?.length > 0) {
          htmlContent += `
            <h4>机票/高铁 (${rc.flights.length}笔)</h4>
            <table>
              <tr><th>时间</th><th>金额</th><th>对手方</th></tr>
          `
          rc.flights.forEach((item: any) => {
            htmlContent += `
              <tr>
                <td>${item.time || '-'}</td>
                <td>¥${(item.amount || 0).toFixed(2)}</td>
                <td>${item.counterparty || '-'}</td>
              </tr>
            `
          })
          htmlContent += '</table>'
        }
        
        // 宾馆/酒店
        if (rc.hotels?.length > 0) {
          htmlContent += `
            <h4>宾馆/酒店 (${rc.hotels.length}笔)</h4>
            <table>
              <tr><th>时间</th><th>金额</th><th>酒店名称</th></tr>
          `
          rc.hotels.forEach((item: any) => {
            htmlContent += `
              <tr>
                <td>${item.time || '-'}</td>
                <td>¥${(item.amount || 0).toFixed(2)}</td>
                <td>${item.location || '-'}</td>
              </tr>
            `
          })
          htmlContent += '</table>'
        }
        
        // 娱乐场所
        if (rc.entertainment?.length > 0) {
          htmlContent += `
            <h4>娱乐场所 (${rc.entertainment.length}笔)</h4>
            <table>
              <tr><th>时间</th><th>金额</th><th>消费场所</th></tr>
          `
          rc.entertainment.forEach((item: any) => {
            htmlContent += `
              <tr>
                <td>${item.time || '-'}</td>
                <td>¥${(item.amount || 0).toFixed(2)}</td>
                <td>${item.location || '-'}</td>
              </tr>
            `
          })
          htmlContent += '</table>'
        }
        
        // 奢侈品/高端会员
        if (rc.luxury?.length > 0) {
          htmlContent += `
            <h4>奢侈品/高端会员 (${rc.luxury.length}笔)</h4>
            <table>
              <tr><th>时间</th><th>金额</th><th>对手方</th><th>备注</th></tr>
          `
          rc.luxury.forEach((item: any) => {
            htmlContent += `
              <tr>
                <td>${item.time || '-'}</td>
                <td>¥${(item.amount || 0).toFixed(2)}</td>
                <td>${item.counterparty || '-'}</td>
                <td>${item.remark || '-'}</td>
              </tr>
            `
          })
          htmlContent += '</table>'
        }
      }
    }
    
    // 大额交易
    if (analysis.largeTransactions && analysis.largeTransactions.length > 0) {
      htmlContent += `
        <h3>大额交易</h3>
        <table>
          <tr><th>时间</th><th>金额</th><th>对手方</th><th>银行</th></tr>
      `
      analysis.largeTransactions.forEach((tx: any) => {
        htmlContent += `
          <tr>
            <td>${tx.time || '-'}</td>
            <td>¥${(tx.amount || 0).toFixed(2)}</td>
            <td>${tx.counterparty || '-'}</td>
            <td>${tx.bank || '-'}</td>
          </tr>
        `
      })
      htmlContent += '</table>'
    }
    
    // 最常消费商家
    if (analysis.topMerchants && analysis.topMerchants.length > 0) {
      htmlContent += `
        <h3>最常消费商家</h3>
        <table>
          <tr><th>商家名称</th><th>交易次数</th><th>总金额</th></tr>
      `
      analysis.topMerchants.forEach((merchant: any) => {
        htmlContent += `
          <tr>
            <td>${merchant.name || '-'}</td>
            <td>${merchant.count || 0}</td>
            <td>¥${(merchant.totalAmount || 0).toFixed(2)}</td>
          </tr>
        `
      })
      htmlContent += '</table>'
    }
    
    htmlContent += '</div>'
  })
  
  htmlContent += `
      </body>
    </html>
  `
  
  // 创建新窗口
  const printWindow = window.open('', '_blank', 'width=900,height=650')
  if (!printWindow) {
    ElMessage.error('无法打开新窗口，请检查浏览器弹窗设置')
    return
  }
  
  // 写入内容
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  
  // 等待内容加载完成后打印
  printWindow.focus()
  setTimeout(() => {
    printWindow.print()
  }, 300)
}

// 使用 html2canvas 和 jspdf 生成 PDF（修复版）
const generatePDFDirect = async (analysisResults: any[], reportTitle: string) => {
  const html2canvas = (await import('html2canvas')).default
  const { jsPDF } = await import('jspdf')
  
  // 创建临时容器
  const container = document.createElement('div')
  container.style.cssText = `
    position: absolute;
    left: -9999px;
    top: 0;
    width: 794px;
    background: white;
    padding: 25.4mm;
    box-sizing: border-box;
    font-family: "Microsoft YaHei", "SimHei", Arial, sans-serif;
  `
  document.body.appendChild(container)
  
  try {
    // 生成 HTML 内容
    let htmlContent = `
      <div style="font-family: 'Microsoft YaHei', 'SimHei', Arial, sans-serif; color: #333; line-height: 1.6;">
        <h1 style="text-align: center; color: #667eea; margin-bottom: 20px; font-size: 24px; font-weight: bold;">${reportTitle}</h1>
        <hr style="border: 2px solid #667eea; margin-bottom: 30px;">
    `
    
    analysisResults.forEach((analysis, index) => {
      const userName = analysis.userPhoneAnalysis && analysis.userPhoneAnalysis.length > 0 
        ? analysis.userPhoneAnalysis[0].userName || analysis.user_identifier || `用户${index + 1}`
        : analysis.user_identifier || `用户${index + 1}`
      
      htmlContent += `
        <div style="margin-bottom: 40px; ${index > 0 ? 'page-break-before: always;' : ''}">
          <h2 style="color: #667eea; border-bottom: 2px solid #667eea; padding-bottom: 10px; font-size: 18px; margin-top: 30px; font-weight: bold;">${userName} - 流水分析</h2>
          
          <h3 style="color: #667eea; margin-top: 20px; font-size: 14px; font-weight: bold;">汇总信息</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
            <tr style="background-color: #667eea; color: white;">
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">指标</th>
              <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">数值</th>
            </tr>
            <tr><td style="padding: 6px 8px; border: 1px solid #ddd;">总交易笔数</td><td style="padding: 6px 8px; border: 1px solid #ddd;">${analysis.summary?.totalTransactions || 0}</td></tr>
            <tr style="background-color: #f9f9f9;"><td style="padding: 6px 8px; border: 1px solid #ddd;">总交易金额</td><td style="padding: 6px 8px; border: 1px solid #ddd;">¥${(analysis.summary?.totalAmount || 0).toFixed(2)}</td></tr>
            <tr><td style="padding: 6px 8px; border: 1px solid #ddd;">入账笔数</td><td style="padding: 6px 8px; border: 1px solid #ddd;">${analysis.summary?.inTransactionCount || 0}</td></tr>
            <tr style="background-color: #f9f9f9;"><td style="padding: 6px 8px; border: 1px solid #ddd;">入账金额</td><td style="padding: 6px 8px; border: 1px solid #ddd;">¥${(analysis.summary?.inTransactionAmount || 0).toFixed(2)}</td></tr>
            <tr><td style="padding: 6px 8px; border: 1px solid #ddd;">出账笔数</td><td style="padding: 6px 8px; border: 1px solid #ddd;">${analysis.summary?.outTransactionCount || 0}</td></tr>
            <tr style="background-color: #f9f9f9;"><td style="padding: 6px 8px; border: 1px solid #ddd;">出账金额</td><td style="padding: 6px 8px; border: 1px solid #ddd;">¥${(analysis.summary?.outTransactionAmount || 0).toFixed(2)}</td></tr>
            <tr><td style="padding: 6px 8px; border: 1px solid #ddd;">充值笔数</td><td style="padding: 6px 8px; border: 1px solid #ddd;">${analysis.summary?.rechargeCount || 0}</td></tr>
            <tr style="background-color: #f9f9f9;"><td style="padding: 6px 8px; border: 1px solid #ddd;">车辆数量</td><td style="padding: 6px 8px; border: 1px solid #ddd;">${analysis.vehicleAnalysis?.length || 0}</td></tr>
          </table>
      `
      
      // 用户名下手机号码
      if (analysis.userPhoneAnalysis && analysis.userPhoneAnalysis.length > 0) {
        htmlContent += `
          <h3 style="color: #667eea; margin-top: 20px; font-size: 14px; font-weight: bold;">用户名下手机号码</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px;">
            <tr style="background-color: #667eea; color: white;">
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">手机号码</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">用户名</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">充值金额</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">充值次数</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">运营商</th>
            </tr>
        `
        analysis.userPhoneAnalysis.forEach((phone: any, idx: number) => {
          htmlContent += `
            <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${phone.phone || '-'}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${phone.userName || '-'}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">¥${(phone.amount || 0).toFixed(2)}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${phone.count || 0}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${phone.operator || '-'}</td>
            </tr>
          `
        })
        htmlContent += '</table>'
      }
      
      // 用户名下银行卡
      if (analysis.userBankCardAnalysis && analysis.userBankCardAnalysis.length > 0) {
        htmlContent += `
          <h3 style="color: #667eea; margin-top: 20px; font-size: 14px; font-weight: bold;">用户名下银行卡</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px;">
            <tr style="background-color: #667eea; color: white;">
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">银行</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">账号</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">用户名</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">交易次数</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">总金额</th>
            </tr>
        `
        analysis.userBankCardAnalysis.forEach((card: any, idx: number) => {
          htmlContent += `
            <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${card.bank || '-'}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${card.account || '-'}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${card.userName || '-'}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${card.transactionCount || 0}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">¥${(card.totalAmount || 0).toFixed(2)}</td>
            </tr>
          `
        })
        htmlContent += '</table>'
      }
      
      // 车辆信息关联
      if (analysis.vehicleAnalysis && analysis.vehicleAnalysis.length > 0) {
        htmlContent += `
          <h3 style="color: #667eea; margin-top: 20px; font-size: 14px; font-weight: bold;">车辆信息关联</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px;">
            <tr style="background-color: #667eea; color: white;">
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">车牌号</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">出现次数</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">关联地点</th>
            </tr>
        `
        analysis.vehicleAnalysis.forEach((vehicle: any, idx: number) => {
          htmlContent += `
            <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${vehicle.plateNumber || '-'}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${vehicle.count || 0}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${vehicle.locations?.join(', ') || '无'}</td>
            </tr>
          `
        })
        htmlContent += '</table>'
      }
      
      // 高频交易对手
      if (analysis.highFrequencyCounterparties && analysis.highFrequencyCounterparties.length > 0) {
        htmlContent += `
          <h3 style="color: #667eea; margin-top: 20px; font-size: 14px; font-weight: bold;">高频交易对手</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px;">
            <tr style="background-color: #667eea; color: white;">
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">对手方名称</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">交易笔数</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">交易总额</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">入账总额</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">出账总额</th>
            </tr>
        `
        analysis.highFrequencyCounterparties.forEach((cp: any, idx: number) => {
          htmlContent += `
            <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${cp.name || '-'}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${cp.count || 0}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">¥${(cp.totalAmount || 0).toFixed(2)}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">¥${(cp.inAmount || 0).toFixed(2)}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">¥${(cp.outAmount || 0).toFixed(2)}</td>
            </tr>
          `
        })
        htmlContent += '</table>'
      }
      
      // 限制消费行为
      if (analysis.restrictedConsumption) {
        const rc = analysis.restrictedConsumption
        const hasConsumption = rc.flights?.length > 0 || rc.hotels?.length > 0 || rc.entertainment?.length > 0 || 
                              rc.travel?.length > 0 || rc.insurance?.length > 0 || rc.luxury?.length > 0
        
        if (hasConsumption) {
          htmlContent += `<h3 style="color: #667eea; margin-top: 20px; font-size: 14px; font-weight: bold;">限制消费行为</h3>`
          
          // 机票/高铁
          if (rc.flights?.length > 0) {
            htmlContent += `
              <h4 style="color: #333; margin-top: 15px; font-size: 12px; font-weight: bold;">✈️ 机票/高铁 (${rc.flights.length}笔)</h4>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9px;">
                <tr style="background-color: #667eea; color: white;">
                  <th style="padding: 5px; border: 1px solid #ddd; text-align: left;">时间</th>
                  <th style="padding: 5px; border: 1px solid #ddd; text-align: left;">金额</th>
                  <th style="padding: 5px; border: 1px solid #ddd; text-align: left;">对手方</th>
                </tr>
            `
            rc.flights.forEach((item: any, idx: number) => {
              htmlContent += `
                <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
                  <td style="padding: 4px 5px; border: 1px solid #ddd;">${item.time || '-'}</td>
                  <td style="padding: 4px 5px; border: 1px solid #ddd;">¥${(item.amount || 0).toFixed(2)}</td>
                  <td style="padding: 4px 5px; border: 1px solid #ddd;">${item.counterparty || '-'}</td>
                </tr>
              `
            })
            htmlContent += '</table>'
          }
          
          // 宾馆/酒店
          if (rc.hotels?.length > 0) {
            htmlContent += `
              <h4 style="color: #333; margin-top: 15px; font-size: 12px; font-weight: bold;">🏨 宾馆/酒店 (${rc.hotels.length}笔)</h4>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9px;">
                <tr style="background-color: #667eea; color: white;">
                  <th style="padding: 5px; border: 1px solid #ddd; text-align: left;">时间</th>
                  <th style="padding: 5px; border: 1px solid #ddd; text-align: left;">金额</th>
                  <th style="padding: 5px; border: 1px solid #ddd; text-align: left;">酒店名称</th>
                </tr>
            `
            rc.hotels.forEach((item: any, idx: number) => {
              htmlContent += `
                <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
                  <td style="padding: 4px 5px; border: 1px solid #ddd;">${item.time || '-'}</td>
                  <td style="padding: 4px 5px; border: 1px solid #ddd;">¥${(item.amount || 0).toFixed(2)}</td>
                  <td style="padding: 4px 5px; border: 1px solid #ddd;">${item.location || '-'}</td>
                </tr>
              `
            })
            htmlContent += '</table>'
          }
          
          // 娱乐场所
          if (rc.entertainment?.length > 0) {
            htmlContent += `
              <h4 style="color: #333; margin-top: 15px; font-size: 12px; font-weight: bold;">🎬 娱乐场所 (${rc.entertainment.length}笔)</h4>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9px;">
                <tr style="background-color: #667eea; color: white;">
                  <th style="padding: 5px; border: 1px solid #ddd; text-align: left;">时间</th>
                  <th style="padding: 5px; border: 1px solid #ddd; text-align: left;">金额</th>
                  <th style="padding: 5px; border: 1px solid #ddd; text-align: left;">消费场所</th>
                </tr>
            `
            rc.entertainment.forEach((item: any, idx: number) => {
              htmlContent += `
                <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
                  <td style="padding: 4px 5px; border: 1px solid #ddd;">${item.time || '-'}</td>
                  <td style="padding: 4px 5px; border: 1px solid #ddd;">¥${(item.amount || 0).toFixed(2)}</td>
                  <td style="padding: 4px 5px; border: 1px solid #ddd;">${item.location || '-'}</td>
                </tr>
              `
            })
            htmlContent += '</table>'
          }
          
          // 奢侈品/高端会员
          if (rc.luxury?.length > 0) {
            htmlContent += `
              <h4 style="color: #333; margin-top: 15px; font-size: 12px; font-weight: bold;">⭐ 奢侈品/高端会员 (${rc.luxury.length}笔)</h4>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 9px;">
                <tr style="background-color: #667eea; color: white;">
                  <th style="padding: 5px; border: 1px solid #ddd; text-align: left;">时间</th>
                  <th style="padding: 5px; border: 1px solid #ddd; text-align: left;">金额</th>
                  <th style="padding: 5px; border: 1px solid #ddd; text-align: left;">对手方</th>
                  <th style="padding: 5px; border: 1px solid #ddd; text-align: left;">备注</th>
                </tr>
            `
            rc.luxury.forEach((item: any, idx: number) => {
              htmlContent += `
                <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
                  <td style="padding: 4px 5px; border: 1px solid #ddd;">${item.time || '-'}</td>
                  <td style="padding: 4px 5px; border: 1px solid #ddd;">¥${(item.amount || 0).toFixed(2)}</td>
                  <td style="padding: 4px 5px; border: 1px solid #ddd;">${item.counterparty || '-'}</td>
                  <td style="padding: 4px 5px; border: 1px solid #ddd;">${item.remark || '-'}</td>
                </tr>
              `
            })
            htmlContent += '</table>'
          }
        }
      }
      
      // 大额交易
      if (analysis.largeTransactions && analysis.largeTransactions.length > 0) {
        htmlContent += `
          <h3 style="color: #667eea; margin-top: 20px; font-size: 14px; font-weight: bold;">大额交易</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 9px;">
            <tr style="background-color: #667eea; color: white;">
              <th style="padding: 5px; border: 1px solid #ddd; text-align: left;">时间</th>
              <th style="padding: 5px; border: 1px solid #ddd; text-align: left;">金额</th>
              <th style="padding: 5px; border: 1px solid #ddd; text-align: left;">对手方</th>
              <th style="padding: 5px; border: 1px solid #ddd; text-align: left;">银行</th>
            </tr>
        `
        analysis.largeTransactions.forEach((tx: any, idx: number) => {
          htmlContent += `
            <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
              <td style="padding: 4px 5px; border: 1px solid #ddd;">${tx.time || '-'}</td>
              <td style="padding: 4px 5px; border: 1px solid #ddd;">¥${(tx.amount || 0).toFixed(2)}</td>
              <td style="padding: 4px 5px; border: 1px solid #ddd;">${tx.counterparty || '-'}</td>
              <td style="padding: 4px 5px; border: 1px solid #ddd;">${tx.bank || '-'}</td>
            </tr>
          `
        })
        htmlContent += '</table>'
      }
      
      // 最常消费商家
      if (analysis.topMerchants && analysis.topMerchants.length > 0) {
        htmlContent += `
          <h3 style="color: #667eea; margin-top: 20px; font-size: 14px; font-weight: bold;">最常消费商家</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px;">
            <tr style="background-color: #667eea; color: white;">
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">商家名称</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">交易次数</th>
              <th style="padding: 6px; border: 1px solid #ddd; text-align: left;">总金额</th>
            </tr>
        `
        analysis.topMerchants.forEach((merchant: any, idx: number) => {
          htmlContent += `
            <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${merchant.name || '-'}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">${merchant.count || 0}</td>
              <td style="padding: 5px 6px; border: 1px solid #ddd;">¥${(merchant.totalAmount || 0).toFixed(2)}</td>
            </tr>
          `
        })
        htmlContent += '</table>'
      }
      
      htmlContent += '</div>'
    })
    
    htmlContent += '</div>'
    container.innerHTML = htmlContent
    
    // 等待图片加载
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // 使用 html2canvas 将 HTML 转换为 canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794,
      height: container.scrollHeight
    })
    
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas 生成失败，内容为空')
    }
    
    // 创建 PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    // 页边距设置 (mm) - 下侧页边距调整为 25mm (2.5cm)
    const marginTop = 25.4
    const marginBottom = 25  // 调整为 2.5cm
    const marginLeft = 25.4
    const marginRight = 25.4
    
    // A4 尺寸 (mm)
    const pageWidth = 210
    const pageHeight = 297
    
    // 内容区域尺寸（减去页边距）
    const contentWidth = pageWidth - marginLeft - marginRight
    const contentHeight = pageHeight - marginTop - marginBottom
    
    // 图片尺寸
    const imgWidth = contentWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    let heightLeft = imgHeight
    let position = marginTop
    
    // 将 canvas 转换为图片数据
    const imgData = canvas.toDataURL('image/jpeg', 0.95)
    
    // 添加第一页
    pdf.addImage(imgData, 'JPEG', marginLeft, position, imgWidth, imgHeight)
    heightLeft -= contentHeight
    
    // 如果内容超过一页，添加新页面
    while (heightLeft > 0) {
      position = marginTop - (imgHeight - heightLeft - contentHeight)
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', marginLeft, position, imgWidth, imgHeight)
      heightLeft -= contentHeight
    }
    
    // 下载 PDF
    pdf.save(`${reportTitle}.pdf`)
  } finally {
    // 清理临时容器
    document.body.removeChild(container)
  }
}

// 使用浏览器打印功能生成 PDF
const generatePDFWithPrint = (analysisResults: any[], reportTitle: string) => {
  // 创建新窗口用于打印
  const printWindow = window.open('', '_blank')
  if (!printWindow) {
    ElMessage.error('无法打开打印窗口，请检查浏览器弹窗设置')
    return
  }
  
  // 生成 HTML 内容
  let htmlContent = `
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
      <meta charset="UTF-8">
      <title>${reportTitle}</title>
      <style>
        @page {
          size: A4;
          margin: 25.4mm;
        }
        @media print {
          body {
            margin: 0;
            padding: 0;
          }
          .page-break {
            page-break-before: always;
          }
        }
        body {
          font-family: Arial, "Microsoft YaHei", sans-serif;
          color: #333;
          line-height: 1.6;
        }
        h1 {
          text-align: center;
          color: #667eea;
          margin-bottom: 20px;
          font-size: 24px;
        }
        h2 {
          color: #667eea;
          border-bottom: 2px solid #667eea;
          padding-bottom: 10px;
          font-size: 18px;
          margin-top: 30px;
        }
        h3 {
          color: #667eea;
          margin-top: 20px;
          font-size: 14px;
        }
        h4 {
          color: #333;
          margin-top: 15px;
          font-size: 12px;
        }
        hr {
          border: 2px solid #667eea;
          margin-bottom: 30px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 20px;
          font-size: 11px;
        }
        th {
          background-color: #667eea;
          color: white;
          padding: 8px;
          border: 1px solid #ddd;
          text-align: left;
        }
        td {
          padding: 6px 8px;
          border: 1px solid #ddd;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .section {
          margin-bottom: 40px;
        }
      </style>
    </head>
    <body>
      <h1>${reportTitle}</h1>
      <hr>
  `
  
  analysisResults.forEach((analysis, index) => {
    const userName = analysis.userPhoneAnalysis && analysis.userPhoneAnalysis.length > 0 
      ? analysis.userPhoneAnalysis[0].userName || analysis.user_identifier || `用户${index + 1}`
      : analysis.user_identifier || `用户${index + 1}`
    
    htmlContent += `
      <div class="section ${index > 0 ? 'page-break' : ''}">
        <h2>${userName} - 流水分析</h2>
        
        <h3>汇总信息</h3>
        <table>
          <tr><th>指标</th><th>数值</th></tr>
          <tr><td>总交易笔数</td><td>${analysis.summary?.totalTransactions || 0}</td></tr>
          <tr><td>总交易金额</td><td>¥${(analysis.summary?.totalAmount || 0).toFixed(2)}</td></tr>
          <tr><td>入账笔数</td><td>${analysis.summary?.inTransactionCount || 0}</td></tr>
          <tr><td>入账金额</td><td>¥${(analysis.summary?.inTransactionAmount || 0).toFixed(2)}</td></tr>
          <tr><td>出账笔数</td><td>${analysis.summary?.outTransactionCount || 0}</td></tr>
          <tr><td>出账金额</td><td>¥${(analysis.summary?.outTransactionAmount || 0).toFixed(2)}</td></tr>
          <tr><td>充值笔数</td><td>${analysis.summary?.rechargeCount || 0}</td></tr>
          <tr><td>车辆数量</td><td>${analysis.vehicleAnalysis?.length || 0}</td></tr>
        </table>
    `
    
    // 用户名下手机号码
    if (analysis.userPhoneAnalysis && analysis.userPhoneAnalysis.length > 0) {
      htmlContent += `
        <h3>用户名下手机号码</h3>
        <table>
          <tr><th>手机号码</th><th>用户名</th><th>充值金额</th><th>充值次数</th><th>运营商</th></tr>
      `
      analysis.userPhoneAnalysis.forEach((phone: any) => {
        htmlContent += `
          <tr>
            <td>${phone.phone || '-'}</td>
            <td>${phone.userName || '-'}</td>
            <td>¥${(phone.amount || 0).toFixed(2)}</td>
            <td>${phone.count || 0}</td>
            <td>${phone.operator || '-'}</td>
          </tr>
        `
      })
      htmlContent += '</table>'
    }
    
    // 用户名下银行卡
    if (analysis.userBankCardAnalysis && analysis.userBankCardAnalysis.length > 0) {
      htmlContent += `
        <h3>用户名下银行卡</h3>
        <table>
          <tr><th>银行</th><th>账号</th><th>用户名</th><th>交易次数</th><th>总金额</th><th>入账金额</th><th>出账金额</th></tr>
      `
      analysis.userBankCardAnalysis.forEach((card: any) => {
        htmlContent += `
          <tr>
            <td>${card.bank || '-'}</td>
            <td>${card.account || '-'}</td>
            <td>${card.userName || '-'}</td>
            <td>${card.transactionCount || 0}</td>
            <td>¥${(card.totalAmount || 0).toFixed(2)}</td>
            <td>¥${(card.inAmount || 0).toFixed(2)}</td>
            <td>¥${(card.outAmount || 0).toFixed(2)}</td>
          </tr>
        `
      })
      htmlContent += '</table>'
    }
    
    // 车辆信息关联
    if (analysis.vehicleAnalysis && analysis.vehicleAnalysis.length > 0) {
      htmlContent += `
        <h3>车辆信息关联</h3>
        <table>
          <tr><th>车牌号</th><th>出现次数</th><th>关联地点</th></tr>
      `
      analysis.vehicleAnalysis.forEach((vehicle: any) => {
        htmlContent += `
          <tr>
            <td>${vehicle.plateNumber || '-'}</td>
            <td>${vehicle.count || 0}</td>
            <td>${vehicle.locations?.join(', ') || '无'}</td>
          </tr>
        `
      })
      htmlContent += '</table>'
    }
    
    // 高频交易对手
    if (analysis.highFrequencyCounterparties && analysis.highFrequencyCounterparties.length > 0) {
      htmlContent += `
        <h3>高频交易对手</h3>
        <table>
          <tr><th>对手方名称</th><th>交易笔数</th><th>交易总额</th><th>入账总额</th><th>出账总额</th></tr>
      `
      analysis.highFrequencyCounterparties.forEach((cp: any) => {
        htmlContent += `
          <tr>
            <td>${cp.name || '-'}</td>
            <td>${cp.count || 0}</td>
            <td>¥${(cp.totalAmount || 0).toFixed(2)}</td>
            <td>¥${(cp.inAmount || 0).toFixed(2)}</td>
            <td>¥${(cp.outAmount || 0).toFixed(2)}</td>
          </tr>
        `
      })
      htmlContent += '</table>'
    }
    
    // 限制消费行为
    if (analysis.restrictedConsumption) {
      const rc = analysis.restrictedConsumption
      const hasConsumption = rc.flights?.length > 0 || rc.hotels?.length > 0 || rc.entertainment?.length > 0 || 
                            rc.travel?.length > 0 || rc.insurance?.length > 0 || rc.luxury?.length > 0
      
      if (hasConsumption) {
        htmlContent += '<h3>限制消费行为</h3>'
        
        // 机票/高铁
        if (rc.flights?.length > 0) {
          htmlContent += `
            <h4>✈️ 机票/高铁 (${rc.flights.length}笔)</h4>
            <table>
              <tr><th>时间</th><th>金额</th><th>对手方</th></tr>
          `
          rc.flights.forEach((item: any) => {
            htmlContent += `
              <tr>
                <td>${item.time || '-'}</td>
                <td>¥${(item.amount || 0).toFixed(2)}</td>
                <td>${item.counterparty || '-'}</td>
              </tr>
            `
          })
          htmlContent += '</table>'
        }
        
        // 宾馆/酒店
        if (rc.hotels?.length > 0) {
          htmlContent += `
            <h4>🏨 宾馆/酒店 (${rc.hotels.length}笔)</h4>
            <table>
              <tr><th>时间</th><th>金额</th><th>酒店名称</th></tr>
          `
          rc.hotels.forEach((item: any) => {
            htmlContent += `
              <tr>
                <td>${item.time || '-'}</td>
                <td>¥${(item.amount || 0).toFixed(2)}</td>
                <td>${item.location || '-'}</td>
              </tr>
            `
          })
          htmlContent += '</table>'
        }
        
        // 娱乐场所
        if (rc.entertainment?.length > 0) {
          htmlContent += `
            <h4>🎬 娱乐场所 (${rc.entertainment.length}笔)</h4>
            <table>
              <tr><th>时间</th><th>金额</th><th>消费场所</th></tr>
          `
          rc.entertainment.forEach((item: any) => {
            htmlContent += `
              <tr>
                <td>${item.time || '-'}</td>
                <td>¥${(item.amount || 0).toFixed(2)}</td>
                <td>${item.location || '-'}</td>
              </tr>
            `
          })
          htmlContent += '</table>'
        }
        
        // 奢侈品/高端会员
        if (rc.luxury?.length > 0) {
          htmlContent += `
            <h4>⭐ 奢侈品/高端会员 (${rc.luxury.length}笔)</h4>
            <table>
              <tr><th>时间</th><th>金额</th><th>对手方</th><th>备注</th></tr>
          `
          rc.luxury.forEach((item: any) => {
            htmlContent += `
              <tr>
                <td>${item.time || '-'}</td>
                <td>¥${(item.amount || 0).toFixed(2)}</td>
                <td>${item.counterparty || '-'}</td>
                <td>${item.remark || '-'}</td>
              </tr>
            `
          })
          htmlContent += '</table>'
        }
      }
    }
    
    // 大额交易
    if (analysis.largeTransactions && analysis.largeTransactions.length > 0) {
      htmlContent += `
        <h3>大额交易</h3>
        <table>
          <tr><th>时间</th><th>金额</th><th>对手方</th><th>银行</th></tr>
      `
      analysis.largeTransactions.forEach((tx: any) => {
        htmlContent += `
          <tr>
            <td>${tx.time || '-'}</td>
            <td>¥${(tx.amount || 0).toFixed(2)}</td>
            <td>${tx.counterparty || '-'}</td>
            <td>${tx.bank || '-'}</td>
          </tr>
        `
      })
      htmlContent += '</table>'
    }
    
    // 最常消费商家
    if (analysis.topMerchants && analysis.topMerchants.length > 0) {
      htmlContent += `
        <h3>最常消费商家</h3>
        <table>
          <tr><th>商家名称</th><th>交易次数</th><th>总金额</th></tr>
      `
      analysis.topMerchants.forEach((merchant: any) => {
        htmlContent += `
          <tr>
            <td>${merchant.name || '-'}</td>
            <td>${merchant.count || 0}</td>
            <td>¥${(merchant.totalAmount || 0).toFixed(2)}</td>
          </tr>
        `
      })
      htmlContent += '</table>'
    }
    
    htmlContent += '</div>'
  })
  
  htmlContent += `
      </body>
    </html>
  `
  
  // 写入新窗口并打印
  printWindow.document.write(htmlContent)
  printWindow.document.close()
  
  // 等待内容加载完成后打印
  printWindow.onload = () => {
    printWindow.print()
  }
  
  // 如果 onload 不触发，使用 setTimeout
  setTimeout(() => {
    if (printWindow.document.readyState === 'complete') {
      printWindow.print()
    }
  }, 500)
}

// 使用 html2canvas 和 jspdf 生成 PDF
const generatePDFWithHtml2Canvas = async (analysisResults: any[], reportTitle: string) => {
  const html2canvas = (await import('html2canvas')).default
  const { jsPDF } = await import('jspdf')
  
  // 创建临时容器
  const container = document.createElement('div')
  container.style.position = 'absolute'
  container.style.left = '-9999px'
  container.style.width = '800px'
  container.style.backgroundColor = 'white'
  container.style.padding = '20px'
  document.body.appendChild(container)
  
  try {
    // 生成 HTML 内容
    let htmlContent = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h1 style="text-align: center; color: #667eea; margin-bottom: 20px;">${reportTitle}</h1>
        <hr style="border: 2px solid #667eea; margin-bottom: 30px;">
    `
    
    analysisResults.forEach((analysis, index) => {
      const userName = analysis.userPhoneAnalysis && analysis.userPhoneAnalysis.length > 0 
        ? analysis.userPhoneAnalysis[0].userName || analysis.user_identifier || `用户${index + 1}`
        : analysis.user_identifier || `用户${index + 1}`
      
      htmlContent += `
        <div style="margin-bottom: 40px; page-break-after: always;">
          <h2 style="color: #667eea; border-bottom: 1px solid #667eea; padding-bottom: 10px;">${userName} - 流水分析</h2>
          
          <h3 style="color: #667eea; margin-top: 20px;">汇总信息</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
            <tr style="background-color: #667eea; color: white;">
              <th style="padding: 8px; border: 1px solid #ddd;">指标</th>
              <th style="padding: 8px; border: 1px solid #ddd;">数值</th>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">总交易笔数</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${analysis.summary?.totalTransactions || 0}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; border: 1px solid #ddd;">总交易金额</td>
              <td style="padding: 8px; border: 1px solid #ddd;">¥${(analysis.summary?.totalAmount || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">入账笔数</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${analysis.summary?.inTransactionCount || 0}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; border: 1px solid #ddd;">入账金额</td>
              <td style="padding: 8px; border: 1px solid #ddd;">¥${(analysis.summary?.inTransactionAmount || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">出账笔数</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${analysis.summary?.outTransactionCount || 0}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; border: 1px solid #ddd;">出账金额</td>
              <td style="padding: 8px; border: 1px solid #ddd;">¥${(analysis.summary?.outTransactionAmount || 0).toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 8px; border: 1px solid #ddd;">充值笔数</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${analysis.summary?.rechargeCount || 0}</td>
            </tr>
            <tr style="background-color: #f9f9f9;">
              <td style="padding: 8px; border: 1px solid #ddd;">车辆数量</td>
              <td style="padding: 8px; border: 1px solid #ddd;">${analysis.vehicleAnalysis?.length || 0}</td>
            </tr>
          </table>
      `
      
      // 用户名下手机号码
      if (analysis.userPhoneAnalysis && analysis.userPhoneAnalysis.length > 0) {
        htmlContent += `
          <h3 style="color: #667eea; margin-top: 20px;">用户名下手机号码</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
            <tr style="background-color: #667eea; color: white;">
              <th style="padding: 6px; border: 1px solid #ddd;">手机号码</th>
              <th style="padding: 6px; border: 1px solid #ddd;">用户名</th>
              <th style="padding: 6px; border: 1px solid #ddd;">充值金额</th>
              <th style="padding: 6px; border: 1px solid #ddd;">充值次数</th>
              <th style="padding: 6px; border: 1px solid #ddd;">运营商</th>
            </tr>
        `
        analysis.userPhoneAnalysis.forEach((phone: any, idx: number) => {
          htmlContent += `
            <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
              <td style="padding: 6px; border: 1px solid #ddd;">${phone.phone || '-'}</td>
              <td style="padding: 6px; border: 1px solid #ddd;">${phone.userName || '-'}</td>
              <td style="padding: 6px; border: 1px solid #ddd;">¥${(phone.amount || 0).toFixed(2)}</td>
              <td style="padding: 6px; border: 1px solid #ddd;">${phone.count || 0}</td>
              <td style="padding: 6px; border: 1px solid #ddd;">${phone.operator || '-'}</td>
            </tr>
          `
        })
        htmlContent += '</table>'
      }
      
      // 用户名下银行卡
      if (analysis.userBankCardAnalysis && analysis.userBankCardAnalysis.length > 0) {
        htmlContent += `
          <h3 style="color: #667eea; margin-top: 20px;">用户名下银行卡</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
            <tr style="background-color: #667eea; color: white;">
              <th style="padding: 6px; border: 1px solid #ddd;">银行</th>
              <th style="padding: 6px; border: 1px solid #ddd;">账号</th>
              <th style="padding: 6px; border: 1px solid #ddd;">用户名</th>
              <th style="padding: 6px; border: 1px solid #ddd;">交易次数</th>
              <th style="padding: 6px; border: 1px solid #ddd;">总金额</th>
              <th style="padding: 6px; border: 1px solid #ddd;">入账金额</th>
              <th style="padding: 6px; border: 1px solid #ddd;">出账金额</th>
            </tr>
        `
        analysis.userBankCardAnalysis.forEach((card: any, idx: number) => {
          htmlContent += `
            <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
              <td style="padding: 6px; border: 1px solid #ddd;">${card.bank || '-'}</td>
              <td style="padding: 6px; border: 1px solid #ddd;">${card.account || '-'}</td>
              <td style="padding: 6px; border: 1px solid #ddd;">${card.userName || '-'}</td>
              <td style="padding: 6px; border: 1px solid #ddd;">${card.transactionCount || 0}</td>
              <td style="padding: 6px; border: 1px solid #ddd;">¥${(card.totalAmount || 0).toFixed(2)}</td>
              <td style="padding: 6px; border: 1px solid #ddd;">¥${(card.inAmount || 0).toFixed(2)}</td>
              <td style="padding: 6px; border: 1px solid #ddd;">¥${(card.outAmount || 0).toFixed(2)}</td>
            </tr>
          `
        })
        htmlContent += '</table>'
      }
      
      // 车辆信息关联
      if (analysis.vehicleAnalysis && analysis.vehicleAnalysis.length > 0) {
        htmlContent += `
          <h3 style="color: #667eea; margin-top: 20px;">车辆信息关联</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
            <tr style="background-color: #667eea; color: white;">
              <th style="padding: 6px; border: 1px solid #ddd;">车牌号</th>
              <th style="padding: 6px; border: 1px solid #ddd;">出现次数</th>
              <th style="padding: 6px; border: 1px solid #ddd;">关联地点</th>
            </tr>
        `
        analysis.vehicleAnalysis.forEach((vehicle: any, idx: number) => {
          htmlContent += `
            <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
              <td style="padding: 6px; border: 1px solid #ddd;">${vehicle.plateNumber || '-'}</td>
              <td style="padding: 6px; border: 1px solid #ddd;">${vehicle.count || 0}</td>
              <td style="padding: 6px; border: 1px solid #ddd;">${vehicle.locations?.join(', ') || '无'}</td>
            </tr>
          `
        })
        htmlContent += '</table>'
      }
      
      // 高频交易对手
      if (analysis.highFrequencyCounterparties && analysis.highFrequencyCounterparties.length > 0) {
        htmlContent += `
          <h3 style="color: #667eea; margin-top: 20px;">高频交易对手</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
            <tr style="background-color: #667eea; color: white;">
              <th style="padding: 6px; border: 1px solid #ddd;">对手方名称</th>
              <th style="padding: 6px; border: 1px solid #ddd;">交易笔数</th>
              <th style="padding: 6px; border: 1px solid #ddd;">交易总额</th>
              <th style="padding: 6px; border: 1px solid #ddd;">入账总额</th>
              <th style="padding: 6px; border: 1px solid #ddd;">出账总额</th>
            </tr>
        `
        analysis.highFrequencyCounterparties.forEach((cp: any, idx: number) => {
          htmlContent += `
            <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
              <td style="padding: 6px; border: 1px solid #ddd;">${cp.name || '-'}</td>
              <td style="padding: 6px; border: 1px solid #ddd;">${cp.count || 0}</td>
              <td style="padding: 6px; border: 1px solid #ddd;">¥${(cp.totalAmount || 0).toFixed(2)}</td>
              <td style="padding: 6px; border: 1px solid #ddd;">¥${(cp.inAmount || 0).toFixed(2)}</td>
              <td style="padding: 6px; border: 1px solid #ddd;">¥${(cp.outAmount || 0).toFixed(2)}</td>
            </tr>
          `
        })
        htmlContent += '</table>'
      }
      
      // 限制消费行为
      if (analysis.restrictedConsumption) {
        const rc = analysis.restrictedConsumption
        const hasConsumption = rc.flights?.length > 0 || rc.hotels?.length > 0 || rc.entertainment?.length > 0 || 
                              rc.travel?.length > 0 || rc.insurance?.length > 0 || rc.luxury?.length > 0
        
        if (hasConsumption) {
          htmlContent += `<h3 style="color: #667eea; margin-top: 20px;">限制消费行为</h3>`
          
          // 机票/高铁
          if (rc.flights?.length > 0) {
            htmlContent += `
              <h4 style="color: #333; margin-top: 15px;">✈️ 机票/高铁 (${rc.flights.length}笔)</h4>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10px;">
                <tr style="background-color: #667eea; color: white;">
                  <th style="padding: 5px; border: 1px solid #ddd;">时间</th>
                  <th style="padding: 5px; border: 1px solid #ddd;">金额</th>
                  <th style="padding: 5px; border: 1px solid #ddd;">对手方</th>
                </tr>
            `
            rc.flights.forEach((item: any, idx: number) => {
              htmlContent += `
                <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
                  <td style="padding: 5px; border: 1px solid #ddd;">${item.time || '-'}</td>
                  <td style="padding: 5px; border: 1px solid #ddd;">¥${(item.amount || 0).toFixed(2)}</td>
                  <td style="padding: 5px; border: 1px solid #ddd;">${item.counterparty || '-'}</td>
                </tr>
              `
            })
            htmlContent += '</table>'
          }
          
          // 宾馆/酒店
          if (rc.hotels?.length > 0) {
            htmlContent += `
              <h4 style="color: #333; margin-top: 15px;">🏨 宾馆/酒店 (${rc.hotels.length}笔)</h4>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10px;">
                <tr style="background-color: #667eea; color: white;">
                  <th style="padding: 5px; border: 1px solid #ddd;">时间</th>
                  <th style="padding: 5px; border: 1px solid #ddd;">金额</th>
                  <th style="padding: 5px; border: 1px solid #ddd;">酒店名称</th>
                </tr>
            `
            rc.hotels.forEach((item: any, idx: number) => {
              htmlContent += `
                <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
                  <td style="padding: 5px; border: 1px solid #ddd;">${item.time || '-'}</td>
                  <td style="padding: 5px; border: 1px solid #ddd;">¥${(item.amount || 0).toFixed(2)}</td>
                  <td style="padding: 5px; border: 1px solid #ddd;">${item.location || '-'}</td>
                </tr>
              `
            })
            htmlContent += '</table>'
          }
          
          // 娱乐场所
          if (rc.entertainment?.length > 0) {
            htmlContent += `
              <h4 style="color: #333; margin-top: 15px;">🎬 娱乐场所 (${rc.entertainment.length}笔)</h4>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10px;">
                <tr style="background-color: #667eea; color: white;">
                  <th style="padding: 5px; border: 1px solid #ddd;">时间</th>
                  <th style="padding: 5px; border: 1px solid #ddd;">金额</th>
                  <th style="padding: 5px; border: 1px solid #ddd;">消费场所</th>
                </tr>
            `
            rc.entertainment.forEach((item: any, idx: number) => {
              htmlContent += `
                <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
                  <td style="padding: 5px; border: 1px solid #ddd;">${item.time || '-'}</td>
                  <td style="padding: 5px; border: 1px solid #ddd;">¥${(item.amount || 0).toFixed(2)}</td>
                  <td style="padding: 5px; border: 1px solid #ddd;">${item.location || '-'}</td>
                </tr>
              `
            })
            htmlContent += '</table>'
          }
          
          // 奢侈品/高端会员
          if (rc.luxury?.length > 0) {
            htmlContent += `
              <h4 style="color: #333; margin-top: 15px;">⭐ 奢侈品/高端会员 (${rc.luxury.length}笔)</h4>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px; font-size: 10px;">
                <tr style="background-color: #667eea; color: white;">
                  <th style="padding: 5px; border: 1px solid #ddd;">时间</th>
                  <th style="padding: 5px; border: 1px solid #ddd;">金额</th>
                  <th style="padding: 5px; border: 1px solid #ddd;">对手方</th>
                  <th style="padding: 5px; border: 1px solid #ddd;">备注</th>
                </tr>
            `
            rc.luxury.forEach((item: any, idx: number) => {
              htmlContent += `
                <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
                  <td style="padding: 5px; border: 1px solid #ddd;">${item.time || '-'}</td>
                  <td style="padding: 5px; border: 1px solid #ddd;">¥${(item.amount || 0).toFixed(2)}</td>
                  <td style="padding: 5px; border: 1px solid #ddd;">${item.counterparty || '-'}</td>
                  <td style="padding: 5px; border: 1px solid #ddd;">${item.remark || '-'}</td>
                </tr>
              `
            })
            htmlContent += '</table>'
          }
        }
      }
      
      // 大额交易
      if (analysis.largeTransactions && analysis.largeTransactions.length > 0) {
        htmlContent += `
          <h3 style="color: #667eea; margin-top: 20px;">大额交易</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10px;">
            <tr style="background-color: #667eea; color: white;">
              <th style="padding: 5px; border: 1px solid #ddd;">时间</th>
              <th style="padding: 5px; border: 1px solid #ddd;">金额</th>
              <th style="padding: 5px; border: 1px solid #ddd;">对手方</th>
              <th style="padding: 5px; border: 1px solid #ddd;">银行</th>
            </tr>
        `
        analysis.largeTransactions.forEach((tx: any, idx: number) => {
          htmlContent += `
            <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
              <td style="padding: 5px; border: 1px solid #ddd;">${tx.time || '-'}</td>
              <td style="padding: 5px; border: 1px solid #ddd;">¥${(tx.amount || 0).toFixed(2)}</td>
              <td style="padding: 5px; border: 1px solid #ddd;">${tx.counterparty || '-'}</td>
              <td style="padding: 5px; border: 1px solid #ddd;">${tx.bank || '-'}</td>
            </tr>
          `
        })
        htmlContent += '</table>'
      }
      
      // 最常消费商家
      if (analysis.topMerchants && analysis.topMerchants.length > 0) {
        htmlContent += `
          <h3 style="color: #667eea; margin-top: 20px;">最常消费商家</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px;">
            <tr style="background-color: #667eea; color: white;">
              <th style="padding: 6px; border: 1px solid #ddd;">商家名称</th>
              <th style="padding: 6px; border: 1px solid #ddd;">交易次数</th>
              <th style="padding: 6px; border: 1px solid #ddd;">总金额</th>
            </tr>
        `
        analysis.topMerchants.forEach((merchant: any, idx: number) => {
          htmlContent += `
            <tr style="background-color: ${idx % 2 === 0 ? 'white' : '#f9f9f9'};">
              <td style="padding: 6px; border: 1px solid #ddd;">${merchant.name || '-'}</td>
              <td style="padding: 6px; border: 1px solid #ddd;">${merchant.count || 0}</td>
              <td style="padding: 6px; border: 1px solid #ddd;">¥${(merchant.totalAmount || 0).toFixed(2)}</td>
            </tr>
          `
        })
        htmlContent += '</table>'
      }
      
      htmlContent += '</div>'
    })
    
    htmlContent += '</div>'
    container.innerHTML = htmlContent
    
    // 使用 html2canvas 将 HTML 转换为 canvas
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      allowTaint: true,
      backgroundColor: '#ffffff'
    })
    
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas 生成失败，内容为空')
    }
    
    // 页边距设置 (mm)
    const marginTop = 25.4
    const marginBottom = 25.4
    const marginLeft = 25.4
    const marginRight = 25.4
    
    // 创建 PDF
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    // 使用 blob 方式获取图片数据，避免 CSP data URL 问题
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('无法生成图片 Blob'))
        }
      }, 'image/jpeg', 0.95)
    })
    
    // 将 blob 转换为 base64
    const reader = new FileReader()
    const base64Promise = new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        const result = reader.result as string
        resolve(result)
      }
      reader.onerror = () => reject(new Error('读取图片数据失败'))
      reader.readAsDataURL(blob)
    })
    const imgData = await base64Promise
    
    if (!imgData) {
      throw new Error('图片数据生成失败')
    }
    
    // A4 尺寸 (mm)
    const pageWidth = 210
    const pageHeight = 297
    
    // 内容区域尺寸（减去页边距）
    const contentWidth = pageWidth - marginLeft - marginRight
    const contentHeight = pageHeight - marginTop - marginBottom
    
    // 图片尺寸
    const imgWidth = contentWidth
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    let heightLeft = imgHeight
    let position = marginTop
    
    // 添加第一页
    pdf.addImage(imgData, 'JPEG', marginLeft, position, imgWidth, imgHeight)
    heightLeft -= contentHeight
    
    // 如果内容超过一页，添加新页面
    while (heightLeft > 0) {
      position = marginTop - (imgHeight - heightLeft - contentHeight)
      pdf.addPage()
      pdf.addImage(imgData, 'JPEG', marginLeft, position, imgWidth, imgHeight)
      heightLeft -= contentHeight
    }
    
    // 下载 PDF
    pdf.save(`${reportTitle}.pdf`)
  } finally {
    // 清理临时容器
    document.body.removeChild(container)
  }
}

// 使用 pdfmake 生成 PDF
const generatePDFWithPdfMake = (analysisResults: any[], reportTitle: string) => {
  const docDefinition: any = {
    pageSize: 'A4',
    pageMargins: [25.4, 25.4, 25.4, 25.4],
    content: [],
    defaultStyle: {
      font: 'Roboto'
    },
    styles: {
      header: {
        fontSize: 24,
        bold: true,
        alignment: 'center',
        margin: [0, 0, 0, 20]
      },
      sectionTitle: {
        fontSize: 18,
        bold: true,
        color: '#667eea',
        margin: [0, 20, 0, 10]
      },
      subSectionTitle: {
        fontSize: 14,
        bold: true,
        color: '#667eea',
        margin: [0, 15, 0, 8]
      },
      tableHeader: {
        bold: true,
        fontSize: 10,
        color: 'white',
        fillColor: '#667eea'
      },
      tableCell: {
        fontSize: 9
      },
      summaryCard: {
        fontSize: 16,
        bold: true,
        color: 'white',
        alignment: 'center'
      },
      summaryLabel: {
        fontSize: 10,
        color: 'white',
        alignment: 'center'
      },
      footer: {
        fontSize: 10,
        color: '#666',
        alignment: 'center',
        margin: [0, 20, 0, 0]
      }
    }
  }

  // 添加标题
  docDefinition.content.push({
    text: reportTitle,
    style: 'header'
  })

  // 添加分隔线
  docDefinition.content.push({
    canvas: [{
      type: 'line',
      x1: 0,
      y1: 0,
      x2: 515,
      y2: 0,
      lineWidth: 2,
      lineColor: '#667eea'
    }],
    margin: [0, 0, 0, 20]
  })

  // 为每个分析结果生成内容
  analysisResults.forEach((analysis, index) => {
    const userName = analysis.userPhoneAnalysis && analysis.userPhoneAnalysis.length > 0 
      ? analysis.userPhoneAnalysis[0].userName || analysis.user_identifier || `用户${index + 1}`
      : analysis.user_identifier || `用户${index + 1}`

    // 添加用户标题
    docDefinition.content.push({
      text: `${userName} - 流水分析`,
      style: 'sectionTitle'
    })

    // 添加汇总信息
    const summary = analysis.summary || {}
    const userPhoneAnalysis = analysis.userPhoneAnalysis || []
    const userBankCardAnalysis = analysis.userBankCardAnalysis || []
    const vehicleAnalysis = analysis.vehicleAnalysis || []
    const highFrequencyCounterparties = analysis.highFrequencyCounterparties || []
    const restrictedConsumption = analysis.restrictedConsumption || {}
    const largeTransactions = analysis.largeTransactions || []
    const topMerchants = analysis.topMerchants || []

    // 汇总信息表格
    docDefinition.content.push({
      text: '汇总信息',
      style: 'subSectionTitle'
    })

    docDefinition.content.push({
      table: {
        widths: ['*', '*', '*', '*'],
        body: [
          [
            { text: `${summary.totalTransactions || 0}\n总交易笔数`, style: 'summaryCard', fillColor: '#667eea', margin: [0, 10] },
            { text: `${formatCurrency(Math.abs(summary.totalAmount || 0))}\n总交易金额`, style: 'summaryCard', fillColor: '#667eea', margin: [0, 10] },
            { text: `${summary.inTransactionCount || 0}\n入账笔数`, style: 'summaryCard', fillColor: '#667eea', margin: [0, 10] },
            { text: `${formatCurrency(summary.inTransactionAmount || 0)}\n入账金额`, style: 'summaryCard', fillColor: '#667eea', margin: [0, 10] }
          ],
          [
            { text: `${summary.outTransactionCount || 0}\n出账笔数`, style: 'summaryCard', fillColor: '#667eea', margin: [0, 10] },
            { text: `${formatCurrency(summary.outTransactionAmount || 0)}\n出账金额`, style: 'summaryCard', fillColor: '#667eea', margin: [0, 10] },
            { text: `${summary.rechargeCount || 0}\n充值笔数`, style: 'summaryCard', fillColor: '#667eea', margin: [0, 10] },
            { text: `${vehicleAnalysis.length}\n车辆数量`, style: 'summaryCard', fillColor: '#667eea', margin: [0, 10] }
          ]
        ]
      },
      layout: {
        hLineWidth: () => 0,
        vLineWidth: () => 0,
        paddingLeft: () => 5,
        paddingRight: () => 5,
        paddingTop: () => 5,
        paddingBottom: () => 5
      },
      margin: [0, 0, 0, 20]
    })

    // 用户名下手机号码
    if (userPhoneAnalysis.length > 0) {
      docDefinition.content.push({
        text: '用户名下手机号码',
        style: 'subSectionTitle'
      })
      docDefinition.content.push({
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            ['手机号码', '用户名', '用户ID', '充值总金额', '充值次数', '运营商'],
            ...userPhoneAnalysis.map(item => [
              item.phone,
              item.userName,
              item.userId,
              formatCurrency(item.amount),
              item.count,
              item.operator
            ])
          ]
        },
        layout: {
          fillColor: (rowIndex: number) => rowIndex === 0 ? '#667eea' : null,
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#ddd',
          vLineColor: () => '#ddd'
        },
        margin: [0, 0, 0, 15]
      })
    }

    // 用户名下银行卡
    if (userBankCardAnalysis.length > 0) {
      docDefinition.content.push({
        text: '用户名下银行卡',
        style: 'subSectionTitle'
      })
      docDefinition.content.push({
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            ['银行', '账号', '用户名', '用户ID', '交易次数', '总金额', '入账金额', '出账金额', '首次交易时间', '最后交易时间'],
            ...userBankCardAnalysis.map(item => [
              item.bank,
              item.account,
              item.userName,
              item.userId,
              item.transactionCount,
              formatCurrency(item.totalAmount),
              formatCurrency(item.inAmount),
              formatCurrency(item.outAmount),
              formatDateTime(item.firstTransactionTime),
              formatDateTime(item.lastTransactionTime)
            ])
          ]
        },
        layout: {
          fillColor: (rowIndex: number) => rowIndex === 0 ? '#667eea' : null,
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#ddd',
          vLineColor: () => '#ddd'
        },
        margin: [0, 0, 0, 15]
      })
    }

    // 车辆信息关联
    if (vehicleAnalysis.length > 0) {
      docDefinition.content.push({
        text: '车辆信息关联',
        style: 'subSectionTitle'
      })
      docDefinition.content.push({
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*'],
          body: [
            ['车牌号', '出现次数', '关联地点'],
            ...vehicleAnalysis.map(item => [
              item.plateNumber,
              item.count,
              item.locations?.join(', ') || '无'
            ])
          ]
        },
        layout: {
          fillColor: (rowIndex: number) => rowIndex === 0 ? '#667eea' : null,
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#ddd',
          vLineColor: () => '#ddd'
        },
        margin: [0, 0, 0, 15]
      })
    }

    // 高频交易对手
    if (highFrequencyCounterparties.length > 0) {
      docDefinition.content.push({
        text: '高频交易对手',
        style: 'subSectionTitle'
      })
      docDefinition.content.push({
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            ['对手方名称', '对手方ID', '对手方银行', '对手方账号', '交易次数', '总金额', '入账金额', '出账金额'],
            ...highFrequencyCounterparties.map(item => [
              item.name,
              item.id,
              item.bank,
              item.account,
              item.count,
              formatCurrency(item.totalAmount),
              formatCurrency(item.inAmount),
              formatCurrency(item.outAmount)
            ])
          ]
        },
        layout: {
          fillColor: (rowIndex: number) => rowIndex === 0 ? '#667eea' : null,
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#ddd',
          vLineColor: () => '#ddd'
        },
        margin: [0, 0, 0, 15]
      })
    }

    // 限制消费行为分析
    const hasRestrictedConsumption = restrictedConsumption.flights?.length > 0 ||
      restrictedConsumption.hotels?.length > 0 ||
      restrictedConsumption.entertainment?.length > 0 ||
      restrictedConsumption.travel?.length > 0 ||
      restrictedConsumption.realEstate?.length > 0 ||
      restrictedConsumption.insurance?.length > 0 ||
      restrictedConsumption.luxury?.length > 0

    if (hasRestrictedConsumption) {
      docDefinition.content.push({
        text: '限制消费行为分析',
        style: 'subSectionTitle',
        color: '#e74c3c'
      })

      // 航班消费
      if (restrictedConsumption.flights?.length > 0) {
        docDefinition.content.push({
          text: `航班消费 (${restrictedConsumption.flights.length}笔)`,
          style: 'subSectionTitle'
        })
        docDefinition.content.push({
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', '*'],
            body: [
              ['时间', '金额', '对手方', '地点'],
              ...restrictedConsumption.flights.map((item: any) => [
                formatDateTime(item.time),
                formatCurrency(item.amount),
                item.counterparty,
                item.location
              ])
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#667eea' : null,
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#ddd',
            vLineColor: () => '#ddd'
          },
          margin: [0, 0, 0, 10]
        })
      }

      // 宾馆/酒店
      if (restrictedConsumption.hotels?.length > 0) {
        docDefinition.content.push({
          text: `宾馆/酒店 (${restrictedConsumption.hotels.length}笔)`,
          style: 'subSectionTitle'
        })
        docDefinition.content.push({
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*'],
            body: [
              ['时间', '金额', '地点'],
              ...restrictedConsumption.hotels.map((item: any) => [
                formatDateTime(item.time),
                formatCurrency(item.amount),
                item.location
              ])
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#667eea' : null,
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#ddd',
            vLineColor: () => '#ddd'
          },
          margin: [0, 0, 0, 10]
        })
      }

      // 娱乐场所
      if (restrictedConsumption.entertainment?.length > 0) {
        docDefinition.content.push({
          text: `娱乐场所 (${restrictedConsumption.entertainment.length}笔)`,
          style: 'subSectionTitle'
        })
        docDefinition.content.push({
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', '*'],
            body: [
              ['时间', '金额', '对手方', '地点'],
              ...restrictedConsumption.entertainment.map((item: any) => [
                formatDateTime(item.time),
                formatCurrency(item.amount),
                item.counterparty,
                item.location
              ])
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#667eea' : null,
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#ddd',
            vLineColor: () => '#ddd'
          },
          margin: [0, 0, 0, 10]
        })
      }

      // 旅行社/旅游
      if (restrictedConsumption.travel?.length > 0) {
        docDefinition.content.push({
          text: `旅行社/旅游 (${restrictedConsumption.travel.length}笔)`,
          style: 'subSectionTitle'
        })
        docDefinition.content.push({
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', '*'],
            body: [
              ['时间', '金额', '对手方', '地点'],
              ...restrictedConsumption.travel.map((item: any) => [
                formatDateTime(item.time),
                formatCurrency(item.amount),
                item.counterparty,
                item.location
              ])
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#667eea' : null,
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#ddd',
            vLineColor: () => '#ddd'
          },
          margin: [0, 0, 0, 10]
        })
      }

      // 房地产/装修
      if (restrictedConsumption.realEstate?.length > 0) {
        docDefinition.content.push({
          text: `房地产/装修 (${restrictedConsumption.realEstate.length}笔)`,
          style: 'subSectionTitle'
        })
        docDefinition.content.push({
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', '*'],
            body: [
              ['时间', '金额', '对手方', '地点'],
              ...restrictedConsumption.realEstate.map((item: any) => [
                formatDateTime(item.time),
                formatCurrency(item.amount),
                item.counterparty,
                item.location
              ])
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#667eea' : null,
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#ddd',
            vLineColor: () => '#ddd'
          },
          margin: [0, 0, 0, 10]
        })
      }

      // 保险/证券/基金
      if (restrictedConsumption.insurance?.length > 0) {
        docDefinition.content.push({
          text: `保险/证券/基金 (${restrictedConsumption.insurance.length}笔)`,
          style: 'subSectionTitle'
        })
        docDefinition.content.push({
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', '*'],
            body: [
              ['时间', '金额', '对手方', '地点'],
              ...restrictedConsumption.insurance.map((item: any) => [
                formatDateTime(item.time),
                formatCurrency(item.amount),
                item.counterparty,
                item.location
              ])
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#667eea' : null,
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#ddd',
            vLineColor: () => '#ddd'
          },
          margin: [0, 0, 0, 10]
        })
      }

      // 奢侈品/高端会员
      if (restrictedConsumption.luxury?.length > 0) {
        docDefinition.content.push({
          text: `奢侈品/高端会员 (${restrictedConsumption.luxury.length}笔)`,
          style: 'subSectionTitle'
        })
        docDefinition.content.push({
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', '*'],
            body: [
              ['时间', '金额', '对手方', '备注'],
              ...restrictedConsumption.luxury.map((item: any) => [
                formatDateTime(item.time),
                formatCurrency(item.amount),
                item.counterparty,
                item.remark
              ])
            ]
          },
          layout: {
            fillColor: (rowIndex: number) => rowIndex === 0 ? '#667eea' : null,
            hLineWidth: () => 1,
            vLineWidth: () => 1,
            hLineColor: () => '#ddd',
            vLineColor: () => '#ddd'
          },
          margin: [0, 0, 0, 10]
        })
      }
    }

    // 大额交易
    if (largeTransactions.length > 0) {
      docDefinition.content.push({
        text: '大额交易',
        style: 'subSectionTitle'
      })
      docDefinition.content.push({
        table: {
          headerRows: 1,
          widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto', 'auto', 'auto'],
          body: [
            ['时间', '金额', '对手方', '对手方ID', '对手方银行', '对手方账号', '银行', '账号'],
            ...largeTransactions.map(item => [
              formatDateTime(item.time),
              formatCurrency(item.amount),
              item.counterparty,
              item.counterpartyId,
              item.counterpartyBank,
              item.counterpartyAccount,
              item.bank,
              item.account
            ])
          ]
        },
        layout: {
          fillColor: (rowIndex: number) => rowIndex === 0 ? '#667eea' : null,
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#ddd',
          vLineColor: () => '#ddd'
        },
        margin: [0, 0, 0, 15]
      })
    }

    // 最常消费商家
    if (topMerchants.length > 0) {
      docDefinition.content.push({
        text: '最常消费商家',
        style: 'subSectionTitle'
      })
      docDefinition.content.push({
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            ['商家名称', '交易次数', '总金额'],
            ...topMerchants.map(item => [
              item.name,
              item.count,
              formatCurrency(item.totalAmount)
            ])
          ]
        },
        layout: {
          fillColor: (rowIndex: number) => rowIndex === 0 ? '#667eea' : null,
          hLineWidth: () => 1,
          vLineWidth: () => 1,
          hLineColor: () => '#ddd',
          vLineColor: () => '#ddd'
        },
        margin: [0, 0, 0, 15]
      })
    }

    // 添加分页符（除了最后一个用户）
    if (index < analysisResults.length - 1) {
      docDefinition.content.push({ text: '', pageBreak: 'after' })
    }
  })

  // 添加页脚
  docDefinition.content.push({
    canvas: [{
      type: 'line',
      x1: 0,
      y1: 0,
      x2: 515,
      y2: 0,
      lineWidth: 2,
      lineColor: '#667eea'
    }],
    margin: [0, 30, 0, 15]
  })

  docDefinition.content.push({
    text: `报告生成时间：${new Date().toLocaleString('zh-CN')}`,
    style: 'footer'
  })

  docDefinition.content.push({
    text: '本报告由极执网智能分析系统自动生成，仅供参考，具体执行情况以法院认定为准。',
    style: 'footer',
    fontSize: 9,
    color: '#999'
  })

  return docDefinition
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
