<template>
  <div class="mx-auto w-full max-w-6xl space-y-6">
    <div class="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
      <div>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100">SSO 管理后台</h1>
        <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">管理接入系统、用户会话和授权边界</p>
      </div>
      <el-button :loading="loading" @click="loadAll">
        <Icon icon="mdi:refresh" class="mr-1" />
        刷新
      </el-button>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <div v-for="card in summaryCards" :key="card.label" class="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
        <div class="flex items-center justify-between">
          <span class="text-sm text-gray-500 dark:text-gray-400">{{ card.label }}</span>
          <Icon :icon="card.icon" class="text-xl text-blue-500" />
        </div>
        <p class="mt-3 text-3xl font-semibold text-gray-900 dark:text-gray-100">{{ card.value }}</p>
      </div>
    </div>

    <InvitationsPanel ref="invitationsPanel" @changed="loadAll" />

    <section class="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
      <div class="mb-5 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">接入系统</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">回调地址必须精确匹配；停用撤销长期凭据，短 Token 自然过期</p>
        </div>
        <el-button type="primary" @click="openCreateClient">
          <Icon icon="mdi:plus" class="mr-1" />
          添加系统
        </el-button>
      </div>

      <el-table :data="clients" stripe>
        <el-table-column prop="name" label="系统名称" min-width="140" />
        <el-table-column prop="id" label="Client ID" min-width="150" />
        <el-table-column label="回调地址" min-width="300">
          <template #default="{ row }">
            <div class="space-y-1">
              <code v-for="uri in row.redirectUris" :key="uri" class="block text-xs break-all text-gray-600 dark:text-gray-300">
                {{ uri }}
              </code>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90">
          <template #default="{ row }">
            <el-tag :type="row.enabled ? 'success' : 'info'">{{ row.enabled ? '启用' : '停用' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openEditClient(row)">编辑</el-button>
            <el-button link type="danger" @click="removeClient(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </section>

    <section class="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
      <div class="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 class="text-lg font-semibold text-gray-900 dark:text-gray-100">用户与登录会话</h2>
          <p class="text-sm text-gray-500 dark:text-gray-400">强退清除中心会话、Refresh Token 和旧授权码；短 Token 最长仍有效 15 分钟</p>
        </div>
        <el-input v-model="userSearch" class="sm:!w-72" clearable placeholder="搜索姓名或邮箱" @keyup.enter="loadUsers" @clear="loadUsers">
          <template #append>
            <el-button @click="loadUsers">
              <Icon icon="mdi:magnify" />
            </el-button>
          </template>
        </el-input>
      </div>

      <el-table :data="users" stripe>
        <el-table-column prop="name" label="用户" min-width="130" />
        <el-table-column label="组织状态" width="110"
          ><template #default="{ row }"
            ><el-tag :type="row.blocked ? 'danger' : row.joinedAt ? 'success' : 'info'">{{
              row.blocked ? '全局封禁' : row.joinedAt ? '已加入' : '待邀请'
            }}</el-tag></template
          ></el-table-column
        >
        <el-table-column prop="email" label="邮箱" min-width="220" />
        <el-table-column label="身份" width="90">
          <template #default="{ row }">
            <el-tag v-if="row.isAdmin" type="warning">管理员</el-tag>
            <span v-else class="text-sm text-gray-500">用户</span>
          </template>
        </el-table-column>
        <el-table-column label="在线会话" width="100">
          <template #default="{ row }">
            <el-tag :type="row.activeSessions ? 'success' : 'info'">{{ row.activeSessions }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="最后登录" min-width="170">
          <template #default="{ row }">{{ formatTime(row.lastLoginAt) }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="250" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="accessDialog?.show(row)">平台准入</el-button>
            <el-button v-if="row.blocked" link type="primary" :disabled="savingGlobal !== null" @click="changeGlobal(row, false)"
              >解除全局封禁</el-button
            >
            <el-button
              v-else
              link
              type="danger"
              :disabled="savingGlobal !== null || row.id === userStore.userInfo?.id"
              @click="changeGlobal(row, true)"
              >全局强退并封禁</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </section>

    <section class="rounded-xl bg-white p-5 shadow-sm dark:bg-gray-800">
      <h2 class="mb-4 text-lg font-semibold text-gray-900 dark:text-gray-100">最近管理操作</h2>
      <el-table :data="overview?.recentAudits || []" size="small">
        <el-table-column label="时间" min-width="170">
          <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
        </el-table-column>
        <el-table-column label="管理员" min-width="200">
          <template #default="{ row }">{{ row.actor?.email || `用户 ${row.actorUserId || '-'}` }}</template>
        </el-table-column>
        <el-table-column prop="action" label="操作" min-width="160" />
        <el-table-column prop="targetId" label="目标" min-width="140" />
      </el-table>
    </section>

    <UserAccessDialog ref="accessDialog" @changed="loadAll" />
    <el-dialog v-model="clientDialogVisible" :title="editingClientId ? '编辑接入系统' : '添加接入系统'" width="min(560px, 92vw)">
      <el-form label-position="top">
        <el-form-item label="Client ID">
          <el-input v-model="clientForm.id" :disabled="Boolean(editingClientId)" placeholder="例如：crm-system" />
        </el-form-item>
        <el-form-item label="系统名称">
          <el-input v-model="clientForm.name" placeholder="例如：客户管理系统" />
        </el-form-item>
        <el-form-item label="回调地址">
          <el-input
            v-model="clientForm.redirectUrisText"
            type="textarea"
            :rows="4"
            placeholder="每行一个完整回调地址，例如：https://crm.example.com/sso/callback"
          />
        </el-form-item>
        <el-form-item label="启用">
          <el-switch v-model="clientForm.enabled" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="clientDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="savingClient" @click="saveClient">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { Icon } from '@iconify/vue';
import dayjs from 'dayjs';
import * as adminApi from '@/api/modules/admin.api';
import InvitationsPanel from './admin/InvitationsPanel.vue';
import UserAccessDialog from './admin/UserAccessDialog.vue';
import { useUserStore } from '@/stores/modules/user';
const userStore = useUserStore();
const invitationsPanel = ref<InstanceType<typeof InvitationsPanel>>();
const accessDialog = ref<InstanceType<typeof UserAccessDialog>>();
const savingGlobal = ref<number | null>(null);

const loading = ref(false);
const savingClient = ref(false);
const overview = ref<Api.Response.AdminOverview | null>(null);
const clients = ref<Api.Response.AdminClient[]>([]);
const users = ref<Api.Response.AdminUser[]>([]);
const userSearch = ref('');
const clientDialogVisible = ref(false);
const editingClientId = ref('');
const clientForm = reactive({
  id: '',
  name: '',
  redirectUrisText: '',
  enabled: true,
});

const summaryCards = computed(() => [
  { label: '用户总数', value: overview.value?.userCount ?? '-', icon: 'mdi:account-group-outline' },
  { label: '在线用户', value: overview.value?.activeUsers ?? '-', icon: 'mdi:account-check-outline' },
  { label: '在线会话', value: overview.value?.activeSessions ?? '-', icon: 'mdi:web' },
  { label: '接入系统', value: overview.value?.clientCount ?? '-', icon: 'mdi:apps' },
  { label: '启用系统', value: overview.value?.enabledClientCount ?? '-', icon: 'mdi:check-decagram-outline' },
]);

function formatTime(value?: string | null) {
  return value ? dayjs(value).format('YYYY-MM-DD HH:mm:ss') : '-';
}

async function loadOverview() {
  const response = await adminApi.getOverview();
  if (response.code === 200) overview.value = response.data;
}

async function loadClients() {
  const response = await adminApi.getClients();
  if (response.code === 200) clients.value = response.data || [];
}

async function loadUsers() {
  const response = await adminApi.getUsers(userSearch.value.trim());
  if (response.code === 200) users.value = response.data || [];
}

async function loadAll() {
  loading.value = true;
  try {
    await Promise.all([loadOverview(), loadClients(), loadUsers(), invitationsPanel.value?.load()]);
  } catch (error: any) {
    ElMessage.error(error.response?.data?.msg || error.message || '管理数据加载失败');
  } finally {
    loading.value = false;
  }
}

function openCreateClient() {
  editingClientId.value = '';
  Object.assign(clientForm, { id: '', name: '', redirectUrisText: '', enabled: true });
  clientDialogVisible.value = true;
}

function openEditClient(client: Api.Response.AdminClient) {
  editingClientId.value = client.id;
  Object.assign(clientForm, {
    id: client.id,
    name: client.name,
    redirectUrisText: client.redirectUris.join('\n'),
    enabled: client.enabled,
  });
  clientDialogVisible.value = true;
}

async function saveClient() {
  const redirectUris = clientForm.redirectUrisText
    .split('\n')
    .map(uri => uri.trim())
    .filter(Boolean);
  if (!clientForm.id.trim() || !clientForm.name.trim() || redirectUris.length === 0) {
    ElMessage.warning('请填写 Client ID、系统名称和回调地址');
    return;
  }

  savingClient.value = true;
  try {
    const data = {
      id: clientForm.id.trim(),
      name: clientForm.name.trim(),
      redirectUris,
      enabled: clientForm.enabled,
    };
    if (editingClientId.value) {
      await adminApi.updateClient(editingClientId.value, data);
    } else {
      await adminApi.createClient(data);
    }
    ElMessage.success('保存成功');
    clientDialogVisible.value = false;
    await Promise.all([loadClients(), loadOverview()]);
  } catch (error: any) {
    ElMessage.error(error.response?.data?.msg || error.message || '保存失败');
  } finally {
    savingClient.value = false;
  }
}

async function removeClient(client: Api.Response.AdminClient) {
  try {
    await ElMessageBox.confirm(`删除“${client.name}”后，该系统将无法继续发起登录。`, '确认删除', {
      type: 'warning',
      confirmButtonText: '删除',
      cancelButtonText: '取消',
    });
    await adminApi.deleteClient(client.id);
    ElMessage.success('删除成功');
    await Promise.all([loadClients(), loadOverview()]);
  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') {
      ElMessage.error(error.response?.data?.msg || error.message || '删除失败');
    }
  }
}

// 全局封禁与平台封禁分开，服务故障后重新读取数据库关闭状态。
async function changeGlobal(user: Api.Response.AdminUser, blocked: boolean) {
  try {
    await ElMessageBox.confirm(
      blocked
        ? `全局强退并封禁 ${user.email}？禁止继续登录及所有平台授权/刷新，短Token自然过期。`
        : `解除 ${user.email} 的全局封禁？不恢复旧凭据，也不解除各平台封禁。`,
      blocked ? '全局封禁' : '解除封禁',
      { type: 'warning' },
    );
    savingGlobal.value = user.id;
    await adminApi.setUserBlocked(user.id, blocked);
    ElMessage.success(blocked ? '已全局封禁' : '已解除全局封禁，需重新登录/授权');
  } catch (error: any) {
    if (error !== 'cancel' && error !== 'close') ElMessage.error(error.response?.data?.msg || error.message || '操作失败');
  } finally {
    savingGlobal.value = null;
    await loadAll();
  }
}

onMounted(loadAll);
</script>
