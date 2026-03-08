<template>
  <div class="consumption-details">
    <el-collapse v-model="activeNames">
      <el-collapse-item 
        v-for="section in sections" 
        :key="section.key"
        :name="section.key"
        :title="section.title"
        v-if="hasData(section.key)"
      >
        <data-table :data="getData(section.key)" :columns="section.columns" />
      </el-collapse-item>
    </el-collapse>
    <el-empty v-if="!hasAnyData" description="暂无限制消费行为数据" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  data: any
}

const props = defineProps<Props>()

const activeNames = ref<string[]>([])

const sections = [
  {
    key: 'flights',
    title: '机票/高铁',
    columns: [
      { prop: 'time', label: '时间', formatter: formatDateTime },
      { prop: 'amount', label: '金额', formatter: formatCurrency },
      { prop: 'counterparty', label: '对手方' }
    ]
  },
  {
    key: 'hotels',
    title: '宾馆/酒店',
    columns: [
      { prop: 'time', label: '时间', formatter: formatDateTime },
      { prop: 'amount', label: '金额', formatter: formatCurrency },
      { prop: 'location', label: '酒店名称' }
    ]
  },
  {
    key: 'entertainment',
    title: '娱乐场所',
    columns: [
      { prop: 'time', label: '时间', formatter: formatDateTime },
      { prop: 'amount', label: '金额', formatter: formatCurrency },
      { prop: 'location', label: '消费场所' },
      { prop: 'counterparty', label: '备注' }
    ]
  },
  {
    key: 'travel',
    title: '旅行社/旅游',
    columns: [
      { prop: 'time', label: '时间', formatter: formatDateTime },
      { prop: 'amount', label: '金额', formatter: formatCurrency },
      { prop: 'counterparty', label: '对手方' }
    ]
  },
  {
    key: 'realEstate',
    title: '房地产/装修',
    columns: [
      { prop: 'time', label: '时间', formatter: formatDateTime },
      { prop: 'amount', label: '金额', formatter: formatCurrency },
      { prop: 'location', label: '消费场所' },
      { prop: 'counterparty', label: '对手方' }
    ]
  },
  {
    key: 'insurance',
    title: '保险/证券/基金',
    columns: [
      { prop: 'time', label: '时间', formatter: formatDateTime },
      { prop: 'amount', label: '金额', formatter: formatCurrency },
      { prop: 'counterparty', label: '对手方' }
    ]
  },
  {
    key: 'luxury',
    title: '奢侈品/高端会员',
    columns: [
      { prop: 'time', label: '时间', formatter: formatDateTime },
      { prop: 'amount', label: '金额', formatter: formatCurrency },
      { prop: 'counterparty', label: '对手方' },
      { prop: 'remark', label: '备注' }
    ]
  }
]

const hasAnyData = computed(() => {
  return sections.some(section => hasData(section.key))
})

function hasData(key: string): boolean {
  const items = props.data?.[key]
  return Array.isArray(items) && items.length > 0
}

function getData(key: string): any[] {
  return props.data?.[key] || []
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
</script>

<style scoped>
.consumption-details {
  margin-top: 20px;
}
</style>
