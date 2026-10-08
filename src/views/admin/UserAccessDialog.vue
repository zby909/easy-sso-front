<template>
  <el-dialog v-model="open" :title="`平台准入 · ${user?.email || ''}`" width="min(760px, 94vw)">
    <el-alert
      title="所有平台默认不准入。平台封禁只撤销此用户在此平台的长期凭据，不影响中心身份和其他平台；已签发AT自然过期。"
      type="info"
      :closable="false"
      class="mb-4"
    />
    <el-alert
      v-if="user?.blocked || !user?.joinedAt"
      title="用户被全局封禁或尚未加入组织，不能开通平台。"
      type="warning"
      :closable="false"
      class="mb-4"
    />
    <el-table :data="rows" v-loading="loading">
      <el-table-column prop="name" label="业务平台" min-width="160" />
      <el-table-column prop="clientId" label="Client ID" min-width="150" />
      <el-table-column label="准入状态" width="110"
        ><template #default="{ row }"
          ><el-tag :type="row.status === 'allowed' ? 'success' : 'info'">{{ labels[row.status] }}</el-tag
          ><span v-if="!row.enabled" class="block text-xs text-gray-500">平台已停用</span></template
        ></el-table-column
      >
      <el-table-column label="操作" min-width="180"
        ><template #default="{ row }">
          <el-button
            v-if="row.status !== 'allowed'"
            link
            type="primary"
            :disabled="saving || user?.blocked || !user?.joinedAt || !row.enabled"
            @click="change(row, true)"
            >允许进入</el-button
          >
          <el-button link type="danger" :disabled="saving" @click="change(row, false)">强退并封禁</el-button>
        </template></el-table-column
      >
    </el-table>
  </el-dialog>
</template>
<script setup lang="ts">
import { ref } from 'vue';
import * as api from '@/api/modules/admin.api';
import { getErrorMessage } from '@/api/create-axios';
const open = ref(false);
const loading = ref(false);
const saving = ref(false);
let generation = 0;
const user = ref<Api.Response.AdminUser | null>(null);
const rows = ref<Api.Response.UserAccess[]>([]);
const labels: Record<string, string> = { not_granted: '未开通', allowed: '已允许', blocked: '已封禁' };
const emit = defineEmits<{ changed: [] }>();

// 每次打开重新读取，不能根据前端保存的允许名单放行。
async function load() {
  if (!user.value) return;
  const current = ++generation;
  const id = user.value.id;
  loading.value = true;
  try {
    const response = await api.getUserAccess(id);
    if (current === generation && user.value?.id === id) rows.value = response.data || [];
  } catch (error) {
    if (current === generation) ElMessage.error(getErrorMessage(error, '准入加载失败'));
  } finally {
    if (current === generation) loading.value = false;
  }
}
// 将用户和当前准入绑定同一对话框，后台变更后刷新状态。
async function show(value: Api.Response.AdminUser) {
  user.value = value;
  rows.value = [];
  open.value = true;
  await load();
}
// 开通/封禁明确确认，部分故障后仍重新读取服务端关闭状态。
async function change(row: Api.Response.UserAccess, allowed: boolean) {
  if (!user.value || saving.value) return;
  const target = user.value;
  try {
    await ElMessageBox.confirm(
      allowed ? `允许 ${target.email} 进入 ${row.name}？` : `强退并封禁 ${target.email} 在 ${row.name} 的准入？其他平台不受影响。`,
      allowed ? '开通平台' : '平台封禁',
    );
    if (user.value?.id !== target.id) return;
    saving.value = true;
    await api.setUserAccess(target.id, row.clientId, allowed);
    ElMessage.success(allowed ? '已允许，需重新授权获取新Token' : '已封禁此平台，短Token将自然过期');
    emit('changed');
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') ElMessage.error(getErrorMessage(error, '准入操作失败'));
  } finally {
    saving.value = false;
    await load();
  }
}
defineExpose({ show });
</script>
