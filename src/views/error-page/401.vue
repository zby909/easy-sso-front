<!--
 * @Description:
 * @Author: zby
 * @Date: 2022-03-10 17:57:35
 * @FilePath: \tfl-client\src\views\error-page\401.vue
 * @LastEditors: zby
 * @Reference:
-->
<template>
  <div class="mx-auto mt-24 w-full max-w-4xl px-4">
    <el-button icon="el-icon-arrow-left" class="mb-4 !border-none !bg-teal-600 !text-white dark:!bg-teal-500" @click="back"> 返回 </el-button>
    <el-row>
      <el-col :span="12">
        <h1 class="text-6xl font-bold text-gray-600 dark:text-gray-300">Oops!</h1>
        <h2 class="mt-4 text-2xl font-medium text-gray-700 dark:text-gray-200">你没有权限去该页面</h2>
        <h6 class="mt-2 text-lg text-gray-500 dark:text-gray-400">如有疑问请联系你领导</h6>
        <ul class="mt-6 list-none p-0 text-sm">
          <li class="pb-1 text-gray-700 dark:text-gray-300">或者你可以去:</li>
          <li class="pb-1">
            <a href="https://www.taobao.com/" target="_blank" class="text-teal-600 no-underline hover:underline dark:text-teal-400">随便看看</a>
          </li>
          <li class="pb-1">
            <a href="#" @click.prevent="dialogVisible = true" class="text-teal-600 no-underline hover:underline dark:text-teal-400">点我看图</a>
          </li>
        </ul>
        <div class="mt-4 text-sm text-gray-500 dark:text-gray-400">
          gif来源<a target="_blank" class="text-teal-600 no-underline hover:underline dark:text-teal-400"> airbnb </a>页面
        </div>
      </el-col>
      <el-col :span="12">
        <!-- 使用本地资源更安全稳定 -->
        <img src="@/assets/401_images/401.gif" width="313" height="428" alt="Girl has dropped her ice cream." />
      </el-col>
    </el-row>
    <el-dialog v-model="dialogVisible" title="随便看">
      <img :src="ewizardClap" class="mx-auto block w-full" />
    </el-dialog>
  </div>
</template>

<script lang="ts">
export default {
  name: 'Page401',
  data() {
    return {
      ewizardClap: 'https://wpimg.wallstcn.com/007ef517-bafd-4066-aae4-6883632d9646',
      dialogVisible: false,
    };
  },
  methods: {
    back() {
      if (this.$route.query.noGoBack) {
        this.$router.push({ path: '/' });
      } else {
        this.$router.go(-1);
      }
    },
  },
};
</script>
