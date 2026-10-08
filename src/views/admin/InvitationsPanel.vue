<template>
  <section class="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
    <div class="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h2 class="text-lg font-semibold">组织邀请</h2>
        <p class="text-sm text-gray-500">邮箱绑定、七天有效、只能接受一次；加入后所有平台默认未开通。</p>
      </div>
      <el-button type="primary" @click="open = true">创建邀请</el-button>
    </div>
    <el-table :data="rows" stripe>
      <el-table-column prop="email" label="受邀邮箱" min-width="200" />
      <el-table-column label="状态" width="100"
        ><template #default="{ row }"
          ><el-tag :type="row.status === 'pending' ? 'warning' : 'info'">{{ labels[row.status] }}</el-tag></template
        ></el-table-column
      >
      <el-table-column label="失效时间" min-width="170"
        ><template #default="{ row }">{{ new Date(row.expiresAt).toLocaleString() }}</template></el-table-column
      >
      <el-table-column label="操作" width="100"
        ><template #default="{ row }"
          ><el-button link type="danger" :disabled="row.status !== 'pending'" @click="revoke(row)">撤销</el-button></template
        ></el-table-column
      >
    </el-table>
    <el-dialog v-model="open" title="邀请成员" width="min(560px, 92vw)" @closed="clearLink">
      <el-input v-model="email" type="email" placeholder="受邀人的实际邮箱" :disabled="Boolean(link)" />
      <template v-if="link"
        ><el-alert class="mt-4" title="链接只在创建时显示，请复制发送给该邮箱所有者。链接不是平台准入许可。" type="info" :closable="false" /><el-input
          class="mt-3"
          :model-value="link"
          type="textarea"
          readonly
          :rows="3"
        /><el-button class="mt-3" @click="copy">复制邀请链接</el-button></template
      >
      <template #footer
        ><el-button @click="open = false">关闭</el-button
        ><el-button v-if="!link" type="primary" :loading="saving" @click="create">生成邀请</el-button></template
      >
    </el-dialog>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import * as api from '@/api/modules/admin.api';
import { getErrorMessage } from '@/api/create-axios';
const rows = ref<Api.Response.Invitation[]>([]);
const open = ref(false);
const saving = ref(false);
const email = ref('');
const link = ref('');
const labels: Record<string, string> = { pending: '待接受', accepted: '已加入', expired: '已过期', revoked: '已撤销' };
const emit = defineEmits<{ changed: [] }>();

// 列表不能恢复Token，关闭创建对话框时清除页面内链接。
function clearLink() {
  link.value = '';
  email.value = '';
}
// 邀请状态最终以服务端检查为准。
async function load() {
  try {
    const response = await api.getInvitations();
    rows.value = response.data || [];
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '邀请加载失败'));
  }
}
// 不猜测邮箱，不自动发邮件；用户主动将生成链接发送给受邀人。
async function create() {
  if (saving.value) return;
  saving.value = true;
  try {
    const response = await api.createInvitation(email.value.trim());
    if (!response.data) throw new Error(response.msg || '未获得邀请');
    link.value = response.data.invitationUrl;
    await load();
    emit('changed');
  } catch (error) {
    ElMessage.error(getErrorMessage(error, '创建邀请失败'));
  } finally {
    saving.value = false;
  }
}
// 剪贴板失败时仍可手动复制文本，不额外存储邀请Token。
async function copy() {
  try {
    await navigator.clipboard.writeText(link.value);
    ElMessage.success('已复制，请发送给受邀人');
  } catch {
    ElMessage.error('无法访问剪贴板，请手动复制链接');
  }
}
// 已接受邀请不能通过撤销倒退成员资格，需使用全局封禁。
async function revoke(row: Api.Response.Invitation) {
  try {
    await ElMessageBox.confirm(`撤销 ${row.email} 的未接受邀请？`, '撤销邀请');
    await api.revokeInvitation(row.id);
    await load();
    emit('changed');
  } catch (error) {
    if (error !== 'cancel' && error !== 'close') ElMessage.error(getErrorMessage(error, '撤销失败'));
  }
}
defineExpose({ load });
onMounted(load);
</script>
