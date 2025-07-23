<!--
 * @Description:
 * @Author: zby
 * @Date: 2022-04-27 18:06:46
 * @LastEditors: zby
 * @Reference:
-->
<template>
  <div class="empty">
    <div class="empty__image">
      <img :src="image" alt="Here is not thing." />
    </div>
    <p class="empty__description">{{ description }}</p>
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

<style lang="scss" scoped>
.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  padding: 72px 0;

  &__image {
    width: 280px;
    height: 280px;

    img {
      width: 100%;
      height: 100%;
    }
  }

  &__description {
    margin-top: 16px;
    padding: 0 60px;
    color: #969799;
    font-size: 16px;
    line-height: 20px;
  }
}
</style>
