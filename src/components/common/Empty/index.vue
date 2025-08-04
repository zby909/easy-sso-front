<!--
 * @Description:
 * @Author: zby
 * @Date: 2022-04-27 18:06:46
 * @LastEditors: zby
 * @Reference:
-->
<template>
  <div class="box-border flex flex-col items-center justify-center py-18">
    <div class="h-70 w-70">
      <img :src="image" alt="Here is not thing." class="h-full w-full" />
    </div>
    <p class="text-text-muted mt-4 px-15 text-base leading-5">{{ description }}</p>
  </div>
</template>

<script lang="ts" setup>
defineOptions({
  name: 'Empty',
});
defineProps({
  description: {
    type: String,
    default: '这里什么都没有发现',
  },
  image: {
    type: String,
    default: 'https://img.yzcdn.cn/vant/empty-image-default.png',
  },
});
</script>
