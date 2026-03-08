<template>
  <div class="consumption-stats">
    <el-row :gutter="20">
      <el-col :span="6" v-for="item in statItems" :key="item.key">
        <el-card shadow="hover" :style="{ background: item.gradient, color: 'white' }">
          <div class="stat-content">
            <div class="stat-title">{{ item.title }}</div>
            <div class="stat-count">{{ getCount(item.key) }}</div>
            <div class="stat-amount">{{ getAmount(item.key) }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
    <el-row :gutter="20" style="margin-top: 20px;">
      <el-col :span="8" v-for="item in secondaryStatItems" :key="item.key">
        <el-card shadow="hover" :style="{ background: item.gradient, color: 'white' }">
          <div class="stat-content">
            <div class="stat-title">{{ item.title }}</div>
            <div class="stat-count">{{ getCount(item.key) }}</div>
            <div class="stat-amount">{{ getAmount(item.key) }}</div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
interface Props {
  data: any
}

const props = defineProps<Props>()

const statItems = [
  { key: 'flights', title: '机票/高铁', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { key: 'hotels', title: '宾馆/酒店', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' },
  { key: 'entertainment', title: '娱乐场所', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' },
  { key: 'luxury', title: '奢侈品/高端会员', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' }
]

const secondaryStatItems = [
  { key: 'travel', title: '旅行社/旅游', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' },
  { key: 'realEstate', title: '房地产/装修', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)' },
  { key: 'insurance', title: '保险/证券/基金', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }
]

function getCount(key: string): number {
  return props.data?.[key]?.length || 0
}

function getAmount(key: string): string {
  const items = props.data?.[key] || []
  const total = items.reduce((sum: number, item: any) => sum + Math.abs(item.amount || 0), 0)
  return formatCurrency(total)
}

function formatCurrency(amount: number): string {
  if (amount === undefined || amount === null) return '¥0.00'
  return `¥${Number(amount).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
}
</script>

<style scoped>
.consumption-stats {
  margin-bottom: 20px;
}

.stat-content {
  text-align: center;
}

.stat-title {
  font-size: 14px;
  opacity: 0.9;
}

.stat-count {
  font-size: 28px;
  font-weight: bold;
  margin: 10px 0;
}

.stat-amount {
  font-size: 14px;
  opacity: 0.9;
}
</style>
