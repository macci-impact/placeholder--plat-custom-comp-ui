<script setup lang="ts">
import { Btn } from "@impactinc/ui-component-library";
defineProps<{ message: string; error?: string | undefined }>();
</script>

<template>
  <!-- These control the css and apply the legacy (ie pre VNext) theme and global iui overrides -->
  <div data-theme="legacy" data-iui-override>
    <p v-show="message">
      <em>{{ message }}</em>
    </p>
    <p v-show="error" class="error">
      {{ error }}
    </p>
    <Btn class="primary" @click="$emit('btn-click')">Click me</Btn>
  </div>
</template>

<style>
.error {
  color: red;
}
</style>
