<template>
  <div v-if="hasData" class="stats-container">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value">{{ analysis.user_bank_card_analysis?.length || 0 }}</div>
            <div class="stat-label">银行卡总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value">{{ totalTransactionCount }}</div>
            <div class="stat-label">总交易次数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value in">{{ formatCurrency(totalInAmount) }}</div>
            <div class="stat-label">总入账金额</div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card shadow="hover">
          <div class="stat-item">
            <div class="stat-value out">{{ formatCurrency(totalOutAmount) }}</div>
            <div class="stat-label">总出账金额</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  analysis: any
}

const props = defineProps<Props>()

const hasData = computed(() => props.analysis?.user_bank_card_analysis?.length > 0)

const totalTransactionCount = computed(() => {
  return props.analysis?.user_bank_card_analysis?.reduce((sum: number, item: any) => sum + (item.transactionCount || 0), 0) || 0
})

const totalInAmount = computed(() => {
  return props.analysis?.user_bank_card_analysis?.reduce((sum: number, item: any) => sum + (item.inAmount || 0), 0) || 0
})

const totalOutAmount = computed(() => {
  return props.analysis?.user_bank_card_analysis?.reduce((sum: number, item: any) => sum + (item.outAmount || 0), 0) || 0
})

function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null) return '¥0.00'
  return `¥${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}
</script>

<style scoped>
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
</style>
