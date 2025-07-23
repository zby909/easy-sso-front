<!--
 * @Description:
 * @Author: zby
 * @Date: 2023-08-31 11:27:48
 * @LastEditors: zby
 * @Reference:
-->
<!--
阿里巴巴图标库使用说明：
icon--对应图片库font class名
iconClass--自定义类名
<GLIcon icon="icon-404"  iconClass="hk-header-list-icon"></GLIcon>
-->
<template>
  <span :class="iconClass">
    <svg class="gl-icon" aria-hidden="true">
      <use :xlink:href="'#' + icon"></use>
    </svg>
  </span>
</template>

<script lang="ts" setup>
defineProps({
  icon: {
    type: String,
    require: true,
  },
  iconClass: {
    type: String,
    default: '',
  },
});
</script>

<style scoped>
.gl-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}
</style>
