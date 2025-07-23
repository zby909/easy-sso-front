<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue';
import { ping } from '@/api/modules/home.api.ts';

function testPing() {
  ping().then(response => {
    console.log('Ping response:', response);
  });
}

testPing();
</script>

<template>
  <main>
    <TheWelcome />
  </main>
</template>
