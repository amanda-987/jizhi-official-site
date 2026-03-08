<template>
  <el-table :data="data || []" stripe v-bind="$attrs">
    <el-table-column
      v-for="col in columns"
      :key="col.prop"
      :prop="col.prop"
      :label="col.label"
      :width="col.width"
      :min-width="col.minWidth"
    >
      <template #default="{ row }">
        <template v-if="col.formatter">
          {{ col.formatter(row[col.prop], row) }}
        </template>
        <template v-else>
          {{ row[col.prop] ?? '-' }}
        </template>
      </template>
    </el-table-column>
    <template #empty>
      <el-empty description="暂无数据" />
    </template>
  </el-table>
</template>

<script setup lang="ts">
interface Column {
  prop: string
  label: string
  width?: number | string
  minWidth?: number | string
  formatter?: (value: any, row: any) => string
}

interface Props {
  data: any[]
  columns: Column[]
}

defineProps<Props>()
</script>
